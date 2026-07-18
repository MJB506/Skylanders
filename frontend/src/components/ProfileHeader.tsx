import { NavLink } from 'react-router-dom';
import "./ProfileStyles.css";

function ProfileHeader()
{
    function doLogout(event: any) : void
    {
        event.preventDefault();
        localStorage.removeItem("user_data");
        window.location.href = '/';
    }

    return(
        <>
        <div className="page-header">
            {/* Swap in your real logo file once it's in /public, e.g.:
                <img src="/skylanders-logo.png" className="logo" alt="Skylanders" />
                Text fallback for now so this renders without an asset. */}
            <h1 style={{ color: '#09071d', margin: 0, fontSize: '48px' }}>SKYLANDERS</h1>
        </div>
        <div className="top-nav">
            <NavLink to="/collection" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
            <NavLink to="/cards" className={({ isActive }) => isActive ? 'active' : ''}>Figures</NavLink>
            <NavLink to="/friends" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink>
            <a href="#" onClick={doLogout}>Log Out</a>
        </div>
        </>
    );
}

export default ProfileHeader;
