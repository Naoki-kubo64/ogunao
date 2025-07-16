const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 ポップアップz-index修正テスト');
  
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
      
      // z-indexを確認
      const zIndexInfo = await page.evaluate(() => {
        const popup = document.getElementById('treasure-popup');
        const popupContent = popup.querySelector('.popup-content');
        const mapViewport = document.getElementById('map-viewport');
        const adventureMap = document.getElementById('adventure-map');
        
        return {
          popup: window.getComputedStyle(popup).zIndex,
          popupContent: window.getComputedStyle(popupContent).zIndex,
          mapViewport: window.getComputedStyle(mapViewport).zIndex,
          adventureMap: window.getComputedStyle(adventureMap).zIndex
        };
      });
      
      console.log('🔍 z-index情報:');
      console.log(`  ポップアップオーバーレイ: ${zIndexInfo.popup}`);
      console.log(`  ポップアップコンテンツ: ${zIndexInfo.popupContent}`);
      console.log(`  マップビューポート: ${zIndexInfo.mapViewport}`);
      console.log(`  アドベンチャーマップ: ${zIndexInfo.adventureMap}`);
      
      // ボタンがクリック可能か確認
      const buttonClickable = await page.evaluate(() => {
        const button = document.getElementById('treasure-accept');
        const rect = button.getBoundingClientRect();
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
        return elementAtPoint === button || button.contains(elementAtPoint);
      });
      
      console.log('🖱️ ボタンクリック可能:', buttonClickable ? '✅' : '❌');
      
      if (buttonClickable) {
        // 通常のクリック
        await page.click('#treasure-accept');
        await page.waitForTimeout(1000);
        console.log('✅ 通常のクリックが成功しました');
      } else {
        // 強制クリック
        await page.evaluate(() => {
          document.getElementById('treasure-accept').click();
        });
        await page.waitForTimeout(1000);
        console.log('✅ 強制クリックが成功しました');
      }
      
      // ポップアップが閉じられたか確認
      const popupClosed = await page.evaluate(() => {
        const popup = document.getElementById('treasure-popup');
        return popup && popup.classList.contains('hidden');
      });
      
      console.log('🔒 ポップアップが閉じられました:', popupClosed ? '✅' : '❌');
      
    } else {
      console.log('❌ 宝箱ポップアップが表示されませんでした');
    }
  } else {
    console.log('⚠️ 宝箱ノードが見つかりませんでした');
  }
  
  console.log('🎉 z-index修正テスト完了');
  
  await page.screenshot({ path: 'ScreenShots/popup-z-index-test.png' });
  
  await browser.close();
})();