import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import AppShell from '../components/app/AppShell';
import { Button, Empty, FigureCard, Input, Loading, Message, Pager } from '../components/app/UI';
import { postApi } from '../services/api';
import { getUser } from '../services/session';
import type { Figure } from '../types/models';
import { C } from '../constants/appTheme';
const PAGE=6;
export default function Collection()
{
    const [items, setItems] = useState<Figure[]>([]),
    [results, setResults] = useState<Figure[]>([]),
    [query, setQuery] = useState(''),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(true),
    [message, setMessage] = useState(''),
    [page, setPage] = useState(1);

    const load = useCallback(
        async()=>{
            setBusy(true);
            setMessage('');
            try
            {
                const u = await getUser();
                if(!u)
                    throw new Error('Please log in again.');
                
                const r = await postApi<{results: Figure[]}>('api/getcollection', {userId: u.id});
                
                setItems(r.results || [])
            }
            catch(e)
            {
                setMessage((e as Error).message)
            }
            finally{
                setBusy(false)
            }
        },
    []
    );
    useEffect(() => {load()}, [load]);

    async function search(){
        if(!query.trim())
            return;
        try{
            const r = await postApi<{ results:Figure[]
            }>('api/searchfigures', {search: query.trim()});
        
            setResults(r.results || []);
            setMessage((r.results || []).length ? '' : 'No figures found.')
        }
        catch(e){
            setMessage((e as Error).message)
        }
    }

    async function add(id: string, boxed: boolean)
    {
        try{
            const u = await getUser();
            if(!u)
                return;
            
            await postApi('api/addtocollection',
                {userId:u.id,figureId:id,boxed,quantity:1});
            setMessage('Added to collection.');
            
            await load()
        }
        catch(e)
        {
            setMessage((e as Error).message)
        }
    }

    function remove(f: Figure){
        Alert.alert('Remove figure',
            `Remove ${f.Name} (${f.Boxed?'boxed':'unboxed'}) from your collection?`,
            [{text: 'Cancel', style: 'cancel'},
            {text: 'Remove', style: 'destructive',
                onPress: async()=>{
                    try{
                        const u = await getUser();
                        if(!u)
                            return;
                        await postApi('api/removefromcollection',
                            {userId: u.id, figureId: f._id, boxed: !!f.Boxed});
                        await load()
                    }
                    catch(e)
                    {
                        setMessage((e as Error).message)
                    }
                }
            }]
        )
    }

    const total = Math.max(1, Math.ceil(items.length/PAGE)), 
        shown=items.slice((page-1)*PAGE,page*PAGE);

    return <AppShell title = "Collection"
    refreshing = {busy}
    onRefresh = {load}
    action = {
        <Button label = "Add +" small onPress = {
            ()=>setShow(true)
        }/>}>
    {
        busy ? <Loading/> : <>
            {shown.length ? shown.map((f,i)=><FigureCard key = 
                {`${f._id}-${f.Boxed}-${i}`} 
                figure={f}><Button label = "+1" small onPress=
                {
                    ()=>add(f._id, !!f.Boxed)
                }/>
                <Button label = "Remove" kind="danger" small onPress = 
                {
                    ()=> remove(f)
                }/>
                </FigureCard>): <Empty text="Your collection is empty."/>
            }
        <Pager page = {page}
        total = {total}
        onChange = {setPage}/></>
    }
    <Message text = {message}/>
    <Modal visible = {show}
    animationType="slide"
    transparent onRequestClose = {
        ()=> setShow(false)}>
            <View style = {s.backdrop}>
                <View style = {s.modal}>
                    <View style = {s.row}>
                        <Text style = {s.heading}>Add a Figure</Text>
                        <Pressable onPress =
                        {
                            ()=>setShow(false)
                        }>
                            <Text style = {s.close}>✕</Text>
                            </Pressable>
                            </View>
                            <Input value = {query}
                            onChangeText = {setQuery}
                            placeholder = "Search figures..."
                            onSubmitEditing = {search}/>
                            <Button label = "Search" onPress = {search}/>
                            <View style = {s.results}>
                                {results.map(f=> <View key = {f._id}
                                style = {s.result}>
                                    <Text style = {s.resultText}>
                                        {f.Name} ({f.Element})</Text>
                                        <View style = {s.row}>
                                            <Button label = "Unboxed" small onPress=
                                            {
                                                ()=>add(f._id, false)
                                            }/>
                                            <Button label = "Boxed" small onPress = {
                                                ()=>add(f._id, true)
                                            }/>
                                            </View>
                                        </View>
                                    )
                                }</View>
                            </View>
                        </View>
                    </Modal>
                </AppShell>
            }

    const s = StyleSheet.create(
        {
            backdrop:
            {
                flex: 1,
                backgroundColor: 'rgba(0,0,0,.7)',
                justifyContent: 'flex-end'
            },
            modal:
            {
                maxHeight: '85%',
                backgroundColor: C.bg,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                padding: 18,
                gap: 12
            },
            row:
            {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8
            },
            heading:
            {
                fontSize: 24,
                fontWeight: '800',
                color: C.cyan
            },
            close:
            {
                color: C.text,
                fontSize: 26
            },
            results:
            {
                gap:10
            },
            result:
            {
                backgroundColor: C.panel,
                borderRadius: 12,
                padding: 12,
                gap: 10
            },
            resultText:
            {
                color: C.text,
                fontWeight: '700'
            }
        }
    )
