// デバッグ機能管理クラス
import { GAME_CONFIG } from './config.js';

export class DebugManager {
    constructor(gameBoard, effectsManager) {
        this.gameBoard = gameBoard;
        this.effectsManager = effectsManager;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const debugButtons = [
            { id: 'debug-2chain', action: () => this.debugChain(2) },
            { id: 'debug-3chain', action: () => this.debugChain(3) },
            { id: 'debug-4chain', action: () => this.debugChain(4) },
            { id: 'debug-5chain', action: () => this.debugChain(5) },
            { id: 'debug-7chain', action: () => this.debugChain(7) },
            { id: 'debug-cutin', action: () => this.debugCutin() },
            { id: 'debug-clear', action: () => this.debugClear() },
            { id: 'debug-pattern-2', action: () => this.debugSetChainPattern(2) },
            { id: 'debug-pattern-3', action: () => this.debugSetChainPattern(3) },
            { id: 'debug-pattern-4', action: () => this.debugSetChainPattern(4) },
            { id: 'debug-pattern-5', action: () => this.debugSetChainPattern(5) },
            { id: 'debug-pattern-7', action: () => this.debugSetChainPattern(7) }
        ];
        
        debugButtons.forEach(({ id, action }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', action);
            }
        });
    }
    
    debugChain(chainCount) {
        console.log(`デバッグ: ${chainCount}連鎖をシミュレート`);
        this.effectsManager.showChainEffect(chainCount);
        
        if (chainCount >= 3) {
            console.log(`デバッグ: ${chainCount}連鎖カットイン表示`);
            this.effectsManager.showCutinEffect(chainCount);
        }
    }
    
    debugCutin() {
        console.log('デバッグ: カットインテスト');
        const randomChain = Math.floor(Math.random() * 5) + 3;
        this.effectsManager.showCutinEffect(randomChain);
    }
    
    debugClear() {
        console.log('デバッグ: ボードクリア');
        this.gameBoard.clear();
    }
    
    debugSetChainPattern(chainCount) {
        console.log(`デバッグ: ${chainCount}連鎖パターンを設置`);
        const pattern = this.getChainPattern(chainCount);
        this.gameBoard.debugSetPattern(pattern);
    }
    
    getChainPattern(chainCount) {
        const patterns = {
            2: [
                // 2連鎖パターン
                {x: 1, y: 8, color: 1}, {x: 2, y: 8, color: 1}, {x: 3, y: 8, color: 1}, {x: 4, y: 8, color: 1},
                {x: 2, y: 7, color: 2}, {x: 3, y: 7, color: 2}, {x: 2, y: 6, color: 2}, {x: 3, y: 6, color: 2}
            ],
            3: [
                // 3連鎖パターン
                {x: 1, y: 8, color: 1}, {x: 2, y: 8, color: 1}, {x: 3, y: 8, color: 1}, {x: 4, y: 8, color: 1},
                {x: 2, y: 7, color: 2}, {x: 3, y: 7, color: 2}, {x: 2, y: 6, color: 2}, {x: 3, y: 6, color: 2},
                {x: 2, y: 5, color: 3}, {x: 3, y: 5, color: 3}, {x: 2, y: 4, color: 3}, {x: 3, y: 4, color: 3}
            ],
            4: [
                // 4連鎖パターン
                {x: 1, y: 8, color: 1}, {x: 2, y: 8, color: 1}, {x: 3, y: 8, color: 1}, {x: 4, y: 8, color: 1},
                {x: 2, y: 7, color: 2}, {x: 3, y: 7, color: 2}, {x: 2, y: 6, color: 2}, {x: 3, y: 6, color: 2},
                {x: 2, y: 5, color: 3}, {x: 3, y: 5, color: 3}, {x: 2, y: 4, color: 3}, {x: 3, y: 4, color: 3},
                {x: 2, y: 3, color: 4}, {x: 3, y: 3, color: 4}, {x: 2, y: 2, color: 4}, {x: 3, y: 2, color: 4}
            ],
            5: [
                // 5連鎖パターン
                {x: 1, y: 8, color: 1}, {x: 2, y: 8, color: 1}, {x: 3, y: 8, color: 1}, {x: 4, y: 8, color: 1},
                {x: 2, y: 7, color: 2}, {x: 3, y: 7, color: 2}, {x: 2, y: 6, color: 2}, {x: 3, y: 6, color: 2},
                {x: 2, y: 5, color: 3}, {x: 3, y: 5, color: 3}, {x: 2, y: 4, color: 3}, {x: 3, y: 4, color: 3},
                {x: 2, y: 3, color: 4}, {x: 3, y: 3, color: 4}, {x: 2, y: 2, color: 4}, {x: 3, y: 2, color: 4},
                {x: 2, y: 1, color: 5}, {x: 3, y: 1, color: 5}, {x: 2, y: 0, color: 5}, {x: 3, y: 0, color: 5}
            ],
            7: [
                // 7連鎖パターン（複雑）
                {x: 0, y: 8, color: 1}, {x: 1, y: 8, color: 1}, {x: 2, y: 8, color: 1}, {x: 3, y: 8, color: 1},
                {x: 1, y: 7, color: 2}, {x: 2, y: 7, color: 2}, {x: 1, y: 6, color: 2}, {x: 2, y: 6, color: 2},
                {x: 1, y: 5, color: 3}, {x: 2, y: 5, color: 3}, {x: 1, y: 4, color: 3}, {x: 2, y: 4, color: 3},
                {x: 1, y: 3, color: 4}, {x: 2, y: 3, color: 4}, {x: 1, y: 2, color: 4}, {x: 2, y: 2, color: 4},
                {x: 1, y: 1, color: 5}, {x: 2, y: 1, color: 5}, {x: 1, y: 0, color: 5}, {x: 2, y: 0, color: 5},
                {x: 4, y: 8, color: 1}, {x: 5, y: 8, color: 1}, {x: 4, y: 7, color: 1}, {x: 5, y: 7, color: 1},
                {x: 4, y: 6, color: 2}, {x: 5, y: 6, color: 2}, {x: 4, y: 5, color: 2}, {x: 5, y: 5, color: 2}
            ]
        };
        
        return patterns[chainCount] || patterns[2];
    }
}