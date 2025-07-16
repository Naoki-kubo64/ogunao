const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🗺️ マップシステムテスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // エラー監視
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('error')) {
            console.log(`❌ [ERROR] ${text}`);
        } else if (text.includes('マップ') || text.includes('Map')) {
            console.log(`🗺️ [MAP] ${text}`);
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
    
    // マップシステムの初期化確認
    const mapInitialized = await page.evaluate(() => {
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            const story = window.gameModeManager.storyMode;
            return {
                mapDataExists: !!story.mapData,
                floorsCount: story.mapData ? story.mapData.floors.length : 0,
                connectionsCount: story.mapData ? story.mapData.connections.length : 0,
                currentPosition: story.currentMapPosition
            };
        }
        return null;
    });
    
    console.log('マップ初期化状態:', mapInitialized);
    
    // マップ画面の表示確認
    console.log('🎯 マップ画面表示テスト');
    await page.evaluate(() => {
        if (window.gameModeManager && window.gameModeManager.storyMode) {
            window.gameModeManager.storyMode.showMapScreen();
        }
    });
    
    await page.waitForTimeout(2000);
    
    const mapVisible = await page.evaluate(() => {
        const mapScreen = document.getElementById('story-map-screen');
        return mapScreen && !mapScreen.classList.contains('hidden');
    });
    
    console.log('マップ画面表示状態:', mapVisible);
    
    if (mapVisible) {
        // SVGノードの描画確認
        const svgNodes = await page.evaluate(() => {
            const svg = document.getElementById('adventure-map');
            if (svg) {
                const circles = svg.querySelectorAll('circle');
                const lines = svg.querySelectorAll('line');
                const texts = svg.querySelectorAll('text');
                return {
                    circles: circles.length,
                    lines: lines.length,
                    texts: texts.length
                };
            }
            return null;
        });
        
        console.log('SVG要素数:', svgNodes);
        
        // 利用可能ノードの確認
        const availableNodes = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                const available = [];
                if (story.mapData) {
                    story.mapData.floors.forEach((floor, floorIndex) => {
                        floor.forEach(node => {
                            if (node.available) {
                                available.push({
                                    floor: floorIndex,
                                    type: node.type,
                                    id: node.id
                                });
                            }
                        });
                    });
                }
                return available;
            }
            return [];
        });
        
        console.log('利用可能ノード:', availableNodes);
        
        // 最初のノードをクリックしてみる
        if (availableNodes.length > 0) {
            console.log('🖱️ 最初のノードをクリック');
            await page.evaluate((nodeId) => {
                const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
                if (nodeElement) {
                    // SVG要素なのでdispatchEventを使用
                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    nodeElement.dispatchEvent(clickEvent);
                }
            }, availableNodes[0].id);
            
            await page.waitForTimeout(2000);
            
            // クリック後の状態確認
            const afterClick = await page.evaluate(() => {
                if (window.gameModeManager && window.gameModeManager.storyMode) {
                    const story = window.gameModeManager.storyMode;
                    return {
                        gameState: story.gameState,
                        currentPosition: story.currentMapPosition,
                        storyScreenVisible: !document.getElementById('story-screen').classList.contains('hidden'),
                        mapScreenVisible: !document.getElementById('story-map-screen').classList.contains('hidden')
                    };
                }
                return null;
            });
            
            console.log('ノードクリック後の状態:', afterClick);
        }
        
        console.log('✅ マップシステムテスト完了');
    } else {
        console.log('❌ マップ画面が表示されませんでした');
    }
    
    await page.screenshot({ path: 'map_system_test.png' });
    console.log('📸 スクリーンショット保存: map_system_test.png');
    
    await browser.close();
})();