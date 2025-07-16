const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000,
        args: ['--no-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    try {
        console.log('Opening game...');
        await page.goto(`file://${process.cwd()}/index.html`);
        await page.waitForTimeout(3000);
        
        console.log('Taking initial screenshot...');
        await page.screenshot({ path: 'debug_01_initial.png' });
        
        console.log('Clicking story mode button...');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(2000);
        
        console.log('Taking story menu screenshot...');
        await page.screenshot({ path: 'debug_02_story_menu.png' });
        
        // Check if NEW GAME/LOAD GAME menu is visible
        const storyStartMenu = await page.locator('#story-start-menu');
        const isVisible = await storyStartMenu.isVisible();
        console.log('Story start menu visible:', isVisible);
        
        if (isVisible) {
            console.log('Clicking NEW GAME...');
            await page.click('#story-new-game');
            await page.waitForTimeout(3000);
            
            console.log('Taking path choice screenshot...');
            await page.screenshot({ path: 'debug_03_path_choice.png' });
            
            // Check if path choices are visible
            const pathChoices = await page.locator('#path-choices');
            const pathVisible = await pathChoices.isVisible();
            console.log('Path choices visible:', pathVisible);
            
            if (pathVisible) {
                console.log('Clicking center path...');
                await page.click('#path-center');
                await page.waitForTimeout(3000);
                
                console.log('Taking map screenshot...');
                await page.screenshot({ path: 'debug_04_map.png' });
                
                // Check if map is visible
                const mapScreen = await page.locator('#story-map-screen');
                const mapVisible = await mapScreen.isVisible();
                console.log('Map screen visible:', mapVisible);
                
                if (mapVisible) {
                    console.log('Testing ESC key...');
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(2000);
                    
                    console.log('Taking pause menu screenshot...');
                    await page.screenshot({ path: 'debug_05_pause_menu.png' });
                    
                    // Check if pause menu is visible
                    const pauseMenu = await page.locator('#story-pause-menu');
                    const pauseVisible = await pauseMenu.isVisible();
                    console.log('Pause menu visible:', pauseVisible);
                    
                    console.log('Test completed. Check screenshots for results.');
                } else {
                    console.log('ERROR: Map screen not visible!');
                }
            } else {
                console.log('ERROR: Path choices not visible!');
            }
        } else {
            console.log('ERROR: Story start menu not visible!');
        }
        
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('Error:', error);
        await page.screenshot({ path: 'debug_error.png' });
    } finally {
        await browser.close();
    }
})();