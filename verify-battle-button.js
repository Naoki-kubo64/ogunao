const { chromium } = require('playwright');

async function verifyBattleButton() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 対戦モードボタンの動作確認...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        // ページのエラーを監視
        page.on('pageerror', error => {
            console.error('❌ Page error:', error.message);
        });
        
        // コンソールメッセージを監視
        page.on('console', msg => {
            console.log('📝 Console:', msg.text());
        });
        
        console.log('1️⃣ ボタンの存在確認...');
        
        const buttonInfo = await page.evaluate(() => {
            const battleBtn = document.getElementById('battle-mode-btn');
            const gameModeManager = window.gameModeManager;
            const game = window.game;
            
            return {
                buttonExists: !!battleBtn,
                buttonVisible: battleBtn ? getComputedStyle(battleBtn).display !== 'none' : false,
                buttonText: battleBtn ? battleBtn.textContent.trim() : null,
                gameModeManagerExists: !!gameModeManager,
                gameExists: !!game,
                gameHasStartBattleMode: game && typeof game.startBattleMode === 'function'
            };
        });
        
        console.log('Button info:', buttonInfo);
        
        if (!buttonInfo.buttonExists) {
            console.error('❌ 対戦モードボタンが見つかりません');
            return false;
        }
        
        if (!buttonInfo.gameHasStartBattleMode) {
            console.error('❌ startBattleModeメソッドが見つかりません');
            return false;
        }
        
        console.log('2️⃣ ボタンクリックテスト...');
        
        // ボタンをクリック
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(2000);
        
        console.log('3️⃣ 結果確認...');
        
        const result = await page.evaluate(() => {
            const titleScreen = document.getElementById('start-screen');
            const battleScreen = document.getElementById('battle-screen');
            
            return {
                titleHidden: titleScreen && titleScreen.classList.contains('hidden'),
                battleVisible: battleScreen && !battleScreen.classList.contains('hidden'),
                currentMode: window.gameModeManager ? window.gameModeManager.currentMode : null
            };
        });
        
        console.log('Result:', result);
        
        const success = result.titleHidden && result.battleVisible && result.currentMode === 'battle';
        
        console.log(`\\n${success ? '✅' : '❌'} 対戦モード遷移: ${success ? '成功' : '失敗'}`);
        
        if (!success) {
            console.log('\\n🔧 問題の詳細分析...');
            
            // 詳細なデバッグ情報を取得
            const debugInfo = await page.evaluate(() => {
                const titleScreen = document.getElementById('start-screen');
                const battleScreen = document.getElementById('battle-screen');
                
                return {
                    titleScreen: titleScreen ? {
                        classes: titleScreen.className,
                        style: titleScreen.style.cssText,
                        display: getComputedStyle(titleScreen).display
                    } : null,
                    battleScreen: battleScreen ? {
                        classes: battleScreen.className,
                        style: battleScreen.style.cssText,
                        display: getComputedStyle(battleScreen).display,
                        visibility: getComputedStyle(battleScreen).visibility
                    } : null
                };
            });
            
            console.log('Debug info:', debugInfo);
        }
        
        await page.screenshot({ path: 'verify_battle_button.png' });
        
        return success;
        
    } catch (error) {
        console.error('💥 Verification error:', error);
        return false;
    } finally {
        await browser.close();
    }
}

verifyBattleButton().catch(console.error);