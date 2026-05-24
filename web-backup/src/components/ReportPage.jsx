import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  RadialBarChart, RadialBar,
} from 'recharts'
import styles from './ReportPage.module.css'
import fordLogo from '../assets/Ford-Logo-PNG-Isolated-Image.webp'

// ── DATA from FIAP-Ford Data sheet ──────────────────────────────────────────
const VARIANTS = ['XLT 3.0L V6', 'Limited 3.0L V6', 'Limited+ 3.0L V6']

const ENGINE_DATA = [
  { spec: 'Potência (cv)', xlt: 250, limited: 250, limitedPlus: 250 },
  { spec: 'Torque (Nm)', xlt: 600, limited: 600, limitedPlus: 600 },
  { spec: 'Marchas', xlt: 10, limited: 10, limitedPlus: 10 },
  { spec: 'Consumo (km/l)', xlt: 9.55, limited: 9.55, limitedPlus: 9.55 },
  { spec: 'Airbags', xlt: 7, limited: 7, limitedPlus: 7 },
]

const RADAR_DATA = [
  { subject: 'Potência', XLT: 70, Limited: 70, 'Limited+': 70 },
  { subject: 'Segurança', XLT: 72, Limited: 82, 'Limited+': 95 },
  { subject: 'Conectividade', XLT: 60, Limited: 75, 'Limited+': 88 },
  { subject: 'Tecnologia', XLT: 65, Limited: 75, 'Limited+': 90 },
  { subject: 'Conforto', XLT: 65, Limited: 80, 'Limited+': 90 },
  { subject: 'Off-Road', XLT: 78, Limited: 78, 'Limited+': 78 },
]

const RADIAL_DATA = [
  { name: 'Limited+', value: 95, fill: '#f54b2e' },
  { name: 'Limited', value: 76, fill: '#4a7aff' },
  { name: 'XLT', value: 62, fill: '#2a9d8f' },
]

const FEATURES_COMPARISON = [
  {
    category: 'Motor & Transmissão',
    icon: '⚙️',
    items: [
      { name: 'Motor Diesel 3.0L V6', xlt: true, limited: true, limitedPlus: true },
      { name: 'Câmbio Automático 10 Marchas', xlt: true, limited: true, limitedPlus: true },
      { name: 'E-Shifter (Manopla Eletrônica)', xlt: true, limited: true, limitedPlus: true },
      { name: 'Tecnologia Turbo', xlt: true, limited: true, limitedPlus: true },
    ],
  },
  {
    category: 'Conectividade',
    icon: '📡',
    items: [
      { name: 'App Store (Loja de Aplicativos)', xlt: true, limited: true, limitedPlus: true },
      { name: 'Android Auto / CarPlay Wireless', xlt: true, limited: true, limitedPlus: true },
      { name: 'Carregamento Wireless', xlt: true, limited: true, limitedPlus: true },
      { name: 'Câmera 360°', xlt: false, limited: false, limitedPlus: true },
      { name: 'Multimídia (pol.)', xlt: false, limited: false, limitedPlus: false, values: ['10"', '12"', '12"'] },
      { name: 'Tela Instrumentos (pol.)', xlt: false, limited: false, limitedPlus: false, values: ['8"', '8"', '12.4"'] },
      { name: 'Câmera Traseira', xlt: true, limited: true, limitedPlus: false },
      { name: 'Reconhecimento de Voz', xlt: false, limited: true, limitedPlus: true },
    ],
  },
  {
    category: 'Segurança',
    icon: '🛡️',
    items: [
      { name: 'AEB (Freio Autônomo de Emergência)', xlt: true, limited: true, limitedPlus: true },
      { name: 'Alerta de Colisão Frontal', xlt: true, limited: true, limitedPlus: true },
      { name: 'Sensor de Pressão dos Pneus (TPMS)', xlt: false, limited: true, limitedPlus: true },
      { name: 'BLIS + Alerta de Tráfego Cruzado', xlt: false, limited: false, limitedPlus: true },
      { name: 'Piloto Automático Adaptativo + Stop & Go', xlt: false, limited: false, limitedPlus: true },
      { name: 'Reverse AEB', xlt: false, limited: false, limitedPlus: true },
      { name: 'Sistema Keyless (PEPS)', xlt: false, limited: true, limitedPlus: true },
      { name: 'Airbags', xlt: false, limited: false, limitedPlus: false, values: ['7', '7', '7'] },
    ],
  },
  {
    category: 'Conforto & Interior',
    icon: '🪑',
    items: [
      { name: 'Bancos em Couro', xlt: true, limited: true, limitedPlus: true },
      { name: 'Ar Condicionado Automático', xlt: false, limited: true, limitedPlus: true },
      { name: 'Ar Condicionado Dual Zone', xlt: false, limited: true, limitedPlus: true },
      { name: 'Painel Soft Touch', xlt: false, limited: true, limitedPlus: true },
      { name: 'Bancos Elétricos (posições)', xlt: false, limited: false, limitedPlus: false, values: ['8', '8', '8'] },
      { name: 'Iluminação Ambiente', xlt: false, limited: true, limitedPlus: true },
    ],
  },
  {
    category: 'Off-Road & 4x4',
    icon: '🏔️',
    items: [
      { name: 'Tração Integral (AWD)', xlt: true, limited: true, limitedPlus: true },
      { name: 'Diferencial Traseiro Blocante', xlt: true, limited: true, limitedPlus: true },
      { name: 'Terrain Management System', xlt: true, limited: true, limitedPlus: true },
      { name: 'Controle de Descida', xlt: true, limited: true, limitedPlus: true },
      { name: 'Controle de Reboque', xlt: true, limited: true, limitedPlus: true },
      { name: 'Bússola e Inclinômetros', xlt: true, limited: true, limitedPlus: true },
    ],
  },
]

const HIGHLIGHTS = [
  { label: 'Potência', value: '250 cv', sub: '3.0L V6 Diesel', icon: '⚡' },
  { label: 'Torque', value: '600 Nm', sub: 'Máximo disponível', icon: '🌀' },
  { label: 'Câmbio', value: '10 marchas', sub: 'Automático SelectShift', icon: '⚙️' },
  { label: 'Tração', value: 'AWD', sub: 'Integral Inteligente', icon: '🔄' },
  { label: 'Airbags', value: '7 un.', sub: 'Todas as versões', icon: '🛡️' },
  { label: 'Garantia', value: '5 anos', sub: 'Cobertura completa', icon: '✅' },
]

// ── EXPORT HELPERS ───────────────────────────────────────────────────────────
function buildCSVContent() {
  const rows = [['Especificação', 'XLT 3.0L V6', 'Limited 3.0L V6', 'Limited+ 3.0L V6']]
  rows.push(['--- Motor & Transmissão ---', '', '', ''])
  rows.push(['Peso (kg)', '2283', '2357', '2357'])
  rows.push(['Cilindrada (L)', '3.0', '3.0', '3.0'])
  rows.push(['Potência (cv)', '250', '250', '250'])
  rows.push(['Torque (Nm)', '600', '600', '600'])
  rows.push(['Consumo (km/l)', '9.55', '9.55', '9.55'])
  rows.push(['Câmbio', 'Automático 10M', 'Automático 10M', 'Automático 10M'])
  rows.push(['Motor Diesel', 'Sim', 'Sim', 'Sim'])
  rows.push(['--- Rodas ---', '', '', ''])
  rows.push(['Aro (polegadas)', '17', '18', '20'])
  rows.push(['Liga Leve', 'Sim', 'Sim', 'Sim'])
  rows.push(['--- Conectividade ---', '', '', ''])
  rows.push(['Multimídia (pol.)', '10"', '12"', '12"'])
  rows.push(['Tela Instrumentos (pol.)', '8"', '8"', '12.4"'])
  rows.push(['Câmera 360°', 'Não', 'Não', 'Sim'])
  rows.push(['Carregamento Wireless', 'Sim', 'Sim', 'Sim'])
  rows.push(['--- Segurança ---', '', '', ''])
  rows.push(['Airbags', '7', '7', '7'])
  rows.push(['AEB', 'Sim', 'Sim', 'Sim'])
  rows.push(['TPMS', 'Não', 'Sim', 'Sim'])
  rows.push(['BLIS + Tráfego Cruzado', 'Não', 'Não', 'Sim'])
  rows.push(['Keyless (PEPS)', 'Não', 'Sim', 'Sim'])
  rows.push(['--- Conforto ---', '', '', ''])
  rows.push(['Bancos em Couro', 'Sim', 'Sim', 'Sim'])
  rows.push(['Ar Cond. Automático', 'Não', 'Sim', 'Sim'])
  rows.push(['Dual Zone', 'Não', 'Sim', 'Sim'])
  rows.push(['Garantia (anos)', '5', '5', '5'])
  return rows.map(r => r.join(',')).join('\n')
}

function buildTXTContent() {
  return `FORD RANGER 2026 - RELATÓRIO COMPLETO DE ESPECIFICAÇÕES
${'='.repeat(60)}
Gerado em: ${new Date().toLocaleString('pt-BR')}
Fonte: FIAP-Ford Data Sheet Desafio_01_v02

VERSÕES DISPONÍVEIS
${'─'.repeat(60)}
  • XLT 3.0L V6 AT 26MY
  • Limited 3.0L V6 26MY
  • Limited+ 3.0L V6 26MY

MOTOR & TRANSMISSÃO
${'─'.repeat(60)}
  Motor:          3.0L V6 Diesel Turbinado
  Potência:       250 cv (todas as versões)
  Torque:         600 Nm (todas as versões)
  Câmbio:         Automático 10 Marchas (SelectShift)
  E-Shifter:      Sim (todas as versões)
  Consumo:        9.55 km/l (todas as versões)
  Peso XLT:       2.283 kg
  Peso Limited:   2.357 kg
  Peso Limited+:  2.357 kg

RODAS & PNEUS
${'─'.repeat(60)}
  Liga Leve:      Sim (todas as versões)
  Aro XLT:        17"
  Aro Limited:    18"
  Aro Limited+:   20"
  Estepe:         Full Size (mesmo tamanho base)

CONECTIVIDADE
${'─'.repeat(60)}
                         XLT    Limited  Limited+
  Multimídia:            10"    12"      12"
  Tela Instrumentos:     8"     8"       12.4"
  Android Auto/CarPlay:  Sim    Sim      Sim
  Carregamento Wireless: Sim    Sim      Sim
  Câmera Traseira:       Sim    Sim      -
  Câmera 360°:           -      -        Sim
  USB (unidades):        4      4        4

SEGURANÇA ATIVA
${'─'.repeat(60)}
                               XLT    Limited  Limited+
  Airbags:                     7      7        7
  AEB:                         Sim    Sim      Sim
  Alerta Colisão Frontal:      Sim    Sim      Sim
  TPMS:                        -      Sim      Sim
  BLIS + Tráf. Cruzado:        -      -        Sim
  Piloto Adapt. + Stop&Go:     -      -        Sim
  Reverse AEB:                 -      -        Sim
  Keyless (PEPS):              -      Sim      Sim

CONFORTO & INTERIOR
${'─'.repeat(60)}
                               XLT    Limited  Limited+
  Bancos em Couro:             Sim    Sim      Sim
  Ar Cond. Automático:         -      Sim      Sim
  Dual Zone:                   -      Sim      Sim
  Painel Soft Touch:           -      Sim      Sim
  Bancos Elétricos:            8 pos  8 pos    8 pos
  Iluminação Ambiente:         -      Sim      Sim

OFF-ROAD & TRAÇÃO
${'─'.repeat(60)}
  Tração Integral (AWD):          Sim (todas)
  Diferencial Traseiro Blocante:  Sim (todas)
  Terrain Management System:      Sim (todas)
  Controle de Descida:            Sim (todas)
  Controle de Reboque 3.500 kg:   Sim (todas)
  Bússola e Inclinômetros:        Sim (todas)

GARANTIA
${'─'.repeat(60)}
  5 anos (todas as versões)

${'='.repeat(60)}
Ford Motor Company - Todos os direitos reservados
`
}

// ── COMPONENT ────────────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(8,10,14,0.95)',
  border: '1px solid rgba(245, 75, 46,0.3)',
  borderRadius: '4px',
  color: '#e8e2d6',
  fontSize: '0.75rem',
  fontFamily: 'Inter, sans-serif',
}

export default function ReportPage({ onBack, onHome }) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [exporting, setExporting] = useState(null)

  function exportCSV() {
    setExporting('csv')
    const content = buildCSVContent()
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ford-ranger-2026-specs.csv'
    a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setExporting(null), 1200)
  }

  function exportTXT() {
    setExporting('txt')
    const content = buildTXTContent()
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ford-ranger-2026-relatorio.txt'
    a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setExporting(null), 1200)
  }

  function exportPDF() {
    setExporting('pdf')
    window.print()
    setTimeout(() => setExporting(null), 2000)
  }

  const cat = FEATURES_COMPARISON[activeCategory]

  return (
    <div className={styles.page}>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.logoBtn} onClick={onHome} aria-label="Home">
            <img src={fordLogo} alt="Ford" className={styles.logoImg} />
          </button>
          <div className={styles.headerTitle}>
            <span className={styles.headerSub}>RANGER 2026</span>
            <span className={styles.headerMain}>Relatório de Especificações</span>
          </div>
        </div>
        <nav className={styles.headerRight}>
          <div className={styles.exportGroup}>
            <button
              id="export-csv"
              className={`${styles.exportBtn} ${exporting === 'csv' ? styles.exportBtnActive : ''}`}
              onClick={exportCSV}
            >
              <span className={styles.exportIcon}>⬇</span>
              CSV
            </button>
            <button
              id="export-txt"
              className={`${styles.exportBtn} ${exporting === 'txt' ? styles.exportBtnActive : ''}`}
              onClick={exportTXT}
            >
              <span className={styles.exportIcon}>⬇</span>
              TXT
            </button>
            <button
              id="export-pdf"
              className={`${styles.exportBtn} ${styles.exportBtnPdf} ${exporting === 'pdf' ? styles.exportBtnActive : ''}`}
              onClick={exportPDF}
            >
              <span className={styles.exportIcon}>⬇</span>
              PDF
            </button>
          </div>
          <button className={styles.backBtn} onClick={onBack}>← Voltar</button>
        </nav>
      </header>

      {/* ── SCROLL AREA ── */}
      <div className={styles.scroll}>

        {/* ── HERO STRIP ── */}
        <section className={styles.heroStrip}>
          <div className={styles.heroLabel}>
            <span className={styles.heroEyebrow}>Built Ford Tough™ · Linha 2026</span>
            <h1 className={styles.heroTitle}>RANGER <span>RAPTOR</span></h1>
            <p className={styles.heroDesc}>
              Dados extraídos da planilha oficial FIAP-Ford · Data Sheet Desafio 01 v02
            </p>
          </div>
          <div className={styles.heroGrid}>
            {HIGHLIGHTS.map(h => (
              <div key={h.label} className={styles.heroCard}>
                <span className={styles.heroCardIcon}>{h.icon}</span>
                <span className={styles.heroCardValue}>{h.value}</span>
                <span className={styles.heroCardLabel}>{h.label}</span>
                <span className={styles.heroCardSub}>{h.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CHARTS ROW ── */}
        <section className={styles.chartsRow}>

          {/* Radar */}
          <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
              <span className={styles.chartCardTitle}>Score por Dimensão</span>
              <span className={styles.chartCardSub}>Comparativo entre versões</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#5a6478', fontSize: 11, fontFamily: 'Inter' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="XLT" dataKey="XLT" stroke="#2a9d8f" fill="#2a9d8f" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Limited" dataKey="Limited" stroke="#4a7aff" fill="#4a7aff" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Limited+" dataKey="Limited+" stroke="#f54b2e" fill="#f54b2e" fillOpacity={0.2} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: '0.7rem', color: '#5a6478', fontFamily: 'Inter' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar */}
          <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
              <span className={styles.chartCardTitle}>Especificações Técnicas</span>
              <span className={styles.chartCardSub}>Valores comparativos por versão</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ENGINE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="spec" tick={{ fill: '#5a6478', fontSize: 10, fontFamily: 'Inter' }} />
                <YAxis tick={{ fill: '#5a6478', fontSize: 10, fontFamily: 'Inter' }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: '0.7rem', color: '#5a6478', fontFamily: 'Inter' }} />
                <Bar dataKey="xlt" name="XLT" fill="#2a9d8f" radius={[2, 2, 0, 0]} />
                <Bar dataKey="limited" name="Limited" fill="#4a7aff" radius={[2, 2, 0, 0]} />
                <Bar dataKey="limitedPlus" name="Limited+" fill="#f54b2e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radial */}
          <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
              <span className={styles.chartCardTitle}>Score Geral</span>
              <span className={styles.chartCardSub}>Pontuação de equipamentos (%)</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart
                innerRadius="30%"
                outerRadius="90%"
                data={RADIAL_DATA}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: 'rgba(255,255,255,0.03)' }}
                  dataKey="value"
                  label={{ fill: '#e8e2d6', fontSize: 11, fontFamily: 'Inter' }}
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: '0.72rem', color: '#5a6478', fontFamily: 'Inter' }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Score']} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── FEATURES COMPARISON ── */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresSectionHeader}>
            <h2 className={styles.featuresSectionTitle}>Equipamentos por Versão</h2>
            <div className={styles.featuresTabs}>
              {FEATURES_COMPARISON.map((c, i) => (
                <button
                  key={i}
                  className={`${styles.featuresTab} ${activeCategory === i ? styles.featuresTabActive : ''}`}
                  onClick={() => setActiveCategory(i)}
                >
                  {c.icon} {c.category}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.featuresTable}>
            {/* Table header */}
            <div className={styles.featuresTableHead}>
              <div className={styles.featuresCol}>EQUIPAMENTO</div>
              {VARIANTS.map(v => (
                <div key={v} className={styles.featuresColVar}>{v}</div>
              ))}
            </div>
            {/* Rows */}
            {cat.items.map((item, i) => (
              <div key={i} className={`${styles.featuresRow} ${i % 2 === 0 ? styles.featuresRowAlt : ''}`}>
                <div className={styles.featuresItemName}>{item.name}</div>
                {item.values ? (
                  item.values.map((v, vi) => (
                    <div key={vi} className={styles.featuresItemCell}>
                      <span className={styles.featuresValue}>{v}</span>
                    </div>
                  ))
                ) : (
                  [item.xlt, item.limited, item.limitedPlus].map((has, vi) => (
                    <div key={vi} className={styles.featuresItemCell}>
                      {has
                        ? <span className={styles.checkYes}>✓</span>
                        : <span className={styles.checkNo}>—</span>}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER NOTE ── */}
        <footer className={styles.reportFooter}>
          <span>Fonte: FIAP-Ford · Data Sheet Desafio 01 v02 · Ranger 26MY</span>
          <span>Dados utilizados como mockup — sujeitos a atualização</span>
          <span>© {new Date().getFullYear()} Ford Motor Company</span>
        </footer>
      </div>
    </div>
  )
}
