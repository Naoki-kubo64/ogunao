const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ショップポップアップテスト');
  
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
  
  // ショップノードを探す
  const shopNode = availableNodes.find(node => node.type === '🏪');
  
  if (shopNode) {
    console.log('🏪 ショップノードを発見:', shopNode.id);
    await page.click(`[data-node-id="${shopNode.id}"]`);
    await page.waitForTimeout(1000);
    
    // ショップポップアップが表示されたか確認
    const shopPopupVisible = await page.evaluate(() => {
      const popup = document.getElementById('shop-popup');
      return popup && !popup.classList.contains('hidden');
    });
    
    if (shopPopupVisible) {
      console.log('✅ ショップポップアップが表示されました');
      
      // 現在の位置を確認
      const currentPosition = await page.evaluate(() => {
        const popup = document.getElementById('shop-popup');
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
      
      console.log('📏 現在の位置:');
      console.log('  画面中央:', `(${currentPosition.screen.centerX}, ${currentPosition.screen.centerY})`);
      console.log('  ポップアップ中央:', `(${currentPosition.popup.centerX}, ${currentPosition.popup.centerY})`);
      console.log('  X軸のずれ:', Math.abs(currentPosition.screen.centerX - currentPosition.popup.centerX).toFixed(1));
      console.log('  Y軸のずれ:', Math.abs(currentPosition.screen.centerY - currentPosition.popup.centerY).toFixed(1));
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'ScreenShots/shop-popup-position-current.png' });
      
      // 完璧な中央配置かチェック
      const xPerfect = Math.abs(currentPosition.screen.centerX - currentPosition.popup.centerX) < 10;
      const yPerfect = Math.abs(currentPosition.screen.centerY - currentPosition.popup.centerY) < 10;
      
      if (xPerfect && yPerfect) {
        console.log('🎉 ショップポップアップが適切に中央に配置されています！');
      } else {
        console.log('⚠️ 位置調整が必要です');
        
        // さらに詳細な情報を取得
        const detailedInfo = await page.evaluate(() => {
          const popup = document.getElementById('shop-popup');
          const content = popup.querySelector('.popup-content');
          
          const popupStyles = window.getComputedStyle(popup);
          const contentStyles = window.getComputedStyle(content);
          
          return {
            popup: {
              display: popupStyles.display,
              position: popupStyles.position,
              justifyContent: popupStyles.justifyContent,
              alignItems: popupStyles.alignItems,
              top: popupStyles.top,
              left: popupStyles.left,
              width: popupStyles.width,
              height: popupStyles.height
            },
            content: {
              position: contentStyles.position,
              margin: contentStyles.margin,
              transform: contentStyles.transform,
              transformOrigin: contentStyles.transformOrigin
            }
          };
        });
        
        console.log('🔍 詳細情報:');
        console.log('  ポップアップスタイル:', detailedInfo.popup);
        console.log('  コンテンツスタイル:', detailedInfo.content);
      }
      
      // ショップの内容も確認
      const shopContent = await page.evaluate(() => {
        const items = document.querySelectorAll('.shop-item');
        return Array.from(items).map(item => {
          const name = item.querySelector('.shop-item-name').textContent;
          const price = item.querySelector('.shop-item-price').textContent;
          return { name, price };
        });
      });
      
      console.log('🛍️ ショップの商品:', shopContent);
      
      // ポップアップを閉じる
      await page.evaluate(() => {
        document.getElementById('shop-close').click();
      });
      
    } else {
      console.log('❌ ショップポップアップが表示されませんでした');
    }
  } else {
    console.log('⚠️ ショップノードが見つかりません');
  }
  
  await browser.close();
})();