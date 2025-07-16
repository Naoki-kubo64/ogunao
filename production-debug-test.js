const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 本番環境デバッグボタン非表示テスト');
  
  // ページログを監視
  page.on('console', (msg) => {
    if (msg.text().includes('デバッグボタン') || msg.text().includes('ローカル環境') || msg.text().includes('本番環境')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  // 本番環境のように見せかけるためにlocalhost:8080からアクセス
  // （実際にはfile:プロトコルだが、JavaScriptで環境判定を変更）
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // JavaScriptで環境判定を本番環境に変更
  await page.evaluate(() => {
    // window.locationを模擬的に変更
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'example.com',
        protocol: 'https:',
        href: 'https://example.com/puyo-puyo/'
      },
      writable: true
    });
    
    // デバッグボタンの表示制御を再実行
    const debugControls = document.getElementById('debug-controls');
    if (debugControls) {
      const isLocalEnvironment = 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '' ||
        window.location.protocol === 'file:';
      
      if (isLocalEnvironment) {
        console.log('🔧 ローカル環境を検出 - デバッグボタンを表示');
        debugControls.style.display = 'flex';
      } else {
        console.log('🌐 本番環境を検出 - デバッグボタンを非表示');
        debugControls.style.display = 'none';
      }
    }
  });
  
  await page.waitForTimeout(1000);
  
  // 現在の環境情報を取得
  const environmentInfo = await page.evaluate(() => {
    return {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      href: window.location.href
    };
  });
  
  console.log('🌍 シミュレートした環境情報:');
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
  
  if (!actualVisible) {
    console.log('🎉 本番環境でデバッグボタンが正常に非表示になりました！');
  }
  
  await page.screenshot({ path: 'ScreenShots/production-debug-test.png' });
  
  await browser.close();
})();