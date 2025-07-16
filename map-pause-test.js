const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 マップ画面でのポーズメニュー機能テスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // マップ画面が表示されているか確認
  const mapScreenVisible = await page.evaluate(() => {
    const mapScreen = document.getElementById('story-map-screen');
    return mapScreen && !mapScreen.classList.contains('hidden');
  });
  
  if (mapScreenVisible) {
    console.log('✅ マップ画面が表示されました');
    
    // マップ画面でEscキーを押下
    console.log('⌨️ マップ画面でEscキーを押下');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // ポーズメニューが表示されたか確認
    const pauseMenuVisible = await page.evaluate(() => {
      const pauseMenu = document.getElementById('story-pause-menu');
      return pauseMenu && !pauseMenu.classList.contains('hidden');
    });
    
    if (pauseMenuVisible) {
      console.log('🎉 マップ画面でのポーズメニューが正常に表示されました！');
      
      // ポーズメニューの位置を確認
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
        const xOffset = Math.abs(pauseMenuPosition.screen.centerX - pauseMenuPosition.menu.centerX);
        const yOffset = Math.abs(pauseMenuPosition.screen.centerY - pauseMenuPosition.menu.centerY);
        
        console.log('📏 ポーズメニューの位置:');
        console.log('  X軸のずれ:', xOffset.toFixed(1) + 'px');
        console.log('  Y軸のずれ:', yOffset.toFixed(1) + 'px');
        
        if (xOffset < 10 && yOffset < 10) {
          console.log('✅ ポーズメニューは適切に中央配置されています');
        }
      }
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'Screenshots/map-pause-menu.png' });
      
      // セーブ機能をテスト
      console.log('💾 マップ画面でのセーブ機能テスト');
      await page.click('#story-pause-save');
      await page.waitForTimeout(1000);
      
      const saveMenuVisible = await page.evaluate(() => {
        const saveMenu = document.getElementById('save-select-menu');
        return saveMenu && !saveMenu.classList.contains('hidden');
      });
      
      if (saveMenuVisible) {
        console.log('✅ セーブメニューが正常に表示されました');
        
        // セーブメニューを閉じる
        await page.click('#save-select-back');
        await page.waitForTimeout(1000);
        
        console.log('✅ セーブメニューが正常に閉じられました');
      } else {
        console.log('❌ セーブメニューが表示されませんでした');
      }
      
      // 設定メニューをテスト
      console.log('⚙️ 設定メニューのテスト');
      await page.click('#story-pause-settings');
      await page.waitForTimeout(1000);
      
      const settingsMenuVisible = await page.evaluate(() => {
        const settingsMenu = document.getElementById('story-settings-menu');
        return settingsMenu && !settingsMenu.classList.contains('hidden');
      });
      
      if (settingsMenuVisible) {
        console.log('✅ 設定メニューが正常に表示されました');
        
        // 設定メニューを閉じる
        await page.click('#story-settings-back');
        await page.waitForTimeout(1000);
        
        console.log('✅ 設定メニューが正常に閉じられました');
      } else {
        console.log('❌ 設定メニューが表示されませんでした');
      }
      
      // ポーズメニューを閉じる（再開）
      console.log('▶️ ゲーム再開のテスト');
      await page.click('#story-pause-resume');
      await page.waitForTimeout(1000);
      
      const pauseMenuClosed = await page.evaluate(() => {
        const pauseMenu = document.getElementById('story-pause-menu');
        return pauseMenu && pauseMenu.classList.contains('hidden');
      });
      
      if (pauseMenuClosed) {
        console.log('✅ ポーズメニューが正常に閉じられ、ゲームが再開されました');
        
        // マップ画面がまだ表示されているか確認
        const mapStillVisible = await page.evaluate(() => {
          const mapScreen = document.getElementById('story-map-screen');
          return mapScreen && !mapScreen.classList.contains('hidden');
        });
        
        if (mapStillVisible) {
          console.log('✅ マップ画面が正常に表示されています');
        } else {
          console.log('❌ マップ画面が表示されていません');
        }
      } else {
        console.log('❌ ポーズメニューが正常に閉じられませんでした');
      }
      
    } else {
      console.log('❌ マップ画面でポーズメニューが表示されませんでした');
    }
  } else {
    console.log('❌ マップ画面が表示されていません');
  }
  
  console.log('🎉 マップ画面ポーズメニューテスト完了');
  
  await browser.close();
})();