const { test, expect } = require('@playwright/test');

test.describe('Puyo Mechanics Focused Test', () => {
  
  test('Puyo Falling System and Controls Test', async ({ page }) => {
    // Set longer timeout for this test
    test.setTimeout(300000); // 5 minutes
    
    console.log('Starting puyo mechanics test...');
    
    try {
      // Navigate to the game
      await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
      await page.waitForTimeout(3000);
      
      // Take initial screenshot
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_01_initial.png',
        fullPage: true 
      });

      console.log('Game loaded, navigating to story mode...');

      // Check if Story Mode button exists and click it
      const storyModeButton = page.locator('button:has-text("Story Mode"), button:has-text("ストーリーモード")');
      await storyModeButton.waitFor({ timeout: 10000 });
      await storyModeButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_02_story_mode.png',
        fullPage: true 
      });

      console.log('In story mode, starting battle...');

      // Start battle
      const startBattleButton = page.locator('button:has-text("Start Battle"), button:has-text("バトル開始"), button:has-text("Battle Start")');
      await startBattleButton.waitFor({ timeout: 10000 });
      await startBattleButton.click();
      await page.waitForTimeout(4000);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_03_battle_screen.png',
        fullPage: true 
      });

      console.log('Battle started! Testing puyo falling system...');

      // Test 1: Observe automatic falling
      console.log('1. Testing automatic puyo falling...');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_04_auto_falling.png',
        fullPage: true 
      });

      // Test 2: Left/Right movement (A/D keys)
      console.log('2. Testing left/right movement (A/D keys)...');
      
      // Test A key (left)
      await page.keyboard.press('a');
      await page.waitForTimeout(800);
      await page.keyboard.press('a');
      await page.waitForTimeout(800);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_05_left_movement.png',
        fullPage: true 
      });

      // Test D key (right)
      await page.keyboard.press('d');
      await page.waitForTimeout(800);
      await page.keyboard.press('d');
      await page.waitForTimeout(800);
      await page.keyboard.press('d');
      await page.waitForTimeout(800);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_06_right_movement.png',
        fullPage: true 
      });

      // Test 3: Rotation (Space key)
      console.log('3. Testing rotation (Space key)...');
      
      await page.keyboard.press(' ');
      await page.waitForTimeout(500);
      await page.keyboard.press(' ');
      await page.waitForTimeout(500);
      await page.keyboard.press(' ');
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_07_rotation.png',
        fullPage: true 
      });

      // Test 4: Fast falling (S key)
      console.log('4. Testing fast falling (S key)...');
      
      await page.keyboard.press('s');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_08_fast_fall.png',
        fullPage: true 
      });

      // Test 5: Arrow key alternatives
      console.log('5. Testing arrow key controls...');
      
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_09_arrow_keys.png',
        fullPage: true 
      });

      // Test 6: Extended gameplay to build up puyo and test placement
      console.log('6. Testing puyo placement and stacking...');
      
      for (let i = 0; i < 8; i++) {
        // Vary the position and rotation
        const actions = ['a', 'd', ' '];
        const randomAction = actions[i % actions.length];
        
        await page.keyboard.press(randomAction);
        await page.waitForTimeout(300);
        
        // Use fast fall to speed up
        await page.keyboard.press('s');
        await page.waitForTimeout(1500);
        
        if (i % 3 === 0) {
          await page.screenshot({ 
            path: `C:/Users/naoki/puyo-puyo/puyo_mechanics_placement_${i}.png`,
            fullPage: true 
          });
        }
      }

      // Test 7: Rapid control testing for responsiveness
      console.log('7. Testing control responsiveness...');
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('a');
        await page.waitForTimeout(100);
        await page.keyboard.press('d');
        await page.waitForTimeout(100);
        await page.keyboard.press(' ');
        await page.waitForTimeout(100);
      }
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_10_responsiveness.png',
        fullPage: true 
      });

      // Test 8: Try to create chains
      console.log('8. Attempting to create chains...');
      
      // Strategic placement attempt
      for (let i = 0; i < 12; i++) {
        // Try to stack in same columns
        const targetColumn = i % 3;
        
        // Move to position
        if (targetColumn === 0) {
          await page.keyboard.press('a');
          await page.keyboard.press('a');
        } else if (targetColumn === 2) {
          await page.keyboard.press('d');
          await page.keyboard.press('d');
        }
        
        await page.waitForTimeout(200);
        
        // Rotate to try different orientations
        if (i % 2 === 0) {
          await page.keyboard.press(' ');
          await page.waitForTimeout(200);
        }
        
        // Fast drop
        await page.keyboard.press('s');
        await page.waitForTimeout(1200);
        
        if (i % 4 === 0) {
          await page.screenshot({ 
            path: `C:/Users/naoki/puyo-puyo/puyo_mechanics_chain_attempt_${i}.png`,
            fullPage: true 
          });
        }
      }

      // Final state screenshot
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_11_final_state.png',
        fullPage: true 
      });

      console.log('Puyo mechanics test completed successfully!');

    } catch (error) {
      console.error('Test error:', error);
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_mechanics_error.png',
        fullPage: true 
      });
      throw error;
    }
  });
});