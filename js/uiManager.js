// UI管理クラス
export class UIManager {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
        this.setupUI();
    }
    
    setupEventListeners() {
        // キーボードイベント
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // ボタンイベント
        document.getElementById('restart-btn').addEventListener('click', () => this.game.restart());
        document.getElementById('help-button').addEventListener('click', () => this.showHelpModal());
        document.getElementById('help-close').addEventListener('click', () => this.hideHelpModal());
        
        // 難易度選択
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.game.difficulty = e.target.value;
            this.game.updateFallSpeed();
        });
        
        // ランキング関連
        document.getElementById('refresh-ranking').addEventListener('click', () => this.loadRanking());
        document.getElementById('submit-score').addEventListener('click', () => this.submitScore());
        
        // コメント機能
        document.getElementById('send-comment').addEventListener('click', () => this.sendComment());
        document.getElementById('comment-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                this.sendComment();
            }
        });
    }
    
    setupUI() {
        // 初期UI状態の設定
        this.loadRanking();
        this.loadComments();
    }
    
    handleKeyPress(e) {
        const activeElement = document.activeElement;
        console.log(`Key pressed: ${e.key} Game running: ${this.game.gameRunning} Active element: ${activeElement.id}`);
        
        // コメント入力中は特別な処理
        if (activeElement && activeElement.id === 'comment-input') {
            return; // コメント入力中はゲーム操作を無効化
        }
        
        // プレイヤー名入力中は特別な処理
        if (activeElement && activeElement.id === 'player-name') {
            return; // プレイヤー名入力中はゲーム操作を無効化
        }
        
        // ゲーム開始/再開の処理を最優先
        if (e.key === 'Enter') {
            if (!this.game.gameRunning) {
                this.game.startGame();
                return;
            } else {
                this.game.togglePause();
                return;
            }
        }
        
        // 隠しコマンド処理
        this.handleSecretCommand(e.key);
        
        // ゲーム中の操作
        if (this.game.gameRunning && this.game.currentPiece) {
            switch (e.key.toLowerCase()) {
                case 'a':
                    this.game.movePiece(-1, 0);
                    break;
                case 'd':
                    this.game.movePiece(1, 0);
                    break;
                case 's':
                    this.game.movePiece(0, 1);
                    break;
                case ' ':
                    this.game.rotatePiece();
                    break;
            }
        }
    }
    
    handleSecretCommand(key) {
        if (!key || typeof key !== 'string') {
            return;
        }
        
        if (!this.secretKeySequence) {
            this.secretKeySequence = [];
        }
        
        this.secretKeySequence.push(key.toLowerCase());
        
        if (this.secretKeySequence.length > 5) {
            this.secretKeySequence.shift();
        }
        
        const sequence = this.secretKeySequence.join('');
        if (sequence.includes('debug')) {
            this.toggleDebugMode();
            this.secretKeySequence = [];
        }
    }
    
    toggleDebugMode() {
        const debugControls = document.querySelector('.debug-controls');
        if (debugControls) {
            this.game.debugModeVisible = !this.game.debugModeVisible;
            debugControls.style.display = this.game.debugModeVisible ? 'block' : 'none';
            console.log(`🔧 デバッグモード: ${this.game.debugModeVisible ? 'ON' : 'OFF'}`);
        }
    }
    
    showHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    hideHelpModal() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.game.score;
        document.getElementById('time').textContent = this.game.time;
        document.getElementById('chain').textContent = this.game.chain;
        
        // なおちゃんタイマー更新
        this.updateNaochanTimer();
        
        // おぐコンボタイマー更新
        this.updateOguComboTimer();
    }
    
    updateNaochanTimer() {
        const timerElement = document.getElementById('naochan-timer');
        if (this.game.naochanSystem.naochanTimeActive && timerElement) {
            const remaining = Math.max(0, Math.ceil(this.game.naochanSystem.naochanTimeRemaining / 1000));
            timerElement.textContent = `なおちゃんタイム: ${remaining}秒`;
            timerElement.style.display = 'block';
        } else if (timerElement) {
            timerElement.style.display = 'none';
        }
    }
    
    updateOguComboTimer() {
        const timerElement = document.getElementById('ogu-combo-timer');
        if (this.game.naochanSystem.oguComboActive && timerElement) {
            const remaining = Math.max(0, Math.ceil((this.game.naochanSystem.oguComboEndTime - Date.now()) / 1000));
            timerElement.textContent = `おぐコンボ: ${remaining}秒`;
            timerElement.style.display = 'block';
        } else if (timerElement) {
            timerElement.style.display = 'none';
        }
    }
    
    async loadRanking() {
        const rankingList = document.getElementById('ranking-list');
        rankingList.innerHTML = '<div class="loading">読み込み中...</div>';
        
        try {
            const rankings = await this.game.firebaseManager.loadRanking();
            this.displayRanking(rankings);
        } catch (error) {
            console.error('ランキング読み込みエラー:', error);
            rankingList.innerHTML = '<div class="loading">エラーが発生しました</div>';
        }
    }
    
    displayRanking(rankings) {
        const rankingList = document.getElementById('ranking-list');
        
        if (rankings.length === 0) {
            rankingList.innerHTML = '<div class="loading">まだランキングがありません</div>';
            return;
        }
        
        console.log('🏆 ランキング表示データ:', rankings);
        
        rankingList.innerHTML = rankings.map((item, index) => {
            console.log(`ランキング${index + 1}位:`, {
                name: item.name,
                score: item.score,
                scoreType: typeof item.score,
                scoreValue: item.score
            });
            
            const displayScore = (typeof item.score === 'number' && !isNaN(item.score)) 
                ? item.score.toLocaleString() 
                : '0';
            
            return `
                <div class="ranking-item">
                    <span class="ranking-rank">${index + 1}位</span>
                    <span class="ranking-name">${this.escapeHtml(item.name)}</span>
                    <span class="ranking-score">${displayScore}</span>
                </div>
            `;
        }).join('');
    }
    
    async submitScore() {
        const playerName = document.getElementById('player-name').value.trim();
        const submitButton = document.getElementById('submit-score');
        
        if (!playerName) {
            alert('プレイヤー名を入力してください');
            return;
        }
        
        if (playerName.length > 10) {
            alert('プレイヤー名は10文字以内で入力してください');
            return;
        }
        
        submitButton.disabled = true;
        submitButton.textContent = '登録中...';
        
        try {
            const gameScore = this.game.finalScore || this.game.score;
            const gameChain = this.game.finalChain || this.game.chain;
            
            const result = await this.game.firebaseManager.submitScore(
                playerName, gameScore, gameChain, this.game.difficulty
            );
            
            if (result.success) {
                this.game.scoreSubmitted = true;
                const message = result.local ? 'スコアを登録しました！（ローカル保存）' : 'スコアを登録しました！';
                alert(message);
                
                const scoreRegistration = document.getElementById('score-registration');
                scoreRegistration.style.display = 'none';
                
                await this.loadRanking();
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('予期しないエラー:', error);
            alert('予期しないエラーが発生しました');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'スコアを登録';
        }
    }
    
    async loadComments() {
        try {
            const comments = await this.game.firebaseManager.loadComments();
            this.displayComments(comments);
        } catch (error) {
            console.error('コメント読み込みエラー:', error);
        }
    }
    
    displayComments(comments) {
        const commentList = document.getElementById('comment-list');
        
        if (comments.length === 0) {
            commentList.innerHTML = '<div class="loading">まだコメントがありません</div>';
            return;
        }
        
        commentList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <p>${this.escapeHtml(comment.comment)}</p>
                <small>${comment.timestamp?.toDate?.()?.toLocaleString() || '日時不明'}</small>
            </div>
        `).join('');
    }
    
    async sendComment() {
        const commentInput = document.getElementById('comment-input');
        const comment = commentInput.value.trim();
        
        if (!comment) {
            alert('コメントを入力してください');
            return;
        }
        
        if (comment.length > 100) {
            alert('コメントは100文字以内で入力してください');
            return;
        }
        
        try {
            const result = await this.game.firebaseManager.sendComment(comment);
            
            if (result.success) {
                commentInput.value = '';
                await this.loadComments();
            } else {
                alert(`コメント送信に失敗しました: ${result.error}`);
            }
        } catch (error) {
            console.error('コメント送信エラー:', error);
            alert('コメント送信に失敗しました');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}