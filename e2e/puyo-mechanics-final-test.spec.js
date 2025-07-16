const { test, expect } = require('@playwright/test');

test.describe('Puyo Falling System and Player Controls - Final Test', () => {
  
  test('Complete Puyo Mechanics Test', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes
    
    console.log('Starting comprehensive puyo mechanics test...');
    
    try {
      // Navigate to the game
      await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
      await page.waitForTimeout(5000);
      
      // Take initial screenshot
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_01_initial.png',
        fullPage: true 
      });

      console.log('Game loaded successfully');

      // Click Story Mode (ストーリーモード)
      console.log('Clicking Story Mode...');
      await page.click('text=ストーリーモード');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_02_story_mode.png',
        fullPage: true 
      });

      console.log('Story mode opened, starting battle...');

      // Start battle (⚔️ 戦闘開始)
      await page.click('text=戦闘開始');
      await page.waitForTimeout(5000);
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_03_battle_started.png',
        fullPage: true 
      });

      console.log('Battle screen loaded! Testing puyo mechanics...');

      // Test 1: Observe automatic puyo falling
      console.log('=== Test 1: Automatic Puyo Falling ===');
      console.log('Observing automatic puyo falling for 8 seconds...');
      
      // Record fall time
      const startTime = Date.now();
      await page.waitForTimeout(8000);
      const fallTime = Date.now() - startTime;
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_04_auto_falling.png',
        fullPage: true 
      });
      
      console.log(`Puyo fall observation time: ${fallTime}ms`);

      // Test 2: Left/Right Movement (A/D keys)
      console.log('=== Test 2: Left/Right Movement Controls ===');
      
      // Test A key (left movement) - multiple presses
      console.log('Testing A key (left movement)...');
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('a');
        await page.waitForTimeout(400);
        console.log(`A key press ${i + 1}/3`);
      }
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_05_left_movement.png',
        fullPage: true 
      });

      // Test D key (right movement) - multiple presses
      console.log('Testing D key (right movement)...');
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('d');
        await page.waitForTimeout(400);
        console.log(`D key press ${i + 1}/4`);
      }
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_06_right_movement.png',
        fullPage: true 
      });

      // Test 3: Rotation (Space key)
      console.log('=== Test 3: Rotation Control ===');
      
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press(' ');
        await page.waitForTimeout(600);
        console.log(`Rotation ${i + 1}/4 - checking different orientations`);
      }
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_07_rotation_test.png',
        fullPage: true 
      });

      // Test 4: Fast Falling (S key)
      console.log('=== Test 4: Fast Falling Control ===');
      
      const fastFallStart = Date.now();
      await page.keyboard.press('s');
      await page.waitForTimeout(3000);
      const fastFallTime = Date.now() - fastFallStart;
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_08_fast_fall.png',
        fullPage: true 
      });
      
      console.log(`Fast fall test time: ${fastFallTime}ms`);

      // Test 5: Arrow Key Controls (Alternative controls)
      console.log('=== Test 5: Arrow Key Controls ===');
      
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(500);
      console.log('Left arrow tested');
      
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);
      console.log('Right arrow tested');
      
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1000);
      console.log('Down arrow tested');
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_09_arrow_keys.png',
        fullPage: true 
      });

      // Test 6: Extended Gameplay for Puyo Placement
      console.log('=== Test 6: Extended Gameplay - Puyo Placement ===');
      
      for (let round = 0; round < 15; round++) {
        console.log(`Gameplay round ${round + 1}/15`);
        
        // Vary the strategy each round
        if (round % 4 === 0) {
          // Move left and place
          await page.keyboard.press('a');
          await page.waitForTimeout(200);
          await page.keyboard.press('a');
          await page.waitForTimeout(200);
        } else if (round % 4 === 1) {
          // Move right and place
          await page.keyboard.press('d');
          await page.waitForTimeout(200);
          await page.keyboard.press('d');
          await page.waitForTimeout(200);
        } else if (round % 4 === 2) {
          // Rotate and place in center
          await page.keyboard.press(' ');
          await page.waitForTimeout(300);
        } else {
          // Quick left-right-rotate combo
          await page.keyboard.press('a');
          await page.waitForTimeout(100);
          await page.keyboard.press('d');
          await page.waitForTimeout(100);
          await page.keyboard.press(' ');
          await page.waitForTimeout(200);
        }
        
        // Fast fall to place
        await page.keyboard.press('s');
        await page.waitForTimeout(1800);
        
        // Take screenshots every 5 rounds
        if (round % 5 === 0) {
          await page.screenshot({ 
            path: `C:/Users/naoki/puyo-puyo/puyo_final_gameplay_round_${round + 1}.png`,
            fullPage: true 
          });
        }
      }

      // Test 7: Chain Attempt
      console.log('=== Test 7: Chain Creation Attempt ===');
      
      // Strategic placement to try to create chains
      for (let attempt = 0; attempt < 10; attempt++) {
        console.log(`Chain attempt ${attempt + 1}/10`);
        
        // Try to stack in specific columns
        const targetColumn = attempt % 3;
        
        // Position puyo
        if (targetColumn === 0) {
          // Left column
          await page.keyboard.press('a');
          await page.waitForTimeout(150);
          await page.keyboard.press('a');
          await page.waitForTimeout(150);
          await page.keyboard.press('a');
          await page.waitForTimeout(150);
        } else if (targetColumn === 2) {
          // Right column
          await page.keyboard.press('d');
          await page.waitForTimeout(150);
          await page.keyboard.press('d');
          await page.waitForTimeout(150);
          await page.keyboard.press('d');
          await page.waitForTimeout(150);
        }
        // Middle column = no movement needed
        
        // Rotate to try different color combinations
        if (attempt % 2 === 0) {
          await page.keyboard.press(' ');
          await page.waitForTimeout(200);
        }
        
        // Drop
        await page.keyboard.press('s');
        await page.waitForTimeout(1500);
        
        if (attempt % 3 === 0) {
          await page.screenshot({ 
            path: `C:/Users/naoki/puyo-puyo/puyo_final_chain_attempt_${attempt + 1}.png`,
            fullPage: true 
          });
        }
      }

      // Test 8: Control Responsiveness Test
      console.log('=== Test 8: Control Responsiveness ===');
      
      const responsiveStartTime = Date.now();
      
      // Rapid input test
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('a');
        await page.waitForTimeout(80);
        await page.keyboard.press('d');
        await page.waitForTimeout(80);
        await page.keyboard.press(' ');
        await page.waitForTimeout(80);
      }
      
      const responsiveEndTime = Date.now();
      const responsiveTestTime = responsiveEndTime - responsiveStartTime;
      
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_10_responsiveness.png',
        fullPage: true 
      });
      
      console.log(`Responsiveness test completed in ${responsiveTestTime}ms`);

      // Test 9: Next Puyo Display Observation
      console.log('=== Test 9: Next Puyo Display ===');
      
      // Place several puyo and observe next puyo changes
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('s');
        await page.waitForTimeout(1200);
        console.log(`Next puyo observation ${i + 1}/8`);
        
        if (i % 3 === 0) {
          await page.screenshot({ 
            path: `C:/Users/naoki/puyo-puyo/puyo_final_next_puyo_${i + 1}.png`,
            fullPage: true 
          });
        }
      }

      // Test 10: Final Extended Play Session
      console.log('=== Test 10: Final Extended Play Session ===');
      
      for (let session = 0; session < 12; session++) {
        console.log(`Extended play session ${session + 1}/12`);
        
        // Random realistic gameplay
        const actions = ['a', 'd', ' ', 's'];
        const randomActions = Math.floor(Math.random() * 3) + 2; // 2-4 actions
        
        for (let action = 0; action < randomActions; action++) {
          const randomAction = actions[Math.floor(Math.random() * actions.length)];
          await page.keyboard.press(randomAction);
          await page.waitForTimeout(200);
        }
        
        // Always end with a drop
        await page.keyboard.press('s');
        await page.waitForTimeout(1400);
      }

      // Final state screenshots
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_11_final_state.png',
        fullPage: true 
      });

      // Summary screenshot with full game state
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_12_summary.png',
        fullPage: true 
      });

      console.log('=== PUYO MECHANICS TEST COMPLETED SUCCESSFULLY ===');
      console.log('All tests finished! Screenshots and data collected.');

    } catch (error) {
      console.error('Test encountered an error:', error.message);
      
      // Take error screenshot
      await page.screenshot({ 
        path: 'C:/Users/naoki/puyo-puyo/puyo_final_error.png',
        fullPage: true 
      });
      
      throw error;
    }
  });
});