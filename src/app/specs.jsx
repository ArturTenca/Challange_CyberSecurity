import React, { useRef, useEffect, useState, Suspense } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { useProgress } from '@react-three/drei/native';
import * as THREE from 'three';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { fetchFordData } from '../api/fordData';
import FordLoadingOverlay from '../components/ford-loading-overlay';
import FordRangerRaptor from '../components/FordRangerRaptor';

const { width, height } = Dimensions.get('window');
const HOTSPOT_SIZE = 40;

const VIEWS = {
  geral_traseira:  { pos: [-8, 1.5, -5],  target: [0, 0, 0], label: 'Traseira' },
  geral_lateral:   { pos: [10, 1.0, 0],   target: [0, 0, 0], label: 'Lateral' },
  geral_frente:    { pos: [0,  1.5, 10],  target: [0, 0, 0], label: 'Frente' },
  geral_topo:      { pos: [0,  8,   0],   target: [0, 0, 0], label: 'Topo' },
  motor_frente:    { pos: [0,  2,   7],   target: [0, 1, 0], label: 'Motor' },
  motor_hood:      { pos: [0,  4,   4],   target: [0, 0.5, 0], label: 'Capô' },
  rodas_dianteira: { pos: [5,  0.4, 5],   target: [2, -1, 2], label: 'Roda Dianteira' },
  rodas_traseira:  { pos: [-5, 0.4, -4],  target: [-2, -1, -2], label: 'Roda Traseira' },
  caçamba:         { pos: [-6, 3,  -2],   target: [-1, 0.5, -1], label: 'Caçamba' },
  cockpit:         { pos: [2,  2,   5],   target: [0, 1, 0], label: 'Cockpit' },
};

const NAV_CATEGORIES = [
  { id: 'geral', label: 'Visão Geral', children: ['geral_traseira', 'geral_lateral', 'geral_frente', 'geral_topo'] },
  { id: 'motor', label: 'Motor', children: ['motor_frente', 'motor_hood'] },
  { id: 'rodas', label: 'Rodas', children: ['rodas_dianteira', 'rodas_traseira'] },
  { id: 'carroceria', label: 'Carroceria', children: ['caçamba', 'cockpit'] },
];

function DonutScore({ score }) {
  const radius = 30;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#22d3a5' : score >= 75 ? '#f54b2e' : '#f59e0b';

  return (
    <View style={styles.donutWrap}>
      <Svg width={80} height={80} viewBox="0 0 80 80">
        <Circle cx="40" cy="40" r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="transparent" />
        <Circle
          cx="40" cy="40" r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90" origin="40, 40"
        />
        <SvgText x="40" y="45" textAnchor="middle" fill={color} fontSize="20" fontWeight="bold">
          {score}
        </SvgText>
      </Svg>
    </View>
  );
}

function Hotspot({ data, isActive, onPress, viewport }) {
  const panelLeft = data.panelSide === 'left';
  
  // Convert top/left percentages to actual coordinates inside the canvas viewport.
  const topStr = data.top.replace('%', '');
  const leftStr = data.left.replace('%', '');
  const topPos = viewport.y + (parseFloat(topStr) / 100) * viewport.height - (HOTSPOT_SIZE / 2);
  const leftPos = viewport.x + (parseFloat(leftStr) / 100) * viewport.width - (HOTSPOT_SIZE / 2);

  return (
    <View style={[styles.hotspotContainer, { top: topPos, left: leftPos }]}>
      <TouchableOpacity onPress={onPress} style={styles.hotspotTouch}>
        <View style={isActive ? styles.hotspotRingActive : styles.hotspotRing} />
        <View style={isActive ? styles.hotspotDotActive : styles.hotspotDot} />
      </TouchableOpacity>

      {isActive && (
        <View style={[styles.hotspotPanel, panelLeft ? { right: 40 } : { left: 40 }]}>
          <View style={styles.panelInner}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{data.title}</Text>
              <DonutScore score={data.score} />
            </View>
            <Text style={styles.panelDesc}>{data.description}</Text>
            
            <View style={styles.panelSpecs}>
              {data.specs.map(s => (
                <View key={s.label} style={styles.panelSpecRow}>
                  <Text style={styles.panelSpecLabel}>{s.label}</Text>
                  <Text style={styles.panelSpecValue}>{s.value}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.panelCompare}>
              <Text style={styles.panelCompareLabel}>VS. COMPETIDORES</Text>
              {data.competitors.map(c => (
                <View key={c.name} style={styles.panelCompareRow}>
                  <Text style={styles.panelCompareName} numberOfLines={1}>{c.name}</Text>
                  <View style={styles.panelCompareBar}>
                    <View style={[
                      styles.panelCompareBarFill, 
                      { width: `${c.value}%`, backgroundColor: c.name === 'Ranger Raptor' ? '#f54b2e' : 'rgba(255,255,255,0.2)' }
                    ]} />
                  </View>
                  <Text style={styles.panelCompareScore}>{c.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function CameraController({ targetView }) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(...targetView.pos));
  const currentTarget = useRef(new THREE.Vector3(...targetView.target));
  const targetPos = useRef(new THREE.Vector3(...targetView.pos));
  const targetTgt = useRef(new THREE.Vector3(...targetView.target));
  const lookAt = useRef(new THREE.Vector3(...targetView.target));

  useEffect(() => {
    targetPos.current.set(...targetView.pos);
    targetTgt.current.set(...targetView.target);
  }, [targetView]);

  useFrame(() => {
    currentPos.current.lerp(targetPos.current, 0.04);
    currentTarget.current.lerp(targetTgt.current, 0.04);
    camera.position.copy(currentPos.current);
    lookAt.current.copy(currentTarget.current);
    camera.lookAt(lookAt.current);
  });

  return null;
}

export default function SpecsPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState('geral_lateral');
  const [openCategory, setOpenCategory] = useState('geral');
  const [activeSection, setActiveSection] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState(null);
  
  const [data, setData] = useState(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [canvasViewport, setCanvasViewport] = useState({ x: 0, y: 0, width, height });
  const { active, progress } = useProgress();

  useEffect(() => {
    fetchFordData().then(res => {
      setData(res);
    });
  }, []);

  const view = VIEWS[activeView];
  const showHotspots = activeView === 'geral_lateral';
  const pageReady = layoutReady && !!data && modelReady;
  const targetProgress = Math.min(
    100,
    (layoutReady ? 12 : 0) + (data ? 18 : 0) + (modelReady ? 70 : (Math.max(progress, active ? progress : 0) * 0.7))
  );

  return (
    <SafeAreaView style={styles.page} onLayout={() => setLayoutReady(true)}>
      <View
        style={styles.canvasContainer}
        onLayout={({ nativeEvent }) => setCanvasViewport(nativeEvent.layout)}
      >
        <Canvas camera={{ position: VIEWS['geral_lateral'].pos, fov: 40, near: 0.1, far: 200 }}>
          <CameraController targetView={view} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 15, 8]} intensity={2.5} />
          <directionalLight position={[-8, 8, -5]} intensity={0.8} color="#4a7aff" />
          <pointLight position={[0, 6, -8]} intensity={1.2} color="#f54b2e" />
          <Suspense fallback={null}>
            <FordRangerRaptor onReady={() => setModelReady(true)} />
          </Suspense>
        </Canvas>
      </View>

      {/* Hotspots overlay */}
      {!!data && showHotspots && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {data.hotspots.map(h => (
            <Hotspot
              key={h.id}
              data={h}
              viewport={canvasViewport}
              isActive={activeHotspot === h.id}
              onPress={() => setActiveHotspot(activeHotspot === h.id ? null : h.id)}
            />
          ))}
        </View>
      )}

      {/* Header */}
      {!!data && (
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
            <Text style={styles.backBtnText}>← VOLTAR</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{data.carInfo.model} · SPECS</Text>
          <TouchableOpacity style={styles.reportBtn} onPress={() => router.push('/report')}>
            <Text style={styles.reportBtnText}>RELATÓRIO</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Camera Nav */}
      {!!data && (
        <View style={styles.camNav} pointerEvents="box-none">
          <Text style={styles.camNavLabel}>EXPLORAR</Text>
          {NAV_CATEGORIES.map(cat => (
            <View key={cat.id}>
              <TouchableOpacity 
                style={[styles.camCategory, openCategory === cat.id && styles.camCategoryActive]}
                onPress={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
              >
                <Text style={[styles.camCategoryText, openCategory === cat.id && styles.camCategoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
              
              {openCategory === cat.id && (
                <View style={styles.camChildren}>
                  {cat.children.map(viewId => (
                    <TouchableOpacity
                      key={viewId}
                      style={[styles.camChild, activeView === viewId && styles.camChildActive]}
                      onPress={() => { setActiveView(viewId); setActiveHotspot(null); }}
                    >
                      <Text style={[styles.camChildText, activeView === viewId && styles.camChildTextActive]}>
                        {VIEWS[viewId].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Specs Panel */}
      {!!data && (
        <View style={styles.specsPanel}>
          <View style={styles.specsTabs}>
            {data.specs.map((sec, i) => (
              <TouchableOpacity key={i} style={[styles.specsTab, activeSection === i && styles.specsTabActive]} onPress={() => setActiveSection(i)}>
                <Text style={[styles.specsTabText, activeSection === i && styles.specsTabTextActive]}>{sec.section}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.specsTable}>
            {data.specs[activeSection].items.map((item, idx) => (
              <View key={idx} style={styles.specsRow}>
                <Text style={styles.specsRowLabel}>{item.label}</Text>
                <Text style={styles.specsRowValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <FordLoadingOverlay visible={!pageReady} progress={pageReady ? 100 : targetProgress} caption="Carregando especificacoes" />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#080a0e' },
  canvasContainer: { ...StyleSheet.absoluteFillObject },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, zIndex: 10 },
  backBtn: { padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 4 },
  backBtnText: { color: '#9aa0ad', fontSize: 10, fontWeight: 'bold' },
  navTitle: { color: '#f54b2e', fontSize: 16, fontWeight: 'bold' },
  reportBtn: { padding: 8, borderWidth: 1, borderColor: 'rgba(245,75,46,0.4)', borderRadius: 4, backgroundColor: '#080a0e' },
  reportBtnText: { color: '#f54b2e', fontSize: 10, fontWeight: 'bold' },
  
  camNav: { position: 'absolute', top: 80, left: 20, zIndex: 10 },
  camNavLabel: { color: '#f54b2e', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  camCategory: { paddingVertical: 8, borderLeftWidth: 2, borderLeftColor: 'transparent', paddingLeft: 10 },
  camCategoryActive: { borderLeftColor: '#f54b2e' },
  camCategoryText: { color: '#e8e2d6', fontSize: 14, fontWeight: '600' },
  camCategoryTextActive: { color: '#f54b2e' },
  camChildren: { paddingLeft: 15, marginVertical: 5 },
  camChild: { paddingVertical: 6, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.1)', paddingLeft: 10 },
  camChildActive: { borderLeftColor: '#f54b2e' },
  camChildText: { color: '#6b7a8d', fontSize: 12 },
  camChildTextActive: { color: '#f54b2e' },

  specsPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(8,10,14,0.85)', borderTopWidth: 1, borderTopColor: 'rgba(245,75,46,0.2)' },
  specsTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  specsTab: { paddingBottom: 10, marginRight: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  specsTabActive: { borderBottomColor: '#f54b2e' },
  specsTabText: { color: '#4a5568', fontSize: 12, fontWeight: 'bold' },
  specsTabTextActive: { color: '#f54b2e' },
  specsTable: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  specsRow: { width: '48%', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 5 },
  specsRowLabel: { color: '#4a5568', fontSize: 10, textTransform: 'uppercase' },
  specsRowValue: { color: '#e8e2d6', fontSize: 14, fontWeight: 'bold', marginTop: 2 },

  hotspotContainer: { position: 'absolute', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  hotspotTouch: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hotspotRing: { position: 'absolute', width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(245,75,46,0.5)' },
  hotspotRingActive: { position: 'absolute', width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#f54b2e' },
  hotspotDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f54b2e', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
  hotspotDotActive: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#f54b2e', borderWidth: 2, borderColor: 'white' },
  
  hotspotPanel: { position: 'absolute', top: -50, width: 240, backgroundColor: 'rgba(8,10,14,0.95)', borderWidth: 1, borderColor: 'rgba(245,75,46,0.4)', borderRadius: 8, padding: 15 },
  panelInner: {},
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  panelTitle: { color: '#e8e2d6', fontSize: 16, fontWeight: 'bold', flex: 1 },
  panelDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10 },
  panelSpecs: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 10, marginBottom: 10 },
  panelSpecRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  panelSpecLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
  panelSpecValue: { color: '#e8e2d6', fontSize: 12, fontWeight: 'bold' },
  panelCompare: {},
  panelCompareLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginBottom: 5 },
  panelCompareRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  panelCompareName: { color: 'rgba(255,255,255,0.6)', fontSize: 10, width: 70 },
  panelCompareBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginHorizontal: 8 },
  panelCompareBarFill: { height: 4, borderRadius: 2 },
  panelCompareScore: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 'bold', width: 20, textAlign: 'right' },
  donutWrap: { alignItems: 'center', justifyContent: 'center' }
});
