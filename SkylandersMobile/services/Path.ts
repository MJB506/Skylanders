const app_name = "abayyaar.org";


const development_ip = "100.69.34.49";
const ngrok_url = "https://concert-justness-aftermath.ngrok-free.dev";

export function buildPath(route: string): string
{
    if (__DEV__)
    {
        //return `http://${development_ip}:5000/${route}`;
        return `${ngrok_url}/${route}`;
    }

    return `http://${app_name}:5000/${route}`;
}