const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🧠 賢いAIテスト - 絶対に死なない戦略確認');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let aiSafeActions = 0;
    let aiEmergencyActions = 0;
    let aiChainFires = 0;
    let aiDeaths = 0;
    
    // AI行動を詳細監視
    page.on('console', msg => {
        const text = msg.text();
        
        // 安全構築
        if (text.includes('🏗️ 安全構築')) {
            aiSafeActions++;
            console.log(`[AI安全行動 ${aiSafeActions}] ${text}`);
        }
        
        // 緊急回避
        if (text.includes('🚨 超緊急') || text.includes('⚠️ 緊急回避') || text.includes('📊 予防発火')) {
            aiEmergencyActions++;
            console.log(`[AI緊急回避 ${aiEmergencyActions}] ${text}`);
        }
        
        // 連鎖発火
        if (text.includes('🔥') && text.includes('連鎖')) {
            aiChainFires++;
            console.log(`[AI連鎖発火 ${aiChainFires}] ${text}`);
        }
        
        // 高さバランス
        if (text.includes('高さバランス配置')) {
            console.log(`[AI高さ管理] ${text}`);
        }
        
        // 死亡監視（ゲームオーバー判定）
        if (text.includes('Game Over') || text.includes('敗北')) {
            aiDeaths++;
            console.log(`❌ [AI死亡 ${aiDeaths}] ゲームオーバー`);
        }
    });
    
    // 戦闘開始
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(1500);
    
    await page.click('#story-mode-btn');
    await page.waitForTimeout(1000);
    await page.click('#start-battle-btn');
    await page.waitForTimeout(1000);
    
    console.log('🧠 賢いAI行動観測開始（20秒間）');
    
    // 初期状態
    await page.screenshot({ path: 'smart_ai_01_start.png', fullPage: true });
    
    // 長期観測（AIが賢く行動するか確認）
    await page.waitForTimeout(20000);
    
    await page.screenshot({ path: 'smart_ai_02_long_term.png', fullPage: true });
    
    // プレイヤーがプレッシャーをかける
    console.log('🎮 プレイヤープレッシャーテスト');
    for (let i = 0; i < 5; i++) {
        await page.keyboard.press('s');
        await page.waitForTimeout(300);
    }
    
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'smart_ai_03_under_pressure.png', fullPage: true });
    
    console.log('\\n=== 賢いAI評価結果 ===');
    console.log(`AI安全行動回数: ${aiSafeActions}`);
    console.log(`AI緊急回避回数: ${aiEmergencyActions}`);
    console.log(`AI連鎖発火回数: ${aiChainFires}`);
    console.log(`AI死亡回数: ${aiDeaths}`);
    
    console.log('\\n=== AI知性評価 ===');
    
    if (aiDeaths === 0) {
        console.log('✅ 生存能力: 完璧！絶対に死なない');
    } else {
        console.log('❌ 生存能力: 要改善');
    }
    
    if (aiEmergencyActions >= 2) {
        console.log('✅ 危機管理: 優秀な緊急回避');
    } else if (aiEmergencyActions >= 1) {
        console.log('🔶 危機管理: 基本的な回避能力');
    } else {
        console.log('⚠️ 危機管理: 改善必要');
    }
    
    if (aiChainFires >= 3) {
        console.log('✅ 攻撃性: 積極的な連鎖発火');
    } else if (aiChainFires >= 1) {
        console.log('🔶 攻撃性: 適度な連鎖発火');
    } else {
        console.log('⚠️ 攻撃性: 消極的');
    }
    
    const totalIntelligentActions = aiSafeActions + aiEmergencyActions + aiChainFires;
    if (totalIntelligentActions >= 8) {
        console.log('🧠 総合評価: 非常に賢いAI');
    } else if (totalIntelligentActions >= 4) {
        console.log('🧠 総合評価: 賢いAI');
    } else {
        console.log('🧠 総合評価: 改善が必要');
    }
    
    await browser.close();
})();