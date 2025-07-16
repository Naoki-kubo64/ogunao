const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// テスト結果を保存するディレクトリ
const testResultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
}

console.log('🎮 ぷよ落下システム・操作系テスト開始');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // コンソールメッセージをキャプチャ
    const consoleMessages = [];
    page.on('console', msg => {
        const message = `[${msg.type().toUpperCase()}] ${msg.text()}`;
        consoleMessages.push(message);
        console.log('📝 Console:', message);
    });

    // エラーメッセージをキャプチャ
    page.on('pageerror', error => {
        const errorMessage = `❌ Page Error: ${error.message}`;
        consoleMessages.push(errorMessage);
        console.log(errorMessage);
    });

    try {
        console.log('🌐 ゲームページを開いています...');
        await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        // 初期スクリーンショット
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_01_initial.png'),
            fullPage: true 
        });
        console.log('📸 初期画面をキャプチャしました');

        console.log('📖 ストーリーモードに移行...');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(1000);

        // ストーリーモード画面のスクリーンショット
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_02_story_mode.png'),
            fullPage: true 
        });

        console.log('⚔️ 戦闘開始ボタンをクリック...');
        await page.click('#start-battle-btn');
        await page.waitForTimeout(3000); // 戦闘画面の初期化を待つ

        // 戦闘画面のスクリーンショット
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_03_battle_started.png'),
            fullPage: true 
        });

        console.log('🔍 戦闘画面の要素を確認中...');
        
        // キャンバス要素の存在確認
        const playerCanvas = await page.$('#story-player-canvas');
        const enemyCanvas = await page.$('#story-enemy-canvas');
        
        if (playerCanvas && enemyCanvas) {
            console.log('✅ プレイヤーとエネミーのキャンバスが存在します');
        } else {
            console.log('❌ キャンバス要素が見つかりません');
        }

        // ゲームロジックの初期化を待つ
        await page.waitForTimeout(2000);

        console.log('🎮 ぷよ落下システムのテスト開始...');
        
        // ぷよ落下の観察（10秒間）
        console.log('👀 10秒間ぷよ落下を観察します...');
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(1000);
            console.log(`⏰ 観察中... ${i + 1}/10秒`);
            
            // 3秒、6秒、9秒後にスクリーンショット
            if (i === 2 || i === 5 || i === 8) {
                await page.screenshot({ 
                    path: path.join(testResultsDir, `puyo_test_04_falling_${i + 1}sec.png`),
                    fullPage: true 
                });
                console.log(`📸 ${i + 1}秒後のスクリーンショット取得`);
            }
        }

        console.log('🎯 プレイヤーコントロールのテスト開始...');

        // 左移動テスト（Aキー）
        console.log('⬅️ Aキー（左移動）テスト...');
        await page.keyboard.press('a');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_05_left_movement.png'),
            fullPage: true 
        });

        // 右移動テスト（Dキー）
        console.log('➡️ Dキー（右移動）テスト...');
        await page.keyboard.press('d');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_06_right_movement.png'),
            fullPage: true 
        });

        // 下移動テスト（Sキー）
        console.log('⬇️ Sキー（下移動）テスト...');
        await page.keyboard.press('s');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_07_down_movement.png'),
            fullPage: true 
        });

        // 回転テスト（Spaceキー）
        console.log('🔄 Spaceキー（回転）テスト...');
        await page.keyboard.press(' ');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_08_rotation.png'),
            fullPage: true 
        });

        console.log('🎮 連続操作テスト...');
        // 連続操作（組み合わせ）
        await page.keyboard.press('a');
        await page.waitForTimeout(200);
        await page.keyboard.press('s');
        await page.waitForTimeout(200);
        await page.keyboard.press(' ');
        await page.waitForTimeout(500);
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_09_combined_controls.png'),
            fullPage: true 
        });

        console.log('🔄 複数の操作サイクルを実行...');
        // 複数サイクルの操作テスト
        for (let cycle = 0; cycle < 3; cycle++) {
            console.log(`🔄 操作サイクル ${cycle + 1}/3`);
            
            // 左→右→下→回転のパターン
            await page.keyboard.press('a');
            await page.waitForTimeout(300);
            await page.keyboard.press('d');
            await page.waitForTimeout(300);
            await page.keyboard.press('s');
            await page.waitForTimeout(300);
            await page.keyboard.press(' ');
            await page.waitForTimeout(500);
            
            await page.screenshot({ 
                path: path.join(testResultsDir, `puyo_test_10_cycle_${cycle + 1}.png`),
                fullPage: true 
            });
        }

        console.log('⏱️ 長時間観察テスト（ぷよの配置と連鎖観察）...');
        // 20秒間の長時間観察でぷよの配置を観察
        for (let i = 0; i < 20; i++) {
            await page.waitForTimeout(1000);
            
            // 時々操作を入れる
            if (i % 3 === 0) {
                await page.keyboard.press('a');
            } else if (i % 3 === 1) {
                await page.keyboard.press('d');
            } else {
                await page.keyboard.press('s');
            }
            
            // 5秒間隔でスクリーンショット
            if (i % 5 === 4) {
                await page.screenshot({ 
                    path: path.join(testResultsDir, `puyo_test_11_longrun_${Math.floor(i/5) + 1}.png`),
                    fullPage: true 
                });
                console.log(`📸 長時間テスト ${Math.floor(i/5) + 1}/4 スクリーンショット取得`);
            }
        }

        console.log('🎯 チェイン検出テスト...');
        // 意図的に連鎖を狙う操作
        for (let i = 0; i < 10; i++) {
            // 左右に移動して配置を狙う
            if (i % 2 === 0) {
                await page.keyboard.press('a');
                await page.keyboard.press('a');
            } else {
                await page.keyboard.press('d');
                await page.keyboard.press('d');
            }
            await page.keyboard.press('s');
            await page.waitForTimeout(800);
        }

        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_12_chain_attempt.png'),
            fullPage: true 
        });

        console.log('📊 最終状態のスクリーンショット...');
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_13_final_state.png'),
            fullPage: true 
        });

        // コンソールログ解析
        console.log('\n📝 コンソールメッセージ解析:');
        const spawnMessages = consoleMessages.filter(msg => msg.includes('新しいぷよをスポーン'));
        const placeMessages = consoleMessages.filter(msg => msg.includes('ぷよ配置完了'));
        const matchMessages = consoleMessages.filter(msg => msg.includes('マッチを発見'));
        const errorMessages = consoleMessages.filter(msg => msg.includes('ERROR') || msg.includes('Error'));

        console.log(`🟢 ぷよスポーンメッセージ: ${spawnMessages.length}回`);
        console.log(`📍 ぷよ配置メッセージ: ${placeMessages.length}回`);
        console.log(`🔥 マッチ検出メッセージ: ${matchMessages.length}回`);
        console.log(`❌ エラーメッセージ: ${errorMessages.length}回`);

        // レポート生成
        const report = {
            testDate: new Date().toISOString(),
            testDuration: '約60秒',
            screenshots: 13,
            consoleAnalysis: {
                spawnCount: spawnMessages.length,
                placementCount: placeMessages.length,
                matchCount: matchMessages.length,
                errorCount: errorMessages.length
            },
            controlsTested: ['A (左移動)', 'D (右移動)', 'S (下移動)', 'Space (回転)'],
            observations: [
                'ぷよ落下システムの動作確認',
                'プレイヤーコントロールの応答性確認',
                'キャンバス描画の確認',
                'コンソールメッセージの監視'
            ],
            allMessages: consoleMessages
        };

        // レポートをファイルに保存
        fs.writeFileSync(
            path.join(testResultsDir, 'puyo_mechanics_test_report.json'),
            JSON.stringify(report, null, 2)
        );

        console.log('\n🎉 ぷよメカニクステスト完了!');
        console.log(`📁 結果は ${testResultsDir} フォルダに保存されました`);
        console.log(`📊 レポートファイル: puyo_mechanics_test_report.json`);

    } catch (error) {
        console.error('❌ テスト中にエラーが発生しました:', error);
        await page.screenshot({ 
            path: path.join(testResultsDir, 'puyo_test_error.png'),
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
})();