const { chromium } = require('playwright');

async function debugBattleDom() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('🎮 対戦モードボタンをクリック...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(3000);
        
        // DOM要素の詳細チェック
        const domInfo = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            const battleContent = document.querySelector('.battle-content');
            const battleHeader = document.querySelector('.battle-header');
            
            return {
                battleScreen: battleScreen ? {
                    exists: true,
                    className: battleScreen.className,
                    style: battleScreen.style.cssText,
                    computedStyle: {
                        display: getComputedStyle(battleScreen).display,
                        visibility: getComputedStyle(battleScreen).visibility,
                        position: getComputedStyle(battleScreen).position,
                        zIndex: getComputedStyle(battleScreen).zIndex,
                        width: getComputedStyle(battleScreen).width,
                        height: getComputedStyle(battleScreen).height
                    },
                    innerHTML: battleScreen.innerHTML.substring(0, 500) + '...'
                } : { exists: false },
                battleContent: battleContent ? {
                    exists: true,
                    className: battleContent.className,
                    computedStyle: {
                        display: getComputedStyle(battleContent).display,
                        visibility: getComputedStyle(battleContent).visibility
                    }
                } : { exists: false },
                battleHeader: battleHeader ? {
                    exists: true,
                    innerHTML: battleHeader.innerHTML
                } : { exists: false }
            };
        });
        
        console.log('🔍 DOM情報:');
        console.log('Battle Screen:', JSON.stringify(domInfo.battleScreen, null, 2));
        console.log('\\nBattle Content:', JSON.stringify(domInfo.battleContent, null, 2));
        console.log('\\nBattle Header:', JSON.stringify(domInfo.battleHeader, null, 2));
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

debugBattleDom().catch(console.error);