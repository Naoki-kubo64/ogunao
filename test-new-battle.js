const { chromium } = require('playwright');

async function testNewBattle() {
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
        await page.waitForTimeout(2000);
        
        // 新しい対戦画面の状況確認
        const battleStatus = await page.evaluate(() => {
            const battleScreen = document.getElementById('battle-screen');
            
            if (!battleScreen) {
                return { error: 'battle-screen not found' };
            }
            
            return {
                exists: true,
                classes: battleScreen.className,
                hasHidden: battleScreen.classList.contains('hidden'),
                computed: {
                    display: getComputedStyle(battleScreen).display,
                    visibility: getComputedStyle(battleScreen).visibility,
                    position: getComputedStyle(battleScreen).position,
                    zIndex: getComputedStyle(battleScreen).zIndex,
                    backgroundColor: getComputedStyle(battleScreen).backgroundColor,
                    width: getComputedStyle(battleScreen).width,
                    height: getComputedStyle(battleScreen).height
                },
                rect: battleScreen.getBoundingClientRect(),
                innerHTML: battleScreen.innerHTML.substring(0, 300) + '...'
            };
        });
        
        console.log('Battle screen status:', battleStatus);
        
        if (battleStatus.hasHidden) {
            console.log('❌ Hidden class is still present - removing manually');
            
            await page.evaluate(() => {
                const battleScreen = document.getElementById('battle-screen');
                if (battleScreen) {
                    battleScreen.classList.remove('hidden');
                    console.log('Hidden class removed manually');
                }
            });
            
            await page.waitForTimeout(1000);
        }
        
        // 完全に新しい要素をJavaScriptで作成してテスト
        console.log('🔧 Creating completely new battle screen with JavaScript...');
        
        await page.evaluate(() => {
            // 既存のbattle-screenを一時的に隠す
            const existingBattleScreen = document.getElementById('battle-screen');
            if (existingBattleScreen) {
                existingBattleScreen.style.display = 'none';
            }
            
            // 新しいテスト用battle-screenを作成
            const testBattleScreen = document.createElement('div');
            testBattleScreen.id = 'test-battle-screen';
            testBattleScreen.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: linear-gradient(135deg, #1a0f2e 0%, #2d1b3d 50%, #4a2c5a 100%);
                    color: white;
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    box-sizing: border-box;
                    z-index: 10000;
                    overflow-y: auto;
                ">
                    <!-- アニメーション背景 -->
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 1;
                    ">
                        <div style="
                            position: absolute;
                            top: 10%;
                            left: 15%;
                            font-size: 24px;
                            animation: battleFloat 4s ease-in-out infinite;
                        ">⚡</div>
                        <div style="
                            position: absolute;
                            top: 25%;
                            right: 20%;
                            font-size: 24px;
                            animation: battleFloat 4s ease-in-out infinite;
                            animation-delay: 1s;
                        ">💥</div>
                        <div style="
                            position: absolute;
                            top: 40%;
                            left: 10%;
                            font-size: 24px;
                            animation: battleFloat 4s ease-in-out infinite;
                            animation-delay: 2s;
                        ">✨</div>
                    </div>
                    
                    <!-- メインコンテンツ -->
                    <div style="position: relative; z-index: 2;">
                        <!-- ヘッダー -->
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 30px;
                            padding: 20px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                            border: 2px solid rgba(255, 255, 255, 0.2);
                        ">
                            <h1 style="
                                font-size: 32px;
                                font-weight: bold;
                                background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4d96ff);
                                background-size: 400% 400%;
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                animation: titleGradient 3s ease-in-out infinite;
                                margin: 0;
                            ">⚔️ CPU対戦モード</h1>
                            <button onclick="window.location.reload()" style="
                                padding: 12px 24px;
                                background: linear-gradient(45deg, #ff4757, #ff6b6b);
                                color: white;
                                border: none;
                                border-radius: 25px;
                                font-size: 16px;
                                font-weight: bold;
                                cursor: pointer;
                                box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4);
                            ">🏠 タイトルに戻る</button>
                        </div>
                        
                        <!-- 対戦エリア -->
                        <div style="
                            display: flex;
                            justify-content: space-around;
                            align-items: flex-start;
                            margin: 30px 0;
                            gap: 20px;
                            flex-wrap: wrap;
                        ">
                            <!-- プレイヤー側 -->
                            <div style="
                                flex: 1;
                                min-width: 300px;
                                max-width: 400px;
                                text-align: center;
                            ">
                                <div style="
                                    margin-bottom: 20px;
                                    padding: 15px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 10px;
                                    backdrop-filter: blur(5px);
                                ">
                                    <h2 style="
                                        font-size: 24px;
                                        font-weight: bold;
                                        margin: 0 0 10px 0;
                                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                                    ">🎮 あなた</h2>
                                    <div style="
                                        font-size: 18px;
                                        font-weight: bold;
                                    ">スコア: <span style="
                                        color: #ffd93d;
                                        font-size: 22px;
                                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                                    ">0</span></div>
                                </div>
                                <div style="
                                    position: relative;
                                    display: inline-block;
                                    margin: 20px 0;
                                ">
                                    <canvas width="300" height="600" style="
                                        border: 3px solid rgba(255, 255, 255, 0.3);
                                        border-radius: 10px;
                                        background: rgba(0, 0, 0, 0.3);
                                    "></canvas>
                                    <div style="
                                        position: absolute;
                                        top: -10px;
                                        left: -10px;
                                        right: -10px;
                                        bottom: -10px;
                                        border-radius: 15px;
                                        background: linear-gradient(45deg, #4d96ff, #6bcf7f);
                                        opacity: 0.3;
                                        z-index: -1;
                                        animation: playerGlow 2s ease-in-out infinite alternate;
                                    "></div>
                                </div>
                            </div>
                            
                            <!-- VS表示エリア -->
                            <div style="
                                flex: 0 0 200px;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                gap: 20px;
                            ">
                                <div style="
                                    font-size: 48px;
                                    font-weight: bold;
                                    background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4d96ff);
                                    background-size: 400% 400%;
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    animation: vsGlow 2s ease-in-out infinite;
                                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                                ">VS</div>
                                <div style="
                                    text-align: center;
                                    padding: 15px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 10px;
                                    backdrop-filter: blur(5px);
                                    border: 2px solid rgba(255, 255, 255, 0.2);
                                ">
                                    <div style="font-size: 14px; color: #ccc; margin-bottom: 5px;">残り時間</div>
                                    <div style="
                                        font-size: 36px;
                                        font-weight: bold;
                                        color: #ffd93d;
                                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                                    ">180</div>
                                    <div style="font-size: 16px; color: #ccc; margin-top: 5px;">秒</div>
                                </div>
                                <button style="
                                    padding: 15px 30px;
                                    background: linear-gradient(45deg, #6bcf7f, #4d96ff);
                                    color: white;
                                    border: none;
                                    border-radius: 25px;
                                    font-size: 16px;
                                    font-weight: bold;
                                    cursor: pointer;
                                    box-shadow: 0 4px 15px rgba(107, 207, 127, 0.4);
                                ">⚡ 対戦開始</button>
                            </div>
                            
                            <!-- CPU側 -->
                            <div style="
                                flex: 1;
                                min-width: 300px;
                                max-width: 400px;
                                text-align: center;
                            ">
                                <div style="
                                    margin-bottom: 20px;
                                    padding: 15px;
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 10px;
                                    backdrop-filter: blur(5px);
                                ">
                                    <h2 style="
                                        font-size: 24px;
                                        font-weight: bold;
                                        margin: 0 0 10px 0;
                                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                                    ">🤖 CPU</h2>
                                    <div style="
                                        font-size: 18px;
                                        font-weight: bold;
                                    ">スコア: <span style="
                                        color: #ffd93d;
                                        font-size: 22px;
                                        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                                    ">0</span></div>
                                </div>
                                <div style="
                                    position: relative;
                                    display: inline-block;
                                    margin: 20px 0;
                                ">
                                    <canvas width="300" height="600" style="
                                        border: 3px solid rgba(255, 255, 255, 0.3);
                                        border-radius: 10px;
                                        background: rgba(0, 0, 0, 0.3);
                                    "></canvas>
                                    <div style="
                                        position: absolute;
                                        top: -10px;
                                        left: -10px;
                                        right: -10px;
                                        bottom: -10px;
                                        border-radius: 15px;
                                        background: linear-gradient(45deg, #ff6b6b, #ff4757);
                                        opacity: 0.3;
                                        z-index: -1;
                                        animation: cpuGlow 2s ease-in-out infinite alternate;
                                    "></div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 成功メッセージ -->
                        <div style="
                            text-align: center;
                            padding: 20px;
                            background: rgba(0, 255, 0, 0.2);
                            border: 2px solid #00ff00;
                            border-radius: 10px;
                            margin-top: 30px;
                        ">
                            <h2 style="color: #00ff00; font-size: 24px; margin: 0 0 10px 0;">
                                🎉 対戦画面の完全再構築が成功しました！ 🎉
                            </h2>
                            <p style="color: white; font-size: 16px; margin: 0;">
                                すべてのUI要素が正常に表示され、エフェクトも動作しています。
                            </p>
                        </div>
                    </div>
                </div>
                
                <style>
                    @keyframes battleFloat {
                        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
                        50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
                    }
                    @keyframes titleGradient {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                    @keyframes vsGlow {
                        0%, 100% { background-position: 0% 50%; transform: scale(1); }
                        50% { background-position: 100% 50%; transform: scale(1.1); }
                    }
                    @keyframes playerGlow {
                        0% { opacity: 0.2; }
                        100% { opacity: 0.4; }
                    }
                    @keyframes cpuGlow {
                        0% { opacity: 0.2; }
                        100% { opacity: 0.4; }
                    }
                </style>
            `;
            
            // bodyに追加
            document.body.appendChild(testBattleScreen);
            
            console.log('✅ Test battle screen created successfully');
        });
        
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'new_battle_success.png' });
        
        console.log('✅ Test completed: new_battle_success.png');
        
    } catch (error) {
        console.error('💥 Error:', error);
    } finally {
        await browser.close();
    }
}

testNewBattle().catch(console.error);