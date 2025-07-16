const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('⚡ CPU速度向上確認テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let cpuActions = 0;
    let cpuOperations = 0;
    let playerActions = 0;
    
    // 操作カウント
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('🤖 敵ぷよ配置完了')) {
            cpuActions++;
            if (cpuActions <= 8) console.log(`[CPU配置 ${cpuActions}]`);
        }
        if (text.includes('🤖 AI:') && (text.includes('移動') || text.includes('S ('))) {
            cpuOperations++;
        }
        if (text.includes('📍 ぷよ配置完了')) {
            playerActions++;
            console.log(`[プレイヤー配置 ${playerActions}]`);
        }
    });
    
    // HTMLファイルを開く
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(1500);
    
    // 戦闘開始
    console.log('🎮 高速CPUテスト開始');
    await page.click('#story-mode-btn');
    await page.waitForTimeout(800);
    await page.click('#start-battle-btn');
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    // CPU活動観測（8秒）
    console.log('🚀 CPU高速活動観測（8秒間）');
    await page.waitForTimeout(8000);
    
    await page.screenshot({ path: 'quick_cpu_01_active.png', fullPage: true });
    
    // プレイヤー操作比較
    console.log('🎮 プレイヤー操作比較');
    for (let i = 0; i < 3; i++) {
        await page.keyboard.press('s');
        await page.waitForTimeout(200);
        await page.keyboard.press('s');
        await page.waitForTimeout(200);
    }
    
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'quick_cpu_02_final.png', fullPage: true });
    
    const duration = (Date.now() - startTime) / 1000;
    
    console.log('\\n=== 高速CPU結果 ===');
    console.log(`CPU配置: ${cpuActions} 回 (${duration.toFixed(1)}秒)`);
    console.log(`CPU操作: ${cpuOperations} 回`);
    console.log(`プレイヤー配置: ${playerActions} 回`);
    
    const cpuRate = (cpuActions / duration).toFixed(2);
    console.log(`CPU配置レート: ${cpuRate} 回/秒`);
    
    if (parseFloat(cpuRate) >= 1.0) {
        console.log('✅ CPU速度: 高速・良好！');
    } else if (parseFloat(cpuRate) >= 0.6) {
        console.log('🔶 CPU速度: 適度・改善済み');
    } else {
        console.log('⚠️ CPU速度: 要追加調整');
    }
    
    await browser.close();
})();