import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import CollectionUI from '../components/CollectionUI';

const CollectionPage = () =>
{
    return(
        <div>
        <PageTitle />
        <LoggedInName />
        <CollectionUI />
        </div>
    );
}
export default CollectionPage;
