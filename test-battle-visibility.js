const { chromium } = require('playwright');

async function testBattleVisibility() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\\\/g, '/'));
        await page.waitForTimeout(2000);
        
        console.log('🎮 対戦モードボタンをクリック...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(3000);
        
        // 背景色を強制的に設定してテスト
        await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            if (battleScreen) {
                battleScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                battleScreen.style.color = 'white';
                console.log('背景色を設定しました');
            }
        });
        
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'battle_with_background.png' });
        
        // さらにコンテンツエリアも調整
        await page.evaluate(() => {
            const battleContent = document.querySelector('.battle-content');
            if (battleContent) {
                battleContent.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                battleContent.style.border = '2px solid #ff4500';
                console.log('コンテンツエリアのスタイルを設定しました');
            }
        });
        
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'battle_with_content_bg.png' });
        
        console.log('✅ テスト完了:');
        console.log('  - battle_with_background.png');
        console.log('  - battle_with_content_bg.png');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

testBattleVisibility().catch(console.error);