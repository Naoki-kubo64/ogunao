const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 宝箱・ショップ・イベント機能テスト');
  console.log('========================================');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('📦') || msg.text().includes('🏪') || msg.text().includes('🌟') || msg.text().includes('マップノードクリック')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  console.log('1. ストーリーモード開始');
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // マップが表示されているか確認
  const mapVisible = await page.evaluate(() => {
    const mapScreen = document.getElementById('story-map-screen');
    return mapScreen && !mapScreen.classList.contains('hidden');
  });
  
  if (!mapVisible) {
    console.log('❌ マップが表示されていません');
    await browser.close();
    return;
  }
  
  console.log('✅ マップが正常に表示されています');
  
  // 宝箱ノードを探す
  console.log('2. 宝箱ノードを探しています...');
  let treasureFound = false;
  
  for (let attempts = 0; attempts < 10; attempts++) {
    const treasureNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        const text = node.querySelector('text');
        return circle && text && text.textContent === '📦' && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (treasureNodes.length > 0) {
      console.log(`📦 宝箱ノード発見: ${treasureNodes[0]}`);
      await page.click(`[data-node-id="${treasureNodes[0]}"]`);
      await page.waitForTimeout(1000);
      
      // 宝箱ポップアップが表示されるか確認
      const treasurePopupVisible = await page.evaluate(() => {
        const popup = document.getElementById('treasure-popup');
        return popup && !popup.classList.contains('hidden');
      });
      
      if (treasurePopupVisible) {
        console.log('✅ 宝箱ポップアップが表示されました');
        
        // 宝箱の内容を確認
        const treasureContent = await page.evaluate(() => {
          const rewards = document.querySelectorAll('.treasure-reward-item');
          return Array.from(rewards).map(reward => {
            const name = reward.querySelector('.reward-item-name').textContent;
            const amount = reward.querySelector('.reward-item-amount').textContent;
            return `${name}: ${amount}`;
          });
        });
        
        console.log('📦 宝箱の内容:', treasureContent);
        
        // 受け取るボタンをクリック
        await page.click('#treasure-accept');
        await page.waitForTimeout(1000);
        
        console.log('✅ 宝箱の報酬を受け取りました');
        treasureFound = true;
        break;
      }
    }
    
    // 他のノードを試す
    const allNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        return circle && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (allNodes.length > 0) {
      await page.click(`[data-node-id="${allNodes[0]}"]`);
      await page.waitForTimeout(1000);
      
      // 戦闘が開始された場合はスキップ
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
    
    await page.waitForTimeout(500);
  }
  
  if (!treasureFound) {
    console.log('⚠️ 宝箱ノードが見つかりませんでした');
  }
  
  // ショップノードを探す
  console.log('3. ショップノードを探しています...');
  let shopFound = false;
  
  for (let attempts = 0; attempts < 10; attempts++) {
    const shopNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        const text = node.querySelector('text');
        return circle && text && text.textContent === '🏪' && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (shopNodes.length > 0) {
      console.log(`🏪 ショップノード発見: ${shopNodes[0]}`);
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
            const disabled = item.classList.contains('disabled');
            return `${name}: ${price} (購入可能: ${!disabled})`;
          });
        });
        
        console.log('🏪 ショップの商品:', shopItems);
        
        // 最初の購入可能なアイテムを購入
        const firstAvailableItem = await page.$('.shop-item:not(.disabled) .shop-item-buy:not([disabled])');
        if (firstAvailableItem) {
          await firstAvailableItem.click();
          await page.waitForTimeout(1000);
          console.log('✅ アイテムを購入しました');
        } else {
          // 購入できない場合は立ち去る
          await page.click('#shop-leave');
          await page.waitForTimeout(1000);
          console.log('💰 ゴールドが足りないため立ち去りました');
        }
        
        shopFound = true;
        break;
      }
    }
    
    // 他のノードを試す
    const allNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        return circle && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (allNodes.length > 0) {
      await page.click(`[data-node-id="${allNodes[0]}"]`);
      await page.waitForTimeout(1000);
      
      // 戦闘が開始された場合はスキップ
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
    
    await page.waitForTimeout(500);
  }
  
  if (!shopFound) {
    console.log('⚠️ ショップノードが見つかりませんでした');
  }
  
  // イベントノードを探す
  console.log('4. イベントノードを探しています...');
  let eventFound = false;
  
  for (let attempts = 0; attempts < 10; attempts++) {
    const eventNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        const text = node.querySelector('text');
        return circle && text && text.textContent === '🌟' && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (eventNodes.length > 0) {
      console.log(`🌟 イベントノード発見: ${eventNodes[0]}`);
      await page.click(`[data-node-id="${eventNodes[0]}"]`);
      await page.waitForTimeout(1000);
      
      // イベントポップアップが表示されるか確認
      const eventPopupVisible = await page.evaluate(() => {
        const popup = document.getElementById('event-popup');
        return popup && !popup.classList.contains('hidden');
      });
      
      if (eventPopupVisible) {
        console.log('✅ イベントポップアップが表示されました');
        
        // イベントの内容を確認
        const eventContent = await page.evaluate(() => {
          const title = document.getElementById('event-title').textContent;
          const description = document.getElementById('event-description').textContent;
          const effects = document.querySelectorAll('.event-effect-item');
          const effectTexts = Array.from(effects).map(effect => {
            return effect.querySelector('.effect-text').textContent;
          });
          return { title, description, effects: effectTexts };
        });
        
        console.log('🌟 イベント内容:', eventContent);
        
        // OKボタンをクリック
        await page.click('#event-accept');
        await page.waitForTimeout(1000);
        
        console.log('✅ イベントの効果を受け取りました');
        eventFound = true;
        break;
      }
    }
    
    // 他のノードを試す
    const allNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        return circle && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (allNodes.length > 0) {
      await page.click(`[data-node-id="${allNodes[0]}"]`);
      await page.waitForTimeout(1000);
      
      // 戦闘が開始された場合はスキップ
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
    
    await page.waitForTimeout(500);
  }
  
  if (!eventFound) {
    console.log('⚠️ イベントノードが見つかりませんでした');
  }
  
  // 結果をまとめる
  console.log('========================================');
  console.log('📊 テスト結果:');
  console.log('宝箱機能:', treasureFound ? '✅' : '❌');
  console.log('ショップ機能:', shopFound ? '✅' : '❌');
  console.log('イベント機能:', eventFound ? '✅' : '❌');
  
  if (treasureFound && shopFound && eventFound) {
    console.log('🎉 すべての機能が正常に動作しています！');
  } else {
    console.log('⚠️ 一部の機能が見つかりませんでした（マップ生成がランダムのため）');
  }
  
  await page.screenshot({ path: 'ScreenShots/treasure-shop-event-test.png' });
  
  await browser.close();
})();