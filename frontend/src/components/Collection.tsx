import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import Pagination from './Pagination';
import "./ProfileStyles.css";

const PAGE_SIZE = 6;

function Collection()
{
   const navigate = useNavigate();
   const [message, setMessage] = useState('');
   const [collection, setCollection] = useState<any[]>([]);
   const [page, setPage] = useState(1);

   function getUserId() : string
   {
       const raw = localStorage.getItem('user_data');
       if (!raw) return '';
       try { return JSON.parse(raw).id ?? ''; } catch { return ''; }
   }

   useEffect(() => { loadCollection(); }, []);

   async function loadCollection() : Promise<void>
   {
       try
       {
           const obj = { userId: getUserId(), jwtToken: retrieveToken() };
           const response = await fetch(buildPath('api/getcollection'),
           {
               method: 'POST',
               body: JSON.stringify(obj),
               headers: { 'Content-Type': 'application/json' }
           });
           const res = await response.json();
           if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

           if (res.error) setMessage(res.error);
           else setCollection(res.results ?? []);
       }
       catch (error: any) { setMessage(error.toString()); }
   }

   async function handleAdd(figureId: string, boxed: boolean) : Promise<void>
   {
       try
       {
           const obj = { userId: getUserId(), figureId, boxed, quantity: 1, jwtToken: retrieveToken() };
           const response = await fetch(buildPath('api/addtocollection'),
           {
               method: 'POST',
               body: JSON.stringify(obj),
               headers: { 'Content-Type': 'application/json' }
           });
           const res = await response.json();
           if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

           if (res.error) setMessage(res.error);
           else { setMessage('Added to collection'); loadCollection(); }
       }
       catch (error: any) { setMessage(error.toString()); }
   }

   async function handleRemove(figureId: string, boxed: boolean) : Promise<void>
   {
       try
       {
           const obj = { userId: getUserId(), figureId, boxed, jwtToken: retrieveToken() };
           const response = await fetch(buildPath('api/removefromcollection'),
           {
               method: 'POST',
               body: JSON.stringify(obj),
               headers: { 'Content-Type': 'application/json' }
           });
           const res = await response.json();
           if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

           if (res.error) setMessage(res.error);
           else { setMessage('Removed from collection'); loadCollection(); }
       }
       catch (error: any) { setMessage(error.toString()); }
   }

   const totalPages = Math.max(1, Math.ceil(collection.length / PAGE_SIZE));
   const pageItems = collection.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

   return(
       <div>
       <ProfileHeader />
       <div className="profile-page">
       <ProfileTabs actions={
           <button type="button" className="action-button" onClick={() => navigate('/search')}>
               Add Figure +
           </button>
       } />

       <div>
           {pageItems.length === 0 && <div className="empty-message">Your collection is empty</div>}
           {pageItems.map((fig) => (
               <div key={`${fig._id}-${fig.Boxed}`} className="figure-card">
                   <img className="figure-image" src={fig.Image || ''} alt={fig.Name} />
                   <div className="figure-info">
                       <h3 className="figure-name">{fig.Name}</h3>
                       <div className="figure-detail">
                           Game: {fig.Game}<br />
                           Element: {fig.Element}<br />
                           Type: {fig.Type}<br />
                           Variant: {fig.Variant ? 'Yes' : 'No'}
                       </div>
                   </div>
                   <div className="figure-side">
                       <div className="figure-meta">
                           Quantity: {fig.Quantity}<br />
                           Boxed: {fig.Boxed ? 'Yes' : 'No'}
                       </div>
                       <div><button type="button" className="action-button" onClick={() => handleAdd(fig._id, fig.Boxed)}>+1</button></div>
                       <button type="button" className="remove-button" onClick={() => handleRemove(fig._id, fig.Boxed)}>Remove</button>
                   </div>
               </div>
           ))}
       </div>

       <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
       <p>{message}</p>
       </div>
       </div>
   );
}

export default Collection;
