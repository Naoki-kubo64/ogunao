const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🏆 勝利フローテスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // エラー監視
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('error')) {
            console.log(`❌ [ERROR] ${text}`);
        } else if (text.includes('勝利') || text.includes('敵') || text.includes('HP')) {
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
    await page.waitForTimeout(2000);
    
    console.log('⚔️ 戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(3000);
    
    console.log('🎯 敵を倒すまで攻撃');
    
    // 敵を倒すまでループ
    let rounds = 0;
    const maxRounds = 100;
    
    while (rounds < maxRounds) {
        // 現在の敵HP確認
        const enemyHP = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode && window.gameModeManager.storyMode.currentEnemy) {
                return window.gameModeManager.storyMode.currentEnemy.currentHP;
            }
            return null;
        });
        
        console.log(`Round ${rounds + 1}: 敵HP = ${enemyHP}`);
        
        if (enemyHP <= 0) {
            console.log('🎉 敵を倒しました！');
            break;
        }
        
        // プレイヤー操作でダメージを与える
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('a');
            await page.waitForTimeout(100);
            await page.keyboard.press('d');
            await page.waitForTimeout(100);
            await page.keyboard.press('s');
            await page.waitForTimeout(200);
            await page.keyboard.press(' ');
            await page.waitForTimeout(300);
        }
        
        // 手動でダメージを与える（テスト用）
        await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                if (story.currentEnemy && story.currentEnemy.currentHP > 0) {
                    story.dealDamageToEnemy(5); // 5ダメージ
                }
            }
        });
        
        rounds++;
        await page.waitForTimeout(500);
    }
    
    if (rounds >= maxRounds) {
        console.log('❌ 最大ラウンド数に到達 - 敵を倒せませんでした');
        await browser.close();
        return;
    }
    
    // 勝利画面の表示を待つ
    await page.waitForTimeout(2000);
    
    console.log('🎊 勝利画面チェック');
    const victoryVisible = await page.evaluate(() => {
        const victory = document.getElementById('story-victory-screen');
        return victory && !victory.classList.contains('hidden');
    });
    
    console.log('勝利画面表示:', victoryVisible);
    
    if (victoryVisible) {
        // 現在のステータス確認
        const playerStatus = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                return {
                    hp: story.player.currentHP,
                    maxHP: story.player.maxHP,
                    floor: story.currentFloor,
                    specialPuyo: Object.keys(story.player.puyoRates.special).length,
                    potions: Object.keys(story.player.potions).length,
                    equipment: Object.keys(story.player.equipment).length
                };
            }
            return null;
        });
        console.log('プレイヤーステータス:', playerStatus);
        
        console.log('🎁 報酬選択');
        await page.click('#reward-special-puyo');
        await page.waitForTimeout(2000);
        
        console.log('🗺️ マップ画面チェック');
        const mapVisible = await page.evaluate(() => {
            const map = document.getElementById('story-map-screen');
            return map && !map.classList.contains('hidden');
        });
        
        console.log('マップ画面表示:', mapVisible);
        
        if (mapVisible) {
            // 利用可能なマップノードを確認
            const mapNodes = await page.evaluate(() => {
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
            
            console.log('利用可能なマップノード:', mapNodes);
            
            // 最初の利用可能ノードをクリック
            if (mapNodes.length > 0) {
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
                }, mapNodes[0].id);
                await page.waitForTimeout(2000);
            }
            
            console.log('🔄 次の階層へ');
            const newFloorState = await page.evaluate(() => {
                if (window.gameModeManager && window.gameModeManager.storyMode) {
                    const story = window.gameModeManager.storyMode;
                    return {
                        floor: story.currentFloor,
                        gameState: story.gameState,
                        currentEnemy: story.currentEnemy ? story.currentEnemy.name : 'none'
                    };
                }
                return null;
            });
            
            console.log('新しい階層状態:', newFloorState);
            
            console.log('✅ 勝利フローテスト完了 - 全て正常');
        } else {
            console.log('❌ マップ画面が表示されませんでした');
        }
    } else {
        console.log('❌ 勝利画面が表示されませんでした');
    }
    
    await browser.close();
})();