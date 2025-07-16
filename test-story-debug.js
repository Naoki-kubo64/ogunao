const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ストーリー戦闘デバッグボタンテスト');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('デバッグ') || msg.text().includes('🔧')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモードボタンをクリック
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  
  // NEW GAMEでストーリーを開始
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 利用可能なノードを検索してクリック
  const clickableNodes = await page.$$eval('[data-node-type]', nodes => {
    return nodes.map(node => ({
      id: node.getAttribute('data-node-id'),
      type: node.getAttribute('data-node-type'),
      available: node.classList.contains('available')
    })).filter(node => node.available);
  });
  
  console.log('利用可能なノード:', clickableNodes);
  
  if (clickableNodes.length > 0) {
    const targetNode = clickableNodes[0];
    console.log('クリック対象ノード:', targetNode.id);
    
    // ノードをクリック
    await page.click(`[data-node-id="${targetNode.id}"]`);
    await page.waitForTimeout(2000);
    
    // 戦闘開始ボタンをクリック
    const battleBtn = await page.$('#start-battle-btn');
    if (battleBtn) {
      await page.click('#start-battle-btn');
      await page.waitForTimeout(3000);
      
      // ストーリー戦闘画面が表示されているかチェック
      const battleScreenVisible = await page.evaluate(() => {
        const screen = document.getElementById('story-battle-screen');
        return screen && !screen.classList.contains('hidden');
      });
      
      console.log('ストーリー戦闘画面表示:', battleScreenVisible);
      
      if (battleScreenVisible) {
        // デバッグボタンをテスト
        console.log('🔧 敵HP0ボタンをクリック');
        await page.click('#debug-enemy-hp-zero');
        await page.waitForTimeout(1000);
        
        // HPを確認
        const hpStatus = await page.evaluate(() => {
          return {
            enemyHP: document.getElementById('story-enemy-hp-text')?.textContent,
            playerHP: document.getElementById('story-player-hp-text')?.textContent
          };
        });
        
        console.log('HP状態:', hpStatus);
        
        await page.screenshot({ path: 'ScreenShots/story-debug-test.png' });
      }
    } else {
      console.log('戦闘開始ボタンが見つかりません');
    }
  } else {
    console.log('利用可能なノードが見つかりません');
  }
  
  await browser.close();
})();