import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ── DATA ──────────────────────────────────────────

const FEATURES_COMPARISON = [
  {
    category: 'Motor & Transmissão',
    icon: '⚙️',
    items: [
      { name: 'Motor Diesel 3.0L V6', xlt: true, limited: true, limitedPlus: true },
      { name: 'Câmbio Automático 10 M', xlt: true, limited: true, limitedPlus: true },
      { name: 'E-Shifter', xlt: true, limited: true, limitedPlus: true },
      { name: 'Tecnologia Turbo', xlt: true, limited: true, limitedPlus: true },
    ],
  },
  {
    category: 'Conectividade',
    icon: '📡',
    items: [
      { name: 'App Store', xlt: true, limited: true, limitedPlus: true },
      { name: 'CarPlay Wireless', xlt: true, limited: true, limitedPlus: true },
      { name: 'Câmera 360°', xlt: false, limited: false, limitedPlus: true },
      { name: 'Multimídia', xlt: false, limited: false, limitedPlus: false, values: ['10"', '12"', '12"'] },
      { name: 'Tela Instrumentos', xlt: false, limited: false, limitedPlus: false, values: ['8"', '8"', '12.4"'] },
      { name: 'Reconhecimento Voz', xlt: false, limited: true, limitedPlus: true },
    ],
  },
  {
    category: 'Segurança',
    icon: '🛡️',
    items: [
      { name: 'AEB', xlt: true, limited: true, limitedPlus: true },
      { name: 'Alerta Colisão Frontal', xlt: true, limited: true, limitedPlus: true },
      { name: 'Sensor TPMS', xlt: false, limited: true, limitedPlus: true },
      { name: 'BLIS + Tráfego', xlt: false, limited: false, limitedPlus: true },
      { name: 'Piloto Adaptativo', xlt: false, limited: false, limitedPlus: true },
      { name: 'Reverse AEB', xlt: false, limited: false, limitedPlus: true },
      { name: 'Airbags', xlt: false, limited: false, limitedPlus: false, values: ['7', '7', '7'] },
    ],
  },
  {
    category: 'Off-Road & 4x4',
    icon: '🏔️',
    items: [
      { name: 'Tração AWD', xlt: true, limited: true, limitedPlus: true },
      { name: 'Dif. Traseiro Blocante', xlt: true, limited: true, limitedPlus: true },
      { name: 'Terrain Management', xlt: true, limited: true, limitedPlus: true },
      { name: 'Controle de Descida', xlt: true, limited: true, limitedPlus: true },
    ],
  },
];

const HIGHLIGHTS = [
  { label: 'Potência', value: '250 cv', sub: '3.0L V6 Diesel', icon: '⚡' },
  { label: 'Torque', value: '600 Nm', sub: 'Máximo disponível', icon: '🌀' },
  { label: 'Câmbio', value: '10 marchas', sub: 'SelectShift', icon: '⚙️' },
  { label: 'Tração', value: 'AWD', sub: 'Integral Inteligente', icon: '🔄' },
];

export default function ReportPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(0);

  const cat = FEATURES_COMPARISON[activeCategory];

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Image source={require('../../assets/Ford-Logo-PNG-Isolated-Image.webp')} style={styles.logoImg} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSub}>RANGER 2026</Text>
            <Text style={styles.headerMain}>Relatório Técnico</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/specs')}>
          <Text style={styles.backBtnText}>← VOLTAR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* HERO STRIP */}
        <View style={styles.heroStrip}>
          <Text style={styles.heroEyebrow}>Built Ford Tough™ · Linha 2026</Text>
          <Text style={styles.heroTitle}>RANGER <Text style={{ color: '#f54b2e' }}>RAPTOR</Text></Text>
          <Text style={styles.heroDesc}>Dados extraídos da planilha oficial FIAP-Ford</Text>
          
          <View style={styles.heroGrid}>
            {HIGHLIGHTS.map(h => (
              <View key={h.label} style={styles.heroCard}>
                <Text style={styles.heroCardIcon}>{h.icon}</Text>
                <Text style={styles.heroCardValue}>{h.value}</Text>
                <Text style={styles.heroCardLabel}>{h.label}</Text>
                <Text style={styles.heroCardSub}>{h.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* NATIVE BAR CHART APPROXIMATION */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Comparativo de Score (Versões)</Text>
          <Text style={styles.chartCardSub}>Baseado no total de equipamentos</Text>
          
          <View style={styles.barContainer}>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Limited+</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '95%', backgroundColor: '#f54b2e' }]} />
              </View>
              <Text style={styles.barValue}>95</Text>
            </View>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>Limited</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '82%', backgroundColor: '#4a7aff' }]} />
              </View>
              <Text style={styles.barValue}>82</Text>
            </View>
            <View style={styles.barRow}>
              <Text style={styles.barLabel}>XLT</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '70%', backgroundColor: '#2a9d8f' }]} />
              </View>
              <Text style={styles.barValue}>70</Text>
            </View>
          </View>
        </View>

        {/* FEATURES TABLE */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>Equipamentos por Versão</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresTabsContainer}>
            {FEATURES_COMPARISON.map((c, i) => (
              <TouchableOpacity key={i} style={[styles.featuresTab, activeCategory === i && styles.featuresTabActive]} onPress={() => setActiveCategory(i)}>
                <Text style={[styles.featuresTabText, activeCategory === i && styles.featuresTabTextActive]}>{c.icon} {c.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.featuresTable}>
            <View style={styles.featuresTableHead}>
              <Text style={[styles.featuresCol, { flex: 2 }]}>Item</Text>
              <Text style={styles.featuresColVar}>XLT</Text>
              <Text style={styles.featuresColVar}>Lim</Text>
              <Text style={styles.featuresColVar}>Lim+</Text>
            </View>

            {cat.items.map((item, i) => (
              <View key={i} style={[styles.featuresRow, i % 2 === 0 ? styles.featuresRowAlt : {}]}>
                <Text style={styles.featuresItemName}>{item.name}</Text>
                {item.values ? (
                  item.values.map((v, vi) => <Text key={vi} style={styles.featuresValueText}>{v}</Text>)
                ) : (
                  [item.xlt, item.limited, item.limitedPlus].map((has, vi) => (
                    <Text key={vi} style={has ? styles.checkYes : styles.checkNo}>{has ? '✓' : '—'}</Text>
                  ))
                )}
              </View>
            ))}
          </View>
        </View>
        
        <Text style={styles.footerText}>© {new Date().getFullYear()} Ford Motor Company</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#080a0e' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { width: 40, height: 20, marginRight: 10 },
  headerTitleContainer: {},
  headerSub: { color: '#f54b2e', fontSize: 9, fontWeight: 'bold' },
  headerMain: { color: '#e8e2d6', fontSize: 14, fontWeight: 'bold' },
  backBtn: { padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 4 },
  backBtnText: { color: '#9aa0ad', fontSize: 10, fontWeight: 'bold' },
  
  scroll: { padding: 20 },
  heroStrip: { marginBottom: 30 },
  heroEyebrow: { color: '#6b7a8d', fontSize: 10, textTransform: 'uppercase', marginBottom: 5 },
  heroTitle: { color: '#e8e2d6', fontSize: 28, fontWeight: '900', marginBottom: 5 },
  heroDesc: { color: '#9aa0ad', fontSize: 12, marginBottom: 20 },
  
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  heroCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  heroCardIcon: { fontSize: 20, marginBottom: 5 },
  heroCardValue: { color: '#f54b2e', fontSize: 18, fontWeight: 'bold' },
  heroCardLabel: { color: '#e8e2d6', fontSize: 12, marginTop: 2 },
  heroCardSub: { color: '#6b7a8d', fontSize: 9, marginTop: 2 },
  
  chartCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
  chartCardTitle: { color: '#e8e2d6', fontSize: 16, fontWeight: 'bold' },
  chartCardSub: { color: '#6b7a8d', fontSize: 11, marginBottom: 20 },
  barContainer: {},
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  barLabel: { color: '#e8e2d6', width: 60, fontSize: 12 },
  barTrack: { flex: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, marginHorizontal: 10 },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { color: '#e8e2d6', width: 25, fontSize: 12, textAlign: 'right', fontWeight: 'bold' },
  
  featuresSection: { marginBottom: 30 },
  featuresSectionTitle: { color: '#e8e2d6', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  featuresTabsContainer: { flexDirection: 'row', marginBottom: 15 },
  featuresTab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10 },
  featuresTabActive: { backgroundColor: '#f54b2e' },
  featuresTabText: { color: '#9aa0ad', fontSize: 12 },
  featuresTabTextActive: { color: '#fff', fontWeight: 'bold' },
  
  featuresTable: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8, overflow: 'hidden' },
  featuresTableHead: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 10, paddingHorizontal: 15 },
  featuresCol: { color: '#6b7a8d', fontSize: 10, fontWeight: 'bold' },
  featuresColVar: { flex: 1, color: '#e8e2d6', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
  featuresRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)' },
  featuresRowAlt: { backgroundColor: 'rgba(255,255,255,0.01)' },
  featuresItemName: { flex: 2, color: '#e8e2d6', fontSize: 11 },
  featuresValueText: { flex: 1, color: '#9aa0ad', fontSize: 11, textAlign: 'center' },
  checkYes: { flex: 1, color: '#22d3a5', fontSize: 12, textAlign: 'center', fontWeight: 'bold' },
  checkNo: { flex: 1, color: '#4a5568', fontSize: 12, textAlign: 'center' },
  
  footerText: { color: '#4a5568', fontSize: 10, textAlign: 'center', marginTop: 20 }
});
