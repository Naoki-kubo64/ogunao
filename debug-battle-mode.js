const { chromium } = require('playwright');

async function debugBattleMode() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 Debugging battle mode transition...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('1️⃣ Initial state check...');
        
        let initialState = await page.evaluate(() => {
            const titleScreen = document.getElementById('start-screen');
            const battleScreen = document.getElementById('battle-screen');
            const battleBtn = document.getElementById('battle-mode-btn');
            
            return {
                titleVisible: titleScreen && !titleScreen.classList.contains('hidden'),
                battleVisible: battleScreen && !battleScreen.classList.contains('hidden'),
                battleBtnExists: !!battleBtn,
                gameModeManagerExists: !!window.gameModeManager
            };
        });
        
        console.log('Initial state:', initialState);
        
        console.log('2️⃣ Clicking battle mode button...');
        
        // コンソールログを監視
        page.on('console', msg => {
            if (msg.text().includes('対戦モード') || msg.text().includes('Battle') || msg.text().includes('⚔️')) {
                console.log('Browser console:', msg.text());
            }
        });
        
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(2000);
        
        console.log('3️⃣ Post-click state check...');
        
        let postClickState = await page.evaluate(() => {
            const titleScreen = document.getElementById('start-screen');
            const battleScreen = document.getElementById('battle-screen');
            const gameArea = document.querySelector('.game-area');
            const container = document.querySelector('.container');
            
            const battleScreenStyles = battleScreen ? {
                display: getComputedStyle(battleScreen).display,
                visibility: getComputedStyle(battleScreen).visibility,
                className: battleScreen.className,
                position: getComputedStyle(battleScreen).position
            } : null;
            
            return {
                titleVisible: titleScreen && !titleScreen.classList.contains('hidden'),
                titleClasses: titleScreen ? titleScreen.className : null,
                battleVisible: battleScreen && !battleScreen.classList.contains('hidden'),
                battleClasses: battleScreen ? battleScreen.className : null,
                battleStyles: battleScreenStyles,
                gameAreaDisplay: gameArea ? getComputedStyle(gameArea).display : null,
                containerDisplay: container ? getComputedStyle(container).display : null,
                currentMode: window.gameModeManager ? window.gameModeManager.currentMode : null,
                bodyClasses: document.body.className
            };
        });
        
        console.log('Post-click state:');
        console.log('  Title visible:', postClickState.titleVisible);
        console.log('  Title classes:', postClickState.titleClasses);
        console.log('  Battle visible:', postClickState.battleVisible);
        console.log('  Battle classes:', postClickState.battleClasses);
        console.log('  Battle styles:', postClickState.battleStyles);
        console.log('  Game area display:', postClickState.gameAreaDisplay);
        console.log('  Container display:', postClickState.containerDisplay);
        console.log('  Current mode:', postClickState.currentMode);
        console.log('  Body classes:', postClickState.bodyClasses);
        
        await page.screenshot({ path: 'debug_battle_mode.png' });
        
        const isWorking = postClickState.battleVisible && !postClickState.titleVisible;
        console.log(`\\n${isWorking ? '✅' : '❌'} Battle mode transition: ${isWorking ? 'WORKING' : 'NOT WORKING'}`);
        
        if (!isWorking) {
            console.log('\\n🔧 Troubleshooting...');
            
            // Try manual battle screen display
            await page.evaluate(() => {
                const battleScreen = document.getElementById('battle-screen');
                if (battleScreen) {
                    battleScreen.classList.remove('hidden');
                    battleScreen.style.display = 'block';
                    battleScreen.style.visibility = 'visible';
                    console.log('Manually showing battle screen');
                }
            });
            
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'debug_battle_mode_manual.png' });
        }
        
        return isWorking;
        
    } catch (error) {
        console.error('💥 Debug error:', error);
        return false;
    } finally {
        await browser.close();
    }
}

debugBattleMode().catch(console.error);