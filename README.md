# Ford Challenge Mobile App 🚗

Aplicação mobile multiplataforma desenvolvida com **React Native + Expo** para o Sprint Mobile Development & IoT da Ford.

## 📋 Sobre o Projeto

Este projeto apresenta uma solução inovadora que responde a um dos desafios propostos pela Ford:

### Desafios Disponíveis

1. **Inteligência Competitiva Automotiva** (Challenge 1)
   - Análise de dados de mercado em tempo real
   - Comparação com competitors
   - Dashboard com insights estratégicos
   - Relatórios comparativos

2. **Retenção e Fidelização de Clientes** (Challenge 2)
   - Programa de fidelização com gamificação
   - Lembretes de manutenção inteligentes
   - Ofertas personalizadas
   - Comunidade de proprietários

## 🎯 Requisitos Atendidos

- ✅ Interface clara e navegação intuitiva
- ✅ Consumo de APIs externas
- ✅ Multiplataforma (iOS, Android, Web)
- ✅ Componentes React Native bem estruturados
- ✅ Gerenciamento de estado com Zustand
- ✅ Consumo assíncronico de APIs
- ✅ Notificações push (Expo Notifications)
- ✅ Armazenamento local com AsyncStorage
- ✅ Tema escuro/claro responsivo
- ✅ Tratamento robusto de erros
- ✅ Navegação com Expo Router

## 🛠️ Tech Stack

- **React Native 0.85.3** - Framework mobile
- **Expo 56.0.4** - Plataforma de desenvolvimento
- **Expo Router 56.2.6** - Navegação file-based
- **Zustand 4.4.0** - Gerenciamento de estado
- **TypeScript** - Type safety
- **AsyncStorage** - Persistência local
- **Expo Notifications** - Push notifications

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ ou npm/yarn
- Expo CLI: `npm install -g expo-cli`
- (Opcional) iOS Simulator ou Android Emulator
- (Opcional) Expo Go app no seu dispositivo

### Setup Local

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd Challenge_Mobile

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm start
```

## 🚀 Executar a Aplicação

### No Simulator/Emulator

```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android
```

### No Dispositivo Real

```bash
# Inicia o servidor Expo
npm start

# Escanear QR code com Expo Go app (iOS/Android)
```

### Web

```bash
npm run web
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.jsx        # Root layout
│   ├── index.jsx          # Home screen
│   ├── specs.jsx          # Specs screen
│   └── report.jsx         # Report screen
│
├── components/            # Componentes React Native reutilizáveis
│   ├── ui/               # UI primitivos
│   │   ├── loading.tsx   # Loading skeleton
│   │   └── error.tsx     # Error handling
│   ├── challenge-selector.tsx
│   └── data-container.tsx
│
├── store/                # Gerenciamento de estado (Zustand)
│   ├── vehicleStore.ts   # Store de veículos
│   └── challengeStore.ts # Store de desafios
│
├── services/            # Serviços da aplicação
│   ├── apiService.ts    # API calls com cache e retry
│   └── notificationService.ts # Push notifications
│
├── contexts/            # React Contexts
│   └── ThemeContext.tsx # Tema global
│
├── constants/          # Constantes da app
│   ├── colors.ts       # Paleta de cores
│   ├── layout.ts       # Spacing, fonts, shadows
│   └── challenges.ts   # Definição de desafios
│
├── hooks/             # Custom React Hooks
│   ├── use-color-scheme.ts
│   └── use-color-scheme.web.ts
│
└── utils/            # Utilidades
    ├── errorHandler.ts
    └── storage.ts
```

## 🔌 Como Usar os Serviços

### Gerenciamento de Estado (Zustand)

```tsx
import { useVehicleStore } from '@/store/vehicleStore';

function MyComponent() {
  const { vehicles, loading, error, setVehicles } = useVehicleStore();
  
  return <Text>{vehicles.length} veículos</Text>;
}
```

### API Service

```tsx
import { apiService } from '@/services/apiService';

// Fetch com cache automático
const vehicles = await apiService.getVehicles();

// Sync com servidor
await apiService.syncData();
```

### Notificações

```tsx
import { sendLocalNotification, notifyVehicleUpdate } from '@/services/notificationService';

// Enviar notificação customizada
await sendLocalNotification({
  title: 'Olá!',
  body: 'Mensagem da Ford',
  delay: 5 // segundos
});

// Notificações específicas
await notifyVehicleUpdate('Ranger Raptor');
```

### Tema

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Tema {isDark ? 'Escuro' : 'Claro'}
      </Text>
    </View>
  );
}
```

## 📡 Integração com APIs

O app suporta integração com múltiplas fontes de dados:

### Exemplo: Consumir Dados Externos

```tsx
import { apiService } from '@/services/apiService';

const fetchCompetitorData = async () => {
  try {
    const data = await apiService.getCompetitorData();
    // data com cache automático por 7 dias
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

## 🌐 Suporte a Offline

O app funciona completamente offline com dados em cache:

```tsx
import { offlineService } from '@/services/apiService';

// Recuperar dados em cache
const cachedVehicles = await offlineService.getCachedVehicles();

// Verificar se dados estão desatualizados
const isStale = await offlineService.isDataStale();
```

## 🎨 Temas

O app suporta tema claro e escuro automático com a preferência do sistema:

- **Dark Mode** - Fundo #0a0e14, Surface #1a1f2e
- **Light Mode** - Fundo branco, Surface #f9fafb
- **Brand Colors** - Ford Blue (#003478), Electric Blue (#00A8E8)

## 📱 Responsividade

O app é totalmente responsivo:
- **Tablets** - Layout adaptável com espaçamento maior
- **Mobile** - Otimizado para telas pequenas
- **Web** - Desktop layout com Responsive Design

## 🔒 Segurança e Privacidade

- ✅ Validação de dados com tratamento de erros
- ✅ AsyncStorage isolado por chave
- ✅ Sem armazenamento de dados sensíveis
- ✅ HTTPS para todas as APIs
- ✅ Rate limiting com retry logic

## 🧪 Testes

```bash
# Lint
npm run lint

# (Futuro) Testes unitários
npm test
```

## 📊 Monitoramento

O app inclui:
- Logging de erros automático
- Rastreamento de sync history
- Storage usage monitoring
- Notificações de status

## 🚀 Build para Produção

```bash
# Criar build Expo
eas build --platform ios,android --non-interactive

# Preview antes de submit
eas build --platform ios --profile preview

# Produção
eas submit --platform ios --latest
```

## 📝 Documentação Adicional

- [Expo Documentation](https://docs.expo.dev/versions/v56.0.0/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Expo Router](https://expo.github.io/router)

## 🤝 Contribuindo

Para adicionar novas features:

1. Criar branch: `git checkout -b feature/nome-feature`
2. Implementar com TypeScript
3. Adicionar componentes em `src/components`
4. Usar store do Zustand para estado global
5. Testar em iOS, Android e Web

## 📄 Licença

Este projeto é parte do Sprint Mobile Development & IoT da Ford.

## ✉️ Suporte

Para dúvidas ou issues:
- Consultar documentação do Expo: https://docs.expo.dev/versions/v56.0.0/
- Issues do projeto
- Discussões em aula

---

**Desenvolvido com ❤️ para Ford**

Sprint: Mobile Development & IoT
