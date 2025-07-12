const { chromium } = require('playwright');

async function testFullBoardDrop() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🎮 Testing full board drop...');
        
        // HTMLファイルを直接開く
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(3000);
        
        console.log('1️⃣ Starting game...');
        await page.click('#start-game-btn');
        await page.waitForTimeout(1000);
        await page.click('#solo-mode-btn');
        await page.waitForTimeout(1500);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        console.log('2️⃣ Dropping pieces to bottom...');
        
        // ピースを一番下まで落とす（複数回）
        for (let i = 0; i < 10; i++) {
            console.log(`  Drop ${i + 1}...`);
            
            // 矢印キーで少し動かしてからSpace（ハードドロップ）
            if (i % 3 === 0) await page.keyboard.press('ArrowLeft');
            if (i % 3 === 1) await page.keyboard.press('ArrowRight');
            
            await page.keyboard.press('Space'); // ハードドロップ
            await page.waitForTimeout(800); // ピース生成と着地待ち
        }
        
        await page.screenshot({ path: 'full_board_drop_test.png' });
        
        // 盤面の状態を確認
        const finalBoardState = await page.evaluate(() => {
            const game = window.game;
            if (!game) return { error: 'Game not found' };
            
            let boardString = '';
            let bottomRowsWithPieces = 0;
            
            for (let y = 0; y < game.BOARD_HEIGHT; y++) {
                let row = '';
                let hasBlockInRow = false;
                
                for (let x = 0; x < game.BOARD_WIDTH; x++) {
                    const cell = game.board[y][x];
                    row += cell === 0 ? '.' : cell;
                    if (cell !== 0) hasBlockInRow = true;
                }
                
                boardString += `Row ${y.toString().padStart(2, '0')}: ${row}\n`;
                
                // 下5行のうちブロックがある行をカウント
                if (y >= 7 && hasBlockInRow) {
                    bottomRowsWithPieces++;
                }
            }
            
            return {
                boardString: boardString,
                bottomRowsWithPieces: bottomRowsWithPieces,
                gameRunning: game.gameRunning
            };
        });
        
        console.log('📋 Final board state:');
        console.log(finalBoardState.boardString);
        console.log(`Bottom rows with pieces: ${finalBoardState.bottomRowsWithPieces}`);
        console.log(`Game still running: ${finalBoardState.gameRunning}`);
        
    } catch (error) {
        console.error('💥 Test error:', error);
    } finally {
        await browser.close();
    }
}

testFullBoardDrop().catch(console.error);