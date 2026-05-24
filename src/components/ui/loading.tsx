import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color: customColor,
  message = 'Carregando...',
}) => {
  const { theme } = useTheme();

  const color = customColor || theme.colors.primary;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text
          style={[
            styles.message,
            { color: theme.colors.textSecondary, marginTop: theme.spacing.md },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.isDark ? '#2d3748' : '#e5e7eb',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
});
