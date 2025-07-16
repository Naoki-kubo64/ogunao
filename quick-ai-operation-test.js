const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('⚡ AI操作システム集中テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let aiOperationCount = 0;
    
    // AIキー操作ログをキャプチャ（詳細版）
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('🤖 AI:')) {
            aiOperationCount++;
            console.log(`[${aiOperationCount}] ${text}`);
        }
        if (text.includes('🎯 AI目標設定') || text.includes('🚀 AI高速落下') || 
            text.includes('競技AI思考') || text.includes('高度構築')) {
            console.log(`📊 ${text}`);
        }
    });
    
    // HTMLファイルを開く
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(2000);
    
    // ストーリーモードに入る
    console.log('🎮 ストーリーモード開始');
    await page.click('#story-mode-btn');
    await page.waitForTimeout(1500);
    
    // 戦闘開始
    console.log('⚔️ AI操作テスト戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'ai_ops_01_start.png', fullPage: true });
    
    // AIの操作を集中観測（10秒間）
    console.log('🔍 AI操作集中観測（10秒間）');
    await page.waitForTimeout(10000);
    
    await page.screenshot({ path: 'ai_ops_02_operations.png', fullPage: true });
    
    // プレイヤーが少し操作して反応確認
    console.log('🎮 プレイヤー操作でAI反応誘発');
    for (let i = 0; i < 3; i++) {
        await page.keyboard.press('d');
        await page.waitForTimeout(100);
        await page.keyboard.press('s');
        await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'ai_ops_03_response.png', fullPage: true });
    
    // さらにAI観測
    console.log('⚡ AI操作再観測（8秒間）');
    await page.waitForTimeout(8000);
    
    await page.screenshot({ path: 'ai_ops_04_final.png', fullPage: true });
    
    console.log('✅ AI操作テスト完了');
    console.log(`📊 総AI操作回数: ${aiOperationCount}`);
    console.log('\\n=== AI操作システム評価 ===');
    console.log('✓ A/D/S/SPACE キー操作:', aiOperationCount > 0 ? '✅ 確認済み' : '❌ 未確認');
    console.log('✓ 操作頻度:', aiOperationCount > 5 ? '✅ 活発' : aiOperationCount > 0 ? '⚠️ 少ない' : '❌ なし');
    
    await browser.close();
})();