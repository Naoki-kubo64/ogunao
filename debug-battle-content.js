const { chromium } = require('playwright');

async function debugBattleContent() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        console.log('🔍 対戦画面のコンテンツ表示問題をデバッグ中...');
        
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        await page.waitForTimeout(1000);
        
        console.log('📸 タイトル画面のスクリーンショット...');
        await page.screenshot({ path: 'debug_title_content.png' });
        
        // 対戦ボタンをクリック
        console.log('🎮 対戦モードボタンをクリック...');
        await page.evaluate(() => {
            const btn = document.getElementById('battle-mode-btn');
            if (btn) {
                btn.click();
            }
        });
        
        await page.waitForTimeout(1000);
        
        console.log('📸 対戦画面のスクリーンショット...');
        await page.screenshot({ path: 'debug_battle_content.png' });
        
        // 対戦画面の詳細な分析
        const battleAnalysis = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            const battleContent = document.querySelector('.simple-battle-content');
            const title = document.querySelector('.simple-battle-content h1');
            const backButton = document.querySelector('#back-to-title');
            const battleArea = document.querySelector('.battle-area');
            
            const getElementInfo = (element, name) => {
                if (!element) return { exists: false, name };
                
                const rect = element.getBoundingClientRect();
                const computed = getComputedStyle(element);
                
                return {
                    exists: true,
                    name,
                    rect: {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    },
                    computed: {
                        display: computed.display,
                        visibility: computed.visibility,
                        opacity: computed.opacity,
                        fontSize: computed.fontSize,
                        color: computed.color,
                        position: computed.position
                    },
                    textContent: element.textContent?.trim().substring(0, 50) || '',
                    innerHTML: element.innerHTML?.substring(0, 100) || ''
                };
            };
            
            return {
                battleScreen: getElementInfo(battleScreen, 'battle-screen'),
                battleContent: getElementInfo(battleContent, 'simple-battle-content'),
                title: getElementInfo(title, 'h1 title'),
                backButton: getElementInfo(backButton, 'back-to-title button'),
                battleArea: getElementInfo(battleArea, 'battle-area')
            };
        });
        
        console.log('対戦画面要素の詳細分析:');
        console.log(JSON.stringify(battleAnalysis, null, 2));
        
        console.log('✅ 対戦コンテンツデバッグ完了');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

debugBattleContent().catch(console.error);