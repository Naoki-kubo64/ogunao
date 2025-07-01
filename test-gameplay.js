const { chromium } = require('playwright');

async function testGameplay() {
  console.log('🎮 ゲームプレイテスト開始...');
  
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // ゲーム開始
    console.log('🎯 ゲーム開始ボタンをクリック...');
    await page.click('#start-button');
    await page.waitForTimeout(2000);
    
    // ゲームの状態を確認
    const gameState = await page.evaluate(() => {
      if (window.gameInstance) {
        return {
          boardWidth: window.gameInstance.BOARD_WIDTH,
          boardHeight: window.gameInstance.BOARD_HEIGHT,
          cellSize: window.gameInstance.CELL_SIZE,
          running: window.gameInstance.gameRunning,
          board: window.gameInstance.board ? window.gameInstance.board.length : 0
        };
      }
      return null;
    });
    
    console.log('🎲 ゲーム状態:', gameState);
    
    // 対戦モードもテスト
    console.log('⚔️ 対戦モードテスト...');
    await page.click('#battle-mode-button');
    await page.waitForTimeout(1000);
    
    // 対戦モードのボタンを探す
    const battleStartExists = await page.evaluate(() => {
      return document.getElementById('battle-start') !== null;
    });
    
    console.log('🔥 対戦開始ボタン存在:', battleStartExists);
    
    if (battleStartExists) {
      await page.click('#battle-start');
      await page.waitForTimeout(2000);
      
      const battleState = await page.evaluate(() => {
        if (window.battleInstance) {
          return {
            boardWidth: window.battleInstance.BOARD_WIDTH,
            boardHeight: window.battleInstance.BOARD_HEIGHT,
            running: window.battleInstance.gameRunning
          };
        }
        return null;
      });
      
      console.log('⚔️ 対戦状態:', battleState);
    }
    
    await browser.close();
    console.log('✅ ゲームプレイテスト完了');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

testGameplay();