const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 シンプルショップテスト');
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 全ノードを確認
  const allNodes = await page.$$eval('[data-node-id]', nodes => {
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
  
  console.log('📋 全ノード情報:');
  allNodes.forEach(node => {
    console.log(`  ${node.id}: ${node.text} (利用可能: ${node.available})`);
  });
  
  // ショップノードを探す
  const shopNodes = allNodes.filter(node => node.text === '🏪');
  console.log('🏪 ショップノード数:', shopNodes.length);
  
  if (shopNodes.length > 0) {
    console.log('✅ ショップノードが存在します');
    
    // 利用可能なショップノードがあれば
    const availableShop = shopNodes.find(node => node.available);
    if (availableShop) {
      console.log('🛒 利用可能なショップノード:', availableShop.id);
      await page.click(`[data-node-id="${availableShop.id}"]`);
      await page.waitForTimeout(1000);
      
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
            return name;
          });
        });
        
        console.log('🛍️ 商品ラインナップ:', shopItems);
        
        // ゴールド袋がないことを確認
        const hasGoldPouch = shopItems.some(item => item.includes('ゴールド'));
        console.log('💰 ゴールド袋の有無:', hasGoldPouch ? '❌ まだある' : '✅ 削除済み');
        
        await page.evaluate(() => {
          document.getElementById('shop-leave').click();
        });
      }
    } else {
      console.log('⚠️ 利用可能なショップノードがありません');
    }
  } else {
    console.log('❌ ショップノードが生成されていません');
  }
  
  await page.screenshot({ path: 'ScreenShots/simple-shop-test.png' });
  
  await browser.close();
})();