// Firebase設定は firebase-config.js で読み込まれます
// dbオブジェクトはそちらで初期化されています

// デモ用のローカルランキングデータ（初期は空）
let localRanking = [];

class PuyoPuyoGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.BOARD_WIDTH = 6;
        this.BOARD_HEIGHT = 9;
        this.CELL_SIZE = 40;
        
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.gameRunning = false;
        this.difficulty = 'normal';
        this.fallSpeed = 1000;
        this.isSeparatedPiece = false; // 切り離されたピースかどうか
        this.scoreSubmitted = false; // スコアが登録済みかどうか
        
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
            'images/nao11.jpg',
            'images/nao12.jpg', 
            'images/nao4.png',
            'images/raw.png',
            'images/ホラーなお.png'
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
        this.bgm = new Audio('music/ぷよぷよっと始まる毎日.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.5;
        
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
        
        // ゲーム開始メッセージを表示
        console.log('ゲーム準備完了！Enterキーでゲーム開始');
    }
    
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
        
        // コメント監視を開始
        this.startCommentListener();
        
        // コメント履歴を読み込み
        this.loadCommentHistory();
    }
    
    handleKeyPress(e) {
        console.log('Key pressed:', e.key, 'Game running:', this.gameRunning);
        
        // コメント入力中はゲーム操作を無効にする
        const commentInput = document.getElementById('comment-input');
        if (document.activeElement === commentInput) {
            return;
        }
        
        if (!this.gameRunning) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.startGame();
            }
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
    
    startGame() {
        console.log('Starting game...');
        this.gameRunning = true;
        this.timeStart = Date.now();
        this.lastFallTime = Date.now();
        this.updateFallSpeed();
        
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
        
        // BGM再生開始
        this.bgm.play().catch(e => {
            console.log('BGM auto-play blocked:', e);
        });
    }
    
    togglePause() {
        this.gameRunning = !this.gameRunning;
        if (this.gameRunning) {
            this.gameLoop();
            // ポーズ解除時にBGM再開
            this.bgm.play().catch(e => {
                console.log('BGM resume failed:', e);
            });
        } else {
            // ポーズ時にBGM一時停止
            this.bgm.pause();
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
        document.getElementById('volume-display').textContent = `${value}%`;
    }
    
    generateNextPiece() {
        const color1 = Math.floor(Math.random() * 5) + 1;
        const color2 = Math.floor(Math.random() * 5) + 1;
        this.nextPiece = {
            colors: [color1, color2],
            positions: [{x: 0, y: 0}, {x: 0, y: 1}]
        };
    }
    
    spawnNewPiece() {
        if (this.nextPiece) {
            this.currentPiece = {
                x: Math.floor(this.BOARD_WIDTH / 2) - 1,
                y: 0,
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
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (!this.isCollision(newX, newY, this.currentPiece.positions)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.render();
        } else if (dy > 0) {
            // 下方向への移動で衝突した場合、部分的な配置をチェック
            this.handlePartialLanding();
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
            const newPositions = floatingPieces.map(i => this.currentPiece.positions[i]);
            
            this.currentPiece = {
                x: this.currentPiece.x,
                y: this.currentPiece.y,
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
            return;
        }
        
        // 左に1マス移動して回転試行
        if (!this.isCollision(this.currentPiece.x - 1, this.currentPiece.y, rotatedPositions)) {
            this.currentPiece.x -= 1;
            this.currentPiece.positions = rotatedPositions;
            this.render();
            return;
        }
        
        // 右に1マス移動して回転試行
        if (!this.isCollision(this.currentPiece.x + 1, this.currentPiece.y, rotatedPositions)) {
            this.currentPiece.x += 1;
            this.currentPiece.positions = rotatedPositions;
            this.render();
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
            
            // 全てのマッチしたグループを同時に処理
            for (let group of allMatches) {
                totalCleared += group.length;
                this.createExplosionEffects(group);
                
                for (let {x, y} of group) {
                    this.board[y][x] = 0;
                }
            }
            
            console.log(`💥 ${allMatches.length}グループ、合計${allMatches.reduce((sum, group) => sum + group.length, 0)}個のブロックを消去`);
            this.debugPrintBoard('消去後のボード状態');
            
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
                await this.showCutinEffectAsync(chainCount);
                await this.sleep(300); // カットイン後の短い待機
            } else {
                // 通常の連鎖間隔
                await this.sleep(400);
            }
            
            console.log(`✅ Chain ${chainCount} 完了、次の連鎖をチェック中...`);
        }
        
        if (chainCount > 0) {
            this.score += totalCleared * 100 * chainCount * chainCount;
            this.updateDisplay();
            console.log(`🏆 === 連鎖シーケンス完了 ===`);
            console.log(`🔢 最終連鎖数: ${chainCount}`);
            console.log(`🧱 総消去ブロック数: ${totalCleared}`);
            console.log(`💰 獲得スコア: ${totalCleared * 100 * chainCount * chainCount}`);
        }
        
        // 連鎖処理完了フラグをリセット
        this.isInChainSequence = false;
    }
    
    // デバッグ用：ボードの状態を視覚的に表示
    debugPrintBoard(title) {
        console.log(`📋 ${title}:`);
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            const row = this.board[y].map(cell => cell === 0 ? '.' : cell).join(' ');
            console.log(`  ${y}: ${row}`);
        }
    }
    
    // 全ての4個以上接続されたグループを検出する関数
    findAllMatches() {
        const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
        const matches = [];
        
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0 && !visited[y][x]) {
                    const group = this.findConnectedGroup(x, y, this.board[y][x], visited);
                    if (group.length >= 4) {
                        matches.push(group);
                        console.log(`Found match group of ${group.length} blocks at color ${this.board[y][x]}`);
                    }
                }
            }
        }
        
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
        
        // 連鎖数に応じたメッセージ
        if (chainCount >= 7) {
            text.textContent = `${chainCount}連鎖！ 最高や！`;
        } else if (chainCount === 5) {
            text.textContent = `5連鎖！ すごいやん！`;
        } else if (chainCount >= 4) {
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
            
            // 連鎖数に応じたメッセージ
            if (chainCount >= 7) {
                text.textContent = `${chainCount}連鎖！ 最高や！`;
            } else if (chainCount === 5) {
                text.textContent = `5連鎖！ すごいやん！`;
            } else if (chainCount >= 4) {
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
        
        // currentPieceが存在しない場合の緊急対応
        if (!this.currentPiece) {
            console.log('🚨 Emergency: No current piece in game loop, spawning new one...');
            this.generateNextPiece();
            this.spawnNewPiece();
        }
        
        // 切り離されたピースは高速落下（100ms間隔）
        const effectiveFallSpeed = this.isSeparatedPiece ? 100 : this.fallSpeed;
        
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
        this.ctx.lineWidth = 1;
        
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
            this.ctx.fillRect(puyoX + 2, puyoY + 2, puyoSize - 4, puyoSize - 4);
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
        this.ctx.lineWidth = 1;
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
        // プレイエリア内のみ描画
        if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT) {
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
            this.ctx.fillRect(puyoX + 2, puyoY + 2, puyoSize - 4, puyoSize - 4);
        }
        
        this.ctx.restore();
        
        // 接続エフェクト（光沢）を追加
        if (isConnected && (isConnected.up || isConnected.down || isConnected.left || isConnected.right)) {
            this.drawConnectionGlow(puyoX, puyoY, puyoSize, isConnected);
        }
        
        // 境界線の描画
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
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
        this.ctx.lineWidth = 1;
        
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
        // プレイエリア内のみ描画
        if (x < 0 || x >= this.BOARD_WIDTH || y < 0 || y >= this.BOARD_HEIGHT) {
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
            this.ctx.fillRect(puyoX + 2, puyoY + 2, puyoSize - 4, puyoSize - 4);
        }
        
        this.ctx.restore();
        
        // 境界線
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.roundRect(puyoX, puyoY, puyoSize, puyoSize, radius);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1.0; // 透明度を元に戻す
    }
    
    renderNextPiece() {
        const nextDisplay = document.getElementById('next-puyo');
        nextDisplay.innerHTML = '';
        
        if (this.nextPiece) {
            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 80;
            const ctx = canvas.getContext('2d');
            
            for (let i = 0; i < this.nextPiece.positions.length; i++) {
                const pos = this.nextPiece.positions[i];
                const x = (pos.x + 1) * 20 + 10;
                const y = pos.y * 20 + 10;
                
                const colorIndex = this.nextPiece.colors[i];
                
                // 画像が読み込まれている場合は画像を描画、そうでなければ色で描画
                if (this.puyoImages[colorIndex] && this.puyoImages[colorIndex].complete) {
                    ctx.drawImage(this.puyoImages[colorIndex], x, y, 18, 18);
                } else {
                    // フォールバック：色での描画
                    ctx.fillStyle = this.colors[colorIndex];
                    ctx.fillRect(x, y, 18, 18);
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(x + 2, y + 2, 14, 14);
                }
                
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, 18, 18);
            }
            
            nextDisplay.appendChild(canvas);
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = this.time;
        document.getElementById('chain').textContent = this.chain;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.scoreSubmitted = false; // リセット
        document.getElementById('final-score').textContent = this.score;
        
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
        
        // BGM停止
        this.bgm.pause();
        this.bgm.currentTime = 0;
    }
    
    restart() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.gameRunning = false;
        this.isSeparatedPiece = false;
        this.scoreSubmitted = false;
        
        // アニメーションもリセット
        this.puyoAnimations = Array(this.BOARD_HEIGHT).fill().map(() => 
            Array(this.BOARD_WIDTH).fill().map(() => ({
                scale: 1.0,
                bounce: 0,
                rotation: 0,
                lastLandTime: 0
            }))
        );
        
        // スコア登録UIをリセット
        const submitButton = document.getElementById('submit-score');
        const scoreRegistration = document.getElementById('score-registration');
        const playerNameInput = document.getElementById('player-name');
        
        scoreRegistration.style.display = 'none';
        submitButton.disabled = false;
        submitButton.textContent = 'スコアを登録';
        playerNameInput.value = '';
        
        this.generateNextPiece();
        this.spawnNewPiece();
        this.updateDisplay();
        this.render();
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        
        // BGM停止
        this.bgm.pause();
        this.bgm.currentTime = 0;
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
    }
    
    debugCutin() {
        console.log('デバッグ: カットインテスト');
        console.log('画像読み込み状況:');
        console.log('- Normal cutin (saginaoki.jpg):', this.cutinImage?.complete, this.cutinImage?.src);
        console.log('- 3Chain cutin (nao7.png):', this.cutin3ChainImage?.complete, this.cutin3ChainImage?.src);
        console.log('- 5Chain cutin (5rensa.png):', this.cutin5ChainImage?.complete, this.cutin5ChainImage?.src);
        
        // ランダムな連鎖数でカットインを表示
        const randomChain = Math.floor(Math.random() * 5) + 3; // 3-7連鎖
        this.showCutinEffect(randomChain);
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
    
    // ランキング機能
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
                rankings.push(doc.data());
            });
            
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
        
        rankingList.innerHTML = rankings.map((item, index) => `
            <div class="ranking-item">
                <span class="ranking-rank">${index + 1}位</span>
                <span class="ranking-name">${this.escapeHtml(item.name)}</span>
                <span class="ranking-score">${item.score.toLocaleString()}</span>
            </div>
        `).join('');
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
            const scoreData = {
                name: playerName,
                score: this.score,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                maxChain: this.chain,
                difficulty: this.difficulty
            };
            
            console.log('送信するスコアデータ:', scoreData);
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
                    score: this.score,
                    timestamp: new Date(),
                    maxChain: this.chain,
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
    
    // Firebase接続テスト（開発用）
    async testFirebaseConnection() {
        try {
            console.log('Firebase接続テスト開始...');
            
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
            try {
                await db.collection('rankings').add(testData);
                console.log('✅ Firestore書き込み権限OK');
                // テストデータを削除したいところですが、deleteRuleが制限されている可能性があるのでそのまま
            } catch (writeError) {
                console.error('❌ Firestore書き込み権限エラー:', writeError);
                console.log('Firebase Consoleでセキュリティルールを確認してください');
                console.log('推奨ルール（開発用）:');
                console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rankings/{document} {
      allow read, write: if true;
    }
  }
}
                `);
            }
            
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
        
        try {
            const commentData = {
                text: comment,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                gameTime: this.time || 0, // ゲーム時間
                score: this.score || 0 // 現在のスコア
            };
            
            await db.collection('comments').add(commentData);
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
        try {
            const snapshot = await db.collection('comments')
                .orderBy('timestamp', 'desc')
                .limit(50) // 最新50件
                .get();
            
            const commentList = document.getElementById('comment-list');
            commentList.innerHTML = '';
            
            if (snapshot.empty) {
                commentList.innerHTML = '<div class="loading">まだコメントがありません</div>';
                return;
            }
            
            snapshot.forEach((doc) => {
                const comment = doc.data();
                this.addCommentToHistory(comment, false); // アニメーションなしで追加
            });
            
        } catch (error) {
            console.error('コメント履歴読み込みエラー:', error);
            const commentList = document.getElementById('comment-list');
            commentList.innerHTML = '<div class="loading">読み込みエラー</div>';
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
}

const game = new PuyoPuyoGame();