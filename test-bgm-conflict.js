const { chromium } = require('playwright');

async function testBgmConflict() {
  console.log('🎵 BGM競合テスト開始...');
  
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
      const text = msg.text();
      if (text.includes('BGM') || text.includes('なおちゃんタイム') || text.includes('スコア200000')) {
        logs.push(text);
        console.log('🎵 BGMログ:', text);
      }
    });
    
    console.log('🎮 ゲーム開始...');
    await page.click('#start-button');
    await page.waitForTimeout(2000);
    
    // スコアを200000に設定してテスト
    console.log('📊 スコアを200000に設定...');
    await page.evaluate(() => {
      if (window.gameInstance) {
        window.gameInstance.score = 199000; // 200000直前に設定
        console.log('🎯 テスト用スコア設定: 199000');
      }
    });
    
    // スコア更新をトリガー
    await page.evaluate(() => {
      if (window.gameInstance) {
        window.gameInstance.score = 200000;
        window.gameInstance.updateDisplay();
        console.log('🎯 200000スコア達成をシミュレート');
      }
    });
    
    await page.waitForTimeout(3000);
    
    // BGM状態を確認
    const bgmState = await page.evaluate(() => {
      if (window.gameInstance) {
        return {
          score: window.gameInstance.score,
          bgmSwitched: window.gameInstance.bgmSwitched,
          naochanTimeActive: window.gameInstance.naochanTimeActive,
          currentBgm: window.gameInstance.currentBgm ? window.gameInstance.currentBgm.id : null
        };
      }
      return null;
    });
    
    console.log('🎲 BGM状態:', bgmState);
    
    // ログ分析
    const bgmSwitchLogs = logs.filter(log => log.includes('BGM切り替え'));
    const naochanTimeLogs = logs.filter(log => log.includes('なおちゃんタイム'));
    
    console.log('🔍 BGM切り替えログ数:', bgmSwitchLogs.length);
    console.log('🔍 なおちゃんタイムログ数:', naochanTimeLogs.length);
    
    if (bgmSwitchLogs.length > 0 && naochanTimeLogs.length > 0) {
      console.log('⚠️ BGMとなおちゃんタイムの競合が発生している可能性があります');
    } else {
      console.log('✅ BGM競合は防止されているようです');
    }
    
    await browser.close();
    console.log('✅ BGM競合テスト完了');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

testBgmConflict();