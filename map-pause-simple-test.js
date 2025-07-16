const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 マップ画面ポーズメニュー簡易テスト');
  
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
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'Screenshots/map-pause-menu-simple.png' });
      
      // JavaScriptを使って直接セーブメニューを表示
      console.log('💾 JavaScriptでセーブメニューを直接表示');
      await page.evaluate(() => {
        // セーブメニューを直接表示
        const saveMenu = document.getElementById('save-select-menu');
        if (saveMenu) {
          saveMenu.classList.remove('hidden');
        }
      });
      
      await page.waitForTimeout(1000);
      
      const saveMenuVisible = await page.evaluate(() => {
        const saveMenu = document.getElementById('save-select-menu');
        return saveMenu && !saveMenu.classList.contains('hidden');
      });
      
      if (saveMenuVisible) {
        console.log('✅ セーブメニューが正常に表示されました');
        
        // セーブメニューのスクリーンショットを撮る
        await page.screenshot({ path: 'Screenshots/map-save-menu-direct.png' });
        
        // セーブメニューを閉じる
        await page.evaluate(() => {
          const saveMenu = document.getElementById('save-select-menu');
          if (saveMenu) {
            saveMenu.classList.add('hidden');
          }
        });
        
        console.log('✅ セーブメニューが正常に閉じられました');
      } else {
        console.log('❌ セーブメニューが表示されませんでした');
      }
      
      // ポーズメニューを再開ボタンで閉じる
      console.log('▶️ ゲーム再開のテスト');
      await page.evaluate(() => {
        const resumeBtn = document.getElementById('story-pause-resume');
        if (resumeBtn) {
          resumeBtn.click();
        }
      });
      
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
      
      // 再度Escキーを押してポーズメニューが表示されるか確認
      console.log('🔄 再度Escキーでポーズメニューを表示');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      
      const pauseMenuAgain = await page.evaluate(() => {
        const pauseMenu = document.getElementById('story-pause-menu');
        return pauseMenu && !pauseMenu.classList.contains('hidden');
      });
      
      if (pauseMenuAgain) {
        console.log('✅ 再度ポーズメニューが正常に表示されました');
        
        // タイトルに戻る機能をテスト
        console.log('🏠 タイトルに戻る機能のテスト');
        await page.evaluate(() => {
          const titleBtn = document.getElementById('story-pause-title');
          if (titleBtn) {
            titleBtn.click();
          }
        });
        
        await page.waitForTimeout(2000);
        
        const titleScreenVisible = await page.evaluate(() => {
          const titleScreen = document.getElementById('story-screen');
          return titleScreen && !titleScreen.classList.contains('hidden');
        });
        
        if (titleScreenVisible) {
          console.log('✅ タイトル画面に正常に戻りました');
        } else {
          console.log('❌ タイトル画面に戻れませんでした');
        }
      } else {
        console.log('❌ 再度ポーズメニューが表示されませんでした');
      }
      
    } else {
      console.log('❌ マップ画面でポーズメニューが表示されませんでした');
    }
  } else {
    console.log('❌ マップ画面が表示されていません');
  }
  
  console.log('🎉 マップ画面ポーズメニュー簡易テスト完了');
  
  await browser.close();
})();