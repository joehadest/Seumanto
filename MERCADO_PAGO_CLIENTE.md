# Passo a passo para ativar o Mercado Pago

Oi! Para ativarmos os pagamentos reais no site, preciso que voce configure uma aplicacao no Mercado Pago e me envie as credenciais de producao.

Importante: nao precisa me enviar senha, login, codigo de seguranca ou acesso da conta Mercado Pago. Preciso apenas das credenciais da aplicacao.

## 1. Acessar o painel de desenvolvedor

1. Entre em: https://www.mercadopago.com.br/developers
2. Faca login com a conta Mercado Pago da empresa.
3. Acesse **Suas integracoes**.
4. Clique em **Criar aplicacao**.

Sugestao de nome:

```text
Seu Manto - Loja Online
```

## 2. Selecionar o tipo de integracao

Quando o Mercado Pago perguntar sobre a integracao, selecione as opcoes mais proximas de:

```text
Checkout Pro
Site proprio / loja online
Pagamentos online
```

Se aparecer alguma pergunta sobre o modelo de negocio, escolha a opcao mais proxima de e-commerce/loja virtual.

## 3. Copiar as credenciais reais

Depois que a aplicacao for criada:

1. Abra a aplicacao criada no painel do Mercado Pago.
2. Va em **Credenciais**.
3. Procure por **Credenciais de producao**.
4. Copie e me envie estes dois dados:

```text
Access Token de producao:
Public Key de producao:
```

O Access Token de producao normalmente comeca com:

```text
APP_USR-
```

## 4. Configurar o webhook

Ainda dentro da aplicacao no Mercado Pago:

1. Va em **Webhooks** ou **Notificacoes Webhook**.
2. Clique em **Configurar notificacao**.
3. Use esta URL:

```text
https://dovscuzjxykwrzapalkv.supabase.co/functions/v1/mercado-pago-webhook
```

4. Em eventos, marque:

```text
Pagamentos
```

5. Salve a configuracao.

## 5. Me avisar quando terminar

Quando finalizar, me envie:

```text
Access Token de producao:
Public Key de producao:
Webhook configurado: sim/nao
```

Com isso eu configuro o site para receber pagamentos reais pelo Mercado Pago.
