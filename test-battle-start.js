const { chromium } = require('playwright');

async function testBattleStart() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 対戦開始ボタンのテスト開始...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('⚔️ 対戦モードに移動...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(2000);
        
        console.log('📸 対戦画面のスクリーンショット...');
        await page.screenshot({ path: 'battle_before_start.png' });
        
        // 対戦開始ボタンをクリック
        console.log('⚡ 対戦開始ボタンをクリック...');
        const battleStartBtn = await page.$('#battle-start');
        if (battleStartBtn) {
            await battleStartBtn.click();
            console.log('✅ 対戦開始ボタンをクリックしました');
            await page.waitForTimeout(3000);
            
            // 対戦開始後の状態確認
            const battleState = await page.evaluate(() => {
                const startBtn = document.getElementById('battle-start');
                const battleScreen = document.getElementById('battle-screen');
                const instructionText = document.querySelector('#battle-screen div[style*="text-align: center"] p');
                
                return {
                    startButtonVisible: startBtn ? getComputedStyle(startBtn).display !== 'none' : false,
                    battleScreenVisible: battleScreen ? getComputedStyle(battleScreen).display !== 'none' : false,
                    instructionText: instructionText ? instructionText.textContent : null,
                    battleGameExists: !!window.gameModeManager.battleGame
                };
            });
            
            console.log('対戦開始後の状態:', battleState);
            
            console.log('📸 対戦開始後のスクリーンショット...');
            await page.screenshot({ path: 'battle_after_start.png' });
            
        } else {
            console.error('❌ 対戦開始ボタンが見つかりません');
        }
        
        console.log('✅ 対戦開始テスト完了');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

testBattleStart().catch(console.error);