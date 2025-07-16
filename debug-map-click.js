const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🔍 マップクリック問題の診断テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // エラー監視
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('マップ') || text.includes('クリック') || text.includes('戦闘') || text.includes('敵')) {
            console.log(`🎮 [GAME] ${text}`);
        }
        if (text.includes('Error') || text.includes('error')) {
            console.log(`❌ [ERROR] ${text}`);
        }
    });
    
    page.on('pageerror', error => {
        console.log(`💥 JavaScript Error: ${error.message}`);
    });
    
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(2000);
    
    console.log('📖 ストーリーモード開始');
    await page.click('#story-mode-btn');
    await page.waitForTimeout(3000);
    
    // マップ状態確認
    const mapState = await page.evaluate(() => {
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            const story = window.gameModeManager.storyMode;
            return {
                mapExists: !!story.mapData,
                startNodeAvailable: story.mapData && story.mapData.floors[0] && story.mapData.floors[0][0] ? story.mapData.floors[0][0].available : false,
                firstFloorNodeCount: story.mapData && story.mapData.floors[1] ? story.mapData.floors[1].length : 0
            };
        }
        return null;
    });
    
    console.log('マップ状態:', mapState);
    
    // スタートノードクリック
    console.log('🏠 スタートノードクリック');
    await page.evaluate(() => {
        const startNode = document.querySelector('[data-node-id="floor_0_node_0"]');
        if (startNode) {
            console.log('スタートノード要素発見:', startNode);
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            startNode.dispatchEvent(clickEvent);
        } else {
            console.log('❌ スタートノード要素が見つかりません');
        }
    });
    
    await page.waitForTimeout(2000);
    
    // 次のフロアのノード確認
    const nextFloorNodes = await page.evaluate(() => {
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            const story = window.gameModeManager.storyMode;
            const available = [];
            if (story.mapData && story.mapData.floors[1]) {
                story.mapData.floors[1].forEach(node => {
                    available.push({
                        id: node.id,
                        type: node.type,
                        available: node.available,
                        completed: node.completed,
                        x: node.x,
                        y: node.y
                    });
                });
            }
            return available;
        }
        return [];
    });
    
    console.log('次のフロアのノード:', nextFloorNodes);
    
    // 利用可能な敵ノードをクリック
    const availableEnemyNode = nextFloorNodes.find(node => node.available && (node.type === 'enemy' || node.type === 'elite'));
    if (availableEnemyNode) {
        console.log('⚔️ 敵ノードをクリック:', availableEnemyNode.id);
        
        await page.evaluate((nodeId) => {
            const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
            console.log('ノード要素:', nodeElement);
            if (nodeElement) {
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                nodeElement.dispatchEvent(clickEvent);
            } else {
                console.log('❌ ノード要素が見つかりません:', nodeId);
            }
        }, availableEnemyNode.id);
        
        await page.waitForTimeout(3000);
        
        // 戦闘画面遷移確認
        const battleResult = await page.evaluate(() => {
            const storyScreen = document.getElementById('story-screen');
            const mapScreen = document.getElementById('story-map-screen');
            
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                return {
                    gameState: story.gameState,
                    storyVisible: storyScreen ? !storyScreen.classList.contains('hidden') : false,
                    mapVisible: mapScreen ? !mapScreen.classList.contains('hidden') : false,
                    currentEnemy: story.currentEnemy ? story.currentEnemy.name : 'none',
                    gameRunning: story.gameRunning
                };
            }
            return null;
        });
        
        console.log('戦闘結果:', battleResult);
        
    } else {
        console.log('❌ 利用可能な敵ノードが見つかりません');
    }
    
    await page.screenshot({ path: 'debug_map_click.png' });
    await browser.close();
})();