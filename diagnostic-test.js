const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🔧 ゲーム状態診断テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // 戦闘開始状態を監視
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('戦闘画面表示') || text.includes('ぷよぷよ戦闘開始') || text.includes('gameState') || text.includes('startBattle')) {
            console.log(`[状態] ${text}`);
        }
    });
    
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(1500);
    
    console.log('📍 ストーリーモード開始');
    await page.click('#story-mode-btn');
    await page.waitForTimeout(1000);
    
    // ゲーム状態を確認
    const gameState = await page.evaluate(() => {
        if (window.storyMode) {
            return {
                state: window.storyMode.gameState,
                initialized: window.storyMode.isInitialized,
                running: window.storyMode.gameRunning
            };
        }
        return { error: 'storyMode not found' };
    });
    
    console.log('🎮 ゲーム状態:', gameState);
    
    console.log('🚀 戦闘開始ボタンクリック');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(2000);
    
    // 戦闘開始後の状態確認
    const battleState = await page.evaluate(() => {
        if (window.storyMode) {
            return {
                state: window.storyMode.gameState,
                running: window.storyMode.gameRunning,
                playerBoard: window.storyMode.playerBoard ? 'exists' : 'missing',
                enemyBoard: window.storyMode.enemyBoard ? 'exists' : 'missing'
            };
        }
        return { error: 'storyMode not found' };
    });
    
    console.log('⚔️ 戦闘状態:', battleState);
    
    await browser.close();
})();