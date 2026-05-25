# Quick Start Guide

## Instalação

```bash
npm install
```

## Executar

```bash
npm start
```

Opções por plataforma:

```bash
npm run android
npm run ios
npm run web
```

## Login demo

Use qualquer uma das contas abaixo com a senha `Ford@2026`:

- `admin@ford.demo`
- `analista@ford.demo`
- `usuario@ford.demo`

## Desenvolvimento rápido

Criar tela nova:

```tsx
import { View, Text } from 'react-native';

export default function MyScreen() {
  return (
    <View>
      <Text>Minha Tela</Text>
    </View>
  );
}
```

Usar tema:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme } = useTheme();
```

Validar dados:

```tsx
import { validateInput } from '@/utils/validation';

const emailValidation = validateInput.email('user@example.com');
```

Rodar lint:

```bash
npm run lint
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
