import xss from "xss";

const allowList = {
  p: [], br: [], hr: [],
  h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
  strong: [], b: [], em: [], i: [], u: [], s: [],
  ul: [], ol: [], li: [], blockquote: [],
  pre: [], code: [],
  a: ["href", "title"],
  img: ["src", "alt", "title", "width", "height"],
  figure: [], figcaption: [],
  table: [], thead: [], tbody: [], tr: [], th: [], td: [],
};

export function sanitizeRichHtml(value: string) {
  return xss(value, {
    allowList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "svg", "math"],
    css: false,
  });
}
