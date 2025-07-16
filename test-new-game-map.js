const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 NEW GAME開始テスト - マップ表示確認');
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモードボタンをクリック
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  
  // NEW GAMEをクリック
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 結果を確認
  const result = await page.evaluate(() => {
    const storyMapScreen = document.getElementById('story-map-screen');
    const storyPathChoice = document.getElementById('story-path-choice');
    const storyScreen = document.getElementById('story-screen');
    
    return {
      mapScreen: {
        exists: !!storyMapScreen,
        visible: storyMapScreen ? !storyMapScreen.classList.contains('hidden') : false
      },
      pathChoice: {
        exists: !!storyPathChoice,
        visible: storyPathChoice ? !storyPathChoice.classList.contains('hidden') : false
      },
      storyScreen: {
        exists: !!storyScreen,
        visible: storyScreen ? !storyScreen.classList.contains('hidden') : false
      }
    };
  });
  
  console.log('📊 NEW GAME後の画面状態:');
  console.log('マップ画面:', result.mapScreen);
  console.log('パス選択:', result.pathChoice);
  console.log('ストーリー画面:', result.storyScreen);
  
  if (result.mapScreen.visible) {
    console.log('✅ NEW GAME後、マップが表示されています');
  } else if (result.pathChoice.visible) {
    console.log('❌ パス選択画面が表示されています（修正が必要）');
  } else if (result.storyScreen.visible) {
    console.log('❌ ストーリー画面が表示されています（修正が必要）');
  } else {
    console.log('❌ 想定外の画面が表示されています');
  }
  
  await page.screenshot({ path: 'ScreenShots/new-game-map-test.png' });
  
  await browser.close();
})();