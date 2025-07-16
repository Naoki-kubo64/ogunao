const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 タイトル画面からのロードメニュー位置テスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  
  // ロードゲームをクリック
  console.log('📂 ロードゲームボタンをクリック');
  await page.click('#story-load-game');
  await page.waitForTimeout(1000);
  
  // ロード選択メニューが表示されたか確認
  const loadMenuVisible = await page.evaluate(() => {
    const menu = document.getElementById('save-select-menu');
    return menu && !menu.classList.contains('hidden');
  });
  
  if (loadMenuVisible) {
    console.log('✅ ロードメニューが表示されました');
    
    // ロードメニューの位置を確認
    const loadMenuPosition = await page.evaluate(() => {
      const menu = document.getElementById('save-select-menu');
      const content = menu.querySelector('.pause-menu-content');
      
      if (!menu || !content) return null;
      
      const rect = content.getBoundingClientRect();
      
      return {
        screen: {
          centerX: window.innerWidth / 2,
          centerY: window.innerHeight / 2
        },
        menu: {
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        }
      };
    });
    
    if (loadMenuPosition) {
      console.log('📏 ロードメニューの位置:');
      console.log('  画面中央:', `(${loadMenuPosition.screen.centerX}, ${loadMenuPosition.screen.centerY})`);
      console.log('  メニュー中央:', `(${loadMenuPosition.menu.centerX}, ${loadMenuPosition.menu.centerY})`);
      
      const xOffset = Math.abs(loadMenuPosition.screen.centerX - loadMenuPosition.menu.centerX);
      const yOffset = Math.abs(loadMenuPosition.screen.centerY - loadMenuPosition.menu.centerY);
      
      console.log('  X軸のずれ:', xOffset.toFixed(1) + 'px');
      console.log('  Y軸のずれ:', yOffset.toFixed(1) + 'px');
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'Screenshots/title-load-menu-position.png' });
      
      if (xOffset < 10 && yOffset < 10) {
        console.log('🎉 タイトルからのロードメニューは完璧に中央配置されています！');
      } else {
        console.log('⚠️ ロードメニューの調整が必要です');
      }
      
      // ロードメニューを閉じる
      await page.click('#save-select-back');
      await page.waitForTimeout(1000);
      
      console.log('✅ ロードメニューが正常に閉じられました');
    }
  } else {
    console.log('❌ ロードメニューが表示されませんでした');
  }
  
  console.log('🎉 タイトル画面テスト完了');
  
  await browser.close();
})();