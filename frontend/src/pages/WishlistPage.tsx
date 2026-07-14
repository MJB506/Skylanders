import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import WishlistUI from '../components/WishlistUI';

const WishlistPage = () =>
{
    return(
        <div>
        <PageTitle />
        <LoggedInName />
        <WishlistUI />
        </div>
    );
}
export default WishlistPage;
