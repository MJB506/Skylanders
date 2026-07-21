import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeToken } from './tokenStorage';
import type { UserData } from '../types/models';
const USER_KEY='user_data';
export async function getUser():Promise<UserData|null>{const raw=await AsyncStorage.getItem(USER_KEY); if(!raw)return null; try{return JSON.parse(raw)}catch{return null}}
export async function saveUser(user:UserData){await AsyncStorage.setItem(USER_KEY,JSON.stringify(user))}
export async function clearSession(){await Promise.all([AsyncStorage.removeItem(USER_KEY),removeToken()])}
