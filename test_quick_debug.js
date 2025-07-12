const { chromium } = require('playwright');

async function testQuickDebug() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🎮 Quick debug test starting...');
        
        // HTMLファイルを直接開く
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(3000); // Wait longer for GameModeManager initialization
        
        console.log('1️⃣ Clicking start game button...');
        await page.click('#start-game-btn');
        await page.waitForTimeout(1000);
        
        console.log('2️⃣ Clicking solo mode button...');
        await page.click('#solo-mode-btn');
        await page.waitForTimeout(1500);
        
        // 現在の状態を確認
        const currentState = await page.evaluate(() => {
            return {
                gameModeManager: window.gameModeManager ? window.gameModeManager.currentMode : 'undefined',
                gameRunning: window.game ? window.game.gameRunning : 'undefined',
                startScreenVisible: document.getElementById('start-screen') ? !document.getElementById('start-screen').classList.contains('hidden') : 'undefined',
                pressEnterVisible: document.getElementById('press-enter-instruction') ? !document.getElementById('press-enter-instruction').classList.contains('hidden') : 'undefined'
            };
        });
        
        console.log('📊 Current state:', currentState);
        
        console.log('3️⃣ Pressing Enter key...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        // Enterキー後の状態を確認
        const afterEnterState = await page.evaluate(() => {
            return {
                gameModeManager: window.gameModeManager ? window.gameModeManager.currentMode : 'undefined',
                gameRunning: window.game ? window.game.gameRunning : 'undefined',
                startScreenVisible: document.getElementById('start-screen') ? !document.getElementById('start-screen').classList.contains('hidden') : 'undefined',
                bodyClasses: Array.from(document.body.classList),
                containerDisplay: document.querySelector('.container') ? window.getComputedStyle(document.querySelector('.container')).display : 'undefined'
            };
        });
        
        console.log('📊 After Enter state:', afterEnterState);
        
        await page.screenshot({ path: 'debug_after_enter.png' });
        
    } catch (error) {
        console.error('💥 Debug test error:', error);
    } finally {
        await browser.close();
    }
}

testQuickDebug().catch(console.error);