const { chromium } = require('playwright');

async function checkBattleScreen() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('📸 タイトル画面のスクリーンショット撮影中...');
        await page.screenshot({ path: 'title_screen.png' });
        
        console.log('🎮 対戦モードボタンをクリック...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(3000);
        
        console.log('📸 対戦モード画面のスクリーンショット撮影中...');
        await page.screenshot({ path: 'battle_mode_screen.png' });
        
        console.log('✅ スクリーンショット完了:');
        console.log('  - title_screen.png (タイトル画面)');
        console.log('  - battle_mode_screen.png (対戦モード画面)');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

checkBattleScreen().catch(console.error);