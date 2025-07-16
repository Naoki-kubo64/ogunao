const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('⚡ 速度改善テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let playerActions = 0;
    let aiActions = 0;
    
    // プレイヤー操作とAI操作をカウント
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('📍 ぷよ配置完了')) {
            playerActions++;
            console.log(`[プレイヤー操作 ${playerActions}] ${text}`);
        }
        if (text.includes('🤖 敵ぷよ配置完了')) {
            aiActions++;
            console.log(`[AI操作 ${aiActions}] ${text}`);
        }
        if (text.includes('🚨 緊急事態！')) {
            console.log(`⚠️ [緊急回避] ${text}`);
        }
        if (text.includes('🚨 極度危険！') || text.includes('⚠️ 高さ危険！')) {
            console.log(`📊 [高さ制御] ${text}`);
        }
    });
    
    // HTMLファイルを開く
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(2000);
    
    // ストーリーモード開始
    console.log('🎮 ストーリーモード開始');
    await page.click('#story-mode-btn');
    await page.waitForTimeout(1000);
    
    // 戦闘開始
    console.log('⚔️ 速度テスト戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'speed_test_01_start.png', fullPage: true });
    
    // プレイヤーが素早く操作
    console.log('🎮 プレイヤー高速操作テスト');
    for (let i = 0; i < 5; i++) {
        await page.keyboard.press('d');
        await page.waitForTimeout(50);
        await page.keyboard.press('s');
        await page.waitForTimeout(100); // 短い間隔
        
        if (i === 2) {
            await page.screenshot({ path: 'speed_test_02_rapid_play.png', fullPage: true });
        }
    }
    
    // AI動作観測（15秒間）
    console.log('🤖 AI速度観測（15秒間）');
    await page.waitForTimeout(15000);
    
    await page.screenshot({ path: 'speed_test_03_ai_activity.png', fullPage: true });
    
    // さらにプレイヤー操作
    console.log('🎮 追加高速操作');
    for (let i = 0; i < 3; i++) {
        await page.keyboard.press('a');
        await page.waitForTimeout(50);
        await page.keyboard.press('s');
        await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'speed_test_04_final.png', fullPage: true });
    
    console.log('\\n=== 速度テスト結果 ===');
    console.log(`プレイヤー操作回数: ${playerActions}`);
    console.log(`AI操作回数: ${aiActions}`);
    console.log(`操作バランス: ${aiActions > 0 ? (playerActions/aiActions).toFixed(2) : 'N/A'}`);
    
    if (aiActions > playerActions * 0.8) {
        console.log('✅ 速度バランス良好');
    } else {
        console.log('⚠️ AI速度が遅い可能性');
    }
    
    await browser.close();
})();