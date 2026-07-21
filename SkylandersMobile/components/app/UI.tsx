import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { C } from '../../constants/appTheme';
import type { Figure, UserSummary } from '../../types/models';
import { buildPath } from '../../services/Path';

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled = false,
  small = false,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'danger' | 'ghost';
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        s.btn,
        s[kind],
        small && s.small,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={[
          s.btnText,
          kind === 'danger' && { color: '#fff' },
          kind === 'ghost' && { color: C.cyan },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Input(props: any) {
  return (
    <TextInput
      placeholderTextColor={C.muted}
      style={s.input}
      autoCapitalize="none"
      {...props}
    />
  );
}

export function Message({ text }: { text: string }) {
  if (!text) return null;

  const bad = /error|unable|invalid|expired|failed/i.test(text);

  return (
    <Text
      style={[
        s.message,
        {
          color: bad ? C.danger : C.success,
        },
      ]}
    >
      {text}
    </Text>
  );
}

export function Loading() {
  return (
    <View style={s.center}>
      <ActivityIndicator
        color={C.cyan}
        size="large"
      />
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <Text style={s.muted}>{text}</Text>
    </View>
  );
}

function getFigureImageUrl(image?: string): string | undefined {
  if (!image) return undefined;

  // Already a complete URL
  if (image.startsWith('http')) {
    return image;
  }

  // GitHub raw image
  return (
    'https://raw.githubusercontent.com/MJB506/Skylanders/main/frontend/public/' +
    image.replace(/^\//, '')
  );
}

export function FigureCard({
  figure,
  children,
}: {
  figure: Figure;
  children?: React.ReactNode;
}) {
  const imageUrl = getFigureImageUrl(figure.Image);

  return (
    <View style={s.card}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={s.image}
          resizeMode="contain"
          accessibilityLabel={`${figure.Name} figure`}
          onError={(event) => {
            console.warn(
              `Failed to load image for ${figure.Name}:`,
              imageUrl,
              event.nativeEvent.error
            );
          }}
        />
      ) : (
        <View style={[s.image, s.placeholder]}>
          <Text style={s.muted}>No image</Text>
        </View>
      )}

      <View
        style={{
          flex: 1,
          gap: 5,
        }}
      >
        <Text style={s.name}>{figure.Name}</Text>

        <Text style={s.detail}>{figure.Game}</Text>

        <Text style={s.detail}>
          {figure.Element} • {figure.Type}
        </Text>

        <Text style={s.detail}>
          Variant: {figure.Variant ? 'Yes' : 'No'}
          {figure.Quantity != null ? ` • Qty: ${figure.Quantity}` : ''}
          {figure.Boxed != null
            ? ` • ${figure.Boxed ? 'Boxed' : 'Unboxed'}`
            : ''}
        </Text>

        <View style={s.actions}>{children}</View>
      </View>
    </View>
  );
}

export function UserCard({
  user,
  children,
}: {
  user: UserSummary;
  children?: React.ReactNode;
}) {
  return (
    <View style={s.userCard}>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{user.username}</Text>

        <Text style={s.detail}>
          {user.firstName} {user.lastName}
        </Text>
      </View>

      <View style={s.actions}>{children}</View>
    </View>
  );
}

export function Pager({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (n: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <View style={s.pager}>
      <Button
        label="‹"
        kind="ghost"
        small
        disabled={page <= 1}
        onPress={() => onChange(page - 1)}
      />

      <Text style={s.detail}>
        Page {page} of {total}
      </Text>

      <Button
        label="›"
        kind="ghost"
        small
        disabled={page >= total}
        onPress={() => onChange(page + 1)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  btn: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primary: {
    backgroundColor: C.cyan,
  },

  danger: {
    backgroundColor: C.danger,
  },

  ghost: {
    borderWidth: 1,
    borderColor: C.cyan,
    backgroundColor: 'transparent',
  },

  small: {
    minHeight: 36,
    paddingHorizontal: 11,
  },

  btnText: {
    fontWeight: '800',
    color: C.black,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.panel,
    color: C.text,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
  },

  message: {
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 4,
  },

  center: {
    padding: 30,
  },

  empty: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.border,
    alignItems: 'center',
  },

  muted: {
    color: C.muted,
  },

  card: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },

  image: {
    width: 98,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.panel2,
  },

  name: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
  },

  detail: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 6,
  },

  userCard: {
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
});