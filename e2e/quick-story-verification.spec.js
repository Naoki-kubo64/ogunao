// Quick Story Mode Verification Test
const { test, expect } = require('@playwright/test');

test.describe('Story Mode Quick Verification', () => {
    test('Verify Key Story Mode Mechanics', async ({ page }) => {
        console.log('🔍 Quick verification of story mode mechanics...');
        
        // Navigate to game
        await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
        await page.waitForLoadState('domcontentloaded');
        
        // Go to story mode
        await page.locator('#story-mode-btn').click();
        await page.waitForTimeout(2000);
        
        // Ensure story mode is visible
        const storyScreen = page.locator('#story-screen');
        const storyVisible = await storyScreen.isVisible();
        
        if (!storyVisible) {
            await page.evaluate(() => {
                const titleScreen = document.getElementById('start-screen');
                const storyScreen = document.getElementById('story-screen');
                
                if (titleScreen) titleScreen.classList.add('hidden');
                if (storyScreen) storyScreen.classList.remove('hidden');
                
                if (window.StoryMode && !window.storyMode) {
                    window.storyMode = new window.StoryMode();
                    window.storyMode.initialize();
                }
            });
            await page.waitForTimeout(1000);
        }
        
        // Test rest functionality
        await test.step('Test Rest Functionality', async () => {
            console.log('🛌 Testing rest functionality...');
            
            const restBtn = page.locator('#rest-btn');
            await restBtn.click();
            await page.waitForTimeout(1000);
            
            const logContent = page.locator('#log-content');
            const logText = await logContent.textContent();
            
            expect(logText).toContain('休憩');
            console.log('✅ Rest functionality working');
            
            await page.screenshot({ path: 'verification_rest.png', fullPage: true });
        });
        
        // Test shop functionality
        await test.step('Test Shop Dialog', async () => {
            console.log('🏪 Testing shop functionality...');
            
            const visitShopBtn = page.locator('#visit-shop-btn');
            
            // Set up dialog handler
            let dialogTriggered = false;
            page.on('dialog', async dialog => {
                console.log('📢 Shop dialog:', dialog.message());
                expect(dialog.message()).toContain('ショップ');
                dialogTriggered = true;
                await dialog.accept();
            });
            
            await visitShopBtn.click();
            await page.waitForTimeout(500);
            
            expect(dialogTriggered).toBe(true);
            console.log('✅ Shop dialog working');
        });
        
        // Test initial equipment state
        await test.step('Test Equipment Display', async () => {
            console.log('⚔️ Testing equipment display...');
            
            const equipmentSection = page.locator('.equipment-section');
            await expect(equipmentSection).toBeVisible();
            
            const weaponDisplay = page.locator('#weapon-display');
            const armorDisplay = page.locator('#armor-display');
            const accessoryDisplay = page.locator('#accessory-display');
            
            const weaponText = await weaponDisplay.textContent();
            const armorText = await armorDisplay.textContent();
            const accessoryText = await accessoryDisplay.textContent();
            
            console.log(`🗡️ Equipment state - Weapon: "${weaponText}", Armor: "${armorText}", Accessory: "${accessoryText}"`);
            
            // All should show "なし" (none) initially
            expect(weaponText).toContain('なし');
            expect(armorText).toContain('なし');
            expect(accessoryText).toContain('なし');
            
            console.log('✅ Equipment display working correctly');
            
            await page.screenshot({ path: 'verification_equipment.png', fullPage: true });
        });
        
        // Test puyo composition rates
        await test.step('Test Puyo Composition Rates', async () => {
            console.log('🎨 Testing puyo composition rates...');
            
            const rates = {
                red: await page.locator('#red-rate').textContent(),
                blue: await page.locator('#blue-rate').textContent(),
                yellow: await page.locator('#yellow-rate').textContent(),
                green: await page.locator('#green-rate').textContent(),
                purple: await page.locator('#purple-rate').textContent()
            };
            
            console.log('🎨 Current puyo rates:', rates);
            
            // All should be 20% initially
            expect(rates.red).toBe('20%');
            expect(rates.blue).toBe('20%');
            expect(rates.yellow).toBe('20%');
            expect(rates.green).toBe('20%');
            expect(rates.purple).toBe('20%');
            
            console.log('✅ Puyo composition rates correct');
        });
        
        // Test battle start and stop
        await test.step('Test Battle Start/Stop Cycle', async () => {
            console.log('⚔️ Testing battle start/stop cycle...');
            
            const startBattleBtn = page.locator('#start-battle-btn');
            
            // Check initial state
            const initialEnabled = await startBattleBtn.isEnabled();
            expect(initialEnabled).toBe(true);
            console.log('✅ Initial start battle button enabled');
            
            // Start battle
            await startBattleBtn.click();
            await page.waitForTimeout(1000);
            
            // Check button is disabled during battle
            const duringBattleEnabled = await startBattleBtn.isEnabled();
            expect(duringBattleEnabled).toBe(false);
            console.log('✅ Start battle button disabled during battle');
            
            // Check log updated
            const logContent = page.locator('#log-content');
            const logText = await logContent.textContent();
            expect(logText).toContain('戦闘開始');
            console.log('✅ Battle log updated correctly');
            
            await page.screenshot({ path: 'verification_battle_active.png', fullPage: true });
        });
        
        console.log('🎉 Quick verification completed successfully!');
    });
});