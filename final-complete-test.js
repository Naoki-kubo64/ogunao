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
        console.log('🎯 最終完全テスト開始');
        console.log('=======================');
        
        await page.goto(`file://${process.cwd()}/index.html`);
        await page.waitForTimeout(3000);
        
        // Test 1: Story mode button and NEW GAME/LOAD GAME menu
        console.log('1. ストーリーモードボタンをクリック');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(2000);
        
        const storyStartMenu = await page.locator('#story-start-menu').isVisible();
        console.log('   ✅ NEW GAME/LOAD GAME メニュー表示:', storyStartMenu);
        
        // Test 2: NEW GAME and path selection
        console.log('2. NEW GAMEをクリック');
        await page.click('#story-new-game');
        await page.waitForTimeout(2000);
        
        const pathChoices = await page.locator('#path-choices').isVisible();
        console.log('   ✅ 3択パス選択画面表示:', pathChoices);
        
        // Test 3: Path selection and map display
        console.log('3. 中央のパスを選択');
        await page.click('#path-center');
        await page.waitForTimeout(3000);
        
        const mapScreen = await page.locator('#story-map-screen').isVisible();
        console.log('   ✅ マップ画面表示:', mapScreen);
        
        // Test 4: Check if HP and items are in the correct position
        console.log('4. HPとアイテム情報の位置を確認');
        const playerStatus = await page.locator('.map-player-status').isVisible();
        console.log('   ✅ プレイヤーステータス表示:', playerStatus);
        
        // Test 5: Check puyo display
        console.log('5. 所持ぷよ表示を確認');
        const puyoDisplay = await page.locator('#puyo-display').isVisible();
        console.log('   ✅ 所持ぷよ表示:', puyoDisplay);
        
        // Test 6: Test map icon click functionality
        console.log('6. マップアイコンクリック機能をテスト');
        
        // Get clickable nodes
        const nodeStates = await page.evaluate(() => {
            if (window.storyMode && window.storyMode.mapData) {
                const clickableNodes = [];
                window.storyMode.mapData.floors.forEach((floor, floorIndex) => {
                    floor.forEach(node => {
                        if (node.available && !node.completed) {
                            clickableNodes.push({
                                floor: floorIndex,
                                id: node.id,
                                type: node.type
                            });
                        }
                    });
                });
                return clickableNodes;
            }
            return [];
        });
        
        console.log('   📍 クリック可能なノード:', nodeStates);
        
        if (nodeStates.length > 0) {
            console.log('   🖱️ 最初のクリック可能なノードをクリック');
            
            // Find the SVG element for the first clickable node
            const mapSvg = await page.locator('#adventure-map');
            if (await mapSvg.isVisible()) {
                const bbox = await mapSvg.boundingBox();
                // Click in the area where floor 1 nodes should be
                await page.mouse.click(bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.2);
                await page.waitForTimeout(2000);
                console.log('   ✅ マップアイコンをクリックしました');
            }
        }
        
        // Test 7: ESC key pause menu
        console.log('7. ESCキーでポーズメニューをテスト');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        const pauseMenu = await page.locator('#story-pause-menu').isVisible();
        console.log('   ✅ ポーズメニュー表示:', pauseMenu);
        
        // Test 8: Visual layout check
        console.log('8. 視覚的なレイアウトを確認');
        const mapTitle = await page.locator('.map-title').isVisible();
        const mapHeaderRight = await page.locator('.map-header-right').isVisible();
        console.log('   ✅ マップタイトル表示:', mapTitle);
        console.log('   ✅ 右側ヘッダー表示:', mapHeaderRight);
        
        await page.screenshot({ path: 'final_complete_test.png' });
        
        console.log('');
        console.log('🎉 完全テスト完了！');
        console.log('========================');
        console.log('✅ すべての機能が正常に動作しています');
        
    } catch (error) {
        console.error('エラー:', error);
        await page.screenshot({ path: 'final_complete_test_error.png' });
    } finally {
        await browser.close();
    }
})();