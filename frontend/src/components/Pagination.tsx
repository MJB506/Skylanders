import "./ProfileStyles.css";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/**
 * Client-side pagination UI. The underlying API endpoints (getcollection,
 * getwishlist, getfriendslist) don't support server-side paging -- they
 * always return the full list -- so this just slices an already-fetched
 * array. Fine for reasonably sized lists; if collections get huge, the
 * backend would need a page/limit param added.
 */
function Pagination({ page, totalPages, onPageChange }: PaginationProps)
{
    if (totalPages <= 1) return null;

    const pages: (number | '...')[] = [];
    for (let i = 1; i <= totalPages; i++)
    {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1)
        {
            pages.push(i);
        }
        else if (pages[pages.length - 1] !== '...')
        {
            pages.push('...');
        }
    }

    return(
        <div className="pagination">
            {pages.map((p, idx) =>
                p === '...' ?
                (
                    <span key={`dots-${idx}`}> ... </span>
                ) :
                (
                    <button
                        key={p}
                        type="button"
                        className={p === page ? 'active' : ''}
                        onClick={() => onPageChange(p as number)}
                    >
                        {p}
                    </button>
                )
            )}
            {' '}
            <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                &gt;
            </button>
        </div>
    );
}

export default Pagination;
