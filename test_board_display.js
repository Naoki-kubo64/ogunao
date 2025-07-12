const { chromium } = require('playwright');

async function testBoardDisplay() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🎮 Testing board display...');
        
        // HTMLファイルを直接開く
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(3000); // Wait for GameModeManager initialization
        
        console.log('1️⃣ Starting game...');
        await page.click('#start-game-btn');
        await page.waitForTimeout(1000);
        await page.click('#solo-mode-btn');
        await page.waitForTimeout(1500);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        // キャンバスとゲームボードの情報を取得
        const boardInfo = await page.evaluate(() => {
            const canvas = document.getElementById('game-canvas');
            const game = window.game;
            
            if (!canvas || !game) {
                return { error: 'Canvas or game not found' };
            }
            
            const canvasRect = canvas.getBoundingClientRect();
            const canvasStyle = window.getComputedStyle(canvas);
            
            return {
                // HTMLキャンバス属性
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                
                // CSS computed styles
                cssWidth: canvasStyle.width,
                cssHeight: canvasStyle.height,
                
                // Bounding box
                displayWidth: canvasRect.width,
                displayHeight: canvasRect.height,
                
                // ゲーム設定
                boardWidth: game.BOARD_WIDTH,
                boardHeight: game.BOARD_HEIGHT,
                cellSize: game.CELL_SIZE,
                
                // 計算された期待サイズ
                expectedWidth: game.BOARD_WIDTH * game.CELL_SIZE,
                expectedHeight: game.BOARD_HEIGHT * game.CELL_SIZE,
                
                // その他の情報
                containerInfo: {
                    gameArea: document.querySelector('.game-area') ? {
                        width: document.querySelector('.game-area').getBoundingClientRect().width,
                        height: document.querySelector('.game-area').getBoundingClientRect().height
                    } : null,
                    gameBoard: document.querySelector('.game-board') ? {
                        width: document.querySelector('.game-board').getBoundingClientRect().width,
                        height: document.querySelector('.game-board').getBoundingClientRect().height
                    } : null
                }
            };
        });
        
        console.log('📊 Board display info:', JSON.stringify(boardInfo, null, 2));
        
        // デバッグ用にピースを少し配置してみる
        console.log('2️⃣ Testing piece placement...');
        await page.keyboard.press('ArrowDown'); // ピースを落とす
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'board_display_test.png' });
        
        // 現在の盤面状態を確認
        const boardState = await page.evaluate(() => {
            const game = window.game;
            if (!game) return { error: 'Game not found' };
            
            // 盤面の状態を文字列で表現
            let boardString = '';
            for (let y = 0; y < game.BOARD_HEIGHT; y++) {
                let row = '';
                for (let x = 0; x < game.BOARD_WIDTH; x++) {
                    row += game.board[y][x] === 0 ? '.' : game.board[y][x];
                }
                boardString += `Row ${y.toString().padStart(2, '0')}: ${row}\n`;
            }
            
            return {
                boardString: boardString,
                currentPiece: game.currentPiece ? {
                    x: game.currentPiece.x,
                    y: game.currentPiece.y,
                    colors: game.currentPiece.colors
                } : null
            };
        });
        
        console.log('📋 Board state:');
        console.log(boardState.boardString);
        console.log('Current piece:', boardState.currentPiece);
        
    } catch (error) {
        console.error('💥 Test error:', error);
    } finally {
        await browser.close();
    }
}

testBoardDisplay().catch(console.error);