import logo from "../../images/Games/Skylanders_Logo.webp";

function PageTitle()
{
    return (
        <header className="page-header">

            <img
                src={logo}
                alt="Skylanders Logo"
                className="logo"
            />

        </header>
    );
}

export default PageTitle;
