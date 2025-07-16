const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('🔍 次ぷよ表示とパフォーマンステスト開始');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // HTMLファイルを開く
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(2000);
    
    console.log('📸 初期画面スクリーンショット');
    await page.screenshot({ path: 'next_puyo_test_01_initial.png', fullPage: true });
    
    // ストーリーモードに入る
    console.log('🎮 ストーリーモード開始');
    await page.click('#story-mode-btn');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: 'next_puyo_test_02_story_mode.png', fullPage: true });
    
    // 戦闘開始
    console.log('⚔️ 戦闘開始');
    await page.click('#start-battle-btn');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'next_puyo_test_03_battle_screen.png', fullPage: true });
    
    // 次ぷよ表示を確認
    console.log('🔍 次ぷよ表示チェック');
    
    // プレイヤー次ぷよ要素チェック
    const playerNextPuyo = await page.locator('#story-player-next').isVisible();
    console.log('プレイヤー次ぷよ表示:', playerNextPuyo);
    
    // 敵次ぷよ要素チェック
    const enemyNextPuyo = await page.locator('#story-enemy-next').isVisible();
    console.log('敵次ぷよ表示:', enemyNextPuyo);
    
    // Canvas要素の確認
    const playerNextCanvas = await page.locator('#story-player-next canvas').count();
    const enemyNextCanvas = await page.locator('#story-enemy-next canvas').count();
    console.log('プレイヤー次ぷよCanvas数:', playerNextCanvas);
    console.log('敵次ぷよCanvas数:', enemyNextCanvas);
    
    // Canvas サイズ確認
    if (playerNextCanvas > 0) {
        const canvasSize = await page.evaluate(() => {
            const canvas = document.querySelector('#story-player-next canvas');
            return canvas ? { width: canvas.width, height: canvas.height } : null;
        });
        console.log('プレイヤー次ぷよCanvasサイズ:', canvasSize);
    }
    
    // パフォーマンステスト - 基本操作
    console.log('🚀 パフォーマンステスト開始');
    const startTime = Date.now();
    
    // 連続でキー操作を実行
    for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(100);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);
    }
    
    const operationTime = Date.now() - startTime;
    console.log(`⚡ 30回操作完了時間: ${operationTime}ms`);
    
    await page.screenshot({ path: 'next_puyo_test_04_after_operations.png', fullPage: true });
    
    // より詳細な視覚的検証
    console.log('🔍 詳細な次ぷよ表示検証');
    
    // 次ぷよエリアのサイズと位置確認
    const playerNextBounds = await page.locator('#story-player-next').boundingBox();
    const enemyNextBounds = await page.locator('#story-enemy-next').boundingBox();
    
    console.log('プレイヤー次ぷよ領域:', playerNextBounds);
    console.log('敵次ぷよ領域:', enemyNextBounds);
    
    // 右側情報パネルの確認
    const infoPanelVisible = await page.locator('.battle-info-panel').isVisible();
    console.log('右側情報パネル表示:', infoPanelVisible);
    
    // 敵HP表示確認
    const enemyHPVisible = await page.locator('#story-enemy-hp-fill').isVisible();
    const enemyHPText = await page.locator('#story-enemy-hp-text').isVisible();
    console.log('敵HP表示:', enemyHPVisible);
    console.log('敵HPテキスト表示:', enemyHPText);
    
    // 最終スクリーンショット
    await page.screenshot({ path: 'next_puyo_test_05_final_verification.png', fullPage: true });
    
    // フレームレート測定
    console.log('📊 フレームレート測定');
    const frameRateData = await page.evaluate(() => {
        return new Promise((resolve) => {
            let frames = 0;
            const startTime = performance.now();
            
            function countFrame() {
                frames++;
                if (frames < 120) { // 2秒間測定
                    requestAnimationFrame(countFrame);
                } else {
                    const endTime = performance.now();
                    const fps = frames / ((endTime - startTime) / 1000);
                    resolve({ fps: fps.toFixed(2), totalFrames: frames, duration: endTime - startTime });
                }
            }
            requestAnimationFrame(countFrame);
        });
    });
    
    console.log('📈 フレームレート結果:', frameRateData);
    
    // メモリ使用量確認
    const memoryUsage = await page.evaluate(() => {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            };
        }
        return 'メモリ情報取得不可';
    });
    
    console.log('💾 メモリ使用量:', memoryUsage);
    
    console.log('✅ テスト完了');
    console.log('\n=== テスト結果サマリー ===');
    console.log('✓ 次ぷよ表示:', playerNextPuyo && enemyNextPuyo ? '正常' : '問題あり');
    console.log('✓ Canvas生成:', playerNextCanvas > 0 && enemyNextCanvas > 0 ? '正常' : '問題あり');
    console.log('✓ 操作レスポンス:', operationTime < 3000 ? '良好' : '改善必要');
    console.log('✓ フレームレート:', parseFloat(frameRateData.fps) > 30 ? '良好' : '改善必要');
    console.log('✓ 右側パネル:', infoPanelVisible ? '正常' : '問題あり');
    console.log('✓ 敵HP表示:', enemyHPVisible && enemyHPText ? '正常' : '問題あり');
    
    await browser.close();
})();