// なおちゃんシステム管理クラス
export class NaochanSystem {
    constructor(audioManager) {
        this.audioManager = audioManager;
        
        // なおちゃんタイム関連
        this.naochanTimeActive = false;
        this.naochanTimeRemaining = 0;
        this.naochanTimeStartTime = 0;
        this.naochanTimeTriggeredByScore = false;
        this.naochanTimeTriggeredBy600k = false;
        this.naochanTimeTriggeredBy1M = false;
        
        // コンボ状態
        this.oguComboActive = false;
        this.oguComboEndTime = 0;
        this.naoComboActive = false;
        this.showNextPieceExtra = false;
        this.saikyoComboReady = false;
        
        // 応援システム
        this.supportTriggered50k = false;
        this.supportTriggered100k = false;
        this.supportTriggered200k = false;
        this.supportTriggered600k = false;
        this.supportTriggered1M = false;
        
        // チャットシステム
        this.initNaochanChat();
    }
    
    initNaochanChat() {
        this.naochanChatMessages = [
            // ゲーム開始時 (0-2)
            "ゲーム開始！がんばって！",
            "今日もぷよぷよの時間だね〜",
            "集中していこー！",
            
            // 良いプレイ時 (3-5)
            "いいね！その調子！",
            "すごいじゃない！",
            "なかなかやるね〜",
            
            // 連鎖時 (6-9)
            "連鎖すごい！",
            "きれいに決まったね！",
            "お見事！",
            "その連鎖、美しい〜",
            
            // スコア関連 (10-12)
            "スコア順調だね！",
            "点数伸びてる！",
            "この調子で頑張って！",
            
            // ピンチ時 (13-16)
            "ちょっと危ないかも...",
            "落ち着いて！",
            "まだ大丈夫！",
            "頑張れ〜！",
            
            // 励まし (17-19)
            "みんな応援してるよ！",
            "あきらめないで！",
            "きっとできる！",
            
            // 一般的 (20-24)
            "ぷよぷよ楽しい？",
            "今日の調子はどう？",
            "リラックスしてね〜",
            "無理しないでよ〜",
            "水分補給も忘れずに！"
        ];
        
        this.lastNaochanChatTime = 0;
        this.naochanChatCooldown = 15000; // 15秒のクールダウン
    }
    
    checkNaochanTimeActivation(score, chainCount) {
        // 200,000点到達でなおちゃんタイム発動
        if (score >= 200000 && !this.naochanTimeActive && !this.naochanTimeTriggeredByScore) {
            console.log('💰 200,000点到達でなおちゃんタイム発動！');
            this.naochanTimeTriggeredByScore = true;
            this.activateNaochanTime();
            return;
        }
        
        // 600,000点到達でなおちゃんタイム発動
        if (score >= 600000 && !this.naochanTimeActive && !this.naochanTimeTriggeredBy600k) {
            console.log('🎖️ 600,000点到達でなおちゃんタイム発動！');
            this.naochanTimeTriggeredBy600k = true;
            this.activateNaochanTime();
            return;
        }
        
        // 1,000,000点到達でなおちゃんタイム発動
        if (score >= 1000000 && !this.naochanTimeActive && !this.naochanTimeTriggeredBy1M) {
            console.log('🏆 1,000,000点到達でなおちゃんタイム発動！');
            this.naochanTimeTriggeredBy1M = true;
            this.activateNaochanTime();
            return;
        }
        
        // 5連鎖以上で10%の確率でなおちゃんタイム発動
        if (chainCount >= 5 && !this.naochanTimeActive && Math.random() < 0.1) {
            console.log(`🎲 ${chainCount}連鎖でなおちゃんタイム発動！ (確率: 10%)`);
            this.activateNaochanTime();
        }
    }
    
    activateNaochanTime() {
        if (this.naochanTimeActive) return;
        
        console.log('🌟 なおちゃんタイム発動！');
        this.naochanTimeActive = true;
        this.naochanTimeRemaining = 60000; // 60秒
        this.naochanTimeStartTime = Date.now();
        
        // SE再生
        this.audioManager.playSE(this.audioManager.naochanTimeSE, 'なおちゃんタイム発動');
        
        // BGM切り替え
        if (this.audioManager.currentBgm) {
            this.audioManager.currentBgm.pause();
        }
        this.audioManager.currentBgm = this.audioManager.naochanBgm;
        this.audioManager.naochanBgm.play().catch(e => {
            console.log('なおちゃんタイムBGM auto-play blocked:', e);
        });
        
        // エフェクト表示
        this.showNaochanTimeEffect();
    }
    
    deactivateNaochanTime() {
        if (!this.naochanTimeActive) return;
        
        console.log('✨ なおちゃんタイム終了');
        this.naochanTimeActive = false;
        this.naochanTimeRemaining = 0;
        
        // BGMを元に戻す
        if (this.audioManager.currentBgm === this.audioManager.naochanBgm) {
            this.audioManager.naochanBgm.pause();
            this.audioManager.naochanBgm.currentTime = 0;
            
            this.audioManager.currentBgm = this.audioManager.bgmSwitched ? 
                this.audioManager.bgm2 : this.audioManager.bgm;
            this.audioManager.currentBgm.play().catch(e => {
                console.log('BGM resume failed:', e);
            });
        }
    }
    
    updateNaochanTime(deltaTime) {
        if (!this.naochanTimeActive) return;
        
        this.naochanTimeRemaining -= deltaTime;
        
        if (this.naochanTimeRemaining <= 0) {
            this.deactivateNaochanTime();
        }
    }
    
    showNaochanTimeEffect() {
        // なおちゃんタイムエフェクトの表示
        const effectDiv = document.createElement('div');
        effectDiv.className = 'naochan-time-effect';
        effectDiv.innerHTML = `
            <div class="effect-content">
                <h2>🌟 なおちゃんタイム発動！ 🌟</h2>
                <p>スコア3倍ボーナス！</p>
            </div>
        `;
        document.body.appendChild(effectDiv);
        
        setTimeout(() => {
            if (effectDiv.parentNode) {
                effectDiv.parentNode.removeChild(effectDiv);
            }
        }, 3000);
    }
    
    checkSupportTriggers(score) {
        if (score >= 50000 && score < 100000 && !this.supportTriggered50k) {
            this.showNaochanSupport('5万点突破！', 'いい調子だね～♪');
            this.supportTriggered50k = true;
        } else if (score >= 100000 && score < 200000 && !this.supportTriggered100k) {
            this.showNaochanSupport('10万点突破！', 'すごいじゃない！');
            this.supportTriggered100k = true;
        } else if (score >= 200000 && score < 600000 && !this.supportTriggered200k) {
            this.showNaochanSupport('20万点突破！', 'なおちゃんタイム発動！', 4000);
            this.supportTriggered200k = true;
        } else if (score >= 600000 && score < 1000000 && !this.supportTriggered600k) {
            this.showNaochanSupport('60万点突破！', 'なおちゃんタイム再発動！', 4000);
            this.supportTriggered600k = true;
        } else if (score >= 1000000 && !this.supportTriggered1M) {
            this.showNaochanSupport('100万点突破！！', 'なおちゃん超びっくり！！！', 5000);
            this.supportTriggered1M = true;
        }
    }
    
    showNaochanSupport(title, message, duration = 3000) {
        const supportDiv = document.createElement('div');
        supportDiv.className = 'naochan-support';
        supportDiv.innerHTML = `
            <div class="support-content">
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(supportDiv);
        
        setTimeout(() => {
            if (supportDiv.parentNode) {
                supportDiv.parentNode.removeChild(supportDiv);
            }
        }, duration);
    }
    
    sendContextualNaochanChat(context) {
        const now = Date.now();
        if (now - this.lastNaochanChatTime < this.naochanChatCooldown) {
            return;
        }
        
        let messageCategory;
        
        switch (context) {
            case 'game_start':
                messageCategory = this.naochanChatMessages.slice(0, 3);
                break;
            case 'good_play':
                messageCategory = this.naochanChatMessages.slice(3, 6);
                break;
            case 'big_chain':
                messageCategory = this.naochanChatMessages.slice(6, 10);
                break;
            case 'high_score':
                messageCategory = this.naochanChatMessages.slice(10, 13);
                break;
            case 'danger':
                messageCategory = this.naochanChatMessages.slice(13, 17);
                break;
            case 'game_over':
                messageCategory = this.naochanChatMessages.slice(17, 20);
                break;
            default:
                messageCategory = this.naochanChatMessages.slice(20, 25);
        }
        
        const randomMessage = messageCategory[Math.floor(Math.random() * messageCategory.length)];
        this.addComment(randomMessage);
        this.lastNaochanChatTime = now;
    }
    
    addComment(comment) {
        // リアルタイムで画面上にコメントを表示（履歴は残さない）
        const commentDiv = document.createElement('div');
        commentDiv.className = 'naochan-flying-comment';
        commentDiv.textContent = `なおちゃん: ${comment}`;
        
        document.body.appendChild(commentDiv);
        
        setTimeout(() => {
            if (commentDiv.parentNode) {
                commentDiv.parentNode.removeChild(commentDiv);
            }
        }, 4000);
    }
    
    clearGameState() {
        // なおちゃんタイムをリセット
        if (this.naochanTimeActive) {
            this.deactivateNaochanTime();
        }
        
        // フラグをリセット
        this.naochanTimeTriggeredByScore = false;
        this.naochanTimeTriggeredBy600k = false;
        this.naochanTimeTriggeredBy1M = false;
        
        this.oguComboActive = false;
        this.naoComboActive = false;
        this.showNextPieceExtra = false;
        this.saikyoComboReady = false;
        
        this.supportTriggered50k = false;
        this.supportTriggered100k = false;
        this.supportTriggered200k = false;
        this.supportTriggered600k = false;
        this.supportTriggered1M = false;
    }
}