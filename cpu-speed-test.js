const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🚀 CPU速度向上テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let playerActions = 0;
    let cpuActions = 0;
    let cpuOperations = 0;
    let playerOperations = 0;
    
    const startTime = Date.now();
    
    // 操作をカウント
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('📍 ぷよ配置完了')) {
            playerActions++;
            if (playerActions <= 5) console.log(`[プレイヤー配置 ${playerActions}] 完了`);
        }
        if (text.includes('🤖 敵ぷよ配置完了')) {
            cpuActions++;
            if (cpuActions <= 10) console.log(`[CPU配置 ${cpuActions}] 完了`);
        }
        if (text.includes('🤖 AI:') && (text.includes('A (左移動)') || text.includes('D (右移動)') || text.includes('S ('))) {
            cpuOperations++;
        }
        if (text.includes('⬇️ プレイヤー高速落下')) {
            playerOperations++;
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
    console.log('⚔️ CPU速度テスト戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'cpu_speed_01_start.png', fullPage: true });
    
    // CPU動作観測（前半10秒）
    console.log('📊 CPU高速動作観測（10秒間）');
    await page.waitForTimeout(10000);
    
    const midActions = cpuActions;
    await page.screenshot({ path: 'cpu_speed_02_mid_observation.png', fullPage: true });
    
    // プレイヤーも少し操作
    console.log('🎮 プレイヤー操作でバランス確認');
    for (let i = 0; i < 4; i++) {
        await page.keyboard.press('d');
        await page.waitForTimeout(100);
        await page.keyboard.press('s');
        await page.waitForTimeout(300);
    }
    
    // さらにCPU観測（後半8秒）
    console.log('📈 CPU動作継続観測（8秒間）');
    await page.waitForTimeout(8000);
    
    await page.screenshot({ path: 'cpu_speed_03_final.png', fullPage: true });
    
    const testDuration = (Date.now() - startTime) / 1000;
    
    console.log('\\n=== CPU速度テスト結果 ===');
    console.log(`テスト時間: ${testDuration.toFixed(1)}秒`);
    console.log(`CPU配置回数: ${cpuActions}`);
    console.log(`プレイヤー配置回数: ${playerActions}`);
    console.log(`CPU操作回数: ${cpuOperations}`);
    console.log(`プレイヤー操作回数: ${playerOperations}`);
    
    const cpuRate = (cpuActions / testDuration).toFixed(2);
    const playerRate = playerActions > 0 ? (playerActions / testDuration).toFixed(2) : '0.00';
    
    console.log('\\n=== 速度分析 ===');
    console.log(`CPU配置レート: ${cpuRate} 回/秒`);
    console.log(`プレイヤー配置レート: ${playerRate} 回/秒`);
    
    if (parseFloat(cpuRate) >= 0.8) {
        console.log('✅ CPU速度: 高速・活発');
    } else if (parseFloat(cpuRate) >= 0.5) {
        console.log('🔶 CPU速度: 適度');
    } else {
        console.log('⚠️ CPU速度: やや低速');
    }
    
    const ratio = playerActions > 0 ? (cpuActions / playerActions).toFixed(2) : 'N/A';
    console.log(`CPU/プレイヤー比率: ${ratio}`);
    
    await browser.close();
})();