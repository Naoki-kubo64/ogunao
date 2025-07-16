const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🚀 プレイヤー速度改善テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let playerFastDrops = 0;
    let playerPlacements = 0;
    let aiPlacements = 0;
    
    // プレイヤーとAI操作をカウント
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('🚀 プレイヤー高速落下')) {
            playerFastDrops++;
            console.log(`[プレイヤー高速落下 ${playerFastDrops}] ${text}`);
        }
        if (text.includes('📍 ぷよ配置完了')) {
            playerPlacements++;
            console.log(`[プレイヤー配置 ${playerPlacements}] ${text}`);
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
    console.log('⚔️ プレイヤー速度テスト戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'player_speed_01_start.png', fullPage: true });
    
    // プレイヤーの高速連続操作
    console.log('🚀 プレイヤー高速連続操作テスト（Sキー連打）');
    for (let i = 0; i < 8; i++) {
        // A/D キーで位置調整してからSキー
        if (i % 2 === 0) {
            await page.keyboard.press('d');
            await page.waitForTimeout(20);
        } else {
            await page.keyboard.press('a');
            await page.waitForTimeout(20);
        }
        await page.keyboard.press('s'); // 高速落下
        await page.waitForTimeout(150); // 短間隔
        
        if (i === 3) {
            await page.screenshot({ path: 'player_speed_02_rapid_drops.png', fullPage: true });
        }
    }
    
    // AIとの比較観測
    console.log('⚖️ AI-プレイヤー速度比較観測（10秒間）');
    await page.waitForTimeout(10000);
    
    await page.screenshot({ path: 'player_speed_03_comparison.png', fullPage: true });
    
    // さらに高速操作
    console.log('⚡ 最高速プレイヤー操作');
    for (let i = 0; i < 5; i++) {
        await page.keyboard.press('d');
        await page.waitForTimeout(10);
        await page.keyboard.press('s');
        await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'player_speed_04_final.png', fullPage: true });
    
    console.log('\\n=== プレイヤー速度テスト結果 ===');
    console.log(`プレイヤー高速落下回数: ${playerFastDrops}`);
    console.log(`プレイヤー配置回数: ${playerPlacements}`);
    console.log(`AI配置回数: ${aiPlacements}`);
    
    const playerToAiRatio = aiPlacements > 0 ? (playerPlacements / aiPlacements).toFixed(2) : 'N/A';
    console.log(`プレイヤー/AI速度比: ${playerToAiRatio}`);
    
    if (parseFloat(playerToAiRatio) >= 0.5) {
        console.log('✅ プレイヤー速度が大幅改善！');
    } else if (parseFloat(playerToAiRatio) >= 0.3) {
        console.log('🔶 プレイヤー速度が改善');
    } else {
        console.log('❌ プレイヤー速度がまだ遅い');
    }
    
    await browser.close();
})();