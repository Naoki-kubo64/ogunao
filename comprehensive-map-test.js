const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🎮 包括的マップシステムテスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // エラー監視
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('error')) {
            console.log(`❌ [ERROR] ${text}`);
        } else if (text.includes('マップ') || text.includes('Map') || text.includes('勝利') || text.includes('冒険')) {
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
    
    // 初期マップ状態確認
    const initialMapState = await page.evaluate(() => {
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            const story = window.gameModeManager.storyMode;
            return {
                mapExists: !!story.mapData,
                floorsCount: story.mapData ? story.mapData.floors.length : 0,
                totalNodes: story.mapData ? story.mapData.floors.reduce((sum, floor) => sum + floor.length, 0) : 0,
                connectionsCount: story.mapData ? story.mapData.connections.length : 0,
                currentPos: story.currentMapPosition,
                availableNodesCount: story.mapData ? story.mapData.floors.reduce((sum, floor) => 
                    sum + floor.filter(node => node.available).length, 0) : 0
            };
        }
        return null;
    });
    
    console.log('初期マップ状態:', initialMapState);
    
    // マップ画面を表示
    await page.evaluate(() => {
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            window.gameModeManager.storyMode.showMapScreen();
        }
    });
    
    await page.waitForTimeout(2000);
    
    // スタートノードをクリック
    console.log('🏠 スタートノードをクリック');
    const startNodeClicked = await page.evaluate(() => {
        const startNode = document.querySelector('[data-node-id="floor_0_node_0"]');
        if (startNode) {
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            startNode.dispatchEvent(clickEvent);
            return true;
        }
        return false;
    });
    
    console.log('スタートノードクリック成功:', startNodeClicked);
    await page.waitForTimeout(2000);
    
    // 次のフロアのノードが利用可能になったかチェック
    const nextFloorNodes = await page.evaluate(() => {
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            const story = window.gameModeManager.storyMode;
            const available = [];
            if (story.mapData && story.mapData.floors[1]) {
                story.mapData.floors[1].forEach(node => {
                    if (node.available) {
                        available.push({
                            id: node.id,
                            type: node.type,
                            floor: node.floor
                        });
                    }
                });
            }
            return available;
        }
        return [];
    });
    
    console.log('次のフロアの利用可能ノード:', nextFloorNodes);
    
    // 最初の敵ノードをクリックして戦闘開始
    const enemyNode = nextFloorNodes.find(node => node.type === 'enemy' || node.type === 'elite');
    if (enemyNode) {
        console.log(`⚔️ 敵ノード ${enemyNode.type} をクリック`);
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
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                return {
                    gameState: story.gameState,
                    enemyExists: !!story.currentEnemy,
                    enemyName: story.currentEnemy ? story.currentEnemy.name : null,
                    storyScreenVisible: !document.getElementById('story-screen').classList.contains('hidden')
                };
            }
            return null;
        });
        
        console.log('戦闘状態:', battleState);
        
        if (battleState && battleState.gameState === 'battle') {
            // 敵を倒して勝利フローをテスト
            console.log('🗡️ 敵を倒して勝利フローをテスト');
            await page.evaluate(() => {
                if (window.gameModeManager && window.gameModeManager.storyMode) {
                    const story = window.gameModeManager.storyMode;
                    if (story.currentEnemy) {
                        story.currentEnemy.currentHP = 0;
                        story.onVictory(1, 10);
                    }
                }
            });
            
            await page.waitForTimeout(2000);
            
            // 勝利画面が表示されたかチェック
            const victoryVisible = await page.evaluate(() => {
                const victory = document.getElementById('story-victory-screen');
                return victory && !victory.classList.contains('hidden');
            });
            
            console.log('勝利画面表示:', victoryVisible);
            
            if (victoryVisible) {
                // 報酬を選択
                console.log('🎁 報酬選択');
                await page.click('#reward-special-puyo');
                await page.waitForTimeout(2000);
                
                // マップ画面に戻ったかチェック
                const backToMap = await page.evaluate(() => {
                    const map = document.getElementById('story-map-screen');
                    return map && !map.classList.contains('hidden');
                });
                
                console.log('マップ画面復帰:', backToMap);
                
                // 完了したノードと新しい利用可能ノードをチェック
                const finalMapState = await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        const story = window.gameModeManager.storyMode;
                        const completedNodes = [];
                        const availableNodes = [];
                        
                        if (story.mapData) {
                            story.mapData.floors.forEach((floor, floorIndex) => {
                                floor.forEach(node => {
                                    if (node.completed) {
                                        completedNodes.push({ floor: floorIndex, type: node.type, id: node.id });
                                    }
                                    if (node.available && !node.completed) {
                                        availableNodes.push({ floor: floorIndex, type: node.type, id: node.id });
                                    }
                                });
                            });
                        }
                        
                        return {
                            completedNodes,
                            availableNodes,
                            currentPosition: story.currentMapPosition
                        };
                    }
                    return null;
                });
                
                console.log('最終マップ状態:', finalMapState);
                console.log(`✅ 包括的マップシステムテスト完了`);
                console.log(`📊 完了ノード数: ${finalMapState.completedNodes.length}`);
                console.log(`📊 利用可能ノード数: ${finalMapState.availableNodes.length}`);
            }
        }
    } else {
        console.log('❌ 利用可能な敵ノードが見つかりませんでした');
    }
    
    await page.screenshot({ path: 'comprehensive_map_test.png' });
    console.log('📸 スクリーンショット保存: comprehensive_map_test.png');
    
    await browser.close();
})();