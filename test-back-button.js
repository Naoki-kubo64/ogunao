const { chromium } = require('playwright');

async function testBackButton() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 戻るボタンのテスト...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        await page.waitForTimeout(1000);
        
        console.log('📸 初期タイトル画面...');
        await page.screenshot({ path: 'test_initial_title.png' });
        
        // 対戦ボタンをクリック
        console.log('🎮 対戦モードボタンをクリック...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(1000);
        
        console.log('📸 対戦画面（戻るボタンテスト前）...');
        await page.screenshot({ path: 'test_battle_before_back.png' });
        
        // 戻るボタンをJavaScript経由でクリック
        console.log('🏠 戻るボタンをJavaScript経由でクリック...');
        await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.switchToTitleMode) {
                window.gameModeManager.switchToTitleMode();
            } else {
                console.log('GameModeManager not found');
            }
        });
        await page.waitForTimeout(1000);
        
        console.log('📸 戻るボタンクリック後...');
        await page.screenshot({ path: 'test_after_back_click.png' });
        
        // 状態確認
        const finalState = await page.evaluate(() => {
            const startScreen = document.getElementById('start-screen');
            const battleScreen = document.getElementById('battle-screen');
            
            return {
                startScreenVisible: startScreen ? getComputedStyle(startScreen).display !== 'none' : false,
                battleScreenVisible: battleScreen ? getComputedStyle(battleScreen).display !== 'none' : false,
                currentUrl: window.location.href
            };
        });
        
        console.log('最終状態:', finalState);
        
        console.log('✅ 戻るボタンテスト完了');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

testBackButton().catch(console.error);