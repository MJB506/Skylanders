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
    import { NavLink, useLocation } from "react-router-dom";

    const location = useLocation();
    
    const profileActive =
        location.pathname === "/collection" ||
        location.pathname === "/wishlist" ||
        location.pathname === "/Friends";

    return(
        <>
        <div className="page-header">
            <img src={logo} alt="Skylanders Logo" className="logo" />
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
