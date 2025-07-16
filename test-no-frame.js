const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000,
        args: ['--no-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    try {
        console.log('🎯 枠なしマップレイアウトテスト開始');
        console.log('================================');
        
        await page.goto(`file://${process.cwd()}/index.html`);
        await page.waitForTimeout(3000);
        
        // Navigate to story mode
        console.log('1. ストーリーモードに移動');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(1000);
        
        await page.click('#story-new-game');
        await page.waitForTimeout(1000);
        
        await page.click('#path-center');
        await page.waitForTimeout(3000);
        
        // Take screenshot to show the frameless layout
        console.log('2. 枠なしレイアウトのスクリーンショットを撮影');
        await page.screenshot({ path: 'ScreenShots/frameless-map-layout.png' });
        
        // Check if the map is fully visible
        const mapRect = await page.evaluate(() => {
            const mapElement = document.querySelector('#adventure-map');
            const headerElement = document.querySelector('.map-header');
            
            if (mapElement && headerElement) {
                const mapRect = mapElement.getBoundingClientRect();
                const headerRect = headerElement.getBoundingClientRect();
                
                return {
                    mapTop: mapRect.top,
                    mapBottom: mapRect.bottom,
                    mapHeight: mapRect.height,
                    headerTop: headerRect.top,
                    headerBottom: headerRect.bottom,
                    headerHeight: headerRect.height,
                    overlap: Math.max(0, headerRect.bottom - mapRect.top),
                    mapVisible: mapRect.top >= headerRect.bottom
                };
            }
            return null;
        });
        
        console.log('3. マップ表示結果:');
        if (mapRect) {
            console.log(`   マップ上端: ${mapRect.mapTop}px`);
            console.log(`   ヘッダー下端: ${mapRect.headerBottom}px`);
            console.log(`   重複: ${mapRect.overlap}px`);
            console.log(`   マップ完全表示: ${mapRect.mapVisible}`);
            
            if (mapRect.mapVisible) {
                console.log('   ✅ マップが完全に表示されています！');
            } else {
                console.log('   ⚠️ まだマップとヘッダーが重複しています');
            }
        }
        
        console.log('');
        console.log('🎉 枠なしマップレイアウトテスト完了！');
        console.log('📁 スクリーンショットは ScreenShots/ フォルダに保存されました');
        
    } catch (error) {
        console.error('エラー:', error);
        await page.screenshot({ path: 'ScreenShots/frameless-map-error.png' });
    } finally {
        await browser.close();
    }
})();