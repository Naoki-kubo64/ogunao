const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ポップアップ機能クイックテスト');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('📦') || msg.text().includes('🏪') || msg.text().includes('🌟')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 宝箱ノードを探す
  const treasureNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const text = node.querySelector('text');
      return text && text.textContent === '📦';
    }).map(node => node.getAttribute('data-node-id'));
  });
  
  if (treasureNodes.length > 0) {
    console.log('📦 宝箱ノード発見:', treasureNodes[0]);
    await page.click(`[data-node-id="${treasureNodes[0]}"]`);
    await page.waitForTimeout(2000);
    
    // ポップアップが表示されているか確認
    const popupVisible = await page.evaluate(() => {
      const popup = document.getElementById('treasure-popup');
      return popup && !popup.classList.contains('hidden');
    });
    
    if (popupVisible) {
      console.log('✅ 宝箱ポップアップが表示されました');
      
      // 強制的に受け取るボタンをクリック
      await page.evaluate(() => {
        document.getElementById('treasure-accept').click();
      });
      
      await page.waitForTimeout(1000);
      console.log('✅ 宝箱の報酬を受け取りました');
    }
  }
  
  // 次のノードを探す
  const nextNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const circle = node.querySelector('circle');
      return circle && circle.getAttribute('stroke') === '#ffd700';
    }).map(node => node.getAttribute('data-node-id'));
  });
  
  if (nextNodes.length > 0) {
    await page.click(`[data-node-id="${nextNodes[0]}"]`);
    await page.waitForTimeout(1000);
    
    // 戦闘が開始された場合
    const battleVisible = await page.evaluate(() => {
      const screen = document.getElementById('story-battle-screen');
      return screen && !screen.classList.contains('hidden');
    });
    
    if (battleVisible) {
      await page.click('#debug-enemy-hp-zero');
      await page.waitForTimeout(1000);
      await page.click('#reward-special-puyo');
      await page.waitForTimeout(1000);
    }
  }
  
  console.log('🎉 テスト完了');
  
  await page.screenshot({ path: 'ScreenShots/quick-popup-test.png' });
  
  await browser.close();
})();