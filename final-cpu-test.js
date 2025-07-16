const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🏁 最終CPU速度テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let cpuActions = 0;
    let playerActions = 0;
    
    // 配置カウント
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('🤖 敵ぷよ配置完了')) {
            cpuActions++;
            console.log(`[CPU配置 ${cpuActions}]`);
        }
        if (text.includes('📍 ぷよ配置完了')) {
            playerActions++;
            console.log(`[プレイヤー配置 ${playerActions}]`);
        }
    });
    
    // 戦闘開始
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(1500);
    
    await page.click('#story-mode-btn');
    await page.waitForTimeout(800);
    await page.click('#start-battle-btn');
    await page.waitForTimeout(1000);
    
    console.log('⚡ 最終CPU性能確認（12秒間）');
    const startTime = Date.now();
    await page.waitForTimeout(12000);
    
    await page.screenshot({ path: 'final_cpu_test.png', fullPage: true });
    
    const duration = (Date.now() - startTime) / 1000;
    const cpuRate = (cpuActions / duration).toFixed(2);
    
    console.log('\\n=== 最終結果 ===');
    console.log(`テスト時間: ${duration.toFixed(1)}秒`);
    console.log(`CPU配置: ${cpuActions} 回`);
    console.log(`CPU配置レート: ${cpuRate} 回/秒`);
    
    if (parseFloat(cpuRate) >= 0.8) {
        console.log('🎉 CPU速度: 高速・完璧！');
    } else if (parseFloat(cpuRate) >= 0.5) {
        console.log('✅ CPU速度: 良好・改善済み');
    } else {
        console.log('⚠️ CPU速度: 改善必要');
    }
    
    await browser.close();
})();