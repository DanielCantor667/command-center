const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const sharp = require(process.env.SHARP_PATH || 'sharp');
const baseURL = process.env.BASE_URL || 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const errors = [];
  const expectedModelErrors = [];
  const results = [];
  try {
    for (const [width, height] of (process.env.MOBILE_ONLY ? [[390,844]] : [[1440,1000],[1920,1080],[390,844],[320,740]])) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseURL);
      await page.getByRole('button', { name: 'Entrar a Kliniu', exact:true }).click();
      await page.getByRole('heading', { name:'Kliniu', level:1, exact:true }).waitFor();
      await page.waitForTimeout(900);
      await page.screenshot({ path:path.join(__dirname, `phase2-${width}-case.png`) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const study = page.getByRole('region', { name:'Del plano al producto.' });
      await study.scrollIntoViewIfNeeded();
      for (const stage of ['01 Plano','02 Espacio','03 Producto']) {
        await study.getByRole('button', { name:stage, exact:true }).click();
        await page.waitForFunction(() => { const img=document.querySelector('#kliniu-study>img'); return img?.complete && img.naturalWidth>0; });
        assert.equal(await study.getByRole('button',{name:stage,exact:true}).getAttribute('aria-pressed'),'true');
      }
      await study.getByRole('button',{name:'01 Plano',exact:true}).click();
      await study.getByRole('button',{name:'Explorar en 3D',exact:true}).click();
      await page.waitForFunction(() => document.querySelector('#kliniu-study')?.dataset.live === 'true');
      const canvas=study.locator('canvas');
      await canvas.waitFor();
      await page.waitForTimeout(1600);
      const plan=await canvas.screenshot();
      assert.ok((await sharp(plan).stats()).channels.some(channel => channel.stdev>10), 'Plan canvas is nonblank');
      await study.screenshot({path:path.join(__dirname,`phase2-${width}-plan.png`)});
      await study.getByRole('button',{name:'02 Espacio',exact:true}).focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1700);
      const space=await canvas.screenshot();
      await study.screenshot({path:path.join(__dirname,`phase2-${width}-space.png`)});
      assert.ok((await sharp(space).stats()).channels.some(channel => channel.stdev>10), 'Space canvas is nonblank');
      assert.notDeepEqual(plan,space,'Model modes must produce different pixels');
      await study.screenshot({path:path.join(__dirname,`phase2-${width}-space.png`)});
      const box=await canvas.boundingBox();
      await page.mouse.move(box.x+box.width*.5,box.y+box.height*.45);
      await page.mouse.down();
      await page.mouse.move(box.x+box.width*.65,box.y+box.height*.45,{steps:12});
      await page.mouse.up();
      await page.waitForTimeout(1000);
      assert.notDeepEqual(space,await canvas.screenshot(),'Dragging changes camera');
      await study.getByRole('button',{name:'Restablecer vista de Kliniu',exact:true}).click();
      await page.waitForTimeout(1400);
      const beforeProduct=await page.locator('#kliniu-study').boundingBox();
      await study.getByRole('button',{name:'03 Producto',exact:true}).click();
      const afterProduct=await page.locator('#kliniu-study').boundingBox();
      assert.ok(Math.abs(beforeProduct.y-afterProduct.y)<1,'Changing modes does not move the stage');
      assert.equal(await study.locator('canvas').count(),0,'Product does not retain a hidden canvas');
      await study.screenshot({path:path.join(__dirname,`phase2-${width}-product.png`)});
      const controls=await study.getByRole('group',{name:'Etapas del proyecto'}).locator('button').evaluateAll(buttons=>buttons.map(b=>{const r=b.getBoundingClientRect();return {width:r.width,height:r.height};}));
      assert.ok(controls.every(b=>b.height>=44 && b.width>=44),'Touch targets');
      await study.getByRole('button',{name:'02 Espacio',exact:true}).click();
      await page.waitForFunction(() => document.querySelector('#kliniu-study')?.dataset.live === 'true');
      await study.getByRole('button',{name:'Cerrar estudio 3D',exact:true}).click();
      assert.equal(await study.locator('canvas').count(),0);
      await page.getByRole('heading',{name:'Lo que no se ve también se diseña.'}).scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(__dirname,`phase2-${width}-decisions.png`)});
      await page.getByRole('button',{name:'Volver a la ciudad',exact:true}).click();
      await page.getByRole('heading',{name:'Daniel Cantor',level:1}).waitFor();
      results.push({width,height,canvas:true,modes:true,drag:true,return:true});
      await context.close();
    }
    for (const mode of ['no-webgl','reduced','failed-model']) {
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:mode==='reduced'?'reduce':'no-preference'});
      if(mode==='no-webgl') await context.addInitScript(()=>{
        const original=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};
      });
      const page=await context.newPage();
      // R3F reports even boundary-caught errors through window.reportError.
      page.on('pageerror',error=>{
        if(mode==='failed-model' && error.message==='Could not load /models/workshop/kliniu-interactive-v4.glb: Failed to fetch') expectedModelErrors.push(error.message);
        else errors.push(error.message);
      });
      if(mode==='failed-model') await page.route('**/kliniu-interactive-v4.glb',route=>route.abort());
      await page.goto(baseURL);
      await page.getByRole('button',{name:'Entrar a Kliniu',exact:true}).click();
      const study=page.getByRole('region',{name:'Del plano al producto.'});
      await study.scrollIntoViewIfNeeded();
      await study.getByRole('button',{name:'Explorar en 3D',exact:true}).click();
      if(mode==='reduced') {
        await page.waitForFunction(()=>document.querySelector('#kliniu-study')?.dataset.live==='true');
        await study.getByRole('button',{name:'02 Espacio',exact:true}).click();
        await page.waitForTimeout(500);
        await study.screenshot({path:path.join(__dirname,'phase2-reduced.png')});
      } else {
        await study.getByRole('status').waitFor();
        assert.equal(await study.locator('canvas').count(),0);
      }
      await study.getByRole('button',{name:'03 Producto',exact:true}).click();
      await page.waitForFunction(()=>{const img=document.querySelector('#kliniu-study>img');return img?.complete && img.naturalWidth>0;});
      results.push({mode,passed:true});
      await context.close();
    }
    assert.deepEqual(errors,[]);
    assert.ok(expectedModelErrors.length>0,'The injected model failure was exercised');
    console.log(JSON.stringify({passed:true,results,expectedModelErrors:expectedModelErrors.length},null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
