export async function apiFetch(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "ngrok-skip-browser-warning": "true",
        },
    });

    return response;
}