const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ロード機能直接テスト');
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // 先にテスト用セーブデータを作成
  await page.evaluate(() => {
    const saveData = {
      player: {
        currentHP: 25,
        maxHP: 30,
        attack: 5,
        defense: 2,
        gold: 100,
        potions: {
          red: 1,
          green: 0,
          blue: 0
        }
      },
      currentFloor: 2,
      maxFloor: 15,
      currentMapPosition: { floor: 2, nodeId: 'floor_2_node_1' },
      completedNodes: ['floor_0_node_0', 'floor_1_node_2'],
      availableNodes: ['floor_2_node_0', 'floor_2_node_1', 'floor_2_node_2'],
      mapData: null,
      battleLog: [],
      showingInitialPathChoice: false,
      timestamp: Date.now()
    };
    
    localStorage.setItem('puyoStoryMode_save_0', JSON.stringify(saveData));
    console.log('✅ テスト用セーブデータを作成しました');
  });
  
  // ストーリーモードボタンをクリック
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  
  // LOAD GAMEをクリック
  await page.click('#story-load-game');
  await page.waitForTimeout(500);
  
  // セーブスロット1をクリック
  await page.click('.save-slot:first-child');
  await page.waitForTimeout(3000);
  
  // 結果を確認
  const result = await page.evaluate(() => {
    // 各画面の表示状態をチェック
    const storyMapScreen = document.getElementById('story-map-screen');
    const storyPathChoice = document.getElementById('story-path-choice');
    const storyScreen = document.getElementById('story-screen');
    const titleScreen = document.getElementById('start-screen');
    
    return {
      mapScreen: {
        exists: !!storyMapScreen,
        hidden: storyMapScreen ? storyMapScreen.classList.contains('hidden') : true,
        visible: storyMapScreen ? !storyMapScreen.classList.contains('hidden') : false
      },
      pathChoice: {
        exists: !!storyPathChoice,
        hidden: storyPathChoice ? storyPathChoice.classList.contains('hidden') : true,
        visible: storyPathChoice ? !storyPathChoice.classList.contains('hidden') : false
      },
      storyScreen: {
        exists: !!storyScreen,
        hidden: storyScreen ? storyScreen.classList.contains('hidden') : true,
        visible: storyScreen ? !storyScreen.classList.contains('hidden') : false
      },
      titleScreen: {
        exists: !!titleScreen,
        hidden: titleScreen ? titleScreen.classList.contains('hidden') : true,
        visible: titleScreen ? !titleScreen.classList.contains('hidden') : false
      },
      allVisibleElements: Array.from(document.querySelectorAll(':not(.hidden)')).map(el => el.id || el.className).filter(id => typeof id === 'string' && (id.includes('story') || id.includes('screen')))
    };
  });
  
  console.log('📊 画面表示状態:');
  console.log('マップ画面:', result.mapScreen);
  console.log('パス選択:', result.pathChoice);
  console.log('ストーリー画面:', result.storyScreen);
  console.log('タイトル画面:', result.titleScreen);
  console.log('表示中の要素:', result.allVisibleElements);
  
  if (result.mapScreen.visible) {
    console.log('✅ セーブデータ読み込み後、マップが表示されています');
  } else if (result.pathChoice.visible) {
    console.log('❌ パス選択画面が表示されています（修正が必要）');
  } else {
    console.log('❌ 想定外の画面が表示されています');
  }
  
  await page.screenshot({ path: 'ScreenShots/load-test-result.png' });
  
  await browser.close();
})();