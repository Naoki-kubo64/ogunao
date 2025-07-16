const { test, expect } = require('@playwright/test');

test('Inspect Game Page and Find Elements', async ({ page }) => {
  test.setTimeout(120000);
  
  console.log('Opening game page...');
  
  // Navigate to the game
  await page.goto('file:///C:/Users/naoki/puyo-puyo/index.html');
  await page.waitForTimeout(5000);
  
  // Take screenshot of initial state
  await page.screenshot({ 
    path: 'C:/Users/naoki/puyo-puyo/page_inspection_01_initial.png',
    fullPage: true 
  });

  // Get page content to see what elements are available
  const pageContent = await page.content();
  console.log('Page HTML length:', pageContent.length);
  
  // Look for all buttons
  const buttons = await page.locator('button').all();
  console.log('Found buttons:', buttons.length);
  
  for (let i = 0; i < buttons.length; i++) {
    try {
      const buttonText = await buttons[i].textContent();
      const isVisible = await buttons[i].isVisible();
      console.log(`Button ${i}: "${buttonText}" (visible: ${isVisible})`);
    } catch (e) {
      console.log(`Button ${i}: Error getting text - ${e.message}`);
    }
  }
  
  // Look for any elements with "story" in text
  const storyElements = await page.locator(':has-text("story"), :has-text("Story"), :has-text("ストーリー")').all();
  console.log('Found story-related elements:', storyElements.length);
  
  for (let i = 0; i < storyElements.length; i++) {
    try {
      const elementText = await storyElements[i].textContent();
      const isVisible = await storyElements[i].isVisible();
      console.log(`Story element ${i}: "${elementText}" (visible: ${isVisible})`);
    } catch (e) {
      console.log(`Story element ${i}: Error getting text - ${e.message}`);
    }
  }
  
  // Check for any clickable elements
  const clickableElements = await page.locator('button, [onclick], .clickable, [role="button"]').all();
  console.log('Found clickable elements:', clickableElements.length);
  
  // Wait a bit more and take another screenshot
  await page.waitForTimeout(3000);
  await page.screenshot({ 
    path: 'C:/Users/naoki/puyo-puyo/page_inspection_02_after_wait.png',
    fullPage: true 
  });
  
  // Try to find game mode related elements
  const gameModeElements = await page.locator(':has-text("mode"), :has-text("Mode"), :has-text("モード")').all();
  console.log('Found mode-related elements:', gameModeElements.length);
  
  // Check the document title and any visible text
  const title = await page.title();
  console.log('Page title:', title);
  
  const bodyText = await page.locator('body').textContent();
  console.log('Body text preview:', bodyText.substring(0, 500));
});