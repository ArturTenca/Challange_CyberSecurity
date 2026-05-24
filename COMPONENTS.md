# Documentação de Componentes 📚

Guia completo de todos os componentes reutilizáveis disponíveis no projeto Ford Challenge Mobile App.

## Sumário

- [UI Primitivos](#ui-primitivos)
- [Containers](#containers)
- [Componentes Específicos](#componentes-específicos)
- [Padrões de Uso](#padrões-de-uso)

---

## UI Primitivos

### Loading Component

Componente de carregamento com spinner e mensagem.

```tsx
import { Loading } from '@/components/ui/loading';

<Loading 
  size="large"
  message="Carregando dados..."
  color="#003478"
/>
```

**Props:**
- `size?: 'small' | 'large'` - Tamanho do spinner (padrão: 'large')
- `color?: string` - Cor do spinner (padrão: tema primary)
- `message?: string` - Mensagem de carregamento

---

### Skeleton Component

Componente de placeholder para efeito de carregamento.

```tsx
import { Skeleton } from '@/components/ui/loading';

<View style={{ gap: 12 }}>
  <Skeleton width="100%" height={24} borderRadius={8} />
  <Skeleton width="80%" height={16} borderRadius={4} />
  <Skeleton width="90%" height={16} borderRadius={4} />
</View>
```

**Props:**
- `width?: number | string` - Largura (padrão: '100%')
- `height?: number` - Altura (padrão: 16)
- `borderRadius?: number` - Border radius (padrão: 8)

---

### ErrorComponent

Componente para exibir erros com opção de retry.

```tsx
import { ErrorComponent } from '@/components/ui/error';

<ErrorComponent 
  title="Erro ao carregar"
  message="Não foi possível conectar ao servidor"
  onRetry={() => refetch()}
  showRetry={true}
/>
```

**Props:**
- `title?: string` - Título do erro (padrão: 'Erro')
- `message: string` - Mensagem de erro (obrigatório)
- `onRetry?: () => void` - Callback para retry
- `showRetry?: boolean` - Mostrar botão retry (padrão: true)

---

### ErrorBoundary

Componente de boundary para capturar erros da aplicação.

```tsx
import { ErrorBoundary } from '@/components/ui/error';

<ErrorBoundary 
  onError={(error) => console.error(error)}
  fallback={<CustomErrorUI />}
>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children: React.ReactNode` - Componentes filhos (obrigatório)
- `fallback?: React.ReactNode` - UI customizada de erro
- `onError?: (error: Error) => void` - Callback de erro

---

## Containers

### DataContainer

Container para gerenciar estados de loading e erro.

```tsx
import { DataContainer } from '@/components/data-container';

<DataContainer 
  isLoading={loading}
  error={error}
  onRetry={handleRetry}
  loadingMessage="Buscando veículos..."
>
  <VehicleList vehicles={vehicles} />
</DataContainer>
```

**Props:**
- `isLoading: boolean` - Flag de carregamento
- `error: string | null` - Mensagem de erro
- `onRetry?: () => void` - Callback de retry
- `children: React.ReactNode` - Componentes filhos
- `loadingMessage?: string` - Mensagem de loading

---

### withDataFetching (HOC)

Higher-Order Component para wrapping com lógica de fetch.

```tsx
import { withDataFetching } from '@/components/data-container';

const MyComponent = ({ data }) => (
  <FlatList data={data} renderItem={...} />
);

export default withDataFetching(
  MyComponent,
  async () => {
    const data = await apiService.getVehicles();
    useVehicleStore.setState({ vehicles: data });
  }
);
```

---

### ChallengeSelector

Componente para seleção do desafio da aplicação.

```tsx
import ChallengeSelector from '@/components/challenge-selector';

<ChallengeSelector />
```

**Funcionalidades:**
- Exibe todos os desafios disponíveis
- Mostra descrição e features de cada desafio
- Permite seleção e navegação automática

---

## Componentes Específicos

### Como Adicionar Novos Componentes

1. Criar arquivo em `src/components/`
2. Exportar como componente nomeado
3. Adicionar tipos TypeScript
4. Documentar props no JSDoc

### Exemplo de Estrutura

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MyComponentProps {
  title: string;
  color?: string;
  onPress?: () => void;
}

/**
 * Meu componente customizado
 * @example
 * <MyComponent title="Título" color="blue" />
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  color,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={{ color: color || theme.colors.text }}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

---

## Padrões de Uso

### 1. Usar Tema em Componentes

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ 
      backgroundColor: theme.colors.background,
      padding: theme.spacing.lg 
    }}>
      <Text style={{ color: theme.colors.text }}>
        Tema: {isDark ? 'Escuro' : 'Claro'}
      </Text>
    </View>
  );
}
```

### 2. Usar Store para Estado Global

```tsx
import { useVehicleStore } from '@/store/vehicleStore';

function VehicleList() {
  const { vehicles, loading, error } = useVehicleStore();

  return (
    <FlatList
      data={vehicles}
      renderItem={({ item }) => <VehicleCard vehicle={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

### 3. Fetch com Tratamento de Erro

```tsx
import { useVehicleStore } from '@/store/vehicleStore';
import { apiService } from '@/services/apiService';

function MyScreen() {
  const { setLoading, setError, setVehicles } = useVehicleStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <DataContainer isLoading={loading} error={error} onRetry={fetchData}>
    {/* conteúdo */}
  </DataContainer>;
}
```

### 4. Validação de Input

```tsx
import { validateInput } from '@/utils/validation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const validation = validateInput.email(text);
    setEmailError(validation.error || '');
  };

  return (
    <View>
      <TextInput 
        value={email}
        onChangeText={handleEmailChange}
      />
      {emailError && <Text style={{ color: 'red' }}>{emailError}</Text>}
    </View>
  );
}
```

### 5. Notificações

```tsx
import { sendLocalNotification } from '@/services/notificationService';

async function handleVehicleUpdate() {
  // ... atualizar veículo
  await sendLocalNotification({
    title: '✅ Veículo Atualizado',
    body: 'Suas informações foram salvoas',
    delay: 0,
  });
}
```

---

## Boas Práticas

✅ **Faça:**
- Use `useTheme()` para cores em vez de hardcoding
- Sempre trate erros com ErrorComponent ou ErrorBoundary
- Use tipos TypeScript para props
- Documente componentes com JSDoc
- Coloque componentes em pastas lógicas

❌ **Evite:**
- Hardcoded colors em styling
- Ignorar loading states
- Props sem tipos
- Componentes muito grandes (>300 linhas)
- API calls diretas sem store

---

## Troubleshooting

### Componente não aplica tema

Certifique-se de que está dentro de `<ThemeProvider>`:
```tsx
// ❌ Errado
<MyComponent />

// ✅ Correto
<ThemeProvider>
  <MyComponent />
</ThemeProvider>
```

### Store não atualiza na tela

Use `useShallow` do Zustand para evitar re-renders desnecessários:
```tsx
import { useShallow } from 'zustand/react';

const { vehicles, loading } = useVehicleStore(
  useShallow((state) => ({
    vehicles: state.vehicles,
    loading: state.loading,
  }))
);
```

### Erro ao usar async/await

Sempre use try/catch e trate erros no store:
```tsx
const fetchData = async () => {
  try {
    setLoading(true);
    // ... fetch
  } catch (error) {
    setError(getErrorMessage(error)); // use utility
  } finally {
    setLoading(false);
  }
};
```

---

## Recursos

- [Documentação Expo v56.0.0](https://docs.expo.dev/versions/v56.0.0/)
- [React Native Docs](https://reactnative.dev/)
- [Zustand Guide](https://github.com/pmndrs/zustand)

---

**Última atualização:** Maio 2026
