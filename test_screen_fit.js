const { chromium } = require('playwright');

async function testScreenFit() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('📺 Testing screen fit...');
        
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
        
        // 画面のフィット状況を確認
        const screenFitInfo = await page.evaluate(() => {
            const canvas = document.getElementById('game-canvas');
            const container = document.querySelector('.container');
            const gameArea = document.querySelector('.game-area');
            const game = window.game;
            
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
            const containerRect = container ? container.getBoundingClientRect() : null;
            const gameAreaRect = gameArea ? gameArea.getBoundingClientRect() : null;
            
            return {
                viewport: viewport,
                
                canvas: canvasRect ? {
                    width: canvasRect.width,
                    height: canvasRect.height,
                    top: canvasRect.top,
                    bottom: canvasRect.bottom,
                    left: canvasRect.left,
                    right: canvasRect.right,
                    fitsVertically: canvasRect.bottom <= viewport.height,
                    fitsHorizontally: canvasRect.right <= viewport.width
                } : null,
                
                container: containerRect ? {
                    width: containerRect.width,
                    height: containerRect.height,
                    top: containerRect.top,
                    bottom: containerRect.bottom,
                    left: containerRect.left,
                    right: containerRect.right,
                    fitsVertically: containerRect.bottom <= viewport.height,
                    fitsHorizontally: containerRect.right <= viewport.width
                } : null,
                
                gameArea: gameAreaRect ? {
                    width: gameAreaRect.width,
                    height: gameAreaRect.height,
                    top: gameAreaRect.top,
                    bottom: gameAreaRect.bottom,
                    fitsVertically: gameAreaRect.bottom <= viewport.height,
                    fitsHorizontally: gameAreaRect.right <= viewport.width
                } : null,
                
                gameSettings: game ? {
                    cellSize: game.CELL_SIZE,
                    boardWidth: game.BOARD_WIDTH,
                    boardHeight: game.BOARD_HEIGHT,
                    expectedCanvasWidth: game.BOARD_WIDTH * game.CELL_SIZE,
                    expectedCanvasHeight: game.BOARD_HEIGHT * game.CELL_SIZE
                } : null
            };
        });
        
        console.log('📊 Screen fit analysis:');
        console.log(`Viewport: ${screenFitInfo.viewport.width}x${screenFitInfo.viewport.height}`);
        
        if (screenFitInfo.canvas) {
            console.log(`Canvas: ${screenFitInfo.canvas.width}x${screenFitInfo.canvas.height}`);
            console.log(`  Position: (${screenFitInfo.canvas.left}, ${screenFitInfo.canvas.top}) to (${screenFitInfo.canvas.right}, ${screenFitInfo.canvas.bottom})`);
            console.log(`  Fits vertically: ${screenFitInfo.canvas.fitsVertically}`);
            console.log(`  Fits horizontally: ${screenFitInfo.canvas.fitsHorizontally}`);
        }
        
        if (screenFitInfo.container) {
            console.log(`Container: ${screenFitInfo.container.width}x${screenFitInfo.container.height}`);
            console.log(`  Position: (${screenFitInfo.container.left}, ${screenFitInfo.container.top}) to (${screenFitInfo.container.right}, ${screenFitInfo.container.bottom})`);
            console.log(`  Fits vertically: ${screenFitInfo.container.fitsVertically}`);
            console.log(`  Fits horizontally: ${screenFitInfo.container.fitsHorizontally}`);
        }
        
        if (screenFitInfo.gameArea) {
            console.log(`Game Area: ${screenFitInfo.gameArea.width}x${screenFitInfo.gameArea.height}`);
            console.log(`  Fits vertically: ${screenFitInfo.gameArea.fitsVertically}`);
            console.log(`  Fits horizontally: ${screenFitInfo.gameArea.fitsHorizontally}`);
        }
        
        if (screenFitInfo.gameSettings) {
            console.log(`Game Settings: Cell=${screenFitInfo.gameSettings.cellSize}, Board=${screenFitInfo.gameSettings.boardWidth}x${screenFitInfo.gameSettings.boardHeight}`);
            console.log(`  Expected Canvas: ${screenFitInfo.gameSettings.expectedCanvasWidth}x${screenFitInfo.gameSettings.expectedCanvasHeight}`);
        }
        
        await page.screenshot({ path: 'screen_fit_test.png' });
        
        // 全体の収まり具合を判定
        const overallFit = screenFitInfo.container && screenFitInfo.container.fitsVertically && screenFitInfo.container.fitsHorizontally;
        console.log(`\n✅ Overall screen fit: ${overallFit ? 'GOOD' : 'NEEDS ADJUSTMENT'}`);
        
        return screenFitInfo;
        
    } catch (error) {
        console.error('💥 Test error:', error);
    } finally {
        await browser.close();
    }
}

testScreenFit().catch(console.error);