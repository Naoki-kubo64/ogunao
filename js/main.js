// メインエントリーポイント
import { PuyoPuyoGame } from './game.js';
import { UIManager } from './uiManager.js';

// Firebase設定は firebase-config.js で読み込まれます
// dbオブジェクトはそちらで初期化されています

// デモ用のローカルランキングデータ（初期は空）
let localRanking = [];

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 おぐなお - モジュラー版を開始');
    
    // ゲームインスタンスを作成
    const game = new PuyoPuyoGame();
    
    // UIマネージャーを初期化
    const uiManager = new UIManager(game);
    
    // ゲームにUIマネージャーを設定
    game.uiManager = uiManager;
    
    // グローバルスコープに公開（デバッグ用）
    window.game = game;
    window.uiManager = uiManager;
    
    console.log('✅ ゲーム初期化完了');
});