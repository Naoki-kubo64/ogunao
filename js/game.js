// メインゲームクラス
import { GAME_CONFIG } from './config.js';
import { Utils } from './utils.js';
import { ImageManager } from './imageManager.js';
import { GameBoard } from './gameBoard.js';
import { Piece, PieceGenerator } from './piece.js';
import { Renderer } from './renderer.js';
import { EffectsManager } from './effects.js';
import { GameLogic } from './gameLogic.js';
import { DebugManager } from './debugManager.js';

export class PuyoPuyoGame {
    constructor() {
        this.initializeCanvas();
        this.initializeGameState();
        this.initializeManagers();
        this.setupEventListeners();
        this.startInitialization();
    }
    
    initializeCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.gameContainer = this.canvas.parentElement;
    }
    
    initializeGameState() {
        this.gameBoard = new GameBoard();
        this.pieceGenerator = new PieceGenerator();
        this.currentPiece = null;
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.gameRunning = false;
        this.difficulty = 'normal';
        this.fallSpeed = GAME_CONFIG.DIFFICULTY.NORMAL.fallSpeed;
        this.isSeparatedPiece = false;
        this.lastFallTime = 0;
        this.timeStart = 0;
    }
    
    initializeManagers() {
        this.imageManager = new ImageManager();
        this.renderer = new Renderer(this.canvas, this.imageManager);
        this.effectsManager = new EffectsManager(this.gameContainer, this.imageManager);
        this.gameLogic = new GameLogic(this.gameBoard);
        this.debugManager = new DebugManager(this.gameBoard, this.effectsManager);
    }
    
    async startInitialization() {
        console.log('ゲーム初期化中...');
        
        await this.imageManager.loadImages();
        
        this.currentPiece = this.pieceGenerator.getNextPiece();
        this.updateDisplay();
        this.render();
        
        console.log('ゲーム準備完了！Enterキーでゲーム開始');
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.setDifficulty(e.target.value);
        });
    }
    
    handleKeyPress(e) {
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
        
        const key = e.key.toLowerCase();
        switch(key) {
            case GAME_CONFIG.CONTROLS.LEFT:
                this.movePiece(-1, 0);
                break;
            case GAME_CONFIG.CONTROLS.RIGHT:
                this.movePiece(1, 0);
                break;
            case GAME_CONFIG.CONTROLS.DOWN:
                this.movePiece(0, 1);
                break;
            case GAME_CONFIG.CONTROLS.ROTATE:
                e.preventDefault();
                this.rotatePiece();
                break;
            case 'enter':
                this.togglePause();
                break;
        }
    }
    
    startGame() {
        console.log('ゲーム開始！');
        this.gameRunning = true;
        this.timeStart = Date.now();
        this.lastFallTime = Date.now();
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
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.fallSpeed = GAME_CONFIG.DIFFICULTY[difficulty.toUpperCase()].fallSpeed;
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        if (this.gameLogic.isValidMove(this.currentPiece, dx, dy)) {
            this.currentPiece.move(dx, dy);
            this.render();
        } else if (dy > 0) {
            // 下方向への移動で衝突した場合、部分的な配置をチェック
            this.handlePartialLanding();
        }
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotationResult = this.gameLogic.canRotate(this.currentPiece);
        if (rotationResult.valid) {
            this.currentPiece.rotate();
            this.currentPiece.move(rotationResult.offset.x, rotationResult.offset.y);
            this.render();
        }
    }
    
    async handlePartialLanding() {
        const { landablePieces, floatingPieces } = this.gameLogic.checkPartialLanding(this.currentPiece);
        
        if (landablePieces.length > 0 && floatingPieces.length > 0) {
            // 部分的な着地：一部のピースを配置し、残りを分離
            this.gameLogic.placePieceOnBoard(this.currentPiece, landablePieces);
            
            // 分離されたピースを作成
            this.currentPiece = this.currentPiece.createSeparatedPiece(floatingPieces);
            this.isSeparatedPiece = true;
            
            // 重力適用と連鎖チェック
            this.gameBoard.applyGravity();
            this.render();
            
            setTimeout(async () => {
                const chainResult = await this.gameLogic.processChains();
                this.handleChainResult(chainResult);
            }, 50);
            
            // 分離されたピースは高速落下
            this.lastFallTime = Date.now() - this.fallSpeed;
        } else {
            // 全体での着地
            await this.placePiece();
        }
    }
    
    async placePiece() {
        this.gameLogic.placePieceOnBoard(this.currentPiece);
        
        // 重力適用
        this.gameBoard.applyGravity();
        this.render();
        await Utils.sleep(100);
        
        // 連鎖処理
        const chainResult = await this.gameLogic.processChains();
        this.handleChainResult(chainResult);
        
        this.spawnNewPiece();
    }
    
    handleChainResult(chainResult) {
        if (chainResult.totalChains > 0) {
            // エフェクト表示
            chainResult.chainResults.forEach(result => {
                this.effectsManager.createExplosionEffects(result.positions);
            });
            
            // スコア更新
            this.chain = Math.max(this.chain, chainResult.totalChains);
            this.score += this.gameLogic.calculateScore(chainResult);
            this.updateDisplay();
            
            // 連鎖エフェクト
            if (chainResult.totalChains > 1) {
                console.log(`${chainResult.totalChains}連鎖発生！`);
                this.effectsManager.showChainEffect(chainResult.totalChains);
                
                if (chainResult.totalChains >= 3) {
                    console.log(`${chainResult.totalChains}連鎖カットイン表示`);
                    this.effectsManager.showCutinEffect(chainResult.totalChains);
                }
            }
        }
    }
    
    spawnNewPiece() {
        this.currentPiece = this.pieceGenerator.getNextPiece();
        this.isSeparatedPiece = false;
        
        if (this.gameLogic.isGameOver(this.currentPiece)) {
            this.gameOver();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = Date.now();
        
        // 時間更新
        this.time = Math.floor((currentTime - this.timeStart) / 1000);
        this.updateDisplay();
        
        // アニメーション更新
        this.gameBoard.updateAnimations();
        
        // ピース落下
        const effectiveFallSpeed = this.isSeparatedPiece ? 
            GAME_CONFIG.ANIMATION.SEPARATED_PIECE_FALL_SPEED : this.fallSpeed;
        
        if (currentTime - this.lastFallTime > effectiveFallSpeed) {
            this.movePiece(0, 1);
            this.lastFallTime = currentTime;
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    render() {
        this.renderer.clear();
        this.renderer.drawGrid();
        
        // ボード上のぷよを描画
        for (let y = 0; y < this.gameBoard.height; y++) {
            for (let x = 0; x < this.gameBoard.width; x++) {
                const colorIndex = this.gameBoard.getCell(x, y);
                if (colorIndex !== 0) {
                    const connected = this.gameBoard.getConnectedDirections(x, y, colorIndex);
                    const animation = this.gameBoard.getAnimation(x, y);
                    
                    this.renderer.drawPuyo(x, y, colorIndex, {
                        connected,
                        animation
                    });
                }
            }
        }
        
        // 現在のピースを描画
        if (this.currentPiece) {
            for (let i = 0; i < this.currentPiece.positions.length; i++) {
                const pos = this.currentPiece.getPositionForIndex(i);
                
                this.renderer.drawPuyo(pos.x, pos.y, this.currentPiece.colors[i], {
                    separated: this.isSeparatedPiece,
                    alpha: this.isSeparatedPiece ? 0.8 : 1.0
                });
            }
        }
        
        // 次のピースを描画
        this.renderer.renderNextPiece(this.pieceGenerator.peekNextPiece());
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('time').textContent = this.time;
        document.getElementById('chain').textContent = this.chain;
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    restart() {
        this.gameBoard.clear();
        this.score = 0;
        this.time = 0;
        this.chain = 0;
        this.gameRunning = false;
        this.isSeparatedPiece = false;
        
        this.currentPiece = this.pieceGenerator.getNextPiece();
        this.updateDisplay();
        this.render();
        
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    }
}