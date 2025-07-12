const { chromium } = require('playwright');

async function testTitlePosition() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    try {
        // HTMLファイルを直接開く
        await page.goto(`file:///${__dirname}/index.html`.replace(/\\/g, '/'));
        
        // ページが読み込まれるまで少し待つ
        await page.waitForTimeout(2000);
        
        console.log('Taking detailed positioning screenshot...');
        await page.screenshot({ path: 'title_position_analysis.png', fullPage: true });
        
        // 主要要素の位置を詳細に確認
        const elements = await page.evaluate(() => {
            const startScreen = document.querySelector('.start-screen');
            const titleContent = document.querySelector('.title-content');
            const gameTitle = document.querySelector('.game-title');
            const titleMenu = document.querySelector('.title-menu');
            
            return {
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                startScreen: startScreen ? {
                    position: window.getComputedStyle(startScreen).position,
                    top: window.getComputedStyle(startScreen).top,
                    left: window.getComputedStyle(startScreen).left,
                    width: window.getComputedStyle(startScreen).width,
                    height: window.getComputedStyle(startScreen).height,
                    backgroundImage: window.getComputedStyle(startScreen).backgroundImage,
                    backgroundSize: window.getComputedStyle(startScreen).backgroundSize,
                    backgroundPosition: window.getComputedStyle(startScreen).backgroundPosition,
                    display: window.getComputedStyle(startScreen).display,
                    alignItems: window.getComputedStyle(startScreen).alignItems,
                    justifyContent: window.getComputedStyle(startScreen).justifyContent,
                    boundingBox: startScreen.getBoundingClientRect()
                } : null,
                titleContent: titleContent ? {
                    position: window.getComputedStyle(titleContent).position,
                    maxWidth: window.getComputedStyle(titleContent).maxWidth,
                    maxHeight: window.getComputedStyle(titleContent).maxHeight,
                    padding: window.getComputedStyle(titleContent).padding,
                    margin: window.getComputedStyle(titleContent).margin,
                    display: window.getComputedStyle(titleContent).display,
                    flexDirection: window.getComputedStyle(titleContent).flexDirection,
                    justifyContent: window.getComputedStyle(titleContent).justifyContent,
                    alignItems: window.getComputedStyle(titleContent).alignItems,
                    boundingBox: titleContent.getBoundingClientRect()
                } : null,
                gameTitle: gameTitle ? {
                    fontSize: window.getComputedStyle(gameTitle).fontSize,
                    margin: window.getComputedStyle(gameTitle).margin,
                    boundingBox: gameTitle.getBoundingClientRect()
                } : null,
                titleMenu: titleMenu ? {
                    display: window.getComputedStyle(titleMenu).display,
                    gap: window.getComputedStyle(titleMenu).gap,
                    margin: window.getComputedStyle(titleMenu).margin,
                    boundingBox: titleMenu.getBoundingClientRect()
                } : null
            };
        });
        
        console.log('=== VIEWPORT ===');
        console.log('Size:', elements.viewport);
        
        console.log('\n=== START SCREEN ===');
        console.log('Position:', elements.startScreen?.position);
        console.log('Dimensions:', elements.startScreen?.width, 'x', elements.startScreen?.height);
        console.log('Background Image:', elements.startScreen?.backgroundImage);
        console.log('Background Size:', elements.startScreen?.backgroundSize);
        console.log('Background Position:', elements.startScreen?.backgroundPosition);
        console.log('Flex Properties:', elements.startScreen?.display, elements.startScreen?.alignItems, elements.startScreen?.justifyContent);
        console.log('Bounding Box:', elements.startScreen?.boundingBox);
        
        console.log('\n=== TITLE CONTENT ===');
        console.log('Max Size:', elements.titleContent?.maxWidth, 'x', elements.titleContent?.maxHeight);
        console.log('Flex Properties:', elements.titleContent?.display, elements.titleContent?.flexDirection);
        console.log('Alignment:', elements.titleContent?.justifyContent, elements.titleContent?.alignItems);
        console.log('Bounding Box:', elements.titleContent?.boundingBox);
        
        console.log('\n=== GAME TITLE ===');
        console.log('Font Size:', elements.gameTitle?.fontSize);
        console.log('Margin:', elements.gameTitle?.margin);
        console.log('Bounding Box:', elements.gameTitle?.boundingBox);
        
        console.log('\n=== TITLE MENU ===');
        console.log('Display:', elements.titleMenu?.display);
        console.log('Gap:', elements.titleMenu?.gap);
        console.log('Margin:', elements.titleMenu?.margin);
        console.log('Bounding Box:', elements.titleMenu?.boundingBox);
        
        // 中央配置の確認
        const centerAnalysis = await page.evaluate(() => {
            const titleContent = document.querySelector('.title-content');
            if (!titleContent) return null;
            
            const rect = titleContent.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            const centerX = viewportWidth / 2;
            const centerY = viewportHeight / 2;
            
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;
            
            return {
                viewport: { width: viewportWidth, height: viewportHeight },
                viewportCenter: { x: centerX, y: centerY },
                elementCenter: { x: elementCenterX, y: elementCenterY },
                offset: { 
                    x: elementCenterX - centerX, 
                    y: elementCenterY - centerY 
                },
                isHorizontallyCentered: Math.abs(elementCenterX - centerX) < 5,
                isVerticallyCentered: Math.abs(elementCenterY - centerY) < 5
            };
        });
        
        console.log('\n=== CENTER ANALYSIS ===');
        console.log('Viewport center:', centerAnalysis?.viewportCenter);
        console.log('Element center:', centerAnalysis?.elementCenter);
        console.log('Offset from center:', centerAnalysis?.offset);
        console.log('Horizontally centered:', centerAnalysis?.isHorizontallyCentered);
        console.log('Vertically centered:', centerAnalysis?.isVerticallyCentered);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testTitlePosition();