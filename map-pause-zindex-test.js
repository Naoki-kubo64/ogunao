const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 マップ画面ポーズメニューz-index修正テスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 初期状態のスクリーンショット
  await page.screenshot({ path: 'Screenshots/map-zindex-initial.png' });
  console.log('📸 初期状態のスクリーンショット撮影');
  
  // マップ画面でEscキーを押下
  console.log('⌨️ マップ画面でEscキーを押下');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  
  // Escキー押下後のスクリーンショット
  await page.screenshot({ path: 'Screenshots/map-zindex-after-escape.png' });
  console.log('📸 Escキー押下後のスクリーンショット撮影');
  
  // z-indexの値を確認
  const zIndexInfo = await page.evaluate(() => {
    const mapScreen = document.getElementById('story-map-screen');
    const pauseMenu = document.getElementById('story-pause-menu');
    const pauseContent = pauseMenu ? pauseMenu.querySelector('.pause-menu-content') : null;
    
    return {
      mapScreen: {
        zIndex: mapScreen ? window.getComputedStyle(mapScreen).zIndex : 'not found',
        position: mapScreen ? window.getComputedStyle(mapScreen).position : 'not found'
      },
      pauseMenu: {
        zIndex: pauseMenu ? window.getComputedStyle(pauseMenu).zIndex : 'not found',
        position: pauseMenu ? window.getComputedStyle(pauseMenu).position : 'not found',
        display: pauseMenu ? window.getComputedStyle(pauseMenu).display : 'not found',
        visibility: pauseMenu ? window.getComputedStyle(pauseMenu).visibility : 'not found',
        hidden: pauseMenu ? pauseMenu.classList.contains('hidden') : 'not found'
      },
      pauseContent: {
        zIndex: pauseContent ? window.getComputedStyle(pauseContent).zIndex : 'not found',
        position: pauseContent ? window.getComputedStyle(pauseContent).position : 'not found'
      }
    };
  });
  
  console.log('🔍 z-index情報:');
  console.log('  マップ画面:');
  console.log('    - z-index:', zIndexInfo.mapScreen.zIndex);
  console.log('    - position:', zIndexInfo.mapScreen.position);
  console.log('  ポーズメニュー:');
  console.log('    - z-index:', zIndexInfo.pauseMenu.zIndex);
  console.log('    - position:', zIndexInfo.pauseMenu.position);
  console.log('    - display:', zIndexInfo.pauseMenu.display);
  console.log('    - visibility:', zIndexInfo.pauseMenu.visibility);
  console.log('    - hidden:', zIndexInfo.pauseMenu.hidden);
  console.log('  ポーズメニューコンテンツ:');
  console.log('    - z-index:', zIndexInfo.pauseContent.zIndex);
  console.log('    - position:', zIndexInfo.pauseContent.position);
  
  // ポーズメニューが表示されているか確認
  const pauseMenuVisible = await page.evaluate(() => {
    const pauseMenu = document.getElementById('story-pause-menu');
    return pauseMenu && !pauseMenu.classList.contains('hidden');
  });
  
  if (pauseMenuVisible) {
    console.log('✅ ポーズメニューが表示されています');
    
    // 再開ボタンをクリックしてテスト
    console.log('🖱️ 再開ボタンをクリックしてテスト');
    try {
      await page.click('#story-pause-resume', { timeout: 5000 });
      console.log('✅ 再開ボタンのクリックが成功しました');
      
      await page.waitForTimeout(1000);
      
      // 再開後の状態を確認
      const afterResumeInfo = await page.evaluate(() => {
        const pauseMenu = document.getElementById('story-pause-menu');
        const mapScreen = document.getElementById('story-map-screen');
        
        return {
          pauseMenuHidden: pauseMenu && pauseMenu.classList.contains('hidden'),
          mapVisible: mapScreen && !mapScreen.classList.contains('hidden')
        };
      });
      
      if (afterResumeInfo.pauseMenuHidden && afterResumeInfo.mapVisible) {
        console.log('✅ 再開機能が正常に動作しました');
        
        // 再開後のスクリーンショット
        await page.screenshot({ path: 'Screenshots/map-zindex-after-resume.png' });
        console.log('📸 再開後のスクリーンショット撮影');
        
        // 再度Escキーを押してセーブ機能をテスト
        console.log('🔄 再度Escキーを押してセーブ機能をテスト');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        console.log('💾 セーブボタンをクリックしてテスト');
        try {
          await page.click('#story-pause-save', { timeout: 5000 });
          console.log('✅ セーブボタンのクリックが成功しました');
          
          await page.waitForTimeout(1000);
          
          // セーブメニューが表示されたか確認
          const saveMenuVisible = await page.evaluate(() => {
            const saveMenu = document.getElementById('save-select-menu');
            return saveMenu && !saveMenu.classList.contains('hidden');
          });
          
          if (saveMenuVisible) {
            console.log('✅ セーブメニューが正常に表示されました');
            
            // セーブメニューのスクリーンショット
            await page.screenshot({ path: 'Screenshots/map-zindex-save-menu.png' });
            console.log('📸 セーブメニューのスクリーンショット撮影');
            
            // セーブメニューを閉じる
            await page.click('#save-select-back', { timeout: 5000 });
            await page.waitForTimeout(1000);
            console.log('✅ セーブメニューを閉じました');
            
            // ポーズメニューを閉じる
            await page.click('#story-pause-resume', { timeout: 5000 });
            await page.waitForTimeout(1000);
            console.log('✅ ポーズメニューを閉じました');
            
          } else {
            console.log('❌ セーブメニューが表示されませんでした');
          }
          
        } catch (error) {
          console.log('❌ セーブボタンのクリックに失敗しました:', error.message);
        }
        
      } else {
        console.log('❌ 再開機能に問題があります');
      }
      
    } catch (error) {
      console.log('❌ 再開ボタンのクリックに失敗しました:', error.message);
    }
    
  } else {
    console.log('❌ ポーズメニューが表示されていません');
  }
  
  console.log('🎉 z-index修正テスト完了');
  
  await browser.close();
})();