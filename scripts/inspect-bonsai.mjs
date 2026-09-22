import { chromium } from '@playwright/test';
const browser=await chromium.launch({...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE} : {}),headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
page.on('pageerror',e=>console.log('ERROR',e.message));
await page.goto(`${process.env.TEST_URL || 'http://127.0.0.1:5175'}/tree-lab`);
await page.locator('[data-scene-status="ready"]').waitFor({timeout:60000});
for(const [name,file] of [['Ваша личная медицинская команда','bonsai-sapling'],['Экспертиза и лечение','bonsai-crown'],['Когда ситуация сложная','bonsai-bloom']]){
 await page.getByRole('button',{name,exact:true}).click(); await page.waitForTimeout(600);
 await page.screenshot({path:`artifacts/tree-lab/${file}.png`});
}
for (let view = 2; view <= 3; view++) {
 const rotate = page.getByRole('button',{name:'Изменить ракурс бонсая',exact:true});
 await rotate.evaluate(button=>button.focus({preventScroll:true})); await page.keyboard.press('Enter');
 await page.waitForTimeout(250); await page.screenshot({path:`artifacts/tree-lab/bonsai-view-${view}.png`});
}
await page.getByRole('button',{name:'Изменить ракурс бонсая',exact:true}).evaluate(button=>button.focus({preventScroll:true}));
await page.keyboard.press('Enter'); await page.waitForTimeout(250);
await page.addStyleTag({content:'html,body,main{background:transparent!important} [class*="halo"]{display:none!important} main *{visibility:hidden} canvas{visibility:visible}'});
await page.locator('canvas').screenshot({path:'public/tree-lab/bonsai-fallback.png',omitBackground:true});
console.log(await page.locator('[data-model]').evaluate(e=>({...e.dataset})));
await browser.close();
