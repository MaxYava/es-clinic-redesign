import { spawnSync } from 'node:child_process';

// Run after opening official-fix and local-fix agent-browser sessions.
function browser(session, command, input) {
  const run = spawnSync('cmd.exe', ['/d', '/s', '/c', `npx --yes agent-browser --session ${session} ${command}`], {
    input, encoding: 'utf8', timeout: 30000,
  });
  if (run.status !== 0) throw new Error(run.stderr || run.stdout);
  return run.stdout.trim();
}
const officialSelectors = ['.esc-header', '.esc-address', '.esc-logo', '.esc-header__right', '.esc-hero', '.esc-hero__content', '.esc-hero__eyebrow', '.esc-hero__title', '.esc-hero__tagline', '.esc-hero__cta', '.esc-hero__card', '.esc-hero__deco'];
const moduleClasses = ['header', 'address', 'brand', 'right', 'screen', 'content', 'eyebrow', 'title', 'tagline', 'cta', 'card', 'decoration'];
function read(session, official) {
  const selectors = official ? officialSelectors : moduleClasses.map(name => `[class~="original-first-screen-module__4_Eyuq__${name}"]`);
  // Use suffix matching so verification does not depend on CSS-module build hashes.
  const script = `JSON.stringify(${JSON.stringify(selectors)}.map((selector,i)=>{
    const el=${official ? 'document.querySelector(selector)' : `i===4?document.querySelector('[data-hero-version]'):[...document.querySelector('[data-hero-version]').querySelectorAll('[class]')].find(e=>[...e.classList].some(c=>c.endsWith('__'+${JSON.stringify(moduleClasses)}[i])))`};
    const r=el.getBoundingClientRect();const s=getComputedStyle(el);
    return {rect:[r.x,r.y,r.width,r.height],display:s.display,fontSize:s.fontSize,lineHeight:s.lineHeight};
  }))`;
  return JSON.parse(JSON.parse(browser(session, 'eval --stdin', script)));
}
let failed = false;
for (const [width, height] of [[1680, 945], [1280, 720], [908, 882], [390, 844]]) {
  for (const session of ['official-fix', 'local-fix']) browser(session, `set viewport ${width} ${height}`);
  const expected = read('official-fix', true);
  const actual = read('local-fix', false);
  const issues = [];
  expected.forEach((item, i) => {
    const delta = Math.max(...item.rect.map((n, j) => Math.abs(n - actual[i].rect[j])));
    if (delta > 0.5 || item.display !== actual[i].display) issues.push({element:moduleClasses[i], delta, expected:item, actual:actual[i]});
  });
  console.log(JSON.stringify({viewport:[width,height], status:issues.length?'FAIL':'PASS', issues}));
  failed ||= issues.length > 0;
}
process.exitCode = failed ? 1 : 0;
