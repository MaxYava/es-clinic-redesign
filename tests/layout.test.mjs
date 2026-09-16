import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

test('universal selection, geometry, persistence, import and reset', {timeout: 90000}, async () => {
  const browser = await chromium.connectOverCDP(process.env.TEST_CDP);
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const pick = async (selector) => {
    if (!await page.locator('.editor-panel').count()) await page.locator('.editor-launcher').click();
    await page.locator('.editor-primary').click();
    await page.locator(selector).first().click();
  };
  try {
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4175', {waitUntil:'networkidle'});
    assert.equal(await page.locator('.hero-photo[data-layout-id]').count(), 0);
    await pick('.brand img');
    const iconId = await page.locator('.brand img').first().getAttribute('data-layout-id');
    await page.getByLabel('По горизонтали, px', {exact:true}).fill('20');
    await page.getByRole('button', {name:'Вниз', exact:true}).click();
    await page.getByLabel('Масштаб, %', {exact:true}).fill('150');
    await page.getByLabel('Ширина, px', {exact:true}).fill('40');
    await page.getByLabel('Высота, px', {exact:true}).fill('40');
    assert.equal(await page.locator('.brand img').first().evaluate(e => getComputedStyle(e).translate), '20px 10px');
    assert.equal(await page.locator('.brand img').first().evaluate(e => getComputedStyle(e).scale), '1.5');
    await page.waitForFunction(id => JSON.parse(localStorage.getItem('es-clinic-next-document-v1') || '{}')[id]?.layout?.height === 40, iconId);
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('.brand img').first().evaluate(e => getComputedStyle(e).translate), '20px 10px');
    await pick('.brand img');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', {name:'Экспорт JSON',exact:true}).click();
    const download = await downloadPromise;
    await page.getByRole('button', {name:'Сбросить положение и размер',exact:true}).click();
    assert.equal(await page.locator('.brand img').first().evaluate(e => getComputedStyle(e).translate), '0px');
    await page.getByLabel('Импорт JSON').setInputFiles(await download.path());
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.brand img')).scale === '1.5');
    await page.getByRole('button', {name:'Выбрать группу выше',exact:true}).click();
    await page.getByLabel('По вертикали, px', {exact:true}).fill('15');
    assert.equal(await page.locator('.brand').evaluate(e => getComputedStyle(e).translate), '0px 15px');
    await pick('.hero-tagrow .button');
    assert.equal(await page.locator('dialog[open]').count(), 0, 'Selection does not activate button');
    await page.getByLabel('По вертикали, px', {exact:true}).fill('-15');
    await page.screenshot({path:'test-results/layout-editor.png'});
    page.once('dialog', d => d.accept());
    await page.getByRole('button', {name:'Сбросить все изменения',exact:true}).click();
    await page.getByRole('button', {name:'Закрыть редактор',exact:true}).click();
    await page.setViewportSize({width:390,height:844});
    await pick('.brand img');
    await page.getByRole('button', {name:'Вниз',exact:true}).click();
    await page.screenshot({path:'test-results/layout-mobile.png'});
    assert.deepEqual(errors, []);
  } finally { await context.close(); await browser.close(); }
});
