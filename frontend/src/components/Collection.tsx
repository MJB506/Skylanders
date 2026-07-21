import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import Pagination from './Pagination';
import "./ProfileStyles.css";

const PAGE_SIZE = 6;

const GAMES = [
    "Skylanders: Spyro's Adventure",
    "Skylanders: Giants",
    "Skylanders: SWAP-Force",
    "Skylanders: Trap Team",
    "Skylanders: SuperChargers",
    "Skylanders: Imaginators"
];

function gameName(gameNumber: number) : string
{
    return GAMES[gameNumber - 1] ?? String(gameNumber);
}

function Collection()
{
   const navigate = useNavigate();
   const [message, setMessage] = useState('');
   const [collection, setCollection] = useState<any[]>([]);
   const [page, setPage] = useState(1);
   const [qtyInputs, setQtyInputs] = useState<Record<string, number>>({});
   const [editingKey, setEditingKey] = useState<string | null>(null);

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

   async function handleAdd(figureId: string, boxed: boolean, quantity: number = 1) : Promise<void>
   {
       try
       {
           const obj = { userId: getUserId(), figureId, boxed, quantity, jwtToken: retrieveToken() };
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

   // The API only supports adding (incrementing) or removing the whole entry --
   // there's no "set to an exact quantity" endpoint. To let the user type any
   // number, we work out the difference: increasing calls addtocollection with
   // the delta; decreasing removes the entry and re-adds it at the new amount.
   async function handleSetQuantity(fig: any, newQuantity: number) : Promise<void>
   {
       const delta = newQuantity - fig.Quantity;
       if (delta === 0) return;

       if (delta > 0)
       {
           await handleAdd(fig._id, fig.Boxed, delta);
           return;
       }

       try
       {
           const removeObj = { userId: getUserId(), figureId: fig._id, boxed: fig.Boxed, jwtToken: retrieveToken() };
           await fetch(buildPath('api/removefromcollection'),
           {
               method: 'POST',
               body: JSON.stringify(removeObj),
               headers: { 'Content-Type': 'application/json' }
           });

           if (newQuantity > 0)
           {
               await handleAdd(fig._id, fig.Boxed, newQuantity);
           }
           else
           {
               setMessage('Removed from collection');
               loadCollection();
           }
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
                           Game: {gameName(fig.Game)}<br />
                           Element: {fig.Element}<br />
                           Type: {fig.Type}<br />
                           Variant: {fig.Variant ? 'Yes' : 'No'}
                       </div>
                   </div>
                   <div className="figure-side">
                       <button type="button" className="action-button"
                       onClick={() => {
                           const key = `${fig._id}-${fig.Boxed}`;
                           setQtyInputs({ ...qtyInputs, [key]: fig.Quantity });
                           setEditingKey(editingKey === key ? null : key);
                       }}>Edit Quantity</button>

                       {editingKey === `${fig._id}-${fig.Boxed}` &&
                       <div className="figure-qty-adder">
                           <input type="number" min="0"
                           value={qtyInputs[`${fig._id}-${fig.Boxed}`] ?? fig.Quantity}
                           onChange={(e) => setQtyInputs({ ...qtyInputs, [`${fig._id}-${fig.Boxed}`]: Math.max(0, parseInt(e.target.value) || 0) })} />
                           <button type="button" className="action-button"
                           onClick={() => { handleSetQuantity(fig, qtyInputs[`${fig._id}-${fig.Boxed}`] ?? fig.Quantity); setEditingKey(null); }}>Save</button>
                       </div>
                       }

                       <div className="figure-meta">
                           Quantity: {fig.Quantity}<br />
                           Boxed: {fig.Boxed ? 'Yes' : 'No'}
                       </div>
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
