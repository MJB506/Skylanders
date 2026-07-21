import { buildPath } from './Path';
import { apiFetch } from './apiFetch';
import { retrieveToken, storeToken } from './tokenStorage';
export class ApiError extends Error { constructor(message:string, public expired=false){super(message)} }
export async function postApi<T=any>(route:string, body:Record<string,unknown>):Promise<T>{
 const jwtToken=await retrieveToken();
 let response:Response;
 try{response=await apiFetch(buildPath(route),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,jwtToken})})}
 catch{throw new ApiError('Unable to connect to the server. Check that the API is running and your phone can reach it.')}
 const text=await response.text(); let data:any;
 try{data=text?JSON.parse(text):{}}catch{throw new ApiError(`Server returned an invalid response (${response.status}).`)}
 if(data.jwtToken) await storeToken({accessToken:data.jwtToken});
 if(data.error){const expired=String(data.error).toLowerCase().includes('jwt'); throw new ApiError(data.error,expired)}
 if(!response.ok) throw new ApiError(`Request failed (${response.status}).`);
 return data as T;
}
