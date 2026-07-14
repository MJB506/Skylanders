import { useEffect, useState } from 'react';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';

function Friends()
{
    const [message, setMessage] = useState('');
    const [search, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);

    function getUserId() : string
    {
        const raw = localStorage.getItem('user_data');
        if (!raw) return '';
        try
        {
            return JSON.parse(raw).id ?? '';
        }
        catch
        {
            return '';
        }
    }

    useEffect(() =>
    {
        loadFriends();
    }, []);

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

            if (res.jwtToken)
            {
                storeToken({ accessToken: res.jwtToken });
            }

            if (res.error)
            {
                setMessage(res.error);
            }
            else
            {
                setFriends(res.friends ?? []);
                setPending(res.pending ?? []);
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    async function doSearch(e: any) : Promise<void>
    {
        e.preventDefault();
        try
        {
            const obj = { userId: getUserId(), search, jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/searchusers'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await response.json();

            if (res.jwtToken)
            {
                storeToken({ accessToken: res.jwtToken });
            }

            if (res.error)
            {
                setMessage(res.error);
            }
            else
            {
                setSearchResults(res.results ?? []);
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    async function handleSendRequest(friendId: string) : Promise<void>
    {
        try
        {
            const obj = { userId: getUserId(), friendId, jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/sendfriendrequest'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = await response.json();

            if (res.jwtToken)
            {
                storeToken({ accessToken: res.jwtToken });
            }

            if (res.error)
            {
                setMessage(res.error);
            }
            else
            {
                setMessage('Friend request sent');
                loadFriends();
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
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

            if (res.jwtToken)
            {
                storeToken({ accessToken: res.jwtToken });
            }

            if (res.error)
            {
                setMessage(res.error);
            }
            else
            {
                setMessage('Friend request accepted');
                loadFriends();
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
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

            if (res.jwtToken)
            {
                storeToken({ accessToken: res.jwtToken });
            }

            if (res.error)
            {
                setMessage(res.error);
            }
            else
            {
                setMessage('Friend request denied');
                loadFriends();
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
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

            if (res.jwtToken)
            {
                storeToken({ accessToken: res.jwtToken });
            }

            if (res.error)
            {
                setMessage(res.error);
            }
            else
            {
                setMessage('Friend removed');
                loadFriends();
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    return(
        <div id="friendsUIDiv">
        <br />
        Find Users: <input type="text" id="userSearchText" placeholder="Username"
        value={search} onChange={(e) => setSearchValue(e.target.value)} />
        <input type="submit" id="searchUsersButton" className="buttons" value="Search" onClick={doSearch} />
        <br /><br />

        {searchResults.length > 0 &&
        <div id="userSearchResults">
            {searchResults.map((u) => (
                <div key={u.id} className="friendRow">
                <span>{u.username} ({u.firstName} {u.lastName})</span>{' '}
                <input type="button" className="buttons" value="Add Friend"
                onClick={() => handleSendRequest(u.id)} />
                </div>
            ))}
        </div>
        }

        <br /><br />
        <span id="inner-title">PENDING REQUESTS</span><br />
        <div id="pendingList">
            {pending.length === 0 && <span>No pending requests</span>}
            {pending.map((p) => (
                <div key={p.id} className="friendRow">
                <span>
                    {p.username} ({p.firstName} {p.lastName}) —{' '}
                    {p.direction === 'received' ? 'wants to be friends' : 'request sent'}
                </span>{' '}
                {p.direction === 'received' ?
                (
                    <>
                    <input type="button" className="buttons" value="Accept"
                    onClick={() => handleAccept(p.id)} />
                    <input type="button" className="buttons" value="Deny"
                    onClick={() => handleDeny(p.id)} />
                    </>
                ) :
                (
                    <input type="button" className="buttons" value="Cancel"
                    onClick={() => handleRemove(p.id)} />
                )}
                </div>
            ))}
        </div>

        <br /><br />
        <span id="inner-title">MY FRIENDS</span><br />
        <div id="friendsList">
            {friends.length === 0 && <span>No friends yet</span>}
            {friends.map((f) => (
                <div key={f.id} className="friendRow">
                <span>{f.username} ({f.firstName} {f.lastName})</span>{' '}
                <input type="button" className="buttons" value="Remove Friend"
                onClick={() => handleRemove(f.id)} />
                </div>
            ))}
        </div>
        <br />
        <span id="friendsResult">{message}</span>
        </div>
    );
};

export default Friends;
