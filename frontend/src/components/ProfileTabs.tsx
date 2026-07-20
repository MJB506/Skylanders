import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import "./ProfileStyles.css";

interface ProfileTabsProps {
    actions?: ReactNode;
}

function ProfileTabs({ actions }: ProfileTabsProps)
{
    let _ud = localStorage.getItem('user_data');
    console.log("Raw user_data:", _ud);

    let ud = _ud ? JSON.parse(_ud) : {};
    console.log("Parsed user_data:", ud);

    let username: string = ud.username ?? '';

    console.log("Profile username:", username);

    return(
        <>
        <h2 className="profile-title">Profile - <span>{username || 'Name'}</span></h2>
        <div className="tabs-row">
            <div className="tabs">
                <NavLink to="/collection" className={({ isActive }) => isActive ? 'active' : ''}>Collection</NavLink>
                <span className="sep">|</span>
                <NavLink to="/wishlist" className={({ isActive }) => isActive ? 'active' : ''}>Wishlist</NavLink>
                <span className="sep">|</span>
                <NavLink to="/friends" className={({ isActive }) => isActive ? 'active' : ''}>Friendlist</NavLink>
            </div>
            <div className="list-row-actions">
                {actions}
            </div>
        </div>
        </>
    );
}

export default ProfileTabs;
