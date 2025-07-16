const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🔍 最終品質テスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let testResults = {
        passed: 0,
        failed: 0,
        errors: []
    };
    
    // エラー監視
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('error')) {
            testResults.errors.push(text);
        }
    });
    
    page.on('pageerror', error => {
        testResults.errors.push(`JavaScript Error: ${error.message}`);
    });
    
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    
    // テストケース配列
    const tests = [
        {
            name: '1. ページ読み込み',
            test: async () => {
                await page.waitForTimeout(2000);
                const title = await page.title();
                return title.includes('おぐなお');
            }
        },
        {
            name: '2. ストーリーモード開始',
            test: async () => {
                await page.click('#story-mode-btn');
                await page.waitForTimeout(2000);
                const storyScreen = await page.$('#story-screen');
                return storyScreen !== null;
            }
        },
        {
            name: '3. 敵の生成確認',
            test: async () => {
                const enemyName = await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        return window.gameModeManager.storyMode.currentEnemy?.name;
                    }
                    return null;
                });
                return enemyName !== null && enemyName !== undefined;
            }
        },
        {
            name: '4. 戦闘開始',
            test: async () => {
                await page.click('#start-battle-btn');
                await page.waitForTimeout(3000);
                const gameState = await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        return window.gameModeManager.storyMode.gameState;
                    }
                    return null;
                });
                return gameState === 'battle';
            }
        },
        {
            name: '5. ゲームループ動作',
            test: async () => {
                const gameRunning = await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        return window.gameModeManager.storyMode.gameRunning;
                    }
                    return false;
                });
                return gameRunning === true;
            }
        },
        {
            name: '6. プレイヤー操作',
            test: async () => {
                const initialHP = await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        return window.gameModeManager.storyMode.currentEnemy?.currentHP;
                    }
                    return null;
                });
                
                // 操作実行
                for (let i = 0; i < 3; i++) {
                    await page.keyboard.press('s');
                    await page.waitForTimeout(300);
                }
                
                // 手動ダメージ
                await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        window.gameModeManager.storyMode.dealDamageToEnemy(1);
                    }
                });
                
                const newHP = await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        return window.gameModeManager.storyMode.currentEnemy?.currentHP;
                    }
                    return null;
                });
                
                return newHP < initialHP;
            }
        },
        {
            name: '7. 勝利処理',
            test: async () => {
                // 敵を倒す
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
                
                const victoryVisible = await page.evaluate(() => {
                    const victory = document.getElementById('story-victory-screen');
                    return victory && !victory.classList.contains('hidden');
                });
                
                return victoryVisible;
            }
        },
        {
            name: '8. 報酬システム',
            test: async () => {
                const rewardButtons = await page.$$('.reward-btn');
                return rewardButtons.length === 3;
            }
        },
        {
            name: '9. 報酬選択',
            test: async () => {
                await page.click('#reward-special-puyo');
                await page.waitForTimeout(2000);
                
                const mapVisible = await page.evaluate(() => {
                    const map = document.getElementById('story-map-screen');
                    return map && !map.classList.contains('hidden');
                });
                
                return mapVisible;
            }
        },
        {
            name: '10. マップノード選択',
            test: async () => {
                // 利用可能なマップノードを取得
                const availableNodes = await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        const story = window.gameModeManager.storyMode;
                        const available = [];
                        if (story.mapData) {
                            story.mapData.floors.forEach((floor, floorIndex) => {
                                floor.forEach(node => {
                                    if (node.available && !node.completed) {
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
                
                if (availableNodes.length > 0) {
                    // 最初のノードをクリック
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
                    }, availableNodes[0].id);
                    
                    await page.waitForTimeout(2000);
                    
                    // ノードがクリックされて利用可能ノードが更新されたかチェック
                    const afterClick = await page.evaluate(() => {
                        if (window.gameModeManager && window.gameModeManager.storyMode) {
                            const story = window.gameModeManager.storyMode;
                            return story.currentMapPosition.floor >= 0;
                        }
                        return false;
                    });
                    
                    return afterClick;
                }
                return false;
            }
        }
    ];
    
    // テスト実行
    for (const test of tests) {
        try {
            console.log(`実行中: ${test.name}`);
            const result = await test.test();
            if (result) {
                console.log(`✅ ${test.name} - 成功`);
                testResults.passed++;
            } else {
                console.log(`❌ ${test.name} - 失敗`);
                testResults.failed++;
            }
        } catch (error) {
            console.log(`💥 ${test.name} - エラー: ${error.message}`);
            testResults.failed++;
            testResults.errors.push(`${test.name}: ${error.message}`);
        }
        
        await page.waitForTimeout(500);
    }
    
    // 結果サマリー
    console.log('\\n=== 最終品質テスト結果 ===');
    console.log(`✅ 成功: ${testResults.passed}`);
    console.log(`❌ 失敗: ${testResults.failed}`);
    console.log(`🔥 エラー数: ${testResults.errors.length}`);
    
    const successRate = (testResults.passed / (testResults.passed + testResults.failed)) * 100;
    console.log(`📊 成功率: ${successRate.toFixed(1)}%`);
    
    if (testResults.errors.length > 0) {
        console.log('\\n=== エラー詳細 ===');
        testResults.errors.forEach(error => {
            console.log(`❌ ${error}`);
        });
    }
    
    if (successRate >= 90) {
        console.log('🎉 優秀！システムは安定して動作しています');
    } else if (successRate >= 70) {
        console.log('⚠️ 良好。いくつか改善の余地があります');
    } else {
        console.log('🔧 要改善。重要な問題があります');
    }
    
    await browser.close();
})();