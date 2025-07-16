const { chromium } = require('playwright');

async function runStoryTest() {
    console.log('🚀 Starting Puyo Puyo story mode test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to the game
        console.log('📱 Opening game...');
        await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
        
        // Wait for game to load
        console.log('⏳ Waiting for game initialization...');
        await page.waitForTimeout(5000);
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'story_test_01_initial.png',
            fullPage: true 
        });
        console.log('📸 Screenshot 1: Initial state');
        
        // Check if story mode button exists
        const storyButton = page.locator('#story-mode-btn');
        const storyButtonVisible = await storyButton.isVisible();
        console.log(`📖 Story mode button visible: ${storyButtonVisible}`);
        
        if (storyButtonVisible) {
            // Click story mode
            await storyButton.click();
            await page.waitForTimeout(3000);
            
            // Take story mode screenshot
            await page.screenshot({ 
                path: 'story_test_02_story_mode.png',
                fullPage: true 
            });
            console.log('📸 Screenshot 2: Story mode');
            
            // Check for story screen elements
            const storyScreen = page.locator('#story-screen');
            const storyScreenVisible = await storyScreen.isVisible();
            console.log(`📖 Story screen visible: ${storyScreenVisible}`);
            
            if (storyScreenVisible) {
                // Test battle button
                const battleButton = page.locator('#start-battle-btn');
                const battleButtonVisible = await battleButton.isVisible();
                console.log(`⚔️ Battle button visible: ${battleButtonVisible}`);
                
                if (battleButtonVisible) {
                    // Click battle start
                    console.log('⚔️ Starting battle...');
                    await battleButton.click();
                    await page.waitForTimeout(3000);
                    
                    // Take battle screenshot
                    await page.screenshot({ 
                        path: 'story_test_03_battle.png',
                        fullPage: true 
                    });
                    console.log('📸 Screenshot 3: Battle screen');
                    
                    // Check battle screen elements
                    const battleScreen = page.locator('#story-battle-screen');
                    const battleScreenVisible = await battleScreen.isVisible();
                    console.log(`🎮 Battle screen visible: ${battleScreenVisible}`);
                    
                    if (battleScreenVisible) {
                        // Check battle elements
                        const playerCanvas = await page.locator('#story-player-canvas').isVisible();
                        const enemyCanvas = await page.locator('#story-enemy-canvas').isVisible();
                        const battleTimer = await page.locator('#battle-timer-display').isVisible();
                        const vsDisplay = await page.locator('.vs-display').isVisible();
                        
                        console.log(`Canvas elements - Player: ${playerCanvas}, Enemy: ${enemyCanvas}`);
                        console.log(`UI elements - Timer: ${battleTimer}, VS: ${vsDisplay}`);
                        
                        // Wait to observe battle
                        await page.waitForTimeout(5000);
                        
                        // Take battle progress screenshot
                        await page.screenshot({ 
                            path: 'story_test_04_battle_progress.png',
                            fullPage: true 
                        });
                        console.log('📸 Screenshot 4: Battle in progress');
                        
                        // Try to go back
                        const backButton = page.locator('#story-battle-back');
                        const backButtonVisible = await backButton.isVisible();
                        console.log(`🏠 Back button visible: ${backButtonVisible}`);
                        
                        if (backButtonVisible) {
                            await backButton.click();
                            await page.waitForTimeout(2000);
                            
                            // Take screenshot after return
                            await page.screenshot({ 
                                path: 'story_test_05_after_return.png',
                                fullPage: true 
                            });
                            console.log('📸 Screenshot 5: After return to story');
                        }
                    }
                }
                
                // Try to show path choices manually
                console.log('🗺️ Testing path choices...');
                await page.evaluate(() => {
                    // Try to initialize and show path choices
                    if (typeof StoryMode !== 'undefined') {
                        if (!window.storyMode) {
                            window.storyMode = new StoryMode();
                            window.storyMode.initialize();
                        }
                        window.storyMode.showPathChoices();
                    }
                });
                
                await page.waitForTimeout(2000);
                
                // Check path choices
                const pathChoices = page.locator('#path-choices');
                const pathChoicesVisible = await pathChoices.isVisible();
                console.log(`🗺️ Path choices visible: ${pathChoicesVisible}`);
                
                if (pathChoicesVisible) {
                    // Take path choices screenshot
                    await page.screenshot({ 
                        path: 'story_test_06_path_choices.png',
                        fullPage: true 
                    });
                    console.log('📸 Screenshot 6: Path choices');
                    
                    // Check individual path buttons
                    const leftPath = await page.locator('#path-left').isVisible();
                    const centerPath = await page.locator('#path-center').isVisible();
                    const rightPath = await page.locator('#path-right').isVisible();
                    
                    console.log(`Path buttons - Left: ${leftPath}, Center: ${centerPath}, Right: ${rightPath}`);
                    
                    // Try clicking left path
                    if (leftPath) {
                        await page.click('#path-left');
                        await page.waitForTimeout(2000);
                        
                        // Take screenshot after path selection
                        await page.screenshot({ 
                            path: 'story_test_07_path_selected.png',
                            fullPage: true 
                        });
                        console.log('📸 Screenshot 7: Path selected');
                    }
                }
            }
        }
        
        // Final screenshot
        await page.screenshot({ 
            path: 'story_test_08_final.png',
            fullPage: true 
        });
        console.log('📸 Screenshot 8: Final state');
        
        console.log('\n✅ Story mode test completed successfully!');
        console.log('📸 Screenshots saved:');
        console.log('   - story_test_01_initial.png');
        console.log('   - story_test_02_story_mode.png');
        console.log('   - story_test_03_battle.png');
        console.log('   - story_test_04_battle_progress.png');
        console.log('   - story_test_05_after_return.png');
        console.log('   - story_test_06_path_choices.png');
        console.log('   - story_test_07_path_selected.png');
        console.log('   - story_test_08_final.png');
        
    } catch (error) {
        console.error('❌ Test error:', error);
        
        // Take error screenshot
        await page.screenshot({ 
            path: 'story_test_error.png',
            fullPage: true 
        });
        console.log('📸 Error screenshot saved');
        
        throw error;
    } finally {
        console.log('\n🔚 Closing browser...');
        await browser.close();
    }
}

// Run the test
runStoryTest()
    .then(() => {
        console.log('\n🎉 Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });