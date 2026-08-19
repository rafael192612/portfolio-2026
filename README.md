# Portfólio de Raphael Sillva

Portfólio profissional single page, desenvolvido com HTML semântico, CSS moderno e JavaScript modular, sem framework, publicado pelo GitHub Pages.

**Site:** [rafael192612.github.io/portfolio-2026](https://rafael192612.github.io/portfolio-2026/)

## Executar localmente

Como os scripts usam módulos ES, abra o projeto por um servidor HTTP local. Uma opção simples no VS Code é a extensão Live Server.

## Estrutura principal

- `index.html`: conteúdo, SEO e estrutura semântica.
- `css/portfolio.css`: temas, componentes, animações e responsividade.
- `js/main.js`: interações, acessibilidade, tema, formulário e efeitos.
- `js/projects.js`: dados dos dez projetos conceituais.
- `data/contatos.json`: fonte central dos contatos profissionais e do endpoint do formulário.
- `assets/`: imagens responsivas, avatar e identidade visual.
- `privacidade.html`: informações sobre o tratamento dos dados enviados pelo formulário.
- `site.webmanifest`: metadados de instalação e identidade do site.

## Formulário

O formulário envia os dados por AJAX ao FormSubmit e mantém uma alternativa pronta para o WhatsApp caso o serviço não responda. O endpoint é carregado de `data/contatos.json`, enquanto o atributo `action` no HTML funciona como alternativa sem JavaScript.

Na primeira utilização, o FormSubmit enviará uma mensagem de ativação para `Raphaelsillva2018rg@gmail.com`. É necessário confirmar esse e-mail uma única vez para começar a receber os contatos.

## Publicação

Todos os caminhos de navegação e assets são relativos e compatíveis com o GitHub Pages. As URLs canônicas, metadados sociais, `robots.txt` e `sitemap.xml` apontam para a URL pública do projeto.

## Etapas externas para a versão pública

- Confirmar o primeiro e-mail de ativação enviado pelo FormSubmit.
- Publicar a raiz deste repositório pelo GitHub Pages.

Os cards de projetos são apresentados explicitamente como estudos conceituais. Enquanto não existirem repositórios ou demonstrações públicas reais, o modal direciona o visitante para conversar sobre uma solução semelhante, evitando links vazios ou alegações incorretas.

## Imagens

A fotografia principal de 2026, o avatar e o retrato possuem versões WebP responsivas prontas para publicação.

## Identidade visual

A marca principal está em `assets/logo/raphael-mark.svg` e utiliza o monograma RS, a lua crescente e a paleta do portfólio.

O tema claro utiliza `#B1CDF2`, `#97B5DE`, `#5271A1`, `#295187` e `#103778`. O tema escuro preserva a identidade original em vermelho, laranja, verde e petróleo. As marcas SVG também são alternadas automaticamente conforme o tema.
