import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import Wishlist from '../components/Wishlist';

const WishlistPage = () =>
{
    return(
        <div>
        <PageTitle />
        <LoggedInName />
        <Wishlist />
        </div>
    );
}
export default WishlistPage;
