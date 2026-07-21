import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppShell from '../components/app/AppShell';
import {
  Button,
  Empty,
  FigureCard,
  Input,
  Loading,
  Message,
  Pager,
} from '../components/app/UI';

import { postApi } from '../services/api';
import { getUser } from '../services/session';
import type { Figure } from '../types/models';
import { C } from '../constants/appTheme';

const PAGE = 6;

export default function Wishlist() {
  const [items, setItems] = useState<Figure[]>([]);
  const [results, setResults] = useState<Figure[]>([]);
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setBusy(true);

    try {
      const u = await getUser();

      if (!u) {
        throw new Error('Please log in again.');
      }

      const r = await postApi<{
        results: Figure[];
      }>('api/getwishlist', {
        userId: u.id,
      });

      setItems((r.results || []).filter(Boolean));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function search() {
    if (!query.trim()) return;

    try {
      const r = await postApi<{
        results: Figure[];
      }>('api/searchfigures', {
        search: query.trim(),
      });

      setResults(r.results || []);

      if (!(r.results || []).length) {
        setMessage('No figures found.');
      }
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  async function add(id: string) {
    try {
      const u = await getUser();

      if (!u) return;

      await postApi('api/addtowishlist', {
        userId: u.id,
        figureId: id,
      });

      setMessage('Added to wishlist.');

      await load();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  function remove(f: Figure) {
    Alert.alert(
      'Remove figure',
      `Remove ${f.Name} from your wishlist?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const u = await getUser();

              if (!u) return;

              await postApi(
                'api/removefromwishlist',
                {
                  userId: u.id,
                  figureId: f._id,
                }
              );

              await load();
            } catch (e) {
              setMessage(
                (e as Error).message
              );
            }
          },
        },
      ]
    );
  }

  const total = Math.max(
    1,
    Math.ceil(items.length / PAGE)
  );

  const shown = items.slice(
    (page - 1) * PAGE,
    page * PAGE
  );

  return (
    <AppShell
      title="Wishlist"
      refreshing={busy}
      onRefresh={load}
      action={
        <Button
          label="Add +"
          small
          onPress={() => setShow(true)}
        />
      }
    >
      {busy ? (
        <Loading />
      ) : (
        <>
          {shown.length ? (
            shown.map((f) => (
              <FigureCard
                key={f._id}
                figure={f}
              >
                <Button
                  label="Remove"
                  kind="danger"
                  small
                  onPress={() => remove(f)}
                />
              </FigureCard>
            ))
          ) : (
            <Empty text="Your wishlist is empty." />
          )}

          <Pager
            page={page}
            total={total}
            onChange={setPage}
          />
        </>
      )}

      <Message text={message} />

      <Modal
        visible={show}
        animationType="slide"
        transparent
        onRequestClose={() => setShow(false)}
      >
        <View style={s.back}>
          <View style={s.modal}>
            <View style={s.row}>
              <Text style={s.heading}>
                Add to Wishlist
              </Text>

              <Pressable
                onPress={() => setShow(false)}
              >
                <Text style={s.close}>✕</Text>
              </Pressable>
            </View>

            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search figures..."
            />

            <Button
              label="Search"
              onPress={search}
            />

            {results.map((f) => (
              <View
                key={f._id}
                style={s.result}
              >
                <Text style={s.text}>
                  {f.Name} ({f.Element})
                </Text>

                <Button
                  label="Add"
                  small
                  onPress={() => add(f._id)}
                />
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const s = StyleSheet.create({
  back: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.7)',
    justifyContent: 'flex-end',
  },

  modal: {
    maxHeight: '85%',
    backgroundColor: C.bg,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    gap: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: C.cyan,
  },

  close: {
    color: C.text,
    fontSize: 26,
  },

  result: {
    backgroundColor: C.panel,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  text: {
    color: C.text,
    fontWeight: '700',
    flex: 1,
  },
});