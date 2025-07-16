const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 デバッグボタンテスト開始');
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモードボタンをクリック
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  
  // NEW GAMEでストーリーを開始
  await page.click('#story-new-game');
  await page.waitForTimeout(1000);
  
  // マップ上の戦闘ノードをクリック（左のノード）
  await page.click('circle[data-node-id="floor_1_node_0"]');
  await page.waitForTimeout(2000);
  
  // 戦闘開始ボタンをクリック
  await page.click('#start-battle-btn');
  await page.waitForTimeout(3000);
  
  // デバッグボタンの存在確認
  const debugButtons = await page.evaluate(() => {
    const enemyBtn = document.getElementById('debug-enemy-hp-zero');
    const playerBtn = document.getElementById('debug-player-hp-zero');
    
    return {
      enemyBtn: {
        exists: !!enemyBtn,
        visible: enemyBtn ? !enemyBtn.classList.contains('hidden') : false,
        text: enemyBtn ? enemyBtn.textContent : null
      },
      playerBtn: {
        exists: !!playerBtn,
        visible: playerBtn ? !playerBtn.classList.contains('hidden') : false,
        text: playerBtn ? playerBtn.textContent : null
      }
    };
  });
  
  console.log('デバッグボタン状態:', debugButtons);
  
  if (debugButtons.enemyBtn.exists && debugButtons.playerBtn.exists) {
    console.log('✅ デバッグボタンが存在します');
    
    // 敵HP0ボタンをテスト
    console.log('🔧 敵HP0ボタンをテスト');
    await page.click('#debug-enemy-hp-zero');
    await page.waitForTimeout(1000);
    
    // 敵HPを確認
    const enemyHP = await page.evaluate(() => {
      const hpText = document.getElementById('story-enemy-hp-text');
      return hpText ? hpText.textContent : null;
    });
    
    console.log('敵HP:', enemyHP);
    
    await page.screenshot({ path: 'ScreenShots/debug-enemy-hp-zero.png' });
    
  } else {
    console.log('❌ デバッグボタンが見つかりません');
  }
  
  await browser.close();
})();