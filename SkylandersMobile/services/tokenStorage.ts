import AsyncStorage from "@react-native-async-storage/async-storage";


export async function storeToken(tok: any)
{
    await AsyncStorage.setItem(
        "token_data",
        tok.accessToken
    );
}


export async function retrieveToken()
{
    return await AsyncStorage.getItem(
        "token_data"
    );
}


export async function removeToken()
{
    await AsyncStorage.removeItem(
        "token_data"
    );
}