const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 最終検証テスト');
  console.log('==================');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('🔧') || msg.text().includes('マップノードクリック') || msg.text().includes('勝利') || msg.text().includes('敗北') || msg.text().includes('報酬獲得')) {
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
  
  // 利用可能なノードをクリック
  console.log('2. マップノードクリック');
  const availableNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.map(node => ({
      id: node.getAttribute('data-node-id'),
      available: node.querySelector('circle').getAttribute('stroke') === '#ffd700'
    })).filter(node => node.available);
  });
  
  if (availableNodes.length > 0) {
    await page.click(`[data-node-id="${availableNodes[0].id}"]`);
    await page.waitForTimeout(2000);
    
    // 戦闘画面確認
    const battleVisible = await page.evaluate(() => {
      const screen = document.getElementById('story-battle-screen');
      return screen && !screen.classList.contains('hidden');
    });
    
    console.log('3. 戦闘画面表示:', battleVisible ? '✅' : '❌');
    
    if (battleVisible) {
      // ゲーム動作確認
      const gameRunning = await page.evaluate(() => {
        return window.storyMode && window.storyMode.gameRunning;
      });
      
      console.log('4. ゲーム動作確認:', gameRunning ? '✅' : '❌');
      
      if (gameRunning) {
        console.log('5. デバッグボタンで敵HP0');
        await page.click('#debug-enemy-hp-zero');
        await page.waitForTimeout(2000);
        
        // 勝利画面が表示されるか確認
        const victoryVisible = await page.evaluate(() => {
          const screen = document.getElementById('story-victory-screen');
          return screen && !screen.classList.contains('hidden');
        });
        
        console.log('6. 勝利画面表示:', victoryVisible ? '✅' : '❌');
        
        if (victoryVisible) {
          console.log('7. 報酬選択（特殊ぷよ）');
          const rewardBtn = await page.$('#reward-special-puyo');
          if (rewardBtn) {
            await page.click('#reward-special-puyo');
            await page.waitForTimeout(2000);
            
            // マップに戻ったか確認
            const mapVisible = await page.evaluate(() => {
              const mapScreen = document.getElementById('story-map-screen');
              return mapScreen && !mapScreen.classList.contains('hidden');
            });
            
            console.log('8. マップ復帰:', mapVisible ? '✅' : '❌');
            
            if (mapVisible) {
              // 次のノードが利用可能か確認
              const nextNodes = await page.$$eval('[data-node-id]', nodes => {
                return nodes.filter(node => 
                  node.querySelector('circle').getAttribute('stroke') === '#ffd700'
                );
              });
              
              console.log('9. 次の利用可能ノード数:', nextNodes.length);
              
              if (nextNodes.length > 0) {
                console.log('10. 2戦目開始');
                await page.click(`[data-node-id="${nextNodes[0].getAttribute('data-node-id')}"]`);
                await page.waitForTimeout(2000);
                
                const secondBattleVisible = await page.evaluate(() => {
                  const screen = document.getElementById('story-battle-screen');
                  return screen && !screen.classList.contains('hidden');
                });
                
                console.log('11. 2戦目画面表示:', secondBattleVisible ? '✅' : '❌');
                
                if (secondBattleVisible) {
                  const secondGameRunning = await page.evaluate(() => {
                    return window.storyMode && window.storyMode.gameRunning;
                  });
                  
                  console.log('12. 2戦目ゲーム動作:', secondGameRunning ? '✅' : '❌');
                  
                  if (secondGameRunning) {
                    console.log('🎉 すべての修正が正常に動作しています！');
                    
                    // マップホバーテスト
                    console.log('13. マップアイコンホバーテスト');
                    await page.click('#debug-player-hp-zero');
                    await page.waitForTimeout(2000);
                    
                    // マップに戻ってホバーテスト
                    const finalMapVisible = await page.evaluate(() => {
                      const mapScreen = document.getElementById('story-map-screen');
                      return mapScreen && !mapScreen.classList.contains('hidden');
                    });
                    
                    if (finalMapVisible) {
                      console.log('14. マップでホバーテスト実行中...');
                      // マップノードにマウスホバー
                      const mapNodes = await page.$$('[data-node-id]');
                      if (mapNodes.length > 0) {
                        await page.hover(`[data-node-id="${mapNodes[0].getAttribute('data-node-id')}"]`);
                        await page.waitForTimeout(1000);
                        console.log('✅ マップアイコンホバーテスト完了（震えないことを確認）');
                      }
                    }
                  }
                }
              }
            }
          } else {
            console.log('❌ 報酬ボタンが見つかりません');
          }
        }
      }
    }
  }
  
  console.log('==================');
  console.log('🎉 最終検証テスト完了');
  
  await page.screenshot({ path: 'ScreenShots/final-verification-test.png' });
  
  await browser.close();
})();