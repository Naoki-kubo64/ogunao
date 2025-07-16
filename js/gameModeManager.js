/**
 * ゲームモード管理クラス
 * タイトル画面、ソロモード、対戦モードの切り替えを管理
 */
class GameModeManager {
    constructor() {
        this.currentMode = 'title'; // 'title', 'solo', 'battle', 'story', 'solo-waiting'
        this.game = null; // ソロゲームインスタンス
        this.battleGame = null; // 対戦ゲームインスタンス
        this.storyMode = null; // ストーリーモードインスタンス
        
        this.initializeElements();
        this.setupModeEventListeners();
    }
    
    initializeElements() {
        // スクリーン要素
        this.startScreen = document.getElementById('start-screen');
        this.gameArea = document.querySelector('.game-area');
        this.battleScreen = document.getElementById('battle-screen');
        this.storyScreen = document.getElementById('story-screen');
        
        // モード選択ボタン
        this.soloModeBtn = document.getElementById('solo-mode-btn');
        this.battleModeBtn = document.getElementById('battle-mode-btn');
        this.storyModeBtn = document.getElementById('story-mode-btn');
        this.backToTitleBtn = document.getElementById('back-to-title');
        
        // Press Enter Key 表示要素
        this.pressEnterInstruction = document.getElementById('press-enter-instruction');
        this.startInstruction = document.querySelector('.start-instruction');
        
        console.log('🎮 ゲームモード管理システムを初期化しました');
    }
    
    setupModeEventListeners() {
        // ソロモードボタン
        if (this.soloModeBtn) {
            this.soloModeBtn.addEventListener('click', () => {
                this.showPressEnterInstruction();
            });
        }
        
        // 対戦モードボタン
        if (this.battleModeBtn) {
            this.battleModeBtn.addEventListener('click', () => {
                this.showBattlePressEnterInstruction();
            });
        }
        
        // ストーリーモードボタン
        if (this.storyModeBtn) {
            this.storyModeBtn.addEventListener('click', () => {
                this.showStoryStartMenu();
            });
        }
        
        // タイトルに戻るボタン
        if (this.backToTitleBtn) {
            this.backToTitleBtn.addEventListener('click', () => {
                this.switchToTitleMode();
            });
        }
        
        // Enterキーによるソロモード開始（既存の動作との互換性）
        // 既存のキーハンドラーと競合しないよう、より優先度の高いイベントリスナーとして追加
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (this.currentMode === 'title' || this.currentMode === 'solo-waiting')) {
                // タイトル画面またはソロ待機画面でEnterが押された場合、ソロモードに切り替え
                e.preventDefault();
                e.stopPropagation();
                this.switchToSoloMode();
            } else if (e.key === 'Enter' && this.currentMode === 'battle-waiting') {
                // 対戦待機画面でEnterが押された場合、対戦モードに切り替え
                e.preventDefault();
                e.stopPropagation();
                this.switchToBattleMode();
            } else if (e.key === 'Enter' && (this.currentMode === 'solo' || this.currentMode === 'battle')) {
                // ゲーム実行中はGameModeManagerでのエンター処理をスキップ（メインゲームの一時停止処理に任せる）
                console.log('🎮 ゲーム実行中 - エンター処理をメインゲームに委譲');
                return;
            }
        }, true); // キャプチャフェーズで実行
        
        // ストーリーモード開始メニューのイベントリスナー
        this.setupStoryStartMenuEventListeners();
    }
    
    showPressEnterInstruction() {
        console.log('🎮 ソロプレイが選択されました - Press Enter Key表示');
        
        // モード選択の説明文を非表示
        if (this.startInstruction) {
            this.startInstruction.style.display = 'none';
        }
        
        // Press Enter Key表示を表示
        if (this.pressEnterInstruction) {
            this.pressEnterInstruction.classList.remove('hidden');
        }
        
        // モードを"solo-waiting"に設定（Enterキー待ち状態）
        this.currentMode = 'solo-waiting';
    }
    
    showBattlePressEnterInstruction() {
        console.log('⚔️ 対戦モードが選択されました - Press Enter Key表示');
        
        // モード選択の説明文を非表示
        if (this.startInstruction) {
            this.startInstruction.style.display = 'none';
        }
        
        // Press Enter Key表示を表示
        if (this.pressEnterInstruction) {
            this.pressEnterInstruction.classList.remove('hidden');
        }
        
        // モードを battle-waiting に設定
        this.currentMode = 'battle-waiting';
        
        console.log('✅ 対戦モード開始待機状態になりました');
    }
    
    switchToTitleMode() {
        console.log('📱 タイトル画面に切り替え');
        this.currentMode = 'title';
        
        // bodyのflexboxを元に戻す
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        
        // 全画面を非表示
        this.hideAllScreens();
        
        // タイトル画面を表示
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
        }
        
        // Press Enter Key表示を非表示にして、元の説明文を表示
        if (this.pressEnterInstruction) {
            this.pressEnterInstruction.classList.add('hidden');
        }
        if (this.startInstruction) {
            this.startInstruction.style.display = 'block';
        }
        
        // 対戦ゲームを破棄
        if (this.battleGame) {
            this.battleGame.destroy();
            this.battleGame = null;
        }
        
        // ストーリーモードをリセット
        if (this.storyMode) {
            this.storyMode = null;
        }
        
        console.log('✅ タイトル画面に戻りました');
    }
    
    switchToSoloMode() {
        // 既にソロモードまたはゲーム実行中の場合は何もしない
        if (this.currentMode === 'solo' || (this.game && this.game.gameRunning)) {
            console.log('⚠️ 既にソロモードまたはゲーム実行中です');
            return;
        }
        
        console.log('🎮 ソロモードに切り替え');
        this.currentMode = 'solo';
        
        setTimeout(() => {
            if (this.game && !this.game.gameRunning) {
                const commentInput = document.getElementById('comment-input');
                if (document.activeElement === commentInput) {
                    commentInput.blur();
                }
                this.game.startGame();
                // ゲーム開始後もソロモード状態を維持
                console.log('✅ ソロゲーム開始 - currentMode保持:', this.currentMode);
            }
        }, 150);
    }
    
    switchToBattleMode() {
        console.log('⚔️ 対戦モードに切り替え');
        this.currentMode = 'battle';
        
        // bodyのflexboxを一時的に無効化
        document.body.style.display = 'block';
        document.body.style.justifyContent = 'initial';
        document.body.style.alignItems = 'initial';
        
        // 全画面を非表示
        this.hideAllScreens();
        
        // 対戦画面を表示
        if (this.battleScreen) {
            this.battleScreen.classList.remove('hidden');
            this.battleScreen.style.display = 'block';
            this.battleScreen.style.visibility = 'visible';
            
            // 位置を強制的に修正
            this.battleScreen.style.position = 'fixed';
            this.battleScreen.style.top = '0px';
            this.battleScreen.style.left = '0px';
            this.battleScreen.style.width = '100vw';
            this.battleScreen.style.height = '100vh';
            this.battleScreen.style.zIndex = '9999';
            this.battleScreen.style.margin = '0';
            this.battleScreen.style.padding = '0';
            this.battleScreen.style.transform = 'none';
            
            console.log('✅ 対戦画面を表示しました');
        } else {
            console.error('❌ 対戦画面要素が見つかりません');
        }
        
        // 少し遅延してから対戦ゲームを初期化
        setTimeout(() => {
            if (!this.battleGame) {
                // メインのBattleGameクラスを使用（script.jsから）
                if (window.BattleGame) {
                    this.battleGame = new window.BattleGame();
                    console.log('✅ 対戦ゲーム（メイン版）を初期化しました');
                    console.log('✅ 対戦ゲーム開始 - currentMode保持:', this.currentMode);
                } else {
                    console.error('❌ メインのBattleGameクラスが見つかりません');
                }
            }
        }, 100);
    }
    
    switchToStoryMode() {
        console.log('📖 ストーリーモードに切り替え');
        this.currentMode = 'story';
        
        // 全画面を非表示
        this.hideAllScreens();
        
        // ストーリーマップ画面を表示
        const mapScreen = document.getElementById('story-map-screen');
        if (mapScreen) {
            mapScreen.classList.remove('hidden');
            console.log('✅ ストーリーマップ画面を表示しました');
        } else {
            console.error('❌ ストーリーマップ画面要素が見つかりません');
        }
        
        // ストーリーモードを初期化
        if (!this.storyMode) {
            if (window.StoryMode) {
                this.storyMode = new window.StoryMode();
                this.storyMode.initialize();
                // グローバルアクセス用にwindowオブジェクトに設定
                window.storyMode = this.storyMode;
                console.log('✅ ストーリーモードを初期化しました');
            } else {
                console.error('❌ StoryModeクラスが見つかりません');
            }
        }
    }
    
    hideAllScreens() {
        // タイトル画面を非表示
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
        }
        
        // ゲームエリアを非表示
        if (this.gameArea) {
            this.gameArea.style.display = 'none';
        }
        
        // 対戦画面を非表示
        if (this.battleScreen) {
            this.battleScreen.classList.add('hidden');
            this.battleScreen.style.display = 'none';
            this.battleScreen.style.visibility = 'hidden';
        }
        
        // ストーリー画面を非表示
        if (this.storyScreen) {
            this.storyScreen.classList.add('hidden');
        }
        
        // ゲームオーバー画面も非表示
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }
    
    // ストーリーモード開始メニュー表示
    showStoryStartMenu() {
        console.log('📖 ストーリーモード開始メニューを表示');
        console.log('🔍 showStoryStartMenu method called successfully');
        const storyStartMenu = document.getElementById('story-start-menu');
        if (storyStartMenu) {
            console.log('✅ story-start-menu element found');
            storyStartMenu.classList.remove('hidden');
            console.log('✅ hidden class removed from story-start-menu');
        } else {
            console.log('❌ story-start-menu element NOT found');
        }
    }
    
    // ストーリーモード開始メニューを隠す
    hideStoryStartMenu() {
        const storyStartMenu = document.getElementById('story-start-menu');
        if (storyStartMenu) {
            storyStartMenu.classList.add('hidden');
        }
    }
    
    // ストーリーモード開始メニューのイベントリスナー設定
    setupStoryStartMenuEventListeners() {
        // NEW GAME
        const newGameBtn = document.getElementById('story-new-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.hideStoryStartMenu();
                this.switchToStoryMode();
            });
        }
        
        // LOAD GAME
        const loadGameBtn = document.getElementById('story-load-game');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => {
                this.showLoadSelectMenu();
            });
        }
        
        // 戻る
        const backBtn = document.getElementById('story-start-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.hideStoryStartMenu();
            });
        }
    }
    
    // ロード選択メニュー表示
    showLoadSelectMenu() {
        console.log('📂 ロード選択メニューを表示');
        // セーブ選択メニューを流用してロード用に変更
        const saveMenu = document.getElementById('save-select-menu');
        if (saveMenu) {
            saveMenu.classList.remove('hidden');
            this.updateLoadSlotInfo();
            this.setupLoadMenuEventListeners();
        }
    }
    
    // ロードスロット情報更新
    updateLoadSlotInfo() {
        if (!window.StoryMode) return;
        
        const tempStoryMode = new window.StoryMode();
        for (let i = 0; i < 3; i++) {
            const infoElement = document.getElementById(`save-info-${i}`);
            if (infoElement) {
                const saveInfo = tempStoryMode.getSaveInfo(i);
                if (saveInfo) {
                    const date = new Date(saveInfo.timestamp);
                    infoElement.innerHTML = `
                        <div>フロア: ${saveInfo.floor}</div>
                        <div>HP: ${saveInfo.playerHP}/${saveInfo.playerMaxHP}</div>
                        <div>ゴールド: ${saveInfo.gold}</div>
                        <div class="save-date">${date.toLocaleString()}</div>
                    `;
                    infoElement.parentElement.parentElement.style.cursor = 'pointer';
                } else {
                    infoElement.textContent = '空のスロット';
                    infoElement.parentElement.parentElement.style.cursor = 'not-allowed';
                }
            }
        }
    }
    
    // ロードメニューのイベントリスナー設定
    setupLoadMenuEventListeners() {
        // セーブスロット選択でロード
        const saveSlots = document.querySelectorAll('.save-slot');
        saveSlots.forEach((slot, index) => {
            // 既存のイベントリスナーを削除
            const newSlot = slot.cloneNode(true);
            slot.parentNode.replaceChild(newSlot, slot);
            
            newSlot.addEventListener('click', () => {
                if (window.StoryMode) {
                    const tempStoryMode = new window.StoryMode();
                    if (tempStoryMode.hasSaveData(index)) {
                        this.hideStoryStartMenu();
                        const saveMenu = document.getElementById('save-select-menu');
                        if (saveMenu) saveMenu.classList.add('hidden');
                        
                        // ストーリーモードを開始してデータをロード
                        this.switchToStoryModeForLoad();
                        setTimeout(() => {
                            if (this.storyMode) {
                                this.storyMode.loadGame(index);
                            }
                        }, 100);
                    } else {
                        alert('このスロットにはセーブデータがありません');
                    }
                }
            });
        });
    }

    // ロード用のストーリーモード切り替え（初期化をスキップ）
    switchToStoryModeForLoad() {
        console.log('📖 ストーリーモード（ロード用）に切り替え');
        this.currentMode = 'story';
        
        // 全画面を非表示
        this.hideAllScreens();
        
        // ストーリーマップ画面を表示（ロード用なので直接マップ画面へ）
        const mapScreen = document.getElementById('story-map-screen');
        if (mapScreen) {
            mapScreen.classList.remove('hidden');
            console.log('✅ ストーリーマップ画面を表示しました');
        } else {
            console.error('❌ ストーリーマップ画面要素が見つかりません');
        }
        
        // ストーリーモードを初期化（初期パス選択なし）
        if (!this.storyMode) {
            if (window.StoryMode) {
                this.storyMode = new window.StoryMode();
                // 初期化をスキップしてセットアップのみ実行
                this.storyMode.setupEventListeners();
                this.storyMode.initializeMapSystem();
                // グローバルアクセス用にwindowオブジェクトに設定
                window.storyMode = this.storyMode;
                console.log('✅ ストーリーモード（ロード用）を初期化しました');
            } else {
                console.error('❌ StoryModeクラスが見つかりません');
            }
        }
    }

    setGameInstance(gameInstance) {
        this.game = gameInstance;
        console.log('🎮 ゲームインスタンスが設定されました');
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
}