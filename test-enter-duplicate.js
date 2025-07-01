const { chromium } = require('playwright');

async function testEnterDuplicate() {
  console.log('🔄 Enter重複起動テスト開始...');
  
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    // コンソールログを監視
    const logs = [];
    page.on('console', msg => {
      logs.push(msg.text());
      console.log('🖥️ ', msg.text());
    });
    
    console.log('🎮 ソロプレイボタンをクリック...');
    await page.click('#solo-play-button');
    await page.waitForTimeout(500);
    
    console.log('⚡ Enter連打テスト開始...');
    // Enter を短時間で複数回押下
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(50); // 50ms間隔で連打
    }
    
    await page.waitForTimeout(2000);
    
    // ゲーム状態を確認
    const gameState = await page.evaluate(() => {
      if (window.gameInstance) {
        return {
          running: window.gameInstance.gameRunning,
          hasCurrentPiece: !!window.gameInstance.currentPiece
        };
      }
      return null;
    });
    
    console.log('🎲 ゲーム状態:', gameState);
    
    // 警告ログをチェック
    const duplicateWarnings = logs.filter(log => log.includes('既に実行中'));
    console.log('⚠️ 重複起動警告数:', duplicateWarnings.length);
    
    if (duplicateWarnings.length > 0) {
      console.log('✅ 重複起動防止が正常に動作しています');
    } else {
      console.log('❓ 重複起動警告が見つかりませんでした');
    }
    
    await browser.close();
    console.log('✅ Enter重複起動テスト完了');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

testEnterDuplicate();