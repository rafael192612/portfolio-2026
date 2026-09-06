# Ativação de produção

Netlify Free e Formspree Free escolhidos, com objetivo de custo zero; contas e publicação ainda pendentes. Conferir limites vigentes nos painéis antes de ativar qualquer recurso pago. Este guia não publica nem configura contas.

## Dados necessários

- URL HTTPS oficial, incluindo subdiretório se existir, e hostname preferido.
- URL real atribuída ao novo projeto Netlify; não existe domínio próprio.
- Endpoint HTTPS de formulário, contrato de resposta e confirmação do destinatário no serviço. Não fornecer credenciais privadas ao frontend.
- Imagem social autorizada e caminho público; política de privacidade/retenção adequada ao destino do formulário.

## Formulário

1. Criar conta Free em Formspree e confirmar o e-mail de cadastro.
2. No painel, criar projeto/formulário e escolher como destinatário o endereço centralizado em `SITE_CONFIG.contact.email`. Confirmar esse destinatário pelo procedimento enviado pelo serviço; editar config.js não configura a entrega.
3. Copiar o endpoint HTTPS exibido na integração do formulário e fornecer essa URL. Não fornecer senha, API key privada ou token de conta.
4. Inserir a URL em `SITE_CONFIG.contact.endpoint`, revisar antispam/restrições de origem e, quando autorizado, testar aceite e entrega na caixa de entrada/spam.

O fetch nativo já usa POST FormData e Accept JSON, sem biblioteca adicional. A documentação oficial demonstra sucesso por `response.ok` e erros no corpo `errors` para respostas de falha. O cliente rejeita HTTP não 2xx antes de resetar; mantém mensagem acessível genérica, sem injetar texto remoto como HTML. Integração real e desafios de antispam dependem da conta e continuam pendentes. Referências: [Formspree — AJAX](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax) e [validação no servidor](https://formspree.io/blog/server-side-validation/).

Preencher somente `SITE_CONFIG.contact.endpoint` em `assets/js/config.js`. O destino deve aceitar POST FormData com `name`, `company`, `whatsapp`, `email`, `need`, `message` e `_gotcha`, sem cookies, sem redirect e com CORS permitindo a origem real. O cliente usa `Accept: application/json`, mas atualmente decide aceite pelo status HTTP 2xx; respostas de erro lógico com HTTP 200 exigem adaptar esse contrato antes de ativar.

Confirmar validação server-side, limite de mensagem de 20–500, limites de tamanho e frequência, antispam/honeypot e entrega ao destinatário. Liberar a origem exata em `connect-src`. Com autorização para envios de teste, verificar sucesso, 4xx/5xx, erro de rede/CORS, timeout de 15 s, clique duplicado, reset e preservação dos campos após erro. O serviço deve tolerar eventual repetição: timeout cliente não prova que o servidor não recebeu a mensagem.

## Domínio e SEO estático

Após confirmar a URL oficial, realizar uma única alteração coordenada:

1. `assets/js/config.js`: preencher `SITE_CONFIG.siteUrl` com a URL canônica HTTPS.
2. `index.html`: adicionar canonical, `og:url`, `og:image` absoluta e imagem Twitter. Ampliar JSON-LD com WebSite e WebPage, usando IDs absolutos consistentes (`#website`, `#webpage`, `#organization`), URL e relações `isPartOf`/`publisher`. Manter Organization e conteúdo real.
3. `assets/img/`: incluir imagem social autorizada, otimizada, com dimensões e alt nos metadados correspondentes.
4. Criar `sitemap.xml` estático com apenas URLs públicas canônicas existentes; uma entrada para a home atual, sem fragmentos de seção e sem tests/. Informar lastmod apenas se conhecido.
5. `robots.txt`: adicionar `Sitemap:` com a URL absoluta do sitemap. Revisar `site.webmanifest` se nome, ícones ou escopo de publicação mudarem.
6. Hospedagem: HTTPS, redirecionamentos para o hostname escolhido, MIME correto, exclusão de arquivos internos, compressão e cache apropriado. Validar URLs e indexação na publicação.

Não gerar canonical/sitemap com localhost, preview ou domínio fictício. O preenchimento de siteUrl sozinho não altera metadados estáticos. Para esta home, edição coordenada é mais simples que introduzir um gerador/parser de configuração JavaScript; não depender da execução de JS pelos crawlers.

## Headers: proposta para revisão na hospedagem

`netlify.toml` é a configuração atual: publish `dist`, empacotamento por Python 3.13 no ambiente Netlify, sem compilação JS ou pacotes externos. Localmente, usar Python 3.11+ e `python scripts/prepare_deploy.py`; para deploy manual, enviar somente dist/. O script recria exclusivamente essa pasta gerada, copia arquivos públicos e gera `_headers` da mesma fonte TOML. Não editar dist/ manualmente. A configuração por Git será usada somente quando uma publicação for autorizada; nenhum push foi feito.

Headers preparados: nosniff, strict-origin-when-cross-origin, permissões mínimas, X-Frame-Options DENY e CSP Report-Only com CDN/model-viewer e `https://formspree.io` em connect-src. Cache global `public, max-age=0, must-revalidate` permite revalidação de arquivos sem hash; sem immutable, redirects artificiais ou HSTS. Validar os headers servidos após publicar. Fontes: [configuração Netlify](https://docs.netlify.com/build/configure-builds/file-based-configuration/), [headers](https://docs.netlify.com/manage/routing/headers/) e [Python no ambiente de preparação](https://docs.netlify.com/build/configure-builds/available-software-at-build-time/).

Não são uma política homologada. Começar a avaliação de CSP com Report-Only, considerando recursos internos do model-viewer e estilos dinâmicos. Escolher um coletor real antes de acrescentar `report-to` e `Reporting-Endpoints`; sem coletor, não há telemetria remota. Não inventar endereço de relatórios.

```text
Content-Security-Policy-Report-Only: default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self' https://ajax.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self' https://ajax.googleapis.com https://formspree.io; worker-src 'self' blob:; media-src 'self' blob:; form-action 'none'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), xr-spatial-tracking=()
X-Frame-Options: DENY
```

Report-Only monitora, não bloqueia. Após testes, migrar a política revisada para `Content-Security-Policy`; `frame-ancestors 'none'` exige header HTTP efetivo. X-Frame-Options oferece proteção adicional contra enquadramento. `form-action 'none'` bloqueia envio HTML nativo, não fetch; o endpoint precisa de `connect-src`. Restringir `img-src` às origens usadas. Não liberar scripts inline indiscriminadamente: avaliar JSON-LD e hash do conteúdo exato se necessário. Dynamic import não oferece atributo SRI; a versão CDN continua fixa.

Somente após domínio/HTTPS estáveis, avaliar `Strict-Transport-Security: max-age=31536000`. Não incluir subdomínios ou preload sem verificar todos os hosts e suas consequências. Não aplicar HSTS em desenvolvimento HTTP.

Referências: [MDN — CSP Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only) e [MDN — HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security).

## Critérios de liberação

Assets existentes: logo raster quadrada 1254×1254; demais artes são SVG e o modelo GLB. Há resolução para reutilizar a logo sem distorcer, mas não uma composição social oficial aprovada. Não foi gerada arte nem preenchida og:image. Criar peça social autorizada e validar proporção/corte antes de publicar metadados absolutos.

Auditoria estática não substitui execução. Testar Light/Dark, teclado, contraste, formulário e modal de fixture; manter o cadastro comercial vazio. Priorizar 320–3440 px e zoom real 50/100/150/200%, com Chrome/Edge/Firefox/Safari e dispositivos iOS/Android disponíveis. Medir Lighthouse, waterfall, long tasks, LCP/CLS/FCP/TBT em laboratório; INP de campo requer dados reais suficientes. Não estimar scores nem confundir TBT com INP.

Publicar apenas HTML, robots, manifest, assets e sitemap quando existir. Excluir docs/, tests/, .git e arquivos internos. Nenhum backend/SQL existe atualmente; SQL injection não se aplica ao frontend. Proteções de conta, DNS e infraestrutura dependem do provedor.
