const { test, expect } = require('@playwright/test');

test.describe('Puyo Falling System and Player Controls Test', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Navigate to the game
    await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
    await page.waitForLoadState('networkidle');
    
    // Wait for game to initialize
    await page.waitForTimeout(2000);
  });

  test('Complete Puyo Mechanics Test Suite', async () => {
    console.log('Starting comprehensive puyo mechanics test...');
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_01_initial.png',
      fullPage: true 
    });

    // Navigate to story mode
    console.log('Navigating to story mode...');
    await page.click('button:has-text("Story Mode")');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_02_story_mode.png',
      fullPage: true 
    });

    // Start a battle
    console.log('Starting battle...');
    await page.click('button:has-text("Start Battle")');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_03_battle_start.png',
      fullPage: true 
    });

    // Test 1: Verify puyo automatic falling system
    console.log('Testing puyo automatic falling system...');
    
    // Wait and observe puyo falling
    await page.waitForTimeout(5000);
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_04_falling_puyo.png',
      fullPage: true 
    });

    // Test 2: Test player controls - Left/Right movement
    console.log('Testing left/right movement controls...');
    
    // Test A key (left movement)
    await page.keyboard.press('a');
    await page.waitForTimeout(500);
    await page.keyboard.press('a');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_05_left_movement.png',
      fullPage: true 
    });

    // Test D key (right movement)
    await page.keyboard.press('d');
    await page.waitForTimeout(500);
    await page.keyboard.press('d');
    await page.waitForTimeout(500);
    await page.keyboard.press('d');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_06_right_movement.png',
      fullPage: true 
    });

    // Test 3: Test rotation control
    console.log('Testing rotation control...');
    
    // Test Space key (rotation)
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_07_rotation.png',
      fullPage: true 
    });

    // Test 4: Test fast falling
    console.log('Testing fast falling with S key...');
    
    // Test S key (fast fall)
    await page.keyboard.press('s');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_08_fast_fall.png',
      fullPage: true 
    });

    // Test 5: Test puyo placement and observe chain mechanics
    console.log('Testing puyo placement and chains...');
    
    // Let several puyo fall and try to create chains
    for (let i = 0; i < 10; i++) {
      // Alternate between left and right to spread puyo
      if (i % 2 === 0) {
        await page.keyboard.press('a');
        await page.waitForTimeout(200);
      } else {
        await page.keyboard.press('d');
        await page.waitForTimeout(200);
      }
      
      // Rotate occasionally to get different orientations
      if (i % 3 === 0) {
        await page.keyboard.press(' ');
        await page.waitForTimeout(200);
      }
      
      // Fast fall to speed up testing
      await page.keyboard.press('s');
      await page.waitForTimeout(1500);
    }
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_09_puyo_placement.png',
      fullPage: true 
    });

    // Test 6: Try to create chains by strategic placement
    console.log('Attempting to create chains...');
    
    // Try to stack same colors together
    for (let i = 0; i < 8; i++) {
      // Move to specific columns and try to match colors
      const targetColumn = i % 3;
      
      // Move to target position
      for (let j = 0; j < targetColumn; j++) {
        await page.keyboard.press('d');
        await page.waitForTimeout(100);
      }
      
      // Rotate to try to get matching colors
      await page.keyboard.press(' ');
      await page.waitForTimeout(200);
      
      // Fast fall
      await page.keyboard.press('s');
      await page.waitForTimeout(1500);
      
      // Reset position
      await page.keyboard.press('a');
      await page.keyboard.press('a');
      await page.keyboard.press('a');
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_10_chain_attempt.png',
      fullPage: true 
    });

    // Test 7: Check next puyo display
    console.log('Testing next puyo display...');
    
    // Wait and observe next puyo changes
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_11_next_puyo.png',
      fullPage: true 
    });

    // Test 8: Extended gameplay to observe overall mechanics
    console.log('Extended gameplay test...');
    
    for (let round = 0; round < 15; round++) {
      // Random controls to simulate real gameplay
      const actions = ['a', 'd', ' ', 's'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      await page.keyboard.press(randomAction);
      await page.waitForTimeout(300);
      
      // Take periodic screenshots
      if (round % 5 === 0) {
        await page.screenshot({ 
          path: `C:/Users/naoki/puyo-puyo/puyo_test_gameplay_round_${round}.png`,
          fullPage: true 
        });
      }
    }

    // Final screenshot
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_12_final_state.png',
      fullPage: true 
    });

    console.log('Puyo mechanics test completed successfully!');

    // Test 9: Test arrow key controls as alternative
    console.log('Testing arrow key controls...');
    
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_13_arrow_keys.png',
      fullPage: true 
    });

    // Test 10: Performance and responsiveness test
    console.log('Testing control responsiveness...');
    
    // Rapid key presses to test responsiveness
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('a');
      await page.waitForTimeout(50);
      await page.keyboard.press('d');
      await page.waitForTimeout(50);
      await page.keyboard.press(' ');
      await page.waitForTimeout(50);
    }
    
    await page.screenshot({ 
      path: 'C:/Users/naoki/puyo-puyo/puyo_test_14_responsiveness.png',
      fullPage: true 
    });

    console.log('All puyo mechanics tests completed!');
  });

  test.afterEach(async () => {
    if (page) {
      await page.close();
    }
  });
});