const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 最終ポップアップ中央配置テスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  console.log('📦 宝箱ポップアップの最終テスト');
  
  // 宝箱ノードを探す
  const treasureNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const text = node.querySelector('text');
      return text && text.textContent === '📦';
    }).map(node => node.getAttribute('data-node-id'));
  });
  
  if (treasureNodes.length > 0) {
    // 宝箱ノードを直接クリック
    await page.click(`[data-node-id="${treasureNodes[0]}"]`);
    await page.waitForTimeout(1000);
    
    // 宝箱ポップアップが表示されているか確認
    const treasurePopupVisible = await page.evaluate(() => {
      const popup = document.getElementById('treasure-popup');
      return popup && !popup.classList.contains('hidden');
    });
    
    if (treasurePopupVisible) {
      console.log('✅ 宝箱ポップアップが表示されました');
      
      // 最終的な位置を確認
      const finalPosition = await page.evaluate(() => {
        const popup = document.getElementById('treasure-popup');
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
      });
      
      console.log('📏 最終位置結果:');
      console.log('  画面中央:', `(${finalPosition.screen.centerX}, ${finalPosition.screen.centerY})`);
      console.log('  ポップアップ中央:', `(${finalPosition.popup.centerX}, ${finalPosition.popup.centerY})`);
      
      const xOffset = Math.abs(finalPosition.screen.centerX - finalPosition.popup.centerX);
      const yOffset = Math.abs(finalPosition.screen.centerY - finalPosition.popup.centerY);
      
      console.log('  X軸のずれ:', xOffset.toFixed(1) + 'px');
      console.log('  Y軸のずれ:', yOffset.toFixed(1) + 'px');
      
      // 最終スクリーンショット
      await page.screenshot({ path: 'Screenshots/final-popup-centering.png' });
      
      // 評価
      const xPerfect = xOffset < 10;
      const yPerfect = yOffset < 10;
      
      if (xPerfect && yPerfect) {
        console.log('🎉 完璧な中央配置が達成されました！');
        console.log('  ✅ X軸:', xOffset < 5 ? '完璧' : '良好');
        console.log('  ✅ Y軸:', yOffset < 5 ? '完璧' : '良好');
      } else {
        console.log('⚠️ 配置に改善の余地があります');
        console.log('  X軸:', xPerfect ? '✅ 良好' : '❌ 要改善');
        console.log('  Y軸:', yPerfect ? '✅ 良好' : '❌ 要改善');
      }
      
      // ポップアップを閉じる
      await page.evaluate(() => {
        document.getElementById('treasure-close').click();
      });
      await page.waitForTimeout(500);
    } else {
      console.log('❌ 宝箱ポップアップが表示されませんでした');
    }
  }
  
  // 次にショップノードを探してテスト
  let attempts = 0;
  while (attempts < 10) {
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
    
    const shopNode = availableNodes.find(node => node.type === '🏪');
    
    if (shopNode) {
      console.log('🏪 ショップポップアップの最終テスト');
      await page.click(`[data-node-id="${shopNode.id}"]`);
      await page.waitForTimeout(1000);
      
      const shopPopupVisible = await page.evaluate(() => {
        const popup = document.getElementById('shop-popup');
        return popup && !popup.classList.contains('hidden');
      });
      
      if (shopPopupVisible) {
        console.log('✅ ショップポップアップが表示されました');
        
        const shopPosition = await page.evaluate(() => {
          const popup = document.getElementById('shop-popup');
          const content = popup.querySelector('.popup-content');
          const rect = content.getBoundingClientRect();
          
          return {
            screen: {
              centerX: window.innerWidth / 2,
              centerY: window.innerHeight / 2
            },
            popup: {
              centerX: rect.left + rect.width / 2,
              centerY: rect.top + rect.height / 2
            }
          };
        });
        
        const xOffset = Math.abs(shopPosition.screen.centerX - shopPosition.popup.centerX);
        const yOffset = Math.abs(shopPosition.screen.centerY - shopPosition.popup.centerY);
        
        console.log('📏 ショップポップアップ位置:');
        console.log('  X軸のずれ:', xOffset.toFixed(1) + 'px');
        console.log('  Y軸のずれ:', yOffset.toFixed(1) + 'px');
        
        await page.screenshot({ path: 'Screenshots/final-shop-popup-centering.png' });
        
        const xPerfect = xOffset < 10;
        const yPerfect = yOffset < 10;
        
        if (xPerfect && yPerfect) {
          console.log('🎉 ショップポップアップも完璧に中央配置されています！');
        }
        
        await page.evaluate(() => {
          document.getElementById('shop-close').click();
        });
      }
      break;
    }
    
    // 利用可能なノードをクリックして進む
    if (availableNodes.length > 0) {
      await page.click(`[data-node-id="${availableNodes[0].id}"]`);
      await page.waitForTimeout(1000);
      
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
  }
  
  console.log('🎉 最終テスト完了！');
  
  await browser.close();
})();