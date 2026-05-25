# Guia de Segurança

Estado atual do projeto após limpeza: app Expo local-only, sem backend e sem tráfego de API.

## Controles ativos

| Controle | Onde está |
|----------|-----------|
| Validação de email, senha e campos | `src/utils/validation.ts` |
| Sanitização e proteção contra entradas suspeitas | `src/security/inputGuards.ts` |
| Persistência de sessão no dispositivo | `src/security/secureStorage.ts` |
| Controle de acesso por papel | `src/contexts/AuthContext.tsx`, `src/hooks/useRBAC.ts` |
| Auditoria local sem PII | `src/security/auditClient.ts` |
| Logging seguro | `src/security/secureLogger.ts` |
| Retenção e descarte local | `src/security/dataRetention.ts` |
| Anonimização utilitária | `src/security/anonymize.ts` |

## Autenticação

- O login é local e usa contas demo fixas definidas em `src/config/security.ts`.
- A senha demo atual é `Ford@2026`.
- A sessão autenticada é persistida localmente em chaves próprias do app.
- Não há JWT, refresh token, HMAC ou comunicação com servidor.

## Boas práticas aplicadas

- `.gitignore` cobre `.env`, variantes locais e arquivos comuns de credenciais.
- O projeto não depende de segredos embarcados em `app.json`.
- O backend legado foi removido para reduzir superfície de ataque e risco de vazamento.
- Os logs de cliente evitam registrar material sensível.

## Contas demo

| Email | Papel |
|-------|-------|
| admin@ford.demo | administrador |
| analista@ford.demo | analista |
| usuario@ford.demo | usuario |

## Checklist atual

- [x] Validação de entrada
- [x] Sanitização de dados
- [x] Sessão local persistida
- [x] RBAC no cliente
- [x] Auditoria local
- [x] Logs seguros
- [x] Sem dependência de API
- [x] Sem segredos versionados para autenticação
