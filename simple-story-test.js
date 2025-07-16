const { chromium } = require('playwright');

async function testStoryModeUI(page) {
  console.log('🧪 Testing Story Mode UI Elements...');
  
  // Test story header elements
  console.log('🔍 Testing story header...');
  const storyTitle = await page.isVisible('.story-title');
  const backBtn = await page.isVisible('#story-back-to-title');
  console.log('   Story title visible:', storyTitle);
  console.log('   Back button visible:', backBtn);
  
  // Test player panel elements
  console.log('🔍 Testing player panel...');
  const playerPanel = await page.isVisible('.player-panel');
  const hpSection = await page.isVisible('.hp-section');
  const statsSection = await page.isVisible('.stats-section');
  const equipmentSection = await page.isVisible('.equipment-section');
  const puyoComposition = await page.isVisible('.puyo-composition');
  
  console.log('   Player panel visible:', playerPanel);
  console.log('   HP section visible:', hpSection);
  console.log('   Stats section visible:', statsSection);
  console.log('   Equipment section visible:', equipmentSection);
  console.log('   Puyo composition visible:', puyoComposition);
  
  // Test specific player stats
  const hpText = await page.textContent('#player-hp-text');
  const attackText = await page.textContent('#player-attack');
  const defenseText = await page.textContent('#player-defense');
  const goldText = await page.textContent('#player-gold');
  
  console.log('   HP text:', hpText);
  console.log('   Attack text:', attackText);
  console.log('   Defense text:', defenseText);
  console.log('   Gold text:', goldText);
  
  // Test puyo rates
  const redRate = await page.textContent('#red-rate');
  const blueRate = await page.textContent('#blue-rate');
  const yellowRate = await page.textContent('#yellow-rate');
  const greenRate = await page.textContent('#green-rate');
  const purpleRate = await page.textContent('#purple-rate');
  
  console.log('   Puyo rates - Red:', redRate, 'Blue:', blueRate, 'Yellow:', yellowRate, 'Green:', greenRate, 'Purple:', purpleRate);
  
  // Test adventure area
  console.log('🔍 Testing adventure area...');
  const adventureArea = await page.isVisible('.adventure-area');
  const currentFloor = await page.textContent('#current-floor-text');
  const enemyInfo = await page.isVisible('#enemy-info');
  const enemyName = await page.textContent('#enemy-name');
  const enemyHpText = await page.textContent('#enemy-hp-text');
  const enemyAttack = await page.textContent('#enemy-attack');
  const enemyDefense = await page.textContent('#enemy-defense');
  
  console.log('   Adventure area visible:', adventureArea);
  console.log('   Current floor:', currentFloor);
  console.log('   Enemy info visible:', enemyInfo);
  console.log('   Enemy name:', enemyName);
  console.log('   Enemy HP:', enemyHpText);
  console.log('   Enemy attack:', enemyAttack);
  console.log('   Enemy defense:', enemyDefense);
  
  // Test action buttons
  console.log('🔍 Testing action buttons...');
  const startBattleBtn = await page.isVisible('#start-battle-btn');
  const visitShopBtn = await page.isVisible('#visit-shop-btn');
  const restBtn = await page.isVisible('#rest-btn');
  const nextFloorBtn = await page.isVisible('#next-floor-btn');
  
  console.log('   Start battle button visible:', startBattleBtn);
  console.log('   Visit shop button visible:', visitShopBtn);
  console.log('   Rest button visible:', restBtn);
  console.log('   Next floor button visible:', nextFloorBtn);
  
  // Test battle log
  console.log('🔍 Testing battle log...');
  const battleLog = await page.isVisible('#battle-log');
  const logContent = await page.textContent('#log-content');
  
  console.log('   Battle log visible:', battleLog);
  console.log('   Log content:', logContent);
  
  // Test button functionality
  console.log('🔍 Testing button functionality...');
  
  // Test start battle button
  console.log('   Testing start battle button...');
  await page.click('#start-battle-btn');
  await page.waitForTimeout(1000);
  const isBattleBtnDisabled = await page.isDisabled('#start-battle-btn');
  console.log('   Battle button disabled after click:', isBattleBtnDisabled);
  
  // Check if battle log updated
  const logContentAfterBattle = await page.textContent('#log-content');
  const hasBattleMessage = logContentAfterBattle.includes('戦闘開始');
  console.log('   Battle log updated with start message:', hasBattleMessage);
  
  // Test rest button
  console.log('   Testing rest button...');
  await page.click('#rest-btn');
  await page.waitForTimeout(500);
  const logContentAfterRest = await page.textContent('#log-content');
  const hasRestMessage = logContentAfterRest.includes('休憩');
  console.log('   Rest button works:', hasRestMessage);
  
  // Test shop button (should show alert)
  console.log('   Testing shop button...');
  let shopDialogShown = false;
  page.once('dialog', async dialog => {
    shopDialogShown = true;
    console.log('   Shop dialog message:', dialog.message());
    await dialog.accept();
  });
  
  await page.click('#visit-shop-btn');
  await page.waitForTimeout(500);
  console.log('   Shop dialog shown:', shopDialogShown);
  
  // Test back to title functionality
  console.log('   Testing back to title button...');
  await page.click('#story-back-to-title');
  await page.waitForTimeout(1000);
  
  const titleVisibleAfterBack = await page.isVisible('#start-screen');
  const storyVisibleAfterBack = await page.isVisible('#story-screen');
  
  console.log('   Title screen visible after back:', titleVisibleAfterBack);
  console.log('   Story screen hidden after back:', !storyVisibleAfterBack);
  
  console.log('✅ Story Mode UI test completed!');
}

(async () => {
  console.log('🚀 Starting simple story mode test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-web-security', '--allow-file-access-from-files', '--allow-universal-access-from-files']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📂 Loading game file...');
    await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html', { waitUntil: 'domcontentloaded' });
    console.log('✅ Page loaded');
    
    // Wait for title screen
    await page.waitForSelector('#start-screen', { timeout: 10000 });
    console.log('✅ Title screen found');
    
    // Take initial screenshot
    await page.screenshot({ path: 'simple_test_01_initial.png', fullPage: true });
    console.log('📸 Initial screenshot taken');
    
    // Check if story mode button exists
    const storyBtn = await page.$('#story-mode-btn');
    if (storyBtn) {
      console.log('✅ Story mode button found');
      
      // Get button text
      const btnText = await page.textContent('#story-mode-btn');
      console.log('📝 Button text:', btnText);
      
      // Click the button
      await page.click('#story-mode-btn');
      console.log('🖱️ Story mode button clicked');
      
      // Wait a moment
      await page.waitForTimeout(2000);
      
      // Check if story screen appears
      const storyScreen = await page.$('#story-screen');
      if (storyScreen) {
        const isVisible = await page.isVisible('#story-screen');
        console.log('👁️ Story screen visible:', isVisible);
        
        if (isVisible) {
          console.log('🎉 Story screen is working! Running comprehensive UI tests...');
          await testStoryModeUI(page);
        } else {
          console.log('🔧 Story screen exists but not visible, checking classes...');
          const classes = await page.getAttribute('#story-screen', 'class');
          console.log('📝 Story screen classes:', classes);
        }
      } else {
        console.log('❌ Story screen element not found');
      }
      
      // Check for errors in console
      const logs = [];
      page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
        console.log(`🖥️ Browser console [${msg.type()}]:`, msg.text());
      });
      
      // Take screenshot after click
      await page.screenshot({ path: 'simple_test_02_after_click.png', fullPage: true });
      console.log('📸 After click screenshot taken');
      
      // Check if gameModeManager exists
      const gmExists = await page.evaluate(() => typeof window.gameModeManager !== 'undefined');
      console.log('🔍 gameModeManager exists:', gmExists);
      
      if (gmExists) {
        const hasStoryMethod = await page.evaluate(() => typeof window.gameModeManager.switchToStoryMode === 'function');
        console.log('🔍 switchToStoryMode method exists:', hasStoryMethod);
        
        if (hasStoryMethod) {
          console.log('🔧 Manually calling switchToStoryMode...');
          const result = await page.evaluate(() => {
            try {
              window.gameModeManager.switchToStoryMode();
              return { success: true, error: null };
            } catch (error) {
              return { success: false, error: error.message };
            }
          });
          console.log('🔧 Manual call result:', result);
          
          await page.waitForTimeout(1000);
          
          // Check visibility after manual call
          const storyVisibleAfterManual = await page.isVisible('#story-screen');
          console.log('👁️ Story screen visible after manual call:', storyVisibleAfterManual);
          
          // Check computed styles
          const computedStyles = await page.evaluate(() => {
            const storyScreen = document.getElementById('story-screen');
            if (storyScreen) {
              const styles = window.getComputedStyle(storyScreen);
              return {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                zIndex: styles.zIndex,
                position: styles.position,
                top: styles.top,
                left: styles.left,
                width: styles.width,
                height: styles.height,
                className: storyScreen.className
              };
            }
            return null;
          });
          console.log('🎨 Story screen computed styles:', computedStyles);
          
          // Check if specific elements inside story screen are visible
          const storyElements = await page.evaluate(() => {
            const storyTitle = document.querySelector('.story-title');
            const playerPanel = document.querySelector('.player-panel');
            const adventureArea = document.querySelector('.adventure-area');
            
            const checkVisibility = (element) => {
              if (!element) return { exists: false };
              const rect = element.getBoundingClientRect();
              const styles = window.getComputedStyle(element);
              return {
                exists: true,
                visible: rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden',
                rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
                display: styles.display,
                visibility: styles.visibility
              };
            };
            
            return {
              storyTitle: checkVisibility(storyTitle),
              playerPanel: checkVisibility(playerPanel),
              adventureArea: checkVisibility(adventureArea)
            };
          });
          console.log('🔍 Story elements visibility:', storyElements);
          
          // Check z-index of all elements to see if anything is covering the story screen
          const zIndexCheck = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            const highZIndex = [];
            allElements.forEach(el => {
              const zIndex = window.getComputedStyle(el).zIndex;
              if (zIndex !== 'auto' && parseInt(zIndex) >= 9998) {
                const rect = el.getBoundingClientRect();
                highZIndex.push({
                  tagName: el.tagName,
                  id: el.id,
                  className: el.className,
                  zIndex: zIndex,
                  visible: rect.width > 0 && rect.height > 0
                });
              }
            });
            return highZIndex;
          });
          console.log('🔍 Elements with high z-index (>= 9998):', zIndexCheck);
          
          // Check parent container styles
          const containerStyles = await page.evaluate(() => {
            const container = document.querySelector('.container');
            const gameStatus = document.querySelector('.game-status');
            
            const getStyles = (element, name) => {
              if (!element) return { name, exists: false };
              const styles = window.getComputedStyle(element);
              return {
                name,
                exists: true,
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                width: styles.width,
                height: styles.height
              };
            };
            
            return {
              container: getStyles(container, 'container'),
              gameStatus: getStyles(gameStatus, 'game-status')
            };
          });
          console.log('🔍 Container styles:', containerStyles);
          
          await page.screenshot({ path: 'simple_test_03_after_manual_call.png', fullPage: true });
          console.log('📸 After manual call screenshot taken');
        }
        
        if (!hasStoryMethod) {
          console.log('🔧 switchToStoryMode method missing, trying manual approach...');
          
          // Manually trigger story mode
          await page.evaluate(() => {
            const titleScreen = document.getElementById('start-screen');
            const storyScreen = document.getElementById('story-screen');
            
            if (titleScreen) titleScreen.classList.add('hidden');
            if (storyScreen) storyScreen.classList.remove('hidden');
            
            // Initialize story mode
            if (window.StoryMode && !window.storyMode) {
              window.storyMode = new window.StoryMode();
              window.storyMode.initialize();
            }
          });
          
          await page.waitForTimeout(1000);
          
          // Take screenshot after manual trigger
          await page.screenshot({ path: 'simple_test_03_manual_trigger.png', fullPage: true });
          console.log('📸 Manual trigger screenshot taken');
          
          // Check story mode UI elements
          const storyTitle = await page.isVisible('.story-title');
          const playerPanel = await page.isVisible('.player-panel');
          const adventureArea = await page.isVisible('.adventure-area');
          
          console.log('✅ Story UI elements visible:');
          console.log('   Story title:', storyTitle);
          console.log('   Player panel:', playerPanel);
          console.log('   Adventure area:', adventureArea);
          
          if (storyTitle && playerPanel && adventureArea) {
            console.log('🎉 Story mode UI is working correctly!');
            
            // Test some buttons
            await page.click('#start-battle-btn');
            console.log('🖱️ Battle button clicked');
            
            await page.waitForTimeout(1000);
            
            const isBattleBtnDisabled = await page.isDisabled('#start-battle-btn');
            console.log('🔒 Battle button disabled after click:', isBattleBtnDisabled);
            
            // Test rest button
            await page.click('#rest-btn');
            console.log('🖱️ Rest button clicked');
            
            await page.waitForTimeout(500);
            
            // Check battle log
            const logContent = await page.textContent('#log-content');
            console.log('📜 Battle log content:', logContent);
          }
        }
      }
      
      console.log('📝 Console logs:', logs);
      
    } else {
      console.log('❌ Story mode button not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'simple_test_error.png', fullPage: true });
  }
  
  console.log('⏳ Keeping browser open for 10 seconds...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('🏁 Test completed');
})();