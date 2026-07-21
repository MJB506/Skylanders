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

    const onSearchPage = location.pathname === "/search";
    const usersMode = onSearchPage && location.search.includes("mode=users");
    const figuresActive = onSearchPage && !usersMode;
    const usersActive = onSearchPage && usersMode;

    return(
        <>
        <div className="page-header">
            <img src="/images/Games/Skylanders_Logo.webp" alt="Skylanders Logo" className="logo"/>
        </div>
        <div className="top-nav">
            <NavLink to="/collection" className={() => (profileActive ? "active" : "")}>Profile</NavLink>
            <NavLink to="/search" className={() => (figuresActive ? "active" : "")}>Figures</NavLink>
            <NavLink to="/search?mode=users" className={() => (usersActive ? "active" : "")}>Users</NavLink>
            <a href="#" onClick={doLogout}>Log Out</a>
        </div>
        </>
    );
}

export default ProfileHeader;
