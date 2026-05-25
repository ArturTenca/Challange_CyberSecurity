# Sprint Cybersecurity

Aplicativo Expo local-first para demonstração da Ford Ranger Raptor, com login local por contas demo, navegação protegida por papéis e dados carregados do próprio app.

## Estado atual

- O projeto roda sem API e sem backend.
- O login usa contas demo locais persistidas com armazenamento seguro em `src/services/authService.ts` e `src/security/secureStorage.ts`.
- A navegação protegida continua em `src/contexts/AuthContext.tsx` e `src/app/_layout.jsx`.
- Os dados da tela de especificações são locais em `src/data/fordData.js`.

## Como executar

```bash
npm install
npm start
```

Atalhos úteis:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Contas de demonstração

| Email | Senha | Papel |
|-------|-------|-------|
| admin@ford.demo | Ford@2026 | administrador |
| analista@ford.demo | Ford@2026 | analista |
| usuario@ford.demo | Ford@2026 | usuario |

## Estrutura principal

```text
src/
	app/           telas Expo Router
	components/    componentes visuais e 3D
	config/        configuracoes locais de seguranca e demo
	contexts/      auth e tema
	data/          dados locais do veiculo
	hooks/         hooks de RBAC, tema e cor
	security/      logger, storage seguro, anonimização e retenção local
	services/      autenticacao local e notificacoes
	store/         estado global
	utils/         validacao, persistencia e tratamento de erro
```

## Segurança aplicada no app

- Validação e sanitização de entrada em `src/utils/validation.ts` e `src/security/inputGuards.ts`.
- Persistência de sessão em `src/security/secureStorage.ts`.
- Controle de acesso por papel em `src/contexts/AuthContext.tsx` e `src/hooks/useRBAC.ts`.
- Auditoria local sem PII em `src/security/auditClient.ts`.
- Logging seguro no cliente em `src/security/secureLogger.ts`.

## Observações

- O backend legado foi removido do workspace para eliminar dependência de API e reduzir superfície de ataque.
- O app não precisa de `.env` para autenticação nem para dados principais.
