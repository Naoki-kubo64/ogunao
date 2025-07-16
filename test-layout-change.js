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
        console.log('🎯 横長レイアウトテスト開始');
        console.log('=======================');
        
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
        
        // Take screenshot to show the horizontal layout
        console.log('2. 横長レイアウトのスクリーンショットを撮影');
        await page.screenshot({ path: 'ScreenShots/horizontal-layout-test.png' });
        
        // Check if the layout is horizontal
        const statusRect = await page.evaluate(() => {
            const statusElement = document.querySelector('.map-player-status');
            if (statusElement) {
                const rect = statusElement.getBoundingClientRect();
                return {
                    width: rect.width,
                    height: rect.height,
                    ratio: rect.width / rect.height
                };
            }
            return null;
        });
        
        console.log('3. レイアウト測定結果:');
        if (statusRect) {
            console.log(`   幅: ${statusRect.width}px`);
            console.log(`   高さ: ${statusRect.height}px`);
            console.log(`   幅/高さ比: ${statusRect.ratio.toFixed(2)}`);
            
            if (statusRect.ratio > 2.5) {
                console.log('   ✅ 横長レイアウト成功！');
            } else {
                console.log('   ⚠️ まだ縦長気味です');
            }
        }
        
        console.log('');
        console.log('🎉 横長レイアウトテスト完了！');
        console.log('📁 スクリーンショットは ScreenShots/ フォルダに保存されました');
        
    } catch (error) {
        console.error('エラー:', error);
        await page.screenshot({ path: 'ScreenShots/horizontal-layout-error.png' });
    } finally {
        await browser.close();
    }
})();