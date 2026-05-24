import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

const LOGO_SOURCE = require('../../assets/Ford-Logo-PNG-Isolated-Image.webp');

function clampProgress(progress) {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(100, progress));
}

export default function FordLoadingOverlay({ visible, progress, caption = 'Carregando experiencia' }) {
  const [opacity] = useState(() => new Animated.Value(visible ? 1 : 0));
  const safeProgress = useMemo(() => clampProgress(progress), [progress]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 180 : 320,
      easing: visible ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [opacity, visible]);

  return (
    <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[styles.overlay, { opacity }]}>
      <View style={styles.content}>
        <Image source={LOGO_SOURCE} style={styles.logo} resizeMode="contain" />
        <Text style={styles.caption}>{caption}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${safeProgress}%` }]} />
        </View>
        <Text style={styles.progress}>{Math.round(safeProgress)}%</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080a0e',
    paddingHorizontal: 28,
  },
  content: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  logo: {
    width: 170,
    height: 76,
    marginBottom: 24,
  },
  caption: {
    color: '#8f98a5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0f4db8',
  },
  progress: {
    color: '#e8e2d6',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 18,
  },
});