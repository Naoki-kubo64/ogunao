const { chromium } = require('playwright');

async function forceBattleDisplay() {
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
        
        // 強制的にテスト用のコンテンツを追加
        await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            if (battleScreen) {
                // 既存のコンテンツをクリア
                battleScreen.innerHTML = '';
                
                // 新しいテスト用コンテンツを追加
                battleScreen.innerHTML = `
                    <div style="
                        position: absolute;
                        top: 50px;
                        left: 50px;
                        width: 800px;
                        height: 600px;
                        background: rgba(255, 255, 255, 0.9);
                        color: black;
                        padding: 20px;
                        border-radius: 10px;
                        font-size: 18px;
                        z-index: 10000;
                    ">
                        <h1 style="color: red; font-size: 36px;">🎮 対戦モード テスト</h1>
                        <p>このテキストが見えている場合、battle-screen は正常に表示されています。</p>
                        <p>元のコンテンツが表示されない原因は CSS の問題です。</p>
                        
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            margin-top: 50px;
                        ">
                            <div style="
                                width: 300px;
                                height: 400px;
                                background: #4CAF50;
                                text-align: center;
                                padding: 20px;
                                color: white;
                            ">
                                <h3>プレイヤー側</h3>
                                <div style="
                                    width: 200px;
                                    height: 300px;
                                    background: #333;
                                    margin: 10px auto;
                                ">ゲームボード</div>
                            </div>
                            
                            <div style="
                                width: 100px;
                                text-align: center;
                                padding: 20px;
                            ">
                                <h2 style="color: red; font-size: 48px;">VS</h2>
                                <button style="
                                    padding: 10px 20px;
                                    font-size: 16px;
                                    background: #2196F3;
                                    color: white;
                                    border: none;
                                    border-radius: 5px;
                                    cursor: pointer;
                                ">対戦開始</button>
                            </div>
                            
                            <div style="
                                width: 300px;
                                height: 400px;
                                background: #FF5722;
                                text-align: center;
                                padding: 20px;
                                color: white;
                            ">
                                <h3>CPU側</h3>
                                <div style="
                                    width: 200px;
                                    height: 300px;
                                    background: #333;
                                    margin: 10px auto;
                                ">ゲームボード</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <button style="
                                padding: 15px 30px;
                                font-size: 18px;
                                background: #9C27B0;
                                color: white;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                            " onclick="window.location.reload()">タイトルに戻る</button>
                        </div>
                    </div>
                `;
                
                console.log('✅ テスト用コンテンツを追加しました');
            }
        });
        
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'battle_forced_content.png' });
        
        console.log('✅ 強制表示テスト完了: battle_forced_content.png');
        
        // 原因の特定のため、元のコンテンツを復元して確認
        await page.evaluate(() => {
            // ページをリロードして元の状態に戻す
            window.location.reload();
        });
        
        await page.waitForTimeout(3000);
        
        console.log('🎮 再度対戦モードをテスト...');
        await page.click('#battle-mode-btn');
        await page.waitForTimeout(3000);
        
        // CSS の継承問題を確認
        const cssInheritance = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            const computed = getComputedStyle(battleScreen);
            
            return {
                fontFamily: computed.fontFamily,
                fontSize: computed.fontSize,
                fontWeight: computed.fontWeight,
                lineHeight: computed.lineHeight,
                textAlign: computed.textAlign,
                fontStyle: computed.fontStyle,
                letterSpacing: computed.letterSpacing,
                wordSpacing: computed.wordSpacing
            };
        });
        
        console.log('\\n📝 CSS フォント継承:', cssInheritance);
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

forceBattleDisplay().catch(console.error);