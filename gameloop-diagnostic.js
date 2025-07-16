const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🔄 ゲームループ診断テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let gameLoopCount = 0;
    let gameRunningStates = [];
    
    // ゲームループと状態変化を監視
    page.on('console', msg => {
        const text = msg.text();
        
        // ゲームループ関連
        if (text.includes('gameLoop') || text.includes('requestAnimationFrame')) {
            gameLoopCount++;
            if (gameLoopCount <= 10) {
                console.log(`[ループ ${gameLoopCount}] ${text.substring(0, 50)}...`);
            }
        }
        
        // ゲーム状態変化
        if (text.includes('gameRunning') || text.includes('gameState') || text.includes('startGameLoop')) {
            console.log(`[状態変化] ${text}`);
            gameRunningStates.push({ time: Date.now(), message: text });
        }
        
        // 戦闘関連イベント
        if (text.includes('戦闘') || text.includes('ぷよぷよ') || text.includes('startPuyoBattle')) {
            console.log(`[戦闘] ${text}`);
        }
    });
    
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(2000);
    
    console.log('📖 ストーリーモード開始');
    await page.click('#story-mode-btn');
    await page.waitForTimeout(1500);
    
    console.log('⚔️ 戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(3000);
    
    // ゲームループの強制確認
    const loopStatus = await page.evaluate(() => {
        // ゲームマネージャーからストーリーモードを取得
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            const story = window.gameModeManager.storyMode;
            return {
                gameRunning: story.gameRunning,
                gameState: story.gameState,
                playerBoard: story.playerBoard ? 'exists' : 'null',
                enemyBoard: story.enemyBoard ? 'exists' : 'null',
                playerCtx: story.playerCtx ? 'exists' : 'null',
                enemyCtx: story.enemyCtx ? 'exists' : 'null'
            };
        }
        return { error: 'Story mode not accessible' };
    });
    
    console.log('\\n=== 最終診断結果 ===');
    console.log('ゲームループ呼び出し回数:', gameLoopCount);
    console.log('ゲーム状態:', loopStatus);
    console.log('状態変化履歴:', gameRunningStates.length);
    
    if (gameLoopCount === 0) {
        console.log('❌ ゲームループが一度も実行されていません');
    } else if (gameLoopCount < 5) {
        console.log('⚠️ ゲームループの実行回数が少ないです');
    } else {
        console.log('✅ ゲームループは正常に実行されています');
    }
    
    await browser.close();
})();