const { chromium } = require('playwright');

async function comprehensiveGameplayTest() {
    console.log('🎮 Starting Comprehensive Puyo Puyo Gameplay Usability Test');
    console.log('=====================================================');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100 // Slow down for better observation
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to the game
        console.log('📂 Loading game...');
        await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
        await page.waitForTimeout(2000);
        
        console.log('📸 Taking initial screenshot...');
        await page.screenshot({ 
            path: 'gameplay_test_01_title.png', 
            fullPage: true 
        });

        // Enter Story Mode
        console.log('🎯 Navigating to Story Mode...');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: 'gameplay_test_02_story_mode.png', 
            fullPage: true 
        });

        // Start Battle
        console.log('⚔️ Starting story battle...');
        await page.click('#start-battle-btn');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: 'gameplay_test_03_battle_start.png', 
            fullPage: true 
        });

        console.log('🎮 Beginning gameplay tests...');
        
        // Test 1: Basic Movement Controls
        console.log('Test 1: Testing basic movement controls...');
        
        // Test left movement (A key)
        console.log('- Testing left movement (A key)');
        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('a');
            await page.waitForTimeout(200);
        }
        
        // Test right movement (D key)
        console.log('- Testing right movement (D key)');
        for (let i = 0; i < 6; i++) {
            await page.keyboard.press('d');
            await page.waitForTimeout(200);
        }
        
        // Test rotation (Space key)
        console.log('- Testing rotation (Space key)');
        for (let i = 0; i < 4; i++) {
            await page.keyboard.press('Space');
            await page.waitForTimeout(300);
        }
        
        // Test fast drop (S key)
        console.log('- Testing fast drop (S key)');
        await page.keyboard.press('s');
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
            path: 'gameplay_test_04_basic_controls.png', 
            fullPage: true 
        });

        // Test 2: Building chains - attempt to create a 4-puyo chain
        console.log('Test 2: Attempting to build a 4-puyo chain...');
        
        // Strategy: Try to build up same colors by strategic placement
        for (let turn = 0; turn < 10; turn++) {
            console.log(`- Chain building turn ${turn + 1}`);
            
            // Move to different positions and try to stack
            const positions = [1, 2, 3, 4, 5];
            const targetPosition = positions[turn % positions.length];
            
            // Move to target position
            for (let i = 0; i < targetPosition; i++) {
                await page.keyboard.press('d');
                await page.waitForTimeout(100);
            }
            
            // Rotate a few times to try different orientations
            const rotations = Math.floor(Math.random() * 4);
            for (let r = 0; r < rotations; r++) {
                await page.keyboard.press('Space');
                await page.waitForTimeout(150);
            }
            
            // Drop the piece
            await page.keyboard.press('s');
            await page.waitForTimeout(800); // Wait for piece to settle and chains to process
        }
        
        await page.screenshot({ 
            path: 'gameplay_test_05_chain_building.png', 
            fullPage: true 
        });

        // Test 3: Full board height usage
        console.log('Test 3: Testing full 12-row board height usage...');
        
        // Try to fill up multiple columns to test the full height
        for (let column = 0; column < 6; column++) {
            console.log(`- Building up column ${column + 1}`);
            
            // Move to the column
            await page.keyboard.press('a'); // Reset to left
            await page.waitForTimeout(100);
            for (let i = 0; i < column; i++) {
                await page.keyboard.press('d');
                await page.waitForTimeout(100);
            }
            
            // Drop 3-4 pieces in this column
            for (let pieces = 0; pieces < 4; pieces++) {
                await page.keyboard.press('s');
                await page.waitForTimeout(600);
            }
        }
        
        await page.screenshot({ 
            path: 'gameplay_test_06_full_height_test.png', 
            fullPage: true 
        });

        // Test 4: Complex strategic play
        console.log('Test 4: Testing complex strategic gameplay...');
        
        // Try to create a more complex setup
        for (let move = 0; move < 15; move++) {
            console.log(`- Strategic move ${move + 1}`);
            
            // Vary the strategy based on move number
            if (move % 3 === 0) {
                // Focus on left side
                await page.keyboard.press('a');
                await page.waitForTimeout(100);
                await page.keyboard.press('a');
                await page.waitForTimeout(100);
            } else if (move % 3 === 1) {
                // Focus on center
                await page.keyboard.press('d');
                await page.waitForTimeout(100);
                await page.keyboard.press('d');
                await page.waitForTimeout(100);
            } else {
                // Focus on right side
                await page.keyboard.press('d');
                await page.waitForTimeout(100);
                await page.keyboard.press('d');
                await page.waitForTimeout(100);
                await page.keyboard.press('d');
                await page.waitForTimeout(100);
            }
            
            // Random rotations for variety
            const rots = Math.floor(Math.random() * 3);
            for (let r = 0; r < rots; r++) {
                await page.keyboard.press('Space');
                await page.waitForTimeout(150);
            }
            
            // Drop
            await page.keyboard.press('s');
            await page.waitForTimeout(700);
        }
        
        await page.screenshot({ 
            path: 'gameplay_test_07_strategic_play.png', 
            fullPage: true 
        });

        // Test 5: Edge case testing - try to fill a column completely
        console.log('Test 5: Testing edge case - filling column to top...');
        
        // Reset to leftmost position
        for (let i = 0; i < 6; i++) {
            await page.keyboard.press('a');
            await page.waitForTimeout(50);
        }
        
        // Fill the first column as much as possible
        for (let i = 0; i < 8; i++) {
            console.log(`- Filling column, piece ${i + 1}`);
            await page.keyboard.press('s');
            await page.waitForTimeout(800);
        }
        
        await page.screenshot({ 
            path: 'gameplay_test_08_column_fill.png', 
            fullPage: true 
        });

        // Test 6: Rapid control testing
        console.log('Test 6: Testing rapid control responsiveness...');
        
        // Test rapid movements and rotations
        for (let i = 0; i < 5; i++) {
            console.log(`- Rapid control test ${i + 1}`);
            
            // Rapid left-right
            await page.keyboard.press('a');
            await page.waitForTimeout(50);
            await page.keyboard.press('d');
            await page.waitForTimeout(50);
            await page.keyboard.press('a');
            await page.waitForTimeout(50);
            await page.keyboard.press('d');
            await page.waitForTimeout(50);
            
            // Rapid rotations
            await page.keyboard.press('Space');
            await page.waitForTimeout(50);
            await page.keyboard.press('Space');
            await page.waitForTimeout(50);
            
            // Fast drop
            await page.keyboard.press('s');
            await page.waitForTimeout(600);
        }
        
        await page.screenshot({ 
            path: 'gameplay_test_09_rapid_controls.png', 
            fullPage: true 
        });

        // Test 7: Final assessment screenshot
        console.log('Test 7: Taking final assessment screenshot...');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: 'gameplay_test_10_final_state.png', 
            fullPage: true 
        });

        // Check game elements for functionality assessment
        console.log('🔍 Assessing game elements...');
        
        // Check if canvas is properly sized for 12 rows
        const canvas = await page.$('#story-player-canvas');
        if (canvas) {
            const canvasSize = await canvas.boundingBox();
            console.log(`Canvas dimensions: ${canvasSize.width}x${canvasSize.height}`);
            
            // Expected: 390x780 (65px per row * 12 rows)
            if (canvasSize.height === 780) {
                console.log('✅ Canvas height correctly set for 12 rows');
            } else {
                console.log(`❌ Canvas height issue: expected 780, got ${canvasSize.height}`);
            }
        }
        
        // Check if game is responsive
        const gameStatus = await page.evaluate(() => {
            return {
                gameRunning: typeof game !== 'undefined',
                canvasExists: document.getElementById('story-player-canvas') !== null,
                boardHeight: window.BOARD_HEIGHT || 'undefined'
            };
        });
        
        console.log('Game Status:', gameStatus);

        console.log('🎯 Gameplay test completed!');
        console.log('📁 Screenshots saved with prefix "gameplay_test_"');
        
    } catch (error) {
        console.error('❌ Error during gameplay testing:', error);
        await page.screenshot({ 
            path: 'gameplay_test_error.png', 
            fullPage: true 
        });
    } finally {
        await browser.close();
    }
}

// Run the test
comprehensiveGameplayTest().catch(console.error);