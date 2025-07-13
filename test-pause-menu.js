const { chromium } = require('playwright');

async function testPauseMenu() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 ポーズメニューテスト開始...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('🎯 トレーニングモードを開始...');
        await page.click('#training-mode-btn');
        await page.waitForTimeout(2000);
        
        console.log('▶️ ゲームを開始...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        
        console.log('📸 ゲーム開始後のスクリーンショット...');
        await page.screenshot({ path: 'test_pause_game_started.png' });
        
        console.log('⏸️ Escapeキーでポーズメニューを表示...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(2000);
        
        console.log('📸 ポーズメニュー表示のスクリーンショット...');
        await page.screenshot({ path: 'test_pause_menu_displayed.png' });
        
        // ポーズメニューの要素確認
        const pauseMenuState = await page.evaluate(() => {
            const pauseMenu = document.getElementById('pause-menu');
            const pauseResume = document.getElementById('pause-resume');
            const pauseTitle = document.getElementById('pause-title');
            const pauseSettings = document.getElementById('pause-settings');
            const pauseRules = document.getElementById('pause-rules');
            
            return {
                pauseMenuVisible: pauseMenu ? !pauseMenu.classList.contains('hidden') : false,
                pauseResumeExists: !!pauseResume,
                pauseTitleExists: !!pauseTitle,
                pauseSettingsExists: !!pauseSettings,
                pauseRulesExists: !!pauseRules,
                gameState: {
                    gameRunning: window.game ? window.game.gameRunning : false,
                    gamePaused: window.game ? window.game.gamePaused : false
                }
            };
        });
        
        console.log('ポーズメニュー状態:', JSON.stringify(pauseMenuState, null, 2));
        
        console.log('▶️ ゲーム再開ボタンをクリック...');
        await page.click('#pause-resume');
        await page.waitForTimeout(2000);
        
        console.log('📸 ゲーム再開後のスクリーンショット...');
        await page.screenshot({ path: 'test_pause_game_resumed.png' });
        
        // 再度ポーズして別のボタンをテスト
        console.log('⏸️ 再度Escapeキーでポーズ...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        console.log('📚 ルール説明ボタンをクリック...');
        await page.click('#pause-rules');
        await page.waitForTimeout(2000);
        
        console.log('📸 ルール説明表示のスクリーンショット...');
        await page.screenshot({ path: 'test_pause_rules_displayed.png' });
        
        console.log('✅ ポーズメニューテスト完了');
        
        await page.waitForTimeout(3000); // 手動確認用の待機時間
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

testPauseMenu().catch(console.error);