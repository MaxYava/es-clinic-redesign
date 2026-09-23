import { chromium } from '@playwright/test';
const browser = await chromium.launch({channel:'msedge',headless:true});
for (const mobile of [false,true]) {
 const page = await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5175/');
 const root = page.locator('section[aria-labelledby="tree-closeup-title"]');
 const box = await root.evaluate(el=>({y:el.getBoundingClientRect().top+scrollY,h:el.offsetHeight}));
 for (const progress of [0,.45,1]) {
  await page.evaluate(({box,progress})=>scrollTo({top:box.y+progress*(box.h-innerHeight),behavior:'instant'}),{box,progress});
  await page.waitForTimeout(1000);
  await page.screenshot({path:`artifacts/tree-closeup-${mobile?'mobile':'desktop'}-${Math.round(progress*100)}.png`});
  const ready = await root.locator('[data-ready="true"]').count();
  if (!ready) throw Error('Tree frame not drawn');
 }
 if(errors.length)throw Error(errors.join('\n'));
 await page.close();
}
await browser.close();
