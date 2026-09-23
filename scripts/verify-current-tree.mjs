import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const stops = [280, 384, 575];
const holds = [.58, .58, 1.25];
const url = process.env.TREE_TEST_URL ?? 'http://127.0.0.1:4175/';

for (const mobile of [false, true]) {
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const tree = page.locator('[data-contract-tree]');
  if (await tree.count() !== 1) throw Error('Current tree is missing');
  if (await page.locator('#tree-closeup, #tree-sprout, #tree-documentary').count()) {
    throw Error('Old tree variants still render on the home page');
  }
  const box = await tree.evaluate(element => ({ top: element.getBoundingClientRect().top + scrollY, height: element.offsetHeight }));
  const animationDistance = box.height - viewport.height - viewport.height * holds.reduce((sum, hold) => sum + hold, 0);

  for (let index = 0; index < stops.length; index++) {
    const growth = stops[index] / 575 * animationDistance;
    const previousHolds = holds.slice(0, index).reduce((sum, hold) => sum + hold, 0);
    const position = box.top + growth + (previousHolds + holds[index] / 2) * viewport.height;
    await page.evaluate(value => scrollTo({ top: value, behavior: 'instant' }), position);
    await page.waitForTimeout(500);
    await page.waitForFunction(({ frame, index }) => {
      const tree = document.querySelector('[data-contract-tree]');
      return Number(tree?.dataset.frame) === frame && tree?.querySelectorAll('[data-active]')[index]?.dataset.active === 'true';
    }, { frame: stops[index], index }, { timeout: 20000 });
    const active = tree.locator('[data-active="true"]');
    if (await active.count() !== 1) throw Error(`Expected one active card at stop ${index + 1}`);
    const button = active.locator('button[aria-expanded]');
    await button.dispatchEvent('click');
    if (await button.getAttribute('aria-expanded') !== 'true') throw Error(`Card ${index + 1} did not open`);
    await page.waitForTimeout(900);
    if (index === 1) await page.screenshot({ path: `artifacts/current-tree-${mobile ? 'mobile' : 'desktop'}.png` });
    await button.dispatchEvent('click');
  }
  if (errors.length) throw Error(errors.join('\n'));
  await page.close();
}

await browser.close();
