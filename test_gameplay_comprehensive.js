const { chromium } = require('playwright');

async function testGameplayComprehensive() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    const issues = [];
    
    try {
        console.log('🎮 Starting comprehensive gameplay test...');
        
        // HTMLファイルを直接開く
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('📸 Taking initial title screen screenshot...');
        await page.screenshot({ path: 'test_01_title_screen.png' });
        
        // === 1. タイトル画面テスト ===
        console.log('1️⃣ Testing title screen...');
        
        // BGM要素の状態確認
        const titleBgmStatus = await page.evaluate(() => {
            const titleBgm = document.getElementById('title-bgm');
            const gameBgm = document.getElementById('game-bgm');
            return {
                titleBgm: titleBgm ? {
                    paused: titleBgm.paused,
                    currentTime: titleBgm.currentTime,
                    volume: titleBgm.volume
                } : null,
                gameBgm: gameBgm ? {
                    paused: gameBgm.paused,
                    currentTime: gameBgm.currentTime,
                    volume: gameBgm.volume
                } : null
            };
        });
        
        console.log('🎵 Title screen BGM status:', titleBgmStatus);
        
        // === 2. ソロゲーム開始テスト ===
        console.log('2️⃣ Testing solo game start...');
        
        await page.click('#start-game-btn');
        await page.waitForTimeout(1000);
        
        console.log('📸 Taking mode selection screenshot...');
        await page.screenshot({ path: 'test_02_mode_selection.png' });
        
        await page.click('#solo-mode-btn');
        await page.waitForTimeout(1000);
        
        // Enterキーでゲーム開始
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        console.log('📸 Taking solo game screen screenshot...');
        await page.screenshot({ path: 'test_03_solo_game_start.png' });
        
        // === 3. ゲーム画面レイアウト確認 ===
        const gameLayoutCheck = await page.evaluate(() => {
            const container = document.querySelector('.container');
            const gameArea = document.querySelector('.game-area');
            const gameCanvas = document.getElementById('game-canvas');
            const startScreen = document.getElementById('start-screen');
            
            return {
                container: container ? {
                    display: window.getComputedStyle(container).display,
                    boundingBox: container.getBoundingClientRect()
                } : null,
                gameArea: gameArea ? {
                    display: window.getComputedStyle(gameArea).display,
                    visibility: window.getComputedStyle(gameArea).visibility,
                    boundingBox: gameArea.getBoundingClientRect()
                } : null,
                gameCanvas: gameCanvas ? {
                    boundingBox: gameCanvas.getBoundingClientRect()
                } : null,
                startScreen: startScreen ? {
                    display: window.getComputedStyle(startScreen).display,
                    classList: Array.from(startScreen.classList)
                } : null,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };
        });
        
        console.log('🎯 Game layout check:', gameLayoutCheck);
        
        // レイアウト問題の検出
        if (gameLayoutCheck.startScreen && !gameLayoutCheck.startScreen.classList.includes('hidden')) {
            issues.push('❌ Start screen is still visible during gameplay');
        }
        
        if (gameLayoutCheck.gameArea && gameLayoutCheck.gameArea.display === 'none') {
            issues.push('❌ Game area is not visible');
        }
        
        if (gameLayoutCheck.container && gameLayoutCheck.container.display === 'none') {
            issues.push('❌ Container is not visible during gameplay');
        }
        
        // === 4. BGM重複再生確認 ===
        const bgmDuplicationCheck = await page.evaluate(() => {
            const allAudio = Array.from(document.querySelectorAll('audio'));
            const playingAudio = allAudio.filter(audio => !audio.paused);
            
            return {
                totalAudio: allAudio.length,
                playingCount: playingAudio.length,
                playingAudio: playingAudio.map(audio => ({
                    id: audio.id,
                    currentTime: audio.currentTime,
                    volume: audio.volume,
                    src: audio.src.split('/').pop()
                }))
            };
        });
        
        console.log('🎵 BGM duplication check:', bgmDuplicationCheck);
        
        if (bgmDuplicationCheck.playingCount > 1) {
            issues.push(`❌ Multiple BGM playing simultaneously (${bgmDuplicationCheck.playingCount} tracks)`);
        }
        
        // === 5. ゲームプレイ操作テスト ===
        console.log('3️⃣ Testing gameplay controls...');
        
        // キーボード操作をテスト
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(500);
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        
        console.log('📸 Taking gameplay screenshot...');
        await page.screenshot({ path: 'test_04_gameplay_controls.png' });
        
        // ゲーム状態確認
        const gameStateCheck = await page.evaluate(() => {
            // ゲームオブジェクトの状態を確認
            return {
                gameRunning: window.game ? window.game.gameRunning : false,
                score: window.game ? window.game.score : 0,
                gameExists: !!window.game
            };
        });
        
        console.log('🎮 Game state check:', gameStateCheck);
        
        if (!gameStateCheck.gameExists) {
            issues.push('❌ Game object not found');
        }
        
        if (!gameStateCheck.gameRunning) {
            issues.push('❌ Game is not running');
        }
        
        // === 6. 一時停止テスト ===
        console.log('4️⃣ Testing pause functionality...');
        
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        console.log('📸 Taking pause screenshot...');
        await page.screenshot({ path: 'test_05_pause.png' });
        
        // 一時停止解除
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // === 7. 対戦モードテスト ===
        console.log('5️⃣ Testing battle mode...');
        
        // タイトルに戻る（restart機能を使用）
        await page.evaluate(() => {
            if (window.game) {
                window.game.restart();
            }
        });
        await page.waitForTimeout(1000);
        
        console.log('📸 Taking return to title screenshot...');
        await page.screenshot({ path: 'test_06_return_to_title.png' });
        
        // 対戦モード選択
        await page.click('#start-game-btn');
        await page.waitForTimeout(500);
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(2000);
        
        console.log('📸 Taking battle mode screenshot...');
        await page.screenshot({ path: 'test_07_battle_mode.png' });
        
        // 対戦モードのレイアウト確認
        const battleLayoutCheck = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            const playerCanvas = document.getElementById('player-canvas');
            const cpuCanvas = document.getElementById('cpu-canvas');
            
            return {
                battleScreen: battleScreen ? {
                    display: window.getComputedStyle(battleScreen).display,
                    classList: Array.from(battleScreen.classList),
                    boundingBox: battleScreen.getBoundingClientRect()
                } : null,
                playerCanvas: playerCanvas ? {
                    boundingBox: playerCanvas.getBoundingClientRect()
                } : null,
                cpuCanvas: cpuCanvas ? {
                    boundingBox: cpuCanvas.getBoundingClientRect()
                } : null
            };
        });
        
        console.log('⚔️ Battle layout check:', battleLayoutCheck);
        
        if (battleLayoutCheck.battleScreen && battleLayoutCheck.battleScreen.classList.includes('hidden')) {
            issues.push('❌ Battle screen is hidden when it should be visible');
        }
        
        // === 8. 問題サマリー ===
        console.log('\n📋 ISSUE SUMMARY:');
        if (issues.length === 0) {
            console.log('✅ No issues found! Game is working correctly.');
        } else {
            console.log(`❌ Found ${issues.length} issues:`);
            issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
        }
        
        return issues;
        
    } catch (error) {
        console.error('💥 Test error:', error);
        issues.push(`❌ Test execution error: ${error.message}`);
        return issues;
    } finally {
        await browser.close();
    }
}

testGameplayComprehensive().then(issues => {
    console.log('\n🏁 Test completed.');
    if (issues.length > 0) {
        console.log('🔧 Issues found that need fixing:');
        issues.forEach(issue => console.log(`   ${issue}`));
    }
}).catch(console.error);