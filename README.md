# Focalize

Gerenciador de objetivos de estudo com CRUD completo, persistência no navegador via `localStorage` e **Flow Mode** com timer Pomodoro integrado.

Desenvolvido com **React 19**, **TypeScript** (strict mode), **Vite** e **Tailwind CSS**.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js**: versão 18 ou superior (`node -v`)
- **npm**: versão 9 ou superior (`npm -v`)

### Passo a passo
```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Executar o servidor de desenvolvimento
npm run dev

# 3. Testar a verificação de tipos e compilação de produção
npm run build

# 4. Pré-visualizar a build de produção localmente
npm run preview
```

O projeto iniciará em `http://localhost:3000` (ou na porta configurada pelo Vite).

---

## ⚡ Como Fazer Deploy na Vercel (1-Click Deploy)

O projeto já está configurado com `vercel.json` e detectado automaticamente pela Vercel sem necessidade de configurações manuais adicionais.

### Passo a passo:
1. Faça o push do repositório para o seu **GitHub**.
2. Acesse o painel da [Vercel](https://vercel.com/) e clique em **"Add New Project"**.
3. Importe o repositório **Focalize**.
4. A Vercel detectará automaticamente as configurações:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Nenhuma necessária (100% client-side com persistência local).
5. Clique em **"Deploy"**. Em menos de 1 minuto seu app estará no ar com HTTPS e CDN global.

---

## 🛠️ Arquitetura e Tecnologias

- **Front-end**: React 19 + TypeScript (Strict)
- **Bundler**: Vite 8
- **Estilização**: Tailwind CSS v4 + Plus Jakarta Sans & JetBrains Mono
- **Ícones**: Lucide React
- **Persistência**: `localStorage` com versionamento de chaves (`focalize:v1:*`), validação com type guards e fallback contra corrupção
- **Áudio**: Alertas sonoros sintetizados via Web Audio API (sem dependência de arquivos de áudio externos)
