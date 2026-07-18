import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import Collection from '../components/Collection';

const CollectionPage = () =>
{
    return(
        <div>
        <PageTitle />
        <LoggedInName />
        <Collection />
        </div>
    );
}
export default CollectionPage;
