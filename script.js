// Firebase設定は firebase-config.js で読み込まれます
// dbオブジェクトはそちらで初期化されています

// デモ用のローカルランキングデータ
let localRanking = [
    { name: "テストプレイヤー1", score: 5000, timestamp: new Date() },
    { name: "テストプレイヤー2", score: 3000, timestamp: new Date() },
    { name: "テストプレイヤー3", score: 1000, timestamp: new Date() }
];

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
        this.cutin5ChainImage = null;
        this.imagesLoaded = 0;
        this.totalImages = 7; // カットイン画像2枚を含めて7枚
        
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
        
        // カットイン画像を読み込み
        this.cutinImage = new Image();
        this.cutinImage.onload = () => {
            this.imagesLoaded++;
            console.log('Cutin image loaded');
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
            console.log('5Chain cutin image loaded');
            if (this.imagesLoaded === this.totalImages) {
                console.log('All images loaded');
                this.render();
            }
        };
        this.cutin5ChainImage.onerror = () => {
            console.error('Failed to load 5chain cutin image: images/5rensa.png');
            this.imagesLoaded++;
        };
        this.cutin5ChainImage.src = 'images/5rensa.png';
        
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
        
        // ランキング関連ボタン
        document.getElementById('refresh-ranking').addEventListener('click', () => this.loadRanking());
        document.getElementById('submit-score').addEventListener('click', () => this.submitScore());
    }
    
    handleKeyPress(e) {
        console.log('Key pressed:', e.key, 'Game running:', this.gameRunning);
        
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
        this.gameLoop();
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('start-screen').classList.add('hidden');
    }
    
    togglePause() {
        this.gameRunning = !this.gameRunning;
        if (this.gameRunning) {
            this.gameLoop();
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
            
            // 連鎖チェックを非同期で実行（現在のピースの動きを妨げない）
            setTimeout(async () => {
                await this.checkAndClearMatches();
            }, 50);
            
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
        let totalCleared = 0;
        let chainCount = 0;
        
        while (true) {
            const visited = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(false));
            const toClear = [];
            
            for (let y = 0; y < this.BOARD_HEIGHT; y++) {
                for (let x = 0; x < this.BOARD_WIDTH; x++) {
                    if (this.board[y][x] !== 0 && !visited[y][x]) {
                        const group = this.findConnectedGroup(x, y, this.board[y][x], visited);
                        if (group.length >= 4) {
                            toClear.push(...group);
                        }
                    }
                }
            }
            
            if (toClear.length === 0) break;
            
            chainCount++;
            totalCleared += toClear.length;
            
            this.createExplosionEffects(toClear);
            
            for (let {x, y} of toClear) {
                this.board[y][x] = 0;
            }
            
            this.applyGravity();
            this.render();
            
            await this.sleep(300);
        }
        
        if (chainCount > 0) {
            this.chain = Math.max(this.chain, chainCount);
            this.score += totalCleared * 100 * chainCount * chainCount;
            this.updateDisplay();
            
            if (chainCount > 1) {
                this.showChainEffect(chainCount);
                // 連鎖数に応じてカットインを表示
                if (chainCount >= 3) {
                    this.showCutinEffect(chainCount);
                }
            }
        }
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
        // 5連鎖の場合は専用画像を使用
        let cutinImageToUse;
        if (chainCount === 5 && this.cutin5ChainImage && this.cutin5ChainImage.complete) {
            cutinImageToUse = this.cutin5ChainImage;
        } else if (this.cutinImage && this.cutinImage.complete) {
            cutinImageToUse = this.cutinImage;
        } else {
            // カットイン画像が読み込まれていない場合は表示しない
            return;
        }
        
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
        
        // 切り離されたピースは高速落下（100ms間隔）
        const effectiveFallSpeed = this.isSeparatedPiece ? 100 : this.fallSpeed;
        
        if (currentTime - this.lastFallTime > effectiveFallSpeed) {
            this.movePiece(0, 1);
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
        document.getElementById('final-score').textContent = this.score;
        
        // スコア登録ボタンを表示
        const submitButton = document.getElementById('submit-score');
        submitButton.style.display = 'block';
        submitButton.disabled = false;
        submitButton.textContent = 'スコアを登録';
        
        // プレイヤー名入力欄をクリア
        document.getElementById('player-name').value = '';
        
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    restart() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.gameRunning = false;
        this.isSeparatedPiece = false;
        this.generateNextPiece();
        this.spawnNewPiece();
        this.updateDisplay();
        this.render();
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    }
    
    // デバッグ機能
    debugChain(chainCount) {
        console.log(`デバッグ: ${chainCount}連鎖をシミュレート`);
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
                // 2連鎖パターン
                this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1; this.board[8][4] = 1; // 赤4個
                this.board[7][2] = 2; this.board[7][3] = 2; this.board[6][2] = 2; this.board[6][3] = 2; // 緑4個（上に）
                break;
                
            case 3:
                // 3連鎖パターン
                this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1; this.board[8][4] = 1; // 赤
                this.board[7][2] = 2; this.board[7][3] = 2; this.board[6][2] = 2; this.board[6][3] = 2; // 緑
                this.board[5][2] = 3; this.board[5][3] = 3; this.board[4][2] = 3; this.board[4][3] = 3; // 青
                break;
                
            case 4:
                // 4連鎖パターン
                this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1; this.board[8][4] = 1; // 赤
                this.board[7][2] = 2; this.board[7][3] = 2; this.board[6][2] = 2; this.board[6][3] = 2; // 緑
                this.board[5][2] = 3; this.board[5][3] = 3; this.board[4][2] = 3; this.board[4][3] = 3; // 青
                this.board[3][2] = 4; this.board[3][3] = 4; this.board[2][2] = 4; this.board[2][3] = 4; // 黄
                break;
                
            case 5:
                // 5連鎖パターン
                this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1; this.board[8][4] = 1;
                this.board[7][2] = 2; this.board[7][3] = 2; this.board[6][2] = 2; this.board[6][3] = 2;
                this.board[5][2] = 3; this.board[5][3] = 3; this.board[4][2] = 3; this.board[4][3] = 3;
                this.board[3][2] = 4; this.board[3][3] = 4; this.board[2][2] = 4; this.board[2][3] = 4;
                this.board[1][2] = 5; this.board[1][3] = 5; this.board[0][2] = 5; this.board[0][3] = 5; // 紫
                break;
                
            case 7:
                // 7連鎖パターン（より複雑）
                this.board[8][0] = 1; this.board[8][1] = 1; this.board[8][2] = 1; this.board[8][3] = 1;
                this.board[7][1] = 2; this.board[7][2] = 2; this.board[6][1] = 2; this.board[6][2] = 2;
                this.board[5][1] = 3; this.board[5][2] = 3; this.board[4][1] = 3; this.board[4][2] = 3;
                this.board[3][1] = 4; this.board[3][2] = 4; this.board[2][1] = 4; this.board[2][2] = 4;
                this.board[1][1] = 5; this.board[1][2] = 5; this.board[0][1] = 5; this.board[0][2] = 5;
                // 右側にも追加
                this.board[8][4] = 1; this.board[8][5] = 1; this.board[7][4] = 1; this.board[7][5] = 1;
                this.board[6][4] = 2; this.board[6][5] = 2; this.board[5][4] = 2; this.board[5][5] = 2;
                break;
        }
        
        this.render();
        console.log(`${chainCount}連鎖パターンを設置しました`);
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
            
            await db.collection('rankings').add(scoreData);
            
            alert('スコアを登録しました！');
            document.getElementById('player-name').value = '';
            submitButton.style.display = 'none';
            
            // ランキングを更新
            await this.loadRanking();
            
        } catch (error) {
            console.error('スコア登録エラー:', error);
            alert('スコア登録に失敗しました。ネットワーク接続を確認してください。');
            
            // フォールバック：エラー時はローカルデータに追加
            const scoreData = {
                name: playerName,
                score: this.score,
                timestamp: new Date(),
                maxChain: this.chain,
                difficulty: this.difficulty
            };
            localRanking.push(scoreData);
            await this.loadRanking();
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
}

const game = new PuyoPuyoGame();