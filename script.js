// Firebase設定は firebase-config.js で読み込まれます
// dbオブジェクトはそちらで初期化されています

// デモ用のローカルランキングデータ（初期は空）
let localRanking = [];

// ================================================
// メインゲームクラス
// ================================================
class PuyoPuyoGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.BOARD_WIDTH = 6;
        this.BOARD_HEIGHT = 12;
        this.CELL_SIZE = 65;
        
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.nextPiece2 = null; // なおコンボ用の2個目のピース
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.gameRunning = false;
        this.gamePaused = false; // ポーズ状態
        this.difficulty = 'normal';
        this.fallSpeed = 1000;
        this.isSeparatedPiece = false; // 切り離されたピースかどうか
        this.scoreSubmitted = false; // スコアが登録済みかどうか
        this.isPlacingPiece = false; // ピース配置中かどうか
        this.gameHasStartedBefore = false; // ゲームが一度でも開始されたかどうか
        
        // Enter キー debounce 用
        this.lastEnterKeyTime = 0;
        this.enterKeyDebounceMs = 300;
        
        // イベントリスナー管理用
        this.eventListeners = [];
        this.boundKeyHandler = null;
        
        // コンボ状態
        this.oguComboActive = false;
        this.oguComboEndTime = 0;
        this.naoComboActive = false;
        this.showNextPieceExtra = false;
        this.saikyoComboReady = false;
        
        // なおちゃんタイム状態
        this.naochanTimeActive = false;
        this.naochanTimeRemaining = 0;
        this.naochanTimeStartTime = 0;
        this.naochanTimeTriggeredByScore = false;
        this.naochanTimeTriggeredBy600k = false;
        this.naochanTimeTriggeredBy1M = false;
        
        // なおコンボタイマー
        this.naoComboStartTime = 0;
        
        // 応援システムフラグ
        this.supportTriggered50k = false;
        this.supportTriggered100k = false;
        this.supportTriggered200k = false;
        this.supportTriggered600k = false;
        this.supportTriggered1M = false;
        this.supportTimer = null;
        
        // なおちゃんチャット機能初期化
        this.initNaochanChat();
        
        this.colors = [
            null,
            '#FF4444', // 赤
            '#44FF44', // 緑
            '#4444FF', // 青
            '#FFFF44', // 黄
            '#FF44FF'  // 紫
        ];
        
        // 画像を読み込み
        this.puyoImages = [];
        this.cutinImage = null;
        this.cutin3ChainImage = null;
        this.cutin5ChainImage = null;
        this.imagesLoaded = 0;
        this.totalImages = 8; // カットイン画像3枚を含めて8枚
        
        const imageFiles = [
            'images/otafuku.png',
            'images/nao12.jpg', 
            'images/nao4.png',
            'images/raw.png',
            'images/歌手.png'
        ];
        
        for (let i = 0; i < imageFiles.length; i++) {
            this.puyoImages[i + 1] = new Image();
            this.puyoImages[i + 1].onload = () => {
                this.imagesLoaded++;
                if (this.imagesLoaded === this.totalImages) {
                    console.log('All images loaded');
                    this.render(); // 画像読み込み完了後に再描画
                }
            };
            this.puyoImages[i + 1].onerror = () => {
                console.error(`Failed to load image: ${imageFiles[i]}`);
                this.imagesLoaded++;
            };
            this.puyoImages[i + 1].src = imageFiles[i];
        }
        
        // 3連鎖カットイン画像を確実に読み込み
        this.cutin3ChainImage = new Image();
        
        this.cutin3ChainImage.onload = () => {
            this.imagesLoaded++;
            console.log('✅ 3Chain cutin image loaded successfully: nao7.png');
            console.log('3Chain image complete:', this.cutin3ChainImage.complete);
            console.log('3Chain image dimensions:', this.cutin3ChainImage.naturalWidth, 'x', this.cutin3ChainImage.naturalHeight);
            
            // 即座に画像の状態を再確認
            setTimeout(() => {
                console.log('🔍 3Chain image delayed check:');
                console.log('- complete:', this.cutin3ChainImage.complete);
                console.log('- naturalWidth:', this.cutin3ChainImage.naturalWidth);
                console.log('- src:', this.cutin3ChainImage.src);
            }, 100);
            
            if (this.imagesLoaded === this.totalImages) {
                console.log('All images loaded - Final status:');
                console.log('- Normal cutin:', this.cutinImage?.complete);
                console.log('- 3Chain cutin:', this.cutin3ChainImage?.complete);
                console.log('- 5Chain cutin:', this.cutin5ChainImage?.complete);
                this.render();
            }
        };
        
        this.cutin3ChainImage.onerror = (error) => {
            console.error('❌ Failed to load 3chain cutin image: images/nao7.png');
            console.error('Error details:', error);
            console.error('Error type:', error.type);
            this.imagesLoaded++;
        };
        
        console.log('Setting 3Chain cutin image src...');
        this.cutin3ChainImage.src = 'images/nao7.png'; // パスを簡素化
        console.log('3Chain cutin image src set to:', this.cutin3ChainImage.src);
        
        // 通常のカットイン画像を読み込み
        this.cutinImage = new Image();
        this.cutinImage.onload = () => {
            this.imagesLoaded++;
            console.log('Normal cutin image loaded: saginaoki.jpg');
            if (this.imagesLoaded === this.totalImages) {
                console.log('All images loaded');
                this.render();
            }
        };
        this.cutinImage.onerror = () => {
            console.error('Failed to load cutin image: images/saginaoki.jpg');
            this.imagesLoaded++;
        };
        this.cutinImage.src = 'images/saginaoki.jpg';
        
        // 5連鎖カットイン画像を読み込み
        this.cutin5ChainImage = new Image();
        this.cutin5ChainImage.onload = () => {
            this.imagesLoaded++;
            console.log('✅ 5Chain cutin image loaded');
            if (this.imagesLoaded === this.totalImages) {
                console.log('All images loaded');
                this.render();
            }
        };
        this.cutin5ChainImage.onerror = () => {
            console.error('❌ Failed to load 5chain cutin image: images/5rensa.png');
            this.imagesLoaded++;
        };
        this.cutin5ChainImage.src = 'images/5rensa.png';
        
        // BGM設定
        this.titleBgm = document.getElementById('title-bgm');
        this.bgm = document.getElementById('game-bgm');
        this.bgm2 = document.getElementById('game-bgm-2');
        this.naochanBgm = document.getElementById('naochan-bgm');
        
        // 音量設定の初期化
        this.bgmVolume = 0.5; // 50%
        this.seVolume = 0.7;  // 70%
        this.selectedSoloBgm = 'ぷよぷよっと始まる毎日.mp3'; // デフォルトのソロモードBGM
        this.customBgmAudio = null; // カスタムBGM用のAudio要素
        
        if (this.titleBgm && this.bgm && this.bgm2 && this.naochanBgm) {
            this.updateBgmVolume();
        } else {
            console.error('❌ Audio要素が見つかりません');
        }
        
        // SE要素の取得
        this.gameStartSE = document.getElementById('se-gamestart');
        this.chain2SE = document.getElementById('se-chain2');
        this.chain3SE = document.getElementById('se-chain3');
        this.chain4SE = document.getElementById('se-chain4');
        this.moveSE = document.getElementById('se-move');
        this.rotateSE = document.getElementById('se-rotate');
        this.clearSE = document.getElementById('se-clear');
        this.naochanTimeSE = document.getElementById('se-naochan-time');
        
        // 連鎖カットイン用動画要素
        this.god1CutinVideo = document.getElementById('god1-cutin-video'); // 5連鎖用
        this.god2CutinVideo = document.getElementById('god2-cutin-video'); // 6連鎖用
        this.godCutinVideo = document.getElementById('god-cutin-video');   // 7連鎖以上用
        
        if (this.god1CutinVideo) {
            this.god1CutinVideo.volume = this.seVolume;
            console.log('✅ GOD1 カットイン動画要素を取得しました');
        } else {
            console.error('❌ GOD1 カットイン動画要素が見つかりません');
        }
        
        if (this.god2CutinVideo) {
            this.god2CutinVideo.volume = this.seVolume;
            console.log('✅ GOD2 カットイン動画要素を取得しました');
        } else {
            console.error('❌ GOD2 カットイン動画要素が見つかりません');
        }
        
        if (this.godCutinVideo) {
            this.godCutinVideo.volume = this.seVolume;
            console.log('✅ GOD カットイン動画要素を取得しました');
        } else {
            console.error('❌ GOD カットイン動画要素が見つかりません');
        }
        
        // SE音量の初期化
        this.updateSeVolume();
        
        // ================================================
        // 🎵 BGM管理用の変数
        // ================================================
        this.currentBgm = null;
        this.bgmSwitched = false; // スコア200000でのBGM切り替えフラグ
        this.fadeInterval = null; // フェード処理用のインターバル
        
        // なおちゃんタイムモード用の変数
        this.naochanTimeActive = false; // なおちゃんタイム中かどうか
        this.naochanTimeRemaining = 0; // 残り時間（ミリ秒）
        this.naochanTimeStartTime = 0; // 開始時刻
        this.originalPuyoImages = null; // 元のピース画像を保存
        this.naochanImage = null; // なおちゃんタイム用画像
        
        // おぐなおコンボシステム用の変数
        this.oguComboActive = false; // 「おぐ」コンボ（緑+青）の効果中
        this.oguComboEndTime = 0; // 「おぐ」コンボ効果終了時刻
        this.naoComboActive = false; // 「なお」コンボ（赤+黄）の効果中
        this.showNextPieceExtra = false; // 次のピース2個先まで表示
        this.saikyoComboReady = false; // 「最強」コンボ準備完了
        
        // なおちゃんタイム用画像を読み込み
        this.naochanImage = new Image();
        this.naochanImage.onload = () => {
            console.log('✅ なおちゃんタイム用画像読み込み完了');
        };
        this.naochanImage.onerror = () => {
            console.warn('⚠️ なおちゃんタイム用画像の読み込みに失敗（nao7.pngを使用）');
            this.naochanImage = this.cutin3ChainImage; // フォールバック
        };
        this.naochanImage.src = 'images/nao7.png'; // 既存のなおちゃん画像を使用
        
        // SE設定
        this.seGameStart = document.getElementById('se-gamestart');
        this.seChain2 = document.getElementById('se-chain2');
        this.seChain3 = document.getElementById('se-chain3');
        this.seChain4 = document.getElementById('se-chain4');
        this.seMove = document.getElementById('se-move');
        this.seRotate = document.getElementById('se-rotate');
        this.seClear = document.getElementById('se-clear');
        this.seNaochanTime = document.getElementById('se-naochan-time');
        
        // SE音量設定
        if (this.seGameStart) this.seGameStart.volume = 0.7;
        if (this.seChain2) this.seChain2.volume = 0.8;
        if (this.seChain3) this.seChain3.volume = 0.8;
        if (this.seChain4) this.seChain4.volume = 0.8;
        if (this.seMove) this.seMove.volume = 0.4; // 移動音は控えめに
        if (this.seRotate) this.seRotate.volume = 0.5;
        if (this.seClear) this.seClear.volume = 0.6;
        if (this.seNaochanTime) this.seNaochanTime.volume = 0.8;
        
        this.lastFallTime = 0;
        this.timeStart = 0;
        
        // アニメーション効果用の変数
        this.puyoAnimations = Array(this.BOARD_HEIGHT).fill().map(() => 
            Array(this.BOARD_WIDTH).fill().map(() => ({
                scale: 1.0,
                bounce: 0,
                rotation: 0,
                lastLandTime: 0
            }))
        );
        this.animationTime = 0;
        
        // 手動配置モード用の変数
        this.manualPlaceMode = false;
        this.selectedColor = 1; // デフォルトは赤
        
        // 隠しコマンド用の変数
        this.secretKeySequence = [];
        this.debugModeVisible = true; // 開発モードではデフォルトで表示
        
        // 連鎖状態管理用の変数
        this.currentChainSequence = 0; // 現在の連鎖シーケンス数
        this.isInChainSequence = false; // 連鎖処理中かどうか
        
        this.setupEventListeners();
        this.generateNextPiece();
        this.spawnNewPiece();
        this.updateDisplay();
        this.render();
        
        // ランキングを初期読み込み
        this.loadRanking();
        
        // ビルドモードかどうかを検出（HTMLにstyle="display: none;"があるかチェック）
        const debugControls = document.querySelector('.debug-controls');
        if (debugControls && debugControls.style.display === 'none') {
            this.debugModeVisible = false;
            console.log('🚀 本番モード: デバッグコントロールは非表示です');
            console.log('💡 デバッグモードを表示するには "debug" と入力してください');
        }
        
        // ゲーム開始メッセージを表示
        console.log('ゲーム準備完了！Enterキーでゲーム開始');
    }
    
    // ================================================
    // 🎮 イベントリスナー設定（一元化）
    // ================================================
    
    // すべてのイベントリスナーを削除（グローバルレベル）
    static removeAllGlobalEventListeners() {
        if (window.globalEventListeners) {
            console.log(`🧹 グローバル ${window.globalEventListeners.length}個のイベントリスナーを削除中...`);
            window.globalEventListeners.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
            window.globalEventListeners = [];
            console.log('✅ グローバルイベントリスナーをすべて削除しました');
        }
    }
    
    // グローバルイベントリスナーを管理するためのヘルパーメソッド
    static addGlobalEventListenerWithTracking(element, event, handler, options = false) {
        if (!window.globalEventListeners) {
            window.globalEventListeners = [];
        }
        element.addEventListener(event, handler, options);
        window.globalEventListeners.push({ element, event, handler, options });
        console.log(`🔗 グローバルイベントリスナー追加: ${element.tagName || 'document'} -> ${event}`);
    }
    
    // イベントリスナーを管理するためのヘルパーメソッド
    addEventListenerWithTracking(element, event, handler, options = false) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
        console.log(`🔗 インスタンスイベントリスナー追加: ${element.tagName || 'document'} -> ${event}`);
    }
    
    // すべてのイベントリスナーを削除
    removeAllEventListeners() {
        console.log(`🧹 ${this.eventListeners.length}個のイベントリスナーを削除中...`);
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];
        console.log('✅ すべてのイベントリスナーを削除しました');
    }
    
    setupTitleMenuListeners() {
        // トレーニングモードボタン
        const trainingModeBtn = document.getElementById('training-mode-btn');
        if (trainingModeBtn) {
            console.log('🎯 トレーニングモードボタンにイベントリスナーを追加');
            this.addEventListenerWithTracking(trainingModeBtn, 'click', () => {
                console.log('🎮 トレーニングモードボタンがクリックされました');
                this.startTrainingMode();
            });
        } else {
            console.error('❌ トレーニングモードボタンが見つかりません');
        }
        
        // ストーリーモードボタン
        const storyModeBtn = document.getElementById('story-mode-btn');
        if (storyModeBtn) {
            this.addEventListenerWithTracking(storyModeBtn, 'click', () => {
                this.startStoryMode();
            });
        }
        
        // 対戦モードボタン
        const battleModeBtn = document.getElementById('battle-mode-btn');
        if (battleModeBtn) {
            console.log('🎯 対戦モードボタンにイベントリスナーを追加');
            this.addEventListenerWithTracking(battleModeBtn, 'click', () => {
                console.log('🎮 対戦モードボタンがクリックされました');
                this.startBattleMode();
            });
        } else {
            console.error('❌ 対戦モードボタンが見つかりません');
        }
        
        // ルール説明ボタン
        const rulesBtn = document.getElementById('rules-btn');
        if (rulesBtn) {
            this.addEventListenerWithTracking(rulesBtn, 'click', () => {
                this.showHelpModal();
            });
        }
        
        // 設定ボタン
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            this.addEventListenerWithTracking(settingsBtn, 'click', () => {
                alert('設定画面（未実装）');
            });
        }
        
        // ランキングボタン
        const rankingBtn = document.getElementById('ranking-btn');
        if (rankingBtn) {
            this.addEventListenerWithTracking(rankingBtn, 'click', () => {
                alert('ランキング画面（未実装）');
            });
        }
    }
    
    
    showHelpModal() {
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.classList.remove('hidden');
        }
    }
    
    startTrainingMode() {
        console.log('🎯 トレーニングモードを開始');
        if (window.gameModeManager) {
            window.gameModeManager.switchToSoloMode();
        }
    }
    
    startStoryMode() {
        console.log('📖 ストーリーモード選択');
        alert('ストーリーモード（未実装）\n近日公開予定です！');
    }
    
    startBattleMode() {
        console.log('⚔️ 対戦モードを開始');
        console.log('🔍 gameModeManager存在確認:', !!window.gameModeManager);
        if (window.gameModeManager) {
            console.log('✅ gameModeManagerが見つかりました - switchToBattleModeを呼び出し');
            window.gameModeManager.switchToBattleMode();
        } else {
            console.error('❌ gameModeManagerが見つかりません');
        }
    }
    
    setupEventListeners() {
        // 既存のイベントリスナーをクリア
        this.removeAllEventListeners();
        
        // キーボードイベントハンドラーを作成
        this.boundKeyHandler = (e) => this.handleKeyPress(e);
        this.addEventListenerWithTracking(document, 'keydown', this.boundKeyHandler);
        
        // タイトルメニューのイベントリスナー
        this.setupTitleMenuListeners();
        
        // UI要素のイベントリスナー
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            this.addEventListenerWithTracking(restartBtn, 'click', () => this.restart());
        }
        
        const difficultySelect = document.getElementById('difficulty-select');
        if (difficultySelect) {
            this.addEventListenerWithTracking(difficultySelect, 'change', (e) => {
                this.difficulty = e.target.value;
                this.updateFallSpeed();
            });
        }
        
        // 音量調整
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            this.addEventListenerWithTracking(volumeSlider, 'input', (e) => {
                this.updateVolume(e.target.value);
            });
        }
        
        // デバッグボタンのイベントリスナー
        const debugButtons = [
            { id: 'debug-2chain', action: () => this.debugChain(2) },
            { id: 'debug-3chain', action: () => this.debugChain(3) },
            { id: 'debug-4chain', action: () => this.debugChain(4) },
            { id: 'debug-5chain', action: () => this.debugChain(5) },
            { id: 'debug-7chain', action: () => this.debugChain(7) },
            { id: 'debug-cutin', action: () => this.debugCutin() },
            { id: 'debug-clear', action: () => this.debugClear() }
        ];
        
        debugButtons.forEach(({ id, action }) => {
            const button = document.getElementById(id);
            if (button) {
                this.addEventListenerWithTracking(button, 'click', action);
            }
        });
        
        // 連鎖パターン設置ボタン
        this.addEventListenerWithTracking(document.getElementById('debug-pattern-2'), 'click', () => this.debugSetChainPattern(2));
        this.addEventListenerWithTracking(document.getElementById('debug-pattern-3'), 'click', () => this.debugSetChainPattern(3));
        this.addEventListenerWithTracking(document.getElementById('debug-pattern-4'), 'click', () => this.debugSetChainPattern(4));
        this.addEventListenerWithTracking(document.getElementById('debug-pattern-5'), 'click', () => this.debugSetChainPattern(5));
        this.addEventListenerWithTracking(document.getElementById('debug-pattern-7'), 'click', () => this.debugSetChainPattern(7));
        
        // 手動配置モード関連ボタン
        this.addEventListenerWithTracking(document.getElementById('debug-manual-mode'), 'click', () => this.toggleManualPlaceMode());
        this.addEventListenerWithTracking(document.getElementById('debug-exit-manual'), 'click', () => this.exitManualPlaceMode());
        
        // 新機能デバッグボタン
        this.addEventListenerWithTracking(document.getElementById('debug-naochan-time'), 'click', () => this.debugNaochanTime());
        this.addEventListenerWithTracking(document.getElementById('debug-ogu-combo'), 'click', () => this.debugOguCombo());
        this.addEventListenerWithTracking(document.getElementById('debug-nao-combo'), 'click', () => this.debugNaoCombo());
        this.addEventListenerWithTracking(document.getElementById('debug-saikyo-combo'), 'click', () => this.debugSaikyoCombo());
        
        // 色選択ボタン
        for (let i = 0; i <= 5; i++) {
            this.addEventListenerWithTracking(document.getElementById(`color-${i}`), 'click', () => this.selectColor(i));
        }
        
        // ゲームキャンバスのクリックイベント
        this.addEventListenerWithTracking(this.canvas, 'click', (e) => this.handleCanvasClick(e));
        
        // ランキング関連ボタン
        this.addEventListenerWithTracking(document.getElementById('refresh-ranking'), 'click', () => this.loadRanking());
        this.addEventListenerWithTracking(document.getElementById('submit-score'), 'click', () => this.submitScore());
        
        // コメント機能ボタン
        this.addEventListenerWithTracking(document.getElementById('send-comment'), 'click', () => this.sendComment());
        this.addEventListenerWithTracking(document.getElementById('comment-input'), 'keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation(); // イベントの伝播を停止
                this.sendComment();
            }
        });
        
        // Firebase接続テスト（開発用）
        this.testFirebaseConnection();
        
        // Firebase初期化後にコメント機能を開始
        this.initializeCommentSystem();
        
        // ユーザー操作でタイトルBGMを開始
        this.setupTitleBgmTrigger();
        
        // 音量コントロールのイベントリスナーを設定
        this.setupVolumeControls();
        
        // BGM選択機能を設定
        this.setupBgmSelector();
    }
    
    // BGM選択機能を設定
    setupBgmSelector() {
        const soloBgmSelect = document.getElementById('solo-bgm-select');
        if (soloBgmSelect) {
            soloBgmSelect.addEventListener('change', (e) => {
                this.selectedSoloBgm = e.target.value;
                console.log('🎵 ソロモードBGM変更:', this.selectedSoloBgm);
                
                // ゲーム中の場合はBGMを即座に切り替え
                if (this.gameRunning && this.currentBgm) {
                    this.switchSoloBgm();
                }
            });
        }
    }
    
    // ソロモードBGMを動的に切り替え
    switchSoloBgm() {
        // 現在のBGMを停止
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }
        
        // カスタムBGM用のAudio要素を作成または更新
        if (this.customBgmAudio) {
            this.customBgmAudio.pause();
            this.customBgmAudio = null;
        }
        
        // 選択されたBGMに基づいてAudio要素を設定
        if (this.selectedSoloBgm === 'ぷよぷよっと始まる毎日.mp3') {
            this.currentBgm = this.bgm;
        } else if (this.selectedSoloBgm === '2.mp3') {
            this.currentBgm = this.bgm2;
        } else {
            // カスタムBGM用のAudio要素を作成
            this.customBgmAudio = new Audio(`music/${this.selectedSoloBgm}`);
            this.customBgmAudio.loop = true;
            this.customBgmAudio.volume = this.bgmVolume;
            this.currentBgm = this.customBgmAudio;
        }
        
        // 新しいBGMを再生
        if (this.currentBgm) {
            this.currentBgm.play().catch(e => {
                console.log('BGM切り替え再生エラー:', e);
            });
            console.log('🎵 BGM切り替え完了:', this.selectedSoloBgm);
        }
    }
    
    // 選択されたソロモードBGMを開始
    startSelectedSoloBgm() {
        console.log('🎵 ソロモードBGM開始処理 - 選択されたBGM:', this.selectedSoloBgm);
        
        // すべてのオーディオを停止
        this.stopAllAudio();
        
        // 既存のBGMを停止
        if (this.currentBgm) {
            console.log('🔇 既存BGMを停止');
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }
        if (this.customBgmAudio) {
            console.log('🔇 カスタムBGMを停止');
            this.customBgmAudio.pause();
            this.customBgmAudio = null;
        }
        
        // BGM要素の再初期化
        this.bgm = document.getElementById('game-bgm');
        this.bgm2 = document.getElementById('game-bgm-2');
        this.naochanBgm = document.getElementById('naochan-bgm');
        
        // 選択されたBGMに基づいてAudio要素を設定
        if (this.selectedSoloBgm === 'ぷよぷよっと始まる毎日.mp3') {
            console.log('🎵 メインBGMを選択');
            this.currentBgm = this.bgm;
        } else if (this.selectedSoloBgm === '2.mp3') {
            console.log('🎵 BGM2を選択');
            this.currentBgm = this.bgm2;
        } else {
            console.log('🎵 カスタムBGMを作成:', this.selectedSoloBgm);
            // カスタムBGM用のAudio要素を作成
            this.customBgmAudio = new Audio(`music/${this.selectedSoloBgm}`);
            this.customBgmAudio.loop = true;
            this.customBgmAudio.volume = this.bgmVolume;
            this.currentBgm = this.customBgmAudio;
        }
        
        // BGM要素の存在確認と音量設定
        if (this.currentBgm) {
            console.log('🎵 BGM要素が見つかりました:', this.currentBgm.id || 'custom');
            this.currentBgm.volume = this.bgmVolume;
            this.currentBgm.loop = true;
            
            // BGMを再生
            this.currentBgm.play().then(() => {
                console.log('✅ BGM再生成功:', this.selectedSoloBgm);
            }).catch(e => {
                console.log('⚠️ BGM auto-play blocked or failed:', e.message);
                // ユーザー操作待ちでBGMを開始するためのハンドラーを設定
                this.setupBgmUserInteractionTrigger();
            });
        } else {
            console.error('❌ BGM要素が見つかりません');
        }
    }
    
    // ================================================
    // 🔊 音量管理メソッド群
    // ================================================
    updateBgmVolume() {
        if (this.titleBgm) this.titleBgm.volume = this.bgmVolume;
        if (this.bgm) this.bgm.volume = this.bgmVolume;
        if (this.bgm2) this.bgm2.volume = this.bgmVolume;
        if (this.naochanBgm) this.naochanBgm.volume = this.bgmVolume;
        if (this.customBgmAudio) this.customBgmAudio.volume = this.bgmVolume;
    }
    
    // SE音量を更新
    updateSeVolume() {
        const seElements = [
            this.gameStartSE,
            this.chain2SE,
            this.chain3SE,
            this.chain4SE,
            this.moveSE,
            this.rotateSE,
            this.clearSE,
            this.naochanTimeSE
        ];
        
        seElements.forEach(se => {
            if (se) {
                se.volume = this.seVolume;
            }
        });
        
        // GOD動画の音量も設定
        if (this.god1CutinVideo) {
            this.god1CutinVideo.volume = this.seVolume;
        }
        if (this.god2CutinVideo) {
            this.god2CutinVideo.volume = this.seVolume;
        }
        if (this.godCutinVideo) {
            this.godCutinVideo.volume = this.seVolume;
        }
        
        console.log(`🔊 SE音量を ${Math.round(this.seVolume * 100)}% に設定しました`);
    }
    
    // 音量コントロールのイベントリスナーを設定
    setupVolumeControls() {
        const bgmSlider = document.getElementById('bgm-volume');
        const seSlider = document.getElementById('se-volume');
        const bgmDisplay = document.getElementById('bgm-volume-display');
        const seDisplay = document.getElementById('se-volume-display');
        
        if (bgmSlider && bgmDisplay) {
            bgmSlider.addEventListener('input', (e) => {
                this.bgmVolume = e.target.value / 100;
                bgmDisplay.textContent = `${e.target.value}%`;
                this.updateBgmVolume();
            });
        }
        
        if (seSlider && seDisplay) {
            seSlider.addEventListener('input', (e) => {
                this.seVolume = e.target.value / 100;
                seDisplay.textContent = `${e.target.value}%`;
                this.updateSeVolume();
            });
        }
    }
    
    // すべてのBGMを停止
    stopAllBgm() {
        const bgmElements = [
            'title-bgm', 'game-bgm', 'game-bgm-2', 'naochan-bgm', 'battle-bgm'
        ];
        
        bgmElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.pause();
                element.currentTime = 0;
            }
        });
    }
    
    // すべてのBGMとSEを停止
    stopAllAudio() {
        // すべてのBGMを停止
        this.stopAllBgm();
        
        // すべてのSEを停止
        const allAudio = document.querySelectorAll('audio');
        allAudio.forEach(audio => {
            if (audio.id.startsWith('se-')) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
    
    startTitleBgm() {
        this.stopAllAudio();
        if (this.titleBgm) {
            this.titleBgm.currentTime = 0;
            this.titleBgm.play().catch(e => {
                console.log('タイトルBGM再生に失敗:', e.message);
            });
        }
    }
    
    stopTitleBgm() {
        console.log('🔇 タイトルBGMを停止');
        if (this.titleBgm) {
            this.titleBgm.pause();
            this.titleBgm.currentTime = 0;
        }
    }
    
    // BGM用のユーザー操作トリガーを設定
    setupBgmUserInteractionTrigger() {
        console.log('🎵 BGM用ユーザー操作トリガーを設定');
        
        const startBgmOnInteraction = () => {
            if (this.currentBgm && this.currentBgm.paused) {
                console.log('🎵 ユーザー操作でBGMを開始');
                this.currentBgm.play().then(() => {
                    console.log('✅ BGM再生成功');
                }).catch(e => {
                    console.log('❌ BGM再生失敗:', e.message);
                });
                
                // イベントリスナーを削除（一度だけ実行）
                document.removeEventListener('click', startBgmOnInteraction);
                document.removeEventListener('keydown', startBgmOnInteraction);
                document.removeEventListener('touchstart', startBgmOnInteraction);
            }
        };
        
        // ユーザー操作をリスン
        document.addEventListener('click', startBgmOnInteraction, { once: true });
        document.addEventListener('keydown', startBgmOnInteraction, { once: true });
        document.addEventListener('touchstart', startBgmOnInteraction, { once: true });
    }
    
    setupTitleBgmTrigger() {
        // ユーザーの最初の操作でタイトルBGMを開始
        const startTitleMusic = () => {
            console.log('ユーザー操作検出 - タイトルBGM開始');
            this.startTitleBgm();
            // イベントリスナーを削除（一度だけ実行）
            document.removeEventListener('click', startTitleMusic);
            document.removeEventListener('keydown', startTitleMusic);
            document.removeEventListener('touchstart', startTitleMusic);
        };
        
        // 様々なユーザー操作をリスン
        document.addEventListener('click', startTitleMusic, { once: true });
        document.addEventListener('keydown', startTitleMusic, { once: true });
        document.addEventListener('touchstart', startTitleMusic, { once: true });
        
        console.log('タイトルBGMトリガー設定完了');
    }
    
    playSE(seElement, seName) {
        if (seElement) {
            seElement.currentTime = 0; // 再生位置をリセット
            seElement.volume = this.seVolume; // 現在のSE音量を設定
            seElement.play().catch(e => {
                console.log(`${seName} SE再生に失敗:`, e.message);
            });
            console.log(`🔊 ${seName} SE再生 (音量: ${Math.round(this.seVolume * 100)}%)`);
        } else {
            console.log(`❌ ${seName} SE要素が見つかりません`);
        }
    }
    
    async initializeCommentSystem() {
        console.log('🎬 コメントシステム初期化開始');
        
        // Firebase初期化エラーチェック
        if (window.firebaseInitError) {
            console.error('❌ Firebase初期化エラーが検出されました:', window.firebaseInitError);
            const commentList = document.getElementById('comment-list');
            if (commentList) {
                commentList.innerHTML = '<div class="loading error">Firebase初期化エラー<br><small>設定を確認してください</small></div>';
            }
            return;
        }
        
        // Firebase初期化の完了を待つ（改善版）
        let retries = 0;
        const maxRetries = 40; // 20秒間待機（増加）
        const retryInterval = 500; // 500ms間隔
        
        console.log('🔄 Firebase初期化確認開始...');
        
        // より確実にFirebase初期化を待つ
        while (retries < maxRetries) {
            // 複数の条件をチェック
            const firebaseReady = window.firebase && typeof window.firebase.initializeApp === 'function';
            const dbReady = window.db && typeof window.db.collection === 'function';
            const configReady = typeof window.firebaseConfig !== 'undefined';
            
            if (firebaseReady && dbReady) {
                console.log('✅ Firebase初期化確認完了');
                
                // 追加の接続テスト
                try {
                    // 簡単な接続テストを実行
                    const testResult = await Promise.race([
                        this.testFirebaseConnection(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('接続テストタイムアウト')), 3000)
                        )
                    ]);
                    console.log('✅ Firebase接続テスト成功');
                    break;
                } catch (testError) {
                    console.warn('⚠️ Firebase接続テスト失敗、リトライ中...', testError);
                }
            }
            
            // より詳細なログ
            console.log(`⏳ Firebase初期化待機中... (${retries + 1}/${maxRetries})`, {
                firebase: firebaseReady,
                db: dbReady,
                config: configReady
            });
            
            await this.sleep(retryInterval);
            retries++;
        }
        
        if (retries >= maxRetries) {
            console.error('❌ Firebase初期化タイムアウト');
            const commentList = document.getElementById('comment-list');
            if (commentList) {
                commentList.innerHTML = '<div class="loading error">Firebase接続タイムアウト<br><small>ネットワーク接続またはFirebase設定を確認してください</small></div>';
            }
            
            // オフラインモードに切り替え
            console.log('📱 オフラインモードで継続...');
            return;
        }
        
        // コメント機能を開始
        console.log('🚀 コメント機能開始');
        
        try {
            this.startCommentListener();
            await this.loadCommentHistory();
            console.log('✅ コメントシステム初期化完了');
        } catch (error) {
            console.error('❌ コメントシステム初期化エラー:', error);
            const commentList = document.getElementById('comment-list');
            if (commentList) {
                commentList.innerHTML = '<div class="loading error">コメントシステムエラー<br><small>再読み込みしてください</small></div>';
            }
        }
    }
    
    handleKeyPress(e) {
        console.log('🎮 Key pressed:', e.key, 'Game running:', this.gameRunning, 'Mode:', window.gameModeManager?.currentMode, 'Active element:', document.activeElement?.id || 'none');
        
        // 隠しコマンドの処理（どの状態でも有効）
        this.handleSecretCommand(e.key);
        
        // コメント入力中はその他のゲーム操作を無効にする
        const commentInput = document.getElementById('comment-input');
        if (document.activeElement === commentInput) {
            return;
        }
        
        // Escapeキーでポーズメニュー表示
        if (e.key === 'Escape') {
            console.log('🔑 Escape key pressed');
            e.preventDefault();
            e.stopPropagation();
            
            const currentMode = window.gameModeManager?.currentMode;
            console.log('🎮 Current mode:', currentMode, 'Game running:', this.gameRunning, 'Game paused:', this.gamePaused, 'Game started before:', this.gameHasStartedBefore);
            
            // ソロモードでゲームが開始されている場合
            if (currentMode === 'solo' && this.gameHasStartedBefore && !this.gamePaused) {
                console.log('⏸️ Conditions met, showing pause menu');
                // ゲームが動いていない場合は一時的に動かしてからポーズ
                if (!this.gameRunning) {
                    this.gameRunning = true;
                }
                this.showPauseMenu();
                return;
            } else if (currentMode === 'solo' && this.gameHasStartedBefore && this.gamePaused) {
                console.log('▶️ Game already paused, resuming');
                this.hidePauseMenu();
                return;
            } else {
                console.log('⚠️ Conditions not met for pause menu - mode:', currentMode, 'started:', this.gameHasStartedBefore, 'paused:', this.gamePaused);
                // タイトルに戻る処理（既存の処理を続行）
                if (window.gameModeManager && window.gameModeManager.currentMode !== 'title') {
                    // ゲームを停止
                    if (this.gameRunning) {
                        this.gameRunning = false;
                    }
                    
                    // 全BGMを停止
                    this.stopAllAudio();
                    
                    // タイトルBGMを再生
                    this.playTitleBgm();
                    
                    // タイトル画面に戻る
                    window.gameModeManager.switchToMode('title');
                }
                return;
            }
        }
        
        // Enter キーの処理（一時停止機能削除済み）
        if (e.key === 'Enter') {
            // ゲームモード管理システムが存在しない場合は処理しない
            if (!window.gameModeManager) {
                console.log('⚠️ GameModeManager not found');
                return;
            }
            
            const currentMode = window.gameModeManager.currentMode;
            console.log('🎮 Current mode for Enter key processing:', currentMode);
            
            // ソロモード中はEnterキーの一時停止機能は無効
            if (currentMode === 'solo') {
                console.log('🎮 Solo mode - Enter key pause/resume disabled');
                return;
            }
            
            // その他のモードではGameModeManagerに処理を委譲
            console.log('🔄 Delegating Enter key to GameModeManager');
            return;
        }
        
        // 重複Escape処理削除（上で統一処理済み）
        
        // ゲームが動いていない場合は移動操作を無効にする
        if (!this.gameRunning) {
            console.log('🚫 ゲーム停止中につき操作を無視:', e.key);
            return;
        }
        
        // 切り離されたピースは操作不可
        if (this.isSeparatedPiece) {
            return;
        }
        
        // ゲームが一時停止中の場合はピース操作を無効にする
        if (!this.gameRunning) {
            console.log('🚫 一時停止中につきピース操作を無視:', e.key);
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case 'a':
                this.movePiece(-1, 0);
                break;
            case 'd':
                this.movePiece(1, 0);
                break;
            case 's':
                this.movePiece(0, 1);
                break;
            case ' ':
                e.preventDefault();
                this.rotatePiece();
                break;
        }
    }
    
    // 隠しコマンド処理
    handleSecretCommand(key) {
        // キーがundefinedの場合は処理しない
        if (!key || typeof key !== 'string') {
            return;
        }
        
        // 隠しコマンド: "debug" でデバッグモード表示/非表示を切り替え
        this.secretKeySequence.push(key.toLowerCase());
        
        // 最新の5文字のみ保持
        if (this.secretKeySequence.length > 5) {
            this.secretKeySequence.shift();
        }
        
        // "debug" というシーケンスが入力されたかチェック
        if (this.secretKeySequence.join('').includes('debug')) {
            this.toggleDebugMode();
            this.secretKeySequence = []; // リセット
        }
    }
    
    // デバッグモードの表示/非表示を切り替え
    toggleDebugMode() {
        const debugControls = document.querySelector('.debug-controls');
        if (debugControls) {
            this.debugModeVisible = !this.debugModeVisible;
            debugControls.style.display = this.debugModeVisible ? 'block' : 'none';
            
            console.log(`🔧 デバッグモード: ${this.debugModeVisible ? '表示' : '非表示'}`);
            
            // 一時的なメッセージ表示
            const message = document.createElement('div');
            message.textContent = `デバッグモード: ${this.debugModeVisible ? 'ON' : 'OFF'}`;
            message.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 1000;
                font-family: monospace;
            `;
            document.body.appendChild(message);
            
            setTimeout(() => {
                document.body.removeChild(message);
            }, 2000);
        }
    }
    
    startGame() {
        // 重複起動を防ぐ
        if (this.gameRunning) {
            console.log('⚠️ ゲームは既に実行中です');
            return;
        }
        
        // BattleGameインスタンスがある場合は停止
        if (window.battleGame && window.battleGame.gameRunning) {
            console.log('🛑 バトルゲームを停止してソロゲームを開始');
            window.battleGame.gameRunning = false;
            window.battleGame.gameLoopRunning = false;
        }
        
        console.log('Starting game...');
        
        // ゲームスタートSEを再生（初回起動時のみ）
        if (!this.gameHasStartedBefore) {
            this.playSE(this.seGameStart, 'ゲームスタート');
            this.gameHasStartedBefore = true;
        }
        
        this.gameRunning = true;
        this.timeStart = Date.now();
        this.lastFallTime = Date.now();
        this.updateFallSpeed();
        
        // なおちゃんがゲーム開始を応援
        setTimeout(() => {
            this.sendContextualNaochanChat('game_start');
        }, 2000);
        
        // ピースが存在しない場合は新しく生成
        if (!this.currentPiece) {
            console.log('No current piece, spawning new one...');
            this.generateNextPiece();
            this.spawnNewPiece();
        }
        
        // デバッグ：現在のピース状態を確認
        console.log('Current piece after start:', this.currentPiece);
        console.log('Next piece:', this.nextPiece);
        
        this.gameLoop();
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('start-screen').classList.add('hidden');
        
        // タイトルBGMを停止
        this.stopTitleBgm();
        
        // 選択されたソロモードBGMを開始
        this.startSelectedSoloBgm();
        console.log('🎵 選択されたソロモードBGM開始:', this.selectedSoloBgm);
    }
    
    togglePause() {
        console.log('🔄 togglePause called - current gameRunning:', this.gameRunning);
        
        // 他のゲームインスタンスが動作中の場合は停止
        if (window.battleGame && window.battleGame !== this && window.battleGame.gameRunning) {
            console.log('🛑 別のバトルゲームインスタンスを停止');
            window.battleGame.gameRunning = false;
        }
        
        this.gameRunning = !this.gameRunning;
        console.log('🔄 togglePause - new gameRunning:', this.gameRunning);
        
        if (this.gameRunning) {
            console.log('▶️ ゲーム再開 - 正確にゲームループを開始');
            
            // ゲームが一度でも開始されたことを記録
            this.gameHasStartedBefore = true;
            
            // タイマーをリセット
            this.lastFallTime = Date.now();
            
            // ゲームループを明示的に開始
            this.gameLoop();
            
            // ポーズ解除時に現在のBGMを再開
            if (this.currentBgm) {
                this.currentBgm.play().catch(e => {
                    console.log('BGM resume failed:', e);
                });
            }
            
            console.log('✅ ゲーム再開完了 - gameRunning:', this.gameRunning);
        } else {
            console.log('⏸️ ゲーム一時停止 - すべてのゲームロジックを停止');
            
            // ポーズ時に現在のBGMを一時停止
            if (this.currentBgm) {
                this.currentBgm.pause();
            }
            
            console.log('✅ ゲーム一時停止完了 - gameRunning:', this.gameRunning);
        }
    }
    
    updateFallSpeed() {
        const speeds = {
            easy: 1500,
            normal: 1000,
            hard: 500
        };
        this.fallSpeed = speeds[this.difficulty];
    }
    
    updateVolume(value) {
        const volume = value / 100;
        
        // BGM要素の再初期化と音量設定
        this.bgm = document.getElementById('game-bgm');
        this.bgm2 = document.getElementById('game-bgm-2');
        this.naochanBgm = document.getElementById('naochan-bgm');
        this.titleBgm = document.getElementById('title-bgm');
        
        // BGM音量を更新
        this.bgmVolume = volume;
        
        if (this.bgm) this.bgm.volume = volume;
        if (this.bgm2) this.bgm2.volume = volume;
        if (this.naochanBgm) this.naochanBgm.volume = volume;
        if (this.titleBgm) this.titleBgm.volume = volume * 0.8; // タイトルBGMは少し静か目
        if (this.customBgmAudio) this.customBgmAudio.volume = volume;
        if (this.currentBgm) this.currentBgm.volume = volume;
        
        // SE音量も調整
        this.seVolume = volume * 0.7; // SEのベース音量
        
        if (this.seGameStart) this.seGameStart.volume = volume * 0.7;
        if (this.seChain2) this.seChain2.volume = volume * 0.8;
        if (this.seChain3) this.seChain3.volume = volume * 0.8;
        if (this.seChain4) this.seChain4.volume = volume * 0.8;
        if (this.seMove) this.seMove.volume = volume * 0.4;
        if (this.seRotate) this.seRotate.volume = volume * 0.5;
        if (this.seClear) this.seClear.volume = volume * 0.6;
        
        const volumeDisplay = document.getElementById('volume-display');
        if (volumeDisplay) {
            volumeDisplay.textContent = `${value}%`;
        }
        
        console.log(`🔊 音量調整: ${value}% (BGM: ${this.bgmVolume}, SE: ${this.seVolume})`);
    }
    
    generateNextPiece() {
        // 常に5色すべて使用
        const color1 = Math.floor(Math.random() * 5) + 1;
        const color2 = Math.floor(Math.random() * 5) + 1;
        
        // 現在のnextPieceを次のnextPieceに移動
        if (this.nextPiece) {
            this.nextPiece2 = { ...this.nextPiece };
        }
        
        this.nextPiece = {
            colors: [color1, color2],
            positions: [{x: 0, y: 0}, {x: 0, y: 1}]
        };
        
        // 2個目のピースも生成（なおコンボ時の表示用）
        if (!this.nextPiece2) {
            const color3 = Math.floor(Math.random() * 5) + 1;
            const color4 = Math.floor(Math.random() * 5) + 1;
            this.nextPiece2 = {
                colors: [color3, color4],
                positions: [{x: 0, y: 0}, {x: 0, y: 1}]
            };
        }
    }
    
    spawnNewPiece() {
        if (this.nextPiece) {
            console.log('🟢 spawnNewPiece: NEW PIECE COLORS =', [...this.nextPiece.colors]);
            this.currentPiece = {
                x: Math.floor(this.BOARD_WIDTH / 2) - 1,
                y: -1,
                colors: [...this.nextPiece.colors],
                positions: this.nextPiece.positions.map(pos => ({...pos}))
            };
        }
        this.generateNextPiece();
        this.isSeparatedPiece = false; // 新しいピースは操作可能
        
        if (this.isCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.positions)) {
            this.gameOver();
        }
    }
    
    // ================================================
    // 🎮 ゲームコア機能
    // ================================================
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (!this.isCollision(newX, newY, this.currentPiece.positions)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.render();
            
            // 横移動時のみSEを再生（頻繁になりすぎないように）
            if (dx !== 0) {
                this.playSE(this.seMove, 'ブロック移動');
            }
        } else if (dy > 0) {
            // 下方向への移動で衝突した場合、ピースを配置
            this.placePiece();
        }
        // 左右への移動で衝突した場合は、単に移動しない
    }
    
    handlePartialLanding() {
        const landablePieces = [];
        const floatingPieces = [];
        
        // 各ピースが着地できるかチェック
        for (let i = 0; i < this.currentPiece.positions.length; i++) {
            const pos = this.currentPiece.positions[i];
            const boardX = this.currentPiece.x + pos.x;
            const boardY = this.currentPiece.y + pos.y + 1; // 1つ下の位置
            
            // 着地できるかチェック（底に到達 または 他のブロックに接触）
            const canLand = boardY >= this.BOARD_HEIGHT || 
                           (boardY >= 0 && this.board[boardY][boardX] !== 0);
            
            if (canLand) {
                landablePieces.push(i);
            } else {
                floatingPieces.push(i);
            }
        }
        
        // 一部のピースが着地可能な場合
        if (landablePieces.length > 0 && floatingPieces.length > 0) {
            // 着地可能なピースを配置
            for (let i of landablePieces) {
                const pos = this.currentPiece.positions[i];
                const boardX = this.currentPiece.x + pos.x;
                const boardY = this.currentPiece.y + pos.y;
                
                if (boardY >= 0 && boardY < this.BOARD_HEIGHT && 
                    boardX >= 0 && boardX < this.BOARD_WIDTH) {
                    this.board[boardY][boardX] = this.currentPiece.colors[i];
                    // 着地アニメーション開始
                    this.startLandingAnimation(boardX, boardY);
                }
            }
            
            // 浮いているピースで新しいcurrentPieceを作成
            const newColors = floatingPieces.map(i => this.currentPiece.colors[i]);
            const newPositions = floatingPieces.map(i => ({...this.currentPiece.positions[i]}));
            
            // 新しいポジション配列を正規化（最初のピースを基準にする）
            if (newPositions.length > 0) {
                const basePos = newPositions[0];
                for (let i = 0; i < newPositions.length; i++) {
                    newPositions[i].x -= basePos.x;
                    newPositions[i].y -= basePos.y;
                }
            }
            
            this.currentPiece = {
                x: this.currentPiece.x + (floatingPieces.length > 0 ? this.currentPiece.positions[floatingPieces[0]].x : 0),
                y: this.currentPiece.y + (floatingPieces.length > 0 ? this.currentPiece.positions[floatingPieces[0]].y : 0),
                colors: newColors,
                positions: newPositions
            };
            
            // 切り離されたピースとしてマーク（操作不可、高速落下）
            this.isSeparatedPiece = true;
            
            // 着地したピースの重力適用と表示更新
            this.applyGravity();
            this.render();
            
            // 連鎖チェックは削除（placePieceで一括処理するため）
            // 部分着地時は連鎖チェックしない
            
            // 残ったピースは高速で直下
            this.lastFallTime = Date.now() - this.fallSpeed;
        } else {
            // 全てのピースが同時に着地する場合
            this.placePiece();
        }
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotatedPositions = this.currentPiece.positions.map(pos => ({
            x: -pos.y,
            y: pos.x
        }));
        
        // 基本位置で回転試行
        if (!this.isCollision(this.currentPiece.x, this.currentPiece.y, rotatedPositions)) {
            this.currentPiece.positions = rotatedPositions;
            this.render();
            this.playSE(this.seRotate, 'ブロック回転');
            return;
        }
        
        // 左に1マス移動して回転試行
        if (!this.isCollision(this.currentPiece.x - 1, this.currentPiece.y, rotatedPositions)) {
            this.currentPiece.x -= 1;
            this.currentPiece.positions = rotatedPositions;
            this.render();
            this.playSE(this.seRotate, 'ブロック回転');
            return;
        }
        
        // 右に1マス移動して回転試行
        if (!this.isCollision(this.currentPiece.x + 1, this.currentPiece.y, rotatedPositions)) {
            this.currentPiece.x += 1;
            this.currentPiece.positions = rotatedPositions;
            this.render();
            this.playSE(this.seRotate, 'ブロック回転');
            return;
        }
    }
    
    isCollision(x, y, positions) {
        for (let pos of positions) {
            const boardX = x + pos.x;
            const boardY = y + pos.y;
            
            // 左右の境界チェック
            if (boardX < 0 || boardX >= this.BOARD_WIDTH) {
                return true;
            }
            
            // 下の境界チェック
            if (boardY >= this.BOARD_HEIGHT) {
                return true;
            }
            
            // 既存のブロックとの衝突チェック
            if (boardY >= 0 && this.board[boardY][boardX] !== 0) {
                return true;
            }
        }
        return false;
    }
    
    async placePiece() {
        // 既に配置処理中の場合は重複実行を防ぐ
        if (this.isPlacingPiece) {
            console.log('🚫 placePiece already in progress, skipping');
            return;
        }
        
        this.isPlacingPiece = true; // ピース配置開始
        console.log('🔴 placePiece started');
        
        try {
        
        // 残っているピースをすべて配置
        for (let i = 0; i < this.currentPiece.positions.length; i++) {
            const pos = this.currentPiece.positions[i];
            const boardX = this.currentPiece.x + pos.x;
            const boardY = this.currentPiece.y + pos.y;
            
            // 境界内でのみピースを配置
            if (boardY >= 0 && boardY < this.BOARD_HEIGHT && 
                boardX >= 0 && boardX < this.BOARD_WIDTH) {
                this.board[boardY][boardX] = this.currentPiece.colors[i];
                // 着地アニメーション開始
                this.startLandingAnimation(boardX, boardY);
            }
        }
        
        // 重力を適用してから連鎖チェック
        this.applyGravity();
        this.render();
        await this.sleep(100); // 少し待機
        
        await this.checkAndClearMatches();
        this.spawnNewPiece();
        
        console.log('🔴 placePiece completed');
        
        } catch (error) {
            console.error('❌ ピース配置中にエラーが発生しました:', error);
            console.error('Error stack:', error.stack);
            // エラーが発生した場合でも、盤面を安全な状態に戻す
            this.render();
        } finally {
            // ピース配置完了フラグをリセット（エラーの有無に関わらず実行）
            this.isPlacingPiece = false;
            console.log('🔒 ピース配置フラグをリセットしました');
        }
    }
    
    async checkAndClearMatches() {
        // 既に連鎖処理中の場合は処理をスキップ
        if (this.isInChainSequence) {
            console.log('⚠️ 連鎖処理中につき、新しい連鎖検出をスキップ');
            return;
        }
        
        this.isInChainSequence = true;
        let totalCleared = 0;
        let chainCount = 0;
        
        try {
        
        console.log('🔍 === チェーン検出開始 ===');
        console.trace('checkAndClearMatches 呼び出しスタック:');
        this.debugPrintBoard('開始時のボード状態');
        
        while (true) {
            // 同時に消すべき全てのグループを検出
            const allMatches = this.findAllMatches();
            if (allMatches.length === 0) {
                console.log('❌ マッチするグループが見つかりません。連鎖終了。');
                break;
            }
            
            chainCount++;
            console.log(`🔗 === Chain ${chainCount} 開始 ===`);
            console.log(`🎯 検出されたグループ数: ${allMatches.length}`);
            
            // 各グループの詳細をログ出力
            allMatches.forEach((group, index) => {
                const color = this.board[group[0].y][group[0].x];
                console.log(`  グループ${index + 1}: 色${color}, ${group.length}個, 位置: ${group.map(p => `(${p.x},${p.y})`).join(', ')}`);
            });
            
            // おぐなおコンボチェック（削除前に実行）
            this.checkOgunaoCombo(allMatches);
            
            // 全てのマッチしたグループを同時に処理
            for (let group of allMatches) {
                totalCleared += group.length;
                this.createExplosionEffects(group);
                
                for (let {x, y} of group) {
                    // 境界チェックを追加して安全性を向上
                    if (y >= 0 && y < this.BOARD_HEIGHT && x >= 0 && x < this.BOARD_WIDTH) {
                        console.log(`🗑️ ブロック削除: (${x}, ${y}) color: ${this.board[y][x]}`);
                        this.board[y][x] = 0;
                    } else {
                        console.warn(`⚠️ 無効な座標でブロック削除を試行: (${x}, ${y})`);
                    }
                }
            }
            
            // 削除後の盤面検証
            this.validateBoardState();
            
            // ブロック消去SEを再生
            this.playSE(this.seClear, 'ブロック消去');
            
            console.log(`💥 ${allMatches.length}グループ、合計${allMatches.reduce((sum, group) => sum + group.length, 0)}個のブロックを消去`);
            this.debugPrintBoard('消去後のボード状態');
            
            // 2連鎖のSE再生（ブロックが消えたタイミング）
            if (chainCount === 2) {
                this.playSE(this.seChain2, '2連鎖');
            }
            
            // 重力を適用
            this.applyGravity();
            this.render();
            console.log('⬇️ 重力適用完了');
            this.debugPrintBoard('重力適用後のボード状態');
            
            // 連鎖数を更新して表示
            this.chain = Math.max(this.chain, chainCount);
            this.updateDisplay();
            
            // エフェクトを表示（ゲームロジックをブロックしない）
            this.showChainEffect(chainCount);
            
            // 3連鎖以上の場合はカットインを表示（ただし待機する）
            if (chainCount >= 3) {
                console.log(`🎬 Showing cutin for chain ${chainCount}`);
                
                // 3連鎖以降のSE再生（カットイン表示タイミング）
                if (chainCount === 3) {
                    this.playSE(this.seChain3, '3連鎖');
                } else if (chainCount === 4) {
                    this.playSE(this.seChain4, '4連鎖');
                } else if (chainCount >= 5) {
                    // 5連鎖以降も4連鎖のSEを使用
                    this.playSE(this.seChain4, `${chainCount}連鎖`);
                }
                
                await this.showCutinEffectAsync(chainCount);
                await this.sleep(300); // カットイン後の短い待機
            } else {
                // 通常の連鎖間隔
                await this.sleep(400);
            }
            
            console.log(`✅ Chain ${chainCount} 完了、次の連鎖をチェック中...`);
        }
        
        if (chainCount > 0) {
            // なおちゃんタイムのスコア倍率を適用
            const scoreMultiplier = this.getNaochanTimeScoreMultiplier();
            const baseScore = totalCleared * 100 * chainCount * chainCount;
            const finalScore = baseScore * scoreMultiplier;
            
            this.score += finalScore;
            this.updateDisplay();
            this.checkSupportTriggers();
            
            // なおちゃんタイム発動チェック
            this.checkNaochanTimeActivation(chainCount);
            
            console.log(`🏆 === 連鎖シーケンス完了 ===`);
            console.log(`🔢 最終連鎖数: ${chainCount}`);
            console.log(`🧱 総消去ブロック数: ${totalCleared}`);
            console.log(`💰 基本スコア: ${baseScore}`);
            if (scoreMultiplier > 1) {
                console.log(`✨ なおちゃんタイム倍率: x${scoreMultiplier}`);
                console.log(`💰 最終スコア: ${finalScore}`);
            }
        }
        
        } catch (error) {
            console.error('❌ 連鎖処理中にエラーが発生しました:', error);
            console.error('Error stack:', error.stack);
            // エラーが発生した場合でも、盤面を安全な状態に戻す
            this.render();
        } finally {
            // 連鎖処理完了フラグをリセット（エラーの有無に関わらず実行）
            this.isInChainSequence = false;
            console.log('🔒 連鎖処理フラグをリセットしました');
        }
    }
    
    // ================================================
    // 🔧 デバッグ機能
    // ================================================
    debugPrintBoard(title) {
        console.log(`📋 ${title}:`);
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            const row = this.board[y].map(cell => cell === 0 ? '.' : cell).join(' ');
            console.log(`  ${y}: ${row}`);
        }
    }
    
    // 盤面の整合性を検証
    validateBoardState() {
        let invalidBlocks = 0;
        let totalBlocks = 0;
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                const cell = this.board[y][x];
                if (cell !== 0) {
                    totalBlocks++;
                    // ブロックの値が有効な範囲内かチェック
                    if (cell < 1 || cell > 5) {
                        invalidBlocks++;
                        console.warn(`⚠️ 無効なブロック値: (${x}, ${y}) = ${cell}`);
                        this.board[y][x] = 0; // 無効なブロックは削除
                    }
                }
            }
        }
        
        if (invalidBlocks > 0) {
            console.warn(`⚠️ ${invalidBlocks}個の無効なブロックを修正しました`);
            this.render(); // 修正後に再描画
        }
        
        console.log(`✅ 盤面検証完了: 総ブロック数 ${totalBlocks}, 修正数 ${invalidBlocks}`);
    }
    
    // 全ての4個以上接続されたグループを検出する関数
    findAllMatches() {
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        const matches = [];
        
        console.log('🔍 findAllMatches開始 - なおちゃんタイム:', this.naochanTimeActive);
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0 && !visited[y][x]) {
                    const group = this.findConnectedGroup(x, y, this.board[y][x], visited);
                    console.log(`位置(${x},${y}) 色${this.board[y][x]}: ${group.length}個のグループ`);
                    if (group.length >= 4) {
                        matches.push(group);
                        console.log(`✅ ${group.length}個のマッチグループを発見 - 色${this.board[y][x]}`);
                    }
                }
            }
        }
        
        console.log(`🎯 合計${matches.length}個のマッチグループ発見`);
        return matches;
    }
    
    findConnectedGroup(startX, startY, color, visited) {
        const group = [];
        const stack = [{x: startX, y: startY}];
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            
            if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT ||
                visited[y][x] || this.board[y][x] !== color) {
                continue;
            }
            
            visited[y][x] = true;
            group.push({x, y});
            
            stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
        }
        
        return group;
    }
    
    applyGravity() {
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            let writePos = this.BOARD_HEIGHT - 1;
            
            for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
                if (this.board[y][x] !== 0) {
                    this.board[writePos][x] = this.board[y][x];
                    if (writePos !== y) {
                        this.board[y][x] = 0;
                        // 落下したぷよにアニメーション効果を追加
                        this.startLandingAnimation(x, writePos);
                    }
                    writePos--;
                }
            }
        }
    }
    
    createExplosionEffects(positions) {
        positions.forEach(pos => {
            const effect = document.createElement('div');
            effect.className = 'explosion-effect';
            effect.style.left = (pos.x * this.CELL_SIZE + 20) + 'px';
            effect.style.top = (pos.y * this.CELL_SIZE + 20) + 'px';
            
            this.canvas.parentElement.appendChild(effect);
            
            setTimeout(() => {
                if (effect.parentElement) {
                    effect.parentElement.removeChild(effect);
                }
            }, 500);
        });
    }
    
    showChainEffect(chainCount) {
        const effect = document.createElement('div');
        effect.className = 'chain-effect';
        effect.textContent = `${chainCount} 連鎖!`;
        effect.style.left = '50%';
        effect.style.top = '50%';
        effect.style.transform = 'translate(-50%, -50%)';
        
        this.canvas.parentElement.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentElement) {
                effect.parentElement.removeChild(effect);
            }
        }, 1000);
    }
    
    showCutinEffect(chainCount) {
        console.log(`🎬 showCutinEffect called with chainCount: ${chainCount}`);
        console.log('📊 Image availability check:');
        console.log('- 3Chain image (nao7.png):', this.cutin3ChainImage?.complete, this.cutin3ChainImage?.src);
        console.log('- 5Chain image (5rensa.png):', this.cutin5ChainImage?.complete, this.cutin5ChainImage?.src);
        console.log('- Normal cutin (saginaoki.jpg):', this.cutinImage?.complete, this.cutinImage?.src);
        
        // 連鎖数に応じた専用画像を使用
        let cutinImageToUse;
        let imageName;
        
        if (chainCount === 3) {
            console.log('🔍 Checking 3Chain condition...');
            console.log('- this.cutin3ChainImage exists:', !!this.cutin3ChainImage);
            console.log('- this.cutin3ChainImage.complete:', this.cutin3ChainImage?.complete);
            console.log('- naturalWidth:', this.cutin3ChainImage?.naturalWidth);
            console.log('- naturalHeight:', this.cutin3ChainImage?.naturalHeight);
        }
        
        // 3連鎖の場合は必ずnao7.pngを使用（強制）
        if (chainCount === 3) {
            console.log('🎯 3連鎖検出 - nao7.pngを強制使用');
            if (this.cutin3ChainImage && this.cutin3ChainImage.complete && this.cutin3ChainImage.naturalWidth > 0) {
                console.log('✅ Using 3Chain cutin image: nao7.png');
                cutinImageToUse = this.cutin3ChainImage;
                imageName = 'nao7.png (3連鎖専用)';
            } else {
                console.log('❌ 3Chain画像が利用できません - デバッグ情報:');
                console.log('- exists:', !!this.cutin3ChainImage);
                console.log('- complete:', this.cutin3ChainImage?.complete);
                console.log('- naturalWidth:', this.cutin3ChainImage?.naturalWidth);
                console.log('- src:', this.cutin3ChainImage?.src);
                
                // フォールバック：通常のカットイン画像
                if (this.cutinImage && this.cutinImage.complete) {
                    console.log('⚠️ Fallback to normal cutin image for 3chain');
                    cutinImageToUse = this.cutinImage;
                    imageName = 'saginaoki.jpg (3連鎖フォールバック)';
                } else {
                    console.log('❌ No images available for 3chain');
                    return;
                }
            }
        } else if (chainCount === 5 && this.cutin5ChainImage && this.cutin5ChainImage.complete && this.cutin5ChainImage.naturalWidth > 0) {
            console.log('✅ Using 5Chain cutin image: 5rensa.png');
            cutinImageToUse = this.cutin5ChainImage;
            imageName = '5rensa.png (5連鎖専用)';
        } else if (this.cutinImage && this.cutinImage.complete) {
            console.log('⚠️ Using normal cutin image: saginaoki.jpg');
            cutinImageToUse = this.cutinImage;
            imageName = 'saginaoki.jpg (通常)';
        } else {
            console.log('❌ No cutin image available');
            return;
        }
        
        console.log(`🖼️ Selected image: ${imageName}`);
        
        // カットイン要素を作成
        const cutin = document.createElement('div');
        cutin.className = 'cutin-effect';
        
        // 画像要素を作成
        const img = document.createElement('img');
        img.src = cutinImageToUse.src;
        img.className = 'cutin-image';
        
        // テキスト要素を作成
        const text = document.createElement('div');
        text.className = 'cutin-text';
        
        // 連鎖数に応じて動画カットインを再生
        if (chainCount >= 7) {
            this.showGodCutinVideo(chainCount);
            return; // 動画再生のため、通常のカットインはスキップ
        } else if (chainCount === 6) {
            this.showGod2CutinVideo(chainCount);
            return; // 動画再生のため、通常のカットインはスキップ
        } else if (chainCount === 5) {
            this.showGod1CutinVideo(chainCount);
            return; // 動画再生のため、通常のカットインはスキップ
        }
        
        // 連鎖数に応じたメッセージ（4連鎖以下のみ）
        if (chainCount >= 4) {
            text.textContent = `${chainCount}連鎖！ やるやん！`;
        } else if (chainCount === 3) {
            text.textContent = `3連鎖！ いいね！`;
        } else {
            text.textContent = `${chainCount}連鎖！`;
        }
        
        cutin.appendChild(img);
        cutin.appendChild(text);
        
        // ゲーム領域に追加
        this.canvas.parentElement.appendChild(cutin);
        
        // アニメーション終了後に削除
        setTimeout(() => {
            if (cutin.parentElement) {
                cutin.parentElement.removeChild(cutin);
            }
        }, 2000);
    }
    
    // 5連鎖GOD1動画カットインを表示（同期版）
    showGod1CutinVideo(chainCount) {
        console.log(`🎬 GOD1動画カットイン開始: ${chainCount}連鎖`);
        
        if (!this.god1CutinVideo) {
            console.error('❌ GOD1動画要素が見つかりません');
            return;
        }
        
        // 動画を最初から再生
        this.god1CutinVideo.currentTime = 0;
        this.god1CutinVideo.style.display = 'block';
        
        // 動画を再生
        this.god1CutinVideo.play().then(() => {
            console.log('✅ GOD1動画再生開始');
        }).catch(e => {
            console.error('❌ GOD1動画再生に失敗:', e);
        });
        
        // 動画終了時に非表示にする
        const hideVideo = () => {
            this.god1CutinVideo.style.display = 'none';
            this.god1CutinVideo.removeEventListener('ended', hideVideo);
            console.log('✅ GOD1動画カットイン終了');
        };
        
        this.god1CutinVideo.addEventListener('ended', hideVideo);
        
        // 安全のため、5秒後に強制終了
        setTimeout(() => {
            if (this.god1CutinVideo.style.display !== 'none') {
                this.god1CutinVideo.style.display = 'none';
                this.god1CutinVideo.pause();
                this.god1CutinVideo.removeEventListener('ended', hideVideo);
                console.log('⚠️ GOD1動画カットイン強制終了（タイムアウト）');
            }
        }, 5000);
    }
    
    // 6連鎖GOD2動画カットインを表示（同期版）
    showGod2CutinVideo(chainCount) {
        console.log(`🎬 GOD2動画カットイン開始: ${chainCount}連鎖`);
        
        if (!this.god2CutinVideo) {
            console.error('❌ GOD2動画要素が見つかりません');
            return;
        }
        
        // 動画を最初から再生
        this.god2CutinVideo.currentTime = 0;
        this.god2CutinVideo.style.display = 'block';
        
        // 動画を再生
        this.god2CutinVideo.play().then(() => {
            console.log('✅ GOD2動画再生開始');
        }).catch(e => {
            console.error('❌ GOD2動画再生に失敗:', e);
        });
        
        // 動画終了時に非表示にする
        const hideVideo = () => {
            this.god2CutinVideo.style.display = 'none';
            this.god2CutinVideo.removeEventListener('ended', hideVideo);
            console.log('✅ GOD2動画カットイン終了');
        };
        
        this.god2CutinVideo.addEventListener('ended', hideVideo);
        
        // 安全のため、5秒後に強制終了
        setTimeout(() => {
            if (this.god2CutinVideo.style.display !== 'none') {
                this.god2CutinVideo.style.display = 'none';
                this.god2CutinVideo.pause();
                this.god2CutinVideo.removeEventListener('ended', hideVideo);
                console.log('⚠️ GOD2動画カットイン強制終了（タイムアウト）');
            }
        }, 5000);
    }
    
    // GOD動画カットインを表示（同期版）
    showGodCutinVideo(chainCount) {
        console.log(`🎬 GOD動画カットイン開始: ${chainCount}連鎖`);
        
        if (!this.godCutinVideo) {
            console.error('❌ GOD動画要素が見つかりません');
            return;
        }
        
        // 動画を最初から再生
        this.godCutinVideo.currentTime = 0;
        this.godCutinVideo.style.display = 'block';
        
        // 動画を再生
        this.godCutinVideo.play().then(() => {
            console.log('✅ GOD動画再生開始');
        }).catch(e => {
            console.error('❌ GOD動画再生に失敗:', e);
        });
        
        // 動画終了時に非表示にする
        const hideVideo = () => {
            this.godCutinVideo.style.display = 'none';
            this.godCutinVideo.removeEventListener('ended', hideVideo);
            console.log('✅ GOD動画カットイン終了');
        };
        
        this.godCutinVideo.addEventListener('ended', hideVideo);
        
        // 安全のため、5秒後に強制終了
        setTimeout(() => {
            if (this.godCutinVideo.style.display !== 'none') {
                this.godCutinVideo.style.display = 'none';
                this.godCutinVideo.pause();
                this.godCutinVideo.removeEventListener('ended', hideVideo);
                console.log('⚠️ GOD動画カットイン強制終了（タイムアウト）');
            }
        }, 5000);
    }
    
    // 5連鎖GOD1動画カットインを表示（非同期版）
    showGod1CutinVideoAsync(chainCount) {
        return new Promise((resolve) => {
            console.log(`🎬 GOD1動画カットイン開始（非同期）: ${chainCount}連鎖`);
            
            if (!this.god1CutinVideo) {
                console.error('❌ GOD1動画要素が見つかりません');
                resolve();
                return;
            }
            
            // 動画を最初から再生
            this.god1CutinVideo.currentTime = 0;
            this.god1CutinVideo.style.display = 'block';
            
            // 動画を再生
            this.god1CutinVideo.play().then(() => {
                console.log('✅ GOD1動画再生開始（非同期）');
            }).catch(e => {
                console.error('❌ GOD1動画再生に失敗:', e);
                resolve();
            });
            
            // 動画終了時に非表示にしてresolve
            const hideVideoAndResolve = () => {
                this.god1CutinVideo.style.display = 'none';
                this.god1CutinVideo.removeEventListener('ended', hideVideoAndResolve);
                console.log('✅ GOD1動画カットイン終了（非同期）');
                resolve();
            };
            
            this.god1CutinVideo.addEventListener('ended', hideVideoAndResolve);
            
            // 安全のため、5秒後に強制終了
            setTimeout(() => {
                if (this.god1CutinVideo.style.display !== 'none') {
                    this.god1CutinVideo.style.display = 'none';
                    this.god1CutinVideo.pause();
                    this.god1CutinVideo.removeEventListener('ended', hideVideoAndResolve);
                    console.log('⚠️ GOD1動画カットイン強制終了（タイムアウト・非同期）');
                    resolve();
                }
            }, 5000);
        });
    }
    
    // 6連鎖GOD2動画カットインを表示（非同期版）
    showGod2CutinVideoAsync(chainCount) {
        return new Promise((resolve) => {
            console.log(`🎬 GOD2動画カットイン開始（非同期）: ${chainCount}連鎖`);
            
            if (!this.god2CutinVideo) {
                console.error('❌ GOD2動画要素が見つかりません');
                resolve();
                return;
            }
            
            // 動画を最初から再生
            this.god2CutinVideo.currentTime = 0;
            this.god2CutinVideo.style.display = 'block';
            
            // 動画を再生
            this.god2CutinVideo.play().then(() => {
                console.log('✅ GOD2動画再生開始（非同期）');
            }).catch(e => {
                console.error('❌ GOD2動画再生に失敗:', e);
                resolve();
            });
            
            // 動画終了時に非表示にしてresolve
            const hideVideoAndResolve = () => {
                this.god2CutinVideo.style.display = 'none';
                this.god2CutinVideo.removeEventListener('ended', hideVideoAndResolve);
                console.log('✅ GOD2動画カットイン終了（非同期）');
                resolve();
            };
            
            this.god2CutinVideo.addEventListener('ended', hideVideoAndResolve);
            
            // 安全のため、5秒後に強制終了
            setTimeout(() => {
                if (this.god2CutinVideo.style.display !== 'none') {
                    this.god2CutinVideo.style.display = 'none';
                    this.god2CutinVideo.pause();
                    this.god2CutinVideo.removeEventListener('ended', hideVideoAndResolve);
                    console.log('⚠️ GOD2動画カットイン強制終了（タイムアウト・非同期）');
                    resolve();
                }
            }, 5000);
        });
    }
    
    // GOD動画カットインを表示（非同期版）
    showGodCutinVideoAsync(chainCount) {
        return new Promise((resolve) => {
            console.log(`🎬 GOD動画カットイン開始（非同期）: ${chainCount}連鎖`);
            
            if (!this.godCutinVideo) {
                console.error('❌ GOD動画要素が見つかりません');
                resolve();
                return;
            }
            
            // 動画を最初から再生
            this.godCutinVideo.currentTime = 0;
            this.godCutinVideo.style.display = 'block';
            
            // 動画を再生
            this.godCutinVideo.play().then(() => {
                console.log('✅ GOD動画再生開始（非同期）');
            }).catch(e => {
                console.error('❌ GOD動画再生に失敗:', e);
                resolve();
            });
            
            // 動画終了時に非表示にしてresolve
            const hideVideoAndResolve = () => {
                this.godCutinVideo.style.display = 'none';
                this.godCutinVideo.removeEventListener('ended', hideVideoAndResolve);
                console.log('✅ GOD動画カットイン終了（非同期）');
                resolve();
            };
            
            this.godCutinVideo.addEventListener('ended', hideVideoAndResolve);
            
            // 安全のため、5秒後に強制終了
            setTimeout(() => {
                if (this.godCutinVideo.style.display !== 'none') {
                    this.godCutinVideo.style.display = 'none';
                    this.godCutinVideo.pause();
                    this.godCutinVideo.removeEventListener('ended', hideVideoAndResolve);
                    console.log('⚠️ GOD動画カットイン強制終了（タイムアウト・非同期）');
                    resolve();
                }
            }, 5000);
        });
    }
    
    // 非同期版のカットイン表示（アニメーション完了まで待機）
    showCutinEffectAsync(chainCount) {
        return new Promise((resolve) => {
            console.log(`🎬 showCutinEffectAsync called with chainCount: ${chainCount}`);
            
            // 連鎖数に応じた専用画像を使用
            let cutinImageToUse;
            let imageName;
            
            // 3連鎖の場合は必ずnao7.pngを使用（強制）
            if (chainCount === 3) {
                console.log('🎯 3連鎖検出 - nao7.pngを強制使用');
                if (this.cutin3ChainImage && this.cutin3ChainImage.complete && this.cutin3ChainImage.naturalWidth > 0) {
                    console.log('✅ Using 3Chain cutin image: nao7.png');
                    cutinImageToUse = this.cutin3ChainImage;
                    imageName = 'nao7.png (3連鎖専用)';
                } else {
                    // フォールバック：通常のカットイン画像
                    if (this.cutinImage && this.cutinImage.complete) {
                        console.log('⚠️ Fallback to normal cutin image for 3chain');
                        cutinImageToUse = this.cutinImage;
                        imageName = 'saginaoki.jpg (3連鎖フォールバック)';
                    } else {
                        console.log('❌ No images available for 3chain');
                        resolve();
                        return;
                    }
                }
            } else if (chainCount === 5 && this.cutin5ChainImage && this.cutin5ChainImage.complete && this.cutin5ChainImage.naturalWidth > 0) {
                console.log('✅ Using 5Chain cutin image: 5rensa.png');
                cutinImageToUse = this.cutin5ChainImage;
                imageName = '5rensa.png (5連鎖専用)';
            } else if (this.cutinImage && this.cutinImage.complete) {
                console.log('⚠️ Using normal cutin image: saginaoki.jpg');
                cutinImageToUse = this.cutinImage;
                imageName = 'saginaoki.jpg (通常)';
            } else {
                console.log('❌ No cutin image available');
                resolve();
                return;
            }
            
            console.log(`🖼️ Selected image: ${imageName}`);
            
            // カットイン要素を作成
            const cutin = document.createElement('div');
            cutin.className = 'cutin-effect';
            
            // 画像要素を作成
            const img = document.createElement('img');
            img.src = cutinImageToUse.src;
            img.className = 'cutin-image';
            
            // テキスト要素を作成
            const text = document.createElement('div');
            text.className = 'cutin-text';
            
            // 連鎖数に応じて動画カットインを再生
            if (chainCount >= 7) {
                this.showGodCutinVideoAsync(chainCount).then(resolve);
                return; // 動画再生のため、通常のカットインはスキップ
            } else if (chainCount === 6) {
                this.showGod2CutinVideoAsync(chainCount).then(resolve);
                return; // 動画再生のため、通常のカットインはスキップ
            } else if (chainCount === 5) {
                this.showGod1CutinVideoAsync(chainCount).then(resolve);
                return; // 動画再生のため、通常のカットインはスキップ
            }
            
            // 連鎖数に応じたメッセージ（4連鎖以下のみ）
            if (chainCount >= 4) {
                text.textContent = `${chainCount}連鎖！ やるやん！`;
            } else if (chainCount === 3) {
                text.textContent = `3連鎖！ いいね！`;
            } else {
                text.textContent = `${chainCount}連鎖！`;
            }
            
            cutin.appendChild(img);
            cutin.appendChild(text);
            
            // ゲーム領域に追加
            this.canvas.parentElement.appendChild(cutin);
            
            // アニメーション終了後に削除してresolve
            setTimeout(() => {
                if (cutin.parentElement) {
                    cutin.parentElement.removeChild(cutin);
                }
                resolve();
            }, 2000);
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 着地アニメーション開始
    startLandingAnimation(x, y) {
        if (x >= 0 && x < this.BOARD_WIDTH && y >= 0 && y < this.BOARD_HEIGHT) {
            this.puyoAnimations[y][x].scale = 1.3;
            this.puyoAnimations[y][x].bounce = 0.2;
            this.puyoAnimations[y][x].lastLandTime = Date.now();
        }
    }
    
    // アニメーションの更新
    updateAnimations() {
        const currentTime = Date.now();
        this.animationTime = currentTime;
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                const anim = this.puyoAnimations[y][x];
                
                // 着地後のバウンス効果
                if (anim.lastLandTime > 0) {
                    const timeSinceLanding = currentTime - anim.lastLandTime;
                    const duration = 300; // 300ms でアニメーション完了
                    
                    if (timeSinceLanding < duration) {
                        const progress = timeSinceLanding / duration;
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        
                        anim.scale = 1.0 + (0.3 * (1 - easeOut));
                        anim.bounce = 0.2 * Math.sin(progress * Math.PI * 3) * (1 - progress);
                    } else {
                        anim.scale = 1.0;
                        anim.bounce = 0;
                        anim.lastLandTime = 0;
                    }
                }
                
                // 接続されているぷよのぷるぷる効果
                if (this.board[y][x] !== 0) {
                    const connected = this.getConnectedDirections(x, y, this.board[y][x]);
                    if (connected.up || connected.down || connected.left || connected.right) {
                        const wave = Math.sin(this.animationTime * 0.005 + x + y) * 0.02;
                        anim.rotation = wave;
                    }
                }
            }
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // ポーズ中は描画のみ行い、ゲーム進行は停止
        if (this.gamePaused) {
            this.render();
        } else {
            const currentTime = Date.now();
            
            // 時間開始が設定されていない場合は初期化
            if (!this.timeStart) {
                this.timeStart = currentTime;
            }
            
            this.time = Math.floor((currentTime - this.timeStart) / 1000);
            this.updateDisplay();
            
            // アニメーションを更新
            this.updateAnimations();
            
            // なおちゃんタイムを更新
            this.updateNaochanTime();
            
            // なおちゃんチャット機能（自動投稿）
            this.sendNaochanChat();
            
            // 緊急スポーンを一時的に無効化（デバッグ用）
            // if (!this.currentPiece && !this.isInChainSequence && !this.isPlacingPiece) {
            //     this.generateNextPiece();
            //     this.spawnNewPiece();
            // }
            
            // 切り離されたピースは高速落下（100ms間隔）
            // おぐコンボ効果も考慮
            let baseFallSpeed = this.isSeparatedPiece ? 100 : this.getOguComboFallSpeed();
            const effectiveFallSpeed = baseFallSpeed;
            
            if (currentTime - this.lastFallTime > effectiveFallSpeed) {
                if (this.currentPiece) {
                    this.movePiece(0, 1);
                }
                this.lastFallTime = currentTime;
            }
            
            this.render();
        }
        
        // ゲームが実行中の場合のみ次のフレームを要求
        if (this.gameRunning) {
            requestAnimationFrame(() => this.gameLoop());
        } else {
            console.log('🛑 requestAnimationFrame停止: ゲーム停止中');
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // グリッド線を描画
        this.drawGrid();
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0) {
                    const connected = this.getConnectedDirections(x, y, this.board[y][x]);
                    const animation = this.puyoAnimations[y][x];
                    this.drawAnimatedPuyo(x, y, this.board[y][x], connected, animation);
                }
            }
        }
        
        if (this.currentPiece) {
            for (let i = 0; i < this.currentPiece.positions.length; i++) {
                const pos = this.currentPiece.positions[i];
                const x = this.currentPiece.x + pos.x;
                const y = this.currentPiece.y + pos.y;
                
                // 切り離されたピースは少し透明にして区別
                if (this.isSeparatedPiece) {
                    this.drawSeparatedPuyo(x, y, this.currentPiece.colors[i]);
                } else {
                    this.drawPuyo(x, y, this.currentPiece.colors[i]);
                }
            }
        }
        
        this.renderNextPiece();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        
        // 縦線
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.CELL_SIZE, this.BOARD_HEIGHT * this.CELL_SIZE);
            this.ctx.stroke();
        }
        
        // 横線
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.CELL_SIZE);
            this.ctx.lineTo(this.BOARD_WIDTH * this.CELL_SIZE, y * this.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawAnimatedPuyo(x, y, colorIndex, isConnected = null, animation = null) {
        // プレイエリア内のみ描画
        if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT) {
            return;
        }
        
        const pixelX = x * this.CELL_SIZE;
        const pixelY = y * this.CELL_SIZE;
        const puyoSize = this.CELL_SIZE - 4;
        const puyoX = pixelX + 2;
        const puyoY = pixelY + 2;
        
        this.ctx.save();
        
        // アニメーション変形を適用
        if (animation) {
            const centerX = puyoX + puyoSize / 2;
            const centerY = puyoY + puyoSize / 2;
            
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(animation.scale, animation.scale + animation.bounce);
            this.ctx.rotate(animation.rotation);
            this.ctx.translate(-centerX, -centerY);
        }
        
        // 接続状態に基づいて角丸半径を調整
        let radius = 12;
        
        // 接続されている方向に応じてパスを作成
        this.ctx.beginPath();
        
        if (isConnected) {
            this.drawConnectedShape(puyoX, puyoY, puyoSize, puyoSize, radius, isConnected);
        } else {
            this.roundRect(puyoX, puyoY, puyoSize, puyoSize, radius);
        }
        
        this.ctx.clip();
        
        // 画像が読み込まれている場合は画像を描画、そうでなければ色で描画
        if (this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
            this.ctx.drawImage(
                this.puyoImages[colorIndex], 
                puyoX, 
                puyoY, 
                puyoSize, 
                puyoSize
            );
        } else {
            // フォールバック：色での描画
            this.ctx.fillStyle = this.colors[colorIndex];
            this.ctx.fillRect(puyoX, puyoY, puyoSize, puyoSize);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(puyoX + 4, puyoY + 4, puyoSize - 8, puyoSize - 8);
        }
        
        this.ctx.restore();
        
        // 接続エフェクト（光沢）を追加
        if (isConnected && (isConnected.up || isConnected.down || isConnected.left || isConnected.right)) {
            this.drawConnectionGlow(puyoX, puyoY, puyoSize, isConnected);
        }
        
        // 境界線の描画
        this.ctx.save();
        
        // アニメーション変形を再適用（境界線用）
        if (animation) {
            const centerX = puyoX + puyoSize / 2;
            const centerY = puyoY + puyoSize / 2;
            
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(animation.scale, animation.scale + animation.bounce);
            this.ctx.rotate(animation.rotation);
            this.ctx.translate(-centerX, -centerY);
        }
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        if (isConnected) {
            this.drawConnectedShape(puyoX, puyoY, puyoSize, puyoSize, radius, isConnected);
        } else {
            this.roundRect(puyoX, puyoY, puyoSize, puyoSize, radius);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    drawPuyo(x, y, colorIndex, isConnected = null) {
        // 横方向の境界チェックと画面下端チェック（上端は描画する）
        if (x < 0 || x >= this.BOARD_WIDTH || y >= this.BOARD_HEIGHT) {
            return;
        }
        
        const pixelX = x * this.CELL_SIZE;
        const pixelY = y * this.CELL_SIZE;
        const puyoSize = this.CELL_SIZE - 4;
        const puyoX = pixelX + 2;
        const puyoY = pixelY + 2;
        
        // 接続状態に基づいて角丸半径を調整
        let radius = 12;
        
        // 接続されている方向に応じてパスを作成
        this.ctx.save();
        this.ctx.beginPath();
        
        if (isConnected) {
            this.drawConnectedShape(puyoX, puyoY, puyoSize, puyoSize, radius, isConnected);
        } else {
            this.roundRect(puyoX, puyoY, puyoSize, puyoSize, radius);
        }
        
        this.ctx.clip();
        
        // 画像が読み込まれている場合は画像を描画、そうでなければ色で描画
        if (this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
            this.ctx.drawImage(
                this.puyoImages[colorIndex], 
                puyoX, 
                puyoY, 
                puyoSize, 
                puyoSize
            );
        } else {
            // フォールバック：色での描画
            this.ctx.fillStyle = this.colors[colorIndex];
            this.ctx.fillRect(puyoX, puyoY, puyoSize, puyoSize);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(puyoX + 4, puyoY + 4, puyoSize - 8, puyoSize - 8);
        }
        
        this.ctx.restore();
        
        // 接続エフェクト（光沢）を追加
        if (isConnected && (isConnected.up || isConnected.down || isConnected.left || isConnected.right)) {
            this.drawConnectionGlow(puyoX, puyoY, puyoSize, isConnected);
        }
        
        // 境界線の描画
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        if (isConnected) {
            this.drawConnectedShape(puyoX, puyoY, puyoSize, puyoSize, radius, isConnected);
        } else {
            this.roundRect(puyoX, puyoY, puyoSize, puyoSize, radius);
        }
        
        this.ctx.stroke();
    }
    
    // 角丸矩形を描画するヘルパーメソッド
    roundRect(x, y, width, height, radius) {
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    // 接続状態に応じた形状を作成
    drawConnectedShape(x, y, width, height, radius, connected) {
        // 角の丸みを接続状態に応じて調整
        const topLeftRadius = (connected.up || connected.left) ? 4 : radius;
        const topRightRadius = (connected.up || connected.right) ? 4 : radius;
        const bottomLeftRadius = (connected.down || connected.left) ? 4 : radius;
        const bottomRightRadius = (connected.down || connected.right) ? 4 : radius;
        
        // カスタム角丸矩形
        this.ctx.moveTo(x + topLeftRadius, y);
        this.ctx.lineTo(x + width - topRightRadius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + topRightRadius);
        this.ctx.lineTo(x + width, y + height - bottomRightRadius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRightRadius, y + height);
        this.ctx.lineTo(x + bottomLeftRadius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeftRadius);
        this.ctx.lineTo(x, y + topLeftRadius);
        this.ctx.quadraticCurveTo(x, y, x + topLeftRadius, y);
        this.ctx.closePath();
    }
    
    // 接続部分の光沢効果
    drawConnectionGlow(x, y, size, connected) {
        this.ctx.save();
        
        // 接続方向に応じたグラデーション
        if (connected.up || connected.down || connected.left || connected.right) {
            const gradient = this.ctx.createRadialGradient(
                x + size/2, y + size/2, 0,
                x + size/2, y + size/2, size/2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // 隣接する同じ色のぷよを検出
    getConnectedDirections(x, y, colorIndex) {
        const directions = { up: false, down: false, left: false, right: false };
        
        // 上
        if (y > 0 && this.board[y - 1][x] === colorIndex) {
            directions.up = true;
        }
        // 下
        if (y < this.BOARD_HEIGHT - 1 && this.board[y + 1][x] === colorIndex) {
            directions.down = true;
        }
        // 左
        if (x > 0 && this.board[y][x - 1] === colorIndex) {
            directions.left = true;
        }
        // 右
        if (x < this.BOARD_WIDTH - 1 && this.board[y][x + 1] === colorIndex) {
            directions.right = true;
        }
        
        return directions;
    }
    
    // 接続状態に応じた境界線の描画
    drawConnectedBorder(x, y, colorIndex, connected) {
        const pixelX = x * this.CELL_SIZE;
        const pixelY = y * this.CELL_SIZE;
        const puyoX = pixelX + 2;
        const puyoY = pixelY + 2;
        const puyoSize = this.CELL_SIZE - 4;
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 2;
        
        // 接続されていない方向にのみ境界線を描画
        this.ctx.beginPath();
        
        // 上辺
        if (!connected.up) {
            this.ctx.moveTo(puyoX + 12, puyoY);
            this.ctx.lineTo(puyoX + puyoSize - 12, puyoY);
        }
        
        // 下辺
        if (!connected.down) {
            this.ctx.moveTo(puyoX + 12, puyoY + puyoSize);
            this.ctx.lineTo(puyoX + puyoSize - 12, puyoY + puyoSize);
        }
        
        // 左辺
        if (!connected.left) {
            this.ctx.moveTo(puyoX, puyoY + 12);
            this.ctx.lineTo(puyoX, puyoY + puyoSize - 12);
        }
        
        // 右辺
        if (!connected.right) {
            this.ctx.moveTo(puyoX + puyoSize, puyoY + 12);
            this.ctx.lineTo(puyoX + puyoSize, puyoY + puyoSize - 12);
        }
        
        this.ctx.stroke();
    }
    
    drawSeparatedPuyo(x, y, colorIndex) {
        // 横方向の境界チェックと画面下端チェック（上端は描画する）
        if (x < 0 || x >= this.BOARD_WIDTH || y >= this.BOARD_HEIGHT) {
            return;
        }
        
        const pixelX = x * this.CELL_SIZE;
        const pixelY = y * this.CELL_SIZE;
        const radius = 12;
        const puyoSize = this.CELL_SIZE - 4;
        const puyoX = pixelX + 2;
        const puyoY = pixelY + 2;
        
        // 切り離されたピースは少し暗く表示
        this.ctx.globalAlpha = 0.8;
        
        // 角丸のパスを作成
        this.ctx.save();
        this.ctx.beginPath();
        this.roundRect(puyoX, puyoY, puyoSize, puyoSize, radius);
        this.ctx.clip();
        
        // 画像が読み込まれている場合は画像を描画、そうでなければ色で描画
        if (this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
            this.ctx.drawImage(
                this.puyoImages[colorIndex], 
                puyoX, 
                puyoY, 
                puyoSize, 
                puyoSize
            );
        } else {
            // フォールバック：色での描画
            this.ctx.fillStyle = this.colors[colorIndex];
            this.ctx.fillRect(puyoX, puyoY, puyoSize, puyoSize);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(puyoX + 4, puyoY + 4, puyoSize - 8, puyoSize - 8);
        }
        
        this.ctx.restore();
        
        // 境界線
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.roundRect(puyoX, puyoY, puyoSize, puyoSize, radius);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1.0; // 透明度を元に戻す
    }
    
    renderNextPiece() {
        const nextDisplay = document.getElementById('next-puyo');
        nextDisplay.innerHTML = '';
        
        if (this.nextPiece) {
            // 1個目のピース（通常表示）
            const canvas1 = document.createElement('canvas');
            canvas1.width = 120;
            canvas1.height = 120;
            const ctx1 = canvas1.getContext('2d');
            
            for (let i = 0; i < this.nextPiece.positions.length; i++) {
                const pos = this.nextPiece.positions[i];
                const x = (pos.x + 1) * 30 + 15;
                const y = pos.y * 30 + 15;
                
                const colorIndex = this.nextPiece.colors[i];
                
                // 画像が読み込まれている場合は画像を描画、そうでなければ色で描画
                if (this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
                    ctx1.drawImage(this.puyoImages[colorIndex], x, y, 40, 40);
                } else {
                    // フォールバック：色での描画
                    ctx1.fillStyle = this.colors[colorIndex];
                    ctx1.fillRect(x, y, 40, 40);
                    
                    ctx1.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx1.fillRect(x + 4, y + 4, 32, 32);
                }
                
                ctx1.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx1.lineWidth = 2;
                ctx1.strokeRect(x, y, 40, 40);
            }
            
            nextDisplay.appendChild(canvas1);
            
            // なおコンボ効果中は2個目のピースも表示
            if (this.showNextPieceExtra && this.nextPiece2) {
                const label = document.createElement('div');
                label.textContent = '2個目';
                label.style.color = '#FFFF44';
                label.style.fontSize = '12px';
                label.style.textAlign = 'center';
                label.style.marginTop = '5px';
                nextDisplay.appendChild(label);
                
                const canvas2 = document.createElement('canvas');
                canvas2.width = 120;
                canvas2.height = 120;
                const ctx2 = canvas2.getContext('2d');
                
                for (let i = 0; i < this.nextPiece2.positions.length; i++) {
                    const pos = this.nextPiece2.positions[i];
                    const x = (pos.x + 1) * 30 + 15;
                    const y = pos.y * 30 + 15;
                    
                    const colorIndex = this.nextPiece2.colors[i];
                    
                    // 画像が読み込まれている場合は画像を描画、そうでなければ色で描画
                    if (this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
                        ctx2.drawImage(this.puyoImages[colorIndex], x, y, 40, 40);
                    } else {
                        // フォールバック：色での描画
                        ctx2.fillStyle = this.colors[colorIndex];
                        ctx2.fillRect(x, y, 40, 40);
                        
                        ctx2.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx2.fillRect(x + 4, y + 4, 32, 32);
                    }
                    
                    ctx2.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx2.lineWidth = 2;
                    ctx2.strokeRect(x, y, 40, 40);
                }
                
                nextDisplay.appendChild(canvas2);
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = this.time;
        document.getElementById('chain').textContent = this.chain;
        
        // なおちゃんタイムタイマー表示
        const naochanTimer = document.getElementById('naochan-timer');
        if (this.naochanTimeActive) {
            naochanTimer.classList.remove('hidden');
            const remainingSeconds = Math.ceil(this.naochanTimeRemaining / 1000);
            document.getElementById('naochan-time').textContent = remainingSeconds;
        } else {
            naochanTimer.classList.add('hidden');
        }
        
        // おぐコンボタイマー表示
        const oguTimer = document.getElementById('ogu-combo-timer');
        if (this.oguComboActive) {
            oguTimer.classList.remove('hidden');
            const remainingSeconds = Math.ceil((this.oguComboEndTime - Date.now()) / 1000);
            document.getElementById('ogu-time').textContent = Math.max(0, remainingSeconds);
        } else {
            oguTimer.classList.add('hidden');
        }
        
        // なおコンボタイマー表示
        const naoTimer = document.getElementById('nao-combo-timer');
        if (this.naoComboActive) {
            naoTimer.classList.remove('hidden');
            const elapsedTime = Date.now() - this.naoComboStartTime;
            const remainingSeconds = Math.ceil((10000 - elapsedTime) / 1000);
            document.getElementById('nao-time').textContent = Math.max(0, remainingSeconds);
        } else {
            naoTimer.classList.add('hidden');
        }
        
        // スコア更新時にBGM切り替えをチェック
        this.checkScoreAndSwitchBgm();
    }
    
    gameOver() {
        this.gameRunning = false;
        this.scoreSubmitted = false; // リセット
        
        // スコアを保存（clearGameStateで0になる前に）
        this.finalScore = this.score;
        this.finalChain = this.chain;
        
        document.getElementById('final-score').textContent = this.finalScore;
        
        // なおちゃんがゲームオーバーコメント
        setTimeout(() => {
            this.sendContextualNaochanChat('game_over');
        }, 1000);
        
        // スコア登録ボタンを表示
        const submitButton = document.getElementById('submit-score');
        const scoreRegistration = document.getElementById('score-registration');
        submitButton.style.display = 'block';
        scoreRegistration.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'スコアを登録';
        
        // プレイヤー名入力欄をクリア
        document.getElementById('player-name').value = '';
        
        document.getElementById('game-over').classList.remove('hidden');
        
        // 現在再生中のBGMを停止
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }
        
        // スコアと盤面をクリア（なおちゃんタイムも含む）
        this.clearGameState();
        
        // タイトルBGMを再開
        this.startTitleBgm();
    }
    
    // BGMフェードアウト機能
    fadeOutBgm(bgmElement, duration = 2000) {
        return new Promise((resolve) => {
            if (!bgmElement || bgmElement.paused) {
                resolve();
                return;
            }
            
            const startVolume = bgmElement.volume;
            const step = startVolume / (duration / 50);
            
            this.fadeInterval = setInterval(() => {
                bgmElement.volume = Math.max(0, bgmElement.volume - step);
                
                if (bgmElement.volume <= 0) {
                    clearInterval(this.fadeInterval);
                    bgmElement.pause();
                    bgmElement.volume = startVolume; // 音量を元に戻す
                    console.log('🔇 BGMフェードアウト完了');
                    resolve();
                }
            }, 50);
        });
    }
    
    // BGMフェードイン機能
    fadeInBgm(bgmElement, targetVolume = 0.5, duration = 2000) {
        return new Promise((resolve) => {
            if (!bgmElement) {
                resolve();
                return;
            }
            
            bgmElement.volume = 0;
            bgmElement.play().catch(e => console.log('BGM再生エラー:', e));
            
            const step = targetVolume / (duration / 50);
            
            this.fadeInterval = setInterval(() => {
                bgmElement.volume = Math.min(targetVolume, bgmElement.volume + step);
                
                if (bgmElement.volume >= targetVolume) {
                    clearInterval(this.fadeInterval);
                    console.log('🔊 BGMフェードイン完了');
                    resolve();
                }
            }, 50);
        });
    }
    
    // BGM切り替え機能（フェード付き）
    async switchBgm(newBgm, targetVolume = 0.5) {
        console.log('🎵 BGM切り替え開始');
        
        // 現在のBGMをフェードアウト
        if (this.currentBgm && !this.currentBgm.paused) {
            await this.fadeOutBgm(this.currentBgm);
        }
        
        // 新しいBGMをフェードイン
        this.currentBgm = newBgm;
        await this.fadeInBgm(newBgm, targetVolume);
        
        console.log('🎵 BGM切り替え完了');
    }
    
    // スコアチェックとBGM切り替え
    checkScoreAndSwitchBgm() {
        if (this.score >= 200000 && !this.bgmSwitched) {
            console.log('🏆 スコア200000達成！BGMを切り替えます');
            this.bgmSwitched = true;
            // なおちゃんタイム中は BGM 切り替えを行わない
            if (!this.naochanTimeActive) {
                this.switchBgm(this.bgm2);
            }
        }
    }
    
    // なおちゃんタイム発動チェック（5連鎖以上で10%の確率）
    checkNaochanTimeActivation(chainCount) {
        // 200,000点到達でなおちゃんタイム発動
        if (this.score >= 200000 && !this.naochanTimeActive && !this.naochanTimeTriggeredByScore) {
            console.log('💰 200,000点到達でなおちゃんタイム発動！');
            this.naochanTimeTriggeredByScore = true; // 一度だけ発動
            this.activateNaochanTime();
            return;
        }
        
        // 600,000点到達でなおちゃんタイム発動
        if (this.score >= 600000 && !this.naochanTimeActive && !this.naochanTimeTriggeredBy600k) {
            console.log('🎖️ 600,000点到達でなおちゃんタイム発動！');
            this.naochanTimeTriggeredBy600k = true; // 一度だけ発動
            this.activateNaochanTime();
            return;
        }
        
        // 1,000,000点到達でなおちゃんタイム発動
        if (this.score >= 1000000 && !this.naochanTimeActive && !this.naochanTimeTriggeredBy1M) {
            console.log('🏆 1,000,000点到達でなおちゃんタイム発動！');
            this.naochanTimeTriggeredBy1M = true; // 一度だけ発動
            this.activateNaochanTime();
            return;
        }
        
        // 5連鎖以上で10%の確率でなおちゃんタイム発動
        if (chainCount >= 5 && !this.naochanTimeActive && Math.random() < 0.1) {
            this.activateNaochanTime();
        }
    }
    
    // ================================================
    // 🌟 なおちゃんシステム
    // ================================================
    activateNaochanTime() {
        if (this.naochanTimeActive) return;
        
        console.log('🌟 なおちゃんタイム発動！');
        this.naochanTimeActive = true;
        this.naochanTimeRemaining = 60000; // 60秒（1分）
        this.naochanTimeStartTime = Date.now();
        
        // 現在のBGMを停止してなおちゃんタイムBGMに切り替え
        if (this.currentBgm) {
            this.currentBgm.pause();
        }
        this.currentBgm = this.naochanBgm;
        this.naochanBgm.play().catch(e => {
            console.log('なおちゃんタイムBGM auto-play blocked:', e);
        });
        
        // 発動SE再生
        this.playSE(this.seNaochanTime, 'なおちゃんタイム発動');
        
        // 発動エフェクト表示
        this.showNaochanTimeEffect();
        
        // なおちゃんタイム発動コメント
        setTimeout(() => {
            this.sendContextualNaochanChat('naochan_time');
        }, 1500);
        
        // 画面を再描画
        this.render();
    }
    
    // なおちゃんタイム更新（ゲームループで呼ばれる）
    updateNaochanTime() {
        if (!this.naochanTimeActive) return;
        
        const currentTime = Date.now();
        this.naochanTimeRemaining = Math.max(0, 60000 - (currentTime - this.naochanTimeStartTime));
        
        // 時間切れチェック
        if (this.naochanTimeRemaining <= 0) {
            this.deactivateNaochanTime();
        }
    }
    
    // なおちゃんタイム終了
    deactivateNaochanTime() {
        if (!this.naochanTimeActive) return;
        
        console.log('✨ なおちゃんタイム終了');
        this.naochanTimeActive = false;
        this.naochanTimeRemaining = 0;
        
        // BGMを元に戻す
        if (this.currentBgm === this.naochanBgm) {
            this.naochanBgm.pause();
            this.naochanBgm.currentTime = 0;
            
            // スコア200000以上なら2番目のBGM、そうでなければ通常BGM
            if (this.bgmSwitched) {
                console.log('🎵 なおちゃんタイム終了 - 200000スコア達成BGMに切り替え');
                this.currentBgm = this.bgm2;
            } else {
                console.log('🎵 なおちゃんタイム終了 - 通常BGMに戻す');
                this.currentBgm = this.bgm;
            }
            
            this.currentBgm.play().catch(e => {
                console.log('BGM resume failed:', e);
            });
        }
        
        // 画面を再描画
        this.render();
    }
    
    // なおちゃんタイム中のスコア倍率を適用
    getNaochanTimeScoreMultiplier() {
        return this.naochanTimeActive ? 3 : 1;
    }
    
    // なおちゃんタイムエフェクト表示
    showNaochanTimeEffect() {
        // 画面全体にキラキラエフェクトを追加
        const effect = document.createElement('div');
        effect.className = 'naochan-time-effect';
        effect.innerHTML = `
            <div class="naochan-time-text">⭐ なおちゃんタイム ⭐</div>
            <div class="naochan-time-subtitle">60秒間 スコア3倍！5色で大連鎖！</div>
        `;
        document.body.appendChild(effect);
        
        // 3秒後に削除
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 3000);
    }
    
    // おぐなおコンボチェック
    checkOgunaoCombo(allMatches) {
        const colorsInMatch = new Set();
        
        // マッチした色を記録
        for (let group of allMatches) {
            if (group.length > 0) {
                const color = this.board[group[0].y][group[0].x];
                colorsInMatch.add(color);
            }
        }
        
        // 「おぐ」コンボ: 緑(2) + 青(3)
        if (colorsInMatch.has(2) && colorsInMatch.has(3)) {
            this.activateOguCombo();
        }
        
        // 「なお」コンボ: 赤(1) + 黄(4)  
        if (colorsInMatch.has(1) && colorsInMatch.has(4)) {
            this.activateNaoCombo();
        }
        
        // 「最強」コンボ: 5色すべて
        if (colorsInMatch.size >= 5) {
            this.activateSaikyoCombo();
        }
    }
    
    // 「おぐ」コンボ発動（緑+青で落下速度半減）
    activateOguCombo() {
        console.log('💚💙 「おぐ」コンボ発動！落下速度半減');
        this.oguComboActive = true;
        this.oguComboEndTime = Date.now() + 3000; // 3秒間
        
        this.playSE(this.seChain2, 'おぐコンボ');
        this.showComboEffect('💚💙 おぐコンボ！', '落下速度半減 3秒間', '#44FF44');
    }
    
    // 「なお」コンボ発動（赤+黄で次ピース予告拡張）
    activateNaoCombo() {
        console.log('❤️💛 「なお」コンボ発動！次ピース予告拡張');
        this.naoComboActive = true;
        this.showNextPieceExtra = true;
        this.naoComboStartTime = Date.now(); // 開始時間を記録
        
        this.playSE(this.seChain3, 'なおコンボ');
        this.showComboEffect('❤️💛 なおコンボ！', '次ピース2個先まで表示', '#FFFF44');
        
        // 10秒後に効果終了
        setTimeout(() => {
            this.naoComboActive = false;
            this.showNextPieceExtra = false;
            console.log('なおコンボ効果終了');
        }, 10000);
    }
    
    // 「最強」コンボ発動（5色すべてでボーナスタイム）
    activateSaikyoCombo() {
        console.log('🌈 「最強」コンボ発動！ボーナスタイム突入');
        this.saikyoComboReady = true;
        
        this.playSE(this.seChain4, '最強コンボ');
        this.showComboEffect('🌈 最強コンボ！', 'ボーナスタイム突入！', '#FF44FF');
        
        // スコアボーナス
        this.score += 50000;
        this.updateDisplay();
        this.checkSupportTriggers();
        
        // なおちゃんタイムを強制発動
        this.activateNaochanTime();
    }
    
    // コンボエフェクト表示
    showComboEffect(title, subtitle, color) {
        const effect = document.createElement('div');
        effect.className = 'combo-effect';
        effect.innerHTML = `
            <div class="combo-title" style="color: ${color}">${title}</div>
            <div class="combo-subtitle">${subtitle}</div>
        `;
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2500);
    }
    
    // おぐコンボの落下速度効果を取得
    getOguComboFallSpeed() {
        if (this.oguComboActive && Date.now() < this.oguComboEndTime) {
            return this.fallSpeed * 2; // 落下速度を半分に（時間を2倍に）
        }
        
        // 効果時間切れチェック
        if (this.oguComboActive && Date.now() >= this.oguComboEndTime) {
            this.oguComboActive = false;
            console.log('おぐコンボ効果終了');
        }
        
        return this.fallSpeed;
    }
    
    clearGameState() {
        // ゲーム実行状態をリセット
        this.gameRunning = false;
        
        // スコア関連をクリア
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        
        // 盤面をクリア
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        
        // 現在のピースをクリア
        this.currentPiece = null;
        this.nextPiece = null;
        
        // その他のゲーム状態をリセット
        this.isSeparatedPiece = false;
        this.isInChainSequence = false;
        this.currentChainSequence = 0;
        this.isPlacingPiece = false;
        this.bgmSwitched = false; // BGM切り替えフラグをリセット
        
        // 応援システムフラグをリセット
        this.supportTriggered50k = false;
        this.supportTriggered100k = false;
        this.supportTriggered200k = false;
        this.supportTriggered600k = false;
        this.supportTriggered1M = false;
        if (this.supportTimer) {
            clearTimeout(this.supportTimer);
            this.supportTimer = null;
        }
        
        // なおちゃんタイムをリセット
        if (this.naochanTimeActive) {
            this.deactivateNaochanTime();
        }
        this.naochanTimeTriggeredByScore = false; // スコア発動フラグもリセット
        this.naochanTimeTriggeredBy600k = false; // 60万点発動フラグもリセット
        this.naochanTimeTriggeredBy1M = false; // 100万点発動フラグもリセット
        
        // おぐなおコンボ状態をリセット
        this.oguComboActive = false;
        this.oguComboEndTime = 0;
        this.naoComboActive = false;
        this.naoComboStartTime = 0;
        this.showNextPieceExtra = false;
        this.saikyoComboReady = false;
        
        // アニメーション状態をリセット
        this.puyoAnimations = Array(this.BOARD_HEIGHT).fill().map(() => 
            Array(this.BOARD_WIDTH).fill().map(() => ({
                scale: 1.0,
                bounce: 0,
                rotation: 0,
                lastLandTime: 0
            }))
        );
        
        // 表示を更新
        this.updateDisplay();
        this.render();
        
        console.log('🧹 ゲーム状態をクリアしました');
    }
    
    restart() {
        // ゲーム状態をクリア
        this.clearGameState();
        
        // ゲーム実行フラグとスコア登録状態をリセット
        this.gameRunning = false;
        this.scoreSubmitted = false;
        this.gameHasStartedBefore = false;
        
        // スコア登録UIをリセット
        const submitButton = document.getElementById('submit-score');
        const scoreRegistration = document.getElementById('score-registration');
        const playerNameInput = document.getElementById('player-name');
        
        scoreRegistration.style.display = 'none';
        submitButton.disabled = false;
        submitButton.textContent = 'スコアを登録';
        playerNameInput.value = '';
        
        // 新しいピースを生成
        this.generateNextPiece();
        this.spawnNewPiece();
        
        // ゲームBGM停止
        this.bgm.pause();
        this.bgm.currentTime = 0;
        
        // 全画面を非表示
        this.hideAllScreens();
        
        // タイトル画面を適切に表示
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.classList.remove('hidden');
            // bodyクラスを title-mode に変更
            document.body.classList.remove('game-mode');
            document.body.classList.add('title-mode');
            document.body.style.display = 'block';
            document.body.style.justifyContent = 'initial';
            document.body.style.alignItems = 'initial';
            // タイトル画面表示時はコンテナを隠す
            const container = document.querySelector('.container');
            if (container) {
                container.style.display = 'none';
            }
        }
        
        // タイトルBGMを再開
        this.startTitleBgm();
    }
    
    // デバッグ機能
    debugChain(chainCount) {
        console.log(`デバッグ: ${chainCount}連鎖をシミュレート`);
        
        if (chainCount === 3) {
            console.log('=== 3連鎖専用デバッグ ===');
            console.log('3Chain画像のsrc:', this.cutin3ChainImage?.src);
            console.log('3Chain画像のcomplete:', this.cutin3ChainImage?.complete);
            console.log('3Chain画像のnaturalWidth:', this.cutin3ChainImage?.naturalWidth);
            console.log('3Chain画像のnaturalHeight:', this.cutin3ChainImage?.naturalHeight);
            
            // 画像が正常に読み込まれているかを追加チェック
            if (this.cutin3ChainImage && this.cutin3ChainImage.complete && this.cutin3ChainImage.naturalWidth > 0) {
                console.log('✅ 3Chain画像は正常に読み込まれています');
            } else {
                console.log('❌ 3Chain画像に問題があります');
                // 画像を再読み込みしてみる
                console.log('🔄 3Chain画像を再読み込み中...');
                setTimeout(() => {
                    this.cutin3ChainImage.src = 'images/nao7.png';
                }, 100);
            }
        }
        
        this.showChainEffect(chainCount);
        if (chainCount >= 3) {
            this.showCutinEffect(chainCount);
        }
        // スコアも更新
        this.chain = Math.max(this.chain, chainCount);
        this.score += 100 * chainCount * chainCount;
        this.updateDisplay();
        this.checkSupportTriggers();
        
        // 大連鎖時のなおちゃんコメント
        if (chainCount >= 5) {
            setTimeout(() => {
                this.sendContextualNaochanChat('big_chain');
            }, 1000);
        }
    }
    
    debugCutin() {
        console.log('デバッグ: カットインテスト');
        console.log('画像読み込み状況:');
        console.log('- Normal cutin (saginaoki.jpg):', this.cutinImage?.complete, this.cutinImage?.src);
        console.log('- 3Chain cutin (nao7.png):', this.cutin3ChainImage?.complete, this.cutin3ChainImage?.src);
        console.log('- 5Chain cutin (5rensa.png):', this.cutin5ChainImage?.complete, this.cutin5ChainImage?.src);
        console.log('- GOD video (GOD.mp4):', !!this.godCutinVideo, this.godCutinVideo?.src);
        
        // ランダムな連鎖数でカットインを表示（5連鎖以上で動画テスト）
        const randomChain = Math.floor(Math.random() * 8) + 3; // 3-10連鎖（5+で動画）
        console.log(`🎲 ランダム連鎖数: ${randomChain}`);
        
        if (randomChain >= 7) {
            console.log('🎬 GOD動画カットインテスト');
            this.showGodCutinVideo(randomChain);
        } else if (randomChain === 6) {
            console.log('🎬 GOD2動画カットインテスト');
            this.showGod2CutinVideo(randomChain);
        } else if (randomChain === 5) {
            console.log('🎬 GOD1動画カットインテスト');
            this.showGod1CutinVideo(randomChain);
        } else {
            this.showCutinEffect(randomChain);
        }
    }
    
    debugClear() {
        console.log('デバッグ: ボードクリア');
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        // アニメーションもリセット
        this.puyoAnimations = Array(this.BOARD_HEIGHT).fill().map(() => 
            Array(this.BOARD_WIDTH).fill().map(() => ({
                scale: 1.0,
                bounce: 0,
                rotation: 0,
                lastLandTime: 0
            }))
        );
        this.render();
    }
    
    // 特定の連鎖パターンをボードに設置するデバッグ機能
    debugSetChainPattern(chainCount) {
        this.debugClear();
        
        switch(chainCount) {
            case 2:
                // 2連鎖パターン - 完全に分離した配置
                // 第1段：赤4個で削除される
                this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1; this.board[8][4] = 1;
                // 第2段：緑3個 + 浮遊緑1個（赤消去後に落ちて4個になる）
                this.board[7][1] = 2; this.board[7][2] = 2; this.board[7][3] = 2;
                this.board[6][1] = 2; // この緑が落ちて4個になる
                break;
                
            case 3:
                // 3連鎖パターン - より離した配置
                // 第1段：赤4個（まとまって削除される）
                this.board[8][0] = 1; this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1;
                
                // 第2段：緑3個 + 空中に緑1個
                this.board[7][0] = 2; this.board[7][1] = 2; this.board[7][2] = 2;
                this.board[5][0] = 2; // 赤消去後、この緑が落ちる
                
                // 第3段：青3個 + 空中に青1個
                this.board[6][0] = 3; this.board[6][1] = 3; this.board[6][2] = 3;
                this.board[4][0] = 3; // 緑消去後、この青が落ちる
                break;
                
            case 4:
                // 4連鎖パターン
                this.board[8][0] = 1; this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1; // 赤
                
                this.board[7][0] = 2; this.board[7][1] = 2; this.board[7][2] = 2; // 緑
                this.board[5][0] = 2; // 落下緑
                
                this.board[6][0] = 3; this.board[6][1] = 3; this.board[6][2] = 3; // 青
                this.board[4][0] = 3; // 落下青
                
                this.board[5][1] = 4; this.board[5][2] = 4; this.board[4][1] = 4; // 黄3個
                this.board[3][0] = 4; // 落下黄
                break;
                
            case 5:
                // 5連鎖パターン
                this.board[8][0] = 1; this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1; // 赤
                
                this.board[7][0] = 2; this.board[7][1] = 2; this.board[7][2] = 2; // 緑
                this.board[5][0] = 2; // 落下緑
                
                this.board[6][0] = 3; this.board[6][1] = 3; this.board[6][2] = 3; // 青
                this.board[4][0] = 3; // 落下青
                
                this.board[5][1] = 4; this.board[5][2] = 4; this.board[4][1] = 4; // 黄
                this.board[3][0] = 4; // 落下黄
                
                this.board[4][2] = 5; this.board[3][1] = 5; this.board[3][2] = 5; // 紫
                this.board[2][0] = 5; // 落下紫
                break;
                
            case 7:
                // 7連鎖パターン（階段式）
                // 右から左へ段階的に崩れるパターン
                this.board[8][5] = 1; this.board[8][4] = 1; this.board[8][3] = 1; this.board[8][2] = 1; // 赤底
                
                this.board[7][5] = 2; this.board[7][4] = 2; this.board[7][3] = 2; // 緑
                this.board[6][5] = 2; // 落下緑
                
                this.board[6][4] = 3; this.board[6][3] = 3; this.board[6][2] = 3; // 青
                this.board[5][4] = 3; // 落下青
                
                this.board[5][3] = 4; this.board[5][2] = 4; this.board[5][1] = 4; // 黄
                this.board[4][3] = 4; // 落下黄
                
                this.board[4][2] = 5; this.board[4][1] = 5; this.board[4][0] = 5; // 紫
                this.board[3][2] = 5; // 落下紫
                
                this.board[3][1] = 1; this.board[3][0] = 1; this.board[2][1] = 1; // 赤2段目
                this.board[2][0] = 1; // 落下赤
                
                this.board[1][0] = 2; this.board[0][0] = 2; this.board[1][1] = 2; // 緑最終
                this.board[0][1] = 2; // 落下緑最終
                break;
        }
        
        this.render();
        console.log(`${chainCount}連鎖パターンを設置しました。右側のブロックから連鎖が始まります！`);
    }
    
    // 🌟 新機能デバッグ関数群
    
    // 安全なブロック設置ヘルパー関数
    safeSetBlock(y, x, color) {
        if (y >= 0 && y < this.BOARD_HEIGHT && x >= 0 && x < this.BOARD_WIDTH) {
            this.board[y][x] = color;
            return true;
        } else {
            console.warn(`⚠️ 範囲外アクセス: [${y}][${x}] (ボードサイズ: ${this.BOARD_HEIGHT}x${this.BOARD_WIDTH})`);
            return false;
        }
    }
    
    // なおちゃんタイム強制発動
    debugNaochanTime() {
        console.log('🌟 デバッグ: なおちゃんタイム強制発動');
        
        // テスト用にボードに3色のブロックを配置
        this.debugClear();
        
        // 赤ブロックを4個横に配置（底面）
        this.safeSetBlock(8, 0, 1); // 赤
        this.safeSetBlock(8, 1, 1); // 赤
        this.safeSetBlock(8, 2, 1); // 赤
        this.safeSetBlock(8, 3, 1); // 赤
        
        // 緑ブロックを4個縦に配置（左端）
        this.safeSetBlock(7, 4, 2); // 緑
        this.safeSetBlock(6, 4, 2); // 緑
        this.safeSetBlock(5, 4, 2); // 緑
        this.safeSetBlock(4, 4, 2); // 緑
        
        // 青ブロックを4個縦に配置（右端）
        this.safeSetBlock(7, 5, 3); // 青
        this.safeSetBlock(6, 5, 3); // 青
        this.safeSetBlock(5, 5, 3); // 青
        this.safeSetBlock(4, 5, 3); // 青
        
        this.render();
        console.log('🧪 3色テストパターンを配置しました');
        
        this.activateNaochanTime();
    }
    
    // おぐコンボテスト用パターン設置（緑+青）
    debugOguCombo() {
        console.log('💚💙 デバッグ: おぐコンボテスト用パターン設置');
        console.log(`ボードサイズ: ${this.BOARD_HEIGHT}行 x ${this.BOARD_WIDTH}列`);
        
        // ボードをクリア
        this.debugClear();
        
        // 連鎖パターン: 緑が消えたら青が落ちて消える
        // 青グループ（上段、宙に浮いた状態）
        this.safeSetBlock(5, 1, 3); // 青
        this.safeSetBlock(4, 1, 3); // 青
        this.safeSetBlock(5, 2, 3); // 青
        this.safeSetBlock(4, 2, 3); // 青
        
        // 支えとなる別色ブロック（青を支える）
        this.safeSetBlock(6, 1, 1); // 赤（支え）
        this.safeSetBlock(6, 2, 1); // 赤（支え）
        
        // 緑グループ（底面、最初に消える）
        this.safeSetBlock(8, 0, 2); // 緑
        this.safeSetBlock(7, 0, 2); // 緑
        this.safeSetBlock(8, 1, 2); // 緑
        this.safeSetBlock(7, 1, 2); // 緑
        
        this.render();
        console.log('💚💙 おぐコンボ連鎖パターンを設置。左端にピースを落として緑→青の連鎖を発動してください。');
    }
    
    // なおコンボテスト用パターン設置（赤+黄）
    debugNaoCombo() {
        console.log('❤️💛 デバッグ: なおコンボテスト用パターン設置');
        console.log(`ボードサイズ: ${this.BOARD_HEIGHT}行 x ${this.BOARD_WIDTH}列`);
        
        // ボードをクリア
        this.debugClear();
        
        // 連鎖パターン: 赤が消えたら黄が落ちて消える
        // 黄グループ（上段、宙に浮いた状態）
        this.safeSetBlock(5, 3, 4); // 黄
        this.safeSetBlock(4, 3, 4); // 黄
        this.safeSetBlock(5, 4, 4); // 黄
        this.safeSetBlock(4, 4, 4); // 黄
        
        // 支えとなる別色ブロック（黄を支える）
        this.safeSetBlock(6, 3, 2); // 緑（支え）
        this.safeSetBlock(6, 4, 2); // 緑（支え）
        
        // 赤グループ（底面、最初に消える）
        this.safeSetBlock(8, 2, 1); // 赤
        this.safeSetBlock(7, 2, 1); // 赤
        this.safeSetBlock(8, 3, 1); // 赤
        this.safeSetBlock(7, 3, 1); // 赤
        
        this.render();
        console.log('❤️💛 なおコンボ連鎖パターンを設置。中央にピースを落として赤→黄の連鎖を発動してください。');
    }
    
    // 最強コンボテスト用パターン設置（5色すべて）
    debugSaikyoCombo() {
        console.log('🌈 デバッグ: 最強コンボテスト用パターン設置');
        console.log(`ボードサイズ: ${this.BOARD_HEIGHT}行 x ${this.BOARD_WIDTH}列`);
        
        // ボードをクリア
        this.debugClear();
        
        // 5色連鎖パターン: 赤→緑→青→黄→紫の順で消える
        
        // 紫(5)グループ（最上段、最後に消える）
        this.safeSetBlock(3, 4, 5);
        this.safeSetBlock(2, 4, 5);
        this.safeSetBlock(3, 5, 5);
        this.safeSetBlock(2, 5, 5);
        
        // 黄(4)グループ（4段目）
        this.safeSetBlock(4, 4, 4);
        this.safeSetBlock(4, 5, 4);
        this.safeSetBlock(5, 4, 4);
        this.safeSetBlock(5, 5, 4);
        
        // 青(3)グループ（3段目）
        this.safeSetBlock(6, 2, 3);
        this.safeSetBlock(6, 3, 3);
        this.safeSetBlock(5, 2, 3);
        this.safeSetBlock(5, 3, 3);
        
        // 緑(2)グループ（2段目）
        this.safeSetBlock(7, 0, 2);
        this.safeSetBlock(7, 1, 2);
        this.safeSetBlock(6, 0, 2);
        this.safeSetBlock(6, 1, 2);
        
        // 赤(1)グループ（最下段、最初に消える）
        this.safeSetBlock(8, 0, 1);
        this.safeSetBlock(8, 1, 1);
        this.safeSetBlock(8, 2, 1);
        this.safeSetBlock(8, 3, 1);
        
        this.render();
        console.log('🌈 最強コンボ5色連鎖パターンを設置。左側にピースを落として赤→緑→青→黄→紫の5色連鎖を発動してください。');
        console.log('連鎖順序: 赤(1段目) → 緑(2段目) → 青(3段目) → 黄(4段目) → 紫(5段目)');
    }
    
    // 手動配置モード関連のメソッド
    toggleManualPlaceMode() {
        this.manualPlaceMode = !this.manualPlaceMode;
        const canvas = this.canvas;
        const palette = document.querySelector('.color-palette');
        const manualBtn = document.getElementById('debug-manual-mode');
        const exitBtn = document.getElementById('debug-exit-manual');
        
        if (this.manualPlaceMode) {
            console.log('🎨 手動配置モード開始');
            canvas.classList.add('manual-mode-active', 'manual-mode-cursor');
            palette.style.display = 'block';
            manualBtn.textContent = '配置モード中...';
            manualBtn.style.background = '#ffaa00';
            exitBtn.style.display = 'inline-block';
            
            // ゲームを一時停止
            this.gameRunning = false;
            
            // 選択中の色を表示
            this.updateColorSelection();
        } else {
            this.exitManualPlaceMode();
        }
    }
    
    exitManualPlaceMode() {
        console.log('🎨 手動配置モード終了');
        this.manualPlaceMode = false;
        const canvas = this.canvas;
        const palette = document.querySelector('.color-palette');
        const manualBtn = document.getElementById('debug-manual-mode');
        const exitBtn = document.getElementById('debug-exit-manual');
        
        canvas.classList.remove('manual-mode-active', 'manual-mode-cursor');
        palette.style.display = 'none';
        manualBtn.textContent = '手動配置モード';
        manualBtn.style.background = '';
        exitBtn.style.display = 'none';
    }
    
    selectColor(colorIndex) {
        this.selectedColor = colorIndex;
        this.updateColorSelection();
        console.log(`🎨 選択色変更: ${colorIndex === 0 ? '消去' : `色${colorIndex}`}`);
    }
    
    updateColorSelection() {
        // 全ての色ボタンから選択状態を削除
        for (let i = 0; i <= 5; i++) {
            const btn = document.getElementById(`color-${i}`);
            btn.classList.remove('selected');
        }
        
        // 選択中の色ボタンにハイライト
        const selectedBtn = document.getElementById(`color-${this.selectedColor}`);
        selectedBtn.classList.add('selected');
    }
    
    handleCanvasClick(event) {
        if (!this.manualPlaceMode) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // ピクセル座標をゲーム座標に変換
        const gridX = Math.floor(x / this.CELL_SIZE);
        const gridY = Math.floor(y / this.CELL_SIZE);
        
        // 範囲チェック
        if (gridX >= 0 && gridX < this.BOARD_WIDTH && gridY >= 0 && gridY < this.BOARD_HEIGHT) {
            // ブロックを配置または削除
            this.board[gridY][gridX] = this.selectedColor;
            this.render();
            
            const colorName = this.selectedColor === 0 ? '消去' : 
                             this.selectedColor === 1 ? '赤' :
                             this.selectedColor === 2 ? '緑' :
                             this.selectedColor === 3 ? '青' :
                             this.selectedColor === 4 ? '黄' : '紫';
            
            console.log(`🎨 ブロック配置: (${gridX}, ${gridY}) に ${colorName}`);
        }
    }
    
    // ================================================
    // 🗄️ Firebase & データベース機能
    // ================================================
    async loadRanking() {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '<div class="loading">読み込み中...</div>';
        
        try {
            const snapshot = await db.collection('rankings')
                .orderBy('score', 'desc')
                .limit(10)
                .get();
            
            const rankings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('🔍 Firestoreから取得した生データ:', {
                    docId: doc.id,
                    rawData: data,
                    scoreField: data.score,
                    scoreType: typeof data.score
                });
                rankings.push(data);
            });
            
            console.log('📋 取得したランキング配列:', rankings);
            
            // フォールバック：Firestoreが空の場合はローカルデータも表示
            if (rankings.length === 0) {
                const localRankings = [...localRanking].sort((a, b) => b.score - a.score);
                this.displayRanking(localRankings);
            } else {
                this.displayRanking(rankings);
            }
        } catch (error) {
            console.error('ランキング読み込みエラー:', error);
            // エラー時はローカルデータを表示
            const localRankings = [...localRanking].sort((a, b) => b.score - a.score);
            this.displayRanking(localRankings);
        }
    }
    
    displayRanking(rankings) {
        const rankingList = document.getElementById('ranking-list');
        
        if (rankings.length === 0) {
            rankingList.innerHTML = '<div class="loading">まだランキングがありません</div>';
            return;
        }
        
        console.log('🏆 ランキング表示データ:', rankings);
        
        rankingList.innerHTML = rankings.map((item, index) => {
            // スコアデータの詳細ログ
            console.log(`ランキング${index + 1}位:`, {
                name: item.name,
                score: item.score,
                scoreType: typeof item.score,
                scoreValue: item.score
            });
            
            // スコアが数値でない場合の処理
            const displayScore = (typeof item.score === 'number' && !isNaN(item.score)) 
                ? item.score.toLocaleString() 
                : '0';
            
            return `
                <div class="ranking-item">
                    <span class="ranking-rank">${index + 1}位</span>
                    <span class="ranking-name">${this.escapeHtml(item.name)}</span>
                    <span class="ranking-score">${displayScore}</span>
                </div>
            `;
        }).join('');
    }
    
    async submitScore() {
        const playerName = document.getElementById('player-name').value.trim();
        const submitButton = document.getElementById('submit-score');
        
        if (!playerName) {
            alert('プレイヤー名を入力してください');
            return;
        }
        
        if (playerName.length > 10) {
            alert('プレイヤー名は10文字以内で入力してください');
            return;
        }
        
        submitButton.disabled = true;
        submitButton.textContent = '登録中...';
        
        try {
            // ゲームオーバー時に保存されたスコアを使用
            const gameScore = this.finalScore || this.score;
            const gameChain = this.finalChain || this.chain;
            
            const scoreData = {
                name: playerName,
                score: gameScore,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                maxChain: gameChain,
                difficulty: this.difficulty
            };
            
            console.log('📊 送信するスコアデータ詳細:', {
                name: playerName,
                score: gameScore,
                scoreType: typeof gameScore,
                scoreValue: gameScore,
                maxChain: gameChain,
                difficulty: this.difficulty,
                finalScoreUsed: !!this.finalScore
            });
            console.log('Firestoreに接続中...');
            
            await db.collection('rankings').add(scoreData);
            console.log('Firestoreへの登録成功!');
            
            // 成功時の処理
            this.scoreSubmitted = true;
            alert('スコアを登録しました！');
            
            // スコア登録UIを非表示
            const scoreRegistration = document.getElementById('score-registration');
            scoreRegistration.style.display = 'none';
            
            // ランキングを更新
            await this.loadRanking();
            
        } catch (error) {
            console.error('スコア登録エラー:', error);
            
            // 詳細なエラー判定
            if (error.code === 'permission-denied') {
                alert('スコア登録の権限がありません。管理者にお問い合わせください。');
            } else if (error.code === 'unavailable') {
                alert('現在サーバーに接続できません。後でもう一度お試しください。');
            } else {
                // その他のエラー（ネットワークエラーなど）
                console.log('Firebaseエラー、ローカルに保存します:', error);
                
                // フォールバック：ローカルデータに追加
                const localScoreData = {
                    name: playerName,
                    score: gameScore,
                    timestamp: new Date(),
                    maxChain: gameChain,
                    difficulty: this.difficulty
                };
                localRanking.push(localScoreData);
                
                this.scoreSubmitted = true;
                alert('スコアを登録しました！（ローカル保存）');
                
                // スコア登録UIを非表示
                const scoreRegistration = document.getElementById('score-registration');
                scoreRegistration.style.display = 'none';
                
                await this.loadRanking();
            }
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'スコアを登録';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Firebase接続テスト（改善版）
    async testFirebaseConnection() {
        try {
            console.log('🔍 Firebase接続テスト開始...');
            
            // 基本的な接続テスト（最小限のリクエスト）
            const testRead = await db.collection('comments').limit(1).get();
            console.log('✅ Firestore基本接続成功');
            
            return true;
            
        } catch (error) {
            console.error('❌ Firebase接続テストエラー:', error);
            throw error;
        }
    }
    
    // Firebase接続テスト（旧バージョン・開発用）
    async testFirebaseConnectionFull() {
        try {
            console.log('Firebase詳細接続テスト開始...');
            
            // Firestoreの読み取りテスト
            const testRead = await db.collection('rankings').limit(1).get();
            console.log('✅ Firestore読み取り成功');
            
            // 書き込み権限テスト用のテストデータ
            const testData = {
                name: 'テスト',
                score: 0,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                maxChain: 0,
                difficulty: 'normal'
            };
            
            // 書き込みテスト（実際には追加しない、ルールチェックのみ）
            // テストデータの自動追加を無効化
            console.log('⚠️ テストデータの自動追加は無効化されています');
            console.log('✅ Firebase接続は正常です');
            
        } catch (error) {
            console.error('❌ Firebase接続エラー:', error);
            console.log('Firebase設定またはFirestore設定を確認してください');
        }
    }
    
    // コメント機能
    async sendComment() {
        const commentInput = document.getElementById('comment-input');
        const comment = commentInput.value.trim();
        
        if (!comment) {
            return;
        }
        
        if (comment.length > 50) {
            alert('コメントは50文字以内で入力してください');
            return;
        }
        
        // タイムアウト付きでコメント送信
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('コメント送信がタイムアウトしました')), 10000)
        );
        
        try {
            const commentData = {
                text: comment,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                gameTime: this.time || 0, // ゲーム時間
                score: this.score || 0 // 現在のスコア
            };
            
            // 10秒タイムアウトでコメント送信
            await Promise.race([
                db.collection('comments').add(commentData),
                timeout
            ]);
            
            console.log('コメント送信成功:', comment);
            
            // 入力欄をクリア
            commentInput.value = '';
            
            // 即座に自分のコメントを表示
            this.displayFlyingComment(comment);
            
            // 履歴にも即座に追加（タイムスタンプは現在時刻を仮設定）
            const tempComment = {
                text: comment,
                timestamp: new Date(),
                score: this.score || 0
            };
            this.addCommentToHistory(tempComment);
            
        } catch (error) {
            console.error('コメント送信エラー:', error);
            
            if (error.message.includes('タイムアウト')) {
                alert('コメント送信がタイムアウトしました。ネットワーク接続を確認してください。');
            }
            
            // エラー時でも自分のコメントは表示
            this.displayFlyingComment(comment);
            commentInput.value = '';
        }
    }
    
    startCommentListener() {
        // リアルタイムでコメントを監視
        db.collection('comments')
            .orderBy('timestamp', 'desc')
            .limit(20) // 最新20件
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const comment = change.doc.data();
                        // 新しいコメントのみ表示
                        if (comment.timestamp && comment.text) {
                            this.displayFlyingComment(comment.text);
                            // 履歴にも追加
                            this.addCommentToHistory(comment);
                        }
                    }
                });
            }, (error) => {
                console.error('コメント監視エラー:', error);
            });
    }
    
    async loadCommentHistory() {
        console.log('📚 コメント履歴読み込み開始');
        const commentList = document.getElementById('comment-list');
        
        // 読み込み中表示
        commentList.innerHTML = '<div class="loading">コメント履歴を読み込み中...</div>';
        
        // タイムアウト設定（15秒）
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('コメント履歴の読み込みがタイムアウトしました')), 15000)
        );
        
        try {
            // Firestoreの接続確認
            if (!window.db) {
                throw new Error('Firestore database not initialized');
            }
            
            console.log('🔍 Firestoreからコメントを取得中...');
            
            // まずはorderByなしで試す（インデックスが作成されていない可能性）
            let snapshot;
            try {
                // タイムアウト付きでorderByクエリを実行
                snapshot = await Promise.race([
                    db.collection('comments')
                        .orderBy('timestamp', 'desc')
                        .limit(50)
                        .get(),
                    timeout
                ]);
                console.log('✅ orderByクエリ成功');
            } catch (orderByError) {
                console.warn('⚠️ orderByクエリ失敗、シンプルクエリを試行:', orderByError);
                
                // orderByが失敗した場合はシンプルなクエリで取得（タイムアウト付き）
                const simpleTimeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('シンプルクエリもタイムアウトしました')), 10000)
                );
                
                snapshot = await Promise.race([
                    db.collection('comments')
                        .limit(50)
                        .get(),
                    simpleTimeout
                ]);
                console.log('✅ シンプルクエリ成功');
            }
            
            console.log(`📊 取得したドキュメント数: ${snapshot.size}`);
            
            if (snapshot.empty) {
                console.log('📝 コメントが見つかりません');
                commentList.innerHTML = '<div class="loading">まだコメントがありません</div>';
                return;
            }
            
            // コメントリストをクリア
            commentList.innerHTML = '';
            
            let processedCount = 0;
            snapshot.forEach((doc) => {
                try {
                    const comment = doc.data();
                    console.log(`📄 コメント${processedCount + 1}:`, comment);
                    this.addCommentToHistory(comment, false);
                    processedCount++;
                } catch (docError) {
                    console.error('❌ ドキュメント処理エラー:', docError, doc.id);
                }
            });
            
            console.log(`✅ コメント履歴読み込み完了: ${processedCount}件`);
            
        } catch (error) {
            console.error('❌ コメント履歴読み込みエラー:', error);
            console.error('エラーの詳細:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            
            let errorMessage = '読み込みエラー';
            if (error.message.includes('タイムアウト')) {
                errorMessage = 'コメント履歴の読み込みがタイムアウトしました。ネットワーク接続を確認してください。';
            } else if (error.code === 'failed-precondition') {
                errorMessage = 'インデックスが必要です。Firebase Consoleでインデックスを作成してください。';
            } else if (error.code === 'permission-denied') {
                errorMessage = 'アクセス権限がありません。Firestoreのセキュリティルールを確認してください。';
            } else if (error.message.includes('not initialized')) {
                errorMessage = 'Firebase接続エラー。設定を確認してください。';
            }
            
            commentList.innerHTML = `<div class="loading error">${errorMessage}<br><small>${error.message}</small></div>`;
        }
    }
    
    addCommentToHistory(comment, animate = true) {
        const commentList = document.getElementById('comment-list');
        
        // ローディング表示を削除
        const loading = commentList.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
        
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        
        const commentText = document.createElement('div');
        commentText.className = 'comment-text';
        commentText.textContent = comment.text;
        
        const commentMeta = document.createElement('div');
        commentMeta.className = 'comment-meta';
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'comment-time';
        if (comment.timestamp) {
            let date;
            if (comment.timestamp.toDate) {
                // Firestoreのタイムスタンプ
                date = comment.timestamp.toDate();
            } else if (comment.timestamp instanceof Date) {
                // 通常のDateオブジェクト
                date = comment.timestamp;
            } else {
                date = new Date();
            }
            timeSpan.textContent = date.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            timeSpan.textContent = 'now';
        }
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'comment-score';
        scoreSpan.textContent = `スコア: ${comment.score || 0}`;
        
        commentMeta.appendChild(timeSpan);
        commentMeta.appendChild(scoreSpan);
        
        commentItem.appendChild(commentText);
        commentItem.appendChild(commentMeta);
        
        // 新しいコメントは先頭に追加
        if (animate) {
            commentList.insertBefore(commentItem, commentList.firstChild);
        } else {
            commentList.appendChild(commentItem);
        }
        
        // 50件を超えた場合、古いコメントを削除
        const items = commentList.querySelectorAll('.comment-item');
        if (items.length > 50) {
            items[items.length - 1].remove();
        }
    }
    
    displayFlyingComment(text) {
        const overlay = document.getElementById('comment-overlay');
        const comment = document.createElement('div');
        comment.className = 'flying-comment';
        comment.textContent = text;
        
        // ランダムな垂直位置を設定（画面の20%〜80%の範囲）
        const minY = overlay.clientHeight * 0.2;
        const maxY = overlay.clientHeight * 0.8;
        const randomY = Math.random() * (maxY - minY) + minY;
        comment.style.top = randomY + 'px';
        
        // ランダムな色を設定
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFA07A'];
        comment.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        overlay.appendChild(comment);
        
        // アニメーション終了後に削除
        setTimeout(() => {
            if (comment.parentNode) {
                comment.parentNode.removeChild(comment);
            }
        }, 8000);
    }
    
    // なおちゃん応援システム
    showNaochanSupport(message, subtitle = 'なおちゃんが応援してるよ♪', duration = 3000) {
        const supportElement = document.getElementById('naochan-support');
        const messageElement = document.getElementById('support-message');
        const subtitleElement = document.getElementById('support-subtitle');
        
        messageElement.textContent = message;
        subtitleElement.textContent = subtitle;
        
        // 既存のタイマーをクリア
        if (this.supportTimer) {
            clearTimeout(this.supportTimer);
        }
        
        // 表示
        supportElement.classList.remove('hidden');
        
        // 指定時間後に非表示
        this.supportTimer = setTimeout(() => {
            supportElement.classList.add('hidden');
        }, duration);
    }
    
    // スコアベースの応援システム
    checkSupportTriggers() {
        if (!this.gameRunning) return;
        
        // 連鎖数による応援
        if (this.chain >= 5 && this.chain < 7) {
            this.showNaochanSupport('すごい連鎖！', '5連鎖以上だよ！');
        } else if (this.chain >= 7 && this.chain < 10) {
            this.showNaochanSupport('大連鎖！！', '7連鎖以上！なおちゃん感動♪', 4000);
        } else if (this.chain >= 10) {
            this.showNaochanSupport('神連鎖！！！', '10連鎖以上！なおちゃんびっくり！！', 5000);
        }
        
        // スコアによる応援
        if (this.score >= 50000 && this.score < 100000 && !this.supportTriggered50k) {
            this.showNaochanSupport('5万点突破！', 'いい調子だね～♪');
            this.supportTriggered50k = true;
        } else if (this.score >= 100000 && this.score < 200000 && !this.supportTriggered100k) {
            this.showNaochanSupport('10万点突破！', 'すごいじゃない！');
            this.supportTriggered100k = true;
        } else if (this.score >= 200000 && this.score < 600000 && !this.supportTriggered200k) {
            this.showNaochanSupport('20万点突破！', 'なおちゃんタイム発動！', 4000);
            this.supportTriggered200k = true;
        } else if (this.score >= 600000 && this.score < 1000000 && !this.supportTriggered600k) {
            this.showNaochanSupport('60万点突破！', 'なおちゃんタイム再発動！', 4000);
            this.supportTriggered600k = true;
        } else if (this.score >= 1000000 && !this.supportTriggered1M) {
            this.showNaochanSupport('100万点突破！！', 'なおちゃん超びっくり！！！', 5000);
            this.supportTriggered1M = true;
        }
    }
    
    // なおちゃんチャット機能
    initNaochanChat() {
        this.naochanChatMessages = [
            // ゲーム開始時
            'みんな、ぷよぷよ頑張って～♪',
            'なおちゃんも一緒にプレイするよ！',
            '今日も楽しくぷよぷよしましょ♪',
            
            // 連鎖時
            '3連鎖きた！いいね～',
            '連鎖すごい！',
            'うわー！大連鎖だ！',
            'すごいじゃん！',
            '神連鎖来た！！',
            
            // スコア時
            'スコア伸びてる♪',
            'この調子この調子！',
            '上手だね～',
            
            // なおちゃんタイム時
            'なおちゃんタイム！頑張って！',
            'スコア3倍チャンス！',
            '大連鎖のチャンスだよ～',
            
            // 励まし
            'ドンマイドンマイ！',
            '次頑張ろー！',
            'まだまだこれから！',
            '落ち着いて～',
            
            // 一般的なコメント
            'お疲れ様♪',
            'みんなすごいなぁ',
            '楽しいね～',
            'いい感じ！',
            'ファイト！'
        ];
        
        this.lastNaochanChatTime = 0;
        this.naochanChatInterval = 15000; // 15秒間隔
    }
    
    // なおちゃんが自動でチャット投稿
    sendNaochanChat() {
        const now = Date.now();
        if (now - this.lastNaochanChatTime < this.naochanChatInterval) return;
        
        // ゲーム状況に応じたメッセージを選択
        let messageCategory = [];
        
        if (this.naochanTimeActive) {
            messageCategory = this.naochanChatMessages.slice(15, 18); // なおちゃんタイム関連
        } else if (this.chain >= 5) {
            messageCategory = this.naochanChatMessages.slice(6, 10); // 連鎖関連
        } else if (this.score >= 50000) {
            messageCategory = this.naochanChatMessages.slice(10, 13); // スコア関連
        } else {
            messageCategory = this.naochanChatMessages.slice(20, 25); // 一般的なコメント
        }
        
        const randomMessage = messageCategory[Math.floor(Math.random() * messageCategory.length)];
        
        // なおちゃんからのコメントとして投稿
        this.addComment('なおちゃん', randomMessage);
        
        this.lastNaochanChatTime = now;
    }
    
    // 状況に応じたなおちゃんコメント
    sendContextualNaochanChat(context) {
        let message = '';
        
        switch (context) {
            case 'game_start':
                message = this.naochanChatMessages[Math.floor(Math.random() * 3)];
                break;
            case 'big_chain':
                message = this.naochanChatMessages[6 + Math.floor(Math.random() * 4)];
                break;
            case 'naochan_time':
                message = this.naochanChatMessages[15 + Math.floor(Math.random() * 3)];
                break;
            case 'game_over':
                message = this.naochanChatMessages[18 + Math.floor(Math.random() * 2)];
                break;
            default:
                message = this.naochanChatMessages[20 + Math.floor(Math.random() * 5)];
        }
        
        this.addComment('なおちゃん', message);
    }
    
    // なおちゃん専用コメント機能（リアルタイム表示のみ）
    addComment(author, message) {
        if (!message || message.trim() === '') return;
        
        const trimmedMessage = message.trim().substring(0, 50);
        
        // リアルタイム表示のみ（履歴やFirestoreには保存しない）
        this.displayFlyingComment(`${author}: ${trimmedMessage}`);
    }
    
    // ポーズメニュー表示
    showPauseMenu() {
        console.log('⏸️ ポーズメニューを表示');
        this.gamePaused = true;
        
        const pauseMenu = document.getElementById('pause-menu');
        console.log('📱 Pause menu element:', pauseMenu);
        
        if (pauseMenu) {
            console.log('📱 Removing hidden class from pause menu');
            pauseMenu.classList.remove('hidden');
            console.log('📱 Pause menu classes after removal:', pauseMenu.className);
            this.setupPauseMenuEventListeners();
        } else {
            console.error('❌ Pause menu element not found!');
        }
    }
    
    // ポーズメニュー非表示
    hidePauseMenu() {
        console.log('▶️ ポーズメニューを非表示');
        this.gamePaused = false;
        
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.add('hidden');
        }
    }
    
    // ポーズメニューのイベントリスナー設定
    setupPauseMenuEventListeners() {
        const pauseResume = document.getElementById('pause-resume');
        const pauseTitle = document.getElementById('pause-title');
        const pauseSettings = document.getElementById('pause-settings');
        const pauseRules = document.getElementById('pause-rules');
        const pauseOverlay = document.querySelector('.pause-menu-overlay');
        
        // ゲーム再開
        if (pauseResume) {
            pauseResume.onclick = () => {
                console.log('▶️ ゲーム再開ボタンが押されました');
                this.hidePauseMenu();
                // ゲームを再開
                if (!this.gameRunning) {
                    this.gameRunning = true;
                    console.log('🎮 ゲームループを再開します');
                    this.gameLoop();
                }
            };
        }
        
        // タイトルに戻る
        if (pauseTitle) {
            pauseTitle.onclick = () => {
                this.hidePauseMenu();
                if (window.gameModeManager) {
                    window.gameModeManager.switchToTitleMode();
                }
            };
        }
        
        // 設定（音量調整パネルを表示）
        if (pauseSettings) {
            pauseSettings.onclick = () => {
                alert('設定機能は開発中です。現在は右側パネルの音量設定をご利用ください。');
            };
        }
        
        // ルール説明
        if (pauseRules) {
            pauseRules.onclick = () => {
                this.hidePauseMenu();
                const helpModal = document.getElementById('help-modal');
                if (helpModal) {
                    helpModal.classList.remove('hidden');
                }
            };
        }
        
        // オーバーレイクリックで閉じる
        if (pauseOverlay) {
            pauseOverlay.onclick = () => {
                this.hidePauseMenu();
            };
        }
    }
    
    hideAllScreens() {
        // タイトル画面を非表示
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
        }
        
        // ゲームエリアを非表示（ソロモード用）
        if (this.gameArea) {
            this.gameArea.style.display = 'none';
        }
        
        // コンテナを非表示
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'none';
        }
        
        // 対戦画面を非表示
        if (this.battleScreen) {
            this.battleScreen.style.display = 'none';
        }
        
        // ゲームオーバー画面も非表示
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }
}

// ================================================
// 🚀 ゲーム起動
// ================================================
const game = new PuyoPuyoGame();

// ページ読み込み完了時にフォーカス管理
document.addEventListener('DOMContentLoaded', () => {
    // コメント入力フィールドからフォーカスを外す
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
        commentInput.blur();
    }
    
    // ゲーム画面にフォーカスを当てる
    document.body.focus();
});

// ページがすでに読み込まれている場合の処理
if (document.readyState === 'loading') {
    // DOMContentLoadedイベントを待つ
} else {
    // すでに読み込まれている場合は即座に実行
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
        commentInput.blur();
    }
    document.body.focus();
}

// ヘルプモーダルの制御
document.addEventListener('DOMContentLoaded', () => {
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const helpClose = document.getElementById('help-close');
    
    // ヘルプボタンクリック
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
        });
    }
    
    // 閉じるボタンクリック
    if (helpClose) {
        helpClose.addEventListener('click', () => {
            helpModal.classList.add('hidden');
        });
    }
    
    // モーダル背景クリックで閉じる
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.classList.add('hidden');
            }
        });
    }
    
    // Escキーで閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
            helpModal.classList.add('hidden');
        }
    });
});

// ================================================
// ゲームモード管理システム
// ================================================

class GameModeManager {
    constructor() {
        this.currentMode = 'title'; // 'title', 'solo', 'battle'
        this.game = null; // ソロゲームインスタンス
        this.battleGame = null; // 対戦ゲームインスタンス
        
        // イベントリスナー管理用
        this.eventListeners = [];
        this.boundKeyHandler = null;
        
        this.initializeElements();
        this.setupModeEventListeners();
    }
    
    // イベントリスナーを管理するためのヘルパーメソッド
    addEventListenerWithTracking(element, event, handler, options = false) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
        console.log(`🔗 GameModeManager イベントリスナー追加: ${element.tagName || 'document'} -> ${event}`);
    }
    
    // すべてのイベントリスナーを削除
    removeAllEventListeners() {
        console.log(`🧹 GameModeManager ${this.eventListeners.length}個のイベントリスナーを削除中...`);
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];
        console.log('✅ GameModeManager すべてのイベントリスナーを削除しました');
    }
    
    initializeElements() {
        // スクリーン要素
        this.startScreen = document.getElementById('start-screen');
        this.gameArea = document.querySelector('.game-area');
        this.battleScreen = document.getElementById('battle-screen');
        
        // 初期状態を設定
        if (this.battleScreen) {
            this.battleScreen.style.display = 'none';
        }
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
        }
        
        // タイトルに戻るボタン
        this.backToTitleBtn = document.getElementById('back-to-title');
        
        console.log('🎮 ゲームモード管理システムを初期化しました');
    }
    
    setupModeEventListeners() {
        // 既存のイベントリスナーをクリア
        this.removeAllEventListeners();
        
        // タイトルに戻るボタン
        if (this.backToTitleBtn) {
            this.addEventListenerWithTracking(this.backToTitleBtn, 'click', () => {
                this.switchToTitleMode();
            });
        }
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
            // bodyクラスを title-mode に変更
            document.body.classList.remove('game-mode');
            document.body.classList.add('title-mode');
            document.body.style.display = 'block';
            document.body.style.justifyContent = 'initial';
            document.body.style.alignItems = 'initial';
            // タイトル画面表示時はコンテナを隠す
            const container = document.querySelector('.container');
            if (container) {
                container.style.display = 'none';
            }
        }
        
        // Press Enter Key表示を非表示にして、元の説明文を表示
        if (this.pressEnterInstruction) {
            this.pressEnterInstruction.classList.add('hidden');
        }
        if (this.startInstruction) {
            this.startInstruction.style.display = 'block';
        }
        
        // コンテナの表示を確認
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'flex';
        }
        
        // ゲームを停止
        if (this.game && typeof this.game.resetGame === 'function') {
            this.game.resetGame();
            // ゲームの状態をリセット
            if (this.game.gameRunning) {
                this.game.gameRunning = false;
            }
        }
        if (this.battleGame) {
            this.battleGame.destroy();
            this.battleGame = null;
        }
    }
    
    switchToSoloMode() {
        console.log('🎮 ソロモードに切り替え');
        this.currentMode = 'solo';
        
        // BattleGameインスタンスがある場合は停止
        if (this.battleGame) {
            console.log('🛑 バトルゲームを停止してソロゲームを開始');
            this.battleGame.destroy();
            this.battleGame = null;
        }
        
        // ソロゲームがある場合、イベントリスナーを再設定
        if (this.game) {
            console.log('🔄 ソロゲームのイベントリスナーを再設定');
            this.game.setupEventListeners();
        }
        
        // 全画面を非表示
        this.hideAllScreens();
        
        // bodyのtitle-modeを解除してgame-modeに変更
        document.body.classList.remove('title-mode');
        document.body.classList.add('game-mode');
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        
        // ソロゲーム画面を表示
        if (this.gameArea) {
            this.gameArea.style.display = 'flex';
            this.gameArea.style.visibility = 'visible';
        }
        
        // コンテナの表示を確認
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'flex';
        }
        
        // 従来のEnterキー処理と同じロジックを実行
        setTimeout(() => {
            if (this.game) {
                console.log('🎯 従来のEnterキー処理でソロゲームを開始します');
                
                // コメント入力フィールドからフォーカスを外す（従来の処理と同じ）
                const commentInput = document.getElementById('comment-input');
                if (document.activeElement === commentInput) {
                    console.log('📝 Removing focus from comment input');
                    commentInput.blur();
                }
                
                // 従来のstartGame()メソッドを直接呼び出し
                this.game.startGame();
                console.log('✅ 従来のstartGame()メソッドを実行しました');
                
            } else {
                console.log('⚠️ ゲームインスタンスが見つかりません');
                // ゲームインスタンスが見つからない場合、window.gameを試行
                if (window.game) {
                    console.log('🔄 window.gameを使用してゲームを開始します');
                    // コメント入力フィールドからフォーカスを外す
                    const commentInput = document.getElementById('comment-input');
                    if (document.activeElement === commentInput) {
                        commentInput.blur();
                    }
                    window.game.startGame();
                }
            }
        }, 150);
    }
    
    switchToBattleMode() {
        console.log('⚔️ 対戦モードに切り替え');
        this.currentMode = 'battle';
        
        // ソロゲームが動いている場合は停止してイベントリスナーを削除
        if (this.game) {
            console.log('🛑 ソロゲームを停止して対戦モードを開始');
            if (this.game.gameRunning) {
                this.game.gameRunning = false;
            }
            // ソロゲームのイベントリスナーを削除
            if (this.game.removeAllEventListeners) {
                this.game.removeAllEventListeners();
            }
        }
        
        // bodyのflexboxを一時的に無効化
        document.body.style.display = 'block';
        document.body.style.justifyContent = 'initial';
        document.body.style.alignItems = 'initial';
        
        // 全画面を非表示
        this.hideAllScreens();
        
        // bodyのtitle-modeを解除し、battle-modeクラスも削除
        document.body.classList.remove('title-mode');
        document.body.classList.remove('battle-mode');
        document.body.style.display = 'block';
        document.body.style.justifyContent = 'initial';
        document.body.style.alignItems = 'initial';
        
        // bodyの背景エフェクトを無効化
        document.body.classList.add('battle-mode');
        
        // 対戦画面を表示（新しいクラス対応）
        if (this.battleScreen) {
            // hiddenクラスを削除（存在する場合）
            this.battleScreen.classList.remove('hidden');
            
            // インライン表示設定をクリア
            this.battleScreen.style.display = '';
            this.battleScreen.style.visibility = '';
            this.battleScreen.style.opacity = '';
            
            // 対戦画面を完全に削除して新しく作成
            this.battleScreen.remove();
            
            // 新しい対戦画面を動的に作成
            const newBattleScreen = document.createElement('div');
            newBattleScreen.id = 'battle-screen';
            newBattleScreen.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #1a0f2e 0%, #2d1b3d 50%, #4a2c5a 100%);
                z-index: 9999;
                color: white;
                font-family: Arial, sans-serif;
                display: block;
                overflow: visible;
            `;
            
            // コンテンツを作成
            newBattleScreen.innerHTML = `
                <div style="width: 100%; height: 100%; padding: 20px; box-sizing: border-box; position: relative;">
                    <h1 style="font-size: 3em; text-align: center; margin: 50px 0; color: white; display: block; width: 100%;">⚔️ CPU対戦モード</h1>
                    <button id="back-to-title" onclick="window.gameModeManager.switchToTitleMode()" style="position: absolute; top: 20px; right: 20px; padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; display: block;">🏠 タイトルに戻る</button>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 50px; margin-top: 50px; width: 100%;">
                        <div style="text-align: center; min-width: 200px;">
                            <h3 style="font-size: 1.5em; margin-bottom: 20px; color: white; display: block;">あなた</h3>
                            <div style="width: 200px; height: 400px; background: rgba(0,0,0,0.5); border: 2px solid #44ff44; border-radius: 10px; margin: 0 auto; display: block; position: relative;">
                                <canvas id="player-canvas" width="200" height="400" style="position: absolute; top: 0; left: 0; border-radius: 8px;"></canvas>
                            </div>
                        </div>
                        <div style="text-align: center; min-width: 200px;">
                            <h2 style="font-size: 4em; color: #ffff44; margin-bottom: 20px; display: block;">VS</h2>
                            <div id="time-left" style="background: rgba(255,255,255,0.3); padding: 15px 25px; border-radius: 20px; font-size: 1.5em; color: white; display: block; margin-bottom: 30px;">180秒</div>
                            <button id="battle-start" onclick="this.startBattleGame()" style="padding: 15px 30px; background: #44ff44; color: white; border: none; border-radius: 15px; font-size: 1.2em; cursor: pointer; display: block; margin: 0 auto;">⚡ 対戦開始</button>
                        </div>
                        <div style="text-align: center; min-width: 200px;">
                            <h3 style="font-size: 1.5em; margin-bottom: 20px; color: white; display: block;">CPU</h3>
                            <div style="width: 200px; height: 400px; background: rgba(0,0,0,0.5); border: 2px solid #ff4444; border-radius: 10px; margin: 0 auto; display: block; position: relative;">
                                <canvas id="cpu-canvas" width="200" height="400" style="position: absolute; top: 0; left: 0; border-radius: 8px;"></canvas>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: rgba(255,255,255,0.8); font-size: 1.1em; margin: 20px 0;">対戦開始ボタンを押してCPUとの対戦を始めよう！</p>
                    </div>
                </div>
            `;
            
            // DOMに追加
            document.body.appendChild(newBattleScreen);
            
            // 新しい要素を参照として保存
            this.battleScreen = newBattleScreen;
            
            // 対戦開始ボタンのイベントリスナーを追加
            const battleStartBtn = newBattleScreen.querySelector('#battle-start');
            if (battleStartBtn) {
                battleStartBtn.onclick = () => {
                    this.startBattleGame();
                };
            }
            
            // レンダリングを強制
            newBattleScreen.offsetHeight; // reflow trigger
            
            console.log('✅ 新しい対戦画面を動的作成しました');
            
            console.log('✅ 新しい対戦画面を表示しました');
        } else {
            console.error('❌ 対戦画面要素が見つかりません');
        }
        
        // 少し遅延してから対戦ゲームを初期化
        setTimeout(() => {
            if (!this.battleGame) {
                this.battleGame = new BattleGame();
                console.log('✅ 新しい対戦ゲームを作成しました');
            } else {
                console.log('✅ 既存の対戦ゲームを使用します');
            }
        }, 100);
    }
    
    setGameInstance(gameInstance) {
        this.game = gameInstance;
        console.log('🎯 ゲームインスタンスを設定しました');
    }
    
    hideAllScreens() {
        // タイトル画面を非表示
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
        }
        
        // ゲームエリアを非表示（ソロモード用）
        if (this.gameArea) {
            this.gameArea.style.display = 'none';
        }
        
        // コンテナを非表示
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'none';
        }
        
        // 対戦画面を非表示
        if (this.battleScreen) {
            this.battleScreen.style.display = 'none';
        }
        
        // ゲームオーバー画面も非表示
        const gameOverScreen = document.getElementById('game-over');
        if (gameOverScreen) {
            gameOverScreen.classList.add('hidden');
        }
    }
    
    startBattleGame() {
        console.log('⚡ 対戦ゲーム開始...');
        try {
            // 対戦ゲームが既に存在する場合は削除
            if (this.battleGame) {
                this.battleGame.destroy();
                this.battleGame = null;
            }
            
            // 対戦開始ボタンを隠す
            const battleStartBtn = document.getElementById('battle-start');
            if (battleStartBtn) {
                battleStartBtn.style.display = 'none';
                console.log('✅ 対戦開始ボタンを非表示にしました');
            }
            
            // 対戦開始の説明文を更新
            const instructionText = document.querySelector('#battle-screen div[style*="text-align: center"] p');
            if (instructionText) {
                instructionText.textContent = '対戦が開始されました！180秒間でより多くの得点を目指そう！';
            }
            
            // 少し遅延してから対戦ゲームを作成（キャンバスが確実に存在するまで待つ）
            setTimeout(() => {
                // 新しい対戦ゲームを作成
                this.battleGame = new BattleGame();
                console.log('✅ 新しい対戦ゲームを作成しました');
                
                // 対戦ゲームのキャンバスを再初期化
                this.battleGame.initializeElements();
                this.battleGame.initializeCanvas();
                
                // 実際に対戦を開始
                setTimeout(() => {
                    this.battleGame.startBattle();
                    console.log('🎮 対戦ゲーム開始処理完了');
                }, 100);
                
            }, 100);
            
        } catch (error) {
            console.error('❌ 対戦ゲーム開始エラー:', error);
        }
    }
}

// ================================================
// 対戦ゲームプロトタイプクラス
// ================================================

class BattleGame {
    constructor() {
        console.log('⚔️ 対戦ゲーム本格版を初期化中...');
        
        this.playerCanvas = null;
        this.cpuCanvas = null;
        this.playerCtx = null;
        this.cpuCtx = null;
        this.gameRunning = false;
        this.gameLoopRunning = false;
        this.timeLeft = 180; // 3分
        this.timer = null;
        
        this.playerScore = 0;
        this.cpuScore = 0;
        this.cpuLevel = 'normal';
        this.selectedBattleBgm = 'battleBGM.MP3'; // デフォルトの対戦BGM
        this.customBgmAudio = null; // カスタムBGM用のAudio要素
        
        // ゲームボード設定
        this.BOARD_WIDTH = 6;
        this.BOARD_HEIGHT = 12;
        this.CELL_SIZE = 50; // 300px / 6 = 50px (横基準)
        this.GARBAGE_PUYO = 6; // おじゃまぷよの色番号
        
        // プレイヤーとCPUのゲームボード
        this.playerBoard = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.cpuBoard = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        
        // 現在のピース
        this.playerCurrentPiece = null;
        this.cpuCurrentPiece = null;
        this.playerNextPiece = null;
        this.cpuNextPiece = null;
        
        // ゲーム状態
        this.playerGameOver = false;
        this.cpuGameOver = false;
        this.playerLastMoveTime = 0;
        this.cpuLastMoveTime = 0;
        this.fallSpeed = 800; // 0.8秒（高速化）
        
        // 連鎖とおじゃまぷよ
        this.playerChainCount = 0;
        this.cpuChainCount = 0;
        this.playerPendingGarbage = 0; // 送られる予定のおじゃまぷよ
        this.cpuPendingGarbage = 0;
        
        // ぷよ画像（既存のゲームから使用）
        this.puyoImages = [];
        
        this.initializeElements();
        this.setupEventListeners();
        
        // 少し遅延を入れてからキャンバス初期化
        setTimeout(() => {
            this.initializeCanvas();
            this.showPrototypeMessage();
            
            // 初期描画
            setTimeout(() => {
                this.drawGameBoard('player');
                this.drawGameBoard('cpu');
                console.log('🎨 初期ゲームボード描画完了');
            }, 100);
        }, 200);
    }
    
    initializeElements() {
        // キャンバス要素
        this.playerCanvas = document.getElementById('player-canvas');
        this.cpuCanvas = document.getElementById('cpu-canvas');
        
        // UI要素
        this.battleStartBtn = document.getElementById('battle-start');
        this.battlePauseBtn = document.getElementById('battle-pause');
        this.timeLeftDisplay = document.getElementById('time-left');
        this.playerScoreDisplay = document.getElementById('player-score');
        this.cpuScoreDisplay = document.getElementById('cpu-score');
        this.cpuLevelSelect = document.getElementById('cpu-level');
        
        console.log('🎯 対戦モード要素を初期化しました');
    }
    
    setupEventListeners() {
        // 対戦開始ボタン
        if (this.battleStartBtn) {
            this.battleStartBtn.addEventListener('click', () => {
                this.startBattle();
            });
        }
        
        // 一時停止ボタン
        if (this.battlePauseBtn) {
            this.battlePauseBtn.addEventListener('click', () => {
                this.pauseBattle();
            });
        }
        
        // CPU難易度変更
        if (this.cpuLevelSelect) {
            this.cpuLevelSelect.addEventListener('change', (e) => {
                this.cpuLevel = e.target.value;
                this.adjustAIDifficulty();
                console.log(`🤖 CPU難易度を${this.cpuLevel}に変更`);
            });
        }
        
        // 音量調整スライダー
        this.setupVolumeControls();
        
        // BGM選択機能を設定
        this.setupBattleBgmSelector();
        
        // プレイヤーのキーボード操作
        this.boundKeyHandler = (e) => this.handlePlayerInput(e);
        document.addEventListener('keydown', this.boundKeyHandler);
    }
    
    setupVolumeControls() {
        // BGM音量スライダー
        const bgmVolumeSlider = document.getElementById('battle-bgm-volume');
        const bgmVolumeDisplay = document.getElementById('battle-bgm-volume-display');
        
        if (bgmVolumeSlider && bgmVolumeDisplay) {
            bgmVolumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value;
                bgmVolumeDisplay.textContent = `${volume}%`;
                this.updateBgmVolume(volume);
                console.log(`🎵 対戦モード BGM音量: ${volume}%`);
            });
            
            // 初期値を設定
            bgmVolumeDisplay.textContent = `${bgmVolumeSlider.value}%`;
        }
        
        // SE音量スライダー
        const seVolumeSlider = document.getElementById('battle-se-volume');
        const seVolumeDisplay = document.getElementById('battle-se-volume-display');
        
        if (seVolumeSlider && seVolumeDisplay) {
            seVolumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value;
                seVolumeDisplay.textContent = `${volume}%`;
                this.updateSeVolume(volume);
                console.log(`🔊 対戦モード SE音量: ${volume}%`);
            });
            
            // 初期値を設定
            seVolumeDisplay.textContent = `${seVolumeSlider.value}%`;
        }
        
        console.log('🎛️ 対戦モード音量コントロールを初期化しました');
    }
    
    // 対戦モードBGM選択機能を設定
    setupBattleBgmSelector() {
        const battleBgmSelect = document.getElementById('battle-bgm-select');
        if (battleBgmSelect) {
            battleBgmSelect.addEventListener('change', (e) => {
                this.selectedBattleBgm = e.target.value;
                console.log('🎵 対戦モードBGM変更:', this.selectedBattleBgm);
                
                // ゲーム中の場合はBGMを即座に切り替え
                if (this.gameRunning && this.currentBgm) {
                    this.switchBattleBgm();
                }
            });
        }
    }
    
    // 対戦モードBGMを動的に切り替え
    switchBattleBgm() {
        // 現在のBGMを停止
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }
        
        // カスタムBGM用のAudio要素を作成または更新
        if (this.customBgmAudio) {
            this.customBgmAudio.pause();
            this.customBgmAudio = null;
        }
        
        // 選択されたBGMに基づいてAudio要素を設定
        const battleBgm = document.getElementById('battle-bgm');
        if (this.selectedBattleBgm === 'battleBGM.MP3') {
            this.currentBgm = battleBgm;
        } else {
            // カスタムBGM用のAudio要素を作成
            this.customBgmAudio = new Audio(`music/${this.selectedBattleBgm}`);
            this.customBgmAudio.loop = true;
            this.customBgmAudio.volume = this.bgmVolume || 0.5;
            this.currentBgm = this.customBgmAudio;
        }
        
        // 新しいBGMを再生
        if (this.currentBgm) {
            this.currentBgm.play().catch(e => {
                console.log('対戦BGM切り替え再生エラー:', e);
            });
            console.log('🎵 対戦BGM切り替え完了:', this.selectedBattleBgm);
        }
    }
    
    // 選択された対戦BGMを開始
    startSelectedBattleBgm() {
        // 既存のBGMを停止
        if (this.currentBgm) {
            this.currentBgm.pause();
            this.currentBgm.currentTime = 0;
        }
        if (this.customBgmAudio) {
            this.customBgmAudio.pause();
            this.customBgmAudio = null;
        }
        
        // 選択されたBGMに基づいてAudio要素を設定
        const battleBgm = document.getElementById('battle-bgm');
        if (this.selectedBattleBgm === 'battleBGM.MP3') {
            this.currentBgm = battleBgm;
        } else {
            // カスタムBGM用のAudio要素を作成
            this.customBgmAudio = new Audio(`music/${this.selectedBattleBgm}`);
            this.customBgmAudio.loop = true;
            this.customBgmAudio.volume = this.bgmVolume || 0.5;
            this.currentBgm = this.customBgmAudio;
        }
        
        // BGMを再生
        if (this.currentBgm) {
            this.currentBgm.play().catch(e => {
                console.log('対戦BGM auto-play blocked:', e);
            });
            console.log('🎵 選択された対戦BGM開始:', this.selectedBattleBgm);
        }
    }
    
    updateBgmVolume(volume) {
        const volumeValue = Math.max(0.3, volume / 100); // 最低30%保証
        
        // 対戦モード専用BGMがある場合は調整
        const battleBgm = document.getElementById('battle-bgm');
        if (battleBgm) {
            battleBgm.volume = volumeValue;
        }
        
        // カスタムBGMがある場合は調整
        if (this.customBgmAudio) {
            this.customBgmAudio.volume = volumeValue;
        }
        
        // 既存のBGMも調整
        const gameBgm = document.getElementById('game-bgm');
        const gameBgm2 = document.getElementById('game-bgm-2');
        const naochanBgm = document.getElementById('naochan-bgm');
        
        if (gameBgm) gameBgm.volume = volumeValue;
        if (gameBgm2) gameBgm2.volume = volumeValue;
        if (naochanBgm) naochanBgm.volume = volumeValue;
        
        this.bgmVolume = volumeValue;
        console.log(`🔊 対戦モード BGM音量を${Math.round(volumeValue * 100)}%に設定`);
    }
    
    updateSeVolume(volume) {
        const volumeValue = Math.max(0.3, volume / 100); // 最低30%保証
        
        // 全てのSE要素の音量を調整
        const seElements = [
            'se-move', 'se-rotate', 'se-clear', 'se-chain2', 'se-chain3', 'se-chain4'
        ];
        
        seElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.volume = volumeValue;
            }
        });
    }
    
    startBattleBgm() {
        // 他のBGMを停止
        this.stopAllBgm();
        
        // 選択された対戦BGMを開始
        this.startSelectedBattleBgm();
    }
    
    
    stopBattleBgm() {
        const battleBgm = document.getElementById('battle-bgm');
        if (battleBgm) {
            battleBgm.pause();
            battleBgm.currentTime = 0;
            console.log('🔇 対戦モードBGMを停止');
        }
    }
    
    handlePlayerInput(e) {
        // Escape キーでタイトルに戻る処理（常に有効）
        if (e.key === 'Escape') {
            console.log('🏠 Battle mode Escape key pressed - returning to title');
            if (window.gameModeManager) {
                e.preventDefault();
                e.stopPropagation();
                
                // 対戦ゲームを停止
                this.gameRunning = false;
                this.gameLoopRunning = false;
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
                
                // タイトルに戻る
                window.gameModeManager.switchToTitleMode();
                return;
            }
        }
        
        // 対戦モードでない場合は処理しない
        if (!this.gameRunning || !this.playerCurrentPiece || this.playerGameOver) {
            return;
        }
        
        // 対戦画面が表示されている場合のみ処理
        const battleScreen = document.getElementById('battle-screen');
        if (!battleScreen || battleScreen.classList.contains('hidden')) {
            return;
        }
        
        console.log(`🎮 対戦モード キー入力: ${e.key}`);
        
        switch(e.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                this.movePlayerPiece(-1, 0);
                e.preventDefault();
                e.stopPropagation();
                break;
            case 'd':
            case 'arrowright':
                this.movePlayerPiece(1, 0);
                e.preventDefault();
                e.stopPropagation();
                break;
            case 's':
            case 'arrowdown':
                this.movePlayerPiece(0, 1);
                e.preventDefault();
                e.stopPropagation();
                break;
            case ' ':
                this.rotatePlayerPiece();
                e.preventDefault();
                e.stopPropagation();
                break;
            case 'enter':
                this.toggleBattlePause();
                e.preventDefault();
                e.stopPropagation();
                break;
        }
    }
    
    movePlayerPiece(dx, dy) {
        if (!this.playerCurrentPiece || this.playerCurrentPiece.isSeparated) return;
        
        const newX = this.playerCurrentPiece.x + dx;
        const newY = this.playerCurrentPiece.y + dy;
        
        if (this.isValidPosition('player', newX, newY, this.playerCurrentPiece.positions)) {
            this.playerCurrentPiece.x = newX;
            this.playerCurrentPiece.y = newY;
            this.drawGameBoard('player');
            
            // 左右移動の場合のみ移動音を再生
            if (dx !== 0) {
                this.playSound('move');
            }
        } else if (dy > 0) {
            // 下移動で衝突した場合、部分着地をチェック
            this.handlePlayerPieceLanding();
        }
    }
    
    handlePlayerPieceLanding() {
        if (!this.playerCurrentPiece) return;
        
        // 各ピースが個別に着地できるかチェック
        const piece = this.playerCurrentPiece;
        const landablePositions = [];
        const floatingPositions = [];
        
        for (let i = 0; i < piece.positions.length; i++) {
            const pos = piece.positions[i];
            const worldX = piece.x + pos.x;
            const worldY = piece.y + pos.y + 1; // 一つ下をチェック
            
            // 下に移動できない（着地する）かチェック
            if (worldY >= this.BOARD_HEIGHT || 
                (worldY >= 0 && this.playerBoard[worldY][worldX] !== 0)) {
                landablePositions.push(i);
            } else {
                floatingPositions.push(i);
            }
        }
        
        if (landablePositions.length > 0 && floatingPositions.length > 0) {
            // 部分着地 - ピースを分離
            this.separatePlayerPiece(landablePositions, floatingPositions);
        } else {
            // 全て同時に着地
            this.landPlayerPiece();
        }
    }
    
    separatePlayerPiece(landableIndices, floatingIndices) {
        if (!this.playerCurrentPiece) return;
        
        console.log('✂️ プレイヤーピースを分離します');
        
        const piece = this.playerCurrentPiece;
        
        // 着地するピースをボードに配置
        for (const i of landableIndices) {
            const pos = piece.positions[i];
            const x = piece.x + pos.x;
            const y = piece.y + pos.y;
            
            if (y >= 0 && y < this.BOARD_HEIGHT && x >= 0 && x < this.BOARD_WIDTH) {
                this.playerBoard[y][x] = piece.colors[i];
            }
        }
        
        // 浮いているピースを新しい落下ピースとして作成
        const floatingPieces = [];
        for (const i of floatingIndices) {
            const pos = piece.positions[i];
            floatingPieces.push({
                x: piece.x + pos.x,
                y: piece.y + pos.y,
                color: piece.colors[i],
                fallSpeed: 100 // 高速落下
            });
        }
        
        // 現在のピースをクリア
        this.playerCurrentPiece = null;
        
        // 分離されたピースを順次落下させる
        this.dropSeparatedPieces('player', floatingPieces);
    }
    
    dropSeparatedPieces(player, pieces) {
        if (pieces.length === 0) {
            // 全て落下完了 - 連鎖チェックして新しいピース生成
            if (player === 'player') {
                this.checkPlayerChains();
                
                if (!this.checkGameOver('player')) {
                    this.spawnNewPiece('player');
                }
            } else {
                this.checkCpuChains();
                
                if (!this.checkGameOver('cpu')) {
                    this.spawnNewPiece('cpu');
                }
            }
            return;
        }
        
        console.log(`⬇️ ${pieces.length}個の分離ピースを落下中...`);
        
        const board = player === 'player' ? this.playerBoard : this.cpuBoard;
        let allLanded = true;
        
        // 各分離ピースを1マス下に移動
        for (const piece of pieces) {
            const newY = piece.y + 1;
            
            if (newY < this.BOARD_HEIGHT && board[newY][piece.x] === 0) {
                // まだ落下可能
                piece.y = newY;
                allLanded = false;
            } else {
                // 着地
                if (piece.y >= 0 && piece.y < this.BOARD_HEIGHT) {
                    board[piece.y][piece.x] = piece.color;
                }
                
                // 落下完了したピースを配列から除去
                const index = pieces.indexOf(piece);
                pieces.splice(index, 1);
            }
        }
        
        this.drawGameBoard(player);
        
        // まだ落下中のピースがある場合は継続
        if (pieces.length > 0) {
            setTimeout(() => {
                this.dropSeparatedPieces(player, pieces);
            }, 100);
        } else {
            // 全て着地完了
            console.log(`🎯 ${player} 分離ピース落下完了 - チェーンと新しいピース生成開始`);
            
            if (player === 'player') {
                this.checkPlayerChains();
                
                if (!this.checkGameOver('player')) {
                    this.spawnNewPiece('player');
                    console.log(`✅ ${player} 分離完了後に新しいピース生成`);
                } else {
                    console.log(`🚫 ${player} ゲームオーバーのため分離完了後のピース生成をスキップ`);
                }
            } else {
                this.checkCpuChains();
                
                if (!this.checkGameOver('cpu')) {
                    this.spawnNewPiece('cpu');
                    console.log(`✅ ${player} 分離完了後に新しいピース生成`);
                } else {
                    console.log(`🚫 ${player} ゲームオーバーのため分離完了後のピース生成をスキップ`);
                }
            }
            
            console.log(`🔄 ${player} 分離ピース処理完全終了`);
        }
    }
    
    rotatePlayerPiece() {
        if (!this.playerCurrentPiece) return;
        
        const positions = this.playerCurrentPiece.positions;
        if (positions.length === 2) {
            // 元の位置を保存
            const originalPositions = positions.map(pos => ({...pos}));
            
            // 90度回転: (x, y) -> (-y, x)
            // ただし、基準点（positions[0]）を中心に回転
            const basePos = positions[0];
            for (let i = 1; i < positions.length; i++) {
                const relativeX = positions[i].x - basePos.x;
                const relativeY = positions[i].y - basePos.y;
                
                // 90度回転
                positions[i].x = basePos.x - relativeY;
                positions[i].y = basePos.y + relativeX;
            }
            
            // 回転後の位置が有効かチェック（壁キック付き）
            let rotationSuccessful = false;
            
            // まず元の位置で試行
            if (this.isValidPosition('player', this.playerCurrentPiece.x, this.playerCurrentPiece.y, positions)) {
                rotationSuccessful = true;
            } else {
                // 壁キック：左右に1マス移動して試行
                const kickOffsets = [-1, 1, -2, 2]; // 左右の移動オフセット
                
                for (const offset of kickOffsets) {
                    const newX = this.playerCurrentPiece.x + offset;
                    if (this.isValidPosition('player', newX, this.playerCurrentPiece.y, positions)) {
                        this.playerCurrentPiece.x = newX;
                        rotationSuccessful = true;
                        console.log(`🔄 壁キック成功: ${offset > 0 ? '右' : '左'}に${Math.abs(offset)}マス移動`);
                        break;
                    }
                }
            }
            
            if (rotationSuccessful) {
                this.drawGameBoard('player');
                this.playSound('rotate');
                console.log('🔄 プレイヤーピースを回転しました');
            } else {
                // 元に戻す
                for (let i = 0; i < positions.length; i++) {
                    positions[i] = originalPositions[i];
                }
                console.log('⚠️ 回転できませんでした（壁キックも失敗）');
            }
        }
    }
    
    isValidPosition(player, x, y, positions) {
        const board = player === 'player' ? this.playerBoard : this.cpuBoard;
        
        for (const pos of positions) {
            const checkX = x + pos.x;
            const checkY = y + pos.y;
            
            // 境界チェック
            if (checkX < 0 || checkX >= this.BOARD_WIDTH || checkY >= this.BOARD_HEIGHT) {
                return false;
            }
            
            // ボード上の衝突チェック（y < 0は画面外なのでOK）
            if (checkY >= 0 && board[checkY][checkX] !== 0) {
                return false;
            }
        }
        
        return true;
    }
    
    landPlayerPiece() {
        if (!this.playerCurrentPiece) return;
        
        // ピースをボードに固定
        for (let i = 0; i < this.playerCurrentPiece.positions.length; i++) {
            const pos = this.playerCurrentPiece.positions[i];
            const x = this.playerCurrentPiece.x + pos.x;
            const y = this.playerCurrentPiece.y + pos.y;
            
            if (y >= 0 && y < this.BOARD_HEIGHT && x >= 0 && x < this.BOARD_WIDTH) {
                this.playerBoard[y][x] = this.playerCurrentPiece.colors[i];
            }
        }
        
        // 連鎖チェック
        this.checkPlayerChains();
        
        // ゲームオーバーチェック
        if (this.checkGameOver('player')) {
            this.endGame('cpu');
            return;
        }
        
        // 新しいピースをスポーン
        this.spawnNewPiece('player');
        this.drawGameBoard('player');
        
        console.log('🔒 プレイヤーのピースが着地しました');
    }
    
    initializeCanvas() {
        console.log('🎨 対戦モードキャンバスを初期化中...');
        
        if (this.playerCanvas) {
            this.playerCtx = this.playerCanvas.getContext('2d');
            console.log('✅ プレイヤーキャンバス初期化完了');
        } else {
            console.error('❌ プレイヤーキャンバスが見つかりません');
        }
        
        if (this.cpuCanvas) {
            this.cpuCtx = this.cpuCanvas.getContext('2d');
            console.log('✅ CPUキャンバス初期化完了');
        } else {
            console.error('❌ CPUキャンバスが見つかりません');
        }
        
        // キャンバスのサイズとスタイルを確認
        if (this.playerCanvas) {
            console.log(`📐 プレイヤーキャンバス: ${this.playerCanvas.width}x${this.playerCanvas.height}`);
        }
        if (this.cpuCanvas) {
            console.log(`📐 CPUキャンバス: ${this.cpuCanvas.width}x${this.cpuCanvas.height}`);
        }
        
        // 画像を既存のゲームから取得
        this.initializePuyoImages();
        
        // CPU AIシステムを初期化
        this.initializeCpuAI();
        
        // 初期ピースを生成
        this.generateNextPiece('player');
        this.generateNextPiece('cpu');
        this.spawnNewPiece('player');
        this.spawnNewPiece('cpu');
        
        // 次のぷよ表示を初期化
        setTimeout(() => {
            this.renderBattleNextPuyo();
        }, 300);
    }
    
    initializePuyoImages() {
        // 既存のゲームから画像を取得
        if (window.game && window.game.puyoImages) {
            this.puyoImages = window.game.puyoImages;
            console.log('✅ ぷよ画像を既存ゲームから取得しました');
        } else {
            console.warn('⚠️ 既存ゲームの画像が見つかりません。色のみで描画します。');
        }
    }
    
    generateNextPiece(player) {
        const color1 = Math.floor(Math.random() * 5) + 1;
        const color2 = Math.floor(Math.random() * 5) + 1;
        
        const piece = {
            colors: [color1, color2],
            positions: [{x: 0, y: 0}, {x: 0, y: 1}]
        };
        
        if (player === 'player') {
            this.playerNextPiece = piece;
        } else {
            this.cpuNextPiece = piece;
        }
        
        console.log(`🎲 ${player} の次のピース生成: [${color1}, ${color2}]`);
    }
    
    spawnNewPiece(player) {
        const isPlayer = player === 'player';
        const nextPiece = isPlayer ? this.playerNextPiece : this.cpuNextPiece;
        
        if (nextPiece) {
            const newPiece = {
                x: Math.floor(this.BOARD_WIDTH / 2) - 1,
                y: -1,
                colors: [...nextPiece.colors],
                positions: nextPiece.positions.map(pos => ({...pos}))
            };
            
            if (isPlayer) {
                this.playerCurrentPiece = newPiece;
            } else {
                this.cpuCurrentPiece = newPiece;
            }
            
            console.log(`🟡 ${player} に新しいピースをスポーン: [${newPiece.colors.join(', ')}]`);
        }
        
        this.generateNextPiece(player);
        this.renderBattleNextPuyo();
    }
    
    drawGameBoard(player) {
        const isPlayer = player === 'player';
        const ctx = isPlayer ? this.playerCtx : this.cpuCtx;
        const board = isPlayer ? this.playerBoard : this.cpuBoard;
        const currentPiece = isPlayer ? this.playerCurrentPiece : this.cpuCurrentPiece;
        
        if (!ctx) return;
        
        // 背景をクリア
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // グリッド線を描画
        this.drawGrid(ctx);
        
        // ボード上のぷよを描画
        this.drawBoardPuyos(ctx, board);
        
        // 現在落下中のピースを描画
        if (currentPiece) {
            this.drawCurrentPiece(ctx, currentPiece);
        }
    }
    
    drawGrid(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // 縦線
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            const xPos = x * this.CELL_SIZE;
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, this.BOARD_HEIGHT * this.CELL_SIZE);
            ctx.stroke();
        }
        
        // 横線
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            const yPos = y * this.CELL_SIZE;
            ctx.beginPath();
            ctx.moveTo(0, yPos);
            ctx.lineTo(this.BOARD_WIDTH * this.CELL_SIZE, yPos);
            ctx.stroke();
        }
    }
    
    drawBoardPuyos(ctx, board) {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                const color = board[y][x];
                if (color > 0) {
                    this.drawPuyo(ctx, x, y, color);
                }
            }
        }
    }
    
    drawCurrentPiece(ctx, piece) {
        if (!piece) return;
        
        for (let i = 0; i < piece.positions.length; i++) {
            const pos = piece.positions[i];
            const x = piece.x + pos.x;
            const y = piece.y + pos.y;
            const color = piece.colors[i];
            
            if (y >= 0) { // 画面内のみ描画
                this.drawPuyo(ctx, x, y, color);
            }
        }
    }
    
    // 対戦モード用：角の丸い四角形を描画
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    drawPuyo(ctx, x, y, color) {
        const xPos = x * this.CELL_SIZE;
        const yPos = y * this.CELL_SIZE;
        
        // 画像がある場合は画像を使用、なければ色で描画
        if (this.puyoImages && this.puyoImages[color]) {
            // 丸い形でクリッピングして画像を描画
            ctx.save();
            this.roundRect(ctx, xPos, yPos, this.CELL_SIZE, this.CELL_SIZE, 8);
            ctx.clip();
            ctx.drawImage(this.puyoImages[color], xPos, yPos, this.CELL_SIZE, this.CELL_SIZE);
            ctx.restore();
        } else {
            // フォールバック：色で丸い形状を描画
            const colors = ['', '#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#888888']; // 6番目はおじゃまぷよ（灰色）
            ctx.fillStyle = colors[color] || '#FFFFFF';
            
            // 丸い形状を描画
            this.roundRect(ctx, xPos, yPos, this.CELL_SIZE, this.CELL_SIZE, 8);
            ctx.fill();
            
            // グラデーション効果を追加
            const gradient = ctx.createRadialGradient(
                xPos + this.CELL_SIZE * 0.3, yPos + this.CELL_SIZE * 0.3, 0,
                xPos + this.CELL_SIZE * 0.5, yPos + this.CELL_SIZE * 0.5, this.CELL_SIZE * 0.7
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            
            ctx.fillStyle = gradient;
            this.roundRect(ctx, xPos, yPos, this.CELL_SIZE, this.CELL_SIZE, 8);
            ctx.fill();
            
            // おじゃまぷよの特別な描画
            if (color === this.GARBAGE_PUYO) {
                // X印を描画
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(xPos + 10, yPos + 10);
                ctx.lineTo(xPos + this.CELL_SIZE - 10, yPos + this.CELL_SIZE - 10);
                ctx.moveTo(xPos + this.CELL_SIZE - 10, yPos + 10);
                ctx.lineTo(xPos + 10, yPos + this.CELL_SIZE - 10);
                ctx.stroke();
            }
        }
    }
    
    renderBattleNextPuyo() {
        // プレイヤー側の次のぷよ表示
        this.renderNextPuyoForPlayer('player');
        
        // CPU側の次のぷよ表示
        this.renderNextPuyoForPlayer('cpu');
    }
    
    renderNextPuyoForPlayer(player) {
        const isPlayer = player === 'player';
        const nextPiece = isPlayer ? this.playerNextPiece : this.cpuNextPiece;
        const displayId = isPlayer ? 'player-next-puyo' : 'cpu-next-puyo';
        
        const nextDisplay = document.getElementById(displayId);
        if (!nextDisplay) {
            console.warn(`⚠️ ${player}の次のぷよ表示エリアが見つかりません`);
            return;
        }
        
        nextDisplay.innerHTML = '';
        
        if (nextPiece) {
            // 次のピース表示用のキャンバスを作成
            const canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 120;
            const ctx = canvas.getContext('2d');
            
            // キャンバスのスタイル設定
            canvas.style.border = '2px solid #ffa500';
            canvas.style.borderRadius = '8px';
            canvas.style.backgroundColor = '#222';
            
            for (let i = 0; i < nextPiece.positions.length; i++) {
                const pos = nextPiece.positions[i];
                const x = (pos.x + 1) * 30 + 15; // より大きなサイズで中央配置
                const y = pos.y * 30 + 15;
                
                const colorIndex = nextPiece.colors[i];
                
                // 画像がある場合は画像を描画、なければ色で描画
                if (this.puyoImages && this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
                    // 丸い形でクリッピングして画像を描画
                    ctx.save();
                    this.roundRect(ctx, x, y, 40, 40, 12);
                    ctx.clip();
                    ctx.drawImage(this.puyoImages[colorIndex], x, y, 40, 40);
                    ctx.restore();
                } else {
                    // フォールバック：色で丸い形状を描画
                    const colors = ['', '#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#888888'];
                    ctx.fillStyle = colors[colorIndex] || '#FFFFFF';
                    
                    // 丸い形状を描画
                    this.roundRect(ctx, x, y, 40, 40, 12);
                    ctx.fill();
                    
                    // グラデーション効果を追加
                    const gradient = ctx.createRadialGradient(
                        x + 12, y + 12, 0,
                        x + 20, y + 20, 28
                    );
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
                    
                    ctx.fillStyle = gradient;
                    this.roundRect(ctx, x, y, 40, 40, 12);
                    ctx.fill();
                }
            }
            
            nextDisplay.appendChild(canvas);
            console.log(`✅ ${player}の次のぷよを表示しました`);
        } else {
            // 次のピースがない場合のプレースホルダー
            const placeholder = document.createElement('div');
            placeholder.style.width = '80px';
            placeholder.style.height = '80px';
            placeholder.style.border = '2px solid #555';
            placeholder.style.borderRadius = '8px';
            placeholder.style.backgroundColor = '#222';
            placeholder.style.display = 'flex';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            placeholder.style.color = '#777';
            placeholder.style.fontSize = '12px';
            placeholder.textContent = '---';
            
            nextDisplay.appendChild(placeholder);
        }
    }
    
    showPrototypeMessage() {
        // 実装状況メッセージを表示
        const battleTitle = document.querySelector('.battle-title');
        if (battleTitle) {
            battleTitle.innerHTML = '⚔️ CPU対戦モード <span style="color: #00ff00; font-size: 18px;">[基本機能実装済み]</span>';
        }
        
        // 実装状況メッセージ
        console.log(`
🎮 対戦モード基本機能実装完了 🎮

実装済み機能:
✅ プレイヤー側ゲームロジック
✅ キーボード操作 (A/D: 移動, S: 下移動, Space: 回転)
✅ ピース生成・配置システム
✅ 衝突判定
✅ ゲームボード描画
✅ CPU AI システム（基本）
✅ 自動落下システム

操作方法:
🎮 A/D: 左右移動
🎮 S: 下移動
🎮 Space: 回転
        `);
    }
    
    startBattle() {
        console.log('⚔️ 対戦開始！');
        console.log('📊 初期状態チェック:');
        console.log('- プレイヤーキャンバス:', this.playerCanvas ? 'OK' : 'NG');
        console.log('- CPUキャンバス:', this.cpuCanvas ? 'OK' : 'NG');
        console.log('- プレイヤーコンテキスト:', this.playerCtx ? 'OK' : 'NG');
        console.log('- CPUコンテキスト:', this.cpuCtx ? 'OK' : 'NG');
        console.log('- プレイヤー現在ピース:', this.playerCurrentPiece ? 'OK' : 'NG');
        console.log('- CPU現在ピース:', this.cpuCurrentPiece ? 'OK' : 'NG');
        
        this.gameRunning = true;
        this.playerGameOver = false;
        this.cpuGameOver = false;
        
        // ボタンの切り替え
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.add('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.remove('hidden');
        }
        
        // タイマー開始
        this.startTimer();
        
        // BGM開始
        this.startBattleBgm();
        
        // ゲームループ開始
        this.startGameLoop();
    }
    
    pauseBattle() {
        console.log('⏸️ 対戦一時停止');
        this.gameRunning = false;
        
        // ボタンの切り替え
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.remove('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.add('hidden');
        }
        
        // タイマー停止
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // BGM一時停止
        this.stopBattleBgm();
    }
    
    toggleBattlePause() {
        if (this.gameRunning) {
            console.log('⏸️ 対戦一時停止（Enterキー）');
            this.pauseBattle();
        } else {
            console.log('▶️ 対戦再開（Enterキー）');
            this.resumeBattle();
        }
    }
    
    resumeBattle() {
        console.log('▶️ 対戦再開');
        
        // ゲーム状態を再開に設定
        this.gameRunning = true;
        
        // ボタンの切り替え
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.add('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.remove('hidden');
        }
        
        // 既存のタイマーをクリアしてから再開
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.startTimer();
        
        // BGM再開
        this.startBattleBgm();
        
        // ゲームループを確実に再開
        this.playerLastMoveTime = Date.now();
        this.cpuLastMoveTime = Date.now();
        this.startGameLoop();
        
        console.log('✅ 対戦再開完了');
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeftDisplay) {
                this.timeLeftDisplay.textContent = this.timeLeft;
            }
            
            if (this.timeLeft <= 0) {
                this.endGameByTime();
            }
        }, 1000);
    }
    
    // 対戦モード用：ぷよ連結方向を取得
    getConnectedDirections(x, y, colorIndex, board) {
        const directions = { up: false, down: false, left: false, right: false };
        
        if (y > 0 && board[y - 1][x] === colorIndex) directions.up = true;
        if (y < this.boardHeight - 1 && board[y + 1][x] === colorIndex) directions.down = true;
        if (x > 0 && board[y][x - 1] === colorIndex) directions.left = true;
        if (x < this.boardWidth - 1 && board[y][x + 1] === colorIndex) directions.right = true;
        
        return directions;
    }
    
    // 対戦モード用：爆発エフェクトを作成
    createBattleExplosionEffect(x, y, player) {
        const gameArea = player === 'player' ? document.getElementById('player-canvas') : document.getElementById('cpu-canvas');
        const rect = gameArea.getBoundingClientRect();
        
        const effect = document.createElement('div');
        effect.className = 'battle-explosion-effect';
        effect.style.position = 'absolute';
        effect.style.left = (rect.left + x * 30 + 15) + 'px';
        effect.style.top = (rect.top + y * 30 + 15) + 'px';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 500);
    }
    
    // 対戦モード用：連鎖エフェクトを表示
    showBattleChainEffect(chainCount, player) {
        const gameArea = player === 'player' ? document.getElementById('player-canvas') : document.getElementById('cpu-canvas');
        const rect = gameArea.getBoundingClientRect();
        
        const effect = document.createElement('div');
        effect.className = 'battle-chain-effect';
        effect.textContent = `${chainCount} 連鎖!`;
        effect.style.position = 'absolute';
        effect.style.left = (rect.left + rect.width / 2) + 'px';
        effect.style.top = (rect.top + rect.height / 2) + 'px';
        effect.style.transform = 'translate(-50%, -50%)';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '1000';
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
    }
    
    // 対戦モード用：カットインエフェクトを表示
    showBattleCutinEffect(chainCount, player) {
        if (chainCount < 3) return;
        
        const container = document.querySelector('.battle-arena');
        const effect = document.createElement('div');
        effect.className = 'battle-cutin-effect';
        
        const text = document.createElement('div');
        text.className = 'battle-cutin-text';
        text.textContent = chainCount >= 5 ? '🔥 AMAZING CHAIN! 🔥' : '✨ GREAT CHAIN! ✨';
        
        effect.appendChild(text);
        container.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 2000);
    }
    
    startGameLoop() {
        console.log('🔄 ゲームループを開始');
        
        // 既にゲームループが動いている場合は何もしない
        if (this.gameLoopRunning) {
            console.log('⚠️ ゲームループは既に実行中です');
            return;
        }
        
        this.gameLoopRunning = true;
        
        const gameLoop = () => {
            if (!this.gameRunning) {
                this.gameLoopRunning = false;
                console.log('🛑 ゲームループを停止');
                return;
            }
            
            const currentTime = Date.now();
            
            // フェイルセーフ: CPUピースの存在チェック
            if (!this.cpuGameOver && !this.cpuCurrentPiece && this.cpuChainCount === 0) {
                console.log('🆘 フェイルセーフ: CPUピースが不足 - 強制生成');
                this.spawnNewPiece('cpu');
                this.renderBattleNextPuyo();
            }
            
            // プレイヤーのピース自動落下
            if (currentTime - this.playerLastMoveTime > this.fallSpeed) {
                this.updatePlayerPiece();
                this.playerLastMoveTime = currentTime;
            }
            
            // CPUのピース自動落下（プレイヤーより高速）
            const cpuSpeed = this.fallSpeed * 0.6; // CPUは40%高速
            if (currentTime - this.cpuLastMoveTime > cpuSpeed) {
                this.updateCpuPiece();
                this.cpuLastMoveTime = currentTime;
            }
            
            // 画面描画
            this.drawGameBoard('player');
            this.drawGameBoard('cpu');
            
            if (this.gameRunning && this.gameLoopRunning) {
                requestAnimationFrame(gameLoop);
            } else {
                this.gameLoopRunning = false;
            }
        };
        
        this.playerLastMoveTime = Date.now();
        this.cpuLastMoveTime = Date.now();
        gameLoop();
    }
    
    updatePlayerPiece() {
        if (!this.playerCurrentPiece || this.playerGameOver || this.playerCurrentPiece.isSeparated) return;
        
        // ピースを1つ下に移動
        if (this.isValidPosition('player', this.playerCurrentPiece.x, this.playerCurrentPiece.y + 1, this.playerCurrentPiece.positions)) {
            this.playerCurrentPiece.y++;
        } else {
            // 着地した場合、部分着地をチェック
            this.handlePlayerPieceLanding();
        }
    }
    
    updateCpuPiece() {
        if (!this.cpuCurrentPiece || this.cpuGameOver || this.cpuCurrentPiece.isSeparated) return;
        
        // CPUが新しいピースを受け取った時にAIで最適手を計算
        if (!this.cpuCurrentPiece.aiTarget) {
            const startTime = Date.now();
            const bestMove = this.calculateBestMove();
            const thinkTime = Date.now() - startTime;
            
            // 思考時間が100ms超えた場合は警告
            if (thinkTime > 100) {
                console.warn(`⚠️ CPU思考時間が長すぎます: ${thinkTime}ms`);
            }
            
            if (bestMove) {
                this.cpuCurrentPiece.aiTarget = {
                    targetX: bestMove.x,
                    targetRotation: bestMove.rotation,
                    currentRotation: 0,
                    rotationComplete: bestMove.rotation === 0, // 回転不要なら即完了
                    strategy: bestMove.strategy
                };
                
                console.log(`🤖 CPU AI決定 (${thinkTime}ms): X=${bestMove.x}, 回転=${bestMove.rotation}, 戦略=${bestMove.strategy}, スコア=${bestMove.score ? bestMove.score.toFixed(1) : '不明'}`);
            } else {
                // フォールバック：中央配置
                this.cpuCurrentPiece.aiTarget = {
                    targetX: Math.floor(this.BOARD_WIDTH / 2),
                    targetRotation: 0,
                    currentRotation: 0,
                    rotationComplete: true,
                    strategy: 'fallback'
                };
                console.log('⚠️ CPU AI計算失敗 - フォールバックモード');
            }
        }
        
        const aiTarget = this.cpuCurrentPiece.aiTarget;
        
        // まず回転を完了
        if (!aiTarget.rotationComplete && aiTarget.currentRotation < aiTarget.targetRotation) {
            this.rotateCpuPiece();
            aiTarget.currentRotation++;
            
            if (aiTarget.currentRotation >= aiTarget.targetRotation) {
                aiTarget.rotationComplete = true;
            }
            return;
        }
        
        // 横移動と下移動を同時実行（高速化）
        let horizontalMoveComplete = false;
        let shouldFastDrop = false;
        
        // 目標位置への横移動
        if (aiTarget.rotationComplete && this.cpuCurrentPiece.x !== aiTarget.targetX) {
            const direction = this.cpuCurrentPiece.x < aiTarget.targetX ? 1 : -1;
            
            if (this.isValidPosition('cpu', this.cpuCurrentPiece.x + direction, this.cpuCurrentPiece.y, this.cpuCurrentPiece.positions)) {
                this.cpuCurrentPiece.x += direction;
                
                // 横移動中でも下移動を同時実行
                if (this.isValidPosition('cpu', this.cpuCurrentPiece.x, this.cpuCurrentPiece.y + 1, this.cpuCurrentPiece.positions)) {
                    this.cpuCurrentPiece.y++;
                }
            } else {
                // 移動できない場合は諦めて落下
                aiTarget.targetX = this.cpuCurrentPiece.x;
                horizontalMoveComplete = true;
            }
        } else {
            horizontalMoveComplete = true;
        }
        
        // 目標位置に到達したら高速落下モード
        if (horizontalMoveComplete && aiTarget.rotationComplete) {
            shouldFastDrop = true;
        }
        
        // 高速落下または通常落下
        if (shouldFastDrop) {
            // 高速落下：一度に複数マス落下
            let dropCount = 0;
            const maxDropPerFrame = this.cpuLevel === 'hard' ? 3 : 
                                   this.cpuLevel === 'normal' ? 2 : 1;
            
            while (dropCount < maxDropPerFrame && 
                   this.isValidPosition('cpu', this.cpuCurrentPiece.x, this.cpuCurrentPiece.y + 1, this.cpuCurrentPiece.positions)) {
                this.cpuCurrentPiece.y++;
                dropCount++;
            }
            
            // 着地チェック
            if (!this.isValidPosition('cpu', this.cpuCurrentPiece.x, this.cpuCurrentPiece.y + 1, this.cpuCurrentPiece.positions)) {
                this.handleCpuPieceLanding();
            }
        } else {
            // 通常落下（横移動中でない場合）
            if (horizontalMoveComplete && 
                this.isValidPosition('cpu', this.cpuCurrentPiece.x, this.cpuCurrentPiece.y + 1, this.cpuCurrentPiece.positions)) {
                this.cpuCurrentPiece.y++;
            } else if (horizontalMoveComplete) {
                // 着地した場合、部分着地をチェック
                this.handleCpuPieceLanding();
            }
        }
    }
    
    rotateCpuPiece() {
        if (!this.cpuCurrentPiece) return;
        
        const positions = this.cpuCurrentPiece.positions;
        if (positions.length === 2) {
            // 元の位置を保存
            const originalPositions = positions.map(pos => ({...pos}));
            
            // 90度回転
            const basePos = positions[0];
            for (let i = 1; i < positions.length; i++) {
                const relativeX = positions[i].x - basePos.x;
                const relativeY = positions[i].y - basePos.y;
                
                positions[i].x = basePos.x - relativeY;
                positions[i].y = basePos.y + relativeX;
            }
            
            // 回転後の位置が有効かチェック（壁キック付き）
            let rotationSuccessful = false;
            
            if (this.isValidPosition('cpu', this.cpuCurrentPiece.x, this.cpuCurrentPiece.y, positions)) {
                rotationSuccessful = true;
            } else {
                // 壁キック：左右に移動して試行
                const kickOffsets = [-1, 1, -2, 2];
                
                for (const offset of kickOffsets) {
                    const newX = this.cpuCurrentPiece.x + offset;
                    if (this.isValidPosition('cpu', newX, this.cpuCurrentPiece.y, positions)) {
                        this.cpuCurrentPiece.x = newX;
                        rotationSuccessful = true;
                        break;
                    }
                }
            }
            
            if (!rotationSuccessful) {
                // 元に戻す
                for (let i = 0; i < positions.length; i++) {
                    positions[i] = originalPositions[i];
                }
                console.log('⚠️ CPU回転できませんでした');
            } else {
                console.log('🔄 CPUピースを回転しました');
            }
        }
    }
    
    landCpuPiece() {
        if (!this.cpuCurrentPiece) return;
        
        // ピースをボードに固定
        for (let i = 0; i < this.cpuCurrentPiece.positions.length; i++) {
            const pos = this.cpuCurrentPiece.positions[i];
            const x = this.cpuCurrentPiece.x + pos.x;
            const y = this.cpuCurrentPiece.y + pos.y;
            
            if (y >= 0 && y < this.BOARD_HEIGHT && x >= 0 && x < this.BOARD_WIDTH) {
                this.cpuBoard[y][x] = this.cpuCurrentPiece.colors[i];
            }
        }
        
        // 連鎖チェック
        this.checkCpuChains();
        
        // ゲームオーバーチェック
        if (this.checkGameOver('cpu')) {
            this.endGame('player');
            return;
        }
        
        // 連鎖チェック
        this.checkCpuChains();
        
        // ゲームオーバーでない場合、新しいピースをスポーン
        if (!this.checkGameOver('cpu')) {
            this.spawnNewPiece('cpu');
            this.renderBattleNextPuyo();
            console.log('🤖 CPUのピースが着地しました - 新しいピース生成完了');
        } else {
            console.log('🚫 CPU ゲームオーバーのため新しいピース生成をスキップ');
        }
    }
    
    handleCpuPieceLanding() {
        if (!this.cpuCurrentPiece) return;
        
        // 各ピースが個別に着地できるかチェック
        const piece = this.cpuCurrentPiece;
        const landablePositions = [];
        const floatingPositions = [];
        
        for (let i = 0; i < piece.positions.length; i++) {
            const pos = piece.positions[i];
            const worldX = piece.x + pos.x;
            const worldY = piece.y + pos.y + 1; // 一つ下をチェック
            
            // 下に移動できない（着地する）かチェック
            if (worldY >= this.BOARD_HEIGHT || 
                (worldY >= 0 && this.cpuBoard[worldY][worldX] !== 0)) {
                landablePositions.push(i);
            } else {
                floatingPositions.push(i);
            }
        }
        
        if (landablePositions.length > 0 && floatingPositions.length > 0) {
            // 部分着地 - ピースを分離
            this.separateCpuPiece(landablePositions, floatingPositions);
        } else {
            // 全て同時に着地
            this.landCpuPiece();
        }
    }
    
    separateCpuPiece(landableIndices, floatingIndices) {
        if (!this.cpuCurrentPiece) return;
        
        console.log('✂️ CPUピースを分離します');
        
        const piece = this.cpuCurrentPiece;
        
        // 着地するピースをボードに配置
        for (const i of landableIndices) {
            const pos = piece.positions[i];
            const x = piece.x + pos.x;
            const y = piece.y + pos.y;
            
            if (y >= 0 && y < this.BOARD_HEIGHT && x >= 0 && x < this.BOARD_WIDTH) {
                this.cpuBoard[y][x] = piece.colors[i];
            }
        }
        
        // 浮いているピースを新しい落下ピースとして作成
        const floatingPieces = [];
        for (const i of floatingIndices) {
            const pos = piece.positions[i];
            floatingPieces.push({
                x: piece.x + pos.x,
                y: piece.y + pos.y,
                color: piece.colors[i],
                fallSpeed: 100 // 高速落下
            });
        }
        
        // 現在のピースをクリア
        this.cpuCurrentPiece = null;
        
        // 分離されたピースを順次落下させる
        this.dropSeparatedPieces('cpu', floatingPieces);
    }
    
    // ================================================
    // CPU AI システム
    // ================================================
    
    initializeCpuAI() {
        // AI設定（高度アルゴリズム対応）
        this.useSimpleAI = false; // 重い処理の場合は自動でtrue切り替え
        this.aiConfig = {
            // ビームサーチ設定（軽量化）
            beamWidth: 8,            // ビーム幅を大幅削減
            searchDepth: 2,          // 探索深度を削減  
            monteCarloRuns: 2,       // モンテカルロ試行回数を削減
            
            // 評価関数重み
            chainWeight: 250,        // 連鎖の重みを強化
            heightPenalty: 6,        // 高さペナルティを最適化
            garbageWeight: 60,       // おじゃまぷよ重み
            defenseWeight: 30,       // 防御重み
            
            // 高度評価重み
            chainSetupWeight: 180,   // 連鎖セットアップ
            connectedPuyoWeight: 100, // 連結ぷよ
            chainTriggerWeight: 350, // 連鎖発火
            setupCompleteWeight: 300, // 連鎖準備完了
            
            // 新しい高度評価
            gtrPatternWeight: 400,   // GTRパターン重み
            stairPatternWeight: 200, // 階段積み重み
            chainDepthWeight: 150,   // 連鎖深度重み
            futureChainWeight: 120,  // 将来連鎖可能性
            positionValueWeight: 80  // 位置価値重み
        };
        
        // 連鎖構築パターンを初期化
        this.initializeChainPatterns();
        
        // 高度連鎖パターンを初期化
        this.initializeAdvancedPatterns();
        
        // 難易度に応じてAI設定を調整
        this.adjustAIDifficulty();
        
        console.log('🤖 CPU AI システム（ビームサーチ+モンテカルロ強化版）を初期化しました');
    }
    
    adjustAIDifficulty() {
        switch (this.cpuLevel) {
            case 'easy':
                this.aiConfig.thinkingDepth = 2;
                this.aiConfig.chainWeight = 100;
                this.aiConfig.chainSetupWeight = 80;
                this.aiConfig.chainTriggerWeight = 150;
                this.aiConfig.heightPenalty = 6;
                break;
            case 'normal':
                this.aiConfig.thinkingDepth = 3;
                this.aiConfig.chainWeight = 200;
                this.aiConfig.chainSetupWeight = 150;
                this.aiConfig.chainTriggerWeight = 300;
                this.aiConfig.heightPenalty = 8;
                break;
            case 'hard':
                this.aiConfig.thinkingDepth = 4;
                this.aiConfig.chainWeight = 300;
                this.aiConfig.chainSetupWeight = 250;
                this.aiConfig.chainTriggerWeight = 500;
                this.aiConfig.setupCompleteWeight = 400;
                this.aiConfig.heightPenalty = 10;
                break;
        }
        
        console.log(`🎯 CPU AI難易度: ${this.cpuLevel}`, this.aiConfig);
    }
    
    // 連鎖構築パターンを初期化
    initializeChainPatterns() {
        // 基本的な連鎖パターン（階段積み、鍵積み、GTRなど）
        this.chainPatterns = {
            // 階段積み（基本パターン）
            stairs: [
                {x: 0, y: 0, color: 1}, {x: 1, y: 0, color: 1}, 
                {x: 1, y: 1, color: 2}, {x: 2, y: 1, color: 2},
                {x: 2, y: 2, color: 3}, {x: 3, y: 2, color: 3}
            ],
            // 鍵積み（挟み込みパターン）
            sandwich: [
                {x: 0, y: 0, color: 1}, {x: 2, y: 0, color: 1},
                {x: 1, y: 0, color: 2}, {x: 1, y: 1, color: 2}
            ],
            // GTR（Great Tanaka Rensa）
            gtr: [
                {x: 2, y: 0, color: 1}, {x: 3, y: 0, color: 2},
                {x: 2, y: 1, color: 3}, {x: 3, y: 1, color: 1},
                {x: 2, y: 2, color: 2}, {x: 3, y: 2, color: 3}
            ]
        };
        
        console.log('🧩 連鎖パターンを初期化しました');
    }
    
    // CPUの最適な手を計算（高度アルゴリズム版）
    calculateBestMove() {
        if (!this.cpuCurrentPiece) return null;
        
        const piece = this.cpuCurrentPiece;
        const currentBoard = this.cpuBoard;
        
        // 簡単なAIモードが有効な場合は従来手法を使用
        if (this.useSimpleAI) {
            console.log('🧠 簡単AI思考開始');
            return this.calculateBestMoveFallback();
        }
        
        console.log('🧠 高度AI思考開始（ビームサーチ+モンテカルロ）');
        
        // ビームサーチで最適解を探索
        const beamResult = this.beamSearch(
            currentBoard, 
            this.aiConfig.searchDepth, 
            this.aiConfig.beamWidth
        );
        
        if (beamResult && beamResult.moves.length > 0) {
            const bestMove = beamResult.moves[0];
            bestMove.score = beamResult.score || 0; // スコアを追加（デフォルト0）
            console.log(`🎯 ビームサーチ結果: スコア=${(beamResult.score || 0).toFixed(1)}`);
            return bestMove;
        }
        
        // フォールバック: 従来の評価関数
        console.log('⚠️ ビームサーチ失敗、従来手法を使用');
        return this.calculateBestMoveFallback();
    }
    
    // フォールバック用の従来手法
    calculateBestMoveFallback() {
        if (!this.cpuCurrentPiece) return null;
        
        const piece = this.cpuCurrentPiece;
        let bestMove = null;
        let bestScore = -Infinity;
        
        // 現在のボード状況を分析
        const boardAnalysis = this.analyzeBoardSituation();
        
        // 全ての可能な配置位置を評価
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                const testPiece = this.rotatePiece(piece, rotation);
                
                // その位置に配置可能かチェック
                const dropY = this.findDropPosition('cpu', x, testPiece.positions);
                if (dropY === null) continue;
                
                // ボードに仮配置してスコア評価
                const testBoard = this.simulateMove('cpu', x, dropY, testPiece);
                let score = this.evaluateBoard(testBoard, 'cpu');
                
                // モンテカルロ評価を追加
                const monteCarloScore = this.monteCarloEvaluation(testBoard, this.aiConfig.monteCarloRuns);
                score += monteCarloScore * 0.3; // 30%の重みでモンテカルロスコアを追加
                
                // 状況に応じてスコア調整
                score = this.adjustScoreForSituation(score, testBoard, boardAnalysis);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {
                        x: x,
                        y: dropY,
                        rotation: rotation,
                        score: score,
                        strategy: boardAnalysis.recommendedStrategy
                    };
                }
            }
        }
        
        return bestMove;
    }
    
    // ボード状況を分析して戦略を決定
    analyzeBoardSituation() {
        const cpuBoard = this.cpuBoard;
        const playerBoard = this.playerBoard;
        
        const analysis = {
            garbageCount: this.countGarbagePuyos(cpuBoard),
            averageHeight: this.evaluateHeight(cpuBoard),
            emergencyLevel: 0,
            recommendedStrategy: 'balanced',
            playerThreat: this.evaluatePlayerThreat(playerBoard)
        };
        
        // 緊急度を計算
        if (analysis.averageHeight > 7) {
            analysis.emergencyLevel = 3; // 非常に危険
            analysis.recommendedStrategy = 'defensive';
        } else if (analysis.averageHeight > 5) {
            analysis.emergencyLevel = 2; // 危険
            analysis.recommendedStrategy = 'cleanup';
        } else if (analysis.garbageCount > 10) {
            analysis.emergencyLevel = 1; // 注意
            analysis.recommendedStrategy = 'garbage_clear';
        } else if (analysis.playerThreat > 50) {
            analysis.recommendedStrategy = 'aggressive';
        }
        
        return analysis;
    }
    
    // プレイヤーの脅威度を評価
    evaluatePlayerThreat(playerBoard) {
        const chainAnalysis = this.analyzeAdvancedChainPatterns(playerBoard);
        let threatLevel = 0;
        
        // 即座に発動可能な連鎖
        threatLevel += chainAnalysis.immediateChains * 30;
        
        // 潜在的な長い連鎖
        threatLevel += chainAnalysis.maxChainLength * 10;
        
        // 連鎖の引き金が多い
        threatLevel += chainAnalysis.triggerPositions.length * 5;
        
        return threatLevel;
    }
    
    // 状況に応じてスコアを調整
    adjustScoreForSituation(baseScore, testBoard, boardAnalysis) {
        let adjustedScore = baseScore;
        
        switch (boardAnalysis.recommendedStrategy) {
            case 'defensive':
                // 防御的：高さを下げることを最優先
                const heightReduction = this.evaluateHeight(this.cpuBoard) - this.evaluateHeight(testBoard);
                adjustedScore += heightReduction * 200;
                
                // おじゃまぷよ削除を優先
                const garbageReduction = this.countGarbagePuyos(this.cpuBoard) - this.countGarbagePuyos(testBoard);
                adjustedScore += garbageReduction * 100;
                break;
                
            case 'cleanup':
                // 整理：おじゃまぷよとちょっとした連鎖を狙う
                const garbageClear = this.countGarbagePuyos(this.cpuBoard) - this.countGarbagePuyos(testBoard);
                adjustedScore += garbageClear * 80;
                
                // 小さな連鎖も評価
                const chainAnalysis = this.analyzeAdvancedChainPatterns(testBoard);
                if (chainAnalysis.immediateChains > 0) {
                    adjustedScore += 150;
                }
                break;
                
            case 'garbage_clear':
                // おじゃまぷよ削除特化
                const directGarbageClear = this.evaluateGarbageClearPotential(testBoard);
                adjustedScore += directGarbageClear * 150;
                break;
                
            case 'aggressive':
                // 攻撃的：長い連鎖を狙う
                const offensivePower = this.evaluateOffensivePotential(this.analyzeAdvancedChainPatterns(testBoard));
                adjustedScore += offensivePower * 2;
                break;
                
            case 'balanced':
            default:
                // バランス型：基本スコアを使用
                break;
        }
        
        return adjustedScore;
    }
    
    // おじゃまぷよ削除の可能性を評価
    evaluateGarbageClearPotential(board) {
        let clearPotential = 0;
        
        // おじゃまぷよの隣接に連鎖可能なぷよがあるかチェック
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] === this.GARBAGE_PUYO) {
                    // 隣接する4方向をチェック
                    const directions = [{x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}];
                    
                    for (const dir of directions) {
                        const checkX = x + dir.x;
                        const checkY = y + dir.y;
                        
                        if (checkX >= 0 && checkX < this.BOARD_WIDTH &&
                            checkY >= 0 && checkY < this.BOARD_HEIGHT &&
                            board[checkY][checkX] > 0 && board[checkY][checkX] !== this.GARBAGE_PUYO) {
                            
                            // この色でつながりを確認
                            const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
                            const connected = this.findConnectedPuyos(board, checkX, checkY, board[checkY][checkX], visited);
                            
                            if (connected.length >= 4) {
                                clearPotential += 50; // 連鎖でおじゃまぷよを削除可能
                            } else if (connected.length === 3) {
                                clearPotential += 20; // あと1個で削除可能
                            }
                        }
                    }
                }
            }
        }
        
        return clearPotential;
    }
    
    // ピースを指定回数回転
    rotatePiece(piece, rotations) {
        let rotatedPiece = {
            colors: [...piece.colors],
            positions: piece.positions.map(pos => ({...pos}))
        };
        
        for (let i = 0; i < rotations; i++) {
            // 90度回転
            const basePos = rotatedPiece.positions[0];
            for (let j = 1; j < rotatedPiece.positions.length; j++) {
                const relativeX = rotatedPiece.positions[j].x - basePos.x;
                const relativeY = rotatedPiece.positions[j].y - basePos.y;
                
                rotatedPiece.positions[j].x = basePos.x - relativeY;
                rotatedPiece.positions[j].y = basePos.y + relativeX;
            }
        }
        
        return rotatedPiece;
    }
    
    // 指定位置への落下位置を計算
    findDropPosition(player, x, positions) {
        const board = player === 'player' ? this.playerBoard : this.cpuBoard;
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            // その位置に配置可能かチェック
            let canPlace = true;
            for (const pos of positions) {
                const checkX = x + pos.x;
                const checkY = y + pos.y;
                
                if (checkX < 0 || checkX >= this.BOARD_WIDTH || 
                    checkY >= this.BOARD_HEIGHT ||
                    (checkY >= 0 && board[checkY][checkX] !== 0)) {
                    canPlace = false;
                    break;
                }
            }
            
            if (!canPlace) {
                return y - 1 >= 0 ? y - 1 : null;
            }
        }
        
        return this.BOARD_HEIGHT - 1;
    }
    
    // 手を仮実行してボード状態をシミュレート
    simulateMove(player, x, y, piece) {
        const board = player === 'player' ? this.playerBoard : this.cpuBoard;
        const testBoard = board.map(row => [...row]);
        
        // ピースを配置
        for (let i = 0; i < piece.positions.length; i++) {
            const pos = piece.positions[i];
            const placeX = x + pos.x;
            const placeY = y + pos.y;
            
            if (placeY >= 0 && placeY < this.BOARD_HEIGHT && 
                placeX >= 0 && placeX < this.BOARD_WIDTH) {
                testBoard[placeY][placeX] = piece.colors[i];
            }
        }
        
        return testBoard;
    }
    
    // ボード状態を評価（強化版）
    evaluateBoard(board, player) {
        let score = 0;
        
        // 高度な連鎖分析
        const chainAnalysis = this.analyzeAdvancedChainPatterns(board);
        
        // 即座に発生する連鎖の評価（最重要）
        score += chainAnalysis.immediateChains * this.aiConfig.chainWeight * 4;
        
        // 潜在的連鎖の評価（強化）
        score += chainAnalysis.potentialChains * this.aiConfig.chainWeight * 2.5;
        
        // 🎯 新しい高度パターン評価
        // GTRパターン認識
        score += this.evaluateGTRPattern(board) * this.aiConfig.gtrPatternWeight;
        
        // 階段積みパターン認識
        score += this.evaluateStairPattern(board) * this.aiConfig.stairPatternWeight;
        
        // 将来連鎖可能性
        score += this.evaluateFutureChainPotential(board) * this.aiConfig.futureChainWeight;
        
        // 位置価値評価
        score += this.evaluatePositionValue(board) * this.aiConfig.positionValueWeight;
        
        // 最大連鎖長の評価（大幅強化）
        score += Math.pow(chainAnalysis.maxChainLength, 2) * this.aiConfig.chainWeight * 3;
        
        // 連鎖の引き金位置の評価（強化）
        score += chainAnalysis.triggerPositions.length * this.aiConfig.chainTriggerWeight || 50;
        
        // 連鎖セットアップの評価（新追加）
        score += this.evaluateChainSetup(board) * (this.aiConfig.chainSetupWeight || 150);
        
        // 連鎖構築パターンマッチングの評価（新追加）
        score += this.evaluateChainPatterns(board) * 100;
        
        // 多段連鎖の可能性評価（新追加）
        score += this.evaluateMultiStageChains(board) * 200;
        
        // 基本的な連鎖可能性の評価
        score += this.evaluateChainPotential(board) * this.aiConfig.chainWeight;
        
        // 色の連結性評価（強化）
        score += this.evaluateColorConnectivity(board) * (this.aiConfig.connectedPuyoWeight || 80);
        
        // ボードの安定性評価（新追加）
        score += this.evaluateBoardStability(board) * 60;
        
        // ボードの高さペナルティ（調整）
        score -= this.evaluateHeight(board) * this.aiConfig.heightPenalty * 0.8;
        
        // おじゃまぷよの評価
        score -= this.evaluateGarbage(board) * this.aiConfig.garbageWeight;
        
        // 色のまとまり評価
        score += this.evaluateColorGroups(board) * 25;
        
        // 相手への攻撃性評価（強化）
        score += this.evaluateOffensivePotential(chainAnalysis) * 80;
        
        // 防御性評価
        score += this.evaluateDefensivePotential(board) * this.aiConfig.defenseWeight;
        
        return score;
    }
    
    // 攻撃性能の評価
    evaluateOffensivePotential(chainAnalysis) {
        let offensiveScore = 0;
        
        // 長い連鎖ほど攻撃力が高い
        if (chainAnalysis.maxChainLength >= 4) {
            offensiveScore += chainAnalysis.maxChainLength * 30;
        }
        
        // 即座に発動可能な連鎖は攻撃性が高い
        offensiveScore += chainAnalysis.immediateChains * 20;
        
        // 高優先度の引き金位置があると攻撃力アップ
        const highPriorityTriggers = chainAnalysis.triggerPositions.filter(t => t.priority === 'high');
        offensiveScore += highPriorityTriggers.length * 15;
        
        return offensiveScore;
    }
    
    // 防御性能の評価
    evaluateDefensivePotential(board) {
        let defensiveScore = 0;
        
        // 低い高さは防御的に良い
        const avgHeight = this.evaluateHeight(board);
        if (avgHeight < 4) {
            defensiveScore += 30;
        } else if (avgHeight > 7) {
            defensiveScore -= 50; // 危険な高さ
        }
        
        // おじゃまぷよが少ないほど防御的に良い
        const garbageCount = this.countGarbagePuyos(board);
        defensiveScore -= garbageCount * 5;
        
        // 均等な高さ分布は安定性が高い
        defensiveScore += this.evaluateHeightDistribution(board) * 10;
        
        return defensiveScore;
    }
    
    // 連鎖セットアップの評価（新メソッド）
    evaluateChainSetup(board) {
        let setupScore = 0;
        
        // 3個連結のぷよ（あと1個で連鎖）を高く評価
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0 && board[y][x] !== this.GARBAGE_PUYO) {
                    const connected = this.findConnectedPuyos(board, x, y, board[y][x], Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false)));
                    
                    if (connected.length === 3) {
                        setupScore += 50; // 3個連結は高評価
                        
                        // 周辺に同色ぷよがあるかチェック
                        const adjacentSameColor = this.countAdjacentSameColor(board, connected, board[y][x]);
                        setupScore += adjacentSameColor * 30;
                    } else if (connected.length === 2) {
                        setupScore += 20; // 2個連結も評価
                    }
                }
            }
        }
        
        return setupScore;
    }
    
    // 連鎖構築パターンマッチングの評価（新メソッド）
    evaluateChainPatterns(board) {
        let patternScore = 0;
        
        // 基本的な階段積みパターンを検出
        for (let x = 0; x < this.BOARD_WIDTH - 3; x++) {
            for (let y = 0; y < this.BOARD_HEIGHT - 2; y++) {
                if (this.matchesStairPattern(board, x, y)) {
                    patternScore += 100;
                }
            }
        }
        
        // 鍵積みパターンを検出
        for (let x = 0; x < this.BOARD_WIDTH - 2; x++) {
            for (let y = 0; y < this.BOARD_HEIGHT - 1; y++) {
                if (this.matchesSandwichPattern(board, x, y)) {
                    patternScore += 80;
                }
            }
        }
        
        // GTRパターンを検出
        for (let x = 0; x < this.BOARD_WIDTH - 1; x++) {
            for (let y = 0; y < this.BOARD_HEIGHT - 2; y++) {
                if (this.matchesGTRPattern(board, x, y)) {
                    patternScore += 120;
                }
            }
        }
        
        return patternScore;
    }
    
    // 多段連鎖の可能性評価（新メソッド）
    evaluateMultiStageChains(board) {
        let multiStageScore = 0;
        
        // 複数の連鎖の種を検出
        const chainSeeds = this.findChainSeeds(board);
        
        if (chainSeeds.length >= 2) {
            multiStageScore += chainSeeds.length * 60;
            
            // 連鎖の種が近い位置にあるほど高評価
            for (let i = 0; i < chainSeeds.length - 1; i++) {
                for (let j = i + 1; j < chainSeeds.length; j++) {
                    const distance = Math.abs(chainSeeds[i].x - chainSeeds[j].x) + Math.abs(chainSeeds[i].y - chainSeeds[j].y);
                    if (distance <= 3) {
                        multiStageScore += 40;
                    }
                }
            }
        }
        
        return multiStageScore;
    }
    
    // 色の連結性評価（新メソッド）
    evaluateColorConnectivity(board) {
        let connectivityScore = 0;
        
        for (let color = 1; color <= 5; color++) {
            const colorPositions = this.findColorPositions(board, color);
            
            if (colorPositions.length >= 2) {
                // 同色ぷよ同士の距離を評価
                let totalDistance = 0;
                let pairCount = 0;
                
                for (let i = 0; i < colorPositions.length - 1; i++) {
                    for (let j = i + 1; j < colorPositions.length; j++) {
                        const distance = Math.abs(colorPositions[i].x - colorPositions[j].x) + 
                                       Math.abs(colorPositions[i].y - colorPositions[j].y);
                        totalDistance += distance;
                        pairCount++;
                    }
                }
                
                if (pairCount > 0) {
                    const avgDistance = totalDistance / pairCount;
                    // 距離が近いほど高評価
                    connectivityScore += Math.max(0, (10 - avgDistance) * colorPositions.length);
                }
            }
        }
        
        return connectivityScore;
    }
    
    // ボードの安定性評価（新メソッド）
    evaluateBoardStability(board) {
        let stabilityScore = 0;
        
        // 下の方のぷよが多いほど安定
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0) {
                    stabilityScore += (this.BOARD_HEIGHT - y) * 2;
                }
            }
        }
        
        // 空中に浮いているぷよを検出（不安定）
        for (let y = 1; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0 && board[y-1][x] === 0) {
                    stabilityScore -= 20; // 浮いているぷよは不安定
                }
            }
        }
        
        return stabilityScore;
    }
    
    countGarbagePuyos(board) {
        let count = 0;
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] === this.GARBAGE_PUYO) {
                    count++;
                }
            }
        }
        return count;
    }
    
    evaluateHeightDistribution(board) {
        const heights = [];
        
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            let height = 0;
            for (let y = 0; y < this.BOARD_HEIGHT; y++) {
                if (board[y][x] !== 0) {
                    height = this.BOARD_HEIGHT - y;
                    break;
                }
            }
            heights.push(height);
        }
        
        // 高さの分散を計算（小さいほど良い）
        const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
        const variance = heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / heights.length;
        
        return Math.max(0, 10 - variance); // 分散が小さいほど高スコア
    }
    
    // 連鎖可能性を評価
    evaluateChainPotential(board) {
        let chainScore = 0;
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0 && board[y][x] !== this.GARBAGE_PUYO && !visited[y][x]) {
                    const connected = this.findConnectedPuyos(board, x, y, board[y][x], visited);
                    
                    if (connected.length === 3) {
                        chainScore += 30; // 3個つながり（あと1個で連鎖）
                    } else if (connected.length >= 4) {
                        chainScore += 100; // 即座に連鎖可能
                    } else if (connected.length === 2) {
                        chainScore += 10; // 2個つながり
                    }
                }
            }
        }
        
        return chainScore;
    }
    
    // ボードの高さを評価
    evaluateHeight(board) {
        let totalHeight = 0;
        let maxHeight = 0;
        
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            let height = 0;
            for (let y = 0; y < this.BOARD_HEIGHT; y++) {
                if (board[y][x] !== 0) {
                    height = this.BOARD_HEIGHT - y;
                    break;
                }
            }
            totalHeight += height;
            maxHeight = Math.max(maxHeight, height);
        }
        
        // 平均の高さ + 最大高さのペナルティ
        return totalHeight / this.BOARD_WIDTH + maxHeight * 2;
    }
    
    // おじゃまぷよの影響を評価
    evaluateGarbage(board) {
        let garbageCount = 0;
        let garbageHeight = 0;
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] === this.GARBAGE_PUYO) {
                    garbageCount++;
                    garbageHeight = Math.max(garbageHeight, this.BOARD_HEIGHT - y);
                }
            }
        }
        
        return garbageCount + garbageHeight * 5;
    }
    
    // 色のまとまりを評価
    evaluateColorGroups(board) {
        let groupScore = 0;
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0 && board[y][x] !== this.GARBAGE_PUYO && !visited[y][x]) {
                    const connected = this.findConnectedPuyos(board, x, y, board[y][x], visited);
                    
                    // 2個以上つながっている場合にスコア
                    if (connected.length >= 2) {
                        groupScore += connected.length * connected.length;
                    }
                }
            }
        }
        
        return groupScore;
    }
    
    // 高度な連鎖パターン認識システム
    analyzeAdvancedChainPatterns(board) {
        let chainAnalysis = {
            immediateChains: 0,
            potentialChains: 0,
            triggerPositions: [],
            maxChainLength: 0,
            chainSetups: []
        };
        
        // 即座に発生する連鎖を検出
        chainAnalysis.immediateChains = this.countImmediateChains(board);
        
        // 1手で発生可能な連鎖を検出
        chainAnalysis.potentialChains = this.findPotentialChains(board);
        
        // 連鎖の引き金となる位置を特定
        chainAnalysis.triggerPositions = this.findChainTriggers(board);
        
        // 最大連鎖長を計算
        chainAnalysis.maxChainLength = this.calculateMaxChainLength(board);
        
        return chainAnalysis;
    }
    
    countImmediateChains(board) {
        let chainCount = 0;
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0 && board[y][x] !== this.GARBAGE_PUYO && !visited[y][x]) {
                    const connected = this.findConnectedPuyos(board, x, y, board[y][x], visited);
                    
                    if (connected.length >= 4) {
                        chainCount++;
                    }
                }
            }
        }
        
        return chainCount;
    }
    
    findPotentialChains(board) {
        let potentialChains = 0;
        
        // 各空きマスに各色のぷよを仮配置して連鎖可能性をチェック
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] === 0) {
                    // 各色を試す
                    for (let color = 1; color <= 5; color++) {
                        const testBoard = board.map(row => [...row]);
                        testBoard[y][x] = color;
                        
                        if (this.countImmediateChains(testBoard) > 0) {
                            potentialChains++;
                            break; // この位置では1つ見つかれば十分
                        }
                    }
                }
            }
        }
        
        return potentialChains;
    }
    
    findChainTriggers(board) {
        const triggers = [];
        
        // 3個つながりの上や隣に同色を置くことで連鎖が発生する位置を探す
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0 && board[y][x] !== this.GARBAGE_PUYO && !visited[y][x]) {
                    const connected = this.findConnectedPuyos(board, x, y, board[y][x], visited);
                    
                    if (connected.length === 3) {
                        // 3個つながりの周囲をチェック
                        const adjacentPositions = this.getAdjacentEmptyPositions(board, connected);
                        
                        for (const pos of adjacentPositions) {
                            triggers.push({
                                x: pos.x,
                                y: pos.y,
                                color: board[y][x],
                                priority: 'high' // 3個つながりは高優先度
                            });
                        }
                    } else if (connected.length === 2) {
                        // 2個つながりの周囲も低優先度でチェック
                        const adjacentPositions = this.getAdjacentEmptyPositions(board, connected);
                        
                        for (const pos of adjacentPositions) {
                            triggers.push({
                                x: pos.x,
                                y: pos.y,
                                color: board[y][x],
                                priority: 'medium'
                            });
                        }
                    }
                }
            }
        }
        
        return triggers;
    }
    
    getAdjacentEmptyPositions(board, connectedGroup) {
        const emptyPositions = [];
        const checked = new Set();
        
        for (const pos of connectedGroup) {
            const directions = [{x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}];
            
            for (const dir of directions) {
                const checkX = pos.x + dir.x;
                const checkY = pos.y + dir.y;
                const key = `${checkX},${checkY}`;
                
                if (checkX >= 0 && checkX < this.BOARD_WIDTH &&
                    checkY >= 0 && checkY < this.BOARD_HEIGHT &&
                    !checked.has(key) && board[checkY][checkX] === 0) {
                    
                    checked.add(key);
                    emptyPositions.push({x: checkX, y: checkY});
                }
            }
        }
        
        return emptyPositions;
    }
    
    calculateMaxChainLength(board) {
        // シミュレーションによる最大連鎖長計算（簡易版）
        let maxChain = 0;
        
        // 各色を各位置に配置して最大連鎖を計算
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] === 0) {
                    for (let color = 1; color <= 5; color++) {
                        const chainLength = this.simulateChainLength(board, x, y, color);
                        maxChain = Math.max(maxChain, chainLength);
                    }
                }
            }
        }
        
        return maxChain;
    }
    
    simulateChainLength(board, x, y, color) {
        const testBoard = board.map(row => [...row]);
        testBoard[y][x] = color;
        
        let chainLength = 0;
        let hasChain = true;
        
        // 連鎖をシミュレート（最大5回まで）
        while (hasChain && chainLength < 5) {
            hasChain = false;
            const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
            
            for (let by = 0; by < this.BOARD_HEIGHT; by++) {
                for (let bx = 0; bx < this.BOARD_WIDTH; bx++) {
                    if (testBoard[by][bx] > 0 && testBoard[by][bx] !== this.GARBAGE_PUYO && !visited[by][bx]) {
                        const connected = this.findConnectedPuyos(testBoard, bx, by, testBoard[by][bx], visited);
                        
                        if (connected.length >= 4) {
                            hasChain = true;
                            chainLength++;
                            
                            // 連鎖したぷよを削除
                            for (const pos of connected) {
                                testBoard[pos.y][pos.x] = 0;
                            }
                        }
                    }
                }
            }
            
            if (hasChain) {
                // 重力適用
                this.applySimulatedGravity(testBoard);
            }
        }
        
        return chainLength;
    }
    
    applySimulatedGravity(board) {
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            let writeIndex = this.BOARD_HEIGHT - 1;
            
            for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
                if (board[y][x] > 0) {
                    if (y !== writeIndex) {
                        board[writeIndex][x] = board[y][x];
                        board[y][x] = 0;
                    }
                    writeIndex--;
                }
            }
        }
    }
    
    // ================================================
    // 高度AI アルゴリズム群
    // ================================================
    
    initializeAdvancedPatterns() {
        // GTRパターン（Great Tanaka Rensa）定義
        this.gtrPatterns = [
            // 基本GTRパターン（6x4の形状）
            {
                pattern: [
                    [1, 1, 0, 2, 2, 0],
                    [3, 1, 2, 2, 4, 4],
                    [3, 3, 2, 4, 4, 5],
                    [3, 5, 5, 4, 5, 5]
                ],
                score: 400,
                name: 'Basic GTR'
            }
        ];
        
        // 階段積みパターン定義
        this.stairPatterns = [
            // 右階段パターン
            {
                pattern: [
                    [0, 0, 0, 1, 1, 1],
                    [0, 0, 2, 2, 1, 1],
                    [0, 3, 3, 2, 2, 1],
                    [4, 4, 3, 3, 2, 2]
                ],
                score: 200,
                name: 'Right Stair'
            }
        ];
        
        // 位置価値マップ（中央ほど価値が高い）
        this.positionValues = [
            [1, 2, 3, 3, 2, 1],
            [1, 3, 4, 4, 3, 1],
            [1, 3, 5, 5, 3, 1],
            [1, 3, 5, 5, 3, 1],
            [2, 4, 6, 6, 4, 2],
            [2, 4, 6, 6, 4, 2],
            [2, 4, 6, 6, 4, 2],
            [3, 5, 7, 7, 5, 3],
            [3, 5, 7, 7, 5, 3],
            [3, 5, 7, 7, 5, 3],
            [4, 6, 8, 8, 6, 4],
            [4, 6, 8, 8, 6, 4]
        ];
        
        console.log('🎯 高度連鎖パターン初期化完了');
    }
    
    // ビームサーチ実装
    beamSearch(currentBoard, depth, beamWidth) {
        let states = [{
            board: this.deepCopyBoard(currentBoard),
            score: this.evaluateBoard(currentBoard),
            moves: []
        }];
        
        for (let d = 0; d < depth; d++) {
            let newStates = [];
            
            for (let state of states) {
                // 全可能手を生成
                const possibleMoves = this.generatePossibleMoves(state.board);
                
                for (let move of possibleMoves) {
                    const newBoard = this.simulateMove(state.board, move);
                    const newScore = this.evaluateBoard(newBoard);
                    
                    newStates.push({
                        board: newBoard,
                        score: newScore,
                        moves: [...state.moves, move]
                    });
                }
            }
            
            // ビーム幅で状態を制限（上位のみ保持）
            newStates.sort((a, b) => b.score - a.score);
            states = newStates.slice(0, beamWidth);
            
            if (states.length === 0) break;
        }
        
        return states.length > 0 ? states[0] : null;
    }
    
    // モンテカルロ法実装
    monteCarloEvaluation(board, numRuns) {
        let totalScore = 0;
        
        for (let i = 0; i < numRuns; i++) {
            const randomBoard = this.deepCopyBoard(board);
            const simulationScore = this.simulateRandomGame(randomBoard);
            totalScore += simulationScore;
        }
        
        return totalScore / numRuns;
    }
    
    simulateRandomGame(board) {
        let score = 0;
        let moves = 0;
        const maxMoves = 20; // 最大20手のシミュレーション
        
        while (moves < maxMoves && !this.isBoardFull(board)) {
            const possibleMoves = this.generatePossibleMoves(board);
            if (possibleMoves.length === 0) break;
            
            // ランダムに手を選択
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            board = this.simulateMove(board, randomMove);
            
            // 連鎖をシミュレート
            const chainResult = this.simulateChains(board);
            score += chainResult.score;
            
            moves++;
        }
        
        return score;
    }
    
    // GTRパターン認識
    evaluateGTRPattern(board) {
        let maxScore = 0;
        
        for (let pattern of this.gtrPatterns) {
            const matchScore = this.matchPattern(board, pattern);
            maxScore = Math.max(maxScore, matchScore);
        }
        
        return maxScore;
    }
    
    // 階段積みパターン認識
    evaluateStairPattern(board) {
        let score = 0;
        
        // 右階段をチェック
        for (let x = 0; x < this.BOARD_WIDTH - 2; x++) {
            for (let y = this.BOARD_HEIGHT - 4; y >= 0; y--) {
                if (this.isStairPattern(board, x, y)) {
                    score += 200;
                }
            }
        }
        
        return score;
    }
    
    isStairPattern(board, startX, startY) {
        // 3x3の階段パターンをチェック
        for (let i = 0; i < 3; i++) {
            const expectedHeight = i + 1;
            let actualHeight = 0;
            
            for (let y = this.BOARD_HEIGHT - 1; y >= startY; y--) {
                if (board[y] && board[y][startX + i] > 0) {
                    actualHeight++;
                } else {
                    break;
                }
            }
            
            if (actualHeight < expectedHeight) {
                return false;
            }
        }
        
        return true;
    }
    
    // 将来連鎖可能性評価
    evaluateFutureChainPotential(board) {
        let potential = 0;
        
        // 各空きマスに各色を置いた場合の連鎖可能性を評価
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] === 0) {
                    for (let color = 1; color <= 5; color++) {
                        const testBoard = this.deepCopyBoard(board);
                        testBoard[y][x] = color;
                        
                        const chainResult = this.simulateChains(testBoard);
                        if (chainResult.chainCount > 0) {
                            potential += chainResult.chainCount * 10;
                        }
                    }
                }
            }
        }
        
        return potential;
    }
    
    // 位置価値評価
    evaluatePositionValue(board) {
        let value = 0;
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0) {
                    value += this.positionValues[y][x];
                }
            }
        }
        
        return value;
    }
    
    // 補助関数群
    generatePossibleMoves(board) {
        const moves = [];
        
        // 現在のピースで全ての可能な手を生成
        if (!this.cpuCurrentPiece && !this.cpuNextPiece) {
            // ピースがない場合はランダムに生成
            this.generateNextPiece('cpu');
        }
        
        const piece = this.cpuCurrentPiece || this.generateRandomPiece();
        
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                const testPiece = this.rotatePiece(piece, rotation);
                const dropY = this.findDropPosition('cpu', x, testPiece.positions);
                
                if (dropY !== null) {
                    moves.push({
                        x: x,
                        y: dropY,
                        rotation: rotation,
                        piece: testPiece
                    });
                }
            }
        }
        
        return moves;
    }
    
    simulateMove(board, move) {
        const testBoard = this.deepCopyBoard(board);
        
        // ピースを配置
        for (let i = 0; i < move.piece.positions.length; i++) {
            const pos = move.piece.positions[i];
            const placeX = move.x + pos.x;
            const placeY = move.y + pos.y;
            
            if (placeY >= 0 && placeY < this.BOARD_HEIGHT && 
                placeX >= 0 && placeX < this.BOARD_WIDTH) {
                testBoard[placeY][placeX] = move.piece.colors[i];
            }
        }
        
        // 重力を適用
        this.applySimulatedGravity(testBoard);
        
        return testBoard;
    }
    
    deepCopyBoard(board) {
        return board.map(row => [...row]);
    }
    
    isBoardFull(board) {
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            if (board[0][x] === 0) {
                return false;
            }
        }
        return true;
    }
    
    simulateChains(board) {
        let chainCount = 0;
        let totalScore = 0;
        let currentBoard = this.deepCopyBoard(board);
        
        while (true) {
            const removedGroups = this.findConnectedGroups(currentBoard);
            if (removedGroups.length === 0) break;
            
            chainCount++;
            totalScore += removedGroups.length * 100 * chainCount;
            
            // グループを削除
            for (const group of removedGroups) {
                for (const cell of group) {
                    currentBoard[cell.y][cell.x] = 0;
                }
            }
            
            // 重力を適用
            this.applySimulatedGravity(currentBoard);
        }
        
        return { chainCount, score: totalScore };
    }
    
    findConnectedGroups(board) {
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        const groups = [];
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (!visited[y][x] && board[y][x] > 0) {
                    const group = this.floodFill(board, visited, x, y, board[y][x]);
                    if (group.length >= 4) {
                        groups.push(group);
                    }
                }
            }
        }
        
        return groups;
    }
    
    floodFill(board, visited, x, y, color) {
        if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT ||
            visited[y][x] || board[y][x] !== color) {
            return [];
        }
        
        visited[y][x] = true;
        const group = [{x, y}];
        
        // 4方向を探索
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dx, dy] of directions) {
            group.push(...this.floodFill(board, visited, x + dx, y + dy, color));
        }
        
        return group;
    }
    
    generateRandomPiece() {
        const colors = [1, 2, 3, 4, 5];
        return {
            colors: [
                colors[Math.floor(Math.random() * colors.length)],
                colors[Math.floor(Math.random() * colors.length)]
            ],
            positions: [
                {x: 0, y: 0},
                {x: 0, y: 1}
            ]
        };
    }
    
    matchPattern(board, pattern) {
        // パターンマッチング実装（簡易版）
        let maxMatch = 0;
        
        for (let offsetY = 0; offsetY <= this.BOARD_HEIGHT - pattern.pattern.length; offsetY++) {
            for (let offsetX = 0; offsetX <= this.BOARD_WIDTH - pattern.pattern[0].length; offsetX++) {
                let match = 0;
                
                for (let y = 0; y < pattern.pattern.length; y++) {
                    for (let x = 0; x < pattern.pattern[y].length; x++) {
                        const boardY = offsetY + y;
                        const boardX = offsetX + x;
                        
                        if (pattern.pattern[y][x] > 0 && 
                            board[boardY][boardX] === pattern.pattern[y][x]) {
                            match++;
                        }
                    }
                }
                
                maxMatch = Math.max(maxMatch, match);
            }
        }
        
        return maxMatch * pattern.score / (pattern.pattern.length * pattern.pattern[0].length);
    }
    
    updateScore(player, points) {
        if (player === 'player') {
            this.playerScore += points;
            if (this.playerScoreDisplay) {
                this.playerScoreDisplay.textContent = this.playerScore;
            }
        } else {
            this.cpuScore += points;
            if (this.cpuScoreDisplay) {
                this.cpuScoreDisplay.textContent = this.cpuScore;
            }
        }
    }
    
    endBattle() {
        console.log('🏁 対戦終了！');
        this.gameRunning = false;
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 勝敗判定
        const winner = this.playerScore > this.cpuScore ? 'プレイヤー' : 'CPU';
        
        alert(`対戦終了！\n\nプレイヤー: ${this.playerScore}点\nCPU: ${this.cpuScore}点\n\n勝者: ${winner}`);
        
        // リセット
        this.resetBattle();
    }
    
    resetBattle() {
        this.timeLeft = 180;
        this.playerScore = 0;
        this.cpuScore = 0;
        
        if (this.timeLeftDisplay) {
            this.timeLeftDisplay.textContent = this.timeLeft;
        }
        if (this.playerScoreDisplay) {
            this.playerScoreDisplay.textContent = this.playerScore;
        }
        if (this.cpuScoreDisplay) {
            this.cpuScoreDisplay.textContent = this.cpuScore;
        }
        
        // ボタンをリセット
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.remove('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.add('hidden');
        }
        
        // キャンバスをリセット
        this.initializeCanvas();
    }
    
    playSound(soundType) {
        try {
            let audioElement = null;
            
            switch(soundType) {
                case 'move':
                    audioElement = document.getElementById('se-move');
                    break;
                case 'rotate':
                    audioElement = document.getElementById('se-rotate');
                    break;
                case 'clear':
                    audioElement = document.getElementById('se-clear');
                    break;
                default:
                    console.warn(`🔊 未知の効果音タイプ: ${soundType}`);
                    return;
            }
            
            if (audioElement) {
                // 対戦モード専用の音量設定（既存ゲームの音量が小さすぎるため）
                let volume = 0.7; // デフォルト音量
                if (window.game && window.game.seVolume !== undefined) {
                    volume = Math.max(0.3, window.game.seVolume / 100); // 最低音量30%を保証
                }
                
                audioElement.volume = volume;
                audioElement.currentTime = 0; // 巻き戻し
                
                audioElement.play().then(() => {
                    console.log(`🔊 ${soundType}音再生 (音量: ${Math.round(volume * 100)}%)`);
                }).catch(e => {
                    console.warn('🔊 効果音再生エラー:', e.message);
                });
            } else {
                console.warn(`🔊 効果音要素が見つかりません: ${soundType}`);
            }
        } catch (error) {
            console.warn('🔊 効果音再生中にエラー:', error.message);
        }
    }
    
    checkPlayerChains() {
        this.checkChains('player');
    }
    
    checkCpuChains() {
        this.checkChains('cpu');
    }
    
    checkChains(player) {
        const board = player === 'player' ? this.playerBoard : this.cpuBoard;
        let chainFound = false;
        
        // 4つ以上つながったぷよを探す（おじゃまぷよは除外）
        const toRemove = [];
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0 && board[y][x] !== this.GARBAGE_PUYO && !visited[y][x]) {
                    const connected = this.findConnectedPuyos(board, x, y, board[y][x], visited);
                    if (connected.length >= 4) {
                        toRemove.push(...connected);
                        chainFound = true;
                    }
                }
            }
        }
        
        // ぷよを削除
        if (chainFound) {
            // 連鎖数を増加
            if (player === 'player') {
                this.playerChainCount++;
            } else {
                this.cpuChainCount++;
            }
            
            const chainCount = player === 'player' ? this.playerChainCount : this.cpuChainCount;
            console.log(`💥 ${player} で${chainCount}連鎖発生！削除数: ${toRemove.length}`);
            
            // おじゃまぷよの隣接削除チェック
            const garbagesToRemove = this.findAdjacentGarbage(board, toRemove);
            toRemove.push(...garbagesToRemove);
            
            for (const pos of toRemove) {
                board[pos.y][pos.x] = 0;
            }
            
            this.playSound('clear');
            
            // おじゃまぷよを相手に送る
            const garbageToSend = this.calculateGarbagePuyos(chainCount, toRemove.length);
            this.sendGarbagePuyos(player, garbageToSend);
            
            // 重力を適用
            this.applyGravity(player);
            
            // 再帰的に連鎖をチェック
            setTimeout(() => {
                this.checkChains(player);
            }, 300);
        } else {
            // 連鎖終了時にリセット
            if (player === 'player') {
                this.playerChainCount = 0;
            } else {
                this.cpuChainCount = 0;
            }
            
            // 連鎖終了後、現在のピースがない場合は新しいピースを生成
            const currentPiece = player === 'player' ? this.playerCurrentPiece : this.cpuCurrentPiece;
            if (!currentPiece) {
                console.log(`🔄 ${player} 連鎖終了 - 新しいピースを生成`);
                
                // ゲームオーバーチェック
                if (!this.checkGameOver(player)) {
                    this.spawnNewPiece(player);
                    this.renderBattleNextPuyo();
                    console.log(`✅ ${player} 新しいピース生成完了`);
                } else {
                    console.log(`🚫 ${player} ゲームオーバーのため新しいピース生成をスキップ`);
                }
            } else {
                console.log(`⚠️ ${player} 連鎖終了時に既にピースが存在: ${currentPiece ? 'あり' : 'なし'}`);
            }
        }
    }
    
    findConnectedPuyos(board, startX, startY, color, visited) {
        const connected = [];
        const stack = [{x: startX, y: startY}];
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            
            if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT) {
                continue;
            }
            
            if (visited[y][x] || board[y][x] !== color) {
                continue;
            }
            
            visited[y][x] = true;
            connected.push({x, y});
            
            // 4方向をチェック
            stack.push({x: x + 1, y});
            stack.push({x: x - 1, y});
            stack.push({x, y: y + 1});
            stack.push({x, y: y - 1});
        }
        
        return connected;
    }
    
    applyGravity(player) {
        const board = player === 'player' ? this.playerBoard : this.cpuBoard;
        
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            // 下から詰める
            let writeIndex = this.BOARD_HEIGHT - 1;
            
            for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
                if (board[y][x] > 0) {
                    if (y !== writeIndex) {
                        board[writeIndex][x] = board[y][x];
                        board[y][x] = 0;
                    }
                    writeIndex--;
                }
            }
        }
        
        this.drawGameBoard(player);
        console.log(`⬇️ ${player} に重力を適用しました`);
    }
    
    findAdjacentGarbage(board, removedPositions) {
        const garbageToRemove = [];
        const visited = new Set();
        
        for (const pos of removedPositions) {
            // 4方向をチェック
            const directions = [{x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}];
            
            for (const dir of directions) {
                const x = pos.x + dir.x;
                const y = pos.y + dir.y;
                const key = `${x},${y}`;
                
                if (x >= 0 && x < this.BOARD_WIDTH && y >= 0 && y < this.BOARD_HEIGHT &&
                    !visited.has(key) && board[y][x] === this.GARBAGE_PUYO) {
                    visited.add(key);
                    garbageToRemove.push({x, y});
                }
            }
        }
        
        return garbageToRemove;
    }
    
    calculateGarbagePuyos(chainCount, removedCount) {
        // 連鎖数とぷよ数に応じておじゃまぷよの数を計算
        let garbageCount = 0;
        
        if (chainCount >= 2) {
            // 連鎖数に応じた適切な量の調整
            if (chainCount === 2) {
                garbageCount = Math.floor(Math.random() * 2) + 1; // 1-2個
            } else if (chainCount === 3) {
                garbageCount = Math.floor(Math.random() * 2) + 2; // 2-3個
            } else if (chainCount === 4) {
                garbageCount = Math.floor(Math.random() * 3) + 3; // 3-5個
            } else if (chainCount === 5) {
                garbageCount = Math.floor(Math.random() * 3) + 5; // 5-7個
            } else if (chainCount >= 6) {
                garbageCount = Math.floor(Math.random() * 4) + 6 + (chainCount - 6) * 2; // 6個以上+連鎖ボーナス
            }
            
            // 大量消去ボーナス
            if (removedCount >= 8) {
                garbageCount += Math.floor(removedCount / 6);
            }
        }
        
        return Math.min(garbageCount, 30); // 最大30個
    }
    
    sendGarbagePuyos(sender, amount) {
        if (amount <= 0) return;
        
        const target = sender === 'player' ? 'cpu' : 'player';
        
        if (target === 'player') {
            this.playerPendingGarbage += amount;
        } else {
            this.cpuPendingGarbage += amount;
        }
        
        console.log(`📨 ${sender} から ${target} に おじゃまぷよ ${amount}個送信`);
        
        // 少し遅延してからおじゃまぷよを配置
        setTimeout(() => {
            this.dropGarbagePuyos(target);
        }, 500);
    }
    
    dropGarbagePuyos(player) {
        const board = player === 'player' ? this.playerBoard : this.cpuBoard;
        const pendingAmount = player === 'player' ? this.playerPendingGarbage : this.cpuPendingGarbage;
        
        if (pendingAmount <= 0) return;
        
        console.log(`💩 ${player} におじゃまぷよ ${pendingAmount}個落下`);
        
        // 下から上に向かって配置（重力に従って落下するように）
        let remainingGarbage = pendingAmount;
        
        for (let row = this.BOARD_HEIGHT - 1; row >= 0 && remainingGarbage > 0; row--) {
            for (let col = 0; col < this.BOARD_WIDTH && remainingGarbage > 0; col++) {
                if (board[row][col] === 0) {
                    board[row][col] = this.GARBAGE_PUYO;
                    remainingGarbage--;
                }
            }
        }
        
        // ペンディング数をリセット
        if (player === 'player') {
            this.playerPendingGarbage = 0;
        } else {
            this.cpuPendingGarbage = 0;
        }
        
        // 重力を適用しておじゃまぷよを正しく落下させる
        this.applyGravity(player);
        this.drawGameBoard(player);
    }
    
    checkGameOver(player) {
        const board = player === 'player' ? this.playerBoard : this.cpuBoard;
        
        // 上端2行にぷよがあるかチェック
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            if (board[0][x] !== 0 || board[1][x] !== 0) {
                console.log(`💀 ${player} のゲームオーバー（天井到達）`);
                return true;
            }
        }
        
        return false;
    }
    
    endGame(winner) {
        console.log(`🏆 ゲーム終了！勝者: ${winner}`);
        this.gameRunning = false;
        
        // タイマー停止
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // BGM停止
        this.stopBattleBgm();
        
        // 勝者の決定とメッセージ表示
        const winnerText = winner === 'player' ? 'あなたの勝利！' : 'CPUの勝利！';
        const loser = winner === 'player' ? 'cpu' : 'player';
        
        // 画面にリザルト表示
        setTimeout(() => {
            alert(`🎉 対戦終了！\n\n${winnerText}\n\nもう一度プレイしますか？`);
            this.resetBattle();
        }, 1000);
        
        // ボタンを元に戻す
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.remove('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.add('hidden');
        }
    }
    
    endGameByTime() {
        console.log('⏰ 時間切れ！');
        this.gameRunning = false;
        
        // タイマー停止
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // BGM停止
        this.stopBattleBgm();
        
        // スコアで勝敗を決定
        let winner;
        if (this.playerScore > this.cpuScore) {
            winner = 'player';
        } else if (this.cpuScore > this.playerScore) {
            winner = 'cpu';
        } else {
            winner = 'draw';
        }
        
        const winnerText = winner === 'player' ? 'あなたの勝利！' : 
                          winner === 'cpu' ? 'CPUの勝利！' : '引き分け！';
        
        // 画面にリザルト表示
        setTimeout(() => {
            alert(`⏰ 時間切れ！\n\n${winnerText}\n\nプレイヤー: ${this.playerScore}点\nCPU: ${this.cpuScore}点\n\nもう一度プレイしますか？`);
            this.resetBattle();
        }, 1000);
        
        // ボタンを元に戻す
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.remove('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.add('hidden');
        }
    }
    
    resetBattle() {
        console.log('🔄 対戦をリセット');
        
        // ゲーム状態をリセット
        this.gameRunning = false;
        this.playerGameOver = false;
        this.cpuGameOver = false;
        this.timeLeft = 180;
        
        // ボードをクリア
        this.playerBoard = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.cpuBoard = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        
        // 連鎖・おじゃまぷよ状態をリセット
        this.playerChainCount = 0;
        this.cpuChainCount = 0;
        this.playerPendingGarbage = 0;
        this.cpuPendingGarbage = 0;
        
        // スコアをリセット
        this.playerScore = 0;
        this.cpuScore = 0;
        
        // UI表示を更新
        if (this.timeLeftDisplay) {
            this.timeLeftDisplay.textContent = this.timeLeft;
        }
        if (this.playerScoreDisplay) {
            this.playerScoreDisplay.textContent = this.playerScore;
        }
        if (this.cpuScoreDisplay) {
            this.cpuScoreDisplay.textContent = this.cpuScore;
        }
        
        // ピースを再生成
        this.generateNextPiece('player');
        this.generateNextPiece('cpu');
        this.spawnNewPiece('player');
        this.spawnNewPiece('cpu');
        
        // 画面を再描画
        this.drawGameBoard('player');
        this.drawGameBoard('cpu');
        
        console.log('✅ 対戦リセット完了');
    }
    
    destroy() {
        console.log('🧹 対戦ゲームをクリーンアップ');
        this.gameRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // イベントリスナーを削除
        if (this.boundKeyHandler) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
        
        // ゲーム状態をリセット
        this.playerBoard = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.cpuBoard = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.playerCurrentPiece = null;
        this.cpuCurrentPiece = null;
        this.playerGameOver = false;
        this.cpuGameOver = false;
    }
    
    // ================================================
    // 強化されたAI評価用ヘルパーメソッド
    // ================================================
    
    // 周辺の同色ぷよをカウント
    countAdjacentSameColor(board, connected, color) {
        let count = 0;
        const directions = [{x: 0, y: 1}, {x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}];
        
        for (const pos of connected) {
            for (const dir of directions) {
                const newX = pos.x + dir.x;
                const newY = pos.y + dir.y;
                
                if (newX >= 0 && newX < this.BOARD_WIDTH && newY >= 0 && newY < this.BOARD_HEIGHT) {
                    if (board[newY][newX] === color && !connected.some(p => p.x === newX && p.y === newY)) {
                        count++;
                    }
                }
            }
        }
        
        return count;
    }
    
    // 階段積みパターンマッチング
    matchesStairPattern(board, startX, startY) {
        if (startX + 3 >= this.BOARD_WIDTH || startY + 2 >= this.BOARD_HEIGHT) return false;
        
        // 基本の階段パターンをチェック
        const pattern = [
            {x: 0, y: 0}, {x: 1, y: 0},
            {x: 1, y: 1}, {x: 2, y: 1},
            {x: 2, y: 2}, {x: 3, y: 2}
        ];
        
        const colors = new Map();
        for (const pos of pattern) {
            const x = startX + pos.x;
            const y = startY + pos.y;
            const color = board[y][x];
            
            if (color === 0 || color === this.GARBAGE_PUYO) return false;
            
            const key = `${pos.x}_${pos.y}`;
            if (!colors.has(key)) {
                colors.set(key, color);
            }
        }
        
        // 同じ高さのペアが同色かチェック
        return (colors.get('0_0') === colors.get('1_0') &&
                colors.get('1_1') === colors.get('2_1') &&
                colors.get('2_2') === colors.get('3_2'));
    }
    
    // 鍵積みパターンマッチング
    matchesSandwichPattern(board, startX, startY) {
        if (startX + 2 >= this.BOARD_WIDTH || startY + 1 >= this.BOARD_HEIGHT) return false;
        
        const leftColor = board[startY][startX];
        const centerColor = board[startY][startX + 1];
        const rightColor = board[startY][startX + 2];
        const topColor = board[startY + 1][startX + 1];
        
        if (leftColor === 0 || centerColor === 0 || rightColor === 0 || topColor === 0) return false;
        if (leftColor === this.GARBAGE_PUYO || centerColor === this.GARBAGE_PUYO || 
            rightColor === this.GARBAGE_PUYO || topColor === this.GARBAGE_PUYO) return false;
        
        // 左右が同色で、中央と上が同色の鍵積みパターン
        return (leftColor === rightColor && centerColor === topColor && leftColor !== centerColor);
    }
    
    // GTRパターンマッチング
    matchesGTRPattern(board, startX, startY) {
        if (startX + 1 >= this.BOARD_WIDTH || startY + 2 >= this.BOARD_HEIGHT) return false;
        
        const pattern = [
            board[startY][startX], board[startY][startX + 1],
            board[startY + 1][startX], board[startY + 1][startX + 1],
            board[startY + 2][startX], board[startY + 2][startX + 1]
        ];
        
        // 全てのセルが空でないことを確認
        if (pattern.some(color => color === 0 || color === this.GARBAGE_PUYO)) return false;
        
        // GTRパターン: AB / CA / BC の形
        return (pattern[0] !== pattern[1] && pattern[2] !== pattern[3] && pattern[4] !== pattern[5] &&
                pattern[0] === pattern[3] && pattern[1] === pattern[4] && pattern[2] === pattern[5]);
    }
    
    // 連鎖の種を検出
    findChainSeeds(board) {
        const seeds = [];
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] > 0 && board[y][x] !== this.GARBAGE_PUYO) {
                    const connected = this.findConnectedPuyos(board, x, y, board[y][x], Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false)));
                    
                    if (connected.length === 2 || connected.length === 3) {
                        seeds.push({x: x, y: y, color: board[y][x], size: connected.length});
                    }
                }
            }
        }
        
        return seeds;
    }
    
    // 特定色のぷよ位置を取得
    findColorPositions(board, color) {
        const positions = [];
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (board[y][x] === color) {
                    positions.push({x: x, y: y});
                }
            }
        }
        
        return positions;
    }
}

// ================================================
// ゲーム初期化時にモード管理システムを追加
// ================================================

// DOMが読み込まれた後にゲームを初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 おぐなお - ゲーム初期化開始');
    
    // グローバルイベントリスナーを全てクリア
    PuyoPuyoGame.removeAllGlobalEventListeners();
    
    // まずゲームインスタンスを作成
    window.game = new PuyoPuyoGame();
    console.log('✅ ゲームインスタンス作成完了');
    
    // BattleGameクラスをグローバルに公開
    window.BattleGame = BattleGame;
    console.log('✅ BattleGameクラスをグローバルに公開しました');
    
    // 少し遅延させてモード管理システムを初期化
    setTimeout(() => {
        window.gameModeManager = new GameModeManager();
        
        // ゲームインスタンスをモード管理システムに登録
        if (window.game) {
            window.gameModeManager.setGameInstance(window.game);
            console.log('✅ ゲームインスタンスを正常に登録しました');
        } else {
            console.log('⚠️ ゲームインスタンスが見つかりません');
        }
    }, 100);
});