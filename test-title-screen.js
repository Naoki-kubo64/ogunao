const { chromium } = require('playwright');

async function testTitleScreen() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🎮 Testing new title screen mode selection...');
        
        // HTMLファイルを直接開く
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('1️⃣ Testing title screen display...');
        
        // タイトル画面の要素が表示されているか確認
        const titleInfo = await page.evaluate(() => {
            const startScreen = document.getElementById('start-screen');
            const trainingBtn = document.getElementById('training-mode-btn');
            const storyBtn = document.getElementById('story-mode-btn');
            const battleBtn = document.getElementById('battle-mode-btn');
            const rulesBtn = document.getElementById('rules-btn');
            
            return {
                titleScreenVisible: startScreen && !startScreen.classList.contains('hidden'),
                trainingModeBtn: !!trainingBtn,
                storyModeBtn: !!storyBtn,
                battleModeBtn: !!battleBtn,
                rulesBtn: !!rulesBtn,
                trainingModeText: trainingBtn ? trainingBtn.textContent : null,
                storyModeText: storyBtn ? storyBtn.textContent : null,
                battleModeText: battleBtn ? battleBtn.textContent : null
            };
        });
        
        console.log('📋 Title screen analysis:');
        console.log(`  Title screen visible: ${titleInfo.titleScreenVisible}`);
        console.log(`  Training mode button: ${titleInfo.trainingModeBtn} - "${titleInfo.trainingModeText}"`);
        console.log(`  Story mode button: ${titleInfo.storyModeBtn} - "${titleInfo.storyModeText}"`);
        console.log(`  Battle mode button: ${titleInfo.battleModeBtn} - "${titleInfo.battleModeText}"`);
        console.log(`  Rules button: ${titleInfo.rulesBtn}`);
        
        console.log('2️⃣ Testing training mode selection...');
        await page.click('#training-mode-btn');
        await page.waitForTimeout(1500);
        
        // ゲームが開始されたか確認
        const gameStarted = await page.evaluate(() => {
            const startScreen = document.getElementById('start-screen');
            const gameArea = document.querySelector('.game-area');
            const canvas = document.getElementById('game-canvas');
            
            return {
                titleHidden: startScreen && startScreen.classList.contains('hidden'),
                gameAreaVisible: gameArea && getComputedStyle(gameArea).display !== 'none',
                canvasPresent: !!canvas
            };
        });
        
        console.log('🎯 Training mode test:');
        console.log(`  Title screen hidden: ${gameStarted.titleHidden}`);
        console.log(`  Game area visible: ${gameStarted.gameAreaVisible}`);
        console.log(`  Canvas present: ${gameStarted.canvasPresent}`);
        
        console.log('3️⃣ Testing back to title...');
        await page.keyboard.press('Escape'); // または適切な戻る方法
        await page.waitForTimeout(1000);
        
        console.log('4️⃣ Testing story mode selection...');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(1000);
        
        // アラートが表示されるか確認
        const alertShown = await page.evaluate(() => {
            return new Promise(resolve => {
                const originalAlert = window.alert;
                window.alert = function(message) {
                    resolve({ shown: true, message });
                    originalAlert(message);
                };
                setTimeout(() => resolve({ shown: false }), 500);
            });
        });
        
        console.log('📖 Story mode test:');
        console.log(`  Alert shown: ${alertShown.shown}`);
        if (alertShown.message) {
            console.log(`  Alert message: "${alertShown.message}"`);
        }
        
        console.log('5️⃣ Testing battle mode selection...');
        // アラートを閉じてから対戦モードテスト
        try {
            await page.keyboard.press('Enter'); // アラート閉じる
            await page.waitForTimeout(500);
        } catch (e) {
            // アラートがない場合は無視
        }
        
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(1500);
        
        // 対戦画面が表示されるか確認
        const battleStarted = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            const startScreen = document.getElementById('start-screen');
            
            return {
                battleScreenVisible: battleScreen && !battleScreen.classList.contains('hidden'),
                titleHidden: startScreen && startScreen.classList.contains('hidden')
            };
        });
        
        console.log('⚔️ Battle mode test:');
        console.log(`  Battle screen visible: ${battleStarted.battleScreenVisible}`);
        console.log(`  Title screen hidden: ${battleStarted.titleHidden}`);
        
        await page.screenshot({ path: 'title_screen_test.png' });
        
        const overallSuccess = titleInfo.titleScreenVisible && 
                              titleInfo.trainingModeBtn && 
                              titleInfo.storyModeBtn && 
                              titleInfo.battleModeBtn;
        
        console.log(`\n✅ Overall title screen test: ${overallSuccess ? 'SUCCESS' : 'NEEDS FIXES'}`);
        
        return { titleInfo, gameStarted, battleStarted, overallSuccess };
        
    } catch (error) {
        console.error('💥 Test error:', error);
    } finally {
        await browser.close();
    }
}

testTitleScreen().catch(console.error);