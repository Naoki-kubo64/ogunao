const { chromium } = require('playwright');

async function manualBoardAnalysis() {
    console.log('🔍 Manual Puyo Board Analysis');
    console.log('=============================');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1200, height: 800 }
        });
        const page = await context.newPage();
        
        await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
        await page.waitForTimeout(1000);
        
        // Navigate to story mode and battle
        await page.click('#story-mode-btn');
        await page.waitForTimeout(1000);
        await page.click('#start-battle-btn');
        await page.waitForTimeout(2000);
        
        // Analyze the board display
        const boardAnalysis = await page.evaluate(() => {
            const playerCanvas = document.getElementById('story-player-canvas');
            const enemyCanvas = document.getElementById('story-enemy-canvas');
            
            const analysis = {
                timestamp: new Date().toISOString(),
                canvasesFound: {
                    player: !!playerCanvas,
                    enemy: !!enemyCanvas
                }
            };
            
            if (playerCanvas) {
                const playerRect = playerCanvas.getBoundingClientRect();
                analysis.playerCanvas = {
                    // HTML attributes
                    htmlWidth: playerCanvas.width,
                    htmlHeight: playerCanvas.height,
                    // CSS computed dimensions
                    clientWidth: playerCanvas.clientWidth,
                    clientHeight: playerCanvas.clientHeight,
                    // Actual displayed dimensions
                    displayWidth: playerRect.width,
                    displayHeight: playerRect.height,
                    // Position
                    left: playerRect.left,
                    top: playerRect.top,
                    // CSS styles
                    cssWidth: getComputedStyle(playerCanvas).width,
                    cssHeight: getComputedStyle(playerCanvas).height
                };
            }
            
            if (enemyCanvas) {
                const enemyRect = enemyCanvas.getBoundingClientRect();
                analysis.enemyCanvas = {
                    htmlWidth: enemyCanvas.width,
                    htmlHeight: enemyCanvas.height,
                    clientWidth: enemyCanvas.clientWidth,
                    clientHeight: enemyCanvas.clientHeight,
                    displayWidth: enemyRect.width,
                    displayHeight: enemyRect.height,
                    left: enemyRect.left,
                    top: enemyRect.top,
                    cssWidth: getComputedStyle(enemyCanvas).width,
                    cssHeight: getComputedStyle(enemyCanvas).height
                };
            }
            
            // Count visible grid rows by analyzing the canvas visually
            // Look for grid lines or calculate based on dimensions
            if (playerCanvas && playerCanvas.height) {
                // Assuming each cell is roughly the same size
                // Standard puyo cell size is usually around 30px
                const estimatedCellSize = 30;
                analysis.estimatedRows = Math.floor(playerCanvas.height / estimatedCellSize);
                analysis.estimatedCols = Math.floor(playerCanvas.width / estimatedCellSize);
            }
            
            return analysis;
        });
        
        console.log('📊 Detailed Board Analysis:');
        console.log(JSON.stringify(boardAnalysis, null, 2));
        
        // Count visible rows by manually inspecting the grid
        const rowCountAnalysis = await page.evaluate(() => {
            const playerCanvas = document.getElementById('story-player-canvas');
            if (!playerCanvas) return { error: 'No player canvas found' };
            
            const ctx = playerCanvas.getContext('2d');
            const width = playerCanvas.width;
            const height = playerCanvas.height;
            
            // Get image data to analyze the grid
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // Look for horizontal grid lines (white/light colored lines)
            const horizontalLines = [];
            const threshold = 200; // White-ish threshold
            
            for (let y = 0; y < height; y++) {
                let whitePixelCount = 0;
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    if (r > threshold && g > threshold && b > threshold) {
                        whitePixelCount++;
                    }
                }
                
                // If more than 70% of pixels in this row are white-ish, it's likely a grid line
                if (whitePixelCount > width * 0.7) {
                    horizontalLines.push(y);
                }
            }
            
            // Filter consecutive lines to get distinct rows
            const distinctLines = [];
            for (let i = 0; i < horizontalLines.length; i++) {
                if (i === 0 || horizontalLines[i] - horizontalLines[i-1] > 5) {
                    distinctLines.push(horizontalLines[i]);
                }
            }
            
            return {
                canvasHeight: height,
                canvasWidth: width,
                horizontalGridLines: distinctLines.length,
                estimatedRows: distinctLines.length > 0 ? distinctLines.length - 1 : 0,
                cellHeight: distinctLines.length > 1 ? 
                    (distinctLines[distinctLines.length-1] - distinctLines[0]) / (distinctLines.length - 1) : 0
            };
        });
        
        console.log('📏 Row Count Analysis:');
        console.log(JSON.stringify(rowCountAnalysis, null, 2));
        
        // Take a detailed screenshot
        await page.screenshot({ 
            path: 'manual_analysis_detailed.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1200, height: 800 }
        });
        
        console.log('✅ Manual analysis complete!');
        console.log('📸 Detailed screenshot saved as: manual_analysis_detailed.png');
        
        // Keep browser open for manual inspection
        console.log('🔍 Browser kept open for manual inspection...');
        console.log('Press Ctrl+C to close when done');
        
        // Wait indefinitely until user closes
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

manualBoardAnalysis().catch(console.error);