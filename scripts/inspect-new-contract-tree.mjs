import { chromium } from '@playwright/test';
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://127.0.0.1:5175/');
const root = page.locator('[class*=journey]').first();
const box = await root.evaluate(el => ({y:el.getBoundingClientRect().top+scrollY,h:el.offsetHeight}));
for (const progress of [0,.25,.5,.75,1]) {
 await page.evaluate(({box,progress}) => scrollTo({top:box.y-95+progress*(box.h-(innerHeight-95)),behavior:'instant'}), {box,progress});
 await page.waitForTimeout(700);
 await page.screenshot({path:`artifacts/new-tree-${Math.round(progress*100)}.png`});
}
await browser.close();
