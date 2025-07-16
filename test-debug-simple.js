const puppeteer = require('playwright');

(async () => {
  const browser = await puppeteer.chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🎯 デバッグボタン表示テスト');
  
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(1000);
  
  // ページのHTMLからデバッグボタンの存在を確認
  const debugButtonsInHTML = await page.evaluate(() => {
    const enemyBtn = document.getElementById('debug-enemy-hp-zero');
    const playerBtn = document.getElementById('debug-player-hp-zero');
    
    return {
      enemyBtn: {
        exists: !!enemyBtn,
        text: enemyBtn ? enemyBtn.textContent : null,
        styles: enemyBtn ? window.getComputedStyle(enemyBtn).display : null
      },
      playerBtn: {
        exists: !!playerBtn,
        text: playerBtn ? playerBtn.textContent : null,
        styles: playerBtn ? window.getComputedStyle(playerBtn).display : null
      },
      battleScreen: {
        exists: !!document.getElementById('story-battle-screen'),
        visible: document.getElementById('story-battle-screen') ? !document.getElementById('story-battle-screen').classList.contains('hidden') : false
      }
    };
  });
  
  console.log('📊 デバッグボタン状態:');
  console.log('敵HP0ボタン:', debugButtonsInHTML.enemyBtn);
  console.log('自分HP0ボタン:', debugButtonsInHTML.playerBtn);
  console.log('戦闘画面:', debugButtonsInHTML.battleScreen);
  
  if (debugButtonsInHTML.enemyBtn.exists && debugButtonsInHTML.playerBtn.exists) {
    console.log('✅ デバッグボタンがHTMLに追加されています');
  } else {
    console.log('❌ デバッグボタンがHTMLに見つかりません');
  }
  
  await page.screenshot({ path: 'ScreenShots/debug-buttons-check.png' });
  
  await browser.close();
})();