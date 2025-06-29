// ゲーム設定とコンフィグ
export const GAME_CONFIG = {
    BOARD: {
        WIDTH: 6,
        HEIGHT: 9,
        CELL_SIZE: 40
    },
    
    DIFFICULTY: {
        EASY: { fallSpeed: 1500, name: '簡単' },
        NORMAL: { fallSpeed: 1000, name: '普通' },
        HARD: { fallSpeed: 500, name: '難しい' }
    },
    
    ANIMATION: {
        LANDING_DURATION: 300,
        CHAIN_EFFECT_DURATION: 1000,
        CUTIN_DURATION: 2000,
        EXPLOSION_DURATION: 500,
        SEPARATED_PIECE_FALL_SPEED: 100
    },
    
    SCORING: {
        BASE_SCORE: 100,
        CHAIN_MULTIPLIER: 2
    },
    
    CONTROLS: {
        LEFT: 'a',
        RIGHT: 'd',
        DOWN: 's',
        ROTATE: ' ',
        START_PAUSE: 'Enter'
    },
    
    IMAGES: {
        PUYO_FILES: [
            'images/nao11.jpg',
            'images/nao12.jpg', 
            'images/nao4.png',
            'images/raw.png',
            'images/ホラーなお.png'
        ],
        CUTIN_FILE: 'images/saginaoki.jpg',
        CUTIN_3CHAIN_FILE: 'images/nao7.png?v=' + Date.now(),
        CUTIN_5CHAIN_FILE: 'images/5rensa.png'
    },
    
    COLORS: [
        null,
        '#FF4444', // 赤
        '#44FF44', // 緑
        '#4444FF', // 青
        '#FFFF44', // 黄
        '#FF44FF'  // 紫
    ]
};