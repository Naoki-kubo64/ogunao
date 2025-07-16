const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('⚖️ プレイヤー-AI速度バランステスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let playerActions = 0;
    let aiActions = 0;
    let playerFastDrops = 0;
    let aiOperations = 0;
    
    // 操作をカウント
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('📍 ぷよ配置完了')) {
            playerActions++;
            console.log(`[プレイヤー ${playerActions}] ${text.substring(0, 50)}...`);
        }
        if (text.includes('🤖 敵ぷよ配置完了')) {
            aiActions++;
            console.log(`[AI ${aiActions}] 配置完了`);
        }
        if (text.includes('🚀 プレイヤー高速落下')) {
            playerFastDrops++;
            console.log(`[プレイヤー高速落下 ${playerFastDrops}] ${text}`);
        }
        if (text.includes('🤖 AI:') && (text.includes('A (左移動)') || text.includes('D (右移動)') || text.includes('S (高速落下'))) {
            aiOperations++;
            console.log(`[AI操作 ${aiOperations}] ${text.substring(0, 40)}...`);
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
    console.log('⚔️ バランステスト戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: 'balance_test_01_start.png', fullPage: true });
    
    // 自然なプレイヤー操作
    console.log('🎮 自然なプレイヤー操作テスト');
    for (let i = 0; i < 6; i++) {
        // 位置調整
        if (i % 3 === 0) {
            await page.keyboard.press('d');
            await page.waitForTimeout(100);
        } else if (i % 3 === 1) {
            await page.keyboard.press('a');
            await page.waitForTimeout(100);
        }
        
        // 高速落下
        await page.keyboard.press('s');
        await page.waitForTimeout(300); // 自然な間隔
        
        if (i === 2) {
            await page.screenshot({ path: 'balance_test_02_player_play.png', fullPage: true });
        }
    }
    
    // AIとプレイヤーの協調観測
    console.log('👀 AI-プレイヤー協調観測（12秒間）');
    await page.waitForTimeout(12000);
    
    await page.screenshot({ path: 'balance_test_03_balanced_play.png', fullPage: true });
    
    // さらに少しプレイヤー操作
    console.log('🎮 追加プレイヤー操作');
    for (let i = 0; i < 3; i++) {
        await page.keyboard.press('d');
        await page.waitForTimeout(80);
        await page.keyboard.press('s');
        await page.waitForTimeout(250);
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'balance_test_04_final.png', fullPage: true });
    
    console.log('\\n=== バランステスト結果 ===');
    console.log(`プレイヤー配置: ${playerActions}`);
    console.log(`AI配置: ${aiActions}`);
    console.log(`プレイヤー高速落下: ${playerFastDrops}`);
    console.log(`AI操作回数: ${aiOperations}`);
    
    const ratio = aiActions > 0 ? (playerActions / aiActions).toFixed(2) : 'N/A';
    console.log(`\\n速度バランス比: ${ratio}`);
    
    if (parseFloat(ratio) >= 0.6 && parseFloat(ratio) <= 1.4) {
        console.log('✅ 理想的なバランス！');
    } else if (parseFloat(ratio) >= 0.4 && parseFloat(ratio) <= 1.8) {
        console.log('🔶 良好なバランス');
    } else {
        console.log('⚠️ バランス要調整');
    }
    
    await browser.close();
})();