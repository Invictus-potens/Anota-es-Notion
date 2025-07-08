# Notion Notes App

Aplicação web de anotações com múltiplos usuários, MySQL e integração com Notion.

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com suas credenciais:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=senha
   MYSQL_DATABASE=notion_notes
   NOTION_TOKEN=seu_token_notion
   NOTION_DATABASE_ID=seu_database_id_notion
   JWT_SECRET=umsegredoseguro
   PORT=3000
   ```
3. Crie o banco de dados e a tabela:
   ```sql
   CREATE DATABASE notion_notes;
   USE notion_notes;
   CREATE TABLE notes (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     title VARCHAR(255) NOT NULL,
     content TEXT,
     notion_page_id VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(100) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL
   );
   ```
4. Rode a aplicação:
   ```bash
   npm run dev
   ```

## Endpoints principais
- Autenticação: `/auth/register`, `/auth/login`
- Notas: `/notes` (CRUD)

## Sincronização
Cada nota criada/atualizada/deletada é refletida no Notion.

---

## Principais causas

### 1. **Falta de um `package.json` na raiz do projeto**
O Railway/Nixpacks procura por um `package.json` na raiz para saber que é um projeto Node.js.  
**Se o seu `package.json` não está na raiz, mova-o para lá.**

### 2. **Falta de um script de start**
No seu `package.json`, precisa ter:
```json
"scripts": {
  "start": "node src/app.js"
}
```
O Railway executa `npm start` por padrão.

### 3. **Diretórios fora do padrão**
- O código fonte deve estar em `src/` ou na raiz.
- O `public/` deve estar na raiz ou referenciado corretamente no Express.

### 4. **Faltando dependências**
Certifique-se de que todas as dependências estão listadas no `package.json`.

### 5. **Faltando arquivo `.env.example`**
O Railway pode pedir um `.env.example` para saber quais variáveis de ambiente são necessárias.

---

## Como corrigir

### Checklist rápido:

1. **`package.json` está na raiz?**
   - Se não, mova para a raiz do projeto.

2. **Script de start está correto?**
   - No `package.json`:
     ```json
     "scripts": {
       "start": "node src/app.js"
     }
     ```

3. **Estrutura de pastas recomendada:**
   ```
   /package.json
   /public/
   /src/
     app.js
     ...
   ```

4. **Adicione um `.env.example`** (opcional, mas recomendado):
   ```
   MYSQL_HOST=
   MYSQL_USER=
   MYSQL_PASSWORD=
   MYSQL_DATABASE=
   NOTION_TOKEN=
   NOTION_DATABASE_ID=
   JWT_SECRET=
   PORT=3000
   ```

5. **Faça commit de tudo e tente novamente o deploy.**

---

## Exemplo de estrutura correta

```
/package.json
/.env.example
/public/index.html
/public/style.css
/public/script.js
/src/app.js
/src/db.js
/src/routes/...
...
```

---

## Se continuar com erro

- Poste aqui a estrutura dos seus diretórios e o conteúdo do seu `package.json`.
- Se possível, envie o log completo do erro do Railway.

Assim posso te ajudar a ajustar exatamente o que está faltando!
