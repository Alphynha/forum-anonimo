# Fórum Anônimo - API REST
Plataforma anônima de postagem de artigos construída com Node.js, Express e SQLite.

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