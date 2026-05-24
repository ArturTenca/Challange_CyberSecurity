# Arquitetura da Aplicação 🏗️

Documentação técnica da arquitetura e padrões de design do Ford Challenge Mobile App.

## Visão Geral

A aplicação segue uma arquitetura baseada em:
- **File-based Routing** (Expo Router)
- **State Management** (Zustand)
- **Component-Driven Design**
- **Service-Oriented Architecture**

```
┌─────────────────────────────────┐
│      UI Screens (app/)          │
├─────────────────────────────────┤
│    Components (components/)     │
├─────────────────────────────────┤
│    State Management (store/)    │
├─────────────────────────────────┤
│   Services & Context            │
├─────────────────────────────────┤
│   Utils & Constants             │
└─────────────────────────────────┘
```

---

## Camadas da Arquitetura

### 1. Presentational Layer (app/)

Screens da aplicação usando file-based routing.

```
app/
├── _layout.jsx       → Root layout com Theme Provider
├── index.jsx        → Home screen
├── specs.jsx        → Specifications screen
└── report.jsx       → Report/Analytics screen
```

**Responsabilidades:**
- Renderizar UI
- Gerenciar navegação
- Conectar com stores e contextos
- Lidar com inputs do usuário

---

### 2. Component Layer (components/)

Componentes reutilizáveis organizados por categoria.

```
components/
├── ui/              → UI primitivos (Loading, Error, etc)
├── challenge-selector.tsx
├── data-container.tsx
└── [Feature-specific components]
```

**Princípios:**
- Componentes pequenos e focados
- Props bem tipadas com TypeScript
- Uso de hooks customizados
- Sem lógica de negócio complexa

---

### 3. State Management (store/)

Gerenciamento global com Zustand.

```
store/
├── vehicleStore.ts   → Estado de veículos
└── challengeStore.ts → Estado de desafios
```

**Padrão:**
```tsx
export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set, get) => ({
      // State
      vehicles: [],
      
      // Actions
      setVehicles: (v) => set({ vehicles: v }),
    }),
    {
      name: 'vehicle-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Benefícios:**
- Imutabilidade
- DevTools suporte
- Persistência automática
- TypeScript support

---

### 4. Services Layer (services/)

Serviços para operações específicas.

#### API Service

```tsx
// Funcionalidades:
- Fetch com retry logic
- Cache automático
- Timeout handling
- Error handling
```

#### Notification Service

```tsx
// Funcionalidades:
- Initialize notifications
- Send local notifications
- Subscribe to events
- Notification channels (Android)
```

---

### 5. Context Layer (contexts/)

React Contexts para dados compartilhados não-persistentes.

#### ThemeContext

```tsx
// Fornece:
- isDark: boolean
- theme: Theme (colors, spacing, etc)
- toggleTheme: () => void
```

---

### 6. Utilities & Constants (utils/, constants/)

Funções auxiliares e constantes.

```
utils/
├── errorHandler.ts   → Error handling, retry logic
├── storage.ts        → AsyncStorage helpers
└── validation.ts     → Input validation, sanitization

constants/
├── colors.ts         → Paleta de cores
├── layout.ts         → Spacing, fonts, shadows
└── challenges.ts     → Definição de desafios
```

---

## Data Flow

```
User Action
    ↓
Screen Component
    ↓
Store (Zustand)
    ↓
Service (API/Notification)
    ↓
External Resource
```

### Exemplo Completo: Fetch de Veículos

```tsx
// 1. User Action: Screen mounted
useEffect(() => {
  fetchVehicles();
}, []);

// 2. Screen calls store action
const { setLoading, setError, setVehicles } = useVehicleStore();

// 3. Action calls service
async function fetchVehicles() {
  setLoading(true);
  try {
    const data = await apiService.getVehicles();
    setVehicles(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

// 4. Service makes request
// - Checks cache first
// - Makes HTTP request with retry
// - Stores in cache
// - Returns data

// 5. Store updates state
// - Triggers re-render
// - Data persists to AsyncStorage

// 6. Component re-renders with new data
```

---

## Padrões de Design

### 1. Custom Hooks

Para lógica reutilizável:

```tsx
export const useVehicleData = () => {
  const store = useVehicleStore();
  
  return {
    ...store,
    hasOfflineData: store.vehicles.length > 0,
    isStale: checkIfStale(),
  };
};
```

### 2. HOC (Higher-Order Components)

Para wrapping com funcionalidade adicional:

```tsx
export const withDataFetching = <P extends object>(
  Component: React.ComponentType<P>,
  dataFetcher: () => Promise<void>
) => {
  return (props: P) => {
    // Fetch data, handle loading/error
    return <DataContainer>
      <Component {...props} />
    </DataContainer>;
  };
};
```

### 3. Error Boundaries

Para capturar erros:

```tsx
<ErrorBoundary 
  onError={logError}
  fallback={<ErrorUI />}
>
  <RiskyComponent />
</ErrorBoundary>
```

---

## State Management Best Practices

### ✅ Use Store Para:
- User preferences
- App-wide state (theme, selected challenge)
- Vehicle data
- Cache/offline data

### ✅ Use Context Para:
- Theme/styling
- Language/localization
- Auth state

### ✅ Use Component State Para:
- UI state (form inputs, modal open/close)
- Local animations
- Temporary data

---

## API Integration Pattern

```tsx
// services/apiService.ts
export const apiService = {
  getVehicles: async (forceRefresh = false) => {
    // 1. Check cache
    if (!forceRefresh) {
      const cached = await retrieveData(CACHE_KEY);
      if (cached && !isStale(cached)) return cached;
    }
    
    // 2. Make request with retry
    const data = await retryWithBackoff(
      () => fetch(url),
      maxRetries
    );
    
    // 3. Cache result
    await storeData(CACHE_KEY, data);
    
    return data;
  },
};
```

---

## Error Handling Strategy

```
Network Error
    ↓
    ├─ Retry with backoff (3x)
    ├─ If all fail → Offline mode
    ├─ Show error in UI
    └─ Log to error service

Validation Error
    ↓
    ├─ Sanitize input
    ├─ Show validation message
    └─ Don't proceed

Runtime Error
    ↓
    ├─ Error Boundary catches
    ├─ Log to service
    ├─ Show fallback UI
    └─ User can retry
```

---

## Performance Optimization

### 1. Memoization

```tsx
import React from 'react';

export const VehicleCard = React.memo(({ vehicle }) => (
  <View>{/* render */}</View>
), (prev, next) => prev.vehicle.id === next.vehicle.id);
```

### 2. Lazy Loading

```tsx
const VehicleList = lazy(() => import('./VehicleList'));

<Suspense fallback={<Loading />}>
  <VehicleList />
</Suspense>
```

### 3. Selective Subscriptions

```tsx
const { vehicles, loading } = useVehicleStore(
  useShallow((state) => ({
    vehicles: state.vehicles,
    loading: state.loading,
  }))
);
```

---

## Testing Strategy

### Unit Tests
```tsx
describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
});
```

### Component Tests
```tsx
describe('Loading Component', () => {
  it('should show message', () => {
    render(<Loading message="Carregando" />);
    expect(screen.getByText('Carregando')).toBeTruthy();
  });
});
```

### Integration Tests
```tsx
describe('Vehicle Flow', () => {
  it('should fetch and display vehicles', async () => {
    // Setup, render, assert
  });
});
```

---

## Deployment Architecture

```
┌──────────────────┐
│   EAS Build      │
├──────────────────┤
│  iOS/Android     │
│   APK/IPA        │
├──────────────────┤
│  EAS Submit      │
├──────────────────┤
│ App Store        │
│ Play Store       │
└──────────────────┘
```

---

## Security Considerations

### ✅ Fazer:
- Validate all API responses
- Sanitize user input
- Use HTTPS for APIs
- Rate limit requests
- Encrypt sensitive data

### ❌ Evitar:
- Store sensitive data in AsyncStorage
- Hardcode API keys
- Trust user input
- Log sensitive information

---

## Scaling Considerations

### Quando adicionar nova feature:

1. **Avalie onde colcar o estado:**
   - Global? → Store
   - Shared? → Context
   - Local? → Component state

2. **Crie o componente:**
   - Em `components/`
   - Com types TypeScript
   - Com documentação

3. **Integre com services:**
   - Crie service em `services/` se necessário
   - Adicione cache se aplicável
   - Implemente error handling

4. **Atualize temas/constants:**
   - Adicione cores em `constants/colors.ts`
   - Spacing em `constants/layout.ts`

5. **Documente:**
   - JSDoc no componente
   - Update COMPONENTS.md
   - Update ARCHITECTURE.md se necessário

---

## Debugging

### Debug Store
```tsx
// Log all state changes
useVehicleStore.subscribe(
  (state) => console.log('Store:', state)
);
```

### Debug Network
```tsx
// Inspect all API calls
console.log('Request:', url);
console.log('Response:', data);
console.log('Cache hit:', fromCache);
```

### React DevTools
```bash
npm install react-devtools
```

---

## Referências

- [Expo Architecture](https://docs.expo.dev/versions/v56.0.0/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Zustand Architecture](https://github.com/pmndrs/zustand)

---

**Última atualização:** Maio 2026
