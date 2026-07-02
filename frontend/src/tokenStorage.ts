export function storeToken(tok: any)
{
    localStorage.setItem(
        'token_data',
        tok.accessToken
    );
}

export function retrieveToken()
{
    return localStorage.getItem('token_data');
}