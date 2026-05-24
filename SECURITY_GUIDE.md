# Guia de Segurança – Sprint Cybersecurity

Implementação alinhada aos requisitos do sprint (validação, auth/RBAC, proteção de API, privacidade e auditoria).

## Mapa de requisitos

| Requisito | Onde está |
|-----------|-----------|
| Validação anti SQLi/XSS/command injection | `src/security/inputGuards.ts`, `server/src/middleware/validateInput.js` |
| Normalização marca/modelo/versão | `src/security/apiParams.ts`, `server` (Zod) |
| Limite de payload/tamanho | Cliente + servidor (`64kb`) |
| Erros sem vazamento de stack | `src/utils/errorHandler.ts`, `server/.../secureErrorHandler.js` |
| JWT + refresh token | `server/src/routes/auth.js`, `src/services/authService.ts` |
| **Verificação em dois fatores (2FA)** | `server/src/services/twoFactor.js`, `POST /api/auth/verify-2fa`, tela `login.jsx` |
| RBAC (admin, analista, usuário) | `server/src/middleware/rbac.js`, `src/contexts/AuthContext.tsx` |
| HTTPS/TLS | `server/src/middleware/httpsOnly.js`, `src/services/secureApiClient.ts` |
| Rate limiting | `express-rate-limit` no servidor + `RateLimiter` no app |
| CORS restrito | `server/src/index.js` |
| Assinatura HMAC de payload (5 pts) | `server/src/middleware/payloadSignature.js`, `src/security/payloadIntegrity.ts` |
| Criptografia em repouso (leads/manutenção) | `server/src/services/encryption.js` (AES-256-GCM) |
| Retenção/descarte | `server/src/services/dataRetention.js`, `src/security/dataRetention.ts` |
| Anonimização ML/dashboard | `server/src/services/anonymization.js`, `src/security/anonymize.ts` |
| Logs estruturados sem PII | `server/src/services/logger.js`, `src/security/secureLogger.ts` |
| Monitoramento de eventos suspeitos | `server/src/services/securityMonitor.js` |
| Trilha de auditoria | `server/src/services/auditLog.js`, `src/security/auditClient.ts` |

## Como executar

### 1. API (backend)

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

API em `http://localhost:3001`.

### 2. App mobile

```bash
npm install
npm start
```

Configure `app.json` → `extra.apiBaseUrl` e `extra.payloadHmacSecret` (devem ser iguais ao `.env` do servidor).

## Contas de demonstração

| Email | Senha | Papel |
|-------|-------|-------|
| admin@ford.demo | Ford@2026 | administrador |
| analista@ford.demo | Ford@2026 | analista |
| usuario@ford.demo | Ford@2026 | usuario |

## Exemplos de uso no app

```ts
import { authService } from './src/services/authService';
import { apiService } from './src/services/apiService';
import { useRBAC } from './src/hooks/useRBAC';

// Login
await authService.login('analista@ford.demo', 'Ford@2026');

// Busca segura de veículos
await apiService.searchVehiclesSecure({
  marca: 'Ford',
  modelo: 'Ranger Raptor',
  versao: '2026',
});

// RBAC em componentes
const { canReadLeads, isAdmin } = useRBAC();
```

Formulário de referência: `src/components/SecureFormExample.tsx`.

## Endpoints principais

- `POST /api/auth/login` – etapa 1: valida senha e emite desafio 2FA (sem assinatura HMAC)
- `POST /api/auth/verify-2fa` – etapa 2: valida código OTP de 6 dígitos e retorna JWT
- `POST /api/auth/refresh` – renovação de token
- `GET /api/vehicles?marca=&modelo=&versao=` – veículos (JWT + RBAC)
- `POST /api/leads` – criar lead (JWT + HMAC + criptografia em repouso)
- `GET /api/leads/analytics` – dados anonimizados para ML
- `GET /api/admin/audit` – trilha de auditoria (somente admin)

## Produção

- Defina segredos fortes em variáveis de ambiente (`JWT_SECRET`, `PAYLOAD_HMAC_SECRET`, `DATA_ENCRYPTION_KEY`).
- Habilite `NODE_ENV=production` e `TRUST_PROXY=true` atrás de um proxy HTTPS (TLS 1.2+).
- Ajuste `CORS_ORIGINS` para domínios reais do app/web.
- **Não** commite o HMAC secret no app de produção; use um BFF ou assinatura server-side.

## Checklist de entrega do sprint

- [x] Validação e sanitização de entradas
- [x] Normalização de parâmetros de API (marca/modelo/versão)
- [x] Limites de tamanho/formato
- [x] Tratamento seguro de erros
- [x] JWT com expiração + refresh
- [x] Autenticação em dois fatores (2FA / OTP)
- [x] RBAC (administrador, analista, usuário)
- [x] HTTPS obrigatório em produção
- [x] Rate limiting
- [x] CORS configurado
- [x] Assinatura/verificação de integridade de payload
- [x] Criptografia de dados sensíveis em repouso
- [x] Política de retenção
- [x] Anonimização para ML/dashboard
- [x] Logs seguros + monitoramento + auditoria
