# Logos API

Logos API e uma aplicacao backend desenvolvida com Java e Spring Boot para simular um espaco de debates. A proposta do projeto e reunir autenticacao JWT, gestao de usuarios, publicacao de posts e regras de negocio comuns a uma API REST.

O nome "Logos" vem da ideia de razao, argumento e discurso. O projeto foi pensado como uma base de forum moderno, com foco em organizacao de camadas, seguranca e evolucao tecnica.

## Objetivo do projeto

Este projeto faz parte da minha construcao como desenvolvedor back-end. Ele foi estruturado para praticar:

- modelagem de entidades e relacionamento entre usuario e post
- autenticacao e autorizacao com Spring Security e JWT
- validacao de dados de entrada
- migracoes de banco com Flyway
- organizacao em controller, service, repository e DTOs
- tratamento padronizado de erros

## Stack utilizada

- Java 17
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Spring Security
- Flyway
- MySQL
- Lombok
- Maven

## Funcionalidades

- cadastro de usuarios
- login com retorno de token JWT
- criacao de posts autenticados
- listagem paginada de posts
- consulta de post por id
- atualizacao de post apenas pelo autor
- fechamento de post apenas pelo autor
- bloqueio de edicao em post fechado

## Regras de negocio

- apenas usuarios autenticados podem criar posts
- o autor do post e obtido pelo token autenticado, nao pelo corpo da requisicao
- apenas o autor pode editar ou fechar um post
- posts fechados nao podem ser editados

## Estrutura da API

### `POST /users`

Cria um novo usuario.

Exemplo de body:

```json
{
  "username": "mykael",
  "email": "mykael@email.com",
  "password": "senha1234"
}
```

### `POST /login`

Autentica o usuario e retorna um token JWT.

Exemplo de body:

```json
{
  "email": "mykael@email.com",
  "password": "senha1234"
}
```

### `POST /posts`

Cria um novo post usando o usuario autenticado.

Exemplo de body:

```json
{
  "title": "Como organizar uma API REST?",
  "content": "Estou estruturando meu projeto em camadas e quero melhorar a separacao de responsabilidades.",
  "curso": "SPRING_BOOT"
}
```

### `GET /posts`

Lista os posts de forma paginada.

### `GET /posts/{id}`

Retorna os detalhes de um post especifico.

### `PUT /posts/{id}`

Atualiza um post do autor autenticado.

### `PATCH /posts/{id}/close`

Fecha um post do autor autenticado.

## Como executar localmente

1. Configure um banco MySQL.
2. Ajuste o arquivo `src/main/resources/application-local.properties` com seus dados locais.
3. Rode a aplicacao com o perfil local.

Windows:

```bash
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

Linux/macOS:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

## Configuracao local

O arquivo `application-local.properties` foi deixado com valores de exemplo para evitar exposicao de credenciais no repositorio.

Campos esperados:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`

## Qualidade e apresentacao

Para ficar mais forte dentro do portfolio, este projeto foi refinado com:

- README orientado a apresentacao tecnica
- metadados reais no `pom.xml`
- criacao de post vinculada ao usuario autenticado
- respostas de erro padronizadas
- testes unitarios de regra de negocio sem dependencia de banco

## Proximos passos

- adicionar documentacao OpenAPI/Swagger
- criar testes de controller e service
- incluir deploy e variaveis de ambiente para demonstracao publica
- ampliar o dominio com comentarios e categorias
