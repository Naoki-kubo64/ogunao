const { chromium } = require('playwright');

async function interactiveTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // 操作を見やすくする
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🎮 Interactive test - 対戦モード遷移確認');
        console.log('ブラウザが開きます。手動で対戦モードボタンをクリックして確認してください。');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(3000);
        
        console.log('🎯 タイトル画面が表示されました');
        console.log('手動で「対戦モード」ボタンをクリックしてみてください...');
        
        // 10秒間待機してユーザーの操作を観察
        await page.waitForTimeout(10000);
        
        // 現在の状態を確認
        const currentState = await page.evaluate(() => {
            const titleScreen = document.getElementById('start-screen');
            const battleScreen = document.getElementById('battle-screen');
            
            return {
                titleVisible: titleScreen && !titleScreen.classList.contains('hidden'),
                battleVisible: battleScreen && !battleScreen.classList.contains('hidden'),
                currentMode: window.gameModeManager ? window.gameModeManager.currentMode : null
            };
        });
        
        console.log('現在の状態:', currentState);
        
        if (currentState.battleVisible) {
            console.log('✅ 対戦モードへの遷移が確認できました');
        } else {
            console.log('❌ 対戦モードへの遷移で問題があるようです');
        }
        
        console.log('テストを続行するには何かキーを押してください...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('💥 Test error:', error);
    } finally {
        await browser.close();
    }
}

interactiveTest().catch(console.error);