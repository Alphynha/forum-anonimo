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