const { chromium } = require('playwright');

async function finalCheck() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('📸 タイトル画面のスクリーンショット...');
        await page.screenshot({ path: 'final_title.png' });
        
        console.log('🎮 対戦モードボタンをクリック（強制）...');
        // JavaScriptで直接クリック
        await page.evaluate(() => {
            const btn = document.getElementById('battle-mode-btn');
            if (btn) {
                btn.click();
            }
        });
        
        await page.waitForTimeout(3000);
        
        console.log('📸 対戦画面のスクリーンショット...');
        await page.screenshot({ path: 'final_battle.png' });
        
        // 対戦画面の状態確認
        const status = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            return {
                exists: !!battleScreen,
                classes: battleScreen ? battleScreen.className : null,
                computed: {
                    display: battleScreen ? getComputedStyle(battleScreen).display : null,
                    visibility: battleScreen ? getComputedStyle(battleScreen).visibility : null,
                    position: battleScreen ? getComputedStyle(battleScreen).position : null,
                    zIndex: battleScreen ? getComputedStyle(battleScreen).zIndex : null
                },
                rect: battleScreen ? battleScreen.getBoundingClientRect() : null
            };
        });
        
        console.log('Battle screen status:', status);
        
        console.log('✅ 最終確認完了');
        console.log('  - final_title.png');
        console.log('  - final_battle.png');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

finalCheck().catch(console.error);