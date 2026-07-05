# Monitoramento — Fórum Anônimo

Este diretório contém a configuração de **monitoramento** das máquinas virtuais
do projeto usando o [Netdata](https://www.netdata.cloud/), incluindo um alerta
de uso de CPU que envia notificações via **Telegram**.

## Estrutura

```
vagrant/
├── Vagrantfile                        # Provisiona VM1 (controle) e VM2 (app + monitoramento)
├── data/
│   ├── configurar-monitoramento.yml   # Playbook Ansible: instala/configura o Netdata
│   ├── secrets.yml.example            # Modelo de credenciais do Telegram
│   └── secrets.yml                    # Credenciais reais (ignorado pelo git; você cria)
└── README.md                          # Este arquivo
```

## O que é provisionado

- **VM2 (`192.168.56.11`)** — recebe a aplicação Node.js e o monitoramento:
  - **Netdata** — coleta métricas de CPU, memória, disco e rede em tempo real.
  - **Alerta de CPU** — dispara em `warning` quando o uso passa de **80%** e em
    `critical` acima de **90%**, enviando notificação via Telegram.
  - **stress-ng** — utilitário para gerar carga artificial de CPU e testar o alerta.

## Como subir o ambiente

A partir deste diretório (`vagrant/`):

```bash
vagrant up
```

O Netdata é instalado e configurado automaticamente durante o provisionamento
da VM2 (o `Vagrantfile` executa o playbook `data/configurar-monitoramento.yml`).

> **Importante:** para receber as notificações, crie o arquivo
> `data/secrets.yml` com as credenciais do seu bot **antes de subir**. Sem ele,
> o monitoramento funciona e o alerta dispara, mas a notificação não é entregue.
> Veja a seção [Configurar o Telegram](#configurar-o-telegram).

Para reaplicar apenas o monitoramento numa VM já existente:

```bash
vagrant provision vm2
```

## Como visualizar os dados coletados

O Netdata oferece um **dashboard web em tempo real** na porta `19999`.

### Opção 1 — pelo IP privado da VM2

Com as VMs no ar, abra no navegador do seu computador (host):

```
http://192.168.56.11:19999
```

### Opção 2 — por redirecionamento de porta (localhost)

O `Vagrantfile` redireciona a porta `19999` da VM2 para o host, então também
funciona:

```
http://localhost:19999
```

> Se a porta `19999` já estiver em uso no host, o Vagrant escolhe outra
> automaticamente (`auto_correct: true`). O número escolhido aparece na saída
> do `vagrant up`, na linha `Fixed port collision for 19999`.

### O que você vê no dashboard

- **System Overview** — gráficos de **CPU**, memória, disco e rede atualizando
  segundo a segundo.
- **system.cpu** — gráfico onde o alerta de CPU é avaliado.
- Menu lateral direito **Alerts / Active alarms** — lista os alertas. Quando a
  CPU ultrapassa 80%, o alarme `cpu_usage_alto` aparece em amarelo (warning) ou
  vermelho (critical).

### Pela linha de comando (dentro da VM)

```bash
vagrant ssh vm2

# Estado de todos os alarmes
sudo netdatacli alarms

# Métricas brutas de CPU via API local
curl -s "http://localhost:19999/api/v1/data?chart=system.cpu&after=-60" | head
```

## Testar o alerta de CPU

Dentro da VM2, gere carga artificial com o `stress-ng`:

```bash
vagrant ssh vm2

# Estressa todos os núcleos a ~95% por 3 minutos
stress-ng --cpu 0 --cpu-load 95 --timeout 180s
```

Acompanhe no dashboard (`system.cpu` e a aba **Alerts**): em poucos segundos o
alarme `cpu_usage_alto` muda para **warning** (acima de 80%) e, se a carga
persistir acima de 90%, para **critical** — disparando a notificação no Telegram.

## Configurar o Telegram

O envio de notificações usa um **bot do Telegram**. As credenciais reais **não
ficam no playbook** (que vai para o git) — elas moram em `data/secrets.yml`, que
é **ignorado pelo git** (veja `.gitignore`).

### 1. Criar o bot e descobrir o chat_id

1. **Token do bot** — no Telegram, fale com o [@BotFather](https://t.me/BotFather),
   use `/newbot` e copie o token gerado.
2. **chat_id** — fale com o [@userinfobot](https://t.me/userinfobot) (ou envie uma
   mensagem ao seu bot e consulte
   `https://api.telegram.org/bot<TOKEN>/getUpdates`).

### 2. Preencher o secrets.yml

A partir do diretório `vagrant/data/`:

```bash
cp secrets.yml.example secrets.yml
# edite secrets.yml com o token e o chat_id reais
```

```yaml
telegram_bot_token: "SEU_TOKEN_REAL"
telegram_chat_id: "SEU_CHAT_ID_REAL"
```

> `secrets.yml` está no `.gitignore` e **não deve ser commitado**. Sem esse
> arquivo, o playbook usa placeholders e o alerta dispara, mas a notificação
> não é entregue.

### 3. Aplicar e validar

Reprovisione para aplicar as credenciais:

```bash
vagrant provision vm2
```

Para validar o canal de notificação sem estressar a CPU, dentro da VM2:

```bash
vagrant ssh vm2
sudo -n su -s /bin/bash -c '/usr/lib/netdata/plugins.d/alarm-notify.sh test sysadmin' netdata
```

Você deve receber as mensagens de teste no Telegram.

## Arquivos de configuração relevantes (dentro da VM2)

| Caminho | Descrição |
| --- | --- |
| `/etc/netdata/netdata.conf` | Configuração geral (bind em `0.0.0.0`). |
| `/etc/netdata/health.d/cpu_usage.conf` | Regra do alerta de CPU (80% / 90%). |
| `/etc/netdata/health_alarm_notify.conf` | Configuração das notificações (Telegram). |
