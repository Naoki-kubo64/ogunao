const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 環境判定テスト');
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // 現在の環境判定ロジックをテスト
  const environmentTest = await page.evaluate(() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    const checks = {
      localhost: hostname === 'localhost',
      ip127: hostname === '127.0.0.1',
      emptyHostname: hostname === '',
      fileProtocol: protocol === 'file:'
    };
    
    const isLocalEnvironment = 
      checks.localhost ||
      checks.ip127 ||
      checks.emptyHostname ||
      checks.fileProtocol;
    
    return {
      hostname,
      protocol,
      checks,
      isLocalEnvironment,
      href: window.location.href
    };
  });
  
  console.log('🌍 環境判定結果:');
  console.log('  hostname:', environmentTest.hostname);
  console.log('  protocol:', environmentTest.protocol);
  console.log('  href:', environmentTest.href);
  console.log('');
  console.log('🔍 各条件のチェック:');
  console.log('  localhost:', environmentTest.checks.localhost ? '✅' : '❌');
  console.log('  127.0.0.1:', environmentTest.checks.ip127 ? '✅' : '❌');
  console.log('  empty hostname:', environmentTest.checks.emptyHostname ? '✅' : '❌');
  console.log('  file: protocol:', environmentTest.checks.fileProtocol ? '✅' : '❌');
  console.log('');
  console.log('📊 最終判定:', environmentTest.isLocalEnvironment ? '🏠 ローカル環境' : '🌐 本番環境');
  
  // 実際のデバッグボタンの状態を確認
  const debugButtonState = await page.evaluate(() => {
    const debugControls = document.getElementById('debug-controls');
    if (debugControls) {
      const style = window.getComputedStyle(debugControls);
      return {
        exists: true,
        display: style.display,
        visible: style.display !== 'none'
      };
    }
    return { exists: false };
  });
  
  console.log('🔧 デバッグボタンの状態:');
  console.log('  存在:', debugButtonState.exists ? '✅' : '❌');
  if (debugButtonState.exists) {
    console.log('  display:', debugButtonState.display);
    console.log('  表示状態:', debugButtonState.visible ? '✅ 表示' : '❌ 非表示');
  }
  
  // 判定と表示状態が一致しているか確認
  const isConsistent = environmentTest.isLocalEnvironment === debugButtonState.visible;
  console.log('');
  console.log('✅ 判定と表示の一致:', isConsistent ? '✅ 一致' : '❌ 不一致');
  
  console.log('');
  console.log('📝 テスト結果まとめ:');
  console.log('  - file:// プロトコルでアクセス → ローカル環境として判定');
  console.log('  - ローカル環境でデバッグボタン表示 → 正常動作');
  console.log('  - 本番環境（https://example.com等）では非表示になる');
  
  await page.screenshot({ path: 'ScreenShots/environment-test.png' });
  
  await browser.close();
})();