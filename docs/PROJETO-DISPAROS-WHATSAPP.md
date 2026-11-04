# Projeto: ZapGrupo VIP — Plataforma SaaS de Disparos WhatsApp para Grupos VIP

> Nome provisório. Documento de arquitetura, ferramentas, funcionamento, custos, precificação e passo a passo de implementação.

---

## 0. Resumo em 1 minuto

- **O que é:** um SaaS multi-tenant onde cada cliente (agência, infoprodutor, loja) faz login, conecta o próprio número de WhatsApp lendo um QR Code, importa leads (CSV/Excel), cria uma campanha com texto + imagem/vídeo e um link de grupo VIP, e o sistema dispara **de forma controlada** (fila, intervalos aleatórios, limite diário, horário comercial).
- **Diferencial:** o sistema **monitora o grupo** e sabe quem entrou. Quem recebeu a mensagem e **não entrou** em X horas recebe um **follow-up com outro texto** (até N tentativas). Depois, a campanha divulga conteúdo dentro do grupo.
- **Motor de WhatsApp:** **Evolution API** (open source, auto-hospedada, gratuita) — com opção futura de **WhatsApp Cloud API oficial (Meta)** para clientes que querem zero risco de banimento.
- **Stack:** a mesma do AgendaZap (Next.js 16 + Prisma + NextAuth + Asaas) + **PostgreSQL + Redis + BullMQ (worker)** + **MinIO/S3** para mídias, tudo numa VPS com Docker.
- **Preço sugerido:** planos de **R$ 329 / R$ 497 / R$ 997 por mês** (mensagens ilimitadas, até 10% de desconto no semestral/anual) + implantação de R$ 999 (R$ 499 + 2× R$ 250). Custo de infraestrutura por cliente fica entre R$ 5 e R$ 25/mês → margem bruta acima de 85%.

---

## 1. Avisos importantes (leia antes de tudo)

1. **Risco de banimento.** Evolution API (assim como Z-API, W-API, WPPConnect, Baileys) usa o **WhatsApp Web não oficial**. Disparo em massa para quem não tem o seu número salvo é a principal causa de banimento. O sistema precisa ter "aquecimento" de número, limites e intervalos — e o contrato com o cliente deve deixar claro que **o número é responsabilidade dele**.
2. **LGPD.** Só dispare para leads que deram **consentimento** (opt-in: formulário, compra, cadastro). O sistema deve guardar a **origem do lead**, registrar **opt-out** (palavra "SAIR"/"PARAR") e nunca mais disparar para quem saiu. Coloque isso nos Termos de Uso.
3. **Termos do WhatsApp.** A política da Meta proíbe mensagens em massa não solicitadas. A única forma 100% dentro das regras é a **Cloud API oficial** com templates aprovados (paga por mensagem). Recomendo oferecer as duas opções.
4. **Detecção de entrada no grupo.** O WhatsApp passou a usar **LID (identificador oculto)** em parte dos grupos/comunidades, então às vezes o evento de entrada chega com `xxxx@lid` em vez do telefone. O projeto prevê 3 camadas de identificação (seção 4.4) para contornar isso.

---

## 2. Ferramentas necessárias

| Camada | Ferramenta | Para quê | Custo |
|---|---|---|---|
| Front + API | **Next.js 16** (App Router, já usado no AgendaZap) | Painel do cliente, telas, rotas de API, webhooks | Grátis |
| Banco | **PostgreSQL 16** | Tenants, usuários, leads, campanhas, logs de envio | Grátis (self-host) ou Supabase/Neon |
| ORM | **Prisma 6** | Modelagem e migrações | Grátis |
| Autenticação | **NextAuth (Credentials)** + bcrypt | Login com e-mail e senha, sessão com `tenantId` | Grátis |
| Fila | **Redis 7 + BullMQ** | Fila de disparos com atraso, limite por número, retentativas | Grátis |
| Worker | **Node.js (processo separado)** | Consome a fila e chama a Evolution API 24/7 | Grátis |
| WhatsApp | **Evolution API v2** (Docker) | Conectar números por QR Code, enviar texto/imagem/vídeo, receber webhooks do grupo | Grátis (open source) |
| WhatsApp oficial (opcional) | **WhatsApp Cloud API (Meta)** | Plano "Oficial" sem risco de ban | Meta cobra por mensagem de marketing (~R$ 0,35 a 0,45 no Brasil) |
| Mídias | **MinIO** (S3 self-host) ou **Cloudflare R2** | Guardar imagens e vídeos das campanhas | R2: ~US$ 0,015/GB |
| Importação | **Papaparse** (CSV) + **SheetJS/xlsx** (Excel) + **libphonenumber-js** | Ler planilhas e normalizar números para `55DDDNUMERO` | Grátis |
| Pagamentos | **Asaas** (já integrado no AgendaZap) | Assinatura mensal recorrente (Pix, boleto, cartão) | ~R$ 1,99 por cobrança |
| Servidor | **VPS** (Hetzner, Contabo, Hostinger VPS, Magalu Cloud) 4 vCPU / 8 GB | Rodar tudo em Docker | R$ 80 a R$ 200/mês |
| Orquestração | **Docker Compose** + **Traefik** ou **Caddy** (HTTPS automático) | Subir serviços e certificado SSL | Grátis |
| Painel de deploy (opcional) | **Coolify** ou **Easypanel** | Deploy com clique, logs, backups | Grátis / ~US$ 10 |
| Monitoramento | **Uptime Kuma** + **Sentry** | Alertas de queda e erros | Grátis |
| IA (opcional) | Claude / OpenAI | Gerar variações de texto (spintax) para cada envio | Centavos por campanha |

> **Por que não Vercel?** A Vercel não roda processos contínuos (worker de fila e Evolution API precisam ficar ligados 24h). Dá para deixar o painel na Vercel e o resto na VPS, mas o mais simples e barato é **tudo na VPS**.

---

## 3. Arquitetura

```
                ┌───────────────────────────────────────────────────────────┐
                │                         VPS (Docker)                      │
 Cliente  ───►  │  Caddy (HTTPS)                                             │
 (navegador)    │     │                                                      │
                │     ▼                                                      │
                │  Next.js (painel + API)  ──►  PostgreSQL                   │
                │     │        ▲                    ▲                        │
                │     │        │ webhooks           │                        │
                │     ▼        │                    │                        │
                │   Redis ◄── BullMQ ──► Worker de disparo ──┐               │
                │                                            ▼               │
                │                                     Evolution API  ◄──► WhatsApp
                │                                     (1 instância por número)│
                │  MinIO (imagens/vídeos)                                    │
                └───────────────────────────────────────────────────────────┘
```

**Fluxo resumido:**
1. Cliente cria campanha → Next.js grava no Postgres e agenda jobs na fila (Redis).
2. Worker pega um job por vez **por número**, respeitando intervalo aleatório e limites → chama Evolution API → grava resultado.
3. Evolution API envia webhooks (mensagem entregue/lida, alguém entrou no grupo, alguém respondeu "SAIR") → Next.js atualiza o status do lead.
4. Um job agendado (a cada 15 min) verifica quem recebeu e **não entrou** depois do prazo → cria job de **follow-up** com o texto 2, 3...

---

## 4. Como tudo funciona (módulos)

### 4.1 Multi-tenant e login

- Modelo **banco compartilhado + coluna `tenantId`** em todas as tabelas (mais simples e barato que um banco por cliente).
- Cada `Tenant` (empresa cliente) tem vários `User` com papel: `OWNER`, `ADMIN`, `OPERADOR`.
- Login com e-mail + senha (bcrypt), sessão JWT do NextAuth contendo `userId`, `tenantId` e `role`.
- **Toda** consulta Prisma passa por um helper `db(tenantId)` (ou extensão do Prisma Client) que injeta `where: { tenantId }` automaticamente — evita que um cliente veja dados de outro.
- Um usuário `SUPERADMIN` (você) vê todos os tenants, planos, consumo e pode bloquear inadimplentes.
- Limites por plano (números conectados, leads, envios/mês, usuários) checados no back-end.

### 4.2 Conexão do número (Evolution API)

1. Cliente clica em **"Conectar WhatsApp"**.
2. Back-end chama `POST /instance/create` na Evolution com nome `tenant_<id>_<numero>` e já configura o webhook apontando para `https://seuapp.com/api/webhooks/evolution/<instanceToken>`.
3. Back-end chama `GET /instance/connect/{instance}` → recebe o QR Code em base64 → mostra na tela.
4. Cliente escaneia com o celular (Aparelhos conectados). Evento `CONNECTION_UPDATE` = `open` → número marcado como **Conectado**.
5. O sistema guarda a data de conexão para calcular a fase de **aquecimento** (seção 4.6).

### 4.3 Importação de leads

1. Upload de **CSV ou XLSX** (ou colar lista, ou integração via webhook/API para captar leads de formulários, Hotmart, Kiwify, RD Station etc.).
2. Tela de **mapeamento de colunas**: Nome, Telefone, E-mail, Tags, campos extras (`{cidade}`, `{produto}`).
3. Normalização com `libphonenumber-js`: remove símbolos, adiciona `55`, trata o 9º dígito.
4. **Validação opcional** no WhatsApp: `POST /chat/whatsappNumbers/{instance}` retorna quais números realmente têm WhatsApp (descarta os inválidos antes do disparo e reduz risco de ban).
5. Deduplicação por `(tenantId, telefone)`; leads em **lista de bloqueio/opt-out** são ignorados.
6. Campo obrigatório **"Origem do consentimento"** na importação (LGPD).
7. Leads organizados por **Listas** e **Tags**.

### 4.4 Grupo VIP e detecção de quem entrou

**Cadastro do grupo:**
- O cliente escolhe um grupo onde o número dele é **administrador** (o sistema lista via `GET /group/fetchAllGroups/{instance}`) ou o sistema cria um novo (`POST /group/create`).
- O sistema pega o link de convite (`GET /group/inviteCode/{instance}`).
- Opcional: **vários grupos em sequência** (grupo 1 encheu com ~1000 pessoas → passa para o grupo 2 automaticamente).

**Identificação de quem entrou — 3 camadas:**

1. **Webhook `GROUP_PARTICIPANTS_UPDATE`** (`action: "add"`): a Evolution avisa em tempo real quem entrou. O sistema cruza o telefone com o lead e marca `ENTROU`.
2. **Sincronização periódica** (a cada 10–15 min): `GET /group/participants/{instance}?groupJid=...` traz a lista completa; o sistema compara com os leads da campanha (pega quem o webhook perdeu). Se vier `@lid`, tenta resolver o telefone pelo mapeamento LID↔telefone que a Evolution mantém dos contatos/conversas.
3. **Link rastreável próprio**: a mensagem não leva o link do WhatsApp direto, e sim `https://seuapp.com/g/AbC123` (token único por lead). Ao clicar, o sistema registra **"clicou"** e redireciona para o convite do grupo. Assim você sabe: *não clicou* / *clicou mas não entrou* / *entrou* — e o follow-up pode ter texto diferente para cada caso.

> Observação: o link rastreável também melhora os relatórios (taxa de clique) e permite trocar o grupo de destino sem reenviar mensagens.

### 4.5 Campanha e régua de follow-up

Uma **Campanha** tem:
- Lista(s) de leads, número(s) de envio, grupo(s) de destino.
- **Etapas (régua)**, cada uma com seu texto e mídia:

| Etapa | Quando | Para quem | Exemplo de texto |
|---|---|---|---|
| 1 – Convite | Início da campanha | Todos | "Oi {nome}! Liberamos um grupo VIP com descontos de até 50% na Black Friday 👉 {link}" |
| 2 – Lembrete | 24h depois | Recebeu e **não entrou** | "{nome}, as vagas do grupo VIP estão acabando. Ainda dá tempo 👉 {link}" |
| 3 – Última chance | 48h depois da etapa 2 | Ainda **não entrou** | "Último aviso: amanhã o grupo fecha e os cupons são só lá dentro 👉 {link}" |

- **Variações de texto (spintax):** `{Oi|Olá|E aí} {nome}` — cada lead recebe uma versão diferente (reduz bloqueio por conteúdo repetido). A IA pode gerar 5–10 variações automaticamente.
- **Tipos de mídia:** texto, imagem + legenda, vídeo + legenda, áudio (PTT, parece gravado na hora), documento. Endpoint `POST /message/sendMedia/{instance}` e `sendWhatsAppAudio`.
- **Regra de parada:** entrou no grupo, respondeu "SAIR", número inválido, ou atingiu o máximo de tentativas → sai da régua.
- **Disparo dentro do grupo:** depois, a campanha pode agendar posts no grupo VIP (ofertas, vídeos, contagem regressiva) — `sendText`/`sendMedia` para o `groupJid`, com opção de **mencionar todos**.

### 4.6 Disparo controlado (anti-ban)

O worker aplica estas regras **por número** (cada número tem sua própria fila no BullMQ):

- **Intervalo aleatório** entre mensagens: ex. 25 a 90 segundos (configurável, com mínimo travado no sistema).
- **Pausa em lote:** a cada 20–40 mensagens, pausa de 5–15 minutos.
- **Limite diário** com aquecimento:
  - Dias 1–3 do número: até 30/dia
  - Dias 4–7: até 80/dia
  - Semana 2: até 200/dia
  - Depois: até 400–600/dia (configurável pelo plano)
- **Janela de horário:** só envia das 9h às 20h (fuso do tenant), nunca domingo à noite.
- **Simular digitação:** `delay` + presença "digitando..." antes de enviar.
- **Rodízio de números:** se o cliente tem 3 números, a campanha distribui os leads entre eles.
- **Proteção automática:** se a taxa de erro subir ou o número desconectar, a campanha é **pausada** e o cliente recebe alerta.
- **Opt-out:** resposta com "SAIR", "PARAR", "não quero" → lead bloqueado para sempre no tenant.

### 4.7 Relatórios

- Funil por campanha: **Importados → Válidos → Enviados → Entregues → Lidos → Clicaram → Entraram no grupo → Saíram**.
- Conversão por etapa (quantos entraram após a msg 1, 2 e 3) → mostra qual texto funciona melhor.
- Saúde do número (enviados hoje, erros, status de conexão).
- Exportar CSV de quem entrou / não entrou.

---

## 5. Modelo de dados (Prisma — resumo)

```prisma
model Tenant {
  id         String   @id @default(cuid())
  name       String
  plan       Plan     @default(STARTER)
  status     TenantStatus @default(ACTIVE) // ACTIVE, SUSPENDED
  asaasId    String?
  timezone   String   @default("America/Sao_Paulo")
  users      User[]
  instances  WaInstance[]
  leads      Lead[]
  campaigns  Campaign[]
  createdAt  DateTime @default(now())
}

model User {
  id           String @id @default(cuid())
  tenantId     String
  tenant       Tenant @relation(fields: [tenantId], references: [id])
  name         String
  email        String @unique
  passwordHash String
  role         Role   @default(OPERADOR) // OWNER, ADMIN, OPERADOR, SUPERADMIN
}

model WaInstance {
  id           String @id @default(cuid())
  tenantId     String
  name         String @unique          // nome na Evolution
  phone        String?
  status       String                  // open, close, connecting
  connectedAt  DateTime?               // base do aquecimento
  dailyLimit   Int    @default(30)
  sentToday    Int    @default(0)
}

model Lead {
  id          String  @id @default(cuid())
  tenantId    String
  name        String?
  phone       String                   // 5511999999999
  lid         String?                  // identificador LID do WhatsApp, quando descoberto
  tags        String[]
  consentSource String                 // origem do opt-in (LGPD)
  optedOut    Boolean @default(false)
  hasWhatsapp Boolean?
  @@unique([tenantId, phone])
}

model WaGroup {
  id         String @id @default(cuid())
  tenantId   String
  instanceId String
  groupJid   String                    // 1203...@g.us
  inviteUrl  String
  name       String
  maxMembers Int    @default(1000)
}

model Campaign {
  id        String @id @default(cuid())
  tenantId  String
  name      String
  status    CampaignStatus             // DRAFT, RUNNING, PAUSED, DONE
  groupId   String
  steps     CampaignStep[]
  contacts  CampaignContact[]
}

model CampaignStep {
  id          String @id @default(cuid())
  campaignId  String
  order       Int                      // 1, 2, 3
  delayHours  Int                      // espera após a etapa anterior
  texts       String[]                 // variações (spintax)
  mediaUrl    String?
  mediaType   String?                  // image, video, audio, document
}

model CampaignContact {
  id           String @id @default(cuid())
  campaignId   String
  leadId       String
  trackToken   String @unique          // link /g/<token>
  currentStep  Int    @default(0)
  status       ContactStatus           // PENDING, SENT, CLICKED, JOINED, OPTOUT, FAILED, EXHAUSTED
  lastSentAt   DateTime?
  clickedAt    DateTime?
  joinedAt     DateTime?
  @@unique([campaignId, leadId])
}

model MessageLog {
  id          String @id @default(cuid())
  tenantId    String
  contactId   String
  step        Int
  waMessageId String?
  status      String                   // queued, sent, delivered, read, error
  error       String?
  createdAt   DateTime @default(now())
}
```

---

## 6. Custos de operação (estimativa)

| Item | 10 clientes | 50 clientes | 150 clientes |
|---|---|---|---|
| VPS(s) | R$ 120 (1× 4vCPU/8GB) | R$ 400 (2–3 VPS) | R$ 1.000 (cluster/várias VPS) |
| Storage mídia (R2/MinIO) | R$ 5 | R$ 30 | R$ 90 |
| Backups + domínio + e-mail | R$ 30 | R$ 50 | R$ 80 |
| Asaas (taxa por cobrança) | R$ 20 | R$ 100 | R$ 300 |
| Monitoramento / Sentry | R$ 0 | R$ 0 | R$ 130 |
| **Total/mês** | **~R$ 175** | **~R$ 580** | **~R$ 1.600** |
| **Custo por cliente** | ~R$ 17 | ~R$ 12 | ~R$ 11 |

> Cada instância da Evolution consome ~50–150 MB de RAM. Uma VPS de 8 GB aguenta com folga 40–60 números conectados.

---

## 7. Quanto cobrar

### Referência da concorrência (pesquisa de nov/2026 — confirmar nos sites antes de publicar)

| Ferramenta | Tipo | Preço | Implantação |
|---|---|---|---|
| **SendFlow** (concorrente direto: grupos para lançamentos) | Planos semestrais | Lite ~R$ 250/mês (1 número) · Standard ~R$ 500/mês (3 números) · Black ~R$ 830/mês (5 números). Mensagens e grupos ilimitados | Sem taxa; **call de implementação incluída só no Black** |
| Azallon | Disparador em massa | R$ 97/mês (não oficial) · R$ 167/mês (PRO, API oficial) | Sem taxa divulgada |
| Onsms / Tenessi Hub / SocialHub | Disparo via API oficial | R$ 99 a R$ 599/mês + custo Meta por mensagem | Em geral "sem setup" |
| MultiWhats.link | Multiatendimento | — | **Setup de R$ 1.500** à vista |
| Z-API (só a API, sem painel) | Infraestrutura | ~R$ 97/mês por número | — |

**Leitura:** o mercado de grupos/lançamentos paga de R$ 250 a R$ 830/mês; disparadores simples brigam na faixa de R$ 97. A maioria **não cobra implantação** ou a coloca como bônus do plano mais caro — por isso aqui ela é **opcional** e vira **brinde** no plano Agência e no pagamento semestral/anual.

### Planos sugeridos (Evolution API — não oficial)

| | **Start** | **Pro** (mais vendido) | **Agência** |
|---|---|---|---|
| Mensal | **R$ 329** | **R$ 497** | **R$ 997** |
| Semestral (à vista, 5% off) | R$ 1.875 (≈ R$ 313/mês) | R$ 2.833 (≈ R$ 472/mês) | R$ 5.683 (≈ R$ 947/mês) |
| Anual (à vista ou 12x, 10% off) | R$ 3.553 (≈ R$ 296/mês) | R$ 5.368 (≈ R$ 447/mês) | R$ 10.768 (≈ R$ 897/mês) |
| Números conectados | 1 | 3 | 10 |
| Mensagens | **Ilimitadas** (respeitando o limite anti-ban por número) | Ilimitadas | Ilimitadas |
| Leads na base | 20.000 | 100.000 | 500.000 |
| Usuários | 1 | 3 | 10 + sub-contas para clientes |
| Grupos VIP / campanhas | Ilimitados | Ilimitados | Ilimitados |
| Follow-up automático (quem não entrou) | 2 etapas | 5 etapas | 5 etapas |
| Link rastreável + relatórios | ✔ | ✔ | ✔ + exportação |
| IA para variações de texto | — | ✔ | ✔ |
| Implantação assistida | R$ 999 (R$ 499 + 2× R$ 250) | R$ 999 (R$ 499 + 2× R$ 250) | **Inclusa** |
| Suporte | E-mail | WhatsApp | Prioritário |

> O limite real de envio é **por número** (aquecimento + limite diário — seção 4.6), não por mês. Isso permite anunciar "mensagens ilimitadas" como a concorrência sem aumentar o risco de banimento.

**Extras:**
- **Implantação assistida:** R$ 999 em 3x (R$ 499 na contratação + 2 parcelas de R$ 250) — configurar números, importar base, criar grupo, montar a primeira campanha e os textos de convite/follow-up. Versão "feita para você" (você opera o primeiro lançamento): R$ 997 a R$ 1.500.
- **Número adicional:** R$ 59/mês.
- **Plano Oficial (Cloud API Meta):** mensalidade de plataforma (ex. R$ 297) **+ repasse do custo Meta por mensagem com margem** (ex. cobrar R$ 0,55 por mensagem de marketing). Público: empresas maiores que não podem arriscar o número.
- **White label para agências:** R$ 1.500 a R$ 3.000/mês (domínio e logo da agência, ela revende).

**Diferencial para justificar o preço:** a SendFlow gerencia os grupos; este sistema também **convida no privado, identifica quem não entrou e reenvia com outro texto automaticamente**.

**Conta rápida:** 50 clientes, média R$ 450 → **R$ 22.500/mês de receita**, ~R$ 600 de infraestrutura → margem bruta ≈ **97%** (antes de suporte, marketing e impostos — no Simples Nacional, Anexo III/V, considere 6% a 15,5%).

---

## 8. Passo a passo de implementação

### Fase 0 — Preparação (1 semana)
1. Registrar domínio (ex.: `zapgrupovip.com.br`) e criar e-mail.
2. Contratar VPS (Ubuntu 24.04, 4 vCPU / 8 GB).
3. Instalar Docker + Docker Compose (ou Coolify/Easypanel para facilitar).
4. Ter 1–2 **chips de teste** com WhatsApp (nunca teste com número principal).
5. Escrever Termos de Uso e Política de Privacidade (LGPD, responsabilidade pelo número, proibição de spam).

### Fase 1 — Infraestrutura (2–3 dias)
1. `docker-compose.yml` com: `postgres`, `redis`, `evolution-api`, `minio`, `app` (Next.js), `worker`, `caddy`.
2. Configurar Evolution API: `AUTHENTICATION_API_KEY` forte, `DATABASE_PROVIDER=postgresql`, `CACHE_REDIS_ENABLED=true`, webhook global desativado (cada instância terá o seu).
3. Caddy com HTTPS para `app.seudominio` e `evo.seudominio` (a Evolution **não** deve ficar pública sem chave; ideal é só a rede interna do Docker).
4. Backup diário do Postgres (pg_dump para R2/S3).

### Fase 2 — Base do SaaS (1–2 semanas)
1. Criar o projeto Next.js 16 (pode partir do AgendaZap: já tem NextAuth, Prisma e Asaas).
2. Prisma com o modelo da seção 5 e migrar de SQLite para **PostgreSQL**.
3. Cadastro de empresa (cria `Tenant` + `User OWNER`), login, recuperação de senha.
4. Helper de isolamento por `tenantId` + middleware protegendo `/dashboard`.
5. Painel SUPERADMIN (lista de tenants, plano, bloqueio).
6. Integração Asaas: criar assinatura no cadastro; webhook `PAYMENT_OVERDUE` → suspende tenant; `PAYMENT_CONFIRMED` → reativa.

### Fase 3 — Conexão WhatsApp (1 semana)
1. `lib/evolution.ts`: cliente HTTP (axios) com `createInstance`, `connect` (QR), `logout`, `status`, `sendText`, `sendMedia`, `checkNumbers`, `fetchGroups`, `groupParticipants`, `inviteCode`.
2. Tela "Números": conectar via QR (atualizando a cada 20 s), status ao vivo, desconectar.
3. Rota `POST /api/webhooks/evolution/[token]`: valida token, identifica tenant/instância, trata `CONNECTION_UPDATE`, `MESSAGES_UPSERT` (respostas/opt-out), `MESSAGES_UPDATE` (entregue/lido), `GROUP_PARTICIPANTS_UPDATE` (entrou/saiu).

### Fase 4 — Leads (1 semana)
1. Upload CSV/XLSX → preview → mapeamento de colunas → normalização → deduplicação.
2. Processar importações grandes em job na fila (não travar a tela).
3. Botão "Validar números no WhatsApp" (em lotes de 50, com intervalo).
4. Listas, tags, busca, opt-out manual, exportação.

### Fase 5 — Grupos e campanhas (2 semanas)
1. Tela "Grupos VIP": importar grupos do número, criar novo, guardar link de convite, rodízio de grupos cheios.
2. Wizard de campanha: (1) público → (2) grupo → (3) etapas com textos/variações/mídia → (4) regras de envio (horário, intervalo, limite) → (5) revisar e iniciar.
3. Upload de mídia para MinIO/R2 (imagem até 5 MB, vídeo até 16 MB — limite prático do WhatsApp).
4. Rota `/g/[token]`: registra clique e redireciona para o convite.
5. Pré-visualização da mensagem como ficará no WhatsApp + **envio de teste** para o próprio número.

### Fase 6 — Motor de disparo (1–2 semanas) ⭐ parte mais crítica
1. Worker Node.js com BullMQ: uma fila por instância (`send:<instanceId>`), `concurrency: 1`.
2. Ao iniciar campanha: cria `CampaignContact` para cada lead e enfileira etapa 1 com `delay` calculado (intervalo aleatório + janela de horário + limite diário).
3. Antes de cada envio: confere se a campanha está ativa, se o lead não entrou/saiu/opt-out, se o número está conectado e dentro do limite.
4. Envia (presença "digitando" → mensagem), grava `MessageLog`, atualiza `CampaignContact`.
5. Retentativa com backoff em erro de rede; em erro de número inválido marca `FAILED`; se muitos erros seguidos → pausa a campanha e alerta.
6. **Agendador de follow-up** (job repetitivo a cada 15 min): busca contatos com `status in (SENT, CLICKED)`, `joinedAt = null`, `lastSentAt + delayHours da próxima etapa < agora` e `currentStep < total` → enfileira a próxima etapa (texto diferente; pode variar se clicou ou não).
7. **Sincronizador de grupo** (a cada 10–15 min): compara participantes do grupo com os contatos da campanha e marca `JOINED`.
8. Reset diário de `sentToday` e aumento automático do `dailyLimit` conforme aquecimento.

### Fase 7 — Relatórios e acabamento (1 semana)
1. Dashboard por campanha (funil, conversão por etapa, gráfico por hora).
2. Alertas por e-mail/WhatsApp para o dono do tenant (número caiu, campanha pausada, plano no limite).
3. Medidores de consumo do plano + botão de upgrade.
4. Logs de auditoria (quem iniciou/pausou campanha).

### Fase 8 — Testes e lançamento (1–2 semanas)
1. Testes com 2–3 chips próprios, aquecidos, por pelo menos 7 dias.
2. Beta fechado com 3–5 clientes a preço reduzido (ex. R$ 147) em troca de feedback.
3. Ajustar limites anti-ban com base nos dados reais.
4. Página de vendas, vídeo de demonstração, tutorial de onboarding.
5. Lançamento.

**Prazo total estimado:** 8 a 12 semanas para 1 desenvolvedor (ou 5–7 semanas com 2).

### Fase 9 — Evoluções futuras
- Plano Oficial com WhatsApp Cloud API (templates aprovados).
- Integrações nativas: Hotmart, Kiwify, Eduzz, RD Station, Google Sheets, webhooks genéricos, Zapier/Make/n8n.
- Chatbot simples de boas-vindas no privado e no grupo.
- Teste A/B automático de textos (o sistema escolhe o que converte mais).
- App PWA para acompanhar campanhas pelo celular.

---

## 9. Checklist rápido do cliente final (como ele vai usar)

1. Cria conta e escolhe o plano → paga via Pix/cartão (Asaas).
2. Conecta o WhatsApp pelo QR Code.
3. Escolhe ou cria o grupo VIP.
4. Importa a planilha de leads (com origem do consentimento).
5. Cria a campanha: texto de convite + imagem/vídeo, texto de lembrete e de última chance.
6. Faz envio de teste para si mesmo.
7. Clica em **Iniciar** — o sistema dispara aos poucos.
8. Acompanha em tempo real: enviados, clicaram, entraram.
9. O sistema reenvia automaticamente para quem não entrou, com outro texto.
10. Dentro do grupo, agenda as ofertas da campanha.
