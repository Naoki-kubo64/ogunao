const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🧪 総合システムテスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // エラーハンドリング
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Error') || text.includes('error') || text.includes('ERROR')) {
            console.log(`❌ [ERROR] ${text}`);
        } else if (text.includes('戦闘') || text.includes('勝利') || text.includes('敵')) {
            console.log(`🎮 [GAME] ${text}`);
        }
    });
    
    page.on('pageerror', error => {
        console.log(`💥 JavaScript Error: ${error.message}`);
    });
    
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(2000);
    
    try {
        console.log('1️⃣ タイトル画面テスト');
        
        // ストーリーモード開始
        console.log('📖 ストーリーモード開始');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(2000);
        
        // ゲーム状態確認
        const gameState1 = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                return {
                    state: window.gameModeManager.storyMode.gameState,
                    currentEnemy: window.gameModeManager.storyMode.currentEnemy ? window.gameModeManager.storyMode.currentEnemy.name : 'none',
                    floor: window.gameModeManager.storyMode.currentFloor
                };
            }
            return { error: 'Story mode not found' };
        });
        console.log('ストーリーモード状態:', gameState1);
        
        console.log('2️⃣ 戦闘開始テスト');
        
        // 戦闘開始ボタンをクリック
        await page.click('#start-battle-btn');
        await page.waitForTimeout(3000);
        
        // 戦闘状態確認
        const battleState = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                return {
                    gameState: story.gameState,
                    gameRunning: story.gameRunning,
                    currentEnemy: story.currentEnemy ? story.currentEnemy.name : 'none',
                    playerHP: story.player ? story.player.currentHP : 'none',
                    enemyHP: story.currentEnemy ? story.currentEnemy.currentHP : 'none'
                };
            }
            return { error: 'Story mode not found' };
        });
        console.log('戦闘状態:', battleState);
        
        console.log('3️⃣ ゲームプレイテスト（10秒間）');
        
        // プレイヤー操作テスト
        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('a');
            await page.waitForTimeout(200);
            await page.keyboard.press('d');
            await page.waitForTimeout(200);
            await page.keyboard.press('s');
            await page.waitForTimeout(300);
            await page.keyboard.press(' ');
            await page.waitForTimeout(500);
        }
        
        console.log('4️⃣ 敵HPチェック');
        
        // 敵のHPを確認
        const enemyHPCheck = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode && window.gameModeManager.storyMode.currentEnemy) {
                return window.gameModeManager.storyMode.currentEnemy.currentHP;
            }
            return null;
        });
        console.log('敵HP:', enemyHPCheck);
        
        // 敵HPが0以下の場合、勝利画面が表示されるかチェック
        if (enemyHPCheck <= 0) {
            console.log('5️⃣ 勝利画面テスト');
            await page.waitForTimeout(2000);
            
            const victoryScreenVisible = await page.evaluate(() => {
                const victoryScreen = document.getElementById('story-victory-screen');
                return victoryScreen && !victoryScreen.classList.contains('hidden');
            });
            
            console.log('勝利画面表示:', victoryScreenVisible);
            
            if (victoryScreenVisible) {
                console.log('6️⃣ 報酬選択テスト');
                
                // 報酬選択
                await page.click('#reward-special-puyo');
                await page.waitForTimeout(2000);
                
                console.log('7️⃣ エリア選択テスト');
                
                // エリア選択画面が表示されるかチェック
                const areaScreenVisible = await page.evaluate(() => {
                    const areaScreen = document.getElementById('story-area-selection');
                    return areaScreen && !areaScreen.classList.contains('hidden');
                });
                
                console.log('エリア選択画面表示:', areaScreenVisible);
                
                if (areaScreenVisible) {
                    // 最初の選択肢をクリック
                    await page.click('.area-btn');
                    await page.waitForTimeout(2000);
                }
            }
        }
        
        console.log('8️⃣ 最終状態確認');
        
        const finalState = await page.evaluate(() => {
            if (window.gameModeManager && window.gameModeManager.storyMode) {
                const story = window.gameModeManager.storyMode;
                return {
                    gameState: story.gameState,
                    gameRunning: story.gameRunning,
                    floor: story.currentFloor,
                    playerHP: story.player ? story.player.currentHP : 'none',
                    currentEnemy: story.currentEnemy ? story.currentEnemy.name : 'none'
                };
            }
            return { error: 'Story mode not found' };
        });
        console.log('最終状態:', finalState);
        
        console.log('✅ 総合テスト完了');
        
    } catch (error) {
        console.log('❌ テスト中にエラー:', error.message);
    }
    
    await browser.close();
})();