import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import WishlistUI from '../components/Wishlist';

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
