import { useState } from 'react';
import { buildPath } from './Path';
import { retrieveToken } from '../tokenStorage';
import ProfileHeader from './ProfileHeader';

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

interface User
{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
}

const GAMES = [
    "Skylanders: Spyro's Adventure",
    "Skylanders: Giants",
    "Skylanders: SWAP-Force",
    "Skylanders: Trap Team",
    "Skylanders: SuperChargers",
    "Skylanders: Imaginators"
];

const ELEMENTS = [
    "Air", "Dark", "Earth", "Fire", "Life",
    "Light", "Magic", "Tech", "Undead", "Water"
];

const TYPES = [
    "Core", "Giant", "Swapper", "Trap Master", "SuperCharger",
    "Sensei", "Mini", "LightCore", "Eon's Elite",
    "Magic Item", "Trap", "Vehicle", "Creation Crystal"
];

const ITEMS_PER_PAGE = 16;

// dropdown checkbox style
const dropdownStyle: React.CSSProperties =
{
    backgroundColor: '#1e3a5f',
    borderRadius: '4px',
    border: 'none',
    color: '#fff',
    padding: '0',
    minWidth: '180px',
    position: 'relative',
    display: 'inline-block'
};

const dropdownButtonStyle: React.CSSProperties =
{
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#1e3a5f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px'
};

const dropdownMenuStyle: React.CSSProperties =
{
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 100,
    backgroundColor: '#1e3a5f',
    borderRadius: '4px',
    minWidth: '180px',
    padding: '8px 0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
};

const checkboxLabelStyle: React.CSSProperties =
{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#fff'
};

function MultiCheckbox({ label, options, selected, onChange }: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (val: string[]) => void;
})
{
    const [open, setOpen] = useState(false);

    function toggle(option: string)
    {
        if (selected.includes(option))
        {
            onChange(selected.filter(s => s !== option));
        }
        else
        {
            onChange([...selected, option]);
        }
    }

    const displayLabel = selected.length > 0 ? `${label} (${selected.length})` : label;

    return (
        <div style={{ ...dropdownStyle }}>
            <button style={dropdownButtonStyle} onClick={() => setOpen(!open)}>
                {displayLabel} ▾
            </button>
            {open && (
                <div style={dropdownMenuStyle}>
                    {options.map(opt => (
                        <label key={opt} style={checkboxLabelStyle}>
                            <input
                                type="checkbox"
                                checked={selected.includes(opt)}
                                onChange={() => toggle(opt)}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

function SearchUI()
{
    const [searchMode, setSearchMode] = useState<'figures' | 'users'>('figures');
    const [searchText, setSearchText] = useState('');
    const [figureResults, setFigureResults] = useState<Figure[]>([]);
    const [userResults, setUserResults] = useState<User[]>([]);
    const [message, setMessage] = useState('');

    // multi-select filters
    const [filterGames, setFilterGames] = useState<string[]>([]);
    const [filterElements, setFilterElements] = useState<string[]>([]);
    const [filterTypes, setFilterTypes] = useState<string[]>([]);

    // sorting
    const [sortAlpha, setSortAlpha] = useState('');
    const [sortGame, setSortGame] = useState('');
    const [sortElement, setSortElement] = useState('');

    // pagination
    const [figurePage, setFigurePage] = useState(1);
    const [userPage, setUserPage] = useState(1);

    // delete popup
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'collection' | 'wishlist' | 'friend', id: string, label: string } | null>(null);

    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const userId = userData.id || '';

    async function doSearchFigures(): Promise<void>
    {
        setMessage('');
        setFigureResults([]);
        setFigurePage(1);

        try
        {
            console.log("Sending token:", jwtToken);

            
            const jwtToken = retrieveToken();
            const obj = { search: searchText, jwtToken };
            const response = await fetch(buildPath('api/searchfigures'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());

            if (res.jwtToken && res.jwtToken !== '')
            {
                localStorage.setItem('jwtToken', res.jwtToken);
            }
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

    async function doSearchUsers(): Promise<void>
    {
        setMessage('');
        setUserResults([]);
        setUserPage(1);

        try
        {
            const jwtToken = retrieveToken();
            const obj = { userId, search: searchText, jwtToken };
            const response = await fetch(buildPath('api/searchusers'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });

            const res = JSON.parse(await response.text());

            if (res.jwtToken && res.jwtToken !== '')
            {
                localStorage.setItem('jwtToken', res.jwtToken);
            }
            
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

    function handleSearch(): void
    {
        if (searchMode === 'figures') doSearchFigures();
        else doSearchUsers();
    }

    async function doAddToCollection(figureId: string): Promise<void>
    {
        try
        {
            const jwtToken = retrieveToken();
            const obj = { userId, figureId, boxed: false, quantity: 1, jwtToken };
            const response = await fetch(buildPath('api/addtocollection'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = JSON.parse(await response.text());
            if (res.jwtToken && res.jwtToken !== '')
            {
                localStorage.setItem('jwtToken', res.jwtToken);
            }
            if (res.error && res.error !== '') setMessage(res.error);
            else setMessage('Added to collection!');
        }
        catch (error: any) { setMessage(error.toString()); }
    }

    async function doAddToWishlist(figureId: string): Promise<void>
    {
        try
        {
            const jwtToken = retrieveToken();
            const obj = { userId, figureId, jwtToken };
            const response = await fetch(buildPath('api/addtowishlist'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = JSON.parse(await response.text());
            if (res.jwtToken && res.jwtToken !== '')
            {
                localStorage.setItem('jwtToken', res.jwtToken);
            }
            if (res.error && res.error !== '') setMessage(res.error);
            else setMessage('Added to wishlist!');
        }
        catch (error: any) { setMessage(error.toString()); }
    }

    async function doSendFriendRequest(friendId: string): Promise<void>
    {
        try
        {
            const jwtToken = retrieveToken();
            const obj = { userId, friendId, jwtToken };
            const response = await fetch(buildPath('api/sendfriendrequest'),
            {
                method: 'POST',
                body: JSON.stringify(obj),
                headers: { 'Content-Type': 'application/json' }
            });
            const res = JSON.parse(await response.text());
            if (res.jwtToken && res.jwtToken !== '')
            {
                localStorage.setItem('jwtToken', res.jwtToken);
            }
            if (res.error && res.error !== '') setMessage(res.error);
            else setMessage('Friend request sent!');
        }
        catch (error: any) { setMessage(error.toString()); }
    }

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
            if (res.jwtToken && res.jwtToken !== '')
            {
                localStorage.setItem('jwtToken', res.jwtToken);
            }
            if (res.error && res.error !== '') setMessage(res.error);
            else setMessage('Removed successfully.');
        }
        catch (error: any) { setMessage(error.toString()); }

        setShowDeletePopup(false);
        setDeleteTarget(null);
    }

    function cancelDelete(): void
    {
        setShowDeletePopup(false);
        setDeleteTarget(null);
    }

    function clearFilters(): void
    {
        setFilterGames([]);
        setFilterElements([]);
        setFilterTypes([]);
        setSortAlpha('');
        setSortGame('');
        setSortElement('');
    }

    // apply multi-select filters
    let filteredFigures = figureResults.filter(fig =>
    {
        if (filterGames.length > 0 && !filterGames.includes(fig.Game)) return false;
        if (filterElements.length > 0 && !filterElements.includes(fig.Element)) return false;
        if (filterTypes.length > 0 && !filterTypes.includes(fig.Type)) return false;
        return true;
    });

    // apply sorting
    filteredFigures = [...filteredFigures].sort((a, b) =>
    {
        if (sortAlpha === 'asc') return a.Name.localeCompare(b.Name);
        if (sortAlpha === 'desc') return b.Name.localeCompare(a.Name);
        if (sortGame === 'asc') return GAMES.indexOf(a.Game) - GAMES.indexOf(b.Game);
        if (sortGame === 'desc') return GAMES.indexOf(b.Game) - GAMES.indexOf(a.Game);
        if (sortElement === 'asc') return ELEMENTS.indexOf(a.Element) - ELEMENTS.indexOf(b.Element);
        if (sortElement === 'desc') return ELEMENTS.indexOf(b.Element) - ELEMENTS.indexOf(a.Element);
        return 0;
    });

    // pagination
    const totalFigurePages = Math.ceil(filteredFigures.length / ITEMS_PER_PAGE);
    const paginatedFigures = filteredFigures.slice((figurePage - 1) * ITEMS_PER_PAGE, figurePage * ITEMS_PER_PAGE);

    const totalUserPages = Math.ceil(userResults.length / ITEMS_PER_PAGE);
    const paginatedUsers = userResults.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);

    function renderPageNumbers(current: number, total: number, onSelect: (p: number) => void)
    {
        const pages: (number | string)[] = [];
        if (total <= 5)
        {
            for (let i = 1; i <= total; i++) pages.push(i);
        }
        else
        {
            pages.push(1);
            if (current > 3) pages.push('...');
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
            if (current < total - 2) pages.push('...');
            pages.push(total);
        }

        return (
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '20px', alignItems: 'center' }}>
                <button onClick={() => onSelect(Math.max(1, current - 1))} disabled={current === 1}>&lt;</button>
                {pages.map((p, i) =>
                    typeof p === 'number'
                        ? <button key={i} onClick={() => onSelect(p)} style={{ fontWeight: p === current ? 'bold' : 'normal' }}>{p}</button>
                        : <span key={i}>...</span>
                )}
                <button onClick={() => onSelect(Math.min(total, current + 1))} disabled={current === total}>&gt;</button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#09071d', minHeight: '100vh', color: '#fff' }}>

            <ProfileHeader />
            {/* nav */}
            {/* <nav style={{ backgroundColor: '#09071d', padding: '10px 48px', borderBottom: '1px solid #1e3a5f', textAlign: 'center' }}>
                <a href="/profile" style={{ color: '#fff', marginRight: '16px', textDecoration: 'none' }}>Profile</a>
                <span style={{ color: '#555', marginRight: '16px' }}>|</span>
                <a href="/search" style={{ color: '#fff', marginRight: '16px', textDecoration: 'none' }}>Figures</a>
                <span style={{ color: '#555', marginRight: '16px' }}>|</span>
                <a href="/search" onClick={(e) => { e.preventDefault(); setSearchMode('users'); window.history.pushState({}, '', '/search'); }} style={{ color: '#fff', textDecoration: 'none' }}>Users</a>
            </nav> */}

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 48px' }}>

                {/* mode toggle */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => { setSearchMode('figures'); setMessage(''); setUserResults([]); }}
                        style={{ padding: '8px 20px', backgroundColor: searchMode === 'figures' ? '#7dd8f8' : '#1e3a5f', color: searchMode === 'figures' ? '#0d1b2a' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Figures
                    </button>
                    <button
                        onClick={() => { setSearchMode('users'); setMessage(''); setFigureResults([]); }}
                        style={{ padding: '8px 20px', backgroundColor: searchMode === 'users' ? '#7dd8f8' : '#1e3a5f', color: searchMode === 'users' ? '#0d1b2a' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Users
                    </button>
                </div>

                {/* title */}
                <h2 style={{ color: '#7dd8f8', marginBottom: '20px', textAlign: 'left', fontSize: '48px'}}>
                    {searchMode === 'figures' ? 'Figures' : 'Users'}
                </h2>

                {/* search bar */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #1e3a5f', backgroundColor: '#fff', color: '#000', fontSize: '14px' }}
                    />
                    <button
                        onClick={handleSearch}
                        style={{ padding: '8px 20px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Search
                    </button>
                </div>

                {/* figure filters */}
                {searchMode === 'figures' && (
                    <>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <span style={{ color: '#aaa', fontSize: '14px', paddingTop: '8px' }}>Filters:</span>
                            <MultiCheckbox label="Game" options={GAMES} selected={filterGames} onChange={(v) => { setFilterGames(v); setFigurePage(1); }} />
                            <MultiCheckbox label="Element" options={ELEMENTS} selected={filterElements} onChange={(v) => { setFilterElements(v); setFigurePage(1); }} />
                            <MultiCheckbox label="Type" options={TYPES} selected={filterTypes} onChange={(v) => { setFilterTypes(v); setFigurePage(1); }} />
                            <button onClick={clearFilters} style={{ padding: '8px 14px', backgroundColor: '#7dd8f8', color: '#0d1b2a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}>
                                Clear Filters
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{ color: '#aaa', fontSize: '14px' }}>Sort By:</span>
                            <select value={sortAlpha} onChange={e => { setSortAlpha(e.target.value); setSortGame(''); setSortElement(''); setFigurePage(1); }} style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', minWidth: '180px', fontSize: '14px' }}>
                                <option value="">Alphabetically</option>
                                <option value="asc">A → Z</option>
                                <option value="desc">Z → A</option>
                            </select>
                            <select value={sortGame} onChange={e => { setSortGame(e.target.value); setSortAlpha(''); setSortElement(''); setFigurePage(1); }} style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', minWidth: '180px', fontSize: '14px' }}>
                                <option value="">Game</option>
                                <option value="asc">1st → 6th</option>
                                <option value="desc">6th → 1st</option>
                            </select>
                            <select value={sortElement} onChange={e => { setSortElement(e.target.value); setSortAlpha(''); setSortGame(''); setFigurePage(1); }} style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', minWidth: '180px', fontSize: '14px' }}>
                                <option value="">Element</option>
                                <option value="asc">Air → Water</option>
                                <option value="desc">Water → Air</option>
                            </select>
                        </div>
                    </>
                )}

                {/* status message */}
                {message && <p style={{ color: '#7dd8f8', marginBottom: '16px' }}>{message}</p>}

                {/* figure results grid */}
                {searchMode === 'figures' && paginatedFigures.length > 0 && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {paginatedFigures.map(fig => (
                                <div key={fig._id} style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                                    {fig.Image
                                        ? <img src={fig.Image} alt={fig.Name} style={{ width: '100%', height: '140px', objectFit: 'contain' }} />
                                        : <div style={{ width: '100%', height: '140px', backgroundColor: '#ccc', borderRadius: '4px' }} />
                                    }
                                    <p style={{ marginTop: '8px', fontSize: '13px', color: '#fff' }}>{fig.Name}</p>
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '8px' }}>
                                        <button onClick={() => doAddToCollection(fig._id)} style={{ padding: '4px 10px', backgroundColor: '#7dd8f8', color: '#0d1b2a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Col</button>
                                        <button onClick={() => doAddToWishlist(fig._id)} style={{ padding: '4px 10px', backgroundColor: '#7dd8f8', color: '#0d1b2a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Wish</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalFigurePages > 1 && renderPageNumbers(figurePage, totalFigurePages, setFigurePage)}
                    </>
                )}

                {/* user results */}
                {searchMode === 'users' && paginatedUsers.length > 0 && (
                    <>
                        {paginatedUsers.map(user => (
                            <div key={user.id} style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', padding: '16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a4a6f' }}>
                                <div>
                                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#7dd8f8' }}>{user.username}</p>
                                    {(user.firstName || user.lastName) && (
                                        <p style={{ fontSize: '13px', color: '#aaa' }}>{user.firstName} {user.lastName}</p>
                                    )}
                                </div>
                                <button onClick={() => doSendFriendRequest(user.id)} style={{ padding: '6px 14px', backgroundColor: '#7dd8f8', color: '#0d1b2a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Add Friend +
                                </button>
                            </div>
                        ))}
                        {totalUserPages > 1 && renderPageNumbers(userPage, totalUserPages, setUserPage)}
                    </>
                )}
            </div>

            {/* delete confirmation popup */}
            {showDeletePopup && deleteTarget && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e3a5f', padding: '28px', borderRadius: '10px', maxWidth: '360px', width: '90%', color: '#fff' }}>
                        <h3 style={{ marginBottom: '12px' }}>Are you sure?</h3>
                        <p>Remove <strong>{deleteTarget.label}</strong> from your {deleteTarget.type}?</p>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={cancelDelete} style={{ padding: '8px 16px', backgroundColor: '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={confirmDelete} style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchUI;
