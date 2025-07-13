const { chromium } = require('playwright');

async function deepBattleDebug() {
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
        
        // より詳細な要素分析
        const analysis = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            const battleContent = document.querySelector('.battle-content');
            const battleHeader = document.querySelector('.battle-header');
            const battleArena = document.querySelector('.battle-arena');
            const playerSide = document.querySelector('.player-side');
            const vsDisplay = document.querySelector('.vs-display');
            
            const analyze = (element, name) => {
                if (!element) return { name, exists: false };
                
                const computed = getComputedStyle(element);
                const rect = element.getBoundingClientRect();
                
                return {
                    name,
                    exists: true,
                    rect: {
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    },
                    style: {
                        display: computed.display,
                        visibility: computed.visibility,
                        position: computed.position,
                        width: computed.width,
                        height: computed.height,
                        flexDirection: computed.flexDirection,
                        justifyContent: computed.justifyContent,
                        alignItems: computed.alignItems,
                        overflow: computed.overflow,
                        zIndex: computed.zIndex,
                        backgroundColor: computed.backgroundColor,
                        color: computed.color
                    },
                    classList: element.className,
                    children: element.children.length,
                    innerHTML: element.innerHTML.substring(0, 200) + '...'
                };
            };
            
            return [
                analyze(battleScreen, 'battleScreen'),
                analyze(battleContent, 'battleContent'),
                analyze(battleHeader, 'battleHeader'),
                analyze(battleArena, 'battleArena'),
                analyze(playerSide, 'playerSide'),
                analyze(vsDisplay, 'vsDisplay')
            ];
        });
        
        console.log('\\n🔍 詳細分析結果:');
        analysis.forEach(item => {
            console.log(`\\n--- ${item.name} ---`);
            if (item.exists) {
                console.log('Rect:', item.rect);
                console.log('Style:', item.style);
                console.log('Classes:', item.classList);
                console.log('Children count:', item.children);
                
                if (item.rect.width === 0 || item.rect.height === 0) {
                    console.log('⚠️  WARNING: 要素のサイズが0です');
                }
            } else {
                console.log('❌ 要素が存在しません');
            }
        });
        
        // CSSファイルの読み込み状況を確認
        const cssStatus = await page.evaluate(() => {
            const stylesheets = Array.from(document.styleSheets);
            return stylesheets.map(sheet => ({
                href: sheet.href,
                cssRules: sheet.cssRules ? sheet.cssRules.length : 0,
                disabled: sheet.disabled
            }));
        });
        
        console.log('\\n📝 CSS読み込み状況:', cssStatus);
        
        // 手動で要素に最小サイズを設定してテスト
        await page.evaluate(() => {
            const battleContent = document.querySelector('.battle-content');
            const battleHeader = document.querySelector('.battle-header');
            const battleArena = document.querySelector('.battle-arena');
            
            if (battleContent) {
                battleContent.style.minHeight = '100vh';
                battleContent.style.width = '100vw';
                battleContent.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                console.log('✅ battleContent に最小サイズを設定');
            }
            
            if (battleHeader) {
                battleHeader.style.minHeight = '80px';
                battleHeader.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
                battleHeader.style.padding = '20px';
                console.log('✅ battleHeader に最小サイズを設定');
            }
            
            if (battleArena) {
                battleArena.style.minHeight = '600px';
                battleArena.style.backgroundColor = 'rgba(0, 0, 255, 0.3)';
                console.log('✅ battleArena に最小サイズを設定');
            }
        });
        
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'battle_with_min_sizes.png' });
        
        console.log('\\n✅ デバッグ完了: battle_with_min_sizes.png');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

deepBattleDebug().catch(console.error);