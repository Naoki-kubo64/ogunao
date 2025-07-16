const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🗺️ マップ改善テスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // エラー監視
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('error')) {
            console.log(`❌ [ERROR] ${text}`);
        } else if (text.includes('マップ') || text.includes('Map') || text.includes('冒険')) {
            console.log(`🎮 [GAME] ${text}`);
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
    
    // 直接マップ画面に遷移するかチェック
    const mapVisible = await page.evaluate(() => {
        const map = document.getElementById('story-map-screen');
        return map && !map.classList.contains('hidden');
    });
    
    console.log('1. 直接マップ画面に遷移:', mapVisible ? '✅' : '❌');
    
    if (mapVisible) {
        // マップ構造の確認
        const mapStructure = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                if (story.mapData) {
                    const firstFloorNodes = story.mapData.floors[1] ? story.mapData.floors[1].length : 0;
                    const totalFloors = story.mapData.floors.length;
                    return {
                        totalFloors,
                        firstFloorNodes,
                        totalConnections: story.mapData.connections.length
                    };
                }
            }
            return null;
        });
        
        console.log('2. マップ構造:', mapStructure);
        console.log('   - 最初の選択肢が3つ:', mapStructure.firstFloorNodes === 3 ? '✅' : '❌');
        console.log('   - 15フロア生成:', mapStructure.totalFloors === 15 ? '✅' : '❌');
        
        // プレイヤーステータス表示確認
        const statusDisplayed = await page.evaluate(() => {
            const hp = document.getElementById('map-player-hp');
            const gold = document.getElementById('map-player-gold');
            const potions = document.getElementById('map-player-potions');
            const equipment = document.getElementById('map-player-equipment');
            
            return {
                hp: hp ? hp.textContent : null,
                gold: gold ? gold.textContent : null,
                potions: potions ? potions.textContent : null,
                equipment: equipment ? equipment.textContent : null
            };
        });
        
        console.log('3. プレイヤーステータス表示:', statusDisplayed);
        console.log('   - HP表示:', statusDisplayed.hp ? '✅' : '❌');
        console.log('   - ゴールド表示:', statusDisplayed.gold !== null ? '✅' : '❌');
        console.log('   - ポーション表示:', statusDisplayed.potions ? '✅' : '❌');
        console.log('   - 装備表示:', statusDisplayed.equipment ? '✅' : '❌');
        
        // スタートノードをクリック
        console.log('4. スタートノードクリックテスト');
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
        
        // 次のフロアノードが利用可能になったかチェック
        const nextFloorAvailable = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                const availableNodes = [];
                if (story.mapData && story.mapData.floors[1]) {
                    story.mapData.floors[1].forEach(node => {
                        if (node.available) {
                            availableNodes.push({
                                id: node.id,
                                type: node.type
                            });
                        }
                    });
                }
                return availableNodes;
            }
            return [];
        });
        
        console.log('   - 次フロアノード利用可能:', nextFloorAvailable.length > 0 ? '✅' : '❌');
        console.log('   - 利用可能ノード数:', nextFloorAvailable.length);
        console.log('   - ノードタイプ:', nextFloorAvailable.map(n => n.type));
        
        // 敵ノードをクリックして戦闘に遷移するテスト
        const enemyNode = nextFloorAvailable.find(node => node.type === 'enemy' || node.type === 'elite');
        if (enemyNode) {
            console.log('5. 敵ノードクリックテスト');
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
            }, enemyNode.id);
            
            await page.waitForTimeout(3000);
            
            // 戦闘画面に遷移したかチェック
            const battleState = await page.evaluate(() => {
                const storyScreen = document.getElementById('story-screen');
                const mapScreen = document.getElementById('story-map-screen');
                
                if (window.gameModeManager && window.gameModeManager.storyMode) {
                    const story = window.gameModeManager.storyMode;
                    return {
                        gameState: story.gameState,
                        storyScreenVisible: storyScreen ? !storyScreen.classList.contains('hidden') : false,
                        mapScreenVisible: mapScreen ? !mapScreen.classList.contains('hidden') : false,
                        enemyExists: !!story.currentEnemy,
                        storyScreenClass: storyScreen ? storyScreen.className : 'not found',
                        mapScreenClass: mapScreen ? mapScreen.className : 'not found'
                    };
                }
                return null;
            });
            
            console.log('   - 戦闘画面遷移:', battleState.storyScreenVisible ? '✅' : '❌');
            console.log('   - マップ画面非表示:', !battleState.mapScreenVisible ? '✅' : '❌');
            console.log('   - 敵生成:', battleState.enemyExists ? '✅' : '❌');
            console.log('   - 戦闘状態:', battleState.gameState);
            console.log('   - ストーリー画面クラス:', battleState.storyScreenClass);
            console.log('   - マップ画面クラス:', battleState.mapScreenClass);
        }
        
        // ショップノードテスト
        const shopNode = nextFloorAvailable.find(node => node.type === 'shop');
        if (shopNode) {
            console.log('6. ショップノードテスト');
            // マップ画面に戻る
            await page.evaluate(() => {
                if (window.gameModeManager && window.gameModeManager.storyMode) {
                    window.gameModeManager.storyMode.showMapScreen();
                }
            });
            
            await page.waitForTimeout(1000);
            
            // ショップノードをクリック
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
            }, shopNode.id);
            
            await page.waitForTimeout(2000);
            
            console.log('   - ショップクリック完了 ✅');
        }
        
        console.log('\\n🎯 テスト結果まとめ:');
        console.log('- 直接マップ遷移: ' + (mapVisible ? '✅' : '❌'));
        console.log('- 3つの初期選択肢: ' + (mapStructure.firstFloorNodes === 3 ? '✅' : '❌'));
        console.log('- プレイヤーステータス表示: ' + (statusDisplayed.hp ? '✅' : '❌'));
        console.log('- ノードクリック機能: ' + (nextFloorAvailable.length > 0 ? '✅' : '❌'));
        
    } else {
        console.log('❌ マップ画面が表示されませんでした');
    }
    
    await page.screenshot({ path: 'map_improvements_test.png' });
    console.log('📸 スクリーンショット保存: map_improvements_test.png');
    
    await browser.close();
})();