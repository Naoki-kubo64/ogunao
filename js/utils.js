// ユーティリティ関数
export class Utils {
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    static createDOMElement(tag, className, content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }
    
    static removeElement(element) {
        if (element && element.parentElement) {
            element.parentElement.removeChild(element);
        }
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    static easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    static createMatrix(height, width, defaultValue = 0) {
        return Array(height).fill().map(() => Array(width).fill(defaultValue));
    }
    
    static createAnimationMatrix(height, width) {
        return Array(height).fill().map(() => 
            Array(width).fill().map(() => ({
                scale: 1.0,
                bounce: 0,
                rotation: 0,
                lastLandTime: 0
            }))
        );
    }
}