const { chromium } = require('playwright');

async function debugHiddenAgain() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('🔍 初期状態の確認...');
        let initial = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            return {
                exists: !!battleScreen,
                classes: battleScreen ? battleScreen.className : null,
                style: battleScreen ? battleScreen.style.cssText : null,
                computedDisplay: battleScreen ? getComputedStyle(battleScreen).display : null
            };
        });
        
        console.log('Initial:', initial);
        
        console.log('🎮 対戦モードボタンをクリック...');
        await page.click('#battle-mode-btn');
        
        // クリック直後の状態を確認
        await page.waitForTimeout(100);
        let afterClick = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            return {
                exists: !!battleScreen,
                classes: battleScreen ? battleScreen.className : null,
                style: battleScreen ? battleScreen.style.cssText : null,
                computedDisplay: battleScreen ? getComputedStyle(battleScreen).display : null,
                hasHidden: battleScreen ? battleScreen.classList.contains('hidden') : null
            };
        });
        
        console.log('After click (100ms):', afterClick);
        
        // setTimeout後の状態を確認
        await page.waitForTimeout(100);
        let afterTimeout = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            return {
                exists: !!battleScreen,
                classes: battleScreen ? battleScreen.className : null,
                style: battleScreen ? battleScreen.style.cssText : null,
                computedDisplay: battleScreen ? getComputedStyle(battleScreen).display : null,
                hasHidden: battleScreen ? battleScreen.classList.contains('hidden') : null
            };
        });
        
        console.log('After timeout (200ms):', afterTimeout);
        
        if (afterTimeout.hasHidden) {
            console.log('❌ hidden クラスがまだ残っています - 手動で削除します');
            
            await page.evaluate(() => {
                const battleScreen = document.getElementById('battle-screen');
                if (battleScreen) {
                    battleScreen.classList.remove('hidden');
                    battleScreen.removeAttribute('hidden');
                    battleScreen.style.display = 'block';
                    battleScreen.style.visibility = 'visible';
                    
                    // すべての子要素も確認
                    const allElements = battleScreen.querySelectorAll('*');
                    allElements.forEach(el => {
                        el.classList.remove('hidden');
                        el.removeAttribute('hidden');
                    });
                    
                    console.log('手動で hidden を削除しました');
                }
            });
            
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'battle_manual_unhide.png' });
            console.log('✅ 手動unhide後のスクリーンショット: battle_manual_unhide.png');
        }
        
        // 最終状態を確認
        let final = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            return {
                exists: !!battleScreen,
                classes: battleScreen ? battleScreen.className : null,
                style: battleScreen ? battleScreen.style.cssText : null,
                computedDisplay: battleScreen ? getComputedStyle(battleScreen).display : null,
                hasHidden: battleScreen ? battleScreen.classList.contains('hidden') : null,
                rect: battleScreen ? battleScreen.getBoundingClientRect() : null
            };
        });
        
        console.log('Final state:', final);
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

debugHiddenAgain().catch(console.error);