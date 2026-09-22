import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const base = process.env.TEST_URL || "http://127.0.0.1:5175";
const output = new URL("../artifacts/tree-lab/", import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}),
});
const results = [];
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${base}/tree-lab`);
  await page.locator('[data-scene-status="ready"]').waitFor();
  const slider = page.getByRole("slider", { name: "Рост дерева" });
  const first = page.getByRole("button", { name: "Ваша личная медицинская команда", exact: true });
  const second = page.getByRole("button", { name: "Экспертиза и лечение", exact: true });
  const third = page.getByRole("button", { name: "Когда ситуация сложная", exact: true });
  for (const [button, value] of [[first, "320"], [second, "650"], [third, "1000"], [first, "320"]]) {
    await button.click();
    assert.equal(await slider.inputValue(), value);
    assert.equal(await button.getAttribute("aria-current"), "step");
  }
  results.push("Three chapters and reverse seeking");
  // Chromium's automated scrollIntoView recentres this sticky toolbar before a
  // locator click. Keyboard activation tests the switch without seeking the page.
  await page.getByRole("button", { name: "Предыдущая модель", exact: true }).evaluate(button => button.focus({ preventScroll: true }));
  await page.keyboard.press("Enter");
  await page.locator('[data-scene-status="ready"]').waitFor();
  assert.equal(await slider.inputValue(), "320");
  assert.equal(await page.locator("canvas").count(), 1);
  await page.getByRole("button", { name: "Бонсай", exact: true }).evaluate(button => button.focus({ preventScroll: true }));
  await page.keyboard.press("Enter");
  await page.locator('[data-model="bonsai-v3"]').waitFor();
  assert.equal(await slider.inputValue(), "320");
  assert.equal(await page.locator("canvas").count(), 1);
  results.push("Bonsai and previous models switch at the same growth stage, with one canvas");
  await slider.focus(); await slider.press("Home");
  assert.equal(await slider.inputValue(), "0");
  await page.waitForTimeout(600);
  await page.screenshot({ path: fileURLToPath(new URL("verified-desktop-seed.png", output)) });
  await page.getByRole("button", { name: "Смотреть рост дерева", exact: true }).click();
  await page.waitForTimeout(650);
  assert.ok(Number(await slider.inputValue()) > 10, "Play advances the tree");
  await page.getByRole("button", { name: "Остановить анимацию", exact: true }).click();
  await page.waitForTimeout(80);
  const paused = await slider.inputValue();
  await page.waitForTimeout(250);
  assert.equal(await slider.inputValue(), paused, "Pause holds position");
  results.push("Play, pause, keyboard slider");
  await third.click(); await page.waitForTimeout(1200);
  await page.screenshot({ path: fileURLToPath(new URL("verified-desktop-bloom.png", output)) });
  for (const size of [{ width: 390, height: 844 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(size);
    await third.click(); await page.waitForTimeout(300);
    const layout = await page.evaluate(() => {
      const range = document.querySelector('input[type="range"]').getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth > innerWidth, controlsVisible: range.bottom <= innerHeight && range.top >= 0 };
    });
    assert.equal(layout.overflow, false);
    assert.equal(layout.controlsVisible, true);
    await page.screenshot({ path: fileURLToPath(new URL(`verified-mobile-${size.width}.png`, output)) });
  }
  results.push("390 × 844 and 360 × 640: scene, text and controls fit");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await first.click();
  assert.match(await page.getByRole("img").getAttribute("aria-label"), /Саженец/);
  await second.click();
  assert.match(await page.getByRole("img").getAttribute("aria-label"), /Рост кроны/);
  results.push("Reduced-motion chapter stills");
  const stageBeforeRotation = await slider.inputValue();
  for (const angle of ["0.500", "-0.500", "-0.060"]) {
    await page.getByRole("button", { name: "Изменить ракурс бонсая", exact: true }).evaluate(button => button.focus({ preventScroll: true }));
    await page.keyboard.press("Enter");
    await page.waitForFunction(expected => document.querySelector('[data-model="bonsai-v3"]')?.dataset.viewAngle === expected, angle);
    assert.equal(await slider.inputValue(), stageBeforeRotation);
    assert.equal(await page.locator("canvas").count(), 1);
  }
  results.push("Three bonsai viewing angles preserve the growth stage");
  await page.getByRole("tab", { name: /Кадры для видео/ }).click();
  await page.getByRole("button", { name: /Тёмный фон/ }).click();
  for (const name of ["Семечко", "Росток", "Саженец", "Молодое дерево", "Бутоны", "Цветение"]) {
    await page.getByRole("button", { name: new RegExp(`^0[1-6] ${name}`) }).click();
    const image = page.getByRole("img", { name: new RegExp(`^${name}:`) });
    await image.evaluate(img => img.decode());
    assert.equal(await image.evaluate(img => img.naturalWidth), 1254);
  }
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /Скачать все кадры/ }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "magnolia-photoreal-keyframes.zip");
  assert.equal(await download.failure(), null);
  results.push("Six decoded images, background toggle, ZIP download");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: /Светлый фон/ }).click();
  for (const [name, file] of [["Семечко", "01-seed"], ["Саженец", "03-sapling"], ["Бутоны", "05-buds"], ["Цветение", "06-bloom"]]) {
    await page.getByRole("button", { name: new RegExp(`^0[1-6] ${name}`) }).click();
    const image = page.getByRole("img", { name: new RegExp(`^${name}:`) });
    await image.evaluate(img => img.decode());
    await image.locator("..").screenshot({ path: fileURLToPath(new URL(`photo-v2-${file}.png`, output)) });
  }
  await page.getByRole("tab", { name: /Кадры для видео/ }).focus();
  await page.keyboard.press("ArrowLeft");
  await page.locator('[data-scene-status="ready"]').waitFor();
  assert.equal(await page.getByRole("tab", { name: /Живое дерево/ }).getAttribute("aria-selected"), "true");
  const lost = await page.evaluate(() => {
    const context = document.querySelector("canvas").getContext("webgl2");
    const extension = context?.getExtension("WEBGL_lose_context");
    extension?.loseContext();
    return !!extension;
  });
  if (lost) {
    await page.locator('[data-scene-status="fallback"]').waitFor();
    await page.getByAltText("Цветущий бонсай", { exact: true }).evaluate(img => img.decode());
    results.push("WebGL context loss shows static fallback");
  }
  await page.getByRole("link", { name: "На сайт ↗", exact: true }).click();
  await page.waitForURL(base + "/");
  assert.equal(await page.locator("h1").count(), 1);
  results.push("Navigation back to the existing home page");
  for (const file of ["01-seed", "02-sprout", "03-sapling", "04-young-tree", "05-buds", "06-bloom"]) {
    const image = sharp(fileURLToPath(new URL(`../public/tree-lab/photoreal/${file}.png`, import.meta.url)));
    const meta = await image.metadata();
    const stats = await image.stats();
    assert.equal(meta.width, 1254); assert.equal(meta.height, 1254); assert.equal(meta.hasAlpha, true);
    assert.equal(stats.channels[3].min, 0); assert.ok(stats.channels[3].max > 240);
  }
  results.push("All six PNGs have real transparency and matching dimensions");
  assert.deepEqual(errors, [], "No JavaScript or console errors");
  results.push("No browser errors");
  await writeFile(new URL("verification.json", output), JSON.stringify({ base, results, errors }, null, 2));
  console.log(JSON.stringify({ passed: results.length, results }, null, 2));
} finally { await browser.close(); }
