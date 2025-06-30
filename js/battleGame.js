/**
 * 対戦ゲームクラス（プロトタイプ）
 * プレイヤー vs CPU の対戦機能を提供
 */
export class BattleGame {
    constructor() {
        console.log('⚔️ 対戦ゲームプロトタイプを初期化中...');
        
        this.playerCanvas = null;
        this.cpuCanvas = null;
        this.playerCtx = null;
        this.cpuCtx = null;
        this.gameRunning = false;
        this.timeLeft = 180; // 3分
        this.timer = null;
        
        this.playerScore = 0;
        this.cpuScore = 0;
        this.cpuLevel = 'normal';
        
        this.initializeElements();
        this.setupEventListeners();
        
        // 少し遅延を入れてからキャンバス初期化
        setTimeout(() => {
            this.initializeCanvas();
            this.showPrototypeMessage();
            this.ensureCanvasVisibility();
        }, 200);
    }
    
    initializeElements() {
        // キャンバス要素
        this.playerCanvas = document.getElementById('player-canvas');
        this.cpuCanvas = document.getElementById('cpu-canvas');
        
        // UI要素
        this.battleStartBtn = document.getElementById('battle-start');
        this.battlePauseBtn = document.getElementById('battle-pause');
        this.timeLeftDisplay = document.getElementById('time-left');
        this.playerScoreDisplay = document.getElementById('player-score');
        this.cpuScoreDisplay = document.getElementById('cpu-score');
        this.cpuLevelSelect = document.getElementById('cpu-level');
        
        console.log('🎯 対戦モード要素を初期化しました');
    }
    
    setupEventListeners() {
        // 対戦開始ボタン
        if (this.battleStartBtn) {
            this.battleStartBtn.addEventListener('click', () => {
                this.startBattle();
            });
        }
        
        // 一時停止ボタン
        if (this.battlePauseBtn) {
            this.battlePauseBtn.addEventListener('click', () => {
                this.pauseBattle();
            });
        }
        
        // CPU難易度変更
        if (this.cpuLevelSelect) {
            this.cpuLevelSelect.addEventListener('change', (e) => {
                this.cpuLevel = e.target.value;
                console.log(`🤖 CPU難易度を${this.cpuLevel}に変更`);
            });
        }
    }
    
    initializeCanvas() {
        console.log('🎨 対戦モードキャンバスを初期化中...');
        
        if (this.playerCanvas) {
            this.playerCtx = this.playerCanvas.getContext('2d');
            console.log('✅ プレイヤーキャンバス初期化完了');
            this.drawPlaceholder(this.playerCtx, 'プレイヤー');
        } else {
            console.error('❌ プレイヤーキャンバスが見つかりません');
        }
        
        if (this.cpuCanvas) {
            this.cpuCtx = this.cpuCanvas.getContext('2d');
            console.log('✅ CPUキャンバス初期化完了');
            this.drawPlaceholder(this.cpuCtx, 'CPU');
        } else {
            console.error('❌ CPUキャンバスが見つかりません');
        }
        
        // キャンバスのサイズとスタイルを確認
        if (this.playerCanvas) {
            console.log(`📐 プレイヤーキャンバス: ${this.playerCanvas.width}x${this.playerCanvas.height}`);
        }
        if (this.cpuCanvas) {
            console.log(`📐 CPUキャンバス: ${this.cpuCanvas.width}x${this.cpuCanvas.height}`);
        }
    }
    
    drawPlaceholder(ctx, label) {
        if (!ctx) return;
        
        console.log(`🎨 ${label}のプレースホルダーを描画中...`);
        
        // 背景を暗い色で塗りつぶし
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // 枠線を描画
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, ctx.canvas.width - 4, ctx.canvas.height - 4);
        
        // プレースホルダーテキスト
        ctx.fillStyle = '#ffa500';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, ctx.canvas.width / 2, ctx.canvas.height / 2 - 30);
        
        // サブテキスト
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText('準備完了', ctx.canvas.width / 2, ctx.canvas.height / 2 + 10);
        
        // 格子模様を描画（ゲームボードっぽく）
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.2)';
        ctx.lineWidth = 1;
        
        // 縦線
        for (let x = 50; x < ctx.canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
            ctx.stroke();
        }
        
        // 横線
        for (let y = 50; y < ctx.canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
        }
        
        console.log(`✅ ${label}のプレースホルダー描画完了`);
    }
    
    ensureCanvasVisibility() {
        console.log('🔍 キャンバス表示を確認中...');
        
        // キャンバス要素の表示設定を強制的に適用
        if (this.playerCanvas) {
            this.playerCanvas.style.display = 'block';
            this.playerCanvas.style.visibility = 'visible';
            this.playerCanvas.style.opacity = '1';
            console.log('✅ プレイヤーキャンバス表示設定完了');
        }
        
        if (this.cpuCanvas) {
            this.cpuCanvas.style.display = 'block';
            this.cpuCanvas.style.visibility = 'visible';
            this.cpuCanvas.style.opacity = '1';
            console.log('✅ CPUキャンバス表示設定完了');
        }
        
        // 親要素の表示も確認
        const battleScreen = document.getElementById('battle-screen');
        if (battleScreen) {
            console.log(`🖥️ 対戦画面表示状態: ${battleScreen.style.display}, 可視性: ${battleScreen.style.visibility}`);
        }
        
        // 再描画を強制実行
        setTimeout(() => {
            if (this.playerCtx) {
                this.drawPlaceholder(this.playerCtx, 'プレイヤー');
            }
            if (this.cpuCtx) {
                this.drawPlaceholder(this.cpuCtx, 'CPU');
            }
        }, 100);
    }
    
    showPrototypeMessage() {
        // プロトタイプメッセージを表示
        const battleTitle = document.querySelector('.battle-title');
        if (battleTitle) {
            battleTitle.innerHTML = '⚔️ CPU対戦モード <span style="color: #ff6600; font-size: 18px;">[プロトタイプ]</span>';
        }
        
        // 開発中メッセージ
        console.log(`
🚧 対戦モードプロトタイプ 🚧

現在実装済み:
✅ モード選択UI
✅ 2画面レイアウト
✅ 基本的な画面切り替え
✅ プロトタイプ表示

今後実装予定:
⏳ プレイヤー側ゲームロジック
⏳ CPU AI システム
⏳ おじゃまぷよシステム
⏳ 勝敗判定
⏳ エフェクト・演出
        `);
    }
    
    startBattle() {
        console.log('⚔️ 対戦開始！（プロトタイプ）');
        this.gameRunning = true;
        
        // ボタンの切り替え
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.add('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.remove('hidden');
        }
        
        // タイマー開始
        this.startTimer();
        
        // プロトタイプアニメーション
        this.startPrototypeAnimation();
    }
    
    pauseBattle() {
        console.log('⏸️ 対戦一時停止');
        this.gameRunning = false;
        
        // ボタンの切り替え
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.remove('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.add('hidden');
        }
        
        // タイマー停止
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeftDisplay) {
                this.timeLeftDisplay.textContent = this.timeLeft;
            }
            
            if (this.timeLeft <= 0) {
                this.endBattle();
            }
        }, 1000);
    }
    
    startPrototypeAnimation() {
        // プロトタイプ用のシンプルアニメーション
        let frame = 0;
        const animate = () => {
            if (!this.gameRunning) return;
            
            frame++;
            
            // プレイヤー側にランダムカラーブロック
            if (this.playerCtx && frame % 30 === 0) {
                this.drawRandomBlocks(this.playerCtx);
                this.updateScore('player', Math.floor(Math.random() * 100));
            }
            
            // CPU側にランダムカラーブロック
            if (this.cpuCtx && frame % 45 === 0) {
                this.drawRandomBlocks(this.cpuCtx);
                this.updateScore('cpu', Math.floor(Math.random() * 80));
            }
            
            if (this.gameRunning) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    drawRandomBlocks(ctx) {
        // ランダムなカラーブロックを描画（プロトタイプ用）
        const colors = ['#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF'];
        const blockSize = 30;
        
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * (ctx.canvas.width - blockSize);
            const y = Math.random() * (ctx.canvas.height - blockSize);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            ctx.fillStyle = color;
            ctx.fillRect(x, y, blockSize, blockSize);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, blockSize, blockSize);
        }
    }
    
    updateScore(player, points) {
        if (player === 'player') {
            this.playerScore += points;
            if (this.playerScoreDisplay) {
                this.playerScoreDisplay.textContent = this.playerScore;
            }
        } else {
            this.cpuScore += points;
            if (this.cpuScoreDisplay) {
                this.cpuScoreDisplay.textContent = this.cpuScore;
            }
        }
    }
    
    endBattle() {
        console.log('🏁 対戦終了！');
        this.gameRunning = false;
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 勝敗判定
        const winner = this.playerScore > this.cpuScore ? 'プレイヤー' : 'CPU';
        
        alert(`対戦終了！\n\nプレイヤー: ${this.playerScore}点\nCPU: ${this.cpuScore}点\n\n勝者: ${winner}`);
        
        // リセット
        this.resetBattle();
    }
    
    resetBattle() {
        this.timeLeft = 180;
        this.playerScore = 0;
        this.cpuScore = 0;
        
        if (this.timeLeftDisplay) {
            this.timeLeftDisplay.textContent = this.timeLeft;
        }
        if (this.playerScoreDisplay) {
            this.playerScoreDisplay.textContent = this.playerScore;
        }
        if (this.cpuScoreDisplay) {
            this.cpuScoreDisplay.textContent = this.cpuScore;
        }
        
        // ボタンをリセット
        if (this.battleStartBtn) {
            this.battleStartBtn.classList.remove('hidden');
        }
        if (this.battlePauseBtn) {
            this.battlePauseBtn.classList.add('hidden');
        }
        
        // キャンバスをリセット
        this.initializeCanvas();
    }
    
    destroy() {
        console.log('🧹 対戦ゲームをクリーンアップ');
        this.gameRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}