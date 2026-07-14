import React, { useEffect, useState } from 'react';
import {
    searchUsers,
    sendFriendRequest,
    removeFriend,
    acceptFriendRequest,
    denyFriendRequest,
    getFriendsList,
} from '../api/friendsApi';
import type { UserSearchResult, UserInfo, PendingFriendInfo } from '../api/types';

function FriendsUI()
{
    const [message, setMessage] = useState('');
    const [search, setSearchValue] = React.useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [friends, setFriends] = useState<UserInfo[]>([]);
    const [pending, setPending] = useState<PendingFriendInfo[]>([]);

    useEffect(() =>
    {
        loadFriends();
    }, []);

    async function loadFriends() : Promise<void>
    {
        try
        {
            const res = await getFriendsList();
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
            const res = await searchUsers(search);
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
            const res = await sendFriendRequest(friendId);
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
            const res = await acceptFriendRequest(friendId);
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
            const res = await denyFriendRequest(friendId);
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
            const res = await removeFriend(friendId);
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
        <button type="button" id="searchUsersButton" className="buttons"
        onClick={doSearch}> Search </button>
        <br /><br />

        {searchResults.length > 0 &&
        <div id="userSearchResults">
            {searchResults.map((u) => (
                <div key={u.id} className="friendRow">
                <span>{u.username} ({u.firstName} {u.lastName})</span>{' '}
                <button type="button" className="buttons"
                onClick={() => handleSendRequest(u.id)}> Add Friend </button>
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
                    <button type="button" className="buttons"
                    onClick={() => handleAccept(p.id)}> Accept </button>
                    <button type="button" className="buttons"
                    onClick={() => handleDeny(p.id)}> Deny </button>
                    </>
                ) :
                (
                    <button type="button" className="buttons"
                    onClick={() => handleRemove(p.id)}> Cancel </button>
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
                <button type="button" className="buttons"
                onClick={() => handleRemove(f.id)}> Remove Friend </button>
                </div>
            ))}
        </div>
        <br />
        <span id="friendsResult">{message}</span>
        </div>
    );
};

export default FriendsUI;
