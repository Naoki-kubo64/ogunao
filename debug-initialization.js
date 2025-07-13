const { chromium } = require('playwright');

async function debugInitialization() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 デバッグ: 初期化プロセスを調査中...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        
        // ページ読み込み直後
        console.log('📸 ページ読み込み直後のスクリーンショット...');
        await page.screenshot({ path: 'debug_initial.png' });
        
        // 初期状態の詳細な分析
        const initialState = await page.evaluate(() => {
            const startScreen = document.getElementById('start-screen');
            const battleScreen = document.getElementById('battle-screen');
            
            return {
                startScreen: startScreen ? {
                    exists: true,
                    classes: startScreen.className,
                    display: getComputedStyle(startScreen).display,
                    visibility: getComputedStyle(startScreen).visibility,
                    zIndex: getComputedStyle(startScreen).zIndex
                } : { exists: false },
                battleScreen: battleScreen ? {
                    exists: true,
                    classes: battleScreen.className,
                    display: getComputedStyle(battleScreen).display,
                    visibility: getComputedStyle(battleScreen).visibility,
                    zIndex: getComputedStyle(battleScreen).zIndex,
                    inlineStyle: battleScreen.style.cssText
                } : { exists: false }
            };
        });
        
        console.log('初期状態:', JSON.stringify(initialState, null, 2));
        
        // 2秒待って再確認
        await page.waitForTimeout(2000);
        console.log('📸 2秒後のスクリーンショット...');
        await page.screenshot({ path: 'debug_after_2sec.png' });
        
        const laterState = await page.evaluate(() => {
            const startScreen = document.getElementById('start-screen');
            const battleScreen = document.getElementById('battle-screen');
            
            return {
                startScreen: startScreen ? {
                    exists: true,
                    classes: startScreen.className,
                    display: getComputedStyle(startScreen).display,
                    visibility: getComputedStyle(startScreen).visibility,
                    zIndex: getComputedStyle(startScreen).zIndex
                } : { exists: false },
                battleScreen: battleScreen ? {
                    exists: true,
                    classes: battleScreen.className,
                    display: getComputedStyle(battleScreen).display,
                    visibility: getComputedStyle(battleScreen).visibility,
                    zIndex: getComputedStyle(battleScreen).zIndex,
                    inlineStyle: battleScreen.style.cssText
                } : { exists: false }
            };
        });
        
        console.log('2秒後の状態:', JSON.stringify(laterState, null, 2));
        
        console.log('✅ 初期化デバッグ完了');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

debugInitialization().catch(console.error);