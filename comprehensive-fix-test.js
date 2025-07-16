const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 包括的修正テスト開始');
  console.log('=====================================');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('🔧') || msg.text().includes('マップノードクリック') || msg.text().includes('勝利') || msg.text().includes('敗北')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // テスト1: ストーリーモード開始
  console.log('📖 テスト1: ストーリーモード開始');
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // マップが表示されているか確認
  const mapVisible = await page.evaluate(() => {
    const mapScreen = document.getElementById('story-map-screen');
    return mapScreen && !mapScreen.classList.contains('hidden');
  });
  
  if (mapVisible) {
    console.log('✅ マップ画面が正常に表示されています');
  } else {
    console.log('❌ マップ画面が表示されていません');
    await browser.close();
    return;
  }
  
  // テスト2: マップノードの選択制限テスト
  console.log('🗺️ テスト2: マップノード選択制限テスト');
  
  // 利用可能なノードを確認
  const availableNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.map(node => ({
      id: node.getAttribute('data-node-id'),
      available: node.querySelector('circle').getAttribute('stroke') === '#ffd700'
    })).filter(node => node.available);
  });
  
  console.log('利用可能なノード数:', availableNodes.length);
  
  if (availableNodes.length > 0) {
    // 最初のノードをクリック
    const firstNode = availableNodes[0];
    console.log('選択ノード:', firstNode.id);
    
    await page.click(`[data-node-id="${firstNode.id}"]`);
    await page.waitForTimeout(1000);
    
    // クリック後の利用可能ノード数を確認
    const availableAfterClick = await page.$$eval('[data-node-id]', nodes => {
      return nodes.map(node => ({
        id: node.getAttribute('data-node-id'),
        available: node.querySelector('circle').getAttribute('stroke') === '#ffd700'
      })).filter(node => node.available);
    });
    
    console.log('クリック後の利用可能ノード数:', availableAfterClick.length);
    
    if (availableAfterClick.length < availableNodes.length) {
      console.log('✅ ノード選択後、他の選択肢が正しく無効化されています');
    } else {
      console.log('❌ ノード選択後も他の選択肢が選択可能です');
    }
    
    // 戦闘開始ボタンをクリック
    const battleBtn = await page.$('#start-battle-btn');
    if (battleBtn) {
      console.log('⚔️ テスト3: 戦闘開始テスト');
      await page.click('#start-battle-btn');
      await page.waitForTimeout(3000);
      
      // 戦闘画面が表示されているか確認
      const battleVisible = await page.evaluate(() => {
        const screen = document.getElementById('story-battle-screen');
        return screen && !screen.classList.contains('hidden');
      });
      
      if (battleVisible) {
        console.log('✅ 戦闘画面が正常に表示されています');
        
        // デバッグボタンで敵HPを0にして勝利テスト
        console.log('🔧 テスト4: デバッグボタンテスト（敵HP0）');
        await page.click('#debug-enemy-hp-zero');
        await page.waitForTimeout(2000);
        
        // 勝利後、再びマップに戻るかテスト
        const backToMap = await page.evaluate(() => {
          const mapScreen = document.getElementById('story-map-screen');
          return mapScreen && !mapScreen.classList.contains('hidden');
        });
        
        if (backToMap) {
          console.log('✅ 勝利後、マップに正常に戻りました');
          
          // 2戦目テスト用の次のノードを選択
          console.log('⚔️ テスト5: 2戦目テスト');
          await page.waitForTimeout(1000);
          
          const nextAvailableNodes = await page.$$eval('[data-node-id]', nodes => {
            return nodes.map(node => ({
              id: node.getAttribute('data-node-id'),
              available: node.querySelector('circle').getAttribute('stroke') === '#ffd700'
            })).filter(node => node.available);
          });
          
          if (nextAvailableNodes.length > 0) {
            await page.click(`[data-node-id="${nextAvailableNodes[0].id}"]`);
            await page.waitForTimeout(1000);
            
            const battleBtn2 = await page.$('#start-battle-btn');
            if (battleBtn2) {
              await page.click('#start-battle-btn');
              await page.waitForTimeout(3000);
              
              // 2戦目でぷよが動作するかテスト
              console.log('🎮 2戦目でのぷよ動作テスト');
              
              // キー操作をテスト
              await page.keyboard.press('a');
              await page.waitForTimeout(500);
              await page.keyboard.press('d');
              await page.waitForTimeout(500);
              
              const gameRunning = await page.evaluate(() => {
                return window.storyMode && window.storyMode.gameRunning;
              });
              
              if (gameRunning) {
                console.log('✅ 2戦目でもゲームが正常に動作しています');
              } else {
                console.log('❌ 2戦目でゲームが動作していません');
              }
              
              // 自分HP0ボタンでテスト終了
              await page.click('#debug-player-hp-zero');
              await page.waitForTimeout(2000);
            }
          }
        }
      }
    }
  }
  
  console.log('=====================================');
  console.log('🎉 包括的修正テスト完了');
  
  await page.screenshot({ path: 'ScreenShots/comprehensive-fix-test.png' });
  
  await browser.close();
})();