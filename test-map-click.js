const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1500,
        args: ['--no-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    try {
        console.log('🎮 マップアイコンクリックテスト開始');
        await page.goto(`file://${process.cwd()}/index.html`);
        await page.waitForTimeout(3000);
        
        // Story mode
        console.log('1. ストーリーモードボタンをクリック');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(2000);
        
        console.log('2. NEW GAMEをクリック');
        await page.click('#story-new-game');
        await page.waitForTimeout(2000);
        
        console.log('3. 中央のパスを選択');
        await page.click('#path-center');
        await page.waitForTimeout(3000);
        
        console.log('4. マップが表示されているか確認');
        const mapVisible = await page.locator('#story-map-screen').isVisible();
        console.log('   マップ表示:', mapVisible);
        
        // HPとアイテム情報の表示位置を確認
        console.log('5. プレイヤーステータス表示を確認');
        const playerStatus = await page.locator('#player-status');
        if (await playerStatus.isVisible()) {
            const bbox = await playerStatus.boundingBox();
            console.log('   プレイヤーステータス位置:', bbox);
        }
        
        // 「冒険マップ」テキストの位置を確認
        console.log('6. 冒険マップテキストの位置を確認');
        const adventureMapText = await page.locator('.map-title');
        if (await adventureMapText.isVisible()) {
            const bbox = await adventureMapText.boundingBox();
            console.log('   冒険マップテキスト位置:', bbox);
        }
        
        // マップアイコンを探してクリック
        console.log('7. マップアイコンクリックテスト');
        const mapCanvas = await page.locator('#story-map-canvas');
        if (await mapCanvas.isVisible()) {
            console.log('   マップキャンバスが見つかりました');
            
            // キャンバスの中央付近をクリック
            const bbox = await mapCanvas.boundingBox();
            console.log('   キャンバスサイズ:', bbox);
            
            // いくつかの位置をクリックしてみる
            const testPoints = [
                { x: bbox.x + bbox.width * 0.5, y: bbox.y + bbox.height * 0.3 },
                { x: bbox.x + bbox.width * 0.4, y: bbox.y + bbox.height * 0.4 },
                { x: bbox.x + bbox.width * 0.6, y: bbox.y + bbox.height * 0.4 },
                { x: bbox.x + bbox.width * 0.5, y: bbox.y + bbox.height * 0.5 },
            ];
            
            for (let i = 0; i < testPoints.length; i++) {
                const point = testPoints[i];
                console.log(`   テスト点 ${i + 1}: (${point.x}, ${point.y}) をクリック`);
                await page.mouse.click(point.x, point.y);
                await page.waitForTimeout(2000);
            }
        }
        
        await page.screenshot({ path: 'test_map_click_final.png' });
        
    } catch (error) {
        console.error('Error:', error);
        await page.screenshot({ path: 'test_map_click_error.png' });
    } finally {
        await browser.close();
    }
})();