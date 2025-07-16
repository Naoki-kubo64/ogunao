const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 デバッグボタン表示制御テスト');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('デバッグボタン') || msg.text().includes('ローカル環境') || msg.text().includes('本番環境')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(2000);
  
  // 現在の環境情報を取得
  const environmentInfo = await page.evaluate(() => {
    return {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      href: window.location.href
    };
  });
  
  console.log('🌍 現在の環境情報:');
  console.log('  hostname:', environmentInfo.hostname);
  console.log('  protocol:', environmentInfo.protocol);
  console.log('  href:', environmentInfo.href);
  
  // デバッグボタンの表示状態を確認
  const debugControlsVisible = await page.evaluate(() => {
    const debugControls = document.getElementById('debug-controls');
    if (debugControls) {
      const computedStyle = window.getComputedStyle(debugControls);
      return {
        exists: true,
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity
      };
    }
    return { exists: false };
  });
  
  console.log('🔧 デバッグボタンの状態:');
  console.log('  存在:', debugControlsVisible.exists ? '✅' : '❌');
  if (debugControlsVisible.exists) {
    console.log('  display:', debugControlsVisible.display);
    console.log('  visibility:', debugControlsVisible.visibility);
    console.log('  opacity:', debugControlsVisible.opacity);
  }
  
  // ローカル環境かどうかの判定結果
  const isLocalEnvironment = await page.evaluate(() => {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '' ||
           window.location.protocol === 'file:';
  });
  
  console.log('🏠 ローカル環境判定:', isLocalEnvironment ? '✅ ローカル' : '❌ 本番');
  
  // 期待される表示状態
  const expectedVisible = isLocalEnvironment;
  const actualVisible = debugControlsVisible.exists && debugControlsVisible.display !== 'none';
  
  console.log('📊 結果:');
  console.log('  期待される表示:', expectedVisible ? '表示' : '非表示');
  console.log('  実際の表示:', actualVisible ? '表示' : '非表示');
  console.log('  テスト結果:', (expectedVisible === actualVisible) ? '✅ 成功' : '❌ 失敗');
  
  // ストーリーモードでもテスト
  if (actualVisible) {
    console.log('🎮 ストーリーモードでのデバッグボタンテスト');
    
    await page.click('#story-mode-btn');
    await page.waitForTimeout(500);
    await page.click('#story-new-game');
    await page.waitForTimeout(2000);
    
    // 利用可能なノードをクリック
    const availableNodes = await page.$$eval('[data-node-id]', nodes => {
      return nodes.filter(node => {
        const circle = node.querySelector('circle');
        return circle && circle.getAttribute('stroke') === '#ffd700';
      }).map(node => node.getAttribute('data-node-id'));
    });
    
    if (availableNodes.length > 0) {
      await page.click(`[data-node-id="${availableNodes[0]}"]`);
      await page.waitForTimeout(2000);
      
      // 戦闘画面が表示されたか確認
      const battleVisible = await page.evaluate(() => {
        const screen = document.getElementById('story-battle-screen');
        return screen && !screen.classList.contains('hidden');
      });
      
      if (battleVisible) {
        // 戦闘画面でのデバッグボタン表示確認
        const battleDebugVisible = await page.evaluate(() => {
          const debugControls = document.getElementById('debug-controls');
          if (debugControls) {
            const computedStyle = window.getComputedStyle(debugControls);
            return computedStyle.display !== 'none';
          }
          return false;
        });
        
        console.log('⚔️ 戦闘画面でのデバッグボタン:', battleDebugVisible ? '✅ 表示' : '❌ 非表示');
        
        if (battleDebugVisible) {
          // デバッグボタンをクリックしてテスト
          await page.click('#debug-enemy-hp-zero');
          await page.waitForTimeout(1000);
          console.log('✅ デバッグボタンが正常に動作しました');
        }
      }
    }
  }
  
  await page.screenshot({ path: 'ScreenShots/debug-controls-test.png' });
  
  await browser.close();
})();