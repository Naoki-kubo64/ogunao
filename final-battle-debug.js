const { chromium } = require('playwright');

async function finalBattleDebug() {
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
        
        // すべての要素を白いボーダーで強調表示
        await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            const battleContent = document.querySelector('.battle-content');
            const battleHeader = document.querySelector('.battle-header');
            const battleTitle = document.querySelector('.battle-title');
            
            if (battleScreen) {
                battleScreen.style.border = '5px solid white';
                console.log('battleScreen にボーダーを追加');
            }
            
            if (battleContent) {
                battleContent.style.border = '3px solid red';
                battleContent.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                console.log('battleContent にボーダーを追加');
            }
            
            if (battleHeader) {
                battleHeader.style.border = '2px solid yellow';
                battleHeader.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                console.log('battleHeader にボーダーを追加');
            }
            
            if (battleTitle) {
                battleTitle.style.color = 'white';
                battleTitle.style.fontSize = '24px';
                battleTitle.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                console.log('battleTitle のスタイルを調整');
            }
        });
        
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'battle_with_borders.png' });
        
        // 各要素の詳細な計算済みスタイルを確認
        const detailedInfo = await page.evaluate(() => {
            const elements = [
                { name: 'battleScreen', element: document.getElementById('battle-screen') },
                { name: 'battleContent', element: document.querySelector('.battle-content') },
                { name: 'battleHeader', element: document.querySelector('.battle-header') },
                { name: 'battleTitle', element: document.querySelector('.battle-title') }
            ];
            
            return elements.map(({ name, element }) => {
                if (!element) return { name, exists: false };
                
                const computed = getComputedStyle(element);
                return {
                    name,
                    exists: true,
                    boundingRect: element.getBoundingClientRect(),
                    computedStyle: {
                        display: computed.display,
                        visibility: computed.visibility,
                        position: computed.position,
                        top: computed.top,
                        left: computed.left,
                        width: computed.width,
                        height: computed.height,
                        zIndex: computed.zIndex,
                        opacity: computed.opacity,
                        color: computed.color,
                        backgroundColor: computed.backgroundColor
                    }
                };
            });
        });
        
        console.log('\\n🔍 詳細な要素情報:');
        detailedInfo.forEach(info => {
            console.log(`\\n${info.name}:`);
            if (info.exists) {
                console.log('  Bounding Rect:', info.boundingRect);
                console.log('  Computed Style:', info.computedStyle);
            } else {
                console.log('  存在しません');
            }
        });
        
        console.log('\\n✅ デバッグ完了: battle_with_borders.png');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

finalBattleDebug().catch(console.error);