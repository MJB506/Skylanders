import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import Pagination from './Pagination';
import "./ProfileStyles.css";

const PAGE_SIZE = 6;

function Wishlist()
{
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    function getUserId() : string
    {
        const raw = localStorage.getItem('user_data');
        if (!raw) return '';
        try { return JSON.parse(raw).id ?? ''; } catch { return ''; }
    }

    useEffect(() => { loadWishlist(); }, []);

    async function loadWishlist() : Promise<void>
    {
        try
        {
            const obj = { userId: getUserId(), jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/getwishlist'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await response.json();
            if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

            if (res.error) setMessage(res.error);
            else setWishlist((res.results ?? []).filter((f: any) => f !== null));
        }
        catch (error: any) { setMessage(error.toString()); }
    }

    async function handleRemove(figureId: string) : Promise<void>
    {
        try
        {
            const obj = { userId: getUserId(), figureId, jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/removefromwishlist'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await response.json();
            if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

            if (res.error) setMessage(res.error);
            else { setMessage('Removed from wishlist'); loadWishlist(); }
        }
        catch (error: any) { setMessage(error.toString()); }
    }

    const totalPages = Math.max(1, Math.ceil(wishlist.length / PAGE_SIZE));
    const pageItems = wishlist.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            {pageItems.length === 0 && <div className="empty-message">Your wishlist is empty</div>}
            {pageItems.map((fig) => (
                <div key={fig._id} className="figure-card">
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
                        <button type="button" className="remove-button" onClick={() => handleRemove(fig._id)}>Remove</button>
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

export default Wishlist;
Sent from my iPhone
