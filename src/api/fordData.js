import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_API_DATA = {
  carInfo: {
    model: "Ranger Raptor 2026",
    tagline: "Belo Sorriso.",
    price: "R$ 466.500"
  },
  specs: [
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
    ]}
  ],
  hotspots: [
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
    }
  ]
};

// Simulated async API fetch
export const fetchFordData = async () => {
  try {
    // Check cache first
    const cachedData = await AsyncStorage.getItem('@ford_data_v1');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Save to cache
    await AsyncStorage.setItem('@ford_data_v1', JSON.stringify(MOCK_API_DATA));
    
    return MOCK_API_DATA;
  } catch (error) {
    console.error("Error fetching data", error);
    return MOCK_API_DATA; // fallback
  }
};
