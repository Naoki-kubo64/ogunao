const { chromium } = require('playwright');

async function debugPause() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    // コンソールログを出力
    page.on('console', msg => {
        console.log('PAGE LOG:', msg.text());
    });
    
    try {
        console.log('🔍 ポーズメニューデバッグ開始...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('🎯 トレーニングモードを開始...');
        await page.click('#training-mode-btn');
        await page.waitForTimeout(2000);
        
        console.log('▶️ ゲームを開始...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        
        // 初期状態確認
        const initialState = await page.evaluate(() => {
            return {
                pauseMenuExists: !!document.getElementById('pause-menu'),
                pauseMenuVisible: document.getElementById('pause-menu') ? !document.getElementById('pause-menu').classList.contains('hidden') : false,
                gameRunning: window.game ? window.game.gameRunning : false,
                currentMode: window.gameModeManager ? window.gameModeManager.currentMode : null,
                gameExists: !!window.game
            };
        });
        
        console.log('初期状態:', JSON.stringify(initialState, null, 2));
        
        console.log('⏸️ Escapeキーを押してポーズメニューを表示...');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(2000);
        
        // ポーズ後の状態確認
        const pauseState = await page.evaluate(() => {
            const pauseMenu = document.getElementById('pause-menu');
            return {
                pauseMenuExists: !!pauseMenu,
                pauseMenuVisible: pauseMenu ? !pauseMenu.classList.contains('hidden') : false,
                pauseMenuClasses: pauseMenu ? pauseMenu.className : null,
                gamePaused: window.game ? window.game.gamePaused : false,
                gameRunning: window.game ? window.game.gameRunning : false
            };
        });
        
        console.log('ポーズ後の状態:', JSON.stringify(pauseState, null, 2));
        
        console.log('📸 スクリーンショット撮影...');
        await page.screenshot({ path: 'debug_pause_after_escape.png' });
        
        await page.waitForTimeout(5000); // 手動確認用
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

debugPause().catch(console.error);