const { chromium } = require('playwright');

async function finalTitleTest() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🎮 Final comprehensive title screen test...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('1️⃣ Verifying title screen layout...');
        
        const titleLayout = await page.evaluate(() => {
            const buttons = [
                { id: 'training-mode-btn', name: 'Training Mode' },
                { id: 'story-mode-btn', name: 'Story Mode' },
                { id: 'battle-mode-btn', name: 'Battle Mode' },
                { id: 'rules-btn', name: 'Rules' },
                { id: 'settings-btn', name: 'Settings' },
                { id: 'ranking-btn', name: 'Ranking' }
            ];
            
            return buttons.map(btn => ({
                ...btn,
                exists: !!document.getElementById(btn.id),
                visible: document.getElementById(btn.id)?.style.display !== 'none',
                text: document.getElementById(btn.id)?.textContent?.trim()
            }));
        });
        
        console.log('📋 Title screen buttons:');
        titleLayout.forEach(btn => {
            console.log(`  ${btn.name}: ${btn.exists ? '✅' : '❌'} visible: ${btn.visible} text: "${btn.text?.substring(0, 50)}"`);
        });
        
        console.log('\\n2️⃣ Testing mode transitions...');
        
        // Test Training Mode
        console.log('🎯 Testing Training Mode...');
        await page.click('#training-mode-btn');
        await page.waitForTimeout(1500);
        
        let gameActive = await page.evaluate(() => {
            const titleScreen = document.getElementById('start-screen');
            const gameArea = document.querySelector('.game-area');
            return {
                titleHidden: titleScreen?.classList.contains('hidden'),
                gameVisible: gameArea && getComputedStyle(gameArea).display !== 'none'
            };
        });
        
        console.log(`  Training mode activated: ${gameActive.titleHidden && gameActive.gameVisible ? '✅' : '❌'}`);
        
        // Return to title with Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        let backToTitle = await page.evaluate(() => {
            const titleScreen = document.getElementById('start-screen');
            return !titleScreen?.classList.contains('hidden');
        });
        
        console.log(`  Escape to title: ${backToTitle ? '✅' : '❌'}`);
        
        // Test Battle Mode
        console.log('⚔️ Testing Battle Mode...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(1500);
        
        let battleActive = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            const titleScreen = document.getElementById('start-screen');
            return {
                battleVisible: battleScreen && !battleScreen.classList.contains('hidden'),
                titleHidden: titleScreen?.classList.contains('hidden')
            };
        });
        
        console.log(`  Battle mode activated: ${battleActive.battleVisible && battleActive.titleHidden ? '✅' : '❌'}`);
        
        // Return to title using Escape key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        // Test Story Mode
        console.log('📖 Testing Story Mode...');
        await page.click('#story-mode-btn');
        await page.waitForTimeout(500);
        
        // Handle alert dialog
        page.on('dialog', async dialog => {
            console.log(`  Story mode alert: "${dialog.message()}"`);
            await dialog.accept();
        });
        
        await page.waitForTimeout(1000);
        
        console.log('\\n3️⃣ Testing Help Modal...');
        await page.click('#rules-btn');
        await page.waitForTimeout(1000);
        
        const helpModal = await page.evaluate(() => {
            const modal = document.getElementById('help-modal');
            return {
                exists: !!modal,
                visible: modal && !modal.classList.contains('hidden')
            };
        });
        
        console.log(`  Help modal: ${helpModal.visible ? '✅' : '❌'}`);
        
        // Close help modal
        const closeBtn = await page.$('#help-close');
        if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(500);
        }
        
        await page.screenshot({ path: 'final_title_test.png' });
        
        const allButtonsExist = titleLayout.every(btn => btn.exists);
        const modesWork = gameActive.titleHidden && battleActive.battleVisible;
        const navigationWorks = backToTitle;
        
        console.log(`\\n✅ Final test results:`);
        console.log(`  All buttons present: ${allButtonsExist ? '✅' : '❌'}`);
        console.log(`  Mode transitions: ${modesWork ? '✅' : '❌'}`);
        console.log(`  Navigation works: ${navigationWorks ? '✅' : '❌'}`);
        console.log(`  Help modal works: ${helpModal.visible ? '✅' : '❌'}`);
        
        const overallSuccess = allButtonsExist && modesWork && navigationWorks && helpModal.visible;
        console.log(`\\n🎊 OVERALL SUCCESS: ${overallSuccess ? 'PASS' : 'FAIL'}`);
        
        return overallSuccess;
        
    } catch (error) {
        console.error('💥 Test error:', error);
        return false;
    } finally {
        await browser.close();
    }
}

finalTitleTest().catch(console.error);