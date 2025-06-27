// ゲームボード管理クラス
import { GAME_CONFIG } from './config.js';
import { Utils } from './utils.js';

export class GameBoard {
    constructor() {
        this.width = GAME_CONFIG.BOARD.WIDTH;
        this.height = GAME_CONFIG.BOARD.HEIGHT;
        this.board = Utils.createMatrix(this.height, this.width);
        this.animations = Utils.createAnimationMatrix(this.height, this.width);
    }
    
    clear() {
        this.board = Utils.createMatrix(this.height, this.width);
        this.animations = Utils.createAnimationMatrix(this.height, this.width);
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    
    isEmpty(x, y) {
        return this.isValidPosition(x, y) && this.board[y][x] === 0;
    }
    
    getCell(x, y) {
        return this.isValidPosition(x, y) ? this.board[y][x] : 0;
    }
    
    setCell(x, y, value) {
        if (this.isValidPosition(x, y)) {
            this.board[y][x] = value;
        }
    }
    
    placePuyo(x, y, colorIndex) {
        if (this.isValidPosition(x, y)) {
            this.board[y][x] = colorIndex;
            this.startLandingAnimation(x, y);
        }
    }
    
    startLandingAnimation(x, y) {
        if (this.isValidPosition(x, y)) {
            this.animations[y][x].scale = 1.3;
            this.animations[y][x].bounce = 0.2;
            this.animations[y][x].lastLandTime = Date.now();
        }
    }
    
    updateAnimations() {
        const currentTime = Date.now();
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const anim = this.animations[y][x];
                
                // 着地後のバウンス効果
                if (anim.lastLandTime > 0) {
                    const timeSinceLanding = currentTime - anim.lastLandTime;
                    const duration = GAME_CONFIG.ANIMATION.LANDING_DURATION;
                    
                    if (timeSinceLanding < duration) {
                        const progress = timeSinceLanding / duration;
                        const easeOut = Utils.easeOut(progress);
                        
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
                        const wave = Math.sin(currentTime * 0.005 + x + y) * 0.02;
                        anim.rotation = wave;
                    }
                }
            }
        }
    }
    
    getConnectedDirections(x, y, colorIndex) {
        const directions = { up: false, down: false, left: false, right: false };
        
        if (y > 0 && this.board[y - 1][x] === colorIndex) directions.up = true;
        if (y < this.height - 1 && this.board[y + 1][x] === colorIndex) directions.down = true;
        if (x > 0 && this.board[y][x - 1] === colorIndex) directions.left = true;
        if (x < this.width - 1 && this.board[y][x + 1] === colorIndex) directions.right = true;
        
        return directions;
    }
    
    findConnectedGroup(startX, startY, color, visited) {
        const group = [];
        const stack = [{x: startX, y: startY}];
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            
            if (!this.isValidPosition(x, y) || visited[y][x] || this.board[y][x] !== color) {
                continue;
            }
            
            visited[y][x] = true;
            group.push({x, y});
            
            stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
        }
        
        return group;
    }
    
    findAllMatches() {
        const visited = Utils.createMatrix(this.height, this.width, false);
        const matches = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.board[y][x] !== 0 && !visited[y][x]) {
                    const group = this.findConnectedGroup(x, y, this.board[y][x], visited);
                    if (group.length >= 4) {
                        matches.push(group);
                    }
                }
            }
        }
        
        return matches;
    }
    
    clearMatches(matches) {
        let totalCleared = 0;
        matches.forEach(group => {
            group.forEach(({x, y}) => {
                this.board[y][x] = 0;
                totalCleared++;
            });
        });
        return totalCleared;
    }
    
    applyGravity() {
        for (let x = 0; x < this.width; x++) {
            let writePos = this.height - 1;
            
            for (let y = this.height - 1; y >= 0; y--) {
                if (this.board[y][x] !== 0) {
                    this.board[writePos][x] = this.board[y][x];
                    if (writePos !== y) {
                        this.board[y][x] = 0;
                        this.startLandingAnimation(x, writePos);
                    }
                    writePos--;
                }
            }
        }
    }
    
    getAnimation(x, y) {
        return this.isValidPosition(x, y) ? this.animations[y][x] : null;
    }
    
    // デバッグ用メソッド
    debugSetPattern(pattern) {
        this.clear();
        pattern.forEach(({x, y, color}) => {
            this.setCell(x, y, color);
        });
    }
}