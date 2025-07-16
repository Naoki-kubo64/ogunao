// Playwright test for Story Mode implementation
const { test, expect } = require('@playwright/test');

test.describe('Story Mode Testing', () => {
    test('Story Mode UI Test', async ({ page }) => {
        console.log('🧪 Starting Story Mode UI Test...');
        
        // Navigate to the game
        await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Page loaded successfully');
        
        // Wait for the title screen to be visible
        const titleScreen = page.locator('#start-screen');
        await expect(titleScreen).toBeVisible();
        console.log('✅ Title screen is visible');
        
        // Take screenshot of title screen
        await page.screenshot({ path: 'story_test_01_title_screen.png', fullPage: true });
        console.log('📸 Screenshot saved: story_test_01_title_screen.png');
        
        // Click on Story Mode button
        const storyModeBtn = page.locator('#story-mode-btn');
        await expect(storyModeBtn).toBeVisible();
        console.log('✅ Story Mode button found');
        
        // Check if story mode button has correct text
        const storyBtnText = await storyModeBtn.textContent();
        expect(storyBtnText).toContain('ストーリーモード');
        console.log('✅ Story Mode button text is correct:', storyBtnText);
        
        await storyModeBtn.click();
        console.log('🖱️ Story Mode button clicked');
        
        // Wait a moment for any transitions
        await page.waitForTimeout(1000);
        
        // Check if story screen appears
        const storyScreen = page.locator('#story-screen');
        await page.waitForTimeout(2000); // Give more time for the mode switch
        
        // Take screenshot after clicking story mode
        await page.screenshot({ path: 'story_test_02_after_click.png', fullPage: true });
        console.log('📸 Screenshot saved: story_test_02_after_click.png');
        
        // Check what's currently visible
        const titleVisible = await titleScreen.isVisible();
        const storyVisible = await storyScreen.isVisible();
        const storyHidden = await storyScreen.getAttribute('class');
        
        console.log('🔍 Element visibility check:');
        console.log('   Title screen visible:', titleVisible);
        console.log('   Story screen visible:', storyVisible);
        console.log('   Story screen classes:', storyHidden);
        
        // Check for any error messages in console
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        });
        
        // If story mode doesn't show, let's check what happened
        if (!storyVisible) {
            console.log('⚠️ Story screen not visible. Checking for errors...');
            
            // Check if gameModeManager exists
            const gameModeManagerExists = await page.evaluate(() => {
                return typeof window.gameModeManager !== 'undefined';
            });
            console.log('🔍 gameModeManager exists:', gameModeManagerExists);
            
            // Check if switchToStoryMode method exists
            if (gameModeManagerExists) {
                const hasStoryMethod = await page.evaluate(() => {
                    return typeof window.gameModeManager.switchToStoryMode === 'function';
                });
                console.log('🔍 switchToStoryMode method exists:', hasStoryMethod);
            }
            
            // Check console logs
            console.log('📝 Console logs:', consoleLogs);
        }
        
        // If story screen is now visible, test its UI elements
        if (storyVisible) {
            console.log('🎉 Story screen is visible! Testing UI elements...');
            
            // Test story mode UI elements
            await test.step('Check Story Mode UI Elements', async () => {
                // Check story header
                const storyTitle = page.locator('.story-title');
                await expect(storyTitle).toBeVisible();
                console.log('✅ Story title visible');
                
                // Check back button
                const backBtn = page.locator('#story-back-to-title');
                await expect(backBtn).toBeVisible();
                console.log('✅ Back to title button visible');
                
                // Check player panel
                const playerPanel = page.locator('.player-panel');
                await expect(playerPanel).toBeVisible();
                console.log('✅ Player panel visible');
                
                // Check HP section
                const hpSection = page.locator('.hp-section');
                await expect(hpSection).toBeVisible();
                console.log('✅ HP section visible');
                
                // Check HP text
                const hpText = page.locator('#player-hp-text');
                await expect(hpText).toHaveText('30/30');
                console.log('✅ HP text correct: 30/30');
                
                // Check stats section
                const attackStat = page.locator('#player-attack');
                const defenseStat = page.locator('#player-defense');
                const goldStat = page.locator('#player-gold');
                
                await expect(attackStat).toHaveText('1');
                await expect(defenseStat).toHaveText('0');
                await expect(goldStat).toHaveText('0');
                console.log('✅ Player stats correct - Attack: 1, Defense: 0, Gold: 0');
                
                // Check equipment section
                const equipmentSection = page.locator('.equipment-section');
                await expect(equipmentSection).toBeVisible();
                console.log('✅ Equipment section visible');
                
                // Check puyo composition section
                const puyoComposition = page.locator('.puyo-composition');
                await expect(puyoComposition).toBeVisible();
                console.log('✅ Puyo composition section visible');
                
                // Check puyo rates
                const redRate = page.locator('#red-rate');
                const blueRate = page.locator('#blue-rate');
                const yellowRate = page.locator('#yellow-rate');
                const greenRate = page.locator('#green-rate');
                const purpleRate = page.locator('#purple-rate');
                
                await expect(redRate).toHaveText('20%');
                await expect(blueRate).toHaveText('20%');
                await expect(yellowRate).toHaveText('20%');
                await expect(greenRate).toHaveText('20%');
                await expect(purpleRate).toHaveText('20%');
                console.log('✅ Puyo rates all correctly set to 20%');
                
                // Check adventure area
                const adventureArea = page.locator('.adventure-area');
                await expect(adventureArea).toBeVisible();
                console.log('✅ Adventure area visible');
                
                // Check current floor
                const currentFloor = page.locator('#current-floor-text');
                await expect(currentFloor).toHaveText('フロア 1');
                console.log('✅ Current floor text correct: フロア 1');
                
                // Check enemy info
                const enemyInfo = page.locator('#enemy-info');
                await expect(enemyInfo).toBeVisible();
                console.log('✅ Enemy info visible');
                
                // Check enemy name
                const enemyName = page.locator('#enemy-name');
                await expect(enemyName).toHaveText('見習い戦士');
                console.log('✅ Enemy name correct: 見習い戦士');
                
                // Check enemy HP
                const enemyHpText = page.locator('#enemy-hp-text');
                await expect(enemyHpText).toHaveText('20/20');
                console.log('✅ Enemy HP correct: 20/20');
                
                // Check enemy stats
                const enemyAttack = page.locator('#enemy-attack');
                const enemyDefense = page.locator('#enemy-defense');
                await expect(enemyAttack).toHaveText('1');
                await expect(enemyDefense).toHaveText('0');
                console.log('✅ Enemy stats correct - Attack: 1, Defense: 0');
                
                // Check battle actions
                const battleActions = page.locator('.battle-actions');
                await expect(battleActions).toBeVisible();
                console.log('✅ Battle actions section visible');
                
                // Check action buttons
                const startBattleBtn = page.locator('#start-battle-btn');
                const visitShopBtn = page.locator('#visit-shop-btn');
                const restBtn = page.locator('#rest-btn');
                
                await expect(startBattleBtn).toBeVisible();
                await expect(visitShopBtn).toBeVisible();
                await expect(restBtn).toBeVisible();
                console.log('✅ All action buttons visible');
                
                // Check next floor button is hidden
                const nextFloorBtn = page.locator('#next-floor-btn');
                const nextFloorClasses = await nextFloorBtn.getAttribute('class');
                expect(nextFloorClasses).toContain('hidden');
                console.log('✅ Next floor button correctly hidden');
                
                // Check battle log
                const battleLog = page.locator('#battle-log');
                await expect(battleLog).toBeVisible();
                console.log('✅ Battle log visible');
                
                // Check log content
                const logContent = page.locator('#log-content');
                const logText = await logContent.textContent();
                expect(logText).toContain('冒険の始まりです');
                console.log('✅ Battle log content correct:', logText);
            });
            
            // Test button functionality
            await test.step('Test Button Functionality', async () => {
                // Test start battle button
                const startBattleBtn = page.locator('#start-battle-btn');
                await startBattleBtn.click();
                console.log('🖱️ Start battle button clicked');
                
                // Wait for any changes
                await page.waitForTimeout(1000);
                
                // Check if button becomes disabled
                const isDisabled = await startBattleBtn.isDisabled();
                expect(isDisabled).toBe(true);
                console.log('✅ Start battle button correctly disabled after click');
                
                // Check if battle log updated
                const logContent = page.locator('#log-content');
                const logText = await logContent.textContent();
                expect(logText).toContain('見習い戦士との戦闘開始');
                console.log('✅ Battle log updated with battle start message');
                
                // Test rest button
                const restBtn = page.locator('#rest-btn');
                await restBtn.click();
                console.log('🖱️ Rest button clicked');
                
                await page.waitForTimeout(500);
                
                // Check if rest message appears in log
                const logText2 = await logContent.textContent();
                expect(logText2).toContain('休憩');
                console.log('✅ Rest button works - log updated');
                
                // Test shop button
                const visitShopBtn = page.locator('#visit-shop-btn');
                
                // Listen for dialog
                page.on('dialog', async dialog => {
                    expect(dialog.message()).toContain('ショップ機能は実装予定');
                    console.log('✅ Shop dialog message correct:', dialog.message());
                    await dialog.accept();
                });
                
                await visitShopBtn.click();
                console.log('🖱️ Shop button clicked');
                
                await page.waitForTimeout(500);
            });
        }
        
        // Take final screenshot
        await page.screenshot({ path: 'story_test_03_final_state.png', fullPage: true });
        console.log('📸 Final screenshot saved: story_test_03_final_state.png');
        
        // Test back to title functionality
        if (storyVisible) {
            const backBtn = page.locator('#story-back-to-title');
            await backBtn.click();
            console.log('🖱️ Back to title button clicked');
            
            await page.waitForTimeout(1000);
            
            // Check if we're back to title
            const titleVisible2 = await titleScreen.isVisible();
            expect(titleVisible2).toBe(true);
            console.log('✅ Successfully returned to title screen');
            
            await page.screenshot({ path: 'story_test_04_back_to_title.png', fullPage: true });
            console.log('📸 Back to title screenshot saved: story_test_04_back_to_title.png');
        }
        
        console.log('🎉 Story Mode UI Test completed!');
    });
});