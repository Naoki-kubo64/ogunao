const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🔍 パフォーマンス・フリーズ問題調査');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let gameRunningLogs = 0;
    let errorLogs = 0;
    let gameLoopLogs = 0;
    let lastPlayerAction = 0;
    let lastAiAction = 0;
    
    // ログ監視
    page.on('console', msg => {
        const text = msg.text();
        const timestamp = Date.now();
        
        // ゲーム実行状態
        if (text.includes('gameRunning')) {
            gameRunningLogs++;
            console.log(`[${gameRunningLogs}] ゲーム状態: ${text.substring(0, 60)}...`);
        }
        
        // ゲームループ
        if (text.includes('gameLoop') || text.includes('requestAnimationFrame')) {
            gameLoopLogs++;
            if (gameLoopLogs <= 5) console.log(`[ループ ${gameLoopLogs}] ${text.substring(0, 50)}...`);
        }
        
        // プレイヤー操作
        if (text.includes('Key pressed') || text.includes('プレイヤー')) {
            lastPlayerAction = timestamp;
            console.log(`[プレイヤー操作] ${text.substring(0, 50)}...`);
        }
        
        // AI操作
        if (text.includes('🤖 AI:') || text.includes('AI思考')) {
            lastAiAction = timestamp;
            console.log(`[AI操作] ${text.substring(0, 50)}...`);
        }
        
        // エラー監視
        if (text.includes('Error') || text.includes('error') || text.includes('エラー')) {
            errorLogs++;
            console.log(`❌ [エラー ${errorLogs}] ${text}`);
        }
    });
    
    // ページエラー監視
    page.on('pageerror', error => {
        console.log(`💥 ページエラー: ${error.message}`);
    });
    
    // リクエスト失敗監視
    page.on('requestfailed', request => {
        console.log(`🔗 リクエスト失敗: ${request.url()}`);
    });
    
    try {
        // 戦闘開始
        const htmlPath = path.resolve(__dirname, 'index.html');
        await page.goto(`file://${htmlPath}`);
        await page.waitForTimeout(2000);
        
        console.log('🎮 ゲーム開始 - パフォーマンス監視開始');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(1500);
        await page.click('#start-battle-btn');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'perf_debug_01_start.png', fullPage: true });
        
        // 初期動作確認（5秒）
        console.log('⏰ 初期動作確認（5秒）');
        await page.waitForTimeout(5000);
        
        const startTime = Date.now();
        
        // プレイヤー操作テスト
        console.log('🎮 プレイヤー操作反応テスト');
        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('a');
            await page.waitForTimeout(200);
            await page.keyboard.press('d'); 
            await page.waitForTimeout(200);
            await page.keyboard.press('s');
            await page.waitForTimeout(500);
            
            console.log(`操作セット ${i + 1} 完了`);
        }
        
        await page.screenshot({ path: 'perf_debug_02_after_input.png', fullPage: true });
        
        // 長時間監視（フリーズ確認）
        console.log('⏳ フリーズ監視（10秒間）');
        await page.waitForTimeout(10000);
        
        await page.screenshot({ path: 'perf_debug_03_long_term.png', fullPage: true });
        
        // 追加操作テスト
        console.log('🔄 追加操作テスト');
        for (let i = 0; i < 2; i++) {
            await page.keyboard.press('s');
            await page.waitForTimeout(300);
        }
        
        const endTime = Date.now();
        const totalTime = (endTime - startTime) / 1000;
        
        await page.screenshot({ path: 'perf_debug_04_final.png', fullPage: true });
        
        console.log('\\n=== パフォーマンス診断結果 ===');
        console.log(`総テスト時間: ${totalTime.toFixed(1)}秒`);
        console.log(`ゲーム状態ログ: ${gameRunningLogs}`);
        console.log(`ゲームループログ: ${gameLoopLogs}`);
        console.log(`エラーログ: ${errorLogs}`);
        
        const timeSincePlayerAction = (Date.now() - lastPlayerAction) / 1000;
        const timeSinceAiAction = (Date.now() - lastAiAction) / 1000;
        
        console.log(`最後のプレイヤー操作: ${timeSincePlayerAction.toFixed(1)}秒前`);
        console.log(`最後のAI操作: ${timeSinceAiAction.toFixed(1)}秒前`);
        
        console.log('\\n=== 問題診断 ===');
        
        if (errorLogs > 0) {
            console.log('❌ JavaScript エラーが発生');
        } else {
            console.log('✅ JavaScript エラーなし');
        }
        
        if (timeSincePlayerAction > 10) {
            console.log('⚠️ プレイヤー操作が長時間反応していない');
        } else {
            console.log('✅ プレイヤー操作は正常');
        }
        
        if (timeSinceAiAction > 15) {
            console.log('⚠️ AI操作が長時間停止');
        } else {
            console.log('✅ AI操作は継続中');
        }
        
        if (gameLoopLogs < 10) {
            console.log('❌ ゲームループが停止している可能性');
        } else {
            console.log('✅ ゲームループは動作中');
        }
        
    } catch (error) {
        console.log(`🚨 テスト中にエラー: ${error.message}`);
    }
    
    await browser.close();
})();