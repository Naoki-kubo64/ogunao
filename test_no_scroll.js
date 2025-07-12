const { chromium } = require('playwright');

async function testNoScroll() {
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
        
        console.log('Initial no-scroll screenshot...');
        await page.screenshot({ path: 'title_no_scroll_initial.png', fullPage: true });
        
        // ページサイズを確認
        const pageSize = await page.evaluate(() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                scrollHeight: document.documentElement.scrollHeight,
                clientWidth: document.documentElement.clientWidth,
                clientHeight: document.documentElement.clientHeight,
                bodyOverflow: window.getComputedStyle(document.body).overflow,
                htmlOverflow: window.getComputedStyle(document.documentElement).overflow
            };
        });
        
        console.log('Page dimensions:', pageSize);
        
        // スクロール可能性をテスト
        const scrollResult = await page.evaluate(() => {
            const oldScrollTop = window.scrollY;
            const oldScrollLeft = window.scrollX;
            
            // スクロールを試行
            window.scrollTo(0, 100);
            const newScrollTop = window.scrollY;
            
            window.scrollTo(100, 0);
            const newScrollLeft = window.scrollX;
            
            // 元の位置に戻す
            window.scrollTo(oldScrollLeft, oldScrollTop);
            
            return {
                verticalScrolled: newScrollTop !== oldScrollTop,
                horizontalScrolled: newScrollLeft !== oldScrollLeft,
                canScroll: newScrollTop > 0 || newScrollLeft > 0
            };
        });
        
        console.log('Scroll test result:', scrollResult);
        
        // タイトル要素の位置確認
        const titleElement = await page.$('.game-title');
        if (titleElement) {
            const titleBox = await titleElement.boundingBox();
            console.log('Title position (should be positive):', titleBox);
        }
        
        // メインメニューからモード選択への切り替えテスト
        await page.click('#start-game-btn');
        await page.waitForTimeout(1000);
        
        console.log('Mode selection screenshot...');
        await page.screenshot({ path: 'title_no_scroll_mode_selection.png', fullPage: true });
        
        // モード選択画面でのサイズ確認
        const modePageSize = await page.evaluate(() => {
            return {
                scrollWidth: document.documentElement.scrollWidth,
                scrollHeight: document.documentElement.scrollHeight,
                clientWidth: document.documentElement.clientWidth,
                clientHeight: document.documentElement.clientHeight
            };
        });
        
        console.log('Mode selection page dimensions:', modePageSize);
        
        if (!scrollResult.canScroll) {
            console.log('✅ SUCCESS: Page is properly configured with no scrolling');
        } else {
            console.log('❌ WARNING: Page can still be scrolled');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testNoScroll();