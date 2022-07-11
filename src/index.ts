import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";

import type { PuppeteerLifeCycleEvent } from "puppeteer";

function isPuppeteerLifeCycleEvent(
  value: string
): value is PuppeteerLifeCycleEvent {
  return (
    value === "load" ||
    value === "domcontentloaded" ||
    value === "networkidle0" ||
    value === "networkidle2"
  );
}

async function main(): Promise<void> {
  const url = process.env.INPUT_URL;
  if (!url) {
    console.log("Missing url");
    return;
  }

  const waitUntil = !process.env.INPUT_WAIT_UNTIL
    ? "networkidle2"
    : process.env.INPUT_WAIT_UNTIL;
  if (!isPuppeteerLifeCycleEvent(waitUntil)) {
    console.log(`Invalid ${waitUntil}`);
    return;
  }

  // https://github.com/puppeteer/puppeteer/issues/1552#issuecomment-350954419
  // networkidle0 comes handy for SPAs that load resources with fetch requests.
  // networkidle2 comes handy for pages that do long-polling or any other side activity.
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil });
  await page.screenshot({ path: "index.png", fullPage: true });
  const html = await page.content();
  await writeFile("index.html", html, { encoding: "utf-8" });
  await browser.close();
}

await main();
