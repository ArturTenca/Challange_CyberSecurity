# Sprint Cybersecurity

Projeto hospedado: [https://SEU-LINK-AQUI.example.com](https://SEU-LINK-AQUI.example.com)

Este projeto foi estruturado como uma aplicação Expo no cliente e uma API Node.js/Express no servidor, com foco em controles de segurança aplicados no fluxo completo entre interface, autenticação, consumo de API, armazenamento e auditoria. O objetivo do trabalho foi atender aos requisitos do sprint de cybersecurity com implementação prática, e não apenas com validações superficiais no front-end.

## Visão Geral do Que Foi Feito

O app em `src/` concentra a experiência do usuário, o armazenamento seguro local, a assinatura de payloads e a proteção das chamadas de API. A API em `server/src/` concentra a validação definitiva de entrada, autenticação com JWT e 2FA, RBAC, políticas de proteção HTTP, retenção de dados, anonimização, logs seguros e trilha de auditoria.

Na prática, a segurança foi distribuída em duas camadas:

- Cliente: bloqueia entradas perigosas cedo, normaliza parâmetros, exige uso de canais seguros e assina requisições sensíveis.
- Servidor: revalida tudo com regras estritas, aplica autenticação/autorização, limita abuso e protege dados, logs e respostas.

## Atendimentos aos Requisitos do Professor

### 1. Segurança de Entrada e Validação de Dados

O projeto implementa validação e sanitização tanto no cliente quanto no servidor para evitar confiar apenas em validações visuais. No app, `src/security/inputGuards.ts` bloqueia padrões suspeitos associados a SQL Injection, XSS, command injection, path traversal e entradas malformadas. Em `src/security/apiParams.ts`, os parâmetros `marca`, `modelo` e `versao` são normalizados, têm espaços tratados e só passam se seguirem regex fechadas.

No servidor, `server/src/middleware/validateInput.js` faz a validação final com Zod. Esse middleware verifica tamanho máximo de strings, faz varredura recursiva no payload, rejeita padrões maliciosos e aplica schemas formais para query string e corpo da requisição. Também há limite de payload em `64kb` no `express.json` e checagem de `content-length`, reduzindo risco de payload flooding e abuso por entradas excessivas.

O tratamento de erro também foi endurecido. Em `server/src/middleware/secureErrorHandler.js`, as respostas públicas retornam apenas mensagens genéricas e um `requestId`, sem expor stack trace, estrutura interna ou detalhes da tecnologia. Os detalhes completos ficam restritos aos logs internos.

### 2. Autenticação e Autorização

A autenticação foi implementada com JWT no backend e fluxo de duas etapas. Em `server/src/routes/auth.js`, o login valida credenciais, cria um desafio de 2FA e só depois emite `accessToken` e `refreshToken`. O token de acesso expira em curto prazo (`expiresIn: 900`), e a renovação ocorre de forma controlada via endpoint de refresh. A assinatura dos tokens é feita com segredo dedicado no servidor.

No cliente, `src/services/authService.ts` organiza esse fluxo em duas fases: `requestLogin` e `verify2FA`. Os tokens e dados de sessão são persistidos com armazenamento seguro por meio de `src/security/secureStorage.ts`, evitando dependência de armazenamento inseguro para material sensível.

O controle de acesso baseado em papéis foi implementado com três perfis: `administrador`, `analista` e `usuario`. No backend, `server/src/middleware/rbac.js` define as permissões por papel e protege rotas críticas com `requirePermission` e `requireRole`. No frontend, `src/contexts/AuthContext.tsx` replica a matriz de permissões para esconder ações que o usuário não deveria nem tentar executar, enquanto a API mantém a decisão final.

### 3. Proteção de APIs e Serviços

O uso de HTTPS foi tratado como requisito de infraestrutura e também de código. No cliente, `src/services/secureApiClient.ts` rejeita URLs inseguras fora de ambiente local. No servidor, `server/src/middleware/httpsOnly.js` é aplicado globalmente para exigir HTTPS em produção. Com isso, o projeto garante o desenho de comunicação segura entre app e API quando implantado corretamente com TLS 1.2+.

Para reduzir abuso e scraping, o servidor usa `express-rate-limit` em `server/src/index.js`, com um limitador global e outro específico para autenticação. No cliente, `RateLimiter` em `src/utils/validation.ts` também reduz disparos excessivos do app antes mesmo de a requisição sair.

O CORS foi configurado de forma restrita em `server/src/index.js`, aceitando apenas origens explicitamente autorizadas em configuração. Requisições fora da lista retornam erro controlado de origem não autorizada.

Para integridade de payload, o projeto implementa assinatura HMAC. O cliente assina o corpo da requisição em `src/security/payloadIntegrity.ts` e anexa `X-Payload-Signature` e `X-Payload-Timestamp`. No servidor, `server/src/middleware/payloadSignature.js` recalcula a assinatura com `sha256`, valida o timestamp e compara os bytes com `timingSafeEqual`, evitando manipulação de dados em trânsito e reduzindo risco de replay fora da janela permitida.

### 4. Segurança de Dados e Privacidade

Dados sensíveis em repouso são protegidos no backend. O serviço `server/src/services/encryption.js` usa `AES-256-GCM` para criptografar campos confidenciais antes do armazenamento. Isso cobre o requisito de proteção de dados de clientes, leads e informações correlatas em repouso.

A política de retenção e descarte seguro foi implementada em `server/src/services/dataRetention.js`. Esse serviço remove registros expirados de leads, histórico de manutenção e logs de auditoria com base em janelas configuráveis. O purge é executado no boot do servidor, de forma agendada, e também pode ser acionado manualmente em rota administrativa.

A anonimização e pseudonimização foram aplicadas para usos analíticos. Em `server/src/services/anonymization.js`, identificadores são convertidos em hash e dados pessoais são reduzidos a campos úteis para ML e dashboard, sem expor PII diretamente. A rota `GET /api/leads/analytics` entrega exatamente essa visão anonimizada.

Também houve cuidado para evitar exposição acidental de dados. Em `server/src/services/logger.js`, campos sensíveis como senha, token, e-mail, telefone e identificadores pessoais são mascarados ou removidos antes do log. No cliente, `src/security/secureLogger.ts` e `src/security/auditClient.ts` seguem a mesma linha de registrar evento sem vazar informação sensível.

### 5. Monitoramento, Logs e Auditoria

Os logs foram estruturados com `winston` em `server/src/services/logger.js`, com saída em JSON, timestamp e sanitização automática de conteúdo sensível. Isso garante rastreabilidade sem transformar o log em vetor de exposição de dados.

O monitoramento de eventos suspeitos foi implementado em `server/src/services/securityMonitor.js`. O projeto registra repetição de falhas de autenticação, detecta anomalias como tentativa de consulta massiva e emite eventos de segurança específicos para investigação posterior.

Por fim, a trilha de auditoria foi implementada em `server/src/services/auditLog.js` e acionada em pontos críticos do fluxo. São auditados eventos como emissão de desafio 2FA, login bem-sucedido, criação de lead, listagem de leads, consultas massivas e execuções de retenção de dados. A rota administrativa `GET /api/admin/audit` restringe a consulta desses eventos ao papel de administrador.

## Conclusão

O projeto atende ao sprint porque não trata segurança como uma única feature isolada. A solução combina validação de entrada, autenticação forte, RBAC, proteção de transporte, integridade de payload, criptografia, retenção, anonimização, logging seguro e auditoria distribuídos entre app e backend.

Em resumo, o que foi feito neste projeto foi a construção de um fluxo seguro de ponta a ponta: o cliente prepara e protege as requisições, e o servidor valida, autoriza, registra, monitora e protege os dados ao longo de todo o ciclo de uso.
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
