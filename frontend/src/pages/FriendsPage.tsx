import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import FriendsUI from '../components/FriendsUI';

const FriendsPage = () =>
{
    return(
        <div>
        <PageTitle />
        <LoggedInName />
        <FriendsUI />
        </div>
    );
}
export default FriendsPage;
