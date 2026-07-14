import React, { useEffect, useState } from 'react';
import { searchFigures } from '../api/figuresApi';
import {
    addToCollection,
    getCollection,
    removeFromCollection,
} from '../api/collectionApi';
import type { Figure, CollectionFigure } from '../api/types';

function CollectionUI()
{
    const [message, setMessage] = useState('');
    const [search, setSearchValue] = React.useState('');
    const [searchResults, setSearchResults] = useState<Figure[]>([]);
    const [collection, setCollection] = useState<CollectionFigure[]>([]);

    useEffect(() =>
    {
        loadCollection();
    }, []);

    async function loadCollection() : Promise<void>
    {
        try
        {
            const res = await getCollection();
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

    async function handleAdd(figureId: string, boxed: boolean) : Promise<void>
    {
        try
        {
            const res = await addToCollection(figureId, boxed, 1);
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
            const res = await removeFromCollection(figureId, boxed);
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
        <button type="button" id="searchFigureButton" className="buttons"
        onClick={doSearch}> Search </button>
        <br /><br />

        {searchResults.length > 0 &&
        <div id="figureSearchResults">
            {searchResults.map((fig) => (
                <div key={fig._id} className="figureRow">
                <span>{fig.Name} ({fig.Element})</span>{' '}
                <button type="button" className="buttons"
                onClick={() => handleAdd(fig._id, false)}> Add (Unboxed) </button>
                <button type="button" className="buttons"
                onClick={() => handleAdd(fig._id, true)}> Add (Boxed) </button>
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
                <button type="button" className="buttons"
                onClick={() => handleAdd(fig._id, fig.Boxed)}> +1 </button>
                <button type="button" className="buttons"
                onClick={() => handleRemove(fig._id, fig.Boxed)}> Remove Entry </button>
                </div>
            ))}
        </div>
        <br />
        <span id="collectionResult">{message}</span>
        </div>
    );
};

export default CollectionUI;
