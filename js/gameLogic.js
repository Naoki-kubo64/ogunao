// ゲームロジック管理クラス
import { GAME_CONFIG } from './config.js';
import { Utils } from './utils.js';

export class GameLogic {
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
    }
    
    isValidMove(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        return this.isValidPosition(piece, newX, newY);
    }
    
    isValidPosition(piece, x, y) {
        for (let pos of piece.positions) {
            const boardX = x + pos.x;
            const boardY = y + pos.y;
            
            // 境界チェック
            if (boardX < 0 || boardX >= this.gameBoard.width || boardY >= this.gameBoard.height) {
                return false;
            }
            
            // 既存ブロックとの衝突チェック
            if (boardY >= 0 && !this.gameBoard.isEmpty(boardX, boardY)) {
                return false;
            }
        }
        return true;
    }
    
    canRotate(piece) {
        const rotatedPositions = piece.positions.map(pos => ({
            x: -pos.y,
            y: pos.x
        }));
        
        const tempPiece = { ...piece, positions: rotatedPositions };
        
        // 基本位置で回転可能か
        if (this.isValidPosition(tempPiece, piece.x, piece.y)) {
            return { valid: true, offset: { x: 0, y: 0 } };
        }
        
        // キックバック試行
        const kickOffsets = [
            { x: -1, y: 0 }, // 左
            { x: 1, y: 0 },  // 右
            { x: 0, y: -1 }  // 上
        ];
        
        for (let offset of kickOffsets) {
            if (this.isValidPosition(tempPiece, piece.x + offset.x, piece.y + offset.y)) {
                return { valid: true, offset };
            }
        }
        
        return { valid: false, offset: { x: 0, y: 0 } };
    }
    
    checkPartialLanding(piece) {
        const landablePieces = [];
        const floatingPieces = [];
        
        for (let i = 0; i < piece.positions.length; i++) {
            const pos = piece.positions[i];
            const boardX = piece.x + pos.x;
            const boardY = piece.y + pos.y + 1;
            
            const canLand = boardY >= this.gameBoard.height || 
                           (boardY >= 0 && !this.gameBoard.isEmpty(boardX, boardY));
            
            if (canLand) {
                landablePieces.push(i);
            } else {
                floatingPieces.push(i);
            }
        }
        
        return { landablePieces, floatingPieces };
    }
    
    placePieceOnBoard(piece, indices = null) {
        const indicesToPlace = indices || Array.from({ length: piece.positions.length }, (_, i) => i);
        
        indicesToPlace.forEach(i => {
            const pos = piece.positions[i];
            const boardX = piece.x + pos.x;
            const boardY = piece.y + pos.y;
            
            this.gameBoard.placePuyo(boardX, boardY, piece.colors[i]);
        });
    }
    
    async processChains() {
        let totalCleared = 0;
        let chainCount = 0;
        const chainResults = [];
        
        while (true) {
            const matches = this.gameBoard.findAllMatches();
            if (matches.length === 0) break;
            
            chainCount++;
            
            // マッチしたグループを記録
            const flatMatches = matches.flat();
            totalCleared += flatMatches.length;
            
            // ブロックを削除
            const cleared = this.gameBoard.clearMatches(matches);
            
            // 重力を適用
            this.gameBoard.applyGravity();
            
            chainResults.push({
                chainNumber: chainCount,
                cleared,
                positions: flatMatches
            });
            
            // アニメーション待機
            await Utils.sleep(300);
        }
        
        return {
            totalChains: chainCount,
            totalCleared,
            chainResults
        };
    }
    
    calculateScore(chainResult) {
        const { totalChains, totalCleared } = chainResult;
        if (totalChains === 0) return 0;
        
        return totalCleared * GAME_CONFIG.SCORING.BASE_SCORE * 
               Math.pow(GAME_CONFIG.SCORING.CHAIN_MULTIPLIER, totalChains - 1);
    }
    
    isGameOver(piece) {
        return !this.isValidPosition(piece, piece.x, piece.y);
    }
}