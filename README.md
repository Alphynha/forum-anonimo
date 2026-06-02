# Fórum Anônimo - API REST
Plataforma anônima de postagem de artigos construída com Node.js, Express e SQLite.

[![Docker Hub](https://img.shields.io/docker/pulls/alphynha/forum-anonimo?style=flat-square&logo=docker&label=DockerHub)](https://hub.docker.com/r/alphynha/forum-anonimo)
[![Docker Image Size](https://img.shields.io/docker/image-size/alphynha/forum-anonimo/latest?style=flat-square&logo=docker)](https://hub.docker.com/r/alphynha/forum-anonimo)

## Workflow de desenvolvimento
Este projeto utiliza o **GitHub Flow**.

### Por que GitHub Flow?
Como é um projeto pequeno e acadêmico, o GitHub Flow é o mais adequado por ser simples e direto.
A branch `main` é a branch principal e contém apenas código estável e testado.
As branches de desenvolvimento são criadas a partir da branch `main` e são mescladas de volta para a branch `main` após a conclusão do desenvolvimento.

## Pré-requisitos
- Node.js 18 ou superior
- npm
- Git

## Instalação

```bash
# Clone o repositório
git clone https://github.com/Alphynha/forum-anonimo

# Entre no diretório do projeto
cd forum-anonimo

# Instale as dependências
npm install
```

## Como executar?

```bash
# Inicie o servidor
node server.js
```

O servidor será iniciado na porta 3000.

## Endpoints disponíveis

| Método | Rota          | Descrição              |
|--------|---------------|------------------------|
| GET    | /api/artigos  | Lista todos os artigos |
| POST   | /api/artigos  | Publica um novo artigo |
| GET    | /health       | Status do servidor     |

## Exemplos de uso

### Listar artigos

```bash
curl http://localhost:3000/api/artigos
```

### Publicar um artigo

```bash
curl -X POST http://localhost:3000/api/artigos \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Meu primeiro artigo", "conteudo": "Este é o conteúdo do meu primeiro artigo."}'
```

### Resposta esperada (POST - Status 201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Meu primeiro artigo",
    "conteudo": "Este é o conteúdo do meu primeiro artigo.",
    "criado_em": "2022-01-01T00:00:00.000Z"
  }
}
```

## Docker

A imagem está disponível no DockerHub: https://hub.docker.com/r/alphynha/forum-anonimo

### Executar via Docker

```bash
# Baixar e rodar a imagem
docker run -p 3000:3000 alphynha/forum-anonimo

# Rodar com volume para persistir o banco de dados
docker run -p 3000:3000 -v $(pwd)/data:/app/data alphynha/forum-anonimo
```

## Infraestrutura Vagrant

### Pré-requisitos

- [Vagrant](https://www.vagrantup.com/downloads) 2.4+
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) 7.0+

### Máquinas Virtuais

| VM | IP | RAM | Descrição |
|----|----|-----|-----------|
| vm1 | 192.168.56.10 | 1024MB | Máquina para testes |
| vm2 | 192.168.56.11 | 512MB | Máquina com a aplicação |

### Executando a infraestrutura

```bash
# Subir as VMs (primeira execução pode demorar)
vagrant up --provider=virtualbox

# Verificar status das VMs
vagrant status
```

### Iniciando a aplicação na VM2

```bash
# Acessar a VM2
vagrant ssh vm2

# Dentro da VM2 — iniciar o servidor
cd /vagrant_data
node server.js &
```

### Testando a rota GET a partir da VM1

```bash
# Em outro terminal — acessar a VM1
vagrant ssh vm1

# Dentro da VM1 — fazer requisição para a VM2
curl http://192.168.56.11:3000/api/artigos

# Ou testar o health check
curl http://192.168.56.11:3000/health
```

### Parando as VMs

```bash
# Suspender (salva o estado)
vagrant suspend

# Desligar
vagrant halt

# Destruir (remove completamente)
vagrant destroy
```

## Ansible

O Ansible é executado a partir da **VM1** (nó de controle) e configura a **VM2** (nó gerenciado).

### Como funciona a autenticação SSH

Durante o `vagrant up`, o Vagrantfile:
1. Gera um par de chaves RSA na VM1 (`~/.ssh/id_rsa`)
2. Copia a chave pública para `.ssh_exchange/vm1.pub` (pasta compartilhada)
3. VM2 lê essa chave e a adiciona ao seu `authorized_keys`

Isso permite que o Ansible na VM1 conecte via SSH na VM2 sem senha.

### Executando o playbook

```bash
# 1. Subir as VMs (se ainda não estiverem rodando)
vagrant up

# 2. Entrar na VM1 (nó de controle)
vagrant ssh vm1

# 3. Dentro da VM1 — executar o playbook
cd /ansible
ansible-playbook configura-node.yaml

# 4. Verificar se o servidor está respondendo
curl http://192.168.56.11:3000/health
```

### O que o playbook faz

| Etapa | Ação |
|-------|------|
| 1 | Verifica a versão do Node.js na VM2 |
| 2 | Instala o Git |
| 3 | Clona o repositório em `/home/vagrant/forum-anonimo` |
| 4 | Instala as dependências de produção (`npm install --omit=dev`) |
| 5 | Cria a pasta `data/` para o banco SQLite |
| 6 | Inicia o servidor Node.js em background |
| 7 | Verifica se o servidor respondeu na porta 3000 |
| 8 | Confirma o health check via HTTP |