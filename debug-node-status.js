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
        console.log('🔍 ノード状態デバッグ開始');
        await page.goto(`file://${process.cwd()}/index.html`);
        await page.waitForTimeout(3000);
        
        // Story mode setup
        await page.click('#story-mode-btn');
        await page.waitForTimeout(1000);
        await page.click('#story-new-game');
        await page.waitForTimeout(1000);
        await page.click('#path-center');
        await page.waitForTimeout(2000);
        
        // マップデータの状態を確認
        const nodeStates = await page.evaluate(() => {
            if (window.storyMode && window.storyMode.mapData) {
                return window.storyMode.mapData.floors.map((floor, floorIndex) => {
                    return floor.map(node => ({
                        floor: floorIndex,
                        id: node.id,
                        type: node.type,
                        available: node.available,
                        completed: node.completed,
                        isCurrentPosition: window.storyMode.currentMapPosition && 
                                         window.storyMode.currentMapPosition.nodeId === node.id
                    }));
                });
            }
            return null;
        });
        
        console.log('📍 マップノード状態:');
        if (nodeStates) {
            nodeStates.forEach((floor, floorIndex) => {
                console.log(`フロア ${floorIndex}:`);
                floor.forEach(node => {
                    console.log(`  ノード ${node.id}: type=${node.type}, available=${node.available}, completed=${node.completed}, current=${node.isCurrentPosition}`);
                });
            });
        }
        
        await page.screenshot({ path: 'debug_node_status.png' });
        
    } catch (error) {
        console.error('Error:', error);
        await page.screenshot({ path: 'debug_node_status_error.png' });
    } finally {
        await browser.close();
    }
})();