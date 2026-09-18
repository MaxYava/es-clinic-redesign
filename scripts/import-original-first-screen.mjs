import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

// Import the original cascade, not another hand-tuned approximation.
const source = '../published/es-clinic-original';
const html = fs.readFileSync(`${source}/index.html`, 'utf8');
const map = {
  'esc-hero': 'screen', 'esc-hero__inner': 'inner', 'esc-hero__deco': 'decoration',
  'esc-hero__content': 'content', 'esc-hero__eyebrow': 'eyebrow', 'esc-hero__eline': 'eyeline',
  'esc-hero__title': 'title', 'esc-hero__tagrow': 'tagrow', 'esc-hero__tagline': 'tagline',
  'esc-hero__cta': 'cta', 'esc-hero__card': 'card', 'esc-hero__avatars': 'avatars',
  'esc-hero__avbtn': 'more', 'esc-hero__mclover': 'mobileMark', 'esc-hero__mphoto': 'mobilePhoto',
  'esc-header': 'header', 'esc-header--dark': 'dark', 'esc-header__inner': 'headerInner',
  'esc-header__left': 'left', 'esc-header__right': 'right', 'esc-menu-btn': 'menuButton',
  'esc-burger': 'burger', 'esc-address': 'address', 'esc-logo': 'brand', 'esc-phone': 'phone',
  'esc-call-btn': 'social', 'esc-tg-btn': 'telegram', 'esc-ico-line': 'icon', 'av': 'avatar',
};
const result = postcss.root();
function convert(container, target) {
  for (const node of container.nodes ?? []) {
    if (node.type === 'rule') {
      if (node.selector === ':root') {
        target.append(node.clone({ selector: '.screen, .header' }));
        continue;
      }
      const selectors = node.selectors.filter(selector => /\.esc-(hero|header|burger|address|logo|phone|menu-btn|call-btn|tg-btn)/.test(selector));
      const selected = selectors.filter(selector => [...selector.matchAll(/\.([\w-]+)/g)].every(m => map[m[1]] || m[1] === 'is-open'));
      if (!selected.length) continue;
      target.append(node.clone({ selector: selected.map(selector => selector.replace(/\.([\w-]+)/g, (_, name) => `.${map[name] ?? 'open'}`)).join(', ') }));
    } else if (node.type === 'atrule') {
      if (node.name === 'font-face' || /keyframes$/.test(node.name)) target.append(node.clone());
      else if (node.nodes) {
        const group = node.clone({ nodes: [] });
        convert(node, group);
        if (group.nodes.length) target.append(group);
      }
    }
  }
}
for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) convert(postcss.parse(match[1]), result);
// The original header is a sibling of the hero. In React it lives inside it,
// so the hero reset must not override the header's margins and padding.
let css = result.toString().replaceAll('.screen *{', ':where(.screen *){').replaceAll('/mirror/', '/assets/original-first-screen/');
fs.mkdirSync('public/assets/original-first-screen', { recursive: true });
for (const match of css.matchAll(/\/assets\/original-first-screen\/([\w.-]+)/g)) {
  const name = match[1];
  fs.copyFileSync(path.join(source, 'mirror', name), path.join('public/assets/original-first-screen', name));
}
// JSX uses next/image rather than inline SVG: preserve its original sizing.
css += `\n.screen { position: relative; min-height:100svh; }\n.title img {display:block;width:100%;height:auto;}\n.brand img {display:block;width:100%;height:100%;}\n.decoration img {width:100%;height:100%;}\n.tagline p {margin:0;font:inherit;letter-spacing:inherit;}\n.cta {background:transparent;}\n.burger {display:flex;flex-direction:column;gap:5px;width:24px;}\n.burger span {height:2px;display:block;width:100%;background:currentColor;}\n.burger span:first-child {width:52%;}\n.burger span:last-child {width:52%;margin-left:auto;}\n.social {display:inline-flex;}\n.social img {width:20px;height:20px;}\n.menu {position:absolute;top:100%;left:64px;background:#fef5e4;color:#533e2d;padding:24px;min-width:240px;}\n.menu[hidden]{display:none;}\n.menu a{display:block;padding:12px;font-size:18px;}\n@media(max-width:768px){.screen{position:relative;} .social{display:none;} .title img {filter:brightness(0) saturate(100%) invert(24%) sepia(15%) saturate(1166%) hue-rotate(345deg) brightness(94%) contrast(87%);} }\n`;
css += `\n@font-face{font-family:'Geologica';src:url('/assets/official-geologica.woff') format('woff');font-weight:400;font-style:normal;font-display:swap;}\n.header{font-size:16px;}\n@media(max-width:768px){.screen{min-height:auto;} .menu{left:16px;right:16px;} }\n`;
css += `\n.mobileContact{display:none;}\n@media(max-width:768px){.brand img{filter:brightness(0) saturate(100%) invert(59%) sepia(13%) saturate(466%) hue-rotate(345deg) brightness(94%);} .mobileMark img{filter:brightness(0) saturate(100%) invert(72%) sepia(22%) saturate(746%) hue-rotate(341deg) brightness(94%) contrast(89%);} }\n@media(max-width:430px){.mobileContact{display:flex;color:#533e2d;width:32px;height:32px;align-items:center;justify-content:center;} .mobileContact svg{width:24px;height:24px;} }\n`;
// Contain the app-wide typography reset; editable content uses plain strings.
css += `\n@media(max-width:430px){.mobileContact{display:block;position:relative;width:38px;height:38px;} .mobileContact summary{display:flex;align-items:center;justify-content:center;width:38px;height:38px;padding:6px;cursor:pointer;list-style:none;} .mobileContact summary::-webkit-details-marker{display:none;} .mobileContact svg{width:26px;height:26px;} .contactMenu{position:absolute;left:0;top:calc(100% + 10px);padding:12px;background:#FEF5E4;border:1px solid rgba(83,62,45,.15);border-radius:16px;min-width:160px;box-shadow:0 10px 30px #0002;} .contactMenu a{display:block;padding:10px 12px;font-size:16px;}}\n`;
css += `\n.eyebrow{white-space:normal;}\n.title{margin:0;font-size:32px;font-weight:700;line-height:normal;}\n.card p{white-space:normal;}\n.avatars .avatar[data-doc="2"] img{object-position:50% 60%;}\n@media(max-width:768px){.eyebrow{white-space:pre-line;} .screen h1{margin:0 0 26px;}}\n`;
fs.writeFileSync('app/ui/original-first-screen.module.css', css);
console.log('Imported original first-screen CSS and its local assets.');
