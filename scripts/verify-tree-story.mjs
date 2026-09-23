import { chromium } from '@playwright/test';
import { TREE_GROWTH_SEGMENTS, TREE_HOLD_VIEWPORTS, TREE_STOP_FRAMES } from '../app/ui/tree-storyboard.js';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const hold = TREE_HOLD_VIEWPORTS;

for (const mobile of [false, true]) {
  const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5175/');

  for (const [name, selector, top] of [
    ['contract', '#contract > div', 95],
    ['closeup', '#tree-closeup', 0],
    ['sprout', '#tree-sprout', 0],
    ['documentary', '#tree-documentary', 0],
  ]) {
    const root = page.locator(selector).first();
    const box = await root.evaluate(element => ({ y: element.getBoundingClientRect().top + scrollY, height: element.offsetHeight }));
    const animationDistance = box.height - (page.viewportSize().height - top) - page.viewportSize().height * 3 * hold;
    for (let index = 0; index < 3; index++) {
      const growth = TREE_GROWTH_SEGMENTS.slice(0, index + 1).reduce((sum, value) => sum + value, 0);
      const position = box.y - top + growth * animationDistance + (index + .5) * hold * page.viewportSize().height;
      await page.evaluate(value => scrollTo({ top: value, behavior: 'instant' }), position);
      await page.waitForTimeout(350);
      const active = root.locator('[data-active="true"]');
      await active.first().waitFor();
      if (await active.count() !== 1) throw Error(`${name} step ${index + 1}: expected one active card`);
      const frame = await root.getAttribute('data-frame');
      if (Number(frame) !== TREE_STOP_FRAMES[name][index]) throw Error(`${name} step ${index + 1}: paused on frame ${frame}`);
      const before = await root.evaluate(element => element.style.getPropertyValue(name === 'contract' ? '--growth' : '--progress'));
      await page.evaluate(value => scrollTo({ top: value + 80, behavior: 'instant' }), position);
      await page.waitForTimeout(100);
      const after = await root.evaluate(element => element.style.getPropertyValue(name === 'contract' ? '--growth' : '--progress'));
      if (Math.abs(Number(after) - Number(before)) > .001) throw Error(`${name} step ${index + 1}: frame moved during pause`);
      const button = root.locator('button[aria-expanded]').nth(index);
      const bounds = await button.boundingBox();
      await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      if (await button.getAttribute('aria-expanded') !== 'true') throw Error(`${name} step ${index + 1}: inline detail did not open`);
      if (await page.locator('dialog[open]').count()) throw Error(`${name}: opened a dialog`);
      await page.waitForTimeout(650);
      if (await active.count() !== 1) throw Error(`${name} step ${index + 1}: card left its pause after clicking`);
      if (index === 1) await page.screenshot({ path: `artifacts/tree-story-${name}-${mobile ? 'mobile' : 'desktop'}.png` });
      if ((name === 'contract' || name === 'documentary') && index !== 1) await page.screenshot({ path: `artifacts/tree-story-${name}-step-${index + 1}-${mobile ? 'mobile' : 'desktop'}.png` });
      await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      if (index < 2) {
        const between = box.y - top + (growth + TREE_GROWTH_SEGMENTS[index + 1] / 2) * animationDistance + (index + 1) * hold * page.viewportSize().height;
        await page.evaluate(value => scrollTo({ top: value, behavior: 'instant' }), between);
        await page.waitForTimeout(100);
        if (await root.locator('[data-active="true"]').count()) throw Error(`${name}: previous card remained during growth`);
      }
    }
  }
  if (errors.length) throw Error(errors.join('\n'));
  await page.close();
}

const reduced = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
await reduced.goto('http://127.0.0.1:5175/');
for (const selector of ['#contract > div', '#tree-closeup', '#tree-sprout', '#tree-documentary']) {
  const root = reduced.locator(selector).first();
  await root.locator('[data-active="true"]').first().waitFor();
  if (await root.locator('[data-active="true"]').count() !== 3) throw Error(`${selector}: reduced-motion steps are not all available`);
}
await reduced.close();

await browser.close();
