# 🚀 Quick Start Guide

Guia rápido para começar a desenvolver com o Ford Challenge Mobile App.

## ⚡ Instalação (2 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm start
```

## 📱 Rodar a Aplicação

```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web
npm run web

# Ou abrir QR code no Expo Go
npm start
```

## 📝 Criar Nova Tela

```tsx
// src/app/my-screen.jsx
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function MyScreen() {
  const { theme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Minha Tela
      </Text>
    </View>
  );
}
```

## 🧩 Criar Novo Componente

```tsx
// src/components/my-component.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={{ color: theme.colors.text }}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
});
```

## 🗄️ Usar Store Global

```tsx
import { useVehicleStore } from '@/store/vehicleStore';

function MyComponent() {
  const { vehicles, setVehicles, loading } = useVehicleStore();
  
  // Use o estado global
  return <Text>{vehicles.length} veículos</Text>;
}
```

## 🔌 Fazer Chamada API

```tsx
import { apiService } from '@/services/apiService';

async function loadData() {
  try {
    const vehicles = await apiService.getVehicles();
    console.log(vehicles);
  } catch (error) {
    console.error(error);
  }
}
```

## 📢 Enviar Notificação

```tsx
import { sendLocalNotification } from '@/services/notificationService';

await sendLocalNotification({
  title: 'Título',
  body: 'Corpo da notificação',
  delay: 2, // segundos
});
```

## ✔️ Validar Dados

```tsx
import { validateInput, sanitizeString } from '@/utils/validation';

const emailValidation = validateInput.email('user@example.com');
if (emailValidation.valid) {
  // Email válido
} else {
  console.error(emailValidation.error);
}

const clean = sanitizeString('<script>alert("XSS")</script>');
// Result: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

## 🎨 Usar Tema

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme, isDark } = useTheme();

// Cores
theme.colors.primary
theme.colors.background
theme.colors.text

// Espaçamento
theme.spacing.sm // 8
theme.spacing.md // 12
theme.spacing.lg // 16

// Tipografia
theme.fontSize.base // 16
theme.fontWeight.bold // '700'
```

## 🧪 Linting

```bash
npm run lint
```

## 📁 Estrutura de Pastas

```
src/
├── app/           → Telas (Expo Router)
├── components/    → Componentes reutilizáveis
├── store/         → Estado global (Zustand)
├── services/      → APIs e serviços
├── contexts/      → React Contexts
├── constants/     → Constantes (cores, layout, etc)
├── hooks/         → Custom hooks
└── utils/         → Funções auxiliares
```

## 🎯 Desafios Disponíveis

```tsx
import { useChallengeStore } from '@/store/challengeStore';
import { ChallengeType } from '@/constants/challenges';

const { setSelectedChallenge } = useChallengeStore();

// Selecionar desafio
setSelectedChallenge(ChallengeType.COMPETITIVE_INTELLIGENCE);
```

## 🔍 Debug

### Inspecionar Store
```tsx
useVehicleStore.subscribe(state => {
  console.log('Novo estado:', state);
});
```

### Logs de Erro
```tsx
import { getErrorMessage } from '@/utils/errorHandler';

try {
  // algo
} catch (error) {
  console.error(getErrorMessage(error));
}
```

## 📚 Documentação

- [README.md](./README.md) - Setup e guia completo
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura
- [COMPONENTS.md](./COMPONENTS.md) - Componentes
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Sumário

## 🆘 Troubleshooting

### Erro: "Module not found"
```bash
npm install
```

### Erro: "Cannot find theme"
Certifique-se de que o componente está dentro de `<ThemeProvider>`.

### Erros de TypeScript
```bash
npm run lint
```

### Cache corrompido
```bash
npm start -- --reset-cache
```

---

**Pronto para começar!** 🚀

Consulte a documentação completa em [README.md](./README.md) para mais detalhes.
