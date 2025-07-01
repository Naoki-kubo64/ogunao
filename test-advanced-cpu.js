const { chromium } = require('playwright');

async function testAdvancedCPU() {
  console.log('🤖 高度CPU AIテスト開始...');
  
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // コンソールログを監視
    const aiLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🤖') || text.includes('🧠') || text.includes('🎯') || 
          text.includes('ビームサーチ') || text.includes('モンテカルロ') ||
          text.includes('GTR') || text.includes('連鎖')) {
        aiLogs.push(text);
        console.log('🤖 AI:', text);
      }
    });
    
    console.log('📄 ゲームページを読み込み...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    
    console.log('⚔️ 対戦モードに移行...');
    await page.click('#battle-mode-button');
    await page.waitForTimeout(2000);
    
    // CPU難易度をハードに設定
    console.log('💪 CPU難易度をハードに設定...');
    const hardOptionExists = await page.evaluate(() => {
      const select = document.getElementById('cpu-level');
      if (select) {
        select.value = 'hard';
        return true;
      }
      return false;
    });
    
    if (hardOptionExists) {
      console.log('✅ CPU難易度: ハード設定完了');
    }
    
    console.log('🔥 対戦開始...');
    await page.click('#battle-start');
    await page.waitForTimeout(3000);
    
    // CPUの思考状況を確認
    const cpuThinking = await page.evaluate(() => {
      if (window.battleInstance) {
        return {
          aiConfigExists: !!window.battleInstance.aiConfig,
          beamWidth: window.battleInstance.aiConfig?.beamWidth,
          searchDepth: window.battleInstance.aiConfig?.searchDepth,
          monteCarloRuns: window.battleInstance.aiConfig?.monteCarloRuns,
          cpuLevel: window.battleInstance.cpuLevel,
          gameRunning: window.battleInstance.gameRunning
        };
      }
      return null;
    });
    
    console.log('🎲 CPU設定状況:', cpuThinking);
    
    // しばらく対戦を観察
    console.log('⏱️ 30秒間対戦を観察...');
    await page.waitForTimeout(30000);
    
    // 最終統計
    const finalStats = await page.evaluate(() => {
      if (window.battleInstance) {
        return {
          playerScore: window.battleInstance.playerScore,
          cpuScore: window.battleInstance.cpuScore,
          gameStillRunning: window.battleInstance.gameRunning
        };
      }
      return null;
    });
    
    console.log('📊 最終結果:', finalStats);
    
    // AIログ分析
    const beamSearchLogs = aiLogs.filter(log => log.includes('ビームサーチ'));
    const monteCarloLogs = aiLogs.filter(log => log.includes('モンテカルロ'));
    const advancedAILogs = aiLogs.filter(log => log.includes('高度AI'));
    
    console.log('\n🧪 AI動作分析:');
    console.log(`✅ 高度AI起動ログ: ${advancedAILogs.length}回`);
    console.log(`🎯 ビームサーチ実行: ${beamSearchLogs.length}回`);
    console.log(`🎲 モンテカルロ評価: ${monteCarloLogs.length}回`);
    
    if (advancedAILogs.length > 0) {
      console.log('✅ 高度AI システムが正常に動作しています');
    } else {
      console.log('⚠️ 高度AI システムのログが検出されませんでした');
    }
    
    await browser.close();
    console.log('🎉 高度CPU AIテスト完了！');
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
  }
}

testAdvancedCPU();