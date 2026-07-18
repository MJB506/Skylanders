import { useEffect, useState } from 'react';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';

function Wishlist()
{
    const [message, setMessage] = useState('');
    const [search, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);

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
        loadWishlist();
    }, []);

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
                // API may return null for figures that no longer exist in the catalog
                setWishlist((res.results ?? []).filter((f: any) => f !== null));
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
            const obj = { search, jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/searchfigures'),
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

    async function handleAdd(figureId: string) : Promise<void>
    {
        try
        {
            const obj = { userId: getUserId(), figureId, jwtToken: retrieveToken() };
            const response = await fetch(buildPath('api/addtowishlist'),
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
                setMessage('Added to wishlist');
                loadWishlist();
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
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
                setMessage('Removed from wishlist');
                loadWishlist();
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    return(
        <div id="wishlistUIDiv">
        <br />
        Search Catalog: <input type="text" id="wishlistSearchText" placeholder="Figure name"
        value={search} onChange={(e) => setSearchValue(e.target.value)} />
        <input type="submit" id="searchWishlistButton" className="buttons" value="Search" onClick={doSearch} />
        <br /><br />

        {searchResults.length > 0 &&
        <div id="wishlistSearchResults">
            {searchResults.map((fig) => (
                <div key={fig._id} className="figureRow">
                <span>{fig.Name} ({fig.Element})</span>{' '}
                <input type="button" className="buttons" value="Add to Wishlist"
                onClick={() => handleAdd(fig._id)} />
                </div>
            ))}
        </div>
        }

        <br /><br />
        <span id="inner-title">MY WISHLIST</span><br />
        <div id="wishlistList">
            {wishlist.length === 0 && <span>Your wishlist is empty</span>}
            {wishlist.map((fig) => (
                <div key={fig._id} className="figureRow">
                <span>{fig.Name} ({fig.Element})</span>{' '}
                <input type="button" className="buttons" value="Remove"
                onClick={() => handleRemove(fig._id)} />
                </div>
            ))}
        </div>
        <br />
        <span id="wishlistResult">{message}</span>
        </div>
    );
};

export default Wishlist;
