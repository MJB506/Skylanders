const app_name = 'abayyaar.org';
export function buildPath(route: string): string {
  if (!import.meta.env.DEV)
  {
    return `http://${app_name}:5000/${route}`;
  }
  return `http://localhost:5000/${route}`;
}