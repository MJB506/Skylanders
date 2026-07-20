import { NavLink, useLocation } from "react-router-dom";
import "./ProfileStyles.css";

function ProfileHeader()
{
    function doLogout(event: any) : void
    {
        event.preventDefault();
        localStorage.removeItem("user_data");
        window.location.href = '/';
    }
    

    const location = useLocation();
    
    const profileActive =
        location.pathname === "/collection" ||
        location.pathname === "/wishlist" ||
        location.pathname === "/friends";

    return(
        <>
        <div className="page-header">
            <img src="/images/Games/Skylanders_Logo.webp" alt="Skylanders Logo" />
        </div>
        <div className="top-nav">
            <NavLink to="/collection" className={() => (profileActive ? "active" : "")}>Profile</NavLink>
            <NavLink to="/search" end className={({ isActive }) => isActive ? 'active' : ''}>Search</NavLink>
            <a href="#" onClick={doLogout}>Log Out</a>
        </div>
        </>
    );
}

export default ProfileHeader;
