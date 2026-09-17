import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "@playwright/test";
const base = process.env.TEST_URL || "http://127.0.0.1:5175";
const copy = JSON.parse(
  await fs.readFile(new URL("../app/data/copy.json", import.meta.url), "utf8"),
);

test(
  "document sections, desktop/mobile, editor persistence, photo, video and contacts",
  { timeout: 120000 },
  async () => {
    const browser = process.env.TEST_CDP
      ? await chromium.connectOverCDP(process.env.TEST_CDP)
      : await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const errors = [];
    const failed = [];
    const videoRequests = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    page.on("request", (r) => {
      if (r.url().includes(".mp4")) videoRequests.push(r.url());
    });
    try {
      await page.goto(base, { waitUntil: "networkidle" });
      await page.emulateMedia({ reducedMotion: "reduce" });
      assert.equal(await page.locator("h1").count(), 1);
      const omitted = new Set([4, 7, 12, 19, 21, 87, 89, 91, 100, 101]);
      const body = await page.locator("body").textContent();
      for (let i = 0; i < copy.length; i++)
        if (!omitted.has(i))
          assert.ok(body.includes(copy[i]), `Missing document paragraph ${i}`);
      assert.equal(videoRequests.length, 0, "No video downloaded before play");
      const systemImage = await page.locator("#system .photo").boundingBox();
      const systemText = await page
        .locator('[data-edit-id="copy-13"]')
        .boundingBox();
      const receptionImage = await page
        .locator("#responsibility .photo")
        .boundingBox();
      const receptionText = await page
        .locator('[data-edit-id="copy-16"]')
        .boundingBox();
      assert.ok(systemImage.x < systemText.x, "Family photograph on left");
      assert.ok(
        receptionImage.x > receptionText.x,
        "Reception photograph on right",
      );
      assert.equal(
        await page.locator('#system [data-edit-id="copy-16"]').count(),
        0,
      );
      for (const section of await page.locator("main>section").all()) {
        await section.scrollIntoViewIfNeeded();
        for (const img of await section.locator("img").all()) {
          if (!await img.isVisible()) continue;
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(image => image.decode());
        }
      }
      await page.waitForLoadState("networkidle");
      const broken = await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src),
        );
      assert.deepEqual(broken, [], "Images must load");
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({ path: "test-results/desktop.png" });
      await page
        .locator("#system")
        .screenshot({ path: "test-results/system.png" });
      await page
        .locator("#responsibility")
        .screenshot({ path: "test-results/reception.png" });
      await page
        .getByRole("button", { name: "✎ Изменить", exact: true })
        .click();
      await page
        .getByRole("button", { name: "↖ Выберите элемент", exact: true })
        .click();
      assert.equal(
        await page.locator(".editor-panel").count(),
        0,
        "Picker hides panel",
      );
      await page.locator('[data-edit-id="copy-13"]').click();
      await page
        .getByLabel("Текст", { exact: true })
        .fill("Тест редактирования заголовка");
      await page.getByLabel("Размер, px").fill("42");
      await page
        .getByLabel("Шрифт", { exact: true })
        .selectOption("Georgia, serif");
      await page.getByLabel(/Ширина блока/).fill("75");
      assert.equal(
        await page.locator('[data-edit-id="copy-13"]').textContent(),
        "Тест редактирования заголовка",
      );
      assert.equal(
        await page
          .locator('[data-edit-id="copy-13"]')
          .evaluate((e) => e.style.width),
        "75%",
      );
      await page.waitForFunction(
        () =>
          JSON.parse(
            localStorage.getItem("es-clinic-next-document-v1") || "{}",
          )["copy-13"]?.style?.width === "75%",
      );
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(
        await page.locator('[data-edit-id="copy-13"]').textContent(),
        "Тест редактирования заголовка",
      );
      await page
        .getByRole("button", { name: "✎ Изменить", exact: true })
        .click();
      await page
        .getByRole("button", { name: "↖ Выберите элемент", exact: true })
        .click();
      await page.locator('[data-edit-id="photo-family"]').click();
      await page
        .getByLabel("Фотография из библиотеки")
        .selectOption("/assets/reception.webp");
      assert.ok(
        (
          await page
            .locator('[data-edit-id="photo-family"] img')
            .getAttribute("src")
        ).includes("reception"),
      );
      await page.screenshot({ path: "test-results/editor.png" });
      const downloadPromise = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Экспорт JSON", exact: true })
        .click();
      const download = await downloadPromise;
      const exported = JSON.parse(
        await fs.readFile(await download.path(), "utf8"),
      );
      assert.equal(
        exported.changes["copy-13"].text,
        "Тест редактирования заголовка",
      );
      await page
        .getByRole("button", { name: "Вернуть исходный элемент", exact: true })
        .click();
      await page
        .getByLabel("Импорт JSON")
        .setInputFiles({
          name: "draft.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify(exported)),
        });
      assert.ok(
        (
          await page
            .locator('[data-edit-id="photo-family"] img')
            .getAttribute("src")
        ).includes("reception"),
      );
      page.once("dialog", (d) => d.accept());
      await page
        .getByRole("button", { name: "Сбросить все изменения", exact: true })
        .click();
      assert.equal(
        await page.locator('[data-edit-id="copy-13"]').textContent(),
        copy[13],
      );
      await page
        .getByRole("button", { name: "Закрыть редактор", exact: true })
        .click();
      await page
        .getByRole("button", {
          name: "Смотреть видео с Дарьей Тишиной",
          exact: true,
        })
        .click();
      await page.waitForFunction(
        () => document.querySelector("video")?.readyState >= 2,
      );
      assert.ok(videoRequests.length > 0);
      assert.ok(
        await page
          .locator("video")
          .evaluate((v) => v.videoHeight > v.videoWidth),
      );
      await page.locator("video").evaluate((v) => v.pause());
      await page
        .getByRole("button", { name: "Получить консультацию", exact: true })
        .click();
      assert.ok(await page.locator("dialog[open]").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog[open]").count(), 0);
      await page.locator("#faq summary").first().click();
      assert.equal(await page.locator("#faq details[open]").count(), 1);
      for (const width of [390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `No horizontal overflow at ${width}px`,
        );
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.screenshot({ path: "test-results/mobile.png" });
      await page
        .locator("#system")
        .screenshot({ path: "test-results/mobile-system.png" });
      await page
        .getByRole("button", { name: "✎ Изменить", exact: true })
        .click();
      assert.ok(await page.locator(".editor-panel").isVisible());
      await page
        .getByRole("button", { name: "↖ Выберите элемент", exact: true })
        .click();
      await page.locator('[data-edit-id="copy-15"]').click();
      assert.equal(
        await page.getByLabel("Текст", { exact: true }).inputValue(),
        copy[15],
      );
      assert.deepEqual(errors, [], "No browser exceptions");
      assert.deepEqual(failed, [], "No failed HTTP resources");
      console.log(
        JSON.stringify(
          {
            checkedDocumentParagraphs: copy.length - omitted.size,
            viewports: [390, 768, 1024, 1440],
            errors,
            failed,
            videoDeferred: true,
          },
          null,
          2,
        ),
      );
    } catch (error) {
      console.log("BROWSER ERRORS", errors);
      console.log((await page.locator("body").innerText()).slice(-3500));
      await page.screenshot({ path: "test-results/failure.png" });
      throw error;
    } finally {
      await context.close();
      await browser.close();
    }
  },
);
