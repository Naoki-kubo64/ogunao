// Firebase設定は firebase-config.js で読み込まれます
// dbオブジェクトはそちらで初期化されています

// デモ用のローカルランキングデータ（初期は空）
let localRanking = [];

class PuyoPuyoGame {
    constructor() {
        // === コア設定 ===
        this.initializeCanvas();
        this.initializeGameState();
        this.initializeAudio();
        this.initializeImages();
        this.initializeTimers();
        this.initializeFlags();
        
        // === システム初期化 ===
        this.setupEventListeners();
        this.setupTitleBgmTrigger();
        this.setupVolumeControls();
        
        // === Firebase & UI ===
        this.testFirebaseConnection();
        this.initializeCommentSystem();
        this.loadRanking();
        
        // === 初回レンダリング ===
        this.render();
        
        console.log('ゲーム準備完了！Enterキーでゲーム開始');
    }
    
    // ================================================
    // 初期化メソッド群
    // ================================================
    
    initializeCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.BOARD_WIDTH = 6;
        this.BOARD_HEIGHT = 9;
        this.CELL_SIZE = 80;
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    initializeGameState() {
        this.currentPiece = null;
        this.nextPiece = null;
        this.nextPiece2 = null;
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.gameRunning = false;
        this.difficulty = 'normal';
        this.fallSpeed = 1000;
        this.isSeparatedPiece = false;
        this.scoreSubmitted = false;
        this.isPlacingPiece = false;
    }
    
    initializeAudio() {
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
        
        // SE音量の初期化
        this.updateSeVolume();
        
        // BGM管理用の変数
        this.currentBgm = null;
        this.bgmSwitched = false;
        this.fadeInterval = null;
    }
    
    initializeImages() {
        this.images = {};
        this.imagesLoaded = 0;
        this.totalImages = 7;
        
        const imageConfigs = [
            { key: 'nao4', src: 'images/nao4.png', name: 'Nao4 image' },
            { key: 'raw', src: 'images/raw.png', name: 'Raw image' },
            { key: 'otafuku', src: 'images/otafuku.png', name: 'Otafuku image' },
            { key: '歌手', src: 'images/歌手.png', name: '歌手 image' },
            { key: 'nao12', src: 'images/nao12.jpg', name: 'Nao12 image' },
            { key: 'cutin', src: 'images/saginaoki.jpg', name: 'Cutin image' },
            { key: 'cutin5Chain', src: 'images/5rensa.png', name: '5Chain cutin image' }
        ];
        
        imageConfigs.forEach(config => {
            const img = new Image();
            img.onload = () => {
                this.imagesLoaded++;
                console.log(`✅ ${config.name} loaded`);
                if (this.imagesLoaded === this.totalImages) {
                    console.log('All images loaded');
                    this.render();
                }
            };
            img.onerror = () => {
                console.error(`❌ Failed to load ${config.name}: ${config.src}`);
                this.imagesLoaded++;
            };
            img.src = config.src;
            this.images[config.key] = img;
        });
    }
    
    initializeTimers() {
        this.lastFallTime = 0;
        this.timeStart = 0;
        this.lastUpdate = 0;
        this.frameCount = 0;
        this.secretKeySequence = [];
        this.debugModeVisible = true;
    }
    
    initializeFlags() {
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
        
        // 応援システムフラグ
        this.supportTriggered50k = false;
        this.supportTriggered100k = false;
        this.supportTriggered200k = false;
        this.supportTriggered600k = false;
        this.supportTriggered1M = false;
        
        // なおちゃんチャット
        this.lastNaochanChatTime = 0;
        this.naochanChatCooldown = 15000;
        this.initNaochanChat();
    }
    
    // ================================================
    // 音量管理メソッド群
    // ================================================
    
    updateBgmVolume() {
        if (this.titleBgm) this.titleBgm.volume = this.bgmVolume;
        if (this.bgm) this.bgm.volume = this.bgmVolume;
        if (this.bgm2) this.bgm2.volume = this.bgmVolume;
        if (this.naochanBgm) this.naochanBgm.volume = this.bgmVolume;
    }
    
    updateSeVolume() {
        const seElements = [
            this.gameStartSE, this.chain2SE, this.chain3SE, this.chain4SE,
            this.moveSE, this.rotateSE, this.clearSE, this.naochanTimeSE
        ];
        
        seElements.forEach(se => {
            if (se) se.volume = this.seVolume;
        });
        
        console.log(`🔊 SE音量を ${Math.round(this.seVolume * 100)}% に設定しました`);
    }
    
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
    
    playSE(seElement, seName) {
        if (seElement) {
            seElement.currentTime = 0;
            seElement.volume = this.seVolume;
            seElement.play().catch(e => {
                console.log(`${seName} SE再生に失敗:`, e.message);
            });
            console.log(`🔊 ${seName} SE再生 (音量: ${Math.round(this.seVolume * 100)}%)`);
        } else {
            console.log(`❌ ${seName} SE要素が見つかりません`);
        }
    }
    
    // ================================================
    // イベントリスナー設定
    // ================================================
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateFallSpeed();
        });
        
        // ヘルプボタン
        document.getElementById('help-button').addEventListener('click', () => {
            const modal = document.getElementById('help-modal');
            modal.classList.remove('hidden');
        });
        
        document.getElementById('help-close').addEventListener('click', () => {
            const modal = document.getElementById('help-modal');
            modal.classList.add('hidden');
        });
        
        // ランキング関連ボタン
        document.getElementById('refresh-ranking').addEventListener('click', () => this.loadRanking());
        document.getElementById('submit-score').addEventListener('click', () => this.submitScore());
        
        // コメント機能ボタン
        document.getElementById('send-comment').addEventListener('click', () => this.sendComment());
        document.getElementById('comment-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                this.sendComment();
            }
        });
        
        // デバッグボタン設定
        this.setupDebugButtons();
    }
    
    setupDebugButtons() {
        const debugButtons = [
            'debug-2chain', 'debug-3chain', 'debug-4chain', 'debug-5chain', 'debug-7chain',
            'debug-pattern-2', 'debug-pattern-3', 'debug-pattern-4', 'debug-pattern-5', 'debug-pattern-7',
            'debug-clear', 'debug-manual-mode', 'debug-exit-manual', 'debug-naochan-time',
            'debug-ogu-combo', 'debug-nao-combo', 'debug-saikyo-combo', 'debug-cutin'
        ];
        
        debugButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                const methodName = this.getDebugMethodName(buttonId);
                if (this[methodName]) {
                    button.addEventListener('click', () => this[methodName]());
                }
            }
        });
    }
    
    getDebugMethodName(buttonId) {
        const methodMap = {
            'debug-2chain': 'debug2Chain',
            'debug-3chain': 'debug3Chain',
            'debug-4chain': 'debug4Chain',
            'debug-5chain': 'debug5Chain',
            'debug-7chain': 'debug7Chain',
            'debug-pattern-2': 'debugPattern2',
            'debug-pattern-3': 'debugPattern3',
            'debug-pattern-4': 'debugPattern4',
            'debug-pattern-5': 'debugPattern5',
            'debug-pattern-7': 'debugPattern7',
            'debug-clear': 'debugClearBoard',
            'debug-manual-mode': 'debugManualMode',
            'debug-exit-manual': 'debugExitManual',
            'debug-naochan-time': 'debugNaochanTime',
            'debug-ogu-combo': 'debugOguCombo',
            'debug-nao-combo': 'debugNaoCombo',
            'debug-saikyo-combo': 'debugSaikyoCombo',
            'debug-cutin': 'debugCutin'
        };
        return methodMap[buttonId];
    }
    
    // ================================================
    // BGM管理メソッド群
    // ================================================
    
    startTitleBgm() {
        if (this.titleBgm) {
            this.titleBgm.play().catch(e => {
                console.log('タイトルBGM auto-play blocked:', e);
            });
            this.currentBgm = this.titleBgm;
            console.log('🎵 タイトルBGM開始');
        }
    }
    
    setupTitleBgmTrigger() {
        let triggered = false;
        
        const triggerBgm = () => {
            if (!triggered) {
                this.startTitleBgm();
                triggered = true;
                
                document.removeEventListener('click', triggerBgm);
                document.removeEventListener('keydown', triggerBgm);
                document.removeEventListener('touchstart', triggerBgm);
            }
        };
        
        document.addEventListener('click', triggerBgm);
        document.addEventListener('keydown', triggerBgm);
        document.addEventListener('touchstart', triggerBgm);
        
        console.log('タイトルBGMトリガー設定完了');
    }
    
    startGameBgm() {
        if (this.titleBgm) {
            this.titleBgm.pause();
            this.titleBgm.currentTime = 0;
        }
        
        if (this.bgm) {
            this.bgm.play().catch(e => {
                console.log('BGM auto-play blocked:', e);
            });
            this.currentBgm = this.bgm;
            console.log('🎵 ゲームBGM開始');
        }
    }
    
    async switchBgm(newBgm, targetVolume = 0.5) {
        console.log('🎵 BGM切り替え開始');
        
        if (this.currentBgm && !this.currentBgm.paused) {
            await this.fadeOutBgm(this.currentBgm);
        }
        
        this.currentBgm = newBgm;
        await this.fadeInBgm(newBgm, targetVolume);
        
        console.log('🎵 BGM切り替え完了');
    }
    
    fadeOutBgm(bgmElement, duration = 2000) {
        return new Promise((resolve) => {
            if (!bgmElement || bgmElement.paused) {
                resolve();
                return;
            }
            
            const startVolume = bgmElement.volume;
            const fadeStep = startVolume / (duration / 50);
            
            const fadeInterval = setInterval(() => {
                if (bgmElement.volume > fadeStep) {
                    bgmElement.volume -= fadeStep;
                } else {
                    bgmElement.volume = 0;
                    bgmElement.pause();
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, 50);
        });
    }
    
    fadeInBgm(bgmElement, targetVolume = 0.5, duration = 2000) {
        return new Promise((resolve) => {
            if (!bgmElement) {
                resolve();
                return;
            }
            
            bgmElement.volume = 0;
            bgmElement.play().catch(e => console.log('BGM再生エラー:', e));
            
            const fadeStep = targetVolume / (duration / 50);
            
            const fadeInterval = setInterval(() => {
                if (bgmElement.volume < targetVolume - fadeStep) {
                    bgmElement.volume += fadeStep;
                } else {
                    bgmElement.volume = targetVolume;
                    clearInterval(fadeInterval);
                    resolve();
                }
            }, 50);
        });
    }
    
    checkScoreAndSwitchBgm() {
        if (this.score >= 200000 && !this.bgmSwitched) {
            console.log('🏆 スコア200000達成！BGMを切り替えます');
            this.bgmSwitched = true;
            this.switchBgm(this.bgm2);
        }
    }
    
    // ================================================
    // ゲームロジック メソッド群
    // ================================================
    
    handleKeyPress(e) {
        const activeElement = document.activeElement;
        console.log(`Key pressed: ${e.key} Game running: ${this.gameRunning} Active element: ${activeElement.id}`);
        
        if (activeElement && activeElement.id === 'comment-input') {
            return;
        }
        
        if (activeElement && activeElement.id === 'player-name') {
            return;
        }
        
        if (e.key === 'Enter') {
            if (!this.gameRunning) {
                this.startGame();
                return;
            } else {
                this.togglePause();
                return;
            }
        }
        
        this.handleSecretCommand(e.key);
        
        if (this.gameRunning && this.currentPiece) {
            switch (e.key.toLowerCase()) {
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
                    this.rotatePiece();
                    break;
            }
        }
    }
    
    handleSecretCommand(key) {
        if (!key || typeof key !== 'string') {
            return;
        }
        
        this.secretKeySequence.push(key.toLowerCase());
        
        if (this.secretKeySequence.length > 5) {
            this.secretKeySequence.shift();
        }
        
        const sequence = this.secretKeySequence.join('');
        if (sequence.includes('debug')) {
            this.toggleDebugMode();
            this.secretKeySequence = [];
        }
    }
    
    toggleDebugMode() {
        const debugControls = document.querySelector('.debug-controls');
        if (debugControls) {
            this.debugModeVisible = !this.debugModeVisible;
            debugControls.style.display = this.debugModeVisible ? 'block' : 'none';
            console.log(`🔧 デバッグモード: ${this.debugModeVisible ? 'ON' : 'OFF'}`);
        }
    }
    
    togglePause() {
        this.gameRunning = !this.gameRunning;
        if (this.gameRunning) {
            this.gameLoop();
            if (this.currentBgm) {
                this.currentBgm.play().catch(e => {
                    console.log('BGM resume failed:', e);
                });
            }
        } else {
            if (this.currentBgm) {
                this.currentBgm.pause();
            }
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.timeStart = Date.now();
        this.lastFallTime = Date.now();
        
        this.clearGameState();
        this.startGameBgm();
        this.generateNewPiece();
        this.gameLoop();
        
        document.getElementById('game-over').classList.add('hidden');
        console.log('🎮 ゲーム開始！');
    }
    
    // 続きは次のファイルに...
}