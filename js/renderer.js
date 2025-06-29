// 描画管理クラス
import { GAME_CONFIG } from './config.js';

export class Renderer {
    constructor(canvas, imageManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.imageManager = imageManager;
        this.cellSize = GAME_CONFIG.BOARD.CELL_SIZE;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // 縦線
        for (let x = 0; x <= GAME_CONFIG.BOARD.WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, GAME_CONFIG.BOARD.HEIGHT * this.cellSize);
            this.ctx.stroke();
        }
        
        // 横線
        for (let y = 0; y <= GAME_CONFIG.BOARD.HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(GAME_CONFIG.BOARD.WIDTH * this.cellSize, y * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    drawPuyo(x, y, colorIndex, options = {}) {
        if (x < 0 || x >= GAME_CONFIG.BOARD.WIDTH || y < 0 || y >= GAME_CONFIG.BOARD.HEIGHT) {
            return;
        }
        
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        const puyoSize = this.cellSize - 4;
        const puyoX = pixelX + 2;
        const puyoY = pixelY + 2;
        const radius = 12;
        
        this.ctx.save();
        
        // アニメーション変形を適用
        if (options.animation) {
            const centerX = puyoX + puyoSize / 2;
            const centerY = puyoY + puyoSize / 2;
            
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(options.animation.scale, options.animation.scale + options.animation.bounce);
            this.ctx.rotate(options.animation.rotation);
            this.ctx.translate(-centerX, -centerY);
        }
        
        // 透明度設定
        if (options.alpha !== undefined) {
            this.ctx.globalAlpha = options.alpha;
        }
        
        // クリッピングパスの作成
        this.ctx.beginPath();
        if (options.connected) {
            this.drawConnectedShape(puyoX, puyoY, puyoSize, puyoSize, radius, options.connected);
        } else {
            this.roundRect(puyoX, puyoY, puyoSize, puyoSize, radius);
        }
        this.ctx.clip();
        
        // 画像または色で描画
        if (this.imageManager.isImageReady(colorIndex)) {
            this.ctx.drawImage(
                this.imageManager.getPuyoImage(colorIndex),
                puyoX, puyoY, puyoSize, puyoSize
            );
        } else {
            // フォールバック：色での描画
            this.ctx.fillStyle = GAME_CONFIG.COLORS[colorIndex];
            this.ctx.fillRect(puyoX, puyoY, puyoSize, puyoSize);
            
            this.ctx.fillStyle = options.separated ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(puyoX + 2, puyoY + 2, puyoSize - 4, puyoSize - 4);
        }
        
        this.ctx.restore();
        
        // 接続エフェクト
        if (options.connected && this.hasConnections(options.connected)) {
            this.drawConnectionGlow(puyoX, puyoY, puyoSize);
        }
        
        // 境界線
        this.drawBorder(puyoX, puyoY, puyoSize, radius, options);
    }
    
    drawBorder(x, y, size, radius, options) {
        this.ctx.save();
        
        // アニメーション変形を再適用
        if (options.animation) {
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(options.animation.scale, options.animation.scale + options.animation.bounce);
            this.ctx.rotate(options.animation.rotation);
            this.ctx.translate(-centerX, -centerY);
        }
        
        this.ctx.strokeStyle = options.separated ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = options.separated ? 2 : 1;
        this.ctx.beginPath();
        
        if (options.connected) {
            this.drawConnectedShape(x, y, size, size, radius, options.connected);
        } else {
            this.roundRect(x, y, size, size, radius);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
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
    
    drawConnectedShape(x, y, width, height, radius, connected) {
        const topLeftRadius = (connected.up || connected.left) ? 4 : radius;
        const topRightRadius = (connected.up || connected.right) ? 4 : radius;
        const bottomLeftRadius = (connected.down || connected.left) ? 4 : radius;
        const bottomRightRadius = (connected.down || connected.right) ? 4 : radius;
        
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
    
    drawConnectionGlow(x, y, size) {
        this.ctx.save();
        
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
        
        this.ctx.restore();
    }
    
    hasConnections(connected) {
        return connected.up || connected.down || connected.left || connected.right;
    }
    
    renderNextPiece(piece) {
        const nextDisplay = document.getElementById('next-puyo');
        nextDisplay.innerHTML = '';
        
        if (!piece) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = 96;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        
        for (let i = 0; i < piece.positions.length; i++) {
            const pos = piece.positions[i];
            const x = (pos.x + 1) * 24 + 12;
            const y = pos.y * 24 + 12;
            const colorIndex = piece.colors[i];
            
            if (this.imageManager.isImageReady(colorIndex)) {
                ctx.drawImage(this.imageManager.getPuyoImage(colorIndex), x, y, 28, 28);
            } else {
                ctx.fillStyle = GAME_CONFIG.COLORS[colorIndex];
                ctx.fillRect(x, y, 28, 28);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(x + 3, y + 3, 22, 22);
            }
            
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, 28, 28);
        }
        
        nextDisplay.appendChild(canvas);
    }
}