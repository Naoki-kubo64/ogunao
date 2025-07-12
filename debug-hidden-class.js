const { chromium } = require('playwright');

async function debugHiddenClass() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('🔍 対戦画面の初期状態確認...');
        let initialState = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            return {
                exists: !!battleScreen,
                className: battleScreen ? battleScreen.className : null,
                hasHidden: battleScreen ? battleScreen.classList.contains('hidden') : null
            };
        });
        
        console.log('Initial state:', initialState);
        
        console.log('🎮 対戦モードボタンをクリック...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(3000);
        
        console.log('🔍 クリック後の状態確認...');
        let afterClickState = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            return {
                exists: !!battleScreen,
                className: battleScreen ? battleScreen.className : null,
                hasHidden: battleScreen ? battleScreen.classList.contains('hidden') : null,
                computedDisplay: battleScreen ? getComputedStyle(battleScreen).display : null
            };
        });
        
        console.log('After click state:', afterClickState);
        
        if (afterClickState.hasHidden) {
            console.log('❌ 問題発見: battle-screen に hidden クラスが残っています');
            
            // 手動でhiddenクラスを削除
            await page.evaluate(() => {
                const battleScreen = document.getElementById('battle-screen');
                if (battleScreen) {
                    battleScreen.classList.remove('hidden');
                    console.log('手動でhiddenクラスを削除しました');
                }
            });
            
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'battle_after_manual_fix.png' });
            console.log('✅ 修正後のスクリーンショット: battle_after_manual_fix.png');
        }
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

debugHiddenClass().catch(console.error);