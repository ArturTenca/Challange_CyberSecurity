import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Suspense, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { ContactShadows, OrbitControls, useProgress } from '@react-three/drei/native';
import FordLoadingOverlay from '../components/ford-loading-overlay';
import FordRangerRaptor from '../components/FordRangerRaptor';

const { width, height } = Dimensions.get('window');

const specs = [
  { label: 'Motor', value: '3.0 V6 Bi-turbo' },
  { label: 'Potência', value: '397 cv' },
  { label: 'Torque', value: '583 Nm' },
  { label: 'Tração', value: '4x4 inteligente' },
];

const TOP_NAV_ITEMS = [
  { label: 'Início', route: '/' },
  { label: 'Specs', route: '/specs' },
  { label: 'Relatório', route: '/report' },
];

function HeroScene({ onModelReady }) {
  return (
    <Canvas camera={{ position: [6.2, 1.1, 7.8], fov: 40, near: 0.1, far: 200 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 15, 8]} intensity={2.5} />
      <directionalLight position={[-8, 8, -5]} intensity={0.8} color="#4a7aff" />
      <pointLight position={[0, 6, -8]} intensity={1.2} color="#f54b2e" />
      <Suspense fallback={null}>
        <FordRangerRaptor onReady={onModelReady} />
      </Suspense>
      <ContactShadows
        position={[0, -1.42, 0]}
        opacity={0.7}
        scale={18}
        blur={2.6}
        far={6}
        color="#000000"
      />
      <OrbitControls
        target={[0, -0.1, 0.2]}
        enablePan={false}
        enabled
        enableZoom
        enableRotate
        minDistance={6.8}
        maxDistance={8.2}
        minPolarAngle={0.9}
        maxPolarAngle={1.2}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.45}
      />
    </Canvas>
  );
}

export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();
  const [visible, setVisible] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const { active, progress } = useProgress();
  const isCompact = width < 860;

  const targetProgress = Math.min(
    100,
    (layoutReady ? 18 : 0) + (modelReady ? 82 : (Math.max(progress, active ? progress : 0) * 0.82))
  );
  const pageReady = layoutReady && modelReady;

  useEffect(() => {
    if (!pageReady) return;

    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, [pageReady]);

  return (
    <SafeAreaView style={styles.container} onLayout={() => setLayoutReady(true)}>
      <View style={styles.background} />
      <View style={styles.canvasWrap}>
        <HeroScene onModelReady={() => setModelReady(true)} />
      </View>
      <View style={styles.topGlow} pointerEvents="none" />
      <View style={styles.bottomShade} pointerEvents="none" />

      <View style={[styles.ui, visible && styles.visible]} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity style={styles.logoButton} onPress={() => router.push('/')}>
            <Image
              source={require('../../assets/Ford-Logo-PNG-Isolated-Image.webp')}
              style={styles.logoImg}
              resizeMode="contain" 
            />
          </TouchableOpacity>

          <View style={[styles.nav, isCompact && styles.navCompact]}>
            {TOP_NAV_ITEMS.map((item) => {
              const isActive = item.route === '/';

              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => router.push(item.route)}
                >
                  <Text selectable={false} style={[styles.navLink, isActive && styles.navLinkActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.navItem}
              onPress={async () => {
                await logout();
                router.replace('/login');
              }}
            >
              <Text selectable={false} style={styles.navLink}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.leftPanel, isCompact && styles.leftPanelCompact]}>
          <View pointerEvents="none" style={styles.leftPanelContent}>
            <Text selectable={false} style={styles.eyebrow}>Built Ford Tough™</Text>
            <View style={styles.titleContainer}>
              <Text selectable={false} style={styles.titleF}>Ranger</Text>
              <Text selectable={false} style={styles.titleSub}>Raptor</Text>
            </View>
            <Text selectable={false} style={styles.description}>
              A pickup mais capaz fora de estrada. Design agressivo,
              suspensão Fox Racing e tecnologia de última geração para
              dominar qualquer terreno.
            </Text>

            <View style={styles.specsGrid}>
              {specs.map((s) => (
                <View key={s.label} style={styles.specItem}>
                  <Text selectable={false} style={styles.specValue}>{s.value}</Text>
                  <Text selectable={false} style={styles.specLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.actions, isCompact && styles.actionsCompact]}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/specs')}>
              <Text selectable={false} style={styles.btnPrimaryText}>VER SPECS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/report')}>
              <Text selectable={false} style={styles.btnSecondaryText}>RELATÓRIO</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.hint, isCompact && styles.hintCompact]} pointerEvents="none">
          <Text selectable={false} style={styles.hintIcon}>⟳</Text>
          <Text selectable={false} style={styles.hintText}>Arraste para explorar o veículo</Text>
        </View>

        <View style={[styles.badge, isCompact && styles.badgeCompact]} pointerEvents="none">
          <Text selectable={false} style={styles.badgeYear}>2026</Text>
          <View style={styles.badgeLine} />
          <Text selectable={false} style={styles.badgeText}>SÉRIE{'\n'}ESPECIAL</Text>
        </View>
      </View>

      <FordLoadingOverlay visible={!pageReady} progress={pageReady ? 100 : targetProgress} caption="Carregando modelo 3D" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080a0e',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#080a0e',
  },
  canvasWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'rgba(8,10,14,0.72)',
  },
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: 'rgba(8,10,14,0.62)',
  },
  ui: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    opacity: 0,
    userSelect: 'none',
  },
  visible: {
    opacity: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 8,
    zIndex: 10,
  },
  logoButton: {
    paddingVertical: 8,
  },
  logoImg: {
    width: 86,
    height: 36,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navCompact: {
    gap: 8,
  },
  navItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(8,10,14,0.42)',
  },
  navItemActive: {
    borderColor: 'rgba(245,75,46,0.55)',
  },
  navLink: {
    color: '#9aa0ad',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  navLinkActive: {
    color: '#f54b2e',
  },
  leftPanel: {
    position: 'absolute',
    left: 28,
    top: height * 0.24,
    bottom: 50,
    maxWidth: 390,
    zIndex: 10,
  },
  leftPanelContent: {
    userSelect: 'none',
  },
  leftPanelCompact: {
    top: 104,
    maxWidth: width - 40,
  },
  eyebrow: {
    color: '#f54b2e',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  titleContainer: {
    marginBottom: 18,
  },
  titleF: {
    color: '#e8e2d6',
    fontSize: width < 860 ? 56 : 82,
    fontWeight: '800',
    lineHeight: width < 860 ? 56 : 78,
  },
  titleSub: {
    color: '#f54b2e',
    fontSize: width < 860 ? 24 : 30,
    fontWeight: '800',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  description: {
    color: '#6b7a8d',
    fontSize: 14,
    lineHeight: 24,
    maxWidth: 340,
    marginBottom: 28,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 34,
    maxWidth: 360,
    backgroundColor: 'rgba(15,19,24,0.78)',
    borderWidth: 1,
    borderColor: '#1a2535',
    borderLeftWidth: 2,
    borderLeftColor: '#f54b2e',
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  specItem: {
    width: '50%',
    marginBottom: 18,
  },
  specValue: {
    color: '#e8e2d6',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 3,
  },
  specLabel: {
    color: '#4a5568',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 50,
  },
  actionsCompact: {
    flexWrap: 'wrap',
  },
  btnPrimary: {
    backgroundColor: '#f54b2e',
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  btnPrimaryText: {
    color: '#080a0e',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.6,
  },
  btnSecondary: {
    backgroundColor: 'rgba(8,10,14,0.62)',
    borderWidth: 1,
    borderColor: '#1e2838',
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  btnSecondaryText: {
    color: '#9aa0ad',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.4,
  },
  hint: {
    position: 'absolute',
    bottom: 28,
    left: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    transform: [{ translateX: -118 }],
  },
  hintCompact: {
    left: 24,
    transform: [{ translateX: 0 }],
  },
  hintIcon: {
    color: '#3a4a58',
    fontSize: 20,
  },
  hintText: {
    color: '#3a4a58',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  badge: {
    position: 'absolute',
    right: 30,
    top: '48%',
    transform: [{ translateY: -60 }],
    alignItems: 'center',
    gap: 10,
  },
  badgeCompact: {
    top: 'auto',
    bottom: 90,
    right: 24,
    transform: [{ translateY: 0 }],
  },
  badgeYear: {
    color: '#f54b2e',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
    transform: [{ rotate: '90deg' }],
  },
  badgeLine: {
    width: 1,
    height: 34,
    backgroundColor: '#f54b2e',
  },
  badgeText: {
    color: '#6b7a8d',
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
