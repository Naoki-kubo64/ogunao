const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 タイトルに戻る機能デバッグテスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // マップ画面でポーズメニューを表示
  console.log('⌨️ マップ画面でEscキーを押下');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  
  // 現在の状態を確認
  const currentState = await page.evaluate(() => {
    const pauseMenu = document.getElementById('story-pause-menu');
    const titleBtn = document.getElementById('story-pause-title');
    const storyScreen = document.getElementById('story-screen');
    const mapScreen = document.getElementById('story-map-screen');
    
    return {
      pauseMenuVisible: pauseMenu && !pauseMenu.classList.contains('hidden'),
      titleBtnExists: !!titleBtn,
      titleBtnVisible: titleBtn && !titleBtn.classList.contains('hidden'),
      storyScreenVisible: storyScreen && !storyScreen.classList.contains('hidden'),
      mapScreenVisible: mapScreen && !mapScreen.classList.contains('hidden'),
      gameModeManager: !!window.gameModeManager
    };
  });
  
  console.log('📋 現在の状態:');
  console.log('  - ポーズメニュー表示:', currentState.pauseMenuVisible ? '✅' : '❌');
  console.log('  - タイトルボタン存在:', currentState.titleBtnExists ? '✅' : '❌');
  console.log('  - タイトルボタン表示:', currentState.titleBtnVisible ? '✅' : '❌');
  console.log('  - ストーリー画面表示:', currentState.storyScreenVisible ? '✅' : '❌');
  console.log('  - マップ画面表示:', currentState.mapScreenVisible ? '✅' : '❌');
  console.log('  - gameModeManager存在:', currentState.gameModeManager ? '✅' : '❌');
  
  if (currentState.pauseMenuVisible && currentState.titleBtnExists) {
    console.log('✅ ポーズメニューとタイトルボタンが確認できました');
    
    // スクリーンショット
    await page.screenshot({ path: 'Screenshots/title-return-before.png' });
    
    // タイトルボタンをクリック
    console.log('🖱️ タイトルボタンをクリック');
    
    // まず直接JavaScriptでクリック
    const clickResult = await page.evaluate(() => {
      const titleBtn = document.getElementById('story-pause-title');
      if (titleBtn) {
        try {
          titleBtn.click();
          return { success: true, message: 'Click executed' };
        } catch (error) {
          return { success: false, message: error.message };
        }
      }
      return { success: false, message: 'Button not found' };
    });
    
    console.log('🔍 クリック結果:', clickResult);
    
    await page.waitForTimeout(2000);
    
    // クリック後の状態を確認
    const afterClickState = await page.evaluate(() => {
      const pauseMenu = document.getElementById('story-pause-menu');
      const storyScreen = document.getElementById('story-screen');
      const mapScreen = document.getElementById('story-map-screen');
      
      return {
        pauseMenuVisible: pauseMenu && !pauseMenu.classList.contains('hidden'),
        storyScreenVisible: storyScreen && !storyScreen.classList.contains('hidden'),
        mapScreenVisible: mapScreen && !mapScreen.classList.contains('hidden'),
        currentBodyClass: document.body.className
      };
    });
    
    console.log('📋 クリック後の状態:');
    console.log('  - ポーズメニュー表示:', afterClickState.pauseMenuVisible ? '✅' : '❌');
    console.log('  - ストーリー画面表示:', afterClickState.storyScreenVisible ? '✅' : '❌');
    console.log('  - マップ画面表示:', afterClickState.mapScreenVisible ? '✅' : '❌');
    console.log('  - bodyクラス:', afterClickState.currentBodyClass);
    
    // スクリーンショット
    await page.screenshot({ path: 'Screenshots/title-return-after.png' });
    
    if (afterClickState.storyScreenVisible && !afterClickState.mapScreenVisible) {
      console.log('✅ タイトルに戻る機能が正常に動作しました');
    } else {
      console.log('❌ タイトルに戻る機能が動作しませんでした');
      
      // デバッグ情報を取得
      const debugInfo = await page.evaluate(() => {
        // gameModeManagerの詳細情報を取得
        const gmm = window.gameModeManager;
        if (gmm) {
          return {
            exists: true,
            currentMode: gmm.currentMode,
            switchToModeExists: typeof gmm.switchToMode === 'function',
            methods: Object.getOwnPropertyNames(gmm)
          };
        }
        return { exists: false };
      });
      
      console.log('🔍 gameModeManagerデバッグ情報:', debugInfo);
      
      // storyModeインスタンスの確認
      const storyModeInfo = await page.evaluate(() => {
        const sm = window.storyMode;
        if (sm) {
          return {
            exists: true,
            returnToTitleExists: typeof sm.returnToTitle === 'function',
            methods: Object.getOwnPropertyNames(sm).filter(prop => typeof sm[prop] === 'function')
          };
        }
        return { exists: false };
      });
      
      console.log('🔍 storyModeインスタンスデバッグ情報:', storyModeInfo);
    }
    
  } else {
    console.log('❌ ポーズメニューまたはタイトルボタンが見つかりません');
  }
  
  console.log('🎉 デバッグテスト完了');
  
  await browser.close();
})();