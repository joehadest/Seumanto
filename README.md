# Seu manto — E-commerce de Camisetas

Projeto full-stack (Loja + Painel Admin) usando **Supabase** (Postgres + Realtime)
como backend. O cliente React fala direto com o Supabase via SDK.

- **Loja (cliente):** catálogo, filtros, carrinho e checkout.
- **Admin:** login protegido, CRUD de produtos, gestão de pedidos e configurações da loja.
- **Sincronização:** Loja e Admin assinam o **Supabase Realtime**. O que o Admin
  cadastra aparece na Loja na hora (websocket), e novos pedidos/status surgem no
  Admin em tempo real — sem polling.

## Stack

| Camada   | Tecnologia                                    |
| -------- | --------------------------------------------- |
| Front    | React 18 + Vite + Tailwind CSS + React Router |
| Backend  | Supabase (Postgres, Auth-ready, Realtime)     |
| SDK      | `@supabase/supabase-js`                        |

## Estrutura de pastas

```
maykeloja/
├── package.json              # scripts do app (roda o client)
├── .cursor/mcp.json          # MCP do Supabase para o projeto
├── .agents/skills/           # skills instaladas para tarefas Supabase
├── supabase/
│   └── migrations/           # migrations SQL do banco Supabase
├── client/                   # React + Vite + Tailwind
│   ├── .env.example          # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
│   ├── public/favicon/       # ícones e manifest da loja
│   └── src/
│       ├── lib/supabase.js   # cria o client do Supabase
│       ├── api/              # adapter Postgres <-> front (products, orders)
│       ├── hooks/            # useProducts / useOrders (Realtime)  << SINCRONIZAÇÃO
│       ├── context/          # CartContext (carrinho do cliente)
│       ├── components/       # Navbar
│       ├── pages/store/      # Catalog, Cart, Checkout
│       └── pages/admin/      # Login, layout admin, Products, Categories, Orders, Settings
```

## Modelo de dados (Postgres)

**Tabela `products`**

| coluna      | tipo            |
| ----------- | --------------- |
| id          | uuid (PK)       |
| name        | text            |
| category    | text            |
| categories  | text[]          |
| description | text            |
| price       | numeric(10,2)   |
| sizes       | text[]          |
| colors      | text[]          |
| stock       | integer         |
| image_url   | text            |
| image_urls  | text[]          |
| created_at  | timestamptz     |
| updated_at  | timestamptz     |

**Tabela `product_categories`**

| coluna      | tipo        |
| ----------- | ----------- |
| id          | uuid (PK)   |
| name        | text unique |
| description | text        |
| sort_order  | integer     |
| created_at  | timestamptz |
| updated_at  | timestamptz |

**Tabela `orders`**

| coluna     | tipo                                                    |
| ---------- | ------------------------------------------------------- |
| id         | uuid (PK)                                               |
| customer   | jsonb `{ name, email, phone, address }`                 |
| items      | jsonb `[{ productId, name, category, categories, size, color, price, quantity }]` |
| total      | numeric(10,2)                                           |
| status     | text (`Pendente`/`Pago`/`Enviado`/`Cancelado`)          |
| created_at | timestamptz                                             |
| updated_at | timestamptz                                             |

> A camada `client/src/api/` converte `id`/snake_case do Postgres para
> `_id`/camelCase no front, então hooks e telas não mudam.

**Tabela `store_settings`**

Guarda metadados da loja: nome, modo manutenção, contato e regras de frete.

## Setup (passo a passo)

1. **Crie o projeto** no [supabase.com](https://supabase.com).
2. **Banco:** no painel, vá em **SQL Editor** → New query → cole todo o conteúdo da
   migration em `supabase/migrations/` → **Run**. Isso cria as tabelas, triggers de
   `updated_at`, ativa o **Realtime**, as policies de RLS e insere 4 camisetas de
   exemplo.
3. **Credenciais:** em **Project Settings → API**, copie a `Project URL` e a
   `anon public key`.
4. **Configure o front:**
   ```bash
   cp client/.env.example client/.env
   # edite client/.env com a URL e a anon key
   ```
5. **Rode:**
   ```bash
   npm install        # instala dependências do client
   npm run dev        # http://localhost:5173
   ```

## Deploy na Vercel

O repositório já inclui `vercel.json` na raiz (build do `client/`, SPA com React Router).

### Passo a passo

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. **Root Directory:** deixe a raiz do repo (`.`).
3. A Vercel deve detectar automaticamente:
   - **Build Command:** `npm run build`
   - **Output Directory:** `client/dist`
4. Em **Environment Variables**, adicione:

| Variável | Exemplo |
| -------- | ------- |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | sua anon key |
| `VITE_MP_SANDBOX` | `false` em produção, `true` em preview/teste |

5. Faça o deploy.

### Depois do deploy

1. **Supabase → Authentication → URL Configuration**
   - **Site URL:** `https://seumanto.webpulseservicos.com`
   - **Redirect URLs:** `https://seumanto.webpulseservicos.com/**`
   - A recuperação de senha usa o redirect:
     `https://seumanto.webpulseservicos.com/redefinir-senha`

2. **Mercado Pago** (quando for ativar pagamentos):
   ```bash
   supabase secrets set SITE_URL=https://seumanto.webpulseservicos.com
   ```

3. Acesse a loja em `https://seumanto.webpulseservicos.com` e o admin em `/admin/login`.

## Área Admin

O painel administrativo é isolado da loja pública:

- Não há links públicos para o Admin na Navbar da loja.
- O acesso é pela URL direta `http://localhost:5173/admin/login`.
- Rotas internas ficam em `/admin/produtos`, `/admin/categorias`,
  `/admin/pedidos`, `/admin/avaliacoes` e `/admin/configuracoes`.
- `ProtectedRoute` bloqueia qualquer renderização interna se não houver sessão
  Supabase Auth com role admin.

Para liberar um usuário administrador, o JWT precisa conter `role=admin` ou
`app_metadata.role=admin`.

### Login temporário de bootstrap

Para o primeiro acesso, crie um usuário temporário no Supabase Dashboard:

1. Vá em **Authentication → Users → Add user**.
2. Crie, por exemplo:
   - e-mail: `admin@maykeloja.com`
   - senha: `Mayke@123`
3. No usuário criado, defina `app_metadata` como:
   ```json
   { "role": "admin" }
   ```
4. Entre em `/admin/login` com esse usuário.
5. Vá em **Configurações → Acesso administrativo** e troque e-mail/senha.

Ao salvar o novo acesso, o sistema faz logout automaticamente. O usuário passa a
usar as credenciais novas, então o login temporário deixa de funcionar para novos
acessos.

## Mercado Pago (Checkout Pro)

O checkout redireciona o cliente para o **Mercado Pago** (Pix e cartao). O pedido
fica `Pendente` até o webhook confirmar o pagamento como `Pago`.

Para pedir as credenciais ao dono da conta Mercado Pago, use o arquivo
`MERCADO_PAGO_CLIENTE.md`.

### 1. Aplicar migration

Execute no SQL Editor do Supabase:

`supabase/migrations/20260606150000_add_mercado_pago_orders.sql`

### 2. Deploy das Edge Functions

```bash
npx supabase login
npx supabase link --project-ref dovscuzjxykwrzapalkv
npx supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
npx supabase secrets set SITE_URL=https://seumanto.webpulseservicos.com
npx supabase functions deploy create-mp-checkout
npx supabase functions deploy mercado-pago-webhook
```

Secrets já injetados automaticamente pelo Supabase: `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Webhook no painel Mercado Pago

Em **Suas integracoes -> Webhooks**, aponte para:

`https://dovscuzjxykwrzapalkv.supabase.co/functions/v1/mercado-pago-webhook`

Evento: **Pagamentos**.

### 4. Front-end

No `client/.env` e nas variaveis da Vercel:

```env
VITE_MP_SANDBOX=false   # credenciais reais de producao
```

### Fluxo

1. Cliente finaliza checkout → pedido `Pendente`
2. Edge Function cria preferência no Mercado Pago
3. Cliente paga no Checkout Pro
4. Webhook atualiza pedido para `Pago` (ou `Cancelado`)
5. Cliente vê status em `/meus-pedidos` via Realtime

## Segurança (importante)

As migrations atuais mantêm leitura pública para `products` e `store_settings`,
permitem `insert` público em `orders` para o checkout e restringem escrita/admin
por RLS usando role admin no JWT. A `anon key` é pública por design — a proteção
real vem do RLS.

## Organização

A API mock em Express/JSON da primeira etapa foi removida. O backend atual é o
Supabase, e o front acessa os dados por `client/src/api/`, que mantém a tradução
entre o formato do Postgres e o formato usado nas telas.
