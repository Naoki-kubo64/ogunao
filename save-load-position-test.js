const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 セーブ/ロード画面位置テスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 最初のノードをクリックして戦闘開始
  const firstNode = await page.$('[data-node-id="floor_1_node_0"]');
  if (firstNode) {
    await firstNode.click();
    await page.waitForTimeout(1000);
  }
  
  // 一時停止メニューを開く
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  
  // セーブボタンをクリック
  console.log('💾 セーブ画面のテスト');
  await page.click('#story-pause-save');
  await page.waitForTimeout(1000);
  
  // セーブ選択メニューが表示されたかチェック
  const saveMenuVisible = await page.evaluate(() => {
    const menu = document.getElementById('save-select-menu');
    return menu && !menu.classList.contains('hidden');
  });
  
  if (saveMenuVisible) {
    console.log('✅ セーブ選択メニューが表示されました');
    
    // セーブメニューの位置を確認
    const saveMenuPosition = await page.evaluate(() => {
      const menu = document.getElementById('save-select-menu');
      const content = menu.querySelector('.pause-menu-content');
      const rect = content.getBoundingClientRect();
      
      return {
        screen: {
          width: window.innerWidth,
          height: window.innerHeight,
          centerX: window.innerWidth / 2,
          centerY: window.innerHeight / 2
        },
        menu: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        }
      };
    });
    
    console.log('📏 セーブメニューの位置:');
    console.log('  画面中央:', `(${saveMenuPosition.screen.centerX}, ${saveMenuPosition.screen.centerY})`);
    console.log('  メニュー中央:', `(${saveMenuPosition.menu.centerX}, ${saveMenuPosition.menu.centerY})`);
    console.log('  X軸のずれ:', Math.abs(saveMenuPosition.screen.centerX - saveMenuPosition.menu.centerX).toFixed(1) + 'px');
    console.log('  Y軸のずれ:', Math.abs(saveMenuPosition.screen.centerY - saveMenuPosition.menu.centerY).toFixed(1) + 'px');
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'Screenshots/save-menu-position.png' });
    
    // 中央配置の評価
    const xOffset = Math.abs(saveMenuPosition.screen.centerX - saveMenuPosition.menu.centerX);
    const yOffset = Math.abs(saveMenuPosition.screen.centerY - saveMenuPosition.menu.centerY);
    
    if (xOffset < 10 && yOffset < 10) {
      console.log('🎉 セーブメニューは適切に中央配置されています');
    } else {
      console.log('⚠️ セーブメニューの位置調整が必要です');
      console.log('  X軸:', xOffset < 10 ? '✅ 良好' : '❌ 要調整');
      console.log('  Y軸:', yOffset < 10 ? '✅ 良好' : '❌ 要調整');
    }
    
    // セーブメニューを閉じる
    await page.click('#save-select-back');
    await page.waitForTimeout(1000);
  } else {
    console.log('❌ セーブ選択メニューが表示されませんでした');
  }
  
  // ロードメニューのテスト
  console.log('📂 ロードメニューのテスト');
  await page.click('#story-load-game');
  await page.waitForTimeout(1000);
  
  // ロード選択メニューが表示されたかチェック（セーブメニューと同じ要素を使用）
  const loadMenuVisible = await page.evaluate(() => {
    const menu = document.getElementById('save-select-menu');
    return menu && !menu.classList.contains('hidden');
  });
  
  if (loadMenuVisible) {
    console.log('✅ ロード選択メニューが表示されました');
    
    // ロードメニューの位置を確認
    const loadMenuPosition = await page.evaluate(() => {
      const menu = document.getElementById('save-select-menu');
      const content = menu.querySelector('.pause-menu-content');
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
    
    console.log('📏 ロードメニューの位置:');
    console.log('  X軸のずれ:', Math.abs(loadMenuPosition.screen.centerX - loadMenuPosition.menu.centerX).toFixed(1) + 'px');
    console.log('  Y軸のずれ:', Math.abs(loadMenuPosition.screen.centerY - loadMenuPosition.menu.centerY).toFixed(1) + 'px');
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'Screenshots/load-menu-position.png' });
    
    // 中央配置の評価
    const xOffset = Math.abs(loadMenuPosition.screen.centerX - loadMenuPosition.menu.centerX);
    const yOffset = Math.abs(loadMenuPosition.screen.centerY - loadMenuPosition.menu.centerY);
    
    if (xOffset < 10 && yOffset < 10) {
      console.log('🎉 ロードメニューは適切に中央配置されています');
    } else {
      console.log('⚠️ ロードメニューの位置調整が必要です');
      console.log('  X軸:', xOffset < 10 ? '✅ 良好' : '❌ 要調整');
      console.log('  Y軸:', yOffset < 10 ? '✅ 良好' : '❌ 要調整');
    }
    
    // ロードメニューを閉じる
    await page.click('#save-select-back');
    await page.waitForTimeout(1000);
  } else {
    console.log('❌ ロード選択メニューが表示されませんでした');
  }
  
  console.log('🎉 セーブ/ロード位置テスト完了');
  
  await browser.close();
})();