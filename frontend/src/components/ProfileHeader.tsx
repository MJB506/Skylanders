import { NavLink } from 'react-router-dom';
import logo from "../../images/Games/Skylanders_Logo.webp";
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
            <img src={logo} alt="Skylanders Logo" className="logo" />
        </div>
        <div className="top-nav">
            <NavLink to="/collection" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
            <NavLink to="/search" end className={({ isActive }) => isActive ? 'active' : ''}>Figures</NavLink>
            <NavLink to="/search?mode=users" className={({ isActive, isPending }) =>
                (isActive || window.location.search.includes('mode=users')) ? 'active' : ''
            }>Users</NavLink>
            <a href="#" onClick={doLogout}>Log Out</a>
        </div>
        </>
    );
}

export default ProfileHeader;
