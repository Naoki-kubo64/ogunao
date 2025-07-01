const { chromium } = require('playwright');

async function testBoardSize() {
  console.log('🎮 ボードサイズ変更テストを開始...');
  
  try {
    const browser = await chromium.launch({
      headless: true,  // ヘッドレスモードでテスト
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security'
      ]
    });

    const page = await browser.newPage();
    
    // メインゲームにアクセス
    console.log('📄 メインゲームにアクセス中...');
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // ゲーム開始ボタンをクリック
    console.log('🎯 ゲーム開始...');
    await page.click('#start-button');
    await page.waitForTimeout(2000);
    
    // キャンバスのサイズを確認
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      return {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight
      };
    });
    
    console.log('📊 キャンバス情報:', canvasInfo);
    
    // ゲームロジックの状態を確認
    const boardInfo = await page.evaluate(() => {
      if (window.gameInstance) {
        return {
          boardWidth: window.gameInstance.BOARD_WIDTH,
          boardHeight: window.gameInstance.BOARD_HEIGHT,
          cellSize: window.gameInstance.CELL_SIZE
        };
      }
      return null;
    });
    
    console.log('🎲 ボード情報:', boardInfo);
    
    // 対戦モードもテスト
    await page.click('#battle-mode-button');
    await page.waitForTimeout(1000);
    
    const battleCanvasInfo = await page.evaluate(() => {
      const playerCanvas = document.getElementById('player-canvas');
      const cpuCanvas = document.getElementById('cpu-canvas');
      return {
        player: playerCanvas ? {
          width: playerCanvas.width,
          height: playerCanvas.height
        } : null,
        cpu: cpuCanvas ? {
          width: cpuCanvas.width,
          height: cpuCanvas.height
        } : null
      };
    });
    
    console.log('⚔️ 対戦モードキャンバス情報:', battleCanvasInfo);
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'board-size-test.png', fullPage: true });
    console.log('📸 スクリーンショット保存: board-size-test.png');
    
    await page.waitForTimeout(5000); // 5秒間表示
    await browser.close();
    console.log('✅ テスト完了！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
    process.exit(1);
  }
}

testBoardSize();