const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ポップアップ表示位置テスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('📦') || msg.text().includes('🏪') || msg.text().includes('🌟')) {
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
  
  console.log('🔍 各ポップアップの位置をテストします...');
  
  // 宝箱ポップアップのテスト
  console.log('📦 宝箱ポップアップのテスト');
  const treasureNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const text = node.querySelector('text');
      return text && text.textContent === '📦';
    }).map(node => node.getAttribute('data-node-id'));
  });
  
  if (treasureNodes.length > 0) {
    // 宝箱ノードまで進む必要がある場合は戦闘を進める
    let attempts = 0;
    while (attempts < 10) {
      const availableNodes = await page.$$eval('[data-node-id]', nodes => {
        return nodes.filter(node => {
          const circle = node.querySelector('circle');
          return circle && circle.getAttribute('stroke') === '#ffd700';
        }).map(node => node.getAttribute('data-node-id'));
      });
      
      if (availableNodes.length > 0) {
        const nodeToClick = availableNodes.find(id => treasureNodes.includes(id)) || availableNodes[0];
        await page.click(`[data-node-id="${nodeToClick}"]`);
        await page.waitForTimeout(1000);
        
        // 宝箱ポップアップが表示されたかチェック
        const treasurePopupVisible = await page.evaluate(() => {
          const popup = document.getElementById('treasure-popup');
          return popup && !popup.classList.contains('hidden');
        });
        
        if (treasurePopupVisible) {
          console.log('✅ 宝箱ポップアップが表示されました');
          
          // ポップアップの位置情報を取得
          const popupPosition = await page.evaluate(() => {
            const popup = document.getElementById('treasure-popup');
            const content = popup.querySelector('.popup-content');
            const rect = content.getBoundingClientRect();
            
            return {
              popup: {
                width: window.innerWidth,
                height: window.innerHeight,
                centerX: window.innerWidth / 2,
                centerY: window.innerHeight / 2
              },
              content: {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2
              }
            };
          });
          
          console.log('📏 宝箱ポップアップの位置情報:');
          console.log('  画面中央:', `(${popupPosition.popup.centerX}, ${popupPosition.popup.centerY})`);
          console.log('  ポップアップ中央:', `(${popupPosition.content.centerX}, ${popupPosition.content.centerY})`);
          console.log('  X軸のずれ:', Math.abs(popupPosition.popup.centerX - popupPosition.content.centerX));
          console.log('  Y軸のずれ:', Math.abs(popupPosition.popup.centerY - popupPosition.content.centerY));
          
          // スクリーンショットを撮る
          await page.screenshot({ path: 'ScreenShots/treasure-popup-position.png' });
          
          // ポップアップを閉じる
          await page.evaluate(() => {
            document.getElementById('treasure-close').click();
          });
          break;
        }
        
        // 戦闘画面が表示された場合は勝利
        const battleVisible = await page.evaluate(() => {
          const screen = document.getElementById('story-battle-screen');
          return screen && !screen.classList.contains('hidden');
        });
        
        if (battleVisible) {
          await page.click('#debug-enemy-hp-zero');
          await page.waitForTimeout(1000);
          await page.click('#reward-special-puyo');
          await page.waitForTimeout(1000);
        }
      }
      
      attempts++;
      await page.waitForTimeout(500);
    }
  }
  
  // ショップポップアップのテスト
  console.log('🏪 ショップポップアップのテスト');
  const shopNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const text = node.querySelector('text');
      return text && text.textContent === '🏪';
    }).map(node => node.getAttribute('data-node-id'));
  });
  
  if (shopNodes.length > 0) {
    let attempts = 0;
    while (attempts < 10) {
      const availableNodes = await page.$$eval('[data-node-id]', nodes => {
        return nodes.filter(node => {
          const circle = node.querySelector('circle');
          return circle && circle.getAttribute('stroke') === '#ffd700';
        }).map(node => node.getAttribute('data-node-id'));
      });
      
      if (availableNodes.length > 0) {
        const nodeToClick = availableNodes.find(id => shopNodes.includes(id)) || availableNodes[0];
        await page.click(`[data-node-id="${nodeToClick}"]`);
        await page.waitForTimeout(1000);
        
        // ショップポップアップが表示されたかチェック
        const shopPopupVisible = await page.evaluate(() => {
          const popup = document.getElementById('shop-popup');
          return popup && !popup.classList.contains('hidden');
        });
        
        if (shopPopupVisible) {
          console.log('✅ ショップポップアップが表示されました');
          
          // ポップアップの位置情報を取得
          const popupPosition = await page.evaluate(() => {
            const popup = document.getElementById('shop-popup');
            const content = popup.querySelector('.popup-content');
            const rect = content.getBoundingClientRect();
            
            return {
              popup: {
                width: window.innerWidth,
                height: window.innerHeight,
                centerX: window.innerWidth / 2,
                centerY: window.innerHeight / 2
              },
              content: {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2
              }
            };
          });
          
          console.log('📏 ショップポップアップの位置情報:');
          console.log('  画面中央:', `(${popupPosition.popup.centerX}, ${popupPosition.popup.centerY})`);
          console.log('  ポップアップ中央:', `(${popupPosition.content.centerX}, ${popupPosition.content.centerY})`);
          console.log('  X軸のずれ:', Math.abs(popupPosition.popup.centerX - popupPosition.content.centerX));
          console.log('  Y軸のずれ:', Math.abs(popupPosition.popup.centerY - popupPosition.content.centerY));
          
          // スクリーンショットを撮る
          await page.screenshot({ path: 'ScreenShots/shop-popup-position.png' });
          
          // ポップアップを閉じる
          await page.evaluate(() => {
            document.getElementById('shop-close').click();
          });
          break;
        }
        
        // 戦闘画面が表示された場合は勝利
        const battleVisible = await page.evaluate(() => {
          const screen = document.getElementById('story-battle-screen');
          return screen && !screen.classList.contains('hidden');
        });
        
        if (battleVisible) {
          await page.click('#debug-enemy-hp-zero');
          await page.waitForTimeout(1000);
          await page.click('#reward-special-puyo');
          await page.waitForTimeout(1000);
        }
      }
      
      attempts++;
      await page.waitForTimeout(500);
    }
  }
  
  // イベントポップアップのテスト
  console.log('🌟 イベントポップアップのテスト');
  const eventNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const text = node.querySelector('text');
      return text && text.textContent === '🌟';
    }).map(node => node.getAttribute('data-node-id'));
  });
  
  if (eventNodes.length > 0) {
    let attempts = 0;
    while (attempts < 10) {
      const availableNodes = await page.$$eval('[data-node-id]', nodes => {
        return nodes.filter(node => {
          const circle = node.querySelector('circle');
          return circle && circle.getAttribute('stroke') === '#ffd700';
        }).map(node => node.getAttribute('data-node-id'));
      });
      
      if (availableNodes.length > 0) {
        const nodeToClick = availableNodes.find(id => eventNodes.includes(id)) || availableNodes[0];
        await page.click(`[data-node-id="${nodeToClick}"]`);
        await page.waitForTimeout(1000);
        
        // イベントポップアップが表示されたかチェック
        const eventPopupVisible = await page.evaluate(() => {
          const popup = document.getElementById('event-popup');
          return popup && !popup.classList.contains('hidden');
        });
        
        if (eventPopupVisible) {
          console.log('✅ イベントポップアップが表示されました');
          
          // ポップアップの位置情報を取得
          const popupPosition = await page.evaluate(() => {
            const popup = document.getElementById('event-popup');
            const content = popup.querySelector('.popup-content');
            const rect = content.getBoundingClientRect();
            
            return {
              popup: {
                width: window.innerWidth,
                height: window.innerHeight,
                centerX: window.innerWidth / 2,
                centerY: window.innerHeight / 2
              },
              content: {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2
              }
            };
          });
          
          console.log('📏 イベントポップアップの位置情報:');
          console.log('  画面中央:', `(${popupPosition.popup.centerX}, ${popupPosition.popup.centerY})`);
          console.log('  ポップアップ中央:', `(${popupPosition.content.centerX}, ${popupPosition.content.centerY})`);
          console.log('  X軸のずれ:', Math.abs(popupPosition.popup.centerX - popupPosition.content.centerX));
          console.log('  Y軸のずれ:', Math.abs(popupPosition.popup.centerY - popupPosition.content.centerY));
          
          // スクリーンショットを撮る
          await page.screenshot({ path: 'ScreenShots/event-popup-position.png' });
          
          // ポップアップを閉じる
          await page.evaluate(() => {
            document.getElementById('event-close').click();
          });
          break;
        }
        
        // 戦闘画面が表示された場合は勝利
        const battleVisible = await page.evaluate(() => {
          const screen = document.getElementById('story-battle-screen');
          return screen && !screen.classList.contains('hidden');
        });
        
        if (battleVisible) {
          await page.click('#debug-enemy-hp-zero');
          await page.waitForTimeout(1000);
          await page.click('#reward-special-puyo');
          await page.waitForTimeout(1000);
        }
      }
      
      attempts++;
      await page.waitForTimeout(500);
    }
  }
  
  console.log('🎉 ポップアップ位置テスト完了');
  
  await browser.close();
})();