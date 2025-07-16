const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 セーブ/ロード位置クイックテスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 一時停止メニューを開く
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  
  // セーブボタンをクリック
  console.log('💾 セーブ画面の位置テスト');
  await page.click('#story-pause-save');
  await page.waitForTimeout(1000);
  
  // セーブ選択メニューの位置を確認
  const saveMenuPosition = await page.evaluate(() => {
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
  
  if (saveMenuPosition) {
    console.log('✅ セーブメニューが表示されました');
    console.log('📏 位置情報:');
    console.log('  画面中央:', `(${saveMenuPosition.screen.centerX}, ${saveMenuPosition.screen.centerY})`);
    console.log('  メニュー中央:', `(${saveMenuPosition.menu.centerX}, ${saveMenuPosition.menu.centerY})`);
    
    const xOffset = Math.abs(saveMenuPosition.screen.centerX - saveMenuPosition.menu.centerX);
    const yOffset = Math.abs(saveMenuPosition.screen.centerY - saveMenuPosition.menu.centerY);
    
    console.log('  X軸のずれ:', xOffset.toFixed(1) + 'px');
    console.log('  Y軸のずれ:', yOffset.toFixed(1) + 'px');
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'Screenshots/save-menu-position-fixed.png' });
    
    if (xOffset < 10 && yOffset < 10) {
      console.log('🎉 セーブメニューは完璧に中央配置されています！');
    } else {
      console.log('⚠️ まだ調整が必要です');
    }
    
    // セーブメニューを閉じる
    await page.click('#save-select-back');
    await page.waitForTimeout(1000);
  } else {
    console.log('❌ セーブメニューが表示されませんでした');
  }
  
  // 一時停止メニューの位置も確認
  console.log('⏸️ 一時停止メニューの位置テスト');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  
  const pauseMenuPosition = await page.evaluate(() => {
    const menu = document.getElementById('story-pause-menu');
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
  
  if (pauseMenuPosition) {
    console.log('✅ 一時停止メニューが表示されました');
    
    const xOffset = Math.abs(pauseMenuPosition.screen.centerX - pauseMenuPosition.menu.centerX);
    const yOffset = Math.abs(pauseMenuPosition.screen.centerY - pauseMenuPosition.menu.centerY);
    
    console.log('📏 位置情報:');
    console.log('  X軸のずれ:', xOffset.toFixed(1) + 'px');
    console.log('  Y軸のずれ:', yOffset.toFixed(1) + 'px');
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'Screenshots/pause-menu-position-fixed.png' });
    
    if (xOffset < 10 && yOffset < 10) {
      console.log('🎉 一時停止メニューも完璧に中央配置されています！');
    } else {
      console.log('⚠️ 一時停止メニューも調整が必要です');
    }
  }
  
  console.log('🎉 テスト完了');
  
  await browser.close();
})();