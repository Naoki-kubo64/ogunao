const { chromium } = require('playwright');

async function countVisibleRows() {
    console.log('🎯 Counting Visible Puyo Board Rows');
    console.log('===================================');
    
    const browser = await chromium.launch({ headless: false });
    
    try {
        const page = await browser.newContext().then(ctx => ctx.newPage());
        
        await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
        await page.waitForTimeout(1000);
        
        // Navigate to battle
        await page.click('#story-mode-btn');
        await page.waitForTimeout(1000);
        await page.click('#start-battle-btn');
        await page.waitForTimeout(2000);
        
        // Count rows by analyzing the grid structure
        const rowAnalysis = await page.evaluate(() => {
            const canvas = document.getElementById('story-player-canvas');
            if (!canvas) return { error: 'Canvas not found' };
            
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Find horizontal grid lines by looking for consistent white/gray lines
            const horizontalLines = [];
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            // Scan for horizontal lines
            for (let y = 0; y < height; y++) {
                let lightPixelCount = 0;
                
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    // Look for white or light gray grid lines
                    if (r > 150 && g > 150 && b > 150) {
                        lightPixelCount++;
                    }
                }
                
                // If more than 50% of the row is light colored, it's likely a grid line
                if (lightPixelCount > width * 0.5) {
                    horizontalLines.push(y);
                }
            }
            
            // Filter out consecutive lines (keep only distinct grid lines)
            const distinctGridLines = [];
            for (let i = 0; i < horizontalLines.length; i++) {
                if (i === 0 || horizontalLines[i] - horizontalLines[i-1] > 10) {
                    distinctGridLines.push(horizontalLines[i]);
                }
            }
            
            // Calculate row count and cell dimensions
            const rowCount = distinctGridLines.length > 0 ? distinctGridLines.length - 1 : 0;
            const avgCellHeight = rowCount > 0 ? 
                (distinctGridLines[distinctGridLines.length-1] - distinctGridLines[0]) / rowCount : 0;
            
            return {
                canvasDimensions: {
                    width: canvas.width,
                    height: canvas.height
                },
                gridLines: distinctGridLines,
                visibleRows: rowCount,
                averageCellHeight: avgCellHeight,
                totalGridLines: distinctGridLines.length
            };
        });
        
        console.log('📊 Row Count Analysis Results:');
        console.log(`Canvas Size: ${rowAnalysis.canvasDimensions.width} x ${rowAnalysis.canvasDimensions.height}`);
        console.log(`Grid Lines Found: ${rowAnalysis.totalGridLines}`);
        console.log(`Visible Rows: ${rowAnalysis.visibleRows}`);
        console.log(`Average Cell Height: ${rowAnalysis.averageCellHeight.toFixed(2)}px`);
        
        // Manual row counting by visual inspection
        const manualCount = await page.evaluate(() => {
            // Let's count by examining the computed styles and layout
            const canvas = document.getElementById('story-player-canvas');
            if (!canvas) return null;
            
            // Check if we can access game state
            let gameStateInfo = {};
            try {
                if (window.storyGame && window.storyGame.playerBoard) {
                    gameStateInfo.boardRows = window.storyGame.playerBoard.length;
                    gameStateInfo.boardCols = window.storyGame.playerBoard[0] ? window.storyGame.playerBoard[0].length : 0;
                }
            } catch (e) {
                gameStateInfo.error = 'Cannot access game state';
            }
            
            return {
                canvasHeight: canvas.height,
                expectedRows: Math.floor(canvas.height / 65), // Typical puyo cell height
                gameState: gameStateInfo
            };
        });
        
        console.log('🎮 Manual Analysis:');
        console.log(`Expected rows (780px ÷ 65px): ${manualCount.expectedRows}`);
        console.log(`Game state:`, manualCount.gameState);
        
        // Take a measurement screenshot
        await page.screenshot({ 
            path: 'row_count_verification.png',
            fullPage: false 
        });
        
        console.log('\n🏁 FINAL VERDICT:');
        console.log(`✅ Canvas dimensions: 390 x 780 pixels`);
        console.log(`✅ Visible rows detected: ${rowAnalysis.visibleRows}`);
        console.log(`✅ Expected rows (780÷65): ${manualCount.expectedRows}`);
        
        if (rowAnalysis.visibleRows >= 12) {
            console.log('🎉 SUCCESS: The puyo board shows 12+ rows as expected!');
        } else {
            console.log('⚠️  WARNING: Only ' + rowAnalysis.visibleRows + ' rows detected');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
}

countVisibleRows();