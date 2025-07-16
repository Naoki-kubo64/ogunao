const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('⬇️ Sキー落下速度テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let playerSMoves = 0;
    let aiSMoves = 0;
    let playerPlacements = 0;
    let aiPlacements = 0;
    
    // S操作をカウント
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('⬇️ プレイヤー高速落下: 1段')) {
            playerSMoves++;
            console.log(`[プレイヤーS操作 ${playerSMoves}] ${text}`);
        }
        if (text.includes('🤖 AI: ⬇️ S (1段下移動)')) {
            aiSMoves++;
            console.log(`[AI S操作 ${aiSMoves}] ${text}`);
        }
        if (text.includes('📍 ぷよ配置完了')) {
            playerPlacements++;
            console.log(`[プレイヤー配置 ${playerPlacements}]`);
        }
        if (text.includes('🤖 敵ぷよ配置完了')) {
            aiPlacements++;
            console.log(`[AI配置 ${aiPlacements}]`);
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
    console.log('⚔️ Sキー速度テスト戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: 's_key_test_01_start.png', fullPage: true });
    
    // プレイヤーのS操作テスト
    console.log('🎮 プレイヤーS操作テスト（ゆっくり落下確認）');
    
    // 左に移動してからSキー連打テスト
    await page.keyboard.press('a');
    await page.waitForTimeout(200);
    
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('s');
        await page.waitForTimeout(300); // 落下を確認できる間隔
        
        if (i === 3) {
            await page.screenshot({ path: 's_key_test_02_player_falling.png', fullPage: true });
        }
    }
    
    console.log('⏳ AI動作観測（8秒間）- S操作の様子を確認');
    await page.waitForTimeout(8000);
    
    await page.screenshot({ path: 's_key_test_03_ai_behavior.png', fullPage: true });
    
    // 追加プレイヤー操作
    console.log('🎮 追加プレイヤーS操作テスト');
    for (let i = 0; i < 5; i++) {
        await page.keyboard.press('d');
        await page.waitForTimeout(100);
        await page.keyboard.press('s');
        await page.waitForTimeout(250);
        await page.keyboard.press('s');
        await page.waitForTimeout(250);
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 's_key_test_04_final.png', fullPage: true });
    
    console.log('\\n=== Sキー速度テスト結果 ===');
    console.log(`プレイヤーS操作回数: ${playerSMoves}`);
    console.log(`AI S操作回数: ${aiSMoves}`);
    console.log(`プレイヤー配置回数: ${playerPlacements}`);
    console.log(`AI配置回数: ${aiPlacements}`);
    
    console.log('\\n=== 落下速度評価 ===');
    if (playerSMoves > 0) {
        console.log('✅ プレイヤーS操作: 1段ずつ落下 - 制御可能');
    } else {
        console.log('❌ プレイヤーS操作: 動作未確認');
    }
    
    if (aiSMoves > 0) {
        console.log('✅ AI S操作: 1段ずつ落下 - バランス良好');
    } else {
        console.log('⚠️ AI S操作: 動作未確認');
    }
    
    await browser.close();
})();