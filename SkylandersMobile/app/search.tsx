import { useMemo, useState } from 'react';
import {
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
  UserCard,
} from '../components/app/UI';

import { postApi } from '../services/api';
import { getUser } from '../services/session';
import type { Figure, UserSummary } from '../types/models';
import { C } from '../constants/appTheme';

const GAMES = [
  "Spyro's Adventure",
  'Giants',
  'SWAP-Force',
  'Trap Team',
  'SuperChargers',
  'Imaginators',
];

const PAGE = 8;

export default function Search() {
  const [mode, setMode] = useState<'figures' | 'users'>(
    'figures'
  );

  const [query, setQuery] = useState('');
  const [figures, setFigures] = useState<Figure[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);

  const [sort, setSort] = useState<
    'name' | 'game' | 'element'
  >('name');

  async function search() {
    setBusy(true);
    setMessage('');
    setPage(1);

    try {
      if (mode === 'figures') {
        const r = await postApi<{
          results: Figure[];
        }>('api/searchfigures', {
          search: query.trim(),
        });

        setFigures(r.results || []);

        if (!(r.results || []).length) {
          setMessage('No figures found.');
        }
      } else {
        const u = await getUser();

        if (!u) return;

        const r = await postApi<{
          results: UserSummary[];
        }>('api/searchusers', {
          userId: u.id,
          search: query.trim(),
        });

        setUsers(r.results || []);

        if (!(r.results || []).length) {
          setMessage('No users found.');
        }
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function add(
    route: string,
    id: string,
    extra = {}
  ) {
    try {
      const u = await getUser();

      if (!u) return;

      await postApi(route, {
        userId: u.id,
        figureId: id,
        friendId: id,
        ...extra,
      });

      setMessage(
        route.includes('collection')
          ? 'Added to collection.'
          : route.includes('wishlist')
          ? 'Added to wishlist.'
          : 'Friend request sent.'
      );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  const sorted = useMemo(
    () =>
      [...figures].sort((a, b) => {
        if (sort === 'game') {
          return (
            GAMES.indexOf(a.Game) -
            GAMES.indexOf(b.Game)
          );
        }

        const av =
          sort === 'name' ? a.Name : a.Element;

        const bv =
          sort === 'name' ? b.Name : b.Element;

        return av.localeCompare(bv);
      }),
    [figures, sort]
  );

  const arr = mode === 'figures' ? sorted : users;

  const total = Math.max(
    1,
    Math.ceil(arr.length / PAGE)
  );

  const shown = arr.slice(
    (page - 1) * PAGE,
    page * PAGE
  );

  return (
    <AppShell title="Search">
      <View style={s.switch}>
        <Pressable
          style={[
            s.mode,
            mode === 'figures' && s.active,
          ]}
          onPress={() => {
            setMode('figures');
            setPage(1);
          }}
        >
          <Text style={s.modeText}>Figures</Text>
        </Pressable>

        <Pressable
          style={[
            s.mode,
            mode === 'users' && s.active,
          ]}
          onPress={() => {
            setMode('users');
            setPage(1);
          }}
        >
          <Text style={s.modeText}>Users</Text>
        </Pressable>
      </View>

      <Input
        value={query}
        onChangeText={setQuery}
        placeholder={
          mode === 'figures'
            ? 'Search figures...'
            : 'Search users...'
        }
        onSubmitEditing={search}
      />

      <Button
        label="Search"
        onPress={search}
      />

      {mode === 'figures' &&
        figures.length > 1 && (
          <View style={s.sort}>
            <Text style={s.muted}>Sort:</Text>

            {(
              ['name', 'game', 'element'] as const
            ).map((x) => (
              <Button
                key={x}
                label={
                  x[0].toUpperCase() +
                  x.slice(1)
                }
                kind={
                  sort === x
                    ? 'primary'
                    : 'ghost'
                }
                small
                onPress={() => setSort(x)}
              />
            ))}
          </View>
        )}

      {busy ? (
        <Loading />
      ) : (
        <>
          {shown.map((item) =>
            mode === 'figures' ? (
              <FigureCard
                key={(item as Figure)._id}
                figure={item as Figure}
              >
                <Button
                  label="+ Collection"
                  small
                  onPress={() =>
                    add(
                      'api/addtocollection',
                      (item as Figure)._id,
                      {
                        boxed: false,
                        quantity: 1,
                      }
                    )
                  }
                />

                <Button
                  label="+ Wishlist"
                  kind="ghost"
                  small
                  onPress={() =>
                    add(
                      'api/addtowishlist',
                      (item as Figure)._id
                    )
                  }
                />
              </FigureCard>
            ) : (
              <UserCard
                key={(item as UserSummary).id}
                user={item as UserSummary}
              >
                <Button
                  label="Add Friend"
                  small
                  onPress={() =>
                    add(
                      'api/sendfriendrequest',
                      (item as UserSummary).id
                    )
                  }
                />
              </UserCard>
            )
          )}

          {!shown.length && !message && (
            <Empty
              text={`Search for ${mode}.`}
            />
          )}

          <Pager
            page={page}
            total={total}
            onChange={setPage}
          />
        </>
      )}

      <Message text={message} />
    </AppShell>
  );
}

const s = StyleSheet.create({
  switch: {
    flexDirection: 'row',
    backgroundColor: C.panel,
    borderRadius: 12,
    padding: 4,
  },

  mode: {
    flex: 1,
    padding: 11,
    alignItems: 'center',
    borderRadius: 9,
  },

  active: {
    backgroundColor: C.cyan2,
  },

  modeText: {
    color: C.text,
    fontWeight: '800',
  },

  sort: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  muted: {
    color: C.muted,
    fontWeight: '700',
  },
});