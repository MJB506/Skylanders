import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getUser } from '../services/session';
import { retrieveToken } from '../services/tokenStorage';
import { C } from '../constants/appTheme';
export default function Index()
{
    const router = useRouter();
    useEffect(()=> {
        (async()=> {
            const [user, token] = await Promise.all([getUser(), retrieveToken()]);
            router.replace(user && token ? '/collection' : '/login')
        })()
    },
    [router]);
    
    return <View style = {
        {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: C.bg
        }
    }>
    <ActivityIndicator size="large" color = {C.cyan}/>
    </View>
}
