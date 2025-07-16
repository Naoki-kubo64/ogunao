const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('⚔️ 戦闘遷移テスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // エラー監視
    page.on('console', msg => {
        const text = msg.text();
        console.log(`🎮 [CONSOLE] ${text}`);
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
    
    // スタートノードをクリック
    console.log('🏠 スタートノードクリック');
    await page.evaluate(() => {
        const startNode = document.querySelector('[data-node-id="floor_0_node_0"]');
        if (startNode) {
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            startNode.dispatchEvent(clickEvent);
        }
    });
    
    await page.waitForTimeout(2000);
    
    // 敵ノードを取得
    const enemyNode = await page.evaluate(() => {
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            const story = window.gameModeManager.storyMode;
            if (story.mapData && story.mapData.floors[1]) {
                const enemyNode = story.mapData.floors[1].find(node => 
                    node.available && (node.type === 'enemy' || node.type === 'elite')
                );
                return enemyNode ? enemyNode.id : null;
            }
        }
        return null;
    });
    
    if (enemyNode) {
        console.log('⚔️ 敵ノードクリック:', enemyNode);
        
        await page.evaluate((nodeId) => {
            const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
            if (nodeElement) {
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                nodeElement.dispatchEvent(clickEvent);
            }
        }, enemyNode);
        
        // 複数のタイミングで状態をチェック
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(500);
            
            const state = await page.evaluate(() => {
                const storyScreen = document.getElementById('story-screen');
                const mapScreen = document.getElementById('story-map-screen');
                
                if (window.gameModeManager && window.gameModeManager.storyMode) {
                    const story = window.gameModeManager.storyMode;
                    return {
                        time: i * 500,
                        gameState: story.gameState,
                        storyVisible: storyScreen ? !storyScreen.classList.contains('hidden') : false,
                        mapVisible: mapScreen ? !mapScreen.classList.contains('hidden') : false,
                        storyClass: storyScreen ? storyScreen.className : 'none',
                        mapClass: mapScreen ? mapScreen.className : 'none'
                    };
                }
                return null;
            });
            
            console.log(`${state.time}ms: Story=${state.storyVisible}, Map=${state.mapVisible}, State=${state.gameState}`);
            
            if (state.storyVisible) {
                console.log('✅ 戦闘画面表示確認');
                break;
            }
        }
    } else {
        console.log('❌ 敵ノードが見つかりません');
    }
    
    await page.screenshot({ path: 'battle_transition_test.png' });
    await browser.close();
})();