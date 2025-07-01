const { chromium } = require('playwright');

async function runSimpleTest() {
  console.log('🚀 シンプルなPlaywrightテストを開始...');
  
  try {
    // Chromiumブラウザを起動
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    
    // テストページにアクセス
    console.log('📄 テストページにアクセス中...');
    await page.goto('http://localhost:3000/test-garbage.html');
    
    // ページタイトルを確認
    const title = await page.title();
    console.log('✅ ページタイトル:', title);
    
    // 連鎖数による数量テストを実行
    console.log('🔢 連鎖数テストを実行中...');
    await page.click('button:has-text("連鎖数による数量テスト")');
    
    // 結果を待機
    await page.waitForSelector('.test-result', { timeout: 10000 });
    const result = await page.textContent('.test-result');
    console.log('📊 テスト結果:\n', result);
    
    // 落下テストを実行
    console.log('⬇️ 落下テストを実行中...');
    await page.click('button:has-text("落下テスト")');
    
    // 結果を待機
    await page.waitForTimeout(3000);
    await page.waitForSelector('.test-result', { timeout: 10000 });
    const allResults = await page.$$eval('.test-result', elements => 
      elements.map(el => el.textContent)
    );
    
    if (allResults.length >= 2) {
      console.log('📊 落下テスト結果:\n', allResults[1]);
    } else {
      console.log('⚠️ 落下テスト結果が見つかりませんでした');
    }
    
    await browser.close();
    console.log('✅ テスト完了！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    process.exit(1);
  }
}

runSimpleTest();