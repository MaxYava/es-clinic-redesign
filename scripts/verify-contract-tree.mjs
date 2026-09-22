import { chromium } from '@playwright/test';
const browser = await chromium.launch({channel:'msedge',headless:true});
for (const mobile of [false,true]) {
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5175/');
 const root=page.locator('[class*=journey]').first();
 const box=await root.evaluate(e=>({y:e.getBoundingClientRect().top+scrollY,h:e.offsetHeight}));
 for(const progress of [0,.5,1,0]) {
  await page.evaluate(({box,progress})=>scrollTo({top:box.y-95+progress*(box.h-(innerHeight-95)),behavior:'instant'}),{box,progress});
  await page.waitForTimeout(800);
  const visible=await root.locator('[data-visible="true"]').count();
  if(visible!== (progress===0?0:progress===.5?2:3)) throw Error('Reveal failed '+visible);
 }
 await page.evaluate(box=>scrollTo({top:box.y-95+(box.h-(innerHeight-95)),behavior:'instant'}),box);
 await page.waitForTimeout(800);
 await page.screenshot({path:`artifacts/contract-${mobile?'mobile':'desktop'}.png`});
 await root.locator('button[aria-haspopup=dialog]').first().click();await page.waitForTimeout(700);
 if(!await page.locator('dialog[open]').isVisible()) throw Error('Dialog failed'); await page.keyboard.press('Escape'); if(await page.locator('dialog[open]').count()) throw Error('Dialog close failed');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Horizontal overflow');
 if(errors.length) throw Error(errors.join('\n'));
 console.log(mobile?'Mobile OK':'Desktop OK');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
 if(await root.locator('[data-visible="true"]').count()!==3) throw Error('Reduced motion failed');
 await page.close();
}
await browser.close();

