# Logos Platform

**Logos** nasce da ideia de transformar uma API de forum em uma plataforma mais completa, com leitura publica, autenticacao por JWT e uma interface web pronta para apresentacao e deploy.

O nome vem de *logos*, termo grego ligado a razao, discurso e argumento. A proposta aqui e estudar backend com mais estrutura, mas sem deixar o projeto preso ao terminal ou a ferramentas de teste.

## Status
Projeto em evolucao ativa.

Hoje o repositório já conta com:
- backend em Spring Boot para cadastro, login e gestao de posts
- frontend em React + Vite para leitura, login e publicacao
- base pronta para separar deploy do backend e do frontend

## Tecnologias

### Backend
- Java
- Spring Boot
- Spring Security
- JWT
- JPA / Hibernate
- Flyway
- MySQL

### Frontend
- React
- Vite
- CSS customizado
- consumo de API REST com fetch

## Estrutura
- `src/main/java`: API principal
- `src/main/resources`: configuracoes da aplicacao
- `frontend`: interface web para rodar localmente e publicar no Vercel

## Fluxo atual
- leitura publica dos posts
- cadastro de usuario
- login com JWT
- criacao de posts autenticados
- edicao e fechamento apenas pelo autor

## Como rodar localmente

### Backend
Defina as variaveis usadas em `application.properties`:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `CORS_ALLOWED_ORIGINS`

Depois rode a API com Maven.

### Frontend
Dentro de `frontend`, crie um `.env` baseado em `.env.example`:

```env
VITE_API_URL=http://localhost:8080
```

Depois instale as dependencias e rode:

```bash
npm install
npm run dev
```

## Deploy
- backend: pode subir em uma plataforma Java e liberar a URL publica da API
- frontend: pode subir no Vercel usando a pasta `frontend` como raiz do projeto
- no Vercel, defina `VITE_API_URL` com a URL publica do backend

### Deploy do backend no Render com Docker
No Render, crie o backend como **Web Service** usando o runtime **Docker**.

Com Docker, o Render usa o `Dockerfile` da raiz e nao precisa de build/start command manual.

Variaveis de ambiente esperadas:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `CORS_ALLOWED_ORIGINS`

## Objetivo do projeto
- praticar autenticacao e autorizacao
- evoluir uma API REST para algo com cara de produto
- organizar melhor o fluxo entre backend, frontend e deploy
- transformar um projeto de estudo em item forte de portfolio
