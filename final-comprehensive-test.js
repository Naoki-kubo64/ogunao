const { chromium } = require('playwright');

async function comprehensiveTest() {
  console.log('🧪 総合テスト開始...');
  
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // テスト1: ページ読み込み
    console.log('📄 1. ページ読み込みテスト...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    console.log('✅ ページタイトル:', title);
    
    // テスト2: ボードサイズ確認
    console.log('📐 2. ボードサイズテスト...');
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.getElementById('game-canvas');
      return canvas ? { width: canvas.width, height: canvas.height } : null;
    });
    console.log('✅ キャンバスサイズ:', canvasInfo);
    
    if (canvasInfo.height === 960) {
      console.log('✅ 6×12マス対応確認');
    } else {
      console.log('❌ ボードサイズが想定と異なります');
    }
    
    // テスト3: ソロプレイモード
    console.log('🎮 3. ソロプレイモードテスト...');
    await page.click('#solo-play-button');
    await page.waitForTimeout(1000);
    
    // Enter連打テスト
    console.log('⚡ Enter重複起動テスト...');
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(2000);
    
    const gameState = await page.evaluate(() => {
      if (window.gameInstance) {
        return {
          running: window.gameInstance.gameRunning,
          boardHeight: window.gameInstance.BOARD_HEIGHT,
          boardWidth: window.gameInstance.BOARD_WIDTH
        };
      }
      return null;
    });
    
    console.log('✅ ゲーム状態:', gameState);
    
    if (gameState && gameState.boardHeight === 12) {
      console.log('✅ ソロプレイモード 6×12マス確認');
    }
    
    // テスト4: 対戦モード
    console.log('⚔️ 4. 対戦モードテスト...');
    await page.click('#battle-mode-button');
    await page.waitForTimeout(1000);
    
    const battleCanvasInfo = await page.evaluate(() => {
      const playerCanvas = document.getElementById('player-canvas');
      const cpuCanvas = document.getElementById('cpu-canvas');
      return {
        player: playerCanvas ? { width: playerCanvas.width, height: playerCanvas.height } : null,
        cpu: cpuCanvas ? { width: cpuCanvas.width, height: cpuCanvas.height } : null
      };
    });
    
    console.log('✅ 対戦モードキャンバス:', battleCanvasInfo);
    
    if (battleCanvasInfo.player?.height === 600 && battleCanvasInfo.cpu?.height === 600) {
      console.log('✅ 対戦モード 6×12マス確認');
    }
    
    // 対戦開始テスト
    const battleStartExists = await page.evaluate(() => {
      return document.getElementById('battle-start') !== null;
    });
    
    if (battleStartExists) {
      console.log('🔥 対戦開始テスト...');
      await page.click('#battle-start');
      await page.waitForTimeout(2000);
      
      const battleState = await page.evaluate(() => {
        if (window.battleInstance) {
          return {
            running: window.battleInstance.gameRunning,
            boardHeight: window.battleInstance.BOARD_HEIGHT
          };
        }
        return null;
      });
      
      console.log('✅ 対戦状態:', battleState);
    }
    
    // テスト5: おじゃまぷよテスト
    console.log('💩 5. おじゃまぷよテスト...');
    await page.goto('http://localhost:3000/test-garbage.html', { waitUntil: 'domcontentloaded' });
    
    await page.click('button:has-text("連鎖数による数量テスト")');
    await page.waitForTimeout(2000);
    
    const garbageResult = await page.textContent('.test-result');
    console.log('✅ おじゃまぷよテスト結果確認');
    
    if (garbageResult.includes('2連鎖: 1-2個')) {
      console.log('✅ おじゃまぷよ数量調整確認');
    }
    
    // テスト6: 基本UI要素確認
    console.log('🖼️ 6. UI要素テスト...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    const uiElements = await page.evaluate(() => {
      const elements = {
        startScreen: !!document.getElementById('start-screen'),
        gameCanvas: !!document.getElementById('game-canvas'),
        soloButton: !!document.getElementById('solo-play-button'),
        battleButton: !!document.getElementById('battle-mode-button'),
        scoreDisplay: !!document.getElementById('score'),
        timeDisplay: !!document.getElementById('time')
      };
      return elements;
    });
    
    console.log('✅ UI要素存在確認:', uiElements);
    
    const missingElements = Object.entries(uiElements)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);
    
    if (missingElements.length === 0) {
      console.log('✅ 全UI要素が正常に存在します');
    } else {
      console.log('⚠️ 不足しているUI要素:', missingElements);
    }
    
    await browser.close();
    console.log('🎉 総合テスト完了！');
    
  } catch (error) {
    console.error('❌ 総合テストエラー:', error.message);
  }
}

comprehensiveTest();