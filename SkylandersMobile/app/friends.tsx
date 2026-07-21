import { useCallback, useEffect, useState } from 'react';
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
  Input,
  Loading,
  Message,
  UserCard,
} from '../components/app/UI';

import { postApi } from '../services/api';
import { getUser } from '../services/session';
import type { UserSummary } from '../types/models';
import { C } from '../constants/appTheme';

export default function Friends() {
  const [friends, setFriends] = useState<UserSummary[]>([]);
  const [pending, setPending] = useState<UserSummary[]>([]);
  const [results, setResults] = useState<UserSummary[]>([]);
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setBusy(true);

    try {
      const u = await getUser();

      if (!u) {
        throw new Error('Please log in again.');
      }

      const r = await postApi<{
        friends: UserSummary[];
        pending: UserSummary[];
      }>('api/getfriendslist', {
        userId: u.id,
      });

      setFriends(r.friends || []);
      setPending(r.pending || []);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(route: string, id: string, success: string) {
    try {
      const u = await getUser();

      if (!u) return;

      await postApi(route, {
        userId: u.id,
        friendId: id,
      });

      setMessage(success);
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  async function search() {
    if (!query.trim()) return;

    try {
      const u = await getUser();

      if (!u) return;

      const r = await postApi<{
        results: UserSummary[];
      }>('api/searchusers', {
        userId: u.id,
        search: query.trim(),
      });

      setResults(r.results || []);

      if (!(r.results || []).length) {
        setMessage('No users found.');
      }
    } catch (e) {
      setMessage((e as Error).message);
    }
  }

  function remove(f: UserSummary) {
    Alert.alert(
      'Remove friend',
      `Remove ${f.username}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            act(
              'api/removefriend',
              f.id,
              'Friend removed.'
            ),
        },
      ]
    );
  }

  return (
    <AppShell
      title="Friends"
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
          {friends.length > 0 && (
            <Text style={s.section}>Friends</Text>
          )}

          {friends.map((f) => (
            <UserCard key={f.id} user={f}>
              <Button
                label="Remove"
                kind="danger"
                small
                onPress={() => remove(f)}
              />
            </UserCard>
          ))}

          {pending.length > 0 && (
            <Text style={s.section}>
              Pending Requests
            </Text>
          )}

          {pending.map((p) => (
            <UserCard
              key={`${p.id}-${p.direction}`}
              user={p}
            >
              {p.direction === 'received' ? (
                <>
                  <Button
                    label="Accept"
                    small
                    onPress={() =>
                      act(
                        'api/acceptfriendrequest',
                        p.id,
                        'Friend request accepted.'
                      )
                    }
                  />

                  <Button
                    label="Deny"
                    kind="danger"
                    small
                    onPress={() =>
                      act(
                        'api/denyfriendrequest',
                        p.id,
                        'Friend request denied.'
                      )
                    }
                  />
                </>
              ) : (
                <Button
                  label="Cancel"
                  kind="danger"
                  small
                  onPress={() =>
                    act(
                      'api/removefriend',
                      p.id,
                      'Friend request canceled.'
                    )
                  }
                />
              )}
            </UserCard>
          ))}

          {!friends.length && !pending.length && (
            <Empty text="No friends or pending requests yet." />
          )}
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
                Add a Friend
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
              placeholder="Search username..."
              onSubmitEditing={search}
            />

            <Button
              label="Search"
              onPress={search}
            />

            {results.map((u) => (
              <UserCard key={u.id} user={u}>
                <Button
                  label="Add Friend"
                  small
                  onPress={() =>
                    act(
                      'api/sendfriendrequest',
                      u.id,
                      'Friend request sent.'
                    )
                  }
                />
              </UserCard>
            ))}
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const s = StyleSheet.create({
  section: {
    fontSize: 20,
    fontWeight: '800',
    color: C.cyan,
    marginTop: 8,
  },

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
});