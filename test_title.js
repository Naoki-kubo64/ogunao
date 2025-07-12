const { chromium } = require('playwright');

async function testTitleScreen() {
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
        
        // スクリーンショットを撮影
        await page.screenshot({ path: 'title_screen_current.png', fullPage: true });
        console.log('Screenshot saved: title_screen_current.png');
        
        // タイトル画面の要素をチェック
        const titleElement = await page.$('.game-title');
        if (titleElement) {
            const titleBox = await titleElement.boundingBox();
            console.log('Title position:', titleBox);
        }
        
        const menuItems = await page.$$('.menu-item');
        console.log('Menu items found:', menuItems.length);
        
        for (let i = 0; i < menuItems.length; i++) {
            const box = await menuItems[i].boundingBox();
            const text = await menuItems[i].textContent();
            console.log(`Menu ${i}: ${text} at`, box);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testTitleScreen();