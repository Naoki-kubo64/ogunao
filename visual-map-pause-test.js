const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 マップ画面ポーズメニュー視覚的テスト');
  
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
  await page.screenshot({ path: 'Screenshots/map-initial-state.png' });
  console.log('📸 初期状態のスクリーンショット撮影');
  
  // マップ画面が表示されているか確認
  const mapScreenInfo = await page.evaluate(() => {
    const mapScreen = document.getElementById('story-map-screen');
    const battleScreen = document.getElementById('story-battle-screen');
    const pauseMenu = document.getElementById('story-pause-menu');
    
    return {
      mapVisible: mapScreen && !mapScreen.classList.contains('hidden'),
      battleVisible: battleScreen && !battleScreen.classList.contains('hidden'),
      pauseMenuVisible: pauseMenu && !pauseMenu.classList.contains('hidden'),
      mapScreenExists: !!mapScreen,
      pauseMenuExists: !!pauseMenu
    };
  });
  
  console.log('📋 現在の画面状態:');
  console.log('  - マップ画面表示:', mapScreenInfo.mapVisible ? '✅' : '❌');
  console.log('  - 戦闘画面表示:', mapScreenInfo.battleVisible ? '✅' : '❌');
  console.log('  - ポーズメニュー表示:', mapScreenInfo.pauseMenuVisible ? '✅' : '❌');
  console.log('  - マップ画面要素存在:', mapScreenInfo.mapScreenExists ? '✅' : '❌');
  console.log('  - ポーズメニュー要素存在:', mapScreenInfo.pauseMenuExists ? '✅' : '❌');
  
  if (mapScreenInfo.mapVisible) {
    console.log('✅ マップ画面が正常に表示されています');
    
    // Escキーを押下する前の状態を記録
    console.log('⌨️ Escキーを押下します...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000); // 少し長めに待機
    
    // Escキー押下後の状態をスクリーンショット
    await page.screenshot({ path: 'Screenshots/map-after-escape.png' });
    console.log('📸 Escキー押下後のスクリーンショット撮影');
    
    // 詳細な状態を確認
    const afterEscapeInfo = await page.evaluate(() => {
      const mapScreen = document.getElementById('story-map-screen');
      const pauseMenu = document.getElementById('story-pause-menu');
      const saveMenu = document.getElementById('save-select-menu');
      
      // ポーズメニューの詳細情報を取得
      const pauseMenuDetails = {
        exists: !!pauseMenu,
        hidden: pauseMenu ? pauseMenu.classList.contains('hidden') : null,
        display: pauseMenu ? window.getComputedStyle(pauseMenu).display : null,
        visibility: pauseMenu ? window.getComputedStyle(pauseMenu).visibility : null,
        zIndex: pauseMenu ? window.getComputedStyle(pauseMenu).zIndex : null,
        position: pauseMenu ? window.getComputedStyle(pauseMenu).position : null
      };
      
      // ポーズメニューのコンテンツも確認
      const pauseContent = pauseMenu ? pauseMenu.querySelector('.pause-menu-content') : null;
      const pauseContentDetails = pauseContent ? {
        exists: true,
        display: window.getComputedStyle(pauseContent).display,
        visibility: window.getComputedStyle(pauseContent).visibility,
        zIndex: window.getComputedStyle(pauseContent).zIndex
      } : { exists: false };
      
      return {
        mapVisible: mapScreen && !mapScreen.classList.contains('hidden'),
        pauseMenuVisible: pauseMenu && !pauseMenu.classList.contains('hidden'),
        saveMenuVisible: saveMenu && !saveMenu.classList.contains('hidden'),
        pauseMenuDetails: pauseMenuDetails,
        pauseContentDetails: pauseContentDetails,
        // イベントリスナーが設定されているかも確認
        escapeHandlerExists: !!document.querySelector('body').getAttribute('data-escape-handler')
      };
    });
    
    console.log('📋 Escキー押下後の状態:');
    console.log('  - マップ画面表示:', afterEscapeInfo.mapVisible ? '✅' : '❌');
    console.log('  - ポーズメニュー表示:', afterEscapeInfo.pauseMenuVisible ? '✅' : '❌');
    console.log('  - セーブメニュー表示:', afterEscapeInfo.saveMenuVisible ? '✅' : '❌');
    
    console.log('🔍 ポーズメニュー詳細情報:');
    console.log('  - 要素存在:', afterEscapeInfo.pauseMenuDetails.exists ? '✅' : '❌');
    console.log('  - hidden クラス:', afterEscapeInfo.pauseMenuDetails.hidden ? '❌' : '✅');
    console.log('  - display:', afterEscapeInfo.pauseMenuDetails.display);
    console.log('  - visibility:', afterEscapeInfo.pauseMenuDetails.visibility);
    console.log('  - z-index:', afterEscapeInfo.pauseMenuDetails.zIndex);
    console.log('  - position:', afterEscapeInfo.pauseMenuDetails.position);
    
    console.log('🔍 ポーズメニューコンテンツ詳細:');
    console.log('  - コンテンツ要素存在:', afterEscapeInfo.pauseContentDetails.exists ? '✅' : '❌');
    if (afterEscapeInfo.pauseContentDetails.exists) {
      console.log('  - display:', afterEscapeInfo.pauseContentDetails.display);
      console.log('  - visibility:', afterEscapeInfo.pauseContentDetails.visibility);
      console.log('  - z-index:', afterEscapeInfo.pauseContentDetails.zIndex);
    }
    
    if (afterEscapeInfo.pauseMenuVisible) {
      console.log('🎉 ポーズメニューが正常に表示されました！');
      
      // ポーズメニューのボタンが見えるかテスト
      const buttonVisibility = await page.evaluate(() => {
        const resumeBtn = document.getElementById('story-pause-resume');
        const saveBtn = document.getElementById('story-pause-save');
        const settingsBtn = document.getElementById('story-pause-settings');
        const titleBtn = document.getElementById('story-pause-title');
        
        return {
          resume: resumeBtn ? !resumeBtn.classList.contains('hidden') : false,
          save: saveBtn ? !saveBtn.classList.contains('hidden') : false,
          settings: settingsBtn ? !settingsBtn.classList.contains('hidden') : false,
          title: titleBtn ? !titleBtn.classList.contains('hidden') : false
        };
      });
      
      console.log('🔍 ポーズメニューボタンの表示状態:');
      console.log('  - 再開ボタン:', buttonVisibility.resume ? '✅' : '❌');
      console.log('  - セーブボタン:', buttonVisibility.save ? '✅' : '❌');
      console.log('  - 設定ボタン:', buttonVisibility.settings ? '✅' : '❌');
      console.log('  - タイトルボタン:', buttonVisibility.title ? '✅' : '❌');
      
      // 実際にボタンをクリックしてテスト
      console.log('🖱️ 再開ボタンをクリックしてテスト');
      await page.click('#story-pause-resume');
      await page.waitForTimeout(1000);
      
      // 再開後のスクリーンショット
      await page.screenshot({ path: 'Screenshots/map-after-resume.png' });
      console.log('📸 再開後のスクリーンショット撮影');
      
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
      } else {
        console.log('❌ 再開機能に問題があります');
      }
      
    } else {
      console.log('❌ ポーズメニューが表示されませんでした');
      console.log('');
      console.log('🔧 問題の可能性:');
      console.log('  1. z-indexの問題でポーズメニューが背後に隠れている');
      console.log('  2. イベントリスナーが正しく設定されていない');
      console.log('  3. canShowPauseMenu()メソッドがfalseを返している');
      
      // デバッグ用にcanShowPauseMenuの結果を確認
      const canShowPauseResult = await page.evaluate(() => {
        // StoryModeインスタンスにアクセス
        if (window.storyMode && window.storyMode.canShowPauseMenu) {
          return window.storyMode.canShowPauseMenu();
        }
        return 'storyMode instance not found';
      });
      
      console.log('🔍 canShowPauseMenu()の結果:', canShowPauseResult);
    }
  } else {
    console.log('❌ マップ画面が表示されていません');
  }
  
  console.log('🎉 視覚的テスト完了');
  
  await browser.close();
})();