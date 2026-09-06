# VERTEX

## Visão geral

VERTEX DIGITAL cria landing pages e experiências digitais profissionais para empresas. Identidade comercial aplicada aos metadados e manifest; logo preservada. Hospedagem escolhida: Netlify Free; formulário: Formspree Free. O cadastro de trabalhos começa vazio, intencionalmente.

## Stack

HTML, CSS, JavaScript nativo com ES Modules, Canvas 2D e model-viewer 4.3.1. Sem Node, npm, frameworks ou build.

## Como executar

ES Modules exigem HTTP(S); `file://` não é suportado. Use o servidor do editor ou Python instalado:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Abra http://localhost:8000/. Sirva `.js` com MIME JavaScript e `.glb` como `model/gltf-binary`. Caminhos relativos permitem hospedagem em subdiretório.

## Estrutura principal

```text
index.html
assets/css/style.css
assets/js/                 # Entrada, configuração e módulos
assets/js/works/           # Cadastro, validação, cards e modal
assets/trabalhos/          # Mídia autorizada
assets/img/ e assets/logo/ # Artes, favicon, poster e GLB
robots.txt
site.webmanifest
tests/                    # Auditoria e suíte nativa
```

## Arquitetura JavaScript

`script.js` define a ordem de inicialização: renderização antes do reveal e select antes do formulário. Os módulos separam tema, navegação, Hero, partículas, contato e trabalhos. `theme-bootstrap.js` é a exceção clássica para aplicar tema antes do CSS com storage protegido.

O modal usa import dinâmico ao abrir um trabalho; o 3D carrega por visibilidade/idle. Falhas opcionais são isoladas. A página pressupõe uma inicialização dos módulos.

## Configuração pública

`assets/js/config.js` exporta `SITE_CONFIG`: marca, autoria, WhatsApp, endpoint, e-mail, redes e domínio. WhatsApp atual: `5521976918326`. Dados ausentes permanecem vazios; canais opcionais aparecem somente quando válidos.

Nunca coloque secrets, senhas ou tokens privados no frontend. Ao alterar marca, telefone ou domínio, sincronize os fallbacks estáticos do HTML, JSON-LD e manifest.

## Nosso Trabalho

Fluxo: `works/trabalhos.js` → validação → cards → modal. A âncora permanece `#projetos`. Coloque mídia autorizada em `assets/trabalhos/` e adicione dados reais ao array. Exemplo ilustrativo, não cadastrado:

```js
{
  id: "trabalho-real",
  title: "Título autorizado",
  description: "Descrição do trabalho realizado.",
  technologies: ["HTML", "CSS", "JavaScript"],
  image: "./assets/trabalhos/preview.webp",
  demo: ""
}
```

`id`, `title`, `description` e o array `technologies` são obrigatórios. ID único, em minúsculas/números separados por hífens. Opcionais: `category`, `categoryLabel`, `status`, `problem`, `solution`, `challenges`, `gradient`, `github`, `demo` e `gallery` (imagens). Gradientes são restritos e URLs validadas: HTTPS ou mídia HTTP da mesma origem no desenvolvimento, sem credenciais embutidas. Registros inválidos são ignorados com aviso. DOM usa `textContent`; preview ausente possui fallback. Não editar HTML por trabalho.

## Formulário

Implementação cliente concluída; envio online depende de endpoint real. Mensagem de 20 a 500 unidades UTF-16, contador associado por `aria-describedby`, sem anúncios por caractere, textarea sem resize e com rolagem interna.

Endpoint vazio: feedback textual de envio inativo e WhatsApp flutuante como alternativa. O único CTA principal do formulário é “Quero conversar sobre meu projeto”. Não há sucesso simulado.

Com endpoint HTTPS: POST FormData, validação cliente, timeout de 15 segundos, bloqueio de duplicação, cookies omitidos e redirects rejeitados. Aceite HTTP permite reset de campos, contador, erros e select; erro preserva dados. Aceite pelo serviço não comprova entrega de e-mail. Validação e antispam no destino são necessários.

Formspree Free escolhido, ainda sem conta/endpoint. O e-mail temporário está centralizado em `SITE_CONFIG.contact.email`; o destinatário precisa ser confirmado no Formspree. [Guia de produção](docs/production.md) contém o passo a passo e contrato de resposta.

## Responsividade e acessibilidade

Serviços usam duas colunas acima de 48rem (768px com fonte raiz padrão) e uma coluna até essa largura, nos temas Light e Dark. Trilhas `minmax(0, 1fr)`, conteúdo com `min-width: 0` e quebra de palavras permitem acomodar textos sem impor largura mínima aos cards. Modal tem rolagem, foco contido, Escape e restauração de foco. Há labels, feedback acessível, skip link, foco visível e reduced motion. Select nativo e fallbacks preservam conteúdo quando melhorias opcionais falham.

Homologação visual/cross-browser pendente.

## Alterações visuais implementadas

Registro do estado atual do código; não equivale a validação visual:

- Topbar Light com degradê grafite/preto, transparência, desfoque e textos claros. Navegação e recolhimento estão em `navigation.js`.
- Hero com `logo3d.glb`, orientação frontal, câmera configurável em `hero.js`, distância atual de 149.058%, título reduzido e fallback textual. Prévia SVG removida da exibição e arquivo antigo excluído após verificar ausência de referências, preservando o modelo e o espaço da Hero. Sombra oval abaixo da logo no Light.
- Serviços com oito cards, fundo abstrato em `services-abstract.svg`, versão invertida no Dark e tratamento de leitura sobre a arte. Nesta alteração, a grade passou de uma a quatro colunas automáticas para duas colunas no desktop e uma no mobile, preservando espaçamentos, conteúdo, temas e reveal existentes.
- Nosso Trabalho mantém a âncora `#projetos`, cadastro real vazio e mensagem de novos trabalhos em desenvolvimento. O Light usa fundo petrol com hexágonos e composição que preserva o canvas global de partículas; nenhum trabalho fictício foi cadastrado.
- Sobre tem barra vertical vinculada à rolagem, com degradê laranja/vermelho no Light e respeito à preferência de movimento reduzido.
- Formulário, WhatsApp, Footer, temas, configuração pública e preparação de hospedagem estão documentados nas seções correspondentes e em `docs/production.md`.

Manutenção: registrar neste README cada alteração futura de comportamento, aparência ou configuração, junto da validação efetivamente executada e das pendências restantes. Preservar alterações já documentadas e não marcar homologação como concluída apenas por inspeção de código.

## Performance

Um canvas global e um loop contínuo da aplicação para partículas; densidade 22–180 e DPR limitado a 1,5. Efeitos pausam por visibilidade/reduced motion quando aplicável. GLB de 157888 bytes com carregamento progressivo e fallback textual, sem poster SVG; biblioteca fixa em 4.3.1.

Trabalhos Light: base petrol -1 → canvas/hexágonos 0 → conteúdo 1. Não reintroduza isolamento no `main` Light sem revisar a composição.

## SEO e segurança

Metadados, Organization JSON-LD, robots, favicon e manifest presentes. Domínio, canonical, sitemap e imagens sociais absolutas dependem de dados reais. Manifest não significa suporte offline.

O [guia de produção](docs/production.md) define atualização de config.js, index.html, imagem social, sitemap.xml e robots.txt. URL e endpoint permanecem vazios; configuração Netlify preparada localmente, ainda não publicada.

Sem backend, sessão ou SQL atualmente. URLs e dados editoriais são validados; o frontend não substitui segurança da hospedagem. CSP e headers precisam de configuração e testes no servidor, considerando CDN/model-viewer e futuro endpoint. `frame-ancestors` exige header HTTP; robots não protege arquivos privados.

Netlify: `netlify.toml` define publicação de `dist/`, headers e cache com revalidação (sem immutable/HSTS). `python scripts/prepare_deploy.py` copia somente arquivos públicos e gera `_headers` para upload manual. Exige Python 3.11+ apenas na preparação, sem compilação da aplicação. Não publique a raiz; docs, tests e diretórios internos ficam fora do pacote.

## Verificação

`python tests/audit.py` e `git diff --check` passaram; TOML e pacote público foram verificados localmente. A auditoria cobre IDs, âncoras, assets, imports/exports, ciclos e JSON, sem executar DOM. `/tests/works.html` oferece a suíte nativa por HTTP. Nenhum resultado visual ou score foi presumido.

## Prontidão para Publicação

A VERTEX DIGITAL está tecnicamente preparada para publicação, mas ainda depende de homologação visual e funcional real antes de colocá-la no ar. O usuário não pretende publicar agora; o desenvolvimento pode continuar localmente.

### Já concluído

Itens comprovados por implementação e inspeção/auditoria estática, sem equivaler à homologação em navegador:

- [x] HTML/CSS/JavaScript organizados, ES Modules e SITE_CONFIG centralizado.
- [x] Temas Light/Dark, layout e Serviços responsivos implementados.
- [x] Nosso Trabalho preparado e modal com reflow e suporte de teclado implementados.
- [x] Canvas único de partículas e carregamento progressivo do 3D implementados.
- [x] Formulário cliente com validação, contador, limite de 500 e reset condicionado ao aceite.
- [x] SEO base, manifest, robots e Organization JSON-LD.
- [x] Configuração Netlify, pacote público e headers preparados localmente.
- [x] README/guia de produção atualizados; auditorias estáticas e diff checks executados.

### Falta antes da publicação real

- [ ] Testar Light/Dark, backgrounds e partículas de Serviços/Trabalhos em navegador real.
- [ ] Homologar mobile/tablet/desktop, zoom até 200% e cross-browser.
- [ ] Validar formulário, contador, custom select, teclado, foco, contraste, leitor de tela e alvos de toque.
- [ ] Executar Lighthouse, verificar Core Web Vitals quando houver dados e medir 3D/partículas em dispositivo real.
- [ ] Validar HTTPS, pacote público, headers e CSP Report-Only em ambiente real de hospedagem; corrigir violações legítimas e avaliar CSP definitiva.

A verificação de hospedagem exige uma implantação de homologação quando autorizada, antes de considerar o site oficialmente lançado. Não há autorização de publicação agora.

### Pode ficar para depois

Estas tarefas podem aguardar enquanto o projeto permanece local; cada recurso deve ser configurado e validado antes de sua ativação:

- [ ] Criar o projeto/URL pública na Netlify e registrar a URL real em SITE_CONFIG.siteUrl.
- [ ] Configurar domínio próprio futuramente (opcional para usar a URL Netlify).
- [ ] Configurar canonical, og:url, JSON-LD absoluto, sitemap.xml e Sitemap no robots.txt após existir URL real.
- [ ] Criar conta/formulário Formspree, confirmar destinatário de SITE_CONFIG.contact.email e configurar endpoint real.
- [ ] Testar envio/entrega, erro, timeout, duplicação, reset, CORS e antispam; validar privacidade/retenção antes de ativar o envio.
- [ ] Criar imagem social oficial e validar Open Graph/Twitter Card; verificar Search Console após publicação.
- [ ] Avaliar HSTS somente após homologação HTTPS, sem preload automático.
- [ ] Cadastrar trabalhos reais conforme forem concluídos; conteúdo futuro, sem bloqueio técnico para publicação.

## Commits / fluxo

Após cada melhoria aprovada e validada, criar commit local com arquivos relacionados e README quando necessário. Revisar diff, executar testes e `git diff --check` antes do commit. Push manual, somente com autorização explícita. Histórico detalhado no Git; os pontos `e655b79` e `ba70b13` permanecem preservados.

Manter pendências reais nesta lista; marcar `[x]` apenas após comprovação, no mesmo commit da alteração. Não marcar teste real como concluído por inspeção estática, nem adicionar ideias cosméticas ou histórico de bugs resolvidos.

> [!IMPORTANT]
> **Lembrete antes de autorizar a publicação:** o principal impedimento ainda é a **homologação local em navegador real** — Light/Dark, partículas, responsividade, formulário/interface, teclado/foco e uma checagem de performance. A implementação estática não substitui essa validação.
>
> Checklist de homologação — preencher somente após executar:
>
> - [ ] Conferir Light e Dark, contraste e fundos de todas as seções.
> - [ ] Conferir Serviços com duas colunas no desktop e uma no mobile, incluindo 768px e 769px.
> - [ ] Testar larguras de 320, 375, 768, 1024, 1440 e 1920px e zoom de 200%, sem overflow ou cortes de conteúdo.
> - [ ] Conferir partículas, logo 3D/fallback, sombra Light, reveal e barra de Sobre.
> - [ ] Testar recolhimento da topbar, menu mobile, alternância de tema e persistência.
> - [ ] Validar estado vazio de Nosso Trabalho e executar a suíte `tests/works.html` para cards/modal.
> - [ ] Validar formulário, contador, custom select, feedback de envio inativo e WhatsApp.
> - [ ] Testar teclado, foco, Escape, leitor de tela e movimento reduzido.
> - [ ] Conferir console sem erros novos e carregamento dos recursos.
> - [ ] Medir performance/Lighthouse e testar navegadores e dispositivos reais.
> - [ ] Após autorização de homologação online, validar HTTPS, headers e CSP antes do lançamento.
