const { chromium } = require('playwright');

async function realTest() {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 実際の動作確認開始...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        await page.waitForTimeout(3000);
        
        console.log('📸 初期画面');
        await page.screenshot({ path: 'real_test_1_initial.png' });
        
        // 1. トレーニングモードテスト
        console.log('🎯 トレーニングモードをクリック...');
        await page.click('#training-mode-btn');
        await page.waitForTimeout(3000);
        
        console.log('📸 トレーニングモード画面');
        await page.screenshot({ path: 'real_test_2_training.png' });
        
        // ゲームが実際に動くかテスト
        console.log('⌨️ Enterキーでゲーム開始テスト...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        
        console.log('📸 トレーニングゲーム開始後');
        await page.screenshot({ path: 'real_test_3_training_started.png' });
        
        // タイトルに戻る
        await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.switchToTitleMode) {
                window.gameModeManager.switchToTitleMode();
            }
        });
        await page.waitForTimeout(2000);
        
        console.log('📸 タイトルに戻った後');
        await page.screenshot({ path: 'real_test_4_back_to_title.png' });
        
        // 2. 対戦モードテスト
        console.log('⚔️ 対戦モードをクリック...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(3000);
        
        console.log('📸 対戦モード画面');
        await page.screenshot({ path: 'real_test_5_battle.png' });
        
        // 対戦開始ボタンがあるかチェック
        const battleStartExists = await page.$('#battle-start');
        console.log('対戦開始ボタン存在:', !!battleStartExists);
        
        if (battleStartExists) {
            console.log('⚡ 対戦開始ボタンをクリック...');
            await battleStartExists.click();
            await page.waitForTimeout(3000);
            
            console.log('📸 対戦開始後');
            await page.screenshot({ path: 'real_test_6_battle_started.png' });
        }
        
        // 実際の問題を詳しく調べる
        const detailedCheck = await page.evaluate(() => {
            const titleScreen = document.getElementById('start-screen');
            const gameArea = document.querySelector('.game-area');
            const battleScreen = document.getElementById('battle-screen');
            const canvas = document.getElementById('game-canvas');
            
            return {
                titleScreen: {
                    exists: !!titleScreen,
                    visible: titleScreen ? getComputedStyle(titleScreen).display !== 'none' : false,
                    classes: titleScreen ? titleScreen.className : null
                },
                gameArea: {
                    exists: !!gameArea,
                    visible: gameArea ? getComputedStyle(gameArea).display !== 'none' : false,
                    style: gameArea ? gameArea.style.cssText : null
                },
                battleScreen: {
                    exists: !!battleScreen,
                    visible: battleScreen ? getComputedStyle(battleScreen).display !== 'none' : false,
                    style: battleScreen ? battleScreen.style.cssText : null
                },
                canvas: {
                    exists: !!canvas,
                    visible: canvas ? getComputedStyle(canvas).display !== 'none' : false
                },
                currentMode: window.gameModeManager ? window.gameModeManager.currentMode : null,
                gameExists: !!window.game,
                gameRunning: window.game ? window.game.gameRunning : false
            };
        });
        
        console.log('詳細チェック結果:', JSON.stringify(detailedCheck, null, 2));
        
        console.log('✅ 実際の動作確認完了');
        
        await page.waitForTimeout(5000); // 手動確認用の待機時間
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

realTest().catch(console.error);