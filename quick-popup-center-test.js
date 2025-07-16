const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ポップアップ中央配置クイックテスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 宝箱ノードを探す
  const treasureNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const text = node.querySelector('text');
      return text && text.textContent === '📦';
    }).map(node => node.getAttribute('data-node-id'));
  });
  
  if (treasureNodes.length > 0) {
    // 宝箱ノードを直接クリック（利用可能でなくても）
    await page.click(`[data-node-id="${treasureNodes[0]}"]`);
    await page.waitForTimeout(1000);
    
    // 宝箱ポップアップが表示されているか確認
    const treasurePopupVisible = await page.evaluate(() => {
      const popup = document.getElementById('treasure-popup');
      return popup && !popup.classList.contains('hidden');
    });
    
    if (treasurePopupVisible) {
      console.log('✅ 宝箱ポップアップが表示されました');
      
      // 現在の位置を確認
      const currentPosition = await page.evaluate(() => {
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
      
      console.log('📏 現在の位置:');
      console.log('  画面中央:', `(${currentPosition.screen.centerX}, ${currentPosition.screen.centerY})`);
      console.log('  ポップアップ中央:', `(${currentPosition.popup.centerX}, ${currentPosition.popup.centerY})`);
      console.log('  X軸のずれ:', Math.abs(currentPosition.screen.centerX - currentPosition.popup.centerX));
      console.log('  Y軸のずれ:', Math.abs(currentPosition.screen.centerY - currentPosition.popup.centerY));
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'ScreenShots/popup-center-before.png' });
      
      // CSSを動的に調整してより中央に配置
      await page.evaluate(() => {
        const popup = document.getElementById('treasure-popup');
        if (popup) {
          popup.style.display = 'flex';
          popup.style.justifyContent = 'center';
          popup.style.alignItems = 'center';
          popup.style.position = 'fixed';
          popup.style.top = '0';
          popup.style.left = '0';
          popup.style.width = '100vw';
          popup.style.height = '100vh';
          popup.style.padding = '20px';
          popup.style.boxSizing = 'border-box';
          
          const content = popup.querySelector('.popup-content');
          if (content) {
            content.style.position = 'relative';
            content.style.margin = 'auto';
            content.style.transform = 'scale(1)';
            content.style.transformOrigin = 'center center';
          }
        }
      });
      
      await page.waitForTimeout(500);
      
      // 調整後の位置を確認
      const adjustedPosition = await page.evaluate(() => {
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
      
      console.log('📏 調整後の位置:');
      console.log('  画面中央:', `(${adjustedPosition.screen.centerX}, ${adjustedPosition.screen.centerY})`);
      console.log('  ポップアップ中央:', `(${adjustedPosition.popup.centerX}, ${adjustedPosition.popup.centerY})`);
      console.log('  X軸のずれ:', Math.abs(adjustedPosition.screen.centerX - adjustedPosition.popup.centerX));
      console.log('  Y軸のずれ:', Math.abs(adjustedPosition.screen.centerY - adjustedPosition.popup.centerY));
      
      const improvementX = Math.abs(currentPosition.screen.centerX - currentPosition.popup.centerX) - Math.abs(adjustedPosition.screen.centerX - adjustedPosition.popup.centerX);
      const improvementY = Math.abs(currentPosition.screen.centerY - currentPosition.popup.centerY) - Math.abs(adjustedPosition.screen.centerY - adjustedPosition.popup.centerY);
      
      console.log('📊 改善度:');
      console.log('  X軸:', improvementX > 0 ? `✅ ${improvementX.toFixed(1)}px改善` : `❌ ${Math.abs(improvementX).toFixed(1)}px悪化`);
      console.log('  Y軸:', improvementY > 0 ? `✅ ${improvementY.toFixed(1)}px改善` : `❌ ${Math.abs(improvementY).toFixed(1)}px悪化`);
      
      // 調整後のスクリーンショットを撮る
      await page.screenshot({ path: 'ScreenShots/popup-center-after.png' });
      
      // 完璧な中央配置かチェック
      const xPerfect = Math.abs(adjustedPosition.screen.centerX - adjustedPosition.popup.centerX) < 5;
      const yPerfect = Math.abs(adjustedPosition.screen.centerY - adjustedPosition.popup.centerY) < 5;
      
      if (xPerfect && yPerfect) {
        console.log('🎉 完璧な中央配置が達成されました！');
      } else {
        console.log('⚠️ さらなる調整が必要です');
      }
      
    } else {
      console.log('❌ 宝箱ポップアップが表示されませんでした');
    }
  } else {
    console.log('❌ 宝箱ノードが見つかりませんでした');
  }
  
  await browser.close();
})();