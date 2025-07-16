const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 戦闘画面 vs マップ画面ポーズメニュー比較テスト');
  
  // 画面サイズを設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ストーリーモード開始
  await page.click('#story-mode-btn');
  await page.waitForTimeout(500);
  await page.click('#story-new-game');
  await page.waitForTimeout(2000);
  
  // 1. マップ画面でのポーズメニューテスト
  console.log('🗺️ マップ画面でのポーズメニューテスト');
  
  const mapScreenVisible = await page.evaluate(() => {
    const mapScreen = document.getElementById('story-map-screen');
    return mapScreen && !mapScreen.classList.contains('hidden');
  });
  
  if (mapScreenVisible) {
    console.log('✅ マップ画面が表示されました');
    
    // マップ画面でEscキーを押下
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    const pauseMenuVisible = await page.evaluate(() => {
      const pauseMenu = document.getElementById('story-pause-menu');
      return pauseMenu && !pauseMenu.classList.contains('hidden');
    });
    
    if (pauseMenuVisible) {
      console.log('✅ マップ画面でポーズメニューが表示されました');
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'Screenshots/map-pause-comparison.png' });
      
      // ポーズメニューを閉じる
      await page.evaluate(() => {
        const resumeBtn = document.getElementById('story-pause-resume');
        if (resumeBtn) {
          resumeBtn.click();
        }
      });
      
      await page.waitForTimeout(1000);
    } else {
      console.log('❌ マップ画面でポーズメニューが表示されませんでした');
    }
  }
  
  // 2. 戦闘画面に移行してポーズメニューテスト
  console.log('⚔️ 戦闘画面でのポーズメニューテスト');
  
  // 最初のノードをクリックして戦闘開始
  await page.click('[data-node-id="floor_1_node_0"]');
  await page.waitForTimeout(2000);
  
  // 戦闘画面が表示されるまで待つ
  const battleScreenVisible = await page.evaluate(() => {
    const battleScreen = document.getElementById('story-battle-screen');
    return battleScreen && !battleScreen.classList.contains('hidden');
  });
  
  if (battleScreenVisible) {
    console.log('✅ 戦闘画面が表示されました');
    
    // 戦闘画面でEscキーを押下
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    const pauseMenuVisible = await page.evaluate(() => {
      const pauseMenu = document.getElementById('story-pause-menu');
      return pauseMenu && !pauseMenu.classList.contains('hidden');
    });
    
    if (pauseMenuVisible) {
      console.log('✅ 戦闘画面でポーズメニューが表示されました');
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'Screenshots/battle-pause-comparison.png' });
      
      // セーブボタンをクリック（JavaScriptで直接）
      console.log('💾 戦闘画面でセーブボタンをテスト');
      await page.evaluate(() => {
        const saveBtn = document.getElementById('story-pause-save');
        if (saveBtn) {
          saveBtn.click();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const saveMenuVisible = await page.evaluate(() => {
        const saveMenu = document.getElementById('save-select-menu');
        return saveMenu && !saveMenu.classList.contains('hidden');
      });
      
      if (saveMenuVisible) {
        console.log('✅ 戦闘画面でセーブメニューが表示されました');
        
        // セーブメニューを閉じる
        await page.evaluate(() => {
          const backBtn = document.getElementById('save-select-back');
          if (backBtn) {
            backBtn.click();
          }
        });
        
        await page.waitForTimeout(1000);
      } else {
        console.log('❌ 戦闘画面でセーブメニューが表示されませんでした');
      }
      
      // ポーズメニューを閉じる
      await page.evaluate(() => {
        const resumeBtn = document.getElementById('story-pause-resume');
        if (resumeBtn) {
          resumeBtn.click();
        }
      });
      
      await page.waitForTimeout(1000);
    } else {
      console.log('❌ 戦闘画面でポーズメニューが表示されませんでした');
    }
  }
  
  // 3. 戦闘を終了してマップに戻る
  console.log('🏆 戦闘を終了してマップに戻る');
  
  // 敵のHPを0にして勝利
  await page.evaluate(() => {
    const debugBtn = document.getElementById('debug-enemy-hp-zero');
    if (debugBtn) {
      debugBtn.click();
    }
  });
  
  await page.waitForTimeout(2000);
  
  // 勝利画面で報酬を選択
  await page.evaluate(() => {
    const rewardBtn = document.getElementById('reward-special-puyo');
    if (rewardBtn) {
      rewardBtn.click();
    }
  });
  
  await page.waitForTimeout(2000);
  
  // 4. マップに戻ってから再度ポーズメニューテスト
  console.log('🗺️ マップに戻ってから再度ポーズメニューテスト');
  
  const mapScreenBackVisible = await page.evaluate(() => {
    const mapScreen = document.getElementById('story-map-screen');
    return mapScreen && !mapScreen.classList.contains('hidden');
  });
  
  if (mapScreenBackVisible) {
    console.log('✅ マップ画面に戻りました');
    
    // マップ画面で再度Escキーを押下
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    const pauseMenuVisible = await page.evaluate(() => {
      const pauseMenu = document.getElementById('story-pause-menu');
      return pauseMenu && !pauseMenu.classList.contains('hidden');
    });
    
    if (pauseMenuVisible) {
      console.log('✅ マップ画面で再度ポーズメニューが表示されました');
      
      // スクリーンショットを撮る
      await page.screenshot({ path: 'Screenshots/map-pause-after-battle.png' });
      
      // セーブボタンをテスト（JavaScriptで直接）
      console.log('💾 マップ画面でセーブボタンをテスト');
      await page.evaluate(() => {
        const saveBtn = document.getElementById('story-pause-save');
        if (saveBtn) {
          saveBtn.click();
        }
      });
      
      await page.waitForTimeout(1000);
      
      const saveMenuVisible = await page.evaluate(() => {
        const saveMenu = document.getElementById('save-select-menu');
        return saveMenu && !saveMenu.classList.contains('hidden');
      });
      
      if (saveMenuVisible) {
        console.log('✅ マップ画面でセーブメニューが表示されました');
        
        // セーブメニューを閉じる
        await page.evaluate(() => {
          const backBtn = document.getElementById('save-select-back');
          if (backBtn) {
            backBtn.click();
          }
        });
        
        await page.waitForTimeout(1000);
      } else {
        console.log('❌ マップ画面でセーブメニューが表示されませんでした');
      }
    } else {
      console.log('❌ マップ画面で再度ポーズメニューが表示されませんでした');
    }
  }
  
  console.log('🎉 比較テスト完了');
  
  await browser.close();
})();