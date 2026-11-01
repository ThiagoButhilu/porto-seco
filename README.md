# Porto Seco · Averbação de documentos

Módulo de um sistema para recinto alfandegado (Porto Seco). Ele permite **averbar documentos de importação** (vincular uma DTA a uma DI ou DUIMP, com os arquivos) e **consultar os documentos enviados**.

> Desafio técnico: UI Designer + Frontend Developer Pleno.

## Como rodar

Requer Node 20+.

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 (rotas: `/login`, `/dashboard`, `/endorsements`, `/documents`). Login: **qualquer e-mail válido e senha com 6+ caracteres**.

| Comando | O que faz |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build && npm start` | Build de produção |
| `npm run lint` | ESLint |

### Dados para testar

| O quê | Valor |
|---|---|
| DTAs existentes | `25/0412387-3` (marítimo), `25/0398451-0` (aéreo), `25/0501276-8` (rodoviário), `25/0377002-5`, `25/0455910-2`, `25/0520033-7`, `25/0489164-4`, `25/0433718-9` |
| DTA inexistente (erro 404) | qualquer outro número, ex.: `25/9999999-9` |
| Forçar erro no processamento | escreva `FALHA` no **código de referência** |
| Erro de login (401) | senha `senhaerrada` |

A API simulada também tem falhas aleatórias, para exercitar o tratamento de erro: cerca de 6% dos uploads e 20% dos processamentos falham.

---

## Contexto do domínio

- **Porto Seco:** recinto alfandegado no interior, onde cargas importadas ficam armazenadas até a liberação pela Receita Federal.
- **DTA (Declaração de Trânsito Aduaneiro):** autoriza a carga a sair do porto ou aeroporto até o Porto Seco sem ter sido nacionalizada. É a chave de entrada do fluxo.
- **DI (Declaração de Importação):** declaração tradicional de desembaraço, registrada no Siscomex.
- **DUIMP (Declaração Única de Importação):** o novo modelo do Portal Único Siscomex, que está substituindo a DI.
- **Averbação:** o registro, no recinto, de qual declaração (DI/DUIMP) nacionaliza a carga daquela DTA.

---

## Stack e bibliotecas

**Obrigatórias:** React 19, Next.js 15 (App Router), TypeScript e SCSS Modules.

| Biblioteca | Por quê |
|---|---|
| **Zustand** | Estado global pequeno e explícito: a fila de envios, a sessão e os toasts. A fila precisa viver **fora do ciclo de vida dos componentes**: trocar de tela não pode cancelar um envio. Com Zustand as ações rodam fora do React (`getState()`), sem providers aninhados. |
| **TanStack Query** | Estado de servidor (cache, loading/erro, retry, invalidação, polling). Evita reimplementar à mão `isLoading`/`error` em toda tela e separa o estado de servidor do estado de UI. |
| **React Hook Form + Zod** | Formulários performáticos (inputs não controlados) com o schema de validação **no domínio**. As mesmas regras validam o formulário e controlam o botão de envio. |
| **MSW** | Simula a API REST na camada de rede: o código da aplicação faz `fetch` real para `/api/...` sem saber que é mock. Para trocar por um backend real, basta desligar o mock. |
| **clsx** | Composição condicional de classes CSS Modules. |

Não usei biblioteca de componentes nem de ícones. O design system (tokens, componentes e ícones SVG) foi feito do zero, porque a avaliação também é de UI.

---

## Arquitetura

Clean Architecture aplicada ao frontend: as dependências apontam **para dentro** (UI → aplicação → domínio). A infraestrutura implementa os contratos do domínio.

```
src/
├── domain/                 # Regras de negócio puras (sem React, sem fetch)
│   ├── entities/           # Dta, EndorsedDocument, NewEndorsement, TransportMode...
│   ├── repositories.ts     # Contratos (ports) consumidos pela aplicação
│   └── validation/         # Máscaras (DTA/DI/DUIMP) e schemas Zod
│
├── application/            # Casos de uso
│   └── endorsement/submitEndorsement.ts   # POST → 202 → polling de status
│
├── infra/                  # Detalhes de implementação
│   ├── http/httpClient.ts  # fetch + ApiError + mensagens padrão
│   ├── repositories/       # Implementações HTTP dos contratos
│   ├── session/            # Cookie de sessão
│   └── container.ts        # Composition root (injeção de dependências)
│
├── features/               # Módulos de tela (componentes, hooks, stores)
│   ├── auth/  dashboard/  endorsement/  documents/  layout/
│
├── shared/                 # Reutilizável e agnóstico de feature
│   ├── ui/                 # Design system: Button, TextField, Select, FileDropzone, Modal...
│   ├── components/         # Componentes de domínio compartilhados (StatusBadge, ModalTag)
│   ├── styles/             # Tokens (CSS custom properties) + mixins SCSS
│   ├── hooks/  lib/
│
├── mocks/                  # MSW: handlers, "banco" em memória, massa de dados
├── middleware.ts           # Proteção de rotas autenticadas
└── app/                    # Rotas do Next (finas: só compõem features)
```

**Regras que segui:**
- **Código em inglês, interface em português.** Identificadores, comentários, rotas e contratos da API estão em inglês. Os textos exibidos ao usuário e as mensagens de erro ficam em português, porque o sistema é usado por operadores brasileiros. Termos do domínio aduaneiro sem tradução exata mantêm a sigla (DTA, DI, DUIMP) e aparecem explicados nos comentários: averbação = `endorsement`, comissária = `customs broker`, conhecimento = `bill of lading`.
- `app/` só monta páginas; nenhuma regra de negócio mora em rotas.
- As telas acessam dados por **hooks** (`useDocuments`, `useDta`...). Os hooks chamam **repositórios** pelo `container`, e nenhum componente chama `fetch` direto.
- O caso de uso `submitEndorsement` não conhece React nem Zustand: recebe o repositório e um callback de progresso. Isso permite testá-lo isoladamente.
- Validações e máscaras ficam no domínio e são reutilizadas no formulário, na busca e no mock.

---

## Decisões sobre os envios

Requisitos: vários envios por expediente, um envio em andamento não bloqueia outro, falhas são isoladas, cada envio tem seu status.

1. **Fila de envios no Zustand (`features/endorsement/store/submissionsStore.ts`).** Cada envio é um item com `stage` própria (`SENDING → PROCESSING → COMPLETED | FAILED`). `start()` dispara o caso de uso em *fire-and-forget* e retorna na hora, então não existe um "envio atual" que trave a tela.
2. **Processamento assíncrono realista.** O POST devolve `202 Accepted` com um id, e o caso de uso faz *polling* do status. Isso imita backends reais de processamento de documentos, em que a validação na Receita não é instantânea.
3. **Isolamento de falhas.** O caso de uso **nunca lança exceção**: qualquer erro (rede, 4xx/5xx, timeout, falhas seguidas no polling) vira a etapa `ERRO` daquele item. Um envio com problema não afeta os outros.
4. **Tentar novamente sem redigitar.** O payload (inclusive os `File`s) fica em memória no item da fila, e o botão "Tentar novamente" reexecuta só aquele envio.
5. **Formulário liberado logo após enviar.** Depois do envio o fluxo volta ao passo 1, com foco no campo da DTA, para o operador averbar a próxima carga enquanto as anteriores processam.
6. **Feedback em qualquer tela.**
   - Na página de averbação: painel lateral "Envios da sessão", com barra de etapas por item.
   - Nas outras telas: botão **Envios** no topo, com contador de ativos, que abre um drawer.
   - Ao terminar: toast de sucesso ou erro, e invalidação do cache do dashboard e da consulta.
   - Dashboard e consulta fazem polling automático enquanto existir documento "Processando".
7. **Botão de envio desabilitado com campos inválidos.** O formulário valida o schema inteiro a cada mudança e mostra *quantas* pendências faltam ("2 pendentes"). Os erros por campo só aparecem depois que o usuário toca o campo, para não exibir uma tela cheia de vermelho logo ao abrir.

---

## Validações

| Campo | Regra |
|---|---|
| E-mail | Obrigatório, formato válido, até 100 caracteres |
| Senha | 6 a 32 caracteres, com contador |
| DTA / DI | Máscara `25/0000000-1` |
| DUIMP | Máscara `26BR0000123456-7` (letras convertidas para maiúsculas) |
| Chave de acesso | 6 a 60 caracteres alfanuméricos, sem espaços |
| Código de referência | Opcional, até 30 caracteres (letras, números, `- _ / .`) |
| PDF / XML | Extensão correta, não vazio, até 10 MB (PDF) e 5 MB (XML) |
| Comissária | Obrigatória |

As máscaras (`domain/validation/masks.ts`) são um formatador genérico (`9` = dígito, `A` = letra), reutilizado pelo componente `TextField` via prop `mask`.

> **Decisão:** o enunciado lista para DI apenas os arquivos PDF e XML, mas a consulta exige buscar pelo número da DI e há máscara definida para ela. Por isso adicionei o campo **Número da DI**. Numa integração real, ele poderia ser extraído do próprio XML.

---

## UI / UX

- **Identidade:** azul-marinho institucional e âmbar de sinalização (referência a pátios de contêineres e faixas de segurança). Tipografia IBM Plex Sans, com **IBM Plex Mono** para números de documentos, o que facilita conferir dígitos.
- **Tokens:** cores, espaçamentos, raios e sombras definidos como CSS custom properties em `shared/styles/globals.scss`. Breakpoints e mixins ficam em `_mixins.scss`.
- **Estados em todas as telas:** skeletons no carregamento; erro com ação de "Tentar novamente"; vazio com orientação; sucesso via toast e badge.
- **Responsividade:**
  - Sidebar vira drawer no mobile.
  - A tabela de documentos vira lista de cartões abaixo de 1024px, com **a mesma marcação** (cada célula usa `data-label`).
  - O formulário passa para uma coluna no celular.
- **Acessibilidade:**
  - Labels associados aos campos, `aria-invalid`/`aria-describedby` nas mensagens de erro e foco visível.
  - Link "pular para o conteúdo" e `<dialog>` nativo, que dá foco preso e fecha com ESC.
  - Status sempre com ícone e texto, nunca só cor.
  - O gráfico tem tabela equivalente para leitores de tela.
- **Gráficos:** feitos em CSS/HTML puro, sem biblioteca. As cores das modalidades seguem uma paleta categórica validada para daltonismo, sempre na mesma ordem.
- **Busca:** campo único, debounce de 350 ms, aceita o número com ou sem pontuação e trechos parciais. O termo fica na URL (`?q=`), então a busca pode ser compartilhada e é preservada ao voltar.

---

## API simulada (MSW)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Autenticação simulada |
| GET | `/api/dtas/:number` | Consulta DTA (404 se não existir) |
| GET | `/api/customs-brokers` | Lista de comissárias |
| POST | `/api/endorsements` | Upload multipart → `202 { id, status }` |
| GET | `/api/endorsements/:id/status` | Status do processamento |
| GET | `/api/documents?q=` | Busca por DTA/DI/DUIMP |
| GET | `/api/files/:id` | Conteúdo do arquivo (visualizar/baixar) |
| GET | `/api/dashboard/stats` | Indicadores agregados |

- Os metadados ficam no `localStorage` e os arquivos enviados no **IndexedDB**, então tudo sobrevive a um reload. Os documentos de exemplo geram PDF e XML válidos na hora.
- Se o navegador não permitir Service Worker (aba anônima do Firefox, webviews, políticas corporativas), o mock passa a interceptar o `fetch` com os mesmos handlers.
- Para limpar os dados: DevTools → Application → Clear site data.

---

## Próximos passos

- Testes unitários: máscaras, schemas e o caso de uso `submitEndorsement` (que já é isolável). Testes E2E com Playwright para o fluxo de averbação.
- Paginação e filtros (status, modal, período) na consulta.
- Persistir a fila de envios para sobreviver a um reload. Hoje os `File`s ficam apenas em memória.
- Permissões por perfil de usuário (operador, despachante, administrador).
