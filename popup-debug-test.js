const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ポップアップデバッグテスト');
  
  // ページログを監視
  page.on('console', (msg) => {
    console.log('PAGE LOG:', msg.text());
  });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 全ノードの状態を確認
  const allNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.map(node => {
      const text = node.querySelector('text');
      const circle = node.querySelector('circle');
      return {
        id: node.getAttribute('data-node-id'),
        text: text ? text.textContent : 'no text',
        strokeColor: circle ? circle.getAttribute('stroke') : 'no circle',
        available: circle ? circle.getAttribute('stroke') === '#ffd700' : false
      };
    });
  });
  
  console.log('📋 全ノード状態:');
  allNodes.forEach(node => {
    if (node.text === '📦' || node.available) {
      console.log(`  ${node.id}: ${node.text} (stroke: ${node.strokeColor}, available: ${node.available})`);
    }
  });
  
  // 利用可能な宝箱ノードを探す
  const availableTreasure = allNodes.find(node => node.text === '📦' && node.available);
  
  if (availableTreasure) {
    console.log('📦 利用可能な宝箱ノード:', availableTreasure.id);
    await page.click(`[data-node-id="${availableTreasure.id}"]`);
    await page.waitForTimeout(3000);
    
    // ポップアップの状態を詳細に確認
    const popupStatus = await page.evaluate(() => {
      const popup = document.getElementById('treasure-popup');
      const mapScreen = document.getElementById('story-map-screen');
      const battleScreen = document.getElementById('story-battle-screen');
      
      return {
        popup: {
          exists: !!popup,
          hidden: popup ? popup.classList.contains('hidden') : 'not found',
          display: popup ? window.getComputedStyle(popup).display : 'not found',
          zIndex: popup ? window.getComputedStyle(popup).zIndex : 'not found'
        },
        mapScreen: {
          exists: !!mapScreen,
          hidden: mapScreen ? mapScreen.classList.contains('hidden') : 'not found'
        },
        battleScreen: {
          exists: !!battleScreen,
          hidden: battleScreen ? battleScreen.classList.contains('hidden') : 'not found'
        }
      };
    });
    
    console.log('🔍 ポップアップ状態:');
    console.log('  popup:', popupStatus.popup);
    console.log('  mapScreen:', popupStatus.mapScreen);
    console.log('  battleScreen:', popupStatus.battleScreen);
    
  } else {
    console.log('⚠️ 利用可能な宝箱ノードが見つかりません');
    
    // 利用可能な他のノードで進行
    const availableNodes = allNodes.filter(node => node.available);
    if (availableNodes.length > 0) {
      console.log('🏃 他のノードで進行:', availableNodes[0].id);
      await page.click(`[data-node-id="${availableNodes[0].id}"]`);
      await page.waitForTimeout(2000);
      
      // 戦闘画面が表示されたら即座に勝利
      const battleVisible = await page.evaluate(() => {
        const screen = document.getElementById('story-battle-screen');
        return screen && !screen.classList.contains('hidden');
      });
      
      if (battleVisible) {
        console.log('⚔️ 戦闘開始 - 即座に勝利');
        await page.click('#debug-enemy-hp-zero');
        await page.waitForTimeout(2000);
        await page.click('#reward-special-puyo');
        await page.waitForTimeout(2000);
      }
      
      // 再度宝箱ノードを探す
      const newNodes = await page.$$eval('[data-node-id]', nodes => {
        return nodes.map(node => {
          const text = node.querySelector('text');
          const circle = node.querySelector('circle');
          return {
            id: node.getAttribute('data-node-id'),
            text: text ? text.textContent : 'no text',
            available: circle ? circle.getAttribute('stroke') === '#ffd700' : false
          };
        });
      });
      
      const newAvailableTreasure = newNodes.find(node => node.text === '📦' && node.available);
      
      if (newAvailableTreasure) {
        console.log('📦 新しい宝箱ノード:', newAvailableTreasure.id);
        await page.click(`[data-node-id="${newAvailableTreasure.id}"]`);
        await page.waitForTimeout(3000);
        
        const finalPopupStatus = await page.evaluate(() => {
          const popup = document.getElementById('treasure-popup');
          return {
            exists: !!popup,
            hidden: popup ? popup.classList.contains('hidden') : 'not found',
            display: popup ? window.getComputedStyle(popup).display : 'not found'
          };
        });
        
        console.log('🔍 最終ポップアップ状態:', finalPopupStatus);
      }
    }
  }
  
  await page.screenshot({ path: 'ScreenShots/popup-debug-test.png' });
  
  await browser.close();
})();