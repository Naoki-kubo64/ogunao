const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🐒 モンキーテスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    let errorCount = 0;
    let actionCount = 0;
    
    // エラー監視
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('error') || text.includes('ERROR')) {
            console.log(`❌ [ERROR ${++errorCount}] ${text}`);
        }
    });
    
    page.on('pageerror', error => {
        console.log(`💥 JavaScript Error ${++errorCount}: ${error.message}`);
    });
    
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(2000);
    
    // ランダムアクション関数
    const randomActions = [
        // ボタンクリック
        async () => {
            const buttons = await page.$$('button:not([disabled])');
            if (buttons.length > 0) {
                const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
                try {
                    await randomButton.click();
                    console.log(`🖱️ ランダムボタンクリック`);
                } catch (e) {
                    console.log(`⚠️ ボタンクリック失敗: ${e.message}`);
                }
            }
        },
        
        // キーボード入力
        async () => {
            const keys = ['a', 'd', 's', ' ', 'Enter', 'Escape'];
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            await page.keyboard.press(randomKey);
            console.log(`⌨️ ランダムキー: ${randomKey}`);
        },
        
        // 画面クリック
        async () => {
            const x = Math.random() * 1200;
            const y = Math.random() * 800;
            await page.mouse.click(x, y);
            console.log(`🖱️ ランダムクリック: (${Math.round(x)}, ${Math.round(y)})`);
        },
        
        // 連続キー入力
        async () => {
            const sequences = [
                ['a', 'a', 's', 's'],
                ['d', 'd', ' ', 's'],
                [' ', ' ', ' ', 's'],
                ['a', 'd', 'a', 'd']
            ];
            const sequence = sequences[Math.floor(Math.random() * sequences.length)];
            for (const key of sequence) {
                await page.keyboard.press(key);
                await page.waitForTimeout(50);
            }
            console.log(`⌨️ 連続キー: ${sequence.join('-')}`);
        }
    ];
    
    console.log('🎮 ストーリーモード開始');
    await page.click('#story-mode-btn');
    await page.waitForTimeout(2000);
    
    console.log('⚔️ 戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(3000);
    
    console.log('🐒 ランダムアクション開始（30秒間）');
    
    const startTime = Date.now();
    const testDuration = 30000; // 30秒
    
    while (Date.now() - startTime < testDuration) {
        try {
            const randomAction = randomActions[Math.floor(Math.random() * randomActions.length)];
            await randomAction();
            actionCount++;
            
            // ランダムな待機時間
            await page.waitForTimeout(Math.random() * 500 + 100);
            
            // 5秒ごとに状態確認
            if (actionCount % 20 === 0) {
                const gameState = await page.evaluate(() => {
                    if (window.gameModeManager && window.gameModeManager.storyMode) {
                        const story = window.gameModeManager.storyMode;
                        return {
                            state: story.gameState,
                            running: story.gameRunning,
                            playerHP: story.player ? story.player.currentHP : 'none',
                            enemyHP: story.currentEnemy ? story.currentEnemy.currentHP : 'none'
                        };
                    }
                    return { error: 'Story mode not found' };
                });
                console.log(`📊 [${actionCount}回目] 状態:`, gameState);
                
                // 勝利画面が表示された場合の処理
                const victoryVisible = await page.evaluate(() => {
                    const victory = document.getElementById('story-victory-screen');
                    return victory && !victory.classList.contains('hidden');
                });
                
                if (victoryVisible) {
                    console.log('🎉 勝利画面検出 - 報酬選択');
                    await page.click('#reward-special-puyo');
                    await page.waitForTimeout(1000);
                    
                    // エリア選択でランダム選択
                    const areaButtons = await page.$$('.area-btn');
                    if (areaButtons.length > 0) {
                        const randomArea = areaButtons[Math.floor(Math.random() * areaButtons.length)];
                        await randomArea.click();
                        console.log('🗺️ ランダムエリア選択');
                        await page.waitForTimeout(2000);
                        
                        // 新しい戦闘を開始
                        await page.click('#start-battle-btn');
                        await page.waitForTimeout(2000);
                    }
                }
                
                // ゲームオーバー検出
                if (gameState.playerHP <= 0) {
                    console.log('💀 ゲームオーバー検出');
                    break;
                }
            }
            
        } catch (error) {
            console.log(`⚠️ アクション実行エラー: ${error.message}`);
        }
    }
    
    console.log('\\n=== モンキーテスト結果 ===');
    console.log(`総アクション数: ${actionCount}`);
    console.log(`エラー数: ${errorCount}`);
    console.log(`エラー率: ${(errorCount / actionCount * 100).toFixed(2)}%`);
    
    if (errorCount === 0) {
        console.log('✅ エラーなし！安定性良好');
    } else if (errorCount < 5) {
        console.log('⚠️ 軽微なエラーあり');
    } else {
        console.log('❌ 多数のエラー検出 - 要修正');
    }
    
    await browser.close();
})();