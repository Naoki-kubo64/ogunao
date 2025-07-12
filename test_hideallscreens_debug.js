const { chromium } = require('playwright');

async function testHideAllScreensDebug() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🎮 Hide All Screens debug test starting...');
        
        // HTMLファイルを直接開く
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(3000); // Wait for GameModeManager initialization
        
        console.log('1️⃣ Clicking start game button...');
        await page.click('#start-game-btn');
        await page.waitForTimeout(1000);
        
        console.log('2️⃣ Clicking solo mode button...');
        await page.click('#solo-mode-btn');
        await page.waitForTimeout(1500);
        
        console.log('3️⃣ Pressing Enter key...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Debug hideAllScreens execution
        const debugInfo = await page.evaluate(() => {
            const manager = window.gameModeManager;
            const startScreen = document.getElementById('start-screen');
            
            return {
                gameModeManagerExists: !!manager,
                currentMode: manager ? manager.currentMode : 'undefined',
                startScreenElement: !!startScreen,
                startScreenClasses: startScreen ? Array.from(startScreen.classList) : 'undefined',
                startScreenDisplay: startScreen ? window.getComputedStyle(startScreen).display : 'undefined',
                thisStartScreenInManager: manager && manager.startScreen ? 'exists' : 'missing',
                hideAllScreensMethodExists: manager && typeof manager.hideAllScreens === 'function'
            };
        });
        
        console.log('📊 Debug info after Enter:', debugInfo);
        
        // Try to manually call hideAllScreens
        console.log('4️⃣ Manually calling hideAllScreens...');
        const manualHideResult = await page.evaluate(() => {
            const manager = window.gameModeManager;
            try {
                if (manager && manager.hideAllScreens) {
                    manager.hideAllScreens();
                    return 'success';
                } else {
                    return 'manager or method not found';
                }
            } catch (error) {
                return `error: ${error.message}`;
            }
        });
        
        console.log('📊 Manual hideAllScreens result:', manualHideResult);
        
        await page.waitForTimeout(1000);
        
        // Check state after manual call
        const afterManualHide = await page.evaluate(() => {
            const startScreen = document.getElementById('start-screen');
            return {
                startScreenClasses: startScreen ? Array.from(startScreen.classList) : 'undefined',
                startScreenDisplay: startScreen ? window.getComputedStyle(startScreen).display : 'undefined'
            };
        });
        
        console.log('📊 After manual hideAllScreens:', afterManualHide);
        
        await page.screenshot({ path: 'debug_hideallscreens.png' });
        
    } catch (error) {
        console.error('💥 Debug test error:', error);
    } finally {
        await browser.close();
    }
}

testHideAllScreensDebug().catch(console.error);