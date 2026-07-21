import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import Pagination from './Pagination';
import "./ProfileStyles.css";

const PAGE_SIZE = 6;

function Friends()
{
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [friends, setFriends] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [friendCounts, setFriendCounts] = useState<Record<string, { collection: number; wishlist: number }>>({});

    function getUserId() : string
    {
        const raw = localStorage.getItem('user_data');
        if (!raw) return '';
        try { return JSON.parse(raw).id ?? ''; } catch { return ''; }
    }

    useEffect(() => { loadFriends(); }, []);

    async function loadFriends() : Promise<void>
    {
        try
        {
            const obj = { userId: getUserId(), jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/getfriendslist'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await response.json();
            if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

            if (res.error) setMessage(res.error);
            else
            {
                setFriends(res.friends ?? []);
                setPending(res.pending ?? []);
                loadFriendCounts(res.friends ?? []);
            }
        }
        catch (error: any) { setMessage(error.toString()); }
    }

    // Pulls each friend's collection/wishlist size using the same
    // getcollection/getwishlist endpoints, just passing their id instead of
    // ours. Runs after the friends list loads.
    async function loadFriendCounts(friendList: any[]) : Promise<void>
    {
        const jwtToken = retrieveToken();
        const counts: Record<string, { collection: number; wishlist: number }> = {};

        await Promise.all(friendList.map(async (f) =>
        {
            try
            {
                const [colRes, wishRes] = await Promise.all([
                    fetch(buildPath('api/getcollection'),
                    {
                        method: 'POST',
                        body: JSON.stringify({ userId: f.id, jwtToken }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(r => r.json()),
                    fetch(buildPath('api/getwishlist'),
                    {
                        method: 'POST',
                        body: JSON.stringify({ userId: f.id, jwtToken }),
                        headers: { 'Content-Type': 'application/json' }
                    }).then(r => r.json())
                ]);

                const collectionTotal = colRes.error
                    ? 0
                    : (colRes.results ?? []).reduce((sum: number, item: any) => sum + (item.Quantity ?? 1), 0);

                const wishlistTotal = wishRes.error
                    ? 0
                    : (wishRes.results ?? []).filter((item: any) => item !== null).length;

                counts[f.id] = { collection: collectionTotal, wishlist: wishlistTotal };
            }
            catch
            {
                counts[f.id] = { collection: 0, wishlist: 0 };
            }
        }));

        setFriendCounts(counts);
    }

    async function handleAccept(friendId: string) : Promise<void>
    {
        try
        {
            const obj = { userId: getUserId(), friendId, jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/acceptfriendrequest'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await response.json();
            if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

            if (res.error) setMessage(res.error);
            else { setMessage('Friend request accepted'); loadFriends(); }
        }
        catch (error: any) { setMessage(error.toString()); }
    }

    async function handleDeny(friendId: string) : Promise<void>
    {
        try
        {
            const obj = { userId: getUserId(), friendId, jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/denyfriendrequest'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await response.json();
            if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

            if (res.error) setMessage(res.error);
            else { setMessage('Friend request denied'); loadFriends(); }
        }
        catch (error: any) { setMessage(error.toString()); }
    }

    async function handleRemove(friendId: string) : Promise<void>
    {
        try
        {
            const obj = { userId: getUserId(), friendId, jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/removefriend'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await response.json();
            if (res.jwtToken) storeToken({ accessToken: res.jwtToken });

            if (res.error) setMessage(res.error);
            else { setMessage('Friend removed'); loadFriends(); }
        }
        catch (error: any) { setMessage(error.toString()); }
    }

    const combined = [...pending, ...friends];
    const totalPages = Math.max(1, Math.ceil(combined.length / PAGE_SIZE));

    return(
        <div>
        <ProfileHeader />
        <div className="profile-page">
        <ProfileTabs actions={
            <button type="button" className="action-button" onClick={() => navigate('/search?mode=users')}>
                Add Friend +
            </button>
        } />

        {friends.length > 0 &&
        <>
        <h2 className="section-title">Friends</h2>
        {friends.map((f) => (
            <div key={f.id} className="list-row">
                <div>
                    <div className="list-row-name">{f.username}</div>
                    <div className="list-row-meta">
                        Collection: {friendCounts[f.id]?.collection ?? '—'} | Wishlist: {friendCounts[f.id]?.wishlist ?? '—'}
                    </div>
                </div>
                <button type="button" className="remove-button" onClick={() => handleRemove(f.id)}>Remove</button>
            </div>
        ))}
        </>
        }

        {pending.length > 0 &&
        <>
        <h2 className="section-title">Pending</h2>
        {pending.map((p) => (
            <div key={p.id} className="list-row">
                <div>
                    <div className="list-row-name">{p.username}</div>
                    <div className="list-row-meta">
                        {p.direction === 'received' ? 'Wants to be friends' : 'Request sent'}
                    </div>
                </div>
                <div className="list-row-actions">
                    {p.direction === 'received' ?
                    (
                        <>
                        <button type="button" className="action-button" onClick={() => handleAccept(p.id)}>Accept</button>
                        <button type="button" className="remove-button" onClick={() => handleDeny(p.id)}>Deny</button>
                        </>
                    ) :
                    (
                        <button type="button" className="remove-button" onClick={() => handleRemove(p.id)}>Cancel</button>
                    )}
                </div>
            </div>
        ))}
        </>
        }

        {friends.length === 0 && pending.length === 0 &&
            <div className="empty-message">No friends or pending requests yet</div>
        }

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        <p>{message}</p>
        </div>
        </div>
    );
}

export default Friends;
