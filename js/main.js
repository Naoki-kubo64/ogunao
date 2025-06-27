// メインエントリーポイント
import { PuyoPuyoGame } from './game.js';

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    console.log('おぐなお - モジュラー版を開始');
    const game = new PuyoPuyoGame();
    
    // グローバルスコープに公開（デバッグ用）
    window.game = game;
});