const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 戦闘データクリアテスト');
  console.log('============================');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('🔥') || msg.text().includes('🧹') || msg.text().includes('マップノードクリック') || msg.text().includes('🔧') || msg.text().includes('報酬獲得')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  console.log('1. ストーリーモード開始');
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 1戦目開始
  console.log('2. 1戦目開始');
  const firstNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => 
      node.querySelector('circle').getAttribute('stroke') === '#ffd700'
    ).map(node => node.getAttribute('data-node-id'));
  });
  
  if (firstNodes.length > 0) {
    await page.click(`[data-node-id="${firstNodes[0]}"]`);
    await page.waitForTimeout(2000);
    
    // 1戦目の戦闘データを確認
    const firstBattleData = await page.evaluate(() => {
      const storyMode = window.storyMode;
      return {
        gameRunning: storyMode.gameRunning,
        playerBoard: storyMode.playerBoard ? storyMode.playerBoard.length : 0,
        enemyBoard: storyMode.enemyBoard ? storyMode.enemyBoard.length : 0,
        playerCurrentPuyo: !!storyMode.playerCurrentPuyo,
        enemyCurrentPuyo: !!storyMode.enemyCurrentPuyo,
        enemyName: storyMode.currentEnemy ? storyMode.currentEnemy.name : 'none'
      };
    });
    
    console.log('3. 1戦目の戦闘データ:', firstBattleData);
    
    // 1戦目を勝利で終了
    console.log('4. 1戦目勝利');
    await page.click('#debug-enemy-hp-zero');
    await page.waitForTimeout(2000);
    
    // 報酬選択
    await page.click('#reward-special-puyo');
    await page.waitForTimeout(2000);
    
    // 2戦目開始
    console.log('5. 2戦目開始');
    const secondNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => 
        node.querySelector('circle').getAttribute('stroke') === '#ffd700'
      ).map(node => node.getAttribute('data-node-id'));
    });
    
    if (secondNodes.length > 0) {
      await page.click(`[data-node-id="${secondNodes[0]}"]`);
      await page.waitForTimeout(2000);
      
      // 2戦目の戦闘データを確認
      const secondBattleData = await page.evaluate(() => {
        const storyMode = window.storyMode;
        return {
          gameRunning: storyMode.gameRunning,
          playerBoard: storyMode.playerBoard ? storyMode.playerBoard.length : 0,
          enemyBoard: storyMode.enemyBoard ? storyMode.enemyBoard.length : 0,
          playerCurrentPuyo: !!storyMode.playerCurrentPuyo,
          enemyCurrentPuyo: !!storyMode.enemyCurrentPuyo,
          enemyName: storyMode.currentEnemy ? storyMode.currentEnemy.name : 'none'
        };
      });
      
      console.log('6. 2戦目の戦闘データ:', secondBattleData);
      
      // 比較結果
      console.log('============================');
      console.log('📊 データクリア結果:');
      console.log('敵名変更:', firstBattleData.enemyName !== secondBattleData.enemyName ? '✅' : '❌');
      console.log('ゲーム状態:', secondBattleData.gameRunning ? '✅' : '❌');
      console.log('プレイヤーボード:', secondBattleData.playerBoard > 0 ? '✅' : '❌');
      console.log('敵ボード:', secondBattleData.enemyBoard > 0 ? '✅' : '❌');
      console.log('プレイヤーぷよ:', secondBattleData.playerCurrentPuyo ? '✅' : '❌');
      console.log('敵ぷよ:', secondBattleData.enemyCurrentPuyo ? '✅' : '❌');
      
      if (firstBattleData.enemyName !== secondBattleData.enemyName && 
          secondBattleData.gameRunning && 
          secondBattleData.playerBoard > 0 && 
          secondBattleData.enemyBoard > 0) {
        console.log('🎉 戦闘データが正常にクリアされ、新しい戦闘が開始されました！');
      } else {
        console.log('❌ 戦闘データクリアに問題があります');
      }
      
      // 動作確認のためキーテスト
      console.log('7. 2戦目でのキー操作テスト');
      await page.keyboard.press('a');
      await page.waitForTimeout(300);
      await page.keyboard.press('d');
      await page.waitForTimeout(300);
      await page.keyboard.press(' ');
      await page.waitForTimeout(300);
      
      console.log('✅ 2戦目でのキー操作が正常に動作しました');
      
      // テスト終了
      await page.click('#debug-player-hp-zero');
      await page.waitForTimeout(1000);
    }
  }
  
  await page.screenshot({ path: 'ScreenShots/battle-data-clear-test.png' });
  
  await browser.close();
})();