const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const sharp = require(process.env.SHARP_PATH || 'sharp');

const base = process.env.BASE_URL || 'http://localhost:3001';
const projects = [
  ['kliniu', 'Kliniu'],
  ['lorigine', "L'ORIGINE"],
  ['4ustudio-academy', '4U Studio Academy'],
  ['drokex', 'Drokex'],
];
const viewports = [[1440, 1000], [1920, 1080], [390, 844], [320, 568]];
const capture = (page, name) => page.screenshot({ path: path.join(__dirname, `phase63-${name}.png`) });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  const issues = [];
  try {
    for (const [width, height] of viewports) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.locator('main[data-reveal="false"]').waitFor();

      for (const [id, name] of projects) {
        await page.getByRole('button', { name: `Seleccionar ${name}`, exact: true }).click();
        await page.getByRole('button', { name: `Entrar a ${name}`, exact: true }).click();
        await page.getByRole('heading', { name, exact: true, level: 1 }).waitFor();
        await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
        await page.waitForTimeout(700);

        const heading = page.getByRole('heading', { name, exact: true, level: 1 });
        assert.equal(await heading.evaluate(element => element === document.activeElement), true, `${width}/${name}: H1 focus`);
        assert.notEqual(await heading.evaluate(element => getComputedStyle(element.parentElement).animationName), 'none', `${width}/${name}: editorial entrance`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}/${name}: horizontal overflow`);
        const hero = page.locator('main article > section').first();
        const next = page.locator('main article > section').nth(1);
        const image = hero.locator('img').first();
        await image.waitFor();
        await page.waitForFunction(() => {
          const image = document.querySelector('main article > section img');
          return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
        });
        assert.equal(await hero.locator('canvas').count(), 0, `${width}/${name}: extra canvas in hero`);
        assert.equal(await page.getByRole('link', { name: /Visitar sitio|Visitar academia/ }).isVisible(), true, `${width}/${name}: site link`);
        const contextBlock = page.locator(`[data-case-context="${id}"]`);
        assert.ok((await contextBlock.innerText()).length > 35, `${width}/${name}: documented context`);
        if (id === 'drokex') assert.match(await contextBlock.innerText(), /Propiedad no confirmada/);
        const opening = await capture(page, `${width}-${id}-opening`);
        assert.ok((await sharp(opening).stats()).channels.some(channel => channel.stdev > 12), `${width}/${name}: nonblank opening`);
        const geometry = await page.evaluate(() => {
          const context = document.querySelector('[data-case-context]');
          const sections = document.querySelectorAll('main article > section');
          const rect = context.getBoundingClientRect();
          const title = sections[0].querySelector('h1').getBoundingClientRect();
          const links = [...sections[0].querySelectorAll('a')].filter(link => link.getBoundingClientRect().top < innerHeight).map(link => link.getBoundingClientRect());
          const next = sections[1].getBoundingClientRect();
          const nextContent = sections[1].firstElementChild.getBoundingClientRect();
          const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          return { contextTop: rect.top, contextBottom: rect.bottom, nextTop: next.top, nextContentTop: nextContent.top, titleOverlap: overlaps(rect, title), linkOverlap: links.some(link => overlaps(rect, link)), height: innerHeight };
        });
        if (geometry.contextTop < 0 || geometry.contextBottom > height) issues.push(`${width}/${name}: context outside viewport ${JSON.stringify(geometry)}`);
        if (geometry.nextContentTop >= height - 12) issues.push(`${width}/${name}: next section content hidden ${JSON.stringify(geometry)}`);
        if (geometry.titleOverlap || geometry.linkOverlap) issues.push(`${width}/${name}: text/control overlap ${JSON.stringify(geometry)}`);

        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(150);
        await capture(page, `${width}-${id}-closing`);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.getByRole('button', { name: 'Volver a la ciudad', exact: true }).click();
        await page.getByRole('button', { name: `Entrar a ${name}`, exact: true }).waitFor();
        await page.waitForFunction(() => !document.documentElement.dataset.portfolioTransition);
        results.push({ width, height, name, nextTop: Math.round(geometry.nextTop) });
      }
      assert.deepEqual(errors, [], `${width}: page errors`);
      await context.close();
    }
    const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const staticPage = await reduced.newPage();
    await staticPage.goto(base);
    await staticPage.locator('main[data-reveal="false"]').waitFor();
    await staticPage.getByRole('button', { name: "Seleccionar L'ORIGINE", exact: true }).click();
    await staticPage.getByRole('button', { name: "Entrar a L'ORIGINE", exact: true }).click();
    const staticHeading = staticPage.getByRole('heading', { name: "L'ORIGINE", level: 1, exact: true });
    await staticHeading.waitFor();
    assert.equal(await staticHeading.evaluate(element => getComputedStyle(element.parentElement).animationName), 'none', 'Reduced motion has no text animation');
    assert.equal(await staticPage.locator('main article > section img').first().evaluate(element => getComputedStyle(element).animationName), 'none', 'Reduced motion has no render animation');
    await reduced.close();
    console.log(JSON.stringify({ passed: issues.length === 0, results, issues }, null, 2));
    assert.deepEqual(issues, []);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
