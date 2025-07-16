const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('⚔️ 戦闘画面遷移の詳細テスト');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // エラー監視
    page.on('console', msg => {
        console.log(`🎮 [CONSOLE] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        console.log(`💥 JavaScript Error: ${error.message}`);
    });
    
    const htmlPath = path.resolve(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(2000);
    
    await page.click('#story-mode-btn');
    await page.waitForTimeout(3000);
    
    // スタートノードクリック
    await page.evaluate(() => {
        const startNode = document.querySelector('[data-node-id="floor_0_node_0"]');
        if (startNode) {
            startNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    });
    
    await page.waitForTimeout(2000);
    
    // 敵ノードクリック
    await page.evaluate(() => {
        const enemyNode = document.querySelector('[data-node-id="floor_1_node_1"]');
        if (enemyNode) {
            enemyNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    });
    
    // 戦闘遷移を段階的にチェック
    for (let i = 0; i < 10; i++) {
        await page.waitForTimeout(500);
        
        const state = await page.evaluate(() => {
            const storyScreen = document.getElementById('story-screen');
            const mapScreen = document.getElementById('story-map-screen');
            const battleScreen = document.getElementById('story-battle-screen');
            
            return {
                step: i,
                storyVisible: storyScreen ? !storyScreen.classList.contains('hidden') : false,
                mapVisible: mapScreen ? !mapScreen.classList.contains('hidden') : false,
                battleVisible: battleScreen ? !battleScreen.classList.contains('hidden') : false,
                storyClass: storyScreen ? storyScreen.className : 'none',
                mapClass: mapScreen ? mapScreen.className : 'none',
                battleClass: battleScreen ? battleScreen.className : 'none'
            };
        });
        
        console.log(`Step ${state.step}: Story=${state.storyVisible}, Map=${state.mapVisible}, Battle=${state.battleVisible}`);
        
        if (state.battleVisible) {
            console.log('✅ 戦闘画面表示確認');
            break;
        }
    }
    
    await page.screenshot({ path: 'debug_battle_screen.png' });
    await browser.close();
})();