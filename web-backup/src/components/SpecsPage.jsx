import { useRef, useEffect, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, Grid } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { PieChart, Pie, Cell } from 'recharts'
import FordRangerRaptor from './FordRangerRaptor'
import styles from './SpecsPage.module.css'
import fordLogo from '../assets/Ford-Logo-PNG-Isolated-Image.webp'

// Camera positions & targets for each view
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
}

const NAV_CATEGORIES = [
  {
    id: 'geral',
    label: 'Visão Geral',
    children: ['geral_traseira', 'geral_lateral', 'geral_frente', 'geral_topo'],
  },
  {
    id: 'motor',
    label: 'Motor',
    children: ['motor_frente', 'motor_hood'],
  },
  {
    id: 'rodas',
    label: 'Rodas',
    children: ['rodas_dianteira', 'rodas_traseira'],
  },
  {
    id: 'carroceria',
    label: 'Carroceria',
    children: ['caçamba', 'cockpit'],
  },
]

const SPECS_DATA = [
  { section: 'Motor & Performance', items: [
    { label: 'Motor', value: '3.0 V6 Bi-turbo Diesel' },
    { label: 'Potência', value: '397 cv @ 3.500 rpm' },
    { label: 'Torque', value: '583 Nm @ 1.750-3.000 rpm' },
    { label: 'Câmbio', value: '10 marchas automático SelectShift' },
    { label: '0-100 km/h', value: '5,4 segundos' },
    { label: 'Velocidade Máx.', value: '180 km/h' },
  ]},
  { section: 'Tração & Suspensão', items: [
    { label: 'Tração', value: '4x4 inteligente com baixa' },
    { label: 'Suspensão Dianteira', value: 'Fox Racing Shox 2.5" bypass' },
    { label: 'Suspensão Traseira', value: 'Multilink com Fox Racing Shox' },
    { label: 'Course Dianteiro', value: '296 mm' },
    { label: 'Course Traseiro', value: '297 mm' },
    { label: 'Ângulo de Ataque', value: '33,1°' },
  ]},
  { section: 'Dimensões', items: [
    { label: 'Comprimento', value: '5.362 mm' },
    { label: 'Largura', value: '2.028 mm' },
    { label: 'Altura', value: '1.873 mm' },
    { label: 'Entre-eixos', value: '3.270 mm' },
    { label: 'Capacidade de carga', value: '620 kg' },
    { label: 'Pneus', value: '285/70 R17 BFGoodrich' },
  ]},
]

// ── HOTSPOT DATA (positioned as % of the canvas area for geral_lateral view)
const HOTSPOTS = [
  {
    id: 'retrovisor',
    left: '60%',
    top:  '36%',
    panelSide: 'right',
    title: 'Retrovisor Integrado',
    description: 'Espelhos retrovisores rebatíveis eletricamente com aquecimento e câmera de ponto cego integrada.',
    specs: [
      { label: 'Ajuste', value: 'Elétrico 6 direções' },
      { label: 'Aquecimento', value: 'Sim' },
      { label: 'Câmera BSM', value: 'Integrada' },
    ],
    score: 88,
    competitors: [
      { name: 'Ranger Raptor', value: 88 },
      { name: 'Hilux GR-S', value: 71 },
      { name: 'Amarok V6', value: 76 },
    ],
  },
  {
    id: 'farol',
    left: '85%',
    top:  '40%',
    panelSide: 'left',
    title: 'Faróis LED Matrix',
    description: 'Faróis full-LED com tecnologia Matrix adaptativa, ajuste automático de altura e DRL signature.',
    specs: [
      { label: 'Tecnologia', value: 'Matrix LED' },
      { label: 'Alcance', value: '120 m (alto)' },
      { label: 'DRL', value: 'Assinatura Ford' },
    ],
    score: 92,
    competitors: [
      { name: 'Ranger Raptor', value: 92 },
      { name: 'Hilux GR-S', value: 68 },
      { name: 'Amarok V6', value: 80 },
    ],
  },
  {
    id: 'roda_dianteira',
    left: '76%',
    top:  '65%',
    panelSide: 'left',
    title: 'Suspensão Fox 2.5"',
    description: 'Suspensão dianteira Fox Racing Shox 2.5" bypass com ajuste de amortecimento para off-road extremo.',
    specs: [
      { label: 'Course', value: '296 mm' },
      { label: 'Pneu', value: '285/70 R17' },
      { label: 'Roda', value: 'Liga leve 17"' },
    ],
    score: 96,
    competitors: [
      { name: 'Ranger Raptor', value: 96 },
      { name: 'Hilux GR-S', value: 74 },
      { name: 'Amarok V6', value: 70 },
    ],
  },
  {
    id: 'roda_traseira',
    left: '22%',
    top:  '65%',
    panelSide: 'right',
    title: 'Suspensão Traseira Multilink',
    description: 'Eixo traseiro multilink com Fox Racing Shox, projetado para máxima estabilidade em terrenos irregulares.',
    specs: [
      { label: 'Course', value: '297 mm' },
      { label: 'Eixo', value: 'Multilink independente' },
      { label: 'Freio', value: 'Disco 332 mm' },
    ],
    score: 94,
    competitors: [
      { name: 'Ranger Raptor', value: 94 },
      { name: 'Hilux GR-S', value: 72 },
      { name: 'Amarok V6', value: 78 },
    ],
  },
  {
    id: 'cacamba',
    left: '27%',
    top:  '42%',
    panelSide: 'right',
    title: 'Caçamba Inteligente',
    description: 'Caçamba em alumínio de alta resistência com proteção de carga, tomadas 12V/220V e iluminação LED.',
    specs: [
      { label: 'Capacidade', value: '620 kg' },
      { label: 'Volume', value: '1.430 litros' },
      { label: 'Tomada', value: '12V + 220V' },
    ],
    score: 85,
    competitors: [
      { name: 'Ranger Raptor', value: 85 },
      { name: 'Hilux GR-S', value: 80 },
      { name: 'Amarok V6', value: 82 },
    ],
  },
  {
    id: 'motor',
    left: '82%',
    top:  '30%',
    panelSide: 'left',
    title: 'Motor 3.0 V6 Bi-Turbo',
    description: 'Bloco V6 biturbo diesel com 397 cv e 583 Nm de torque. O mais potente da categoria pickup off-road.',
    specs: [
      { label: 'Potência', value: '397 cv @ 3.500 rpm' },
      { label: 'Torque', value: '583 Nm' },
      { label: '0–100 km/h', value: '5,4 s' },
    ],
    score: 98,
    competitors: [
      { name: 'Ranger Raptor', value: 98 },
      { name: 'Hilux GR-S', value: 65 },
      { name: 'Amarok V6', value: 88 },
    ],
  },
]

// Donut chart component
function DonutScore({ score }) {
  const data = [
    { value: score },
    { value: 100 - score },
  ]
  const color = score >= 90 ? '#22d3a5' : score >= 75 ? '#f54b2e' : '#f59e0b'

  return (
    <div className={styles.donutWrap}>
      <PieChart width={90} height={90}>
        <Pie
          data={data}
          cx={45}
          cy={45}
          innerRadius={30}
          outerRadius={42}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill={color} />
          <Cell fill="rgba(255,255,255,0.05)" />
        </Pie>
      </PieChart>
      <div className={styles.donutLabel} style={{ color }}>
        <span className={styles.donutScore}>{score}</span>
        <span className={styles.donutUnit}>/100</span>
      </div>
    </div>
  )
}

// Animated Camera Controller
function CameraController({ targetView }) {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3(...targetView.pos))
  const currentTarget = useRef(new THREE.Vector3(...targetView.target))
  const targetPos = useRef(new THREE.Vector3(...targetView.pos))
  const targetTgt = useRef(new THREE.Vector3(...targetView.target))
  const lookAt = useRef(new THREE.Vector3(...targetView.target))

  useEffect(() => {
    targetPos.current.set(...targetView.pos)
    targetTgt.current.set(...targetView.target)
  }, [targetView])

  useFrame(() => {
    currentPos.current.lerp(targetPos.current, 0.04)
    currentTarget.current.lerp(targetTgt.current, 0.04)
    camera.position.copy(currentPos.current)
    lookAt.current.copy(currentTarget.current)
    camera.lookAt(lookAt.current)
  })

  return null
}

// Single Hotspot component
function Hotspot({ data, isActive, onEnter, onLeave }) {
  const panelLeft = data.panelSide === 'left'

  return (
    <div
      className={`${styles.hotspot} ${isActive ? styles.hotspotActive : ''}`}
      style={{ left: data.left, top: data.top }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className={styles.hotspotRing} />
      <div className={styles.hotspotDot} />

      {isActive && (
        <div className={`${styles.hotspotPanel} ${panelLeft ? styles.panelLeft : styles.panelRight}`}>
          {/* SVG connector line */}
          <svg
            className={`${styles.hotspotLine} ${panelLeft ? styles.lineLeft : styles.lineRight}`}
            viewBox="0 0 80 2"
            preserveAspectRatio="none"
          >
            <line x1="0" y1="1" x2="80" y2="1" stroke="#f54b2e" strokeWidth="1" strokeDasharray="4 3" />
          </svg>

          <div className={styles.panelInner}>
            <div className={styles.panelHeader}>
              <h4 className={styles.panelTitle}>{data.title}</h4>
              <DonutScore score={data.score} />
            </div>
            <p className={styles.panelDesc}>{data.description}</p>
            <div className={styles.panelSpecs}>
              {data.specs.map(s => (
                <div key={s.label} className={styles.panelSpecRow}>
                  <span className={styles.panelSpecLabel}>{s.label}</span>
                  <span className={styles.panelSpecValue}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className={styles.panelCompare}>
              <span className={styles.panelCompareLabel}>VS. COMPETIDORES</span>
              {data.competitors.map(c => (
                <div key={c.name} className={styles.panelCompareRow}>
                  <span className={styles.panelCompareName}>{c.name}</span>
                  <div className={styles.panelCompareBar}>
                    <div
                      className={styles.panelCompareBarFill}
                      style={{
                        width: `${c.value}%`,
                        background: c.name === 'Ranger Raptor' ? '#f54b2e' : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  </div>
                  <span className={styles.panelCompareScore}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SpecsPage({ onBack, onViewReport, onHome }) {
  const [activeView, setActiveView] = useState('geral_lateral')
  const [openCategory, setOpenCategory] = useState('geral')
  const [activeSection, setActiveSection] = useState(0)
  const [activeHotspot, setActiveHotspot] = useState(null)

  const view = VIEWS[activeView]
  const showHotspots = activeView === 'geral_lateral'

  function handleCategory(id) {
    setOpenCategory(id === openCategory ? null : id)
  }

  function handleView(viewId) {
    setActiveView(viewId)
    setActiveHotspot(null)
  }

  return (
    <div className={styles.page}>
      {/* 3D Canvas */}
      <div className={styles.canvas}>
        <Canvas
          camera={{ position: VIEWS['geral_lateral'].pos, fov: 40, near: 0.1, far: 200 }}
          shadows
          gl={{ antialias: true }}
          style={{ background: 'transparent' }}
        >
          <CameraController targetView={view} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 15, 8]} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} />
          <directionalLight position={[-8, 8, -5]} intensity={0.8} color="#4a7aff" />
          <pointLight position={[0, 6, -8]} intensity={1.2} color="#f54b2e" />
          <Environment preset="city" />
          <Suspense fallback={null}>
            <FordRangerRaptor />
          </Suspense>
          <ContactShadows position={[0, -1.42, 0]} opacity={0.7} scale={20} blur={2.5} far={6} color="#000000" />
          <Grid
            position={[0, -1.42, 0]} args={[30, 30]}
            cellSize={0.8} cellThickness={0.5} cellColor="#1a2535"
            sectionSize={4} sectionThickness={1} sectionColor="#1e2f45"
            fadeDistance={25} fadeStrength={1} infiniteGrid
          />
        </Canvas>
      </div>

      {/* Hotspot Layer — only on lateral view */}
      {showHotspots && (
        <div className={styles.hotspotLayer}>
          {HOTSPOTS.map(h => (
            <Hotspot
              key={h.id}
              data={h}
              isActive={activeHotspot === h.id}
              onEnter={() => setActiveHotspot(h.id)}
              onLeave={() => setActiveHotspot(null)}
            />
          ))}
          <div className={styles.hotspotHint}>
            <span className={styles.hotspotHintDot} />
            Passe o mouse sobre os pontos para explorar
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <button className={styles.logo} onClick={onHome}>
          <img src={fordLogo} alt="Ford" className={styles.logoImg} />
        </button>
        <nav className={styles.nav}>
          <button className={styles.backBtn} onClick={onBack}>← Voltar</button>
          <span className={styles.navTitle}>Ranger Raptor 2026 · Especificações</span>
          {onViewReport && (
            <button className={styles.reportBtn} onClick={onViewReport}>Relatório</button>
          )}
        </nav>
      </header>

      {/* Camera Nav (cascade buttons) */}
      <div className={styles.camNav}>
        <div className={styles.camNavLabel}>EXPLORAR</div>
        {NAV_CATEGORIES.map(cat => (
          <div key={cat.id} className={styles.camCategoryWrap}>
            <button
              className={`${styles.camCategory} ${openCategory === cat.id ? styles.camCategoryActive : ''}`}
              onClick={() => handleCategory(cat.id)}
            >
              {cat.label}
              <span className={styles.chevron}>{openCategory === cat.id ? '▲' : '▼'}</span>
            </button>
            {openCategory === cat.id && (
              <div className={styles.camChildren}>
                {cat.children.map((viewId, i) => (
                  <button
                    key={viewId}
                    className={`${styles.camChild} ${activeView === viewId ? styles.camChildActive : ''}`}
                    onClick={() => handleView(viewId)}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {VIEWS[viewId].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Specs Panel */}
      <div className={styles.specsPanel}>
        <div className={styles.specsTabs}>
          {SPECS_DATA.map((sec, i) => (
            <button
              key={i}
              className={`${styles.specsTab} ${activeSection === i ? styles.specsTabActive : ''}`}
              onClick={() => setActiveSection(i)}
            >
              {sec.section}
            </button>
          ))}
        </div>
        <div className={styles.specsTable}>
          {SPECS_DATA[activeSection].items.map(item => (
            <div key={item.label} className={styles.specsRow}>
              <span className={styles.specsRowLabel}>{item.label}</span>
              <span className={styles.specsRowValue}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Label overlay */}
      <div className={styles.viewLabel}>
        {VIEWS[activeView].label}
      </div>
    </div>
  )
}
