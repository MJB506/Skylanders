import { useEffect, useState } from 'react';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';

function Collection()
{
    const [message, setMessage] = useState('');
    const [search, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [collection, setCollection] = useState<any[]>([]);

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
        loadCollection();
    }, []);

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
                setCollection(res.results ?? []);
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
                setMessage('Added to collection');
                loadCollection();
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
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
                setMessage('Removed from collection');
                loadCollection();
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    return(
        <div id="collectionUIDiv">
        <br />
        Search Catalog: <input type="text" id="figureSearchText" placeholder="Figure name"
        value={search} onChange={(e) => setSearchValue(e.target.value)} />
        <input type="submit" id="searchFigureButton" className="buttons" value="Search" onClick={doSearch} />
        <br /><br />

        {searchResults.length > 0 &&
        <div id="figureSearchResults">
            {searchResults.map((fig) => (
                <div key={fig._id} className="figureRow">
                <span>{fig.Name} ({fig.Element})</span>{' '}
                <input type="button" className="buttons" value="Add (Unboxed)"
                onClick={() => handleAdd(fig._id, false)} />
                <input type="button" className="buttons" value="Add (Boxed)"
                onClick={() => handleAdd(fig._id, true)} />
                </div>
            ))}
        </div>
        }

        <br /><br />
        <span id="inner-title">MY COLLECTION</span><br />
        <div id="collectionList">
            {collection.length === 0 && <span>Your collection is empty</span>}
            {collection.map((fig) => (
                <div key={`${fig._id}-${fig.Boxed}`} className="figureRow">
                <span>{fig.Name} — {fig.Boxed ? 'Boxed' : 'Unboxed'} — Qty: {fig.Quantity}</span>{' '}
                <input type="button" className="buttons" value="+1"
                onClick={() => handleAdd(fig._id, fig.Boxed)} />
                <input type="button" className="buttons" value="Remove Entry"
                onClick={() => handleRemove(fig._id, fig.Boxed)} />
                </div>
            ))}
        </div>
        <br />
        <span id="collectionResult">{message}</span>
        </div>
    );
};

export default Collection;
