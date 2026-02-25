import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
}

const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A1',
  '#33FFF5', '#FFB833', '#8D33FF', '#33FF8D', '#FF3333',
  '#2E8B57', '#4682B4', '#D2691E', '#9ACD32', '#9932CC'
];

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 50, style, imageStyle, textStyle }) => {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);

  return (
    <View style={[
      styles.container,
      { width: size, height: size, borderRadius: size / 2, backgroundColor },
      style
    ]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
            imageStyle
          ]}
          resizeMode="cover"
        />
      ) : (
        <Text style={[
          styles.text,
          { fontSize: size * 0.4 },
          textStyle
        ]}>
          {initials}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Avatar;
