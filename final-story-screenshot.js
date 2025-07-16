const { chromium } = require('playwright');

(async () => {
  console.log('📸 Taking final story mode screenshot...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--allow-file-access-from-files', '--allow-universal-access-from-files']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-screen', { timeout: 10000 });
    
    // Click story mode button
    await page.click('#story-mode-btn');
    await page.waitForTimeout(2000);
    
    // Take screenshot showing story mode in action
    await page.screenshot({ path: 'story_mode_final_demo.png', fullPage: true });
    console.log('📸 Final screenshot saved: story_mode_final_demo.png');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('✅ Final screenshot test completed');
})();