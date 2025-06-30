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
        this.BOARD_HEIGHT = 9;
        this.CELL_SIZE = 80;
        
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.nextPiece2 = null; // なおコンボ用の2個目のピース
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.gameRunning = false;
        this.difficulty = 'normal';
        this.fallSpeed = 1000;
        this.isSeparatedPiece = false; // 切り離されたピースかどうか
        this.scoreSubmitted = false; // スコアが登録済みかどうか
        this.isPlacingPiece = false; // ピース配置中かどうか
        
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
    // 🎮 イベントリスナー設定
    // ================================================
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateFallSpeed();
        });
        
        // 音量調整
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.updateVolume(e.target.value);
        });
        
        // デバッグボタンのイベントリスナー
        document.getElementById('debug-2chain').addEventListener('click', () => this.debugChain(2));
        document.getElementById('debug-3chain').addEventListener('click', () => this.debugChain(3));
        document.getElementById('debug-4chain').addEventListener('click', () => this.debugChain(4));
        document.getElementById('debug-5chain').addEventListener('click', () => this.debugChain(5));
        document.getElementById('debug-7chain').addEventListener('click', () => this.debugChain(7));
        document.getElementById('debug-cutin').addEventListener('click', () => this.debugCutin());
        document.getElementById('debug-clear').addEventListener('click', () => this.debugClear());
        
        // 連鎖パターン設置ボタン
        document.getElementById('debug-pattern-2').addEventListener('click', () => this.debugSetChainPattern(2));
        document.getElementById('debug-pattern-3').addEventListener('click', () => this.debugSetChainPattern(3));
        document.getElementById('debug-pattern-4').addEventListener('click', () => this.debugSetChainPattern(4));
        document.getElementById('debug-pattern-5').addEventListener('click', () => this.debugSetChainPattern(5));
        document.getElementById('debug-pattern-7').addEventListener('click', () => this.debugSetChainPattern(7));
        
        // 手動配置モード関連ボタン
        document.getElementById('debug-manual-mode').addEventListener('click', () => this.toggleManualPlaceMode());
        document.getElementById('debug-exit-manual').addEventListener('click', () => this.exitManualPlaceMode());
        
        // 新機能デバッグボタン
        document.getElementById('debug-naochan-time').addEventListener('click', () => this.debugNaochanTime());
        document.getElementById('debug-ogu-combo').addEventListener('click', () => this.debugOguCombo());
        document.getElementById('debug-nao-combo').addEventListener('click', () => this.debugNaoCombo());
        document.getElementById('debug-saikyo-combo').addEventListener('click', () => this.debugSaikyoCombo());
        
        // 色選択ボタン
        for (let i = 0; i <= 5; i++) {
            document.getElementById(`color-${i}`).addEventListener('click', () => this.selectColor(i));
        }
        
        // ゲームキャンバスのクリックイベント
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // ランキング関連ボタン
        document.getElementById('refresh-ranking').addEventListener('click', () => this.loadRanking());
        document.getElementById('submit-score').addEventListener('click', () => this.submitScore());
        
        // コメント機能ボタン
        document.getElementById('send-comment').addEventListener('click', () => this.sendComment());
        document.getElementById('comment-input').addEventListener('keypress', (e) => {
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
    }
    
    // ================================================
    // 🔊 音量管理メソッド群
    // ================================================
    updateBgmVolume() {
        if (this.titleBgm) this.titleBgm.volume = this.bgmVolume;
        if (this.bgm) this.bgm.volume = this.bgmVolume;
        if (this.bgm2) this.bgm2.volume = this.bgmVolume;
        if (this.naochanBgm) this.naochanBgm.volume = this.bgmVolume;
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
    
    startTitleBgm() {
        if (this.titleBgm) {
            this.titleBgm.play().catch(e => {
                console.log('タイトルBGM再生に失敗:', e.message);
            });
        }
    }
    
    stopTitleBgm() {
        if (this.titleBgm) {
            this.titleBgm.pause();
            this.titleBgm.currentTime = 0;
        }
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
        console.log('Key pressed:', e.key, 'Game running:', this.gameRunning, 'Active element:', document.activeElement?.id || 'none');
        
        // 隠しコマンドの処理（どの状態でも有効）
        this.handleSecretCommand(e.key);
        
        // ゲーム開始時のEnterキー処理（最優先）
        if (!this.gameRunning && e.key === 'Enter') {
            e.preventDefault();
            console.log('🎮 Starting game with Enter key');
            // コメント入力フィールドからフォーカスを外す
            const commentInput = document.getElementById('comment-input');
            if (document.activeElement === commentInput) {
                console.log('📝 Removing focus from comment input');
                commentInput.blur();
            }
            this.startGame();
            return;
        }
        
        // コメント入力中はその他のゲーム操作を無効にする
        const commentInput = document.getElementById('comment-input');
        if (document.activeElement === commentInput) {
            return;
        }
        
        if (!this.gameRunning) {
            return;
        }
        
        // 切り離されたピースは操作不可
        if (this.isSeparatedPiece) {
            if (e.key === 'Enter') {
                this.togglePause();
            }
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
            case 'enter':
                this.togglePause();
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
        console.log('Starting game...');
        
        // ゲームスタートSEを再生
        this.playSE(this.seGameStart, 'ゲームスタート');
        
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
        
        // ゲームBGM開始
        this.bgm.play().catch(e => {
            console.log('BGM auto-play blocked:', e);
        });
        this.currentBgm = this.bgm; // 現在のBGMを設定
        console.log('🎵 ゲームBGM開始');
    }
    
    togglePause() {
        this.gameRunning = !this.gameRunning;
        if (this.gameRunning) {
            this.gameLoop();
            // ポーズ解除時に現在のBGMを再開
            if (this.currentBgm) {
                this.currentBgm.play().catch(e => {
                    console.log('BGM resume failed:', e);
                });
            }
        } else {
            // ポーズ時に現在のBGMを一時停止
            if (this.currentBgm) {
                this.currentBgm.pause();
            }
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
        this.bgm.volume = volume;
        this.bgm2.volume = volume;
        this.naochanBgm.volume = volume;
        this.titleBgm.volume = volume * 0.8; // タイトルBGMは少し静か目
        
        // SE音量も調整
        if (this.seGameStart) this.seGameStart.volume = volume * 0.7;
        if (this.seChain2) this.seChain2.volume = volume * 0.8;
        if (this.seChain3) this.seChain3.volume = volume * 0.8;
        if (this.seChain4) this.seChain4.volume = volume * 0.8;
        if (this.seMove) this.seMove.volume = volume * 0.4;
        if (this.seRotate) this.seRotate.volume = volume * 0.5;
        if (this.seClear) this.seClear.volume = volume * 0.6;
        
        document.getElementById('volume-display').textContent = `${value}%`;
        console.log(`🔊 音量調整: ${value}%`);
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
        
        const currentTime = Date.now();
        
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
        requestAnimationFrame(() => this.gameLoop());
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
            canvas1.width = 96;
            canvas1.height = 96;
            const ctx1 = canvas1.getContext('2d');
            
            for (let i = 0; i < this.nextPiece.positions.length; i++) {
                const pos = this.nextPiece.positions[i];
                const x = (pos.x + 1) * 24 + 12;
                const y = pos.y * 24 + 12;
                
                const colorIndex = this.nextPiece.colors[i];
                
                // 画像が読み込まれている場合は画像を描画、そうでなければ色で描画
                if (this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
                    ctx1.drawImage(this.puyoImages[colorIndex], x, y, 28, 28);
                } else {
                    // フォールバック：色での描画
                    ctx1.fillStyle = this.colors[colorIndex];
                    ctx1.fillRect(x, y, 28, 28);
                    
                    ctx1.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx1.fillRect(x + 3, y + 3, 22, 22);
                }
                
                ctx1.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx1.lineWidth = 2;
                ctx1.strokeRect(x, y, 28, 28);
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
                canvas2.width = 96;
                canvas2.height = 96;
                const ctx2 = canvas2.getContext('2d');
                
                for (let i = 0; i < this.nextPiece2.positions.length; i++) {
                    const pos = this.nextPiece2.positions[i];
                    const x = (pos.x + 1) * 24 + 12;
                    const y = pos.y * 24 + 12;
                    
                    const colorIndex = this.nextPiece2.colors[i];
                    
                    // 画像が読み込まれている場合は画像を描画、そうでなければ色で描画
                    if (this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
                        ctx2.drawImage(this.puyoImages[colorIndex], x, y, 28, 28);
                    } else {
                        // フォールバック：色での描画
                        ctx2.fillStyle = this.colors[colorIndex];
                        ctx2.fillRect(x, y, 28, 28);
                        
                        ctx2.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx2.fillRect(x + 3, y + 3, 22, 22);
                    }
                    
                    ctx2.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx2.lineWidth = 2;
                    ctx2.strokeRect(x, y, 28, 28);
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
            this.switchBgm(this.bgm2);
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
            this.currentBgm = this.bgmSwitched ? this.bgm2 : this.bgm;
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
        
        // 画面表示を更新
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        
        // ゲームBGM停止
        this.bgm.pause();
        this.bgm.currentTime = 0;
        
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