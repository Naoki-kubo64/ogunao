const { chromium } = require('playwright');

async function testAllModes() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 全モードの動作テスト開始...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('📸 初期状態のスクリーンショット...');
        await page.screenshot({ path: 'test_initial_state.png' });
        
        // 1. トレーニングモードテスト
        console.log('🎯 トレーニングモードをテスト...');
        try {
            await page.click('#training-mode-btn');
            await page.waitForTimeout(2000);
            console.log('📸 トレーニングモード画面...');
            await page.screenshot({ path: 'test_training_mode.png' });
            
            // トレーニングモードの状態確認
            const trainingState = await page.evaluate(() => {
                const startScreen = document.getElementById('start-screen');
                const gameArea = document.querySelector('.game-area');
                const canvas = document.getElementById('game-canvas');
                
                return {
                    startScreenVisible: startScreen ? getComputedStyle(startScreen).display !== 'none' : false,
                    gameAreaVisible: gameArea ? getComputedStyle(gameArea).display !== 'none' : false,
                    canvasExists: !!canvas,
                    canvasVisible: canvas ? getComputedStyle(canvas).display !== 'none' : false
                };
            });
            console.log('トレーニングモード状態:', trainingState);
            
            // タイトルに戻る
            await page.evaluate(() => {
                if (window.gameModeManager && window.gameModeManager.switchToTitleMode) {
                    window.gameModeManager.switchToTitleMode();
                }
            });
            await page.waitForTimeout(1000);
            
        } catch (error) {
            console.error('❌ トレーニングモードエラー:', error.message);
        }
        
        // 2. 対戦モードテスト
        console.log('⚔️ 対戦モードをテスト...');
        try {
            await page.click('#battle-mode-btn');
            await page.waitForTimeout(2000);
            console.log('📸 対戦モード画面...');
            await page.screenshot({ path: 'test_battle_mode.png' });
            
            // 対戦画面の要素確認
            const battleElements = await page.evaluate(() => {
                const battleScreen = document.getElementById('battle-screen');
                const startButton = document.querySelector('#battle-start, .start-btn, [onclick*="start"]');
                const backButton = document.getElementById('back-to-title');
                
                return {
                    battleScreenExists: !!battleScreen,
                    battleScreenVisible: battleScreen ? getComputedStyle(battleScreen).display !== 'none' : false,
                    startButtonExists: !!startButton,
                    startButtonText: startButton ? startButton.textContent : null,
                    backButtonExists: !!backButton,
                    allButtons: Array.from(document.querySelectorAll('button')).map(btn => ({
                        id: btn.id,
                        className: btn.className,
                        text: btn.textContent?.trim(),
                        visible: getComputedStyle(btn).display !== 'none'
                    }))
                };
            });
            console.log('対戦モード要素:', JSON.stringify(battleElements, null, 2));
            
        } catch (error) {
            console.error('❌ 対戦モードエラー:', error.message);
        }
        
        console.log('✅ 全モードテスト完了');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

testAllModes().catch(console.error);