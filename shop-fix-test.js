const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ショップ商品修正テスト');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('🏪') || msg.text().includes('購入')) {
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
  
  // いくつかの戦闘を行ってゴールドを稼ぐ
  for (let i = 0; i < 3; i++) {
    const battleNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        const text = node.querySelector('text');
        return circle && text && (text.textContent === '⚔️' || text.textContent === '🛡️') && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (battleNodes.length > 0) {
      await page.click(`[data-node-id="${battleNodes[0]}"]`);
      await page.waitForTimeout(1000);
      
      // 戦闘画面が表示されたら敵HPを0にして勝利
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
  }
  
  // ショップノードを探す
  const shopNodes = await page.$$eval('[data-node-id]', nodes => {
    return nodes.filter(node => {
      const circle = node.querySelector('circle');
      const text = node.querySelector('text');
      return circle && text && text.textContent === '🏪' && circle.getAttribute('stroke') === '#ffd700';
    }).map(node => node.getAttribute('data-node-id'));
  });
  
  if (shopNodes.length > 0) {
    console.log('🏪 ショップノード発見:', shopNodes[0]);
    await page.click(`[data-node-id="${shopNodes[0]}"]`);
    await page.waitForTimeout(1000);
    
    // ショップポップアップが表示されるか確認
    const shopPopupVisible = await page.evaluate(() => {
      const popup = document.getElementById('shop-popup');
      return popup && !popup.classList.contains('hidden');
    });
    
    if (shopPopupVisible) {
      console.log('✅ ショップポップアップが表示されました');
      
      // ショップの商品を確認
      const shopItems = await page.evaluate(() => {
        const items = document.querySelectorAll('.shop-item');
        return Array.from(items).map(item => {
          const name = item.querySelector('.shop-item-name').textContent;
          const price = item.querySelector('.shop-item-price').textContent;
          const description = item.querySelector('.shop-item-description').textContent;
          return { name, price, description };
        });
      });
      
      console.log('🏪 修正後のショップ商品:');
      shopItems.forEach(item => {
        console.log(`  - ${item.name}: ${item.price} (${item.description})`);
      });
      
      // ゴールド袋がないことを確認
      const hasGoldPouch = shopItems.some(item => item.name.includes('ゴールド'));
      if (hasGoldPouch) {
        console.log('❌ まだゴールド袋が残っています');
      } else {
        console.log('✅ ゴールド袋が削除されました');
      }
      
      // 新しいアイテムがあることを確認
      const hasSpeedPotion = shopItems.some(item => item.name.includes('速度'));
      const hasLuckyCharm = shopItems.some(item => item.name.includes('幸運'));
      const hasMegaHeal = shopItems.some(item => item.name.includes('特大'));
      
      console.log('🆕 新しいアイテム:');
      console.log('  速度ポーション:', hasSpeedPotion ? '✅' : '❌');
      console.log('  幸運のお守り:', hasLuckyCharm ? '✅' : '❌');
      console.log('  特大回復ポーション:', hasMegaHeal ? '✅' : '❌');
      
      // 立ち去る
      await page.evaluate(() => {
        document.getElementById('shop-leave').click();
      });
    } else {
      console.log('❌ ショップポップアップが表示されませんでした');
    }
  } else {
    console.log('⚠️ ショップノードが見つかりませんでした');
  }
  
  await page.screenshot({ path: 'ScreenShots/shop-fix-test.png' });
  
  await browser.close();
})();