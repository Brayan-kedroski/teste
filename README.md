# Sistema de Notas Escolar (React + Firebase)

Este é um sistema completo para gerenciamento de notas escolares, com login, banco de dados em tempo real e painel administrativo.

## 🚀 Como Configurar (Passo a Passo)

### 1. Configurar o Firebase (Banco de Dados)
Para que o login e o banco de dados funcionem, você precisa criar um projeto gratuito no Google Firebase:

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/).
2. Clique em **"Adicionar projeto"** e dê um nome.
3. No painel do projeto, clique no ícone de **Web (</>)** para adicionar um app.
4. Copie as chaves que aparecem (`apiKey`, `authDomain`, etc).
5. Abra o arquivo `src/firebase.js` neste projeto e cole as chaves no lugar indicado.
6. **Importante**: No console do Firebase, vá em **Criação > Authentication** e ative o método **Email/Senha**.
7. Vá em **Criação > Firestore Database** e crie um banco de dados (pode começar no modo de teste).

### 2. Rodar no seu computador
Se você já instalou o Node.js:
```bash
npm install
npm run dev
```
O site abrirá em `http://localhost:5173`.

### 3. Publicar no Netlify (Online)
Para colocar o site no ar e compartilhar o link:

1. Rode o comando de construção:
   ```bash
   npm run build
   ```
   Isso criará uma pasta chamada `dist`.
2. Acesse [netlify.com](https://www.netlify.com/) e crie uma conta.
3. Na tela inicial do Netlify, arraste a pasta `dist` para a área de upload.
4. Pronto! Seu site estará online em segundos.

## Funcionalidades
- **Login Seguro**: Autenticação via email/senha.
- **Dashboard**:
  - Lista de alunos.
  - Adição de notas (ex: `8.5 10 7`).
  - Cálculo automático de média e situação (Aprovado/Reprovado).
- **Admin**:
  - Criação de novos usuários (Professores/Admins).
  - Lista de usuários com telefone e email.
