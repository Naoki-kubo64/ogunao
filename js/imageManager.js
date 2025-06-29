// 画像管理クラス
import { GAME_CONFIG } from './config.js';

export class ImageManager {
    constructor() {
        this.puyoImages = [];
        this.cutinImage = null;
        this.cutin3ChainImage = null;
        this.cutin5ChainImage = null;
        this.imagesLoaded = 0;
        this.totalImages = GAME_CONFIG.IMAGES.PUYO_FILES.length + 3; // +3 for cutin images
        this.onAllImagesLoaded = null;
    }
    
    async loadImages() {
        return new Promise((resolve) => {
            this.onAllImagesLoaded = resolve;
            
            // ぷよ画像を読み込み
            GAME_CONFIG.IMAGES.PUYO_FILES.forEach((file, index) => {
                const img = new Image();
                img.onload = () => this.handleImageLoad();
                img.onerror = () => this.handleImageError(file);
                img.src = file;
                this.puyoImages[index + 1] = img;
            });
            
            // 通常カットイン画像を読み込み
            this.cutinImage = new Image();
            this.cutinImage.onload = () => this.handleImageLoad();
            this.cutinImage.onerror = () => this.handleImageError(GAME_CONFIG.IMAGES.CUTIN_FILE);
            this.cutinImage.src = GAME_CONFIG.IMAGES.CUTIN_FILE;
            
            // 3連鎖カットイン画像を読み込み
            this.cutin3ChainImage = new Image();
            this.cutin3ChainImage.onload = () => this.handleImageLoad();
            this.cutin3ChainImage.onerror = () => this.handleImageError(GAME_CONFIG.IMAGES.CUTIN_3CHAIN_FILE);
            this.cutin3ChainImage.src = GAME_CONFIG.IMAGES.CUTIN_3CHAIN_FILE;
            
            // 5連鎖カットイン画像を読み込み
            this.cutin5ChainImage = new Image();
            this.cutin5ChainImage.onload = () => this.handleImageLoad();
            this.cutin5ChainImage.onerror = () => this.handleImageError(GAME_CONFIG.IMAGES.CUTIN_5CHAIN_FILE);
            this.cutin5ChainImage.src = GAME_CONFIG.IMAGES.CUTIN_5CHAIN_FILE;
        });
    }
    
    handleImageLoad() {
        this.imagesLoaded++;
        console.log(`Image loaded: ${this.imagesLoaded}/${this.totalImages}`);
        if (this.imagesLoaded === this.totalImages) {
            console.log('All images loaded successfully');
            console.log('3連鎖カットイン画像:', this.cutin3ChainImage?.complete ? '読み込み完了' : '読み込み失敗');
            console.log('5連鎖カットイン画像:', this.cutin5ChainImage?.complete ? '読み込み完了' : '読み込み失敗');
            if (this.onAllImagesLoaded) {
                this.onAllImagesLoaded();
            }
        }
    }
    
    handleImageError(filename) {
        console.error(`Failed to load image: ${filename}`);
        this.imagesLoaded++;
        if (this.imagesLoaded === this.totalImages) {
            console.log('Image loading completed (with errors)');
            if (this.onAllImagesLoaded) {
                this.onAllImagesLoaded();
            }
        }
    }
    
    getPuyoImage(colorIndex) {
        return this.puyoImages[colorIndex];
    }
    
    getCutinImage(chainCount = 0) {
        console.log(`getCutinImage called with chainCount: ${chainCount}`);
        // 5連鎖の場合は専用画像を返す
        if (chainCount === 5 && this.cutin5ChainImage && this.cutin5ChainImage.complete) {
            console.log('5連鎖画像を返します');
            return this.cutin5ChainImage;
        }
        // 3連鎖の場合は専用画像を返す
        if (chainCount === 3 && this.cutin3ChainImage && this.cutin3ChainImage.complete) {
            console.log('3連鎖画像を返します');
            return this.cutin3ChainImage;
        }
        // それ以外は通常のカットイン画像
        console.log('通常のカットイン画像を返します');
        return this.cutinImage;
    }
    
    isImageReady(colorIndex) {
        const img = this.puyoImages[colorIndex];
        return img && img.complete;
    }
    
    isCutinImageReady(chainCount = 0) {
        if (chainCount === 5) {
            return this.cutin5ChainImage && this.cutin5ChainImage.complete;
        }
        if (chainCount === 3) {
            return this.cutin3ChainImage && this.cutin3ChainImage.complete;
        }
        return this.cutinImage && this.cutinImage.complete;
    }
}