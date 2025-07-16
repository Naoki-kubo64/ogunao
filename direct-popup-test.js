const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 直接ポップアップテスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 利用可能なノードを取得
  const availableNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const circle = node.querySelector('circle');
      return circle && circle.getAttribute('stroke') === '#ffd700';
    }).map(node => {
      const text = node.querySelector('text');
      return {
        id: node.getAttribute('data-node-id'),
        type: text ? text.textContent : 'unknown'
      };
    });
  });
  
  console.log('📋 利用可能なノード:', availableNodes);
  
  if (availableNodes.length > 0) {
    // 最初の利用可能なノードをクリック
    await page.click(`[data-node-id="${availableNodes[0].id}"]`);
    await page.waitForTimeout(1000);
    
    // 戦闘画面が表示されたか確認
    const battleVisible = await page.evaluate(() => {
      const screen = document.getElementById('story-battle-screen');
      return screen && !screen.classList.contains('hidden');
    });
    
    if (battleVisible) {
      console.log('⚔️ 戦闘画面が表示されました');
      
      // 強制的に敵HPを0にして勝利
      await page.evaluate(() => {
        document.getElementById('debug-enemy-hp-zero').click();
      });
      await page.waitForTimeout(1000);
      
      // 勝利画面が表示されたか確認
      const victoryVisible = await page.evaluate(() => {
        const screen = document.getElementById('story-victory-screen');
        return screen && !screen.classList.contains('hidden');
      });
      
      if (victoryVisible) {
        console.log('🎉 勝利画面が表示されました');
        
        // 勝利画面の位置を確認
        const victoryPosition = await page.evaluate(() => {
          const screen = document.getElementById('story-victory-screen');
          const rect = screen.getBoundingClientRect();
          
          return {
            screen: {
              width: window.innerWidth,
              height: window.innerHeight,
              centerX: window.innerWidth / 2,
              centerY: window.innerHeight / 2
            },
            victory: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              centerX: rect.left + rect.width / 2,
              centerY: rect.top + rect.height / 2
            }
          };
        });
        
        console.log('📏 勝利画面の位置:');
        console.log('  画面中央:', `(${victoryPosition.screen.centerX}, ${victoryPosition.screen.centerY})`);
        console.log('  勝利画面中央:', `(${victoryPosition.victory.centerX}, ${victoryPosition.victory.centerY})`);
        console.log('  X軸のずれ:', Math.abs(victoryPosition.screen.centerX - victoryPosition.victory.centerX));
        console.log('  Y軸のずれ:', Math.abs(victoryPosition.screen.centerY - victoryPosition.victory.centerY));
        
        // スクリーンショットを撮る
        await page.screenshot({ path: 'ScreenShots/victory-screen-position.png' });
        
        // 報酬を選択
        await page.evaluate(() => {
          document.getElementById('reward-special-puyo').click();
        });
        await page.waitForTimeout(1000);
        
        // マップに戻ったら、次のノードを探す
        const nextNodes = await page.$$eval('[data-node-id]', nodes => {
          return nodes.filter(node => {
            const circle = node.querySelector('circle');
            return circle && circle.getAttribute('stroke') === '#ffd700';
          }).map(node => {
            const text = node.querySelector('text');
            return {
              id: node.getAttribute('data-node-id'),
              type: text ? text.textContent : 'unknown'
            };
          });
        });
        
        console.log('📋 次の利用可能なノード:', nextNodes);
        
        // 宝箱、ショップ、イベントノードを探す
        const treasureNode = nextNodes.find(node => node.type === '📦');
        const shopNode = nextNodes.find(node => node.type === '🏪');
        const eventNode = nextNodes.find(node => node.type === '🌟');
        
        if (treasureNode) {
          console.log('📦 宝箱ノードをテスト');
          await page.click(`[data-node-id="${treasureNode.id}"]`);
          await page.waitForTimeout(1000);
          
          const treasurePopupVisible = await page.evaluate(() => {
            const popup = document.getElementById('treasure-popup');
            return popup && !popup.classList.contains('hidden');
          });
          
          if (treasurePopupVisible) {
            await this.testPopupPosition(page, 'treasure', '📦 宝箱ポップアップ');
          }
        } else if (shopNode) {
          console.log('🏪 ショップノードをテスト');
          await page.click(`[data-node-id="${shopNode.id}"]`);
          await page.waitForTimeout(1000);
          
          const shopPopupVisible = await page.evaluate(() => {
            const popup = document.getElementById('shop-popup');
            return popup && !popup.classList.contains('hidden');
          });
          
          if (shopPopupVisible) {
            await this.testPopupPosition(page, 'shop', '🏪 ショップポップアップ');
          }
        } else if (eventNode) {
          console.log('🌟 イベントノードをテスト');
          await page.click(`[data-node-id="${eventNode.id}"]`);
          await page.waitForTimeout(1000);
          
          const eventPopupVisible = await page.evaluate(() => {
            const popup = document.getElementById('event-popup');
            return popup && !popup.classList.contains('hidden');
          });
          
          if (eventPopupVisible) {
            await this.testPopupPosition(page, 'event', '🌟 イベントポップアップ');
          }
        } else {
          console.log('⚠️ 宝箱、ショップ、イベントノードが見つかりません');
        }
      }
    } else {
      // 直接ポップアップが表示されたかチェック
      const popups = await page.evaluate(() => {
        const treasure = document.getElementById('treasure-popup');
        const shop = document.getElementById('shop-popup');
        const event = document.getElementById('event-popup');
        
        return {
          treasure: treasure && !treasure.classList.contains('hidden'),
          shop: shop && !shop.classList.contains('hidden'),
          event: event && !event.classList.contains('hidden')
        };
      });
      
      console.log('📋 ポップアップ状態:', popups);
      
      if (popups.treasure) {
        console.log('📦 宝箱ポップアップが表示されました');
        await this.testPopupPosition(page, 'treasure', '📦 宝箱ポップアップ');
      } else if (popups.shop) {
        console.log('🏪 ショップポップアップが表示されました');
        await this.testPopupPosition(page, 'shop', '🏪 ショップポップアップ');
      } else if (popups.event) {
        console.log('🌟 イベントポップアップが表示されました');
        await this.testPopupPosition(page, 'event', '🌟 イベントポップアップ');
      }
    }
  }
  
  await browser.close();
  
  // ポップアップの位置をテストする関数
  async function testPopupPosition(page, type, name) {
    const position = await page.evaluate((popupType) => {
      const popup = document.getElementById(`${popupType}-popup`);
      const content = popup.querySelector('.popup-content');
      const rect = content.getBoundingClientRect();
      
      return {
        screen: {
          width: window.innerWidth,
          height: window.innerHeight,
          centerX: window.innerWidth / 2,
          centerY: window.innerHeight / 2
        },
        popup: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        }
      };
    }, type);
    
    console.log(`📏 ${name}の位置:`);
    console.log('  画面中央:', `(${position.screen.centerX}, ${position.screen.centerY})`);
    console.log('  ポップアップ中央:', `(${position.popup.centerX}, ${position.popup.centerY})`);
    console.log('  X軸のずれ:', Math.abs(position.screen.centerX - position.popup.centerX));
    console.log('  Y軸のずれ:', Math.abs(position.screen.centerY - position.popup.centerY));
    
    // スクリーンショットを撮る
    await page.screenshot({ path: `ScreenShots/${type}-popup-position-test.png` });
  }
})();