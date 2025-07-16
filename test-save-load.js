const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  
  console.log('🔍 セーブ・ロード機能テスト');
  
  // ストーリーモードボタンをクリック
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  
  // NEW GAMEでストーリーを開始
  await page.click('#story-new-game');
  await page.waitForTimeout(1000);
  
  // 右のパスを選択
  await page.click('#path-right');
  await page.waitForTimeout(1000);
  
  // 簡単にローカルストレージに直接セーブデータを作成
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
  
  // タイトルに戻る
  await page.click('#story-back-to-title');
  await page.waitForTimeout(500);
  
  // 再度ストーリーモードへ
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  
  // LOAD GAMEをクリック
  await page.click('#story-load-game');
  await page.waitForTimeout(500);
  
  // セーブスロット1をクリック
  await page.click('.save-slot:first-child');
  await page.waitForTimeout(2000);
  
  // 画面の状態を確認
  const screenStates = await page.evaluate(() => {
    return {
      mapVisible: document.getElementById('story-map-screen') && !document.getElementById('story-map-screen').classList.contains('hidden'),
      pathChoiceVisible: document.getElementById('story-path-choice') && !document.getElementById('story-path-choice').classList.contains('hidden'),
      storyScreenVisible: document.getElementById('story-screen') && !document.getElementById('story-screen').classList.contains('hidden'),
      currentScreen: Array.from(document.querySelectorAll('[id*="story"]:not(.hidden)')).map(el => el.id)
    };
  });
  
  console.log('画面状態:', screenStates);
  
  if (screenStates.mapVisible) {
    console.log('✅ セーブデータ読み込み後、マップが表示されています');
  } else {
    console.log('❌ セーブデータ読み込み後、マップが表示されていません');
    console.log('表示中の画面:', screenStates.currentScreen);
  }
  
  await browser.close();
})();