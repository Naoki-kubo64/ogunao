const { chromium } = require('playwright');

async function testBoard() {
  console.log('🎮 簡単なボードテスト開始...');
  
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // ページタイトル確認
    const title = await page.title();
    console.log('✅ ページタイトル:', title);
    
    // キャンバス確認
    const canvasExists = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      return canvas ? { width: canvas.width, height: canvas.height } : null;
    });
    
    console.log('📊 メインキャンバス:', canvasExists);
    
    await browser.close();
    console.log('✅ 基本テスト完了');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

testBoard();