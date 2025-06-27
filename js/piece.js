// ぷよピース管理クラス
import { GAME_CONFIG } from './config.js';

export class Piece {
    constructor(colors = null, positions = null) {
        this.colors = colors || this.generateRandomColors();
        this.positions = positions || [{x: 0, y: 0}, {x: 0, y: 1}];
        this.x = Math.floor(GAME_CONFIG.BOARD.WIDTH / 2) - 1;
        this.y = 0;
    }
    
    generateRandomColors() {
        return [
            Math.floor(Math.random() * 5) + 1,
            Math.floor(Math.random() * 5) + 1
        ];
    }
    
    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    rotate() {
        this.positions = this.positions.map(pos => ({
            x: -pos.y,
            y: pos.x
        }));
    }
    
    getAbsolutePositions() {
        return this.positions.map(pos => ({
            x: this.x + pos.x,
            y: this.y + pos.y
        }));
    }
    
    getPositionForIndex(index) {
        const pos = this.positions[index];
        return {
            x: this.x + pos.x,
            y: this.y + pos.y
        };
    }
    
    clone() {
        return new Piece(
            [...this.colors],
            this.positions.map(pos => ({...pos}))
        );
    }
    
    // 分離されたピースを作成
    createSeparatedPiece(indices) {
        const newColors = indices.map(i => this.colors[i]);
        const newPositions = indices.map(i => this.positions[i]);
        
        const separatedPiece = new Piece(newColors, newPositions);
        separatedPiece.setPosition(this.x, this.y);
        
        return separatedPiece;
    }
}

export class PieceGenerator {
    constructor() {
        this.nextPiece = new Piece();
    }
    
    getNextPiece() {
        const currentPiece = this.nextPiece;
        this.nextPiece = new Piece();
        return currentPiece;
    }
    
    peekNextPiece() {
        return this.nextPiece;
    }
}