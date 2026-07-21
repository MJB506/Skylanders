import { ReactNode } from 'react';

import {
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';

import { clearSession } from '../../services/session';
import { C } from '../../constants/appTheme';

const nav = [
  ['/collection', 'albums-outline', 'Collection'],
  ['/wishlist', 'heart-outline', 'Wishlist'],
  ['/search', 'search-outline', 'Search'],
  ['/friends', 'people-outline', 'Friends'],
] as const;

type AppShellProps = {
  children: ReactNode;
  title: string;
  action?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export default function AppShell({
  children,
  title,
  action,
  refreshing = false,
  onRefresh,
}: AppShellProps) {
  const router = useRouter();
  const path = usePathname();

  async function logout() {
    await clearSession();
    router.replace('/login');
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Image
          source={require('../../assets/images/skylanders-logo.webp')}
          style={s.logo}
          resizeMode="contain"
        />

        <Pressable
          onPress={logout}
          accessibilityLabel="Log out"
        >
          <Ionicons
            name="log-out-outline"
            size={27}
            color={C.text}
          />
        </Pressable>
      </View>

      <View style={s.titleRow}>
        <Text style={s.title}>{title}</Text>
        {action}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.cyan}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>

      <View style={s.nav}>
        {nav.map(([route, icon, label]) => (
          <Pressable
            key={route}
            style={s.navItem}
            onPress={() =>
              router.replace(route as any)
            }
          >
            <Ionicons
              name={icon}
              size={23}
              color={
                path === route
                  ? C.cyan
                  : C.muted
              }
            />

            <Text
              style={[
                s.navText,
                path === route && s.active,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    height: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: C.border,
  },

  logo: {
    width: 170,
    height: 56,
  },

  titleRow: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: C.cyan,
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },

  nav: {
    height: 70,
    borderTopWidth: 1,
    borderColor: C.border,
    backgroundColor: '#100d2a',
    flexDirection: 'row',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  navText: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '600',
  },

  active: {
    color: C.cyan,
  },
});