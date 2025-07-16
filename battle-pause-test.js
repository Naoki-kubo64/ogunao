const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 戦闘中の一時停止メニュー位置テスト');
  
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
  await page.click('[data-node-id="floor_1_node_0"]');
  await page.waitForTimeout(2000);
  
  // 戦闘画面が表示されるまで待つ
  await page.waitForSelector('#story-battle-screen:not(.hidden)', { timeout: 5000 });
  
  console.log('⚔️ 戦闘画面が表示されました');
  
  // 一時停止メニューを開く
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  
  // 一時停止メニューが表示されたか確認
  const pauseMenuVisible = await page.evaluate(() => {
    const menu = document.getElementById('story-pause-menu');
    return menu && !menu.classList.contains('hidden');
  });
  
  if (pauseMenuVisible) {
    console.log('✅ 一時停止メニューが表示されました');
    
    // 一時停止メニューの位置を確認
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
      console.log('📏 一時停止メニューの位置:');
      console.log('  画面中央:', `(${pauseMenuPosition.screen.centerX}, ${pauseMenuPosition.screen.centerY})`);
      console.log('  メニュー中央:', `(${pauseMenuPosition.menu.centerX}, ${pauseMenuPosition.menu.centerY})`);
      
      const xOffset = Math.abs(pauseMenuPosition.screen.centerX - pauseMenuPosition.menu.centerX);
      const yOffset = Math.abs(pauseMenuPosition.screen.centerY - pauseMenuPosition.menu.centerY);
      
      console.log('  X軸のずれ:', xOffset.toFixed(1) + 'px');
      console.log('  Y軸のずれ:', yOffset.toFixed(1) + 'px');
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'Screenshots/pause-menu-battle-position.png' });
      
      if (xOffset < 10 && yOffset < 10) {
        console.log('🎉 一時停止メニューは完璧に中央配置されています！');
      } else {
        console.log('⚠️ 一時停止メニューの調整が必要です');
      }
      
      // セーブボタンをクリック
      console.log('💾 セーブメニューのテスト');
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
        console.log('📏 セーブメニューの位置:');
        console.log('  画面中央:', `(${saveMenuPosition.screen.centerX}, ${saveMenuPosition.screen.centerY})`);
        console.log('  メニュー中央:', `(${saveMenuPosition.menu.centerX}, ${saveMenuPosition.menu.centerY})`);
        
        const xOffset = Math.abs(saveMenuPosition.screen.centerX - saveMenuPosition.menu.centerX);
        const yOffset = Math.abs(saveMenuPosition.screen.centerY - saveMenuPosition.menu.centerY);
        
        console.log('  X軸のずれ:', xOffset.toFixed(1) + 'px');
        console.log('  Y軸のずれ:', yOffset.toFixed(1) + 'px');
        
        // スクリーンショットを撮る
        await page.screenshot({ path: 'Screenshots/save-menu-battle-position.png' });
        
        if (xOffset < 10 && yOffset < 10) {
          console.log('🎉 セーブメニューは完璧に中央配置されています！');
        } else {
          console.log('⚠️ セーブメニューの調整が必要です');
        }
      }
    }
  } else {
    console.log('❌ 一時停止メニューが表示されませんでした');
  }
  
  console.log('🎉 テスト完了');
  
  await browser.close();
})();