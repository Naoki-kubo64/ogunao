const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 修正確認テスト');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('🔧') || msg.text().includes('マップノードクリック') || msg.text().includes('勝利') || msg.text().includes('敗北')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 利用可能なノードを取得
  const availableNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.map(node => ({
      id: node.getAttribute('data-node-id'),
      available: node.querySelector('circle').getAttribute('stroke') === '#ffd700'
    })).filter(node => node.available);
  });
  
  console.log('利用可能なノード数:', availableNodes.length);
  
  if (availableNodes.length > 0) {
    // ノードをクリック
    await page.click(`[data-node-id="${availableNodes[0].id}"]`);
    await page.waitForTimeout(2000);
    
    // 戦闘画面が表示されているか確認
    const battleVisible = await page.evaluate(() => {
      const screen = document.getElementById('story-battle-screen');
      return screen && !screen.classList.contains('hidden');
    });
    
    if (battleVisible) {
      console.log('✅ ノードクリック後、直接戦闘画面に移行しました');
      
      // ゲームが動作しているか確認
      const gameRunning = await page.evaluate(() => {
        return window.storyMode && window.storyMode.gameRunning;
      });
      
      if (gameRunning) {
        console.log('✅ 戦闘ゲームが正常に動作しています');
        
        // デバッグボタンで勝利
        await page.click('#debug-enemy-hp-zero');
        await page.waitForTimeout(2000);
        
        // マップに戻ったか確認
        const mapVisible = await page.evaluate(() => {
          const mapScreen = document.getElementById('story-map-screen');
          return mapScreen && !mapScreen.classList.contains('hidden');
        });
        
        if (mapVisible) {
          console.log('✅ 勝利後、マップに戻りました');
          
          // 次のノードが利用可能になっているか確認
          const nextNodes = await page.$$eval('[data-node-id]', nodes => {
            return nodes.map(node => ({
              id: node.getAttribute('data-node-id'),
              available: node.querySelector('circle').getAttribute('stroke') === '#ffd700'
            })).filter(node => node.available);
          });
          
          console.log('勝利後の利用可能ノード数:', nextNodes.length);
          
          if (nextNodes.length > 0) {
            console.log('✅ 次のノードが利用可能になっています');
            
            // 2戦目テスト
            await page.click(`[data-node-id="${nextNodes[0].id}"]`);
            await page.waitForTimeout(2000);
            
            const secondBattleVisible = await page.evaluate(() => {
              const screen = document.getElementById('story-battle-screen');
              return screen && !screen.classList.contains('hidden');
            });
            
            if (secondBattleVisible) {
              console.log('✅ 2戦目が正常に開始されました');
              
              // 2戦目でのゲーム動作確認
              const secondGameRunning = await page.evaluate(() => {
                return window.storyMode && window.storyMode.gameRunning;
              });
              
              if (secondGameRunning) {
                console.log('✅ 2戦目でもゲームが正常に動作しています');
                console.log('🎉 すべての修正が正常に動作しています！');
              } else {
                console.log('❌ 2戦目でゲームが動作していません');
              }
              
              // テスト終了
              await page.click('#debug-player-hp-zero');
              await page.waitForTimeout(1000);
            }
          }
        }
      } else {
        console.log('❌ 戦闘ゲームが動作していません');
      }
    } else {
      console.log('❌ 戦闘画面に移行していません');
    }
  }
  
  await page.screenshot({ path: 'ScreenShots/quick-fix-test.png' });
  
  await browser.close();
})();