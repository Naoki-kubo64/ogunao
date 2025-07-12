const { chromium } = require('playwright');

async function testMenuInteraction() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        // HTMLファイルを直接開く
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        
        // ページが読み込まれるまで少し待つ
        await page.waitForTimeout(2000);
        
        console.log('Initial screenshot...');
        await page.screenshot({ path: 'title_screen_initial.png', fullPage: true });
        
        // ゲームスタートボタンをクリック
        await page.click('#start-game-btn');
        await page.waitForTimeout(1000);
        
        console.log('After clicking start game...');
        await page.screenshot({ path: 'title_screen_mode_selection.png', fullPage: true });
        
        // メインメニューに戻るボタンをクリック
        await page.click('#back-to-main-menu');
        await page.waitForTimeout(1000);
        
        console.log('Back to main menu...');
        await page.screenshot({ path: 'title_screen_back_to_main.png', fullPage: true });
        
        // ルール説明ボタンをクリック
        await page.click('#rules-btn');
        await page.waitForTimeout(1000);
        
        console.log('Rules modal opened...');
        await page.screenshot({ path: 'title_screen_rules_modal.png', fullPage: true });
        
        console.log('All menu interactions tested successfully!');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testMenuInteraction();