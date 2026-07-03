# Galeria AUVP

Landing page do Museu de Artes AUVP — uma galeria virtual em que a obra é o
centro: imagens em largura total, tipografia pontual e cards que se adaptam
às dimensões reais de cada peça.

## Como rodar

É um site estático, sem build e sem dependências:

```bash
# qualquer servidor estático serve; por exemplo:
npx serve .
# ou
python3 -m http.server 8000
```

Abra `http://localhost:8000` (ou simplesmente abra `index.html` no navegador).

## Estrutura

```
index.html      # conteúdo e dados das obras (data-attributes)
css/style.css   # design system: tipografia, galeria justificada, lightbox
js/main.js      # reveal on scroll, lightbox, fluxo de aquisição, fallbacks
```

## Como funcionam os cards adaptativos

Cada obra declara sua proporção real (largura ÷ altura) na variável CSS `--r`:

```html
<figure class="art" style="--r: 0.876" ...>
```

Dentro de uma `.art-row` (flexbox), cada card recebe
`flex-grow: calc(var(--r) * 1000)` e `aspect-ratio: var(--r)`. O resultado é
uma **galeria justificada**: todas as obras de uma linha têm a mesma altura e
a largura de cada card é proporcional às dimensões reais da pintura — um
retrato ocupa menos largura que uma paisagem, sem cortar nenhuma obra.

## Imagens placeholder

As obras exibidas são de domínio público, servidas pelo Wikimedia Commons via
`Special:FilePath` (URL estável baseada no nome do arquivo, com `?width=` para
controlar a resolução). Caso alguma imagem fique indisponível, o JavaScript
substitui o frame por um placeholder identificado ("Obra em montagem").

Para trocar pelas artes definitivas, basta atualizar em cada `<figure class="art">`:

- `src` da `<img>` e `data-img` (versão em alta para o lightbox)
- `--r` com a proporção da nova obra (largura ÷ altura)
- os `data-attributes` de título, artista, técnica, dimensões e preço

## Aquisição

O fluxo de compra é deliberadamente "concierge" (produto premium, não
e-commerce): o botão **Adquirir esta obra** registra o interesse e informa que
um curador fará contato — pronto para ser ligado a um CRM, formulário ou
WhatsApp no futuro.
