# SRT Studio

Conversor de texto para SRT com a identidade visual de **O Ataque dos Sonhos**.
Processa o roteiro no navegador, sem envio de texto para um servidor.

## Tecnologias e organização

React, TypeScript, Vite, Tailwind CSS e componentes compatíveis com shadcn/ui.
A organização segue o padrão clássico React/Vite dos projetos Lovable, com
imports pelo alias `@/`. Novos projetos Lovable também podem usar TanStack Start;
este conversor usa um frontend estático, com build para a Vercel.

```text
public/
  assets/                 # Foto temática
src/
  components/
    studio/               # Interface do conversor
    ui/                   # Componentes reutilizáveis
  hooks/                  # Estado e ações da conversão
  lib/                    # Conversão SRT e utilitários
  pages/                  # Página inicial e página 404
  test/                   # Configuração dos testes
  App.tsx                 # Rotas
  main.tsx                # Entrada React
  index.css               # Tema, responsividade e animações
components.json           # Configuração shadcn/ui
index.html                # Entrada Vite
vite.config.ts            # React, Tailwind, alias e testes
vercel.json               # Build e rotas na Vercel
```

## Desenvolvimento com NPM

Use Node.js 22.12+ ou 24 LTS e NPM.

```sh
npm install
npm run dev
```

Abra o endereço indicado no terminal, normalmente `http://localhost:5173`.
`npm start` também inicia o desenvolvimento. A página agora é servida pelo
Vite; não é necessário abrir um HTML manualmente.

## Validação e produção

```sh
npm run lint
npm test
npm run build
npm run preview
```

O build valida TypeScript e gera a versão de produção em `dist/`.
O preview serve esse build localmente, normalmente em `http://localhost:4173`.
Também estão disponíveis `npm run test:watch` e `npm run format`.

## Publicar na Vercel

Nesta pasta, execute:

```sh
npx vercel login
npx vercel --prod
```

Selecione sua conta/equipe e crie ou vincule o projeto. Mantenha `./` como
diretório raiz. As configurações já estão em `vercel.json`:

- Framework: Vite.
- Instalação: `npm ci`.
- Build: `npm run build`.
- Saída: `dist`.
- Rotas React: fallback para `index.html`.

Não há variáveis de ambiente nem backend para configurar. Também é possível
enviar o projeto a um repositório Git e importá-lo pelo painel da Vercel,
com as mesmas configurações.

## Conversão

Cada bloco dura 30 segundos, com 10 segundos de intervalo. Os blocos têm até
500 caracteres e 100 palavras, com preferência por separar frases no ponto final.
Inclui progresso animado, prévia, contagem de palavras/caracteres, cópia e download
UTF-8 de `legendas.srt`. O visual respeita a preferência por movimento reduzido.

Referências: [estrutura clássica do Lovable e opções de hospedagem](https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership),
[Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite) e
[shadcn/ui com Vite](https://ui.shadcn.com/docs/installation/vite).
