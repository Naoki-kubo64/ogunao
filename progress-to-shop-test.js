const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ショップまで進行テスト');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('🏪') || msg.text().includes('購入') || msg.text().includes('マップノードクリック')) {
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
  
  // 3フロアまで進む（ショップはfloor_3_node_0にある）
  for (let floor = 1; floor <= 3; floor++) {
    console.log(`🏃 フロア${floor}を進行中...`);
    
    // 利用可能なノードを取得
    const availableNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        return circle && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (availableNodes.length > 0) {
      console.log(`利用可能なノード: ${availableNodes[0]}`);
      await page.click(`[data-node-id="${availableNodes[0]}"]`);
      await page.waitForTimeout(1000);
      
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
    }
    
    await page.waitForTimeout(1000);
  }
  
  // ショップノードが利用可能になったか確認
  const shopNodeAvailable = await page.evaluate(() => {
    const shopNode = document.querySelector('[data-node-id="floor_3_node_0"]');
    if (shopNode) {
      const circle = shopNode.querySelector('circle');
      return circle && circle.getAttribute('stroke') === '#ffd700';
    }
    return false;
  });
  
  console.log('🏪 ショップノードの利用可能状況:', shopNodeAvailable ? '✅ 利用可能' : '❌ 利用不可');
  
  if (shopNodeAvailable) {
    console.log('🛒 ショップにアクセス中...');
    await page.click('[data-node-id="floor_3_node_0"]');
    await page.waitForTimeout(2000);
    
    // ショップポップアップが表示されるか確認
    const shopPopupVisible = await page.evaluate(() => {
      const popup = document.getElementById('shop-popup');
      return popup && !popup.classList.contains('hidden');
    });
    
    if (shopPopupVisible) {
      console.log('✅ ショップポップアップが表示されました');
      
      // 商品を確認
      const shopItems = await page.evaluate(() => {
        const items = document.querySelectorAll('.shop-item');
        return Array.from(items).map(item => {
          const name = item.querySelector('.shop-item-name').textContent;
          const price = item.querySelector('.shop-item-price').textContent;
          const description = item.querySelector('.shop-item-description').textContent;
          return { name, price, description };
        });
      });
      
      console.log('🛍️ 修正後のショップ商品:');
      shopItems.forEach(item => {
        console.log(`  - ${item.name}: ${item.price}`);
        console.log(`    ${item.description}`);
      });
      
      // ゴールド袋がないことを確認
      const hasGoldPouch = shopItems.some(item => item.name.includes('ゴールド'));
      console.log('💰 ゴールド袋の確認:', hasGoldPouch ? '❌ まだある' : '✅ 削除済み');
      
      // 新しいアイテムの確認
      const newItems = {
        speed: shopItems.some(item => item.name.includes('速度')),
        luck: shopItems.some(item => item.name.includes('幸運')),
        mega: shopItems.some(item => item.name.includes('特大'))
      };
      
      console.log('🆕 新しいアイテム確認:');
      console.log(`  速度ポーション: ${newItems.speed ? '✅' : '❌'}`);
      console.log(`  幸運のお守り: ${newItems.luck ? '✅' : '❌'}`);
      console.log(`  特大回復ポーション: ${newItems.mega ? '✅' : '❌'}`);
      
      await page.evaluate(() => {
        document.getElementById('shop-leave').click();
      });
      
      await page.waitForTimeout(1000);
      console.log('🎉 ショップ修正テスト完了');
    } else {
      console.log('❌ ショップポップアップが表示されませんでした');
    }
  } else {
    console.log('❌ ショップノードまで到達できませんでした');
  }
  
  await page.screenshot({ path: 'ScreenShots/progress-to-shop-test.png' });
  
  await browser.close();
})();