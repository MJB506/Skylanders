import { useState } from 'react';
import { buildPath } from './Path';
import { storeToken } from '../tokenStorage';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function WishlistUI()
{
    const [message, setMessage] = useState('');
    const [search, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<Figure[]>([]);
    const [wishlist, setWishlist] = useState<Figure[]>([]);

    useEffect(() =>
    {
        loadWishlist();
    }, []);

    async function loadWishlist() : Promise<void>
    {
        try
        {
            const res = await getWishlist();
            if (res.error)
            {
                setMessage(res.error);
            }
            else
            {
                // API may return null for figures that no longer exist in the catalog
                const results = (res.results ?? []).filter(
                    (f): f is Figure => f !== null
                );
                setWishlist(results);
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
            const res = await searchFigures(search);
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
            const res = await addToWishlist(figureId);
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
            const res = await removeFromWishlist(figureId);
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
        <button type="button" id="searchWishlistButton" className="buttons"
        onClick={doSearch}> Search </button>
        <br /><br />

        {searchResults.length > 0 &&
        <div id="wishlistSearchResults">
            {searchResults.map((fig) => (
                <div key={fig._id} className="figureRow">
                <span>{fig.Name} ({fig.Element})</span>{' '}
                <button type="button" className="buttons"
                onClick={() => handleAdd(fig._id)}> Add to Wishlist </button>
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
                <button type="button" className="buttons"
                onClick={() => handleRemove(fig._id)}> Remove </button>
                </div>
            ))}
        </div>
        <br />
        <span id="wishlistResult">{message}</span>
        </div>
    );
};

export default WishlistUI;
