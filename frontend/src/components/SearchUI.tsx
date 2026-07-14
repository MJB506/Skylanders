import React, { useState } from 'react';
import { buildPath } from './Path';
import { retrieveToken } from '../tokenStorage';

// figure result shape from api
interface Figure
{
    _id: string;
    Name: string;
    Element: string;
    Variant: boolean;
    Type: string;
    Game: string;
    Image: string;
}

// user result shape from api
interface User
{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
}

function SearchUI()
{
    // toggle between figures and users
    const [searchMode, setSearchMode] = useState<'figures' | 'users'>('figures');

    // search input
    const [searchText, setSearchText] = useState('');

    // results
    const [figureResults, setFigureResults] = useState<Figure[]>([]);
    const [userResults, setUserResults] = useState<User[]>([]);

    // filters for figures
    const [filterElement, setFilterElement] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterVariant, setFilterVariant] = useState('');

    // error/status message
    const [message, setMessage] = useState('');

    // delete confirmation popup state
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'collection' | 'wishlist' | 'friend', id: string, label: string } | null>(null);

    // get stored user data
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = userData.id || '';

    // search figures
    async function doSearchFigures(): Promise<void>
    {
        setMessage('');
        setFigureResults([]);

        try
        {
            const jwtToken = retrieveToken();
            const obj = { search: searchText, jwtToken };
            const js = JSON.stringify(obj);

            const response = await fetch(buildPath('api/searchfigures'),
            {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());

            if (res.error && res.error !== '')
            {
                setMessage(res.error);
                return;
            }

            setFigureResults(res.results || []);

            if ((res.results || []).length === 0)
            {
                setMessage('No figures found.');
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    // search users
    async function doSearchUsers(): Promise<void>
    {
        setMessage('');
        setUserResults([]);

        try
        {
            const jwtToken = retrieveToken();
            const obj = { userId, search: searchText, jwtToken };
            const js = JSON.stringify(obj);

            const response = await fetch(buildPath('api/searchusers'),
            {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());

            if (res.error && res.error !== '')
            {
                setMessage(res.error);
                return;
            }

            setUserResults(res.results || []);

            if ((res.results || []).length === 0)
            {
                setMessage('No users found.');
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    // handle search button click
    function handleSearch(): void
    {
        if (searchMode === 'figures')
        {
            doSearchFigures();
        }
        else
        {
            doSearchUsers();
        }
    }

    // send friend request
    async function doSendFriendRequest(friendId: string): Promise<void>
    {
        try
        {
            const jwtToken = retrieveToken();
            const obj = { userId, friendId, jwtToken };
            const js = JSON.stringify(obj);

            const response = await fetch(buildPath('api/sendfriendrequest'),
            {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());

            if (res.error && res.error !== '')
            {
                setMessage(res.error);
            }
            else
            {
                setMessage('Friend request sent!');
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    // add figure to collection
    async function doAddToCollection(figureId: string): Promise<void>
    {
        try
        {
            const jwtToken = retrieveToken();
            const obj = { userId, figureId, boxed: false, quantity: 1, jwtToken };
            const js = JSON.stringify(obj);

            const response = await fetch(buildPath('api/addtocollection'),
            {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());

            if (res.error && res.error !== '')
            {
                setMessage(res.error);
            }
            else
            {
                setMessage('Added to collection!');
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    // add figure to wishlist
    async function doAddToWishlist(figureId: string): Promise<void>
    {
        try
        {
            const jwtToken = retrieveToken();
            const obj = { userId, figureId, jwtToken };
            const js = JSON.stringify(obj);

            const response = await fetch(buildPath('api/addtowishlist'),
            {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());

            if (res.error && res.error !== '')
            {
                setMessage(res.error);
            }
            else
            {
                setMessage('Added to wishlist!');
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }
    }

    // open delete confirmation popup
    function openDeletePopup(type: 'collection' | 'wishlist' | 'friend', id: string, label: string): void
    {
        setDeleteTarget({ type, id, label });
        setShowDeletePopup(true);
    }

    // confirm delete
    async function confirmDelete(): Promise<void>
    {
        if (!deleteTarget) return;

        try
        {
            const jwtToken = retrieveToken();
            let url = '';
            let obj: any = {};

            if (deleteTarget.type === 'collection')
            {
                url = buildPath('api/removefromcollection');
                obj = { userId, figureId: deleteTarget.id, boxed: false, jwtToken };
            }
            else if (deleteTarget.type === 'wishlist')
            {
                url = buildPath('api/removefromwishlist');
                obj = { userId, figureId: deleteTarget.id, jwtToken };
            }
            else if (deleteTarget.type === 'friend')
            {
                url = buildPath('api/removefriend');
                obj = { userId, friendId: deleteTarget.id, jwtToken };
            }

            const response = await fetch(url,
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());

            if (res.error && res.error !== '')
            {
                setMessage(res.error);
            }
            else
            {
                setMessage('Removed successfully.');
            }
        }
        catch (error: any)
        {
            setMessage(error.toString());
        }

        setShowDeletePopup(false);
        setDeleteTarget(null);
    }

    // cancel delete
    function cancelDelete(): void
    {
        setShowDeletePopup(false);
        setDeleteTarget(null);
    }

    // filter figures client-side
    const filteredFigures = figureResults.filter(fig =>
    {
        if (filterElement && fig.Element !== filterElement) return false;
        if (filterType && fig.Type !== filterType) return false;
        if (filterVariant === 'variant' && !fig.Variant) return false;
        if (filterVariant === 'core' && fig.Variant) return false;
        return true;
    });

    // get unique values for filter dropdowns from current results
    const elements = [...new Set(figureResults.map(f => f.Element).filter(Boolean))];
    const types = [...new Set(figureResults.map(f => f.Type).filter(Boolean))];

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>

            <h2>Search</h2>

            {/* mode toggle */}
            <div style={{ marginBottom: '16px' }}>
                <button
                    onClick={() => { setSearchMode('figures'); setMessage(''); setUserResults([]); setFigureResults([]); }}
                    style={{ marginRight: '8px', fontWeight: searchMode === 'figures' ? 'bold' : 'normal' }}
                >
                    Figures
                </button>
                <button
                    onClick={() => { setSearchMode('users'); setMessage(''); setUserResults([]); setFigureResults([]); }}
                    style={{ fontWeight: searchMode === 'users' ? 'bold' : 'normal' }}
                >
                    Users
                </button>
            </div>

            {/* search bar */}
            <div style={{ marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder={searchMode === 'figures' ? 'Search figures...' : 'Search users...'}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                    style={{ marginRight: '8px', padding: '6px', width: '260px' }}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            {/* figure filters - only show when in figure mode and there are results */}
            {searchMode === 'figures' && figureResults.length > 0 && (
                <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <select value={filterElement} onChange={e => setFilterElement(e.target.value)}>
                        <option value="">All Elements</option>
                        {elements.map(el => <option key={el} value={el}>{el}</option>)}
                    </select>

                    <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select value={filterVariant} onChange={e => setFilterVariant(e.target.value)}>
                        <option value="">All Variants</option>
                        <option value="core">Core Only</option>
                        <option value="variant">Variants Only</option>
                    </select>

                    <button onClick={() => { setFilterElement(''); setFilterType(''); setFilterVariant(''); }}>
                        Clear Filters
                    </button>
                </div>
            )}

            {/* status message */}
            {message && <p>{message}</p>}

            {/* figure results */}
            {searchMode === 'figures' && filteredFigures.length > 0 && (
                <div>
                    <p>{filteredFigures.length} figure(s) found</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {filteredFigures.map(fig => (
                            <div key={fig._id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px' }}>
                                {fig.Image && (
                                    <img src={fig.Image} alt={fig.Name} style={{ width: '100%', height: '160px', objectFit: 'contain' }} />
                                )}
                                <p><strong>{fig.Name}</strong></p>
                                {fig.Element && <p>Element: {fig.Element}</p>}
                                {fig.Type && <p>Type: {fig.Type}</p>}
                                {fig.Variant && <p>Variant</p>}
                                <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                                    <button onClick={() => doAddToCollection(fig._id)}>+ Collection</button>
                                    <button onClick={() => doAddToWishlist(fig._id)}>+ Wishlist</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* user results */}
            {searchMode === 'users' && userResults.length > 0 && (
                <div>
                    <p>{userResults.length} user(s) found</p>
                    {userResults.map(user => (
                        <div key={user.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p><strong>{user.username}</strong></p>
                                {(user.firstName || user.lastName) && (
                                    <p>{user.firstName} {user.lastName}</p>
                                )}
                            </div>
                            <button onClick={() => doSendFriendRequest(user.id)}>Add Friend</button>
                        </div>
                    ))}
                </div>
            )}

            {/* delete confirmation popup */}
            {showDeletePopup && deleteTarget && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '360px', width: '90%' }}>
                        <h3>Are you sure?</h3>
                        <p>Remove <strong>{deleteTarget.label}</strong> from your {deleteTarget.type}?</p>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={cancelDelete}>Cancel</button>
                            <button onClick={confirmDelete} style={{ color: 'red' }}>Remove</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default SearchUI;
