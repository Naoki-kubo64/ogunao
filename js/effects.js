// エフェクト管理クラス
import { GAME_CONFIG } from './config.js';
import { Utils } from './utils.js';

export class EffectsManager {
    constructor(gameContainer, imageManager) {
        this.gameContainer = gameContainer;
        this.imageManager = imageManager;
    }
    
    createExplosionEffects(positions) {
        positions.forEach(pos => {
            const effect = Utils.createDOMElement('div', 'explosion-effect');
            effect.style.left = (pos.x * GAME_CONFIG.BOARD.CELL_SIZE + 20) + 'px';
            effect.style.top = (pos.y * GAME_CONFIG.BOARD.CELL_SIZE + 20) + 'px';
            
            this.gameContainer.appendChild(effect);
            
            setTimeout(() => {
                Utils.removeElement(effect);
            }, GAME_CONFIG.ANIMATION.EXPLOSION_DURATION);
        });
    }
    
    showChainEffect(chainCount) {
        const effect = Utils.createDOMElement('div', 'chain-effect');
        effect.textContent = `${chainCount} 連鎖!`;
        effect.style.left = '50%';
        effect.style.top = '50%';
        effect.style.transform = 'translate(-50%, -50%)';
        
        this.gameContainer.appendChild(effect);
        
        setTimeout(() => {
            Utils.removeElement(effect);
        }, GAME_CONFIG.ANIMATION.CHAIN_EFFECT_DURATION);
    }
    
    showCutinEffect(chainCount) {
        if (!this.imageManager.isCutinImageReady(chainCount)) {
            return;
        }
        
        const cutin = Utils.createDOMElement('div', 'cutin-effect');
        
        const img = document.createElement('img');
        img.src = this.imageManager.getCutinImage(chainCount).src;
        img.className = 'cutin-image';
        
        const text = Utils.createDOMElement('div', 'cutin-text');
        text.textContent = this.getCutinMessage(chainCount);
        
        cutin.appendChild(img);
        cutin.appendChild(text);
        
        this.gameContainer.appendChild(cutin);
        
        setTimeout(() => {
            Utils.removeElement(cutin);
        }, GAME_CONFIG.ANIMATION.CUTIN_DURATION);
    }
    
    getCutinMessage(chainCount) {
        if (chainCount >= 7) {
            return `${chainCount}連鎖！ 最高や！`;
        } else if (chainCount === 5) {
            return `5連鎖！ すごいやん！`;
        } else if (chainCount >= 4) {
            return `${chainCount}連鎖！ やるやん！`;
        } else {
            return `${chainCount}連鎖！`;
        }
    }
}