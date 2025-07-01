/**
 * ゲームモード管理クラス
 * タイトル画面、ソロモード、対戦モードの切り替えを管理
 */
export class GameModeManager {
    constructor() {
        this.currentMode = 'title'; // 'title', 'solo', 'battle', 'solo-waiting'
        this.game = null; // ソロゲームインスタンス
        this.battleGame = null; // 対戦ゲームインスタンス
        
        this.initializeElements();
        this.setupModeEventListeners();
    }
    
    initializeElements() {
        // スクリーン要素
        this.startScreen = document.getElementById('start-screen');
        this.gameArea = document.querySelector('.game-area');
        this.battleScreen = document.getElementById('battle-screen');
        
        // モード選択ボタン
        this.soloModeBtn = document.getElementById('solo-mode-btn');
        this.battleModeBtn = document.getElementById('battle-mode-btn');
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
                this.switchToBattleMode();
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
            }
        }, true); // キャプチャフェーズで実行
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
                } else {
                    console.error('❌ メインのBattleGameクラスが見つかりません');
                }
            }
        }, 100);
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
        
        // ゲームオーバー画面も非表示
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
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