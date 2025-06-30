// Firebase関連の管理クラス
export class FirebaseManager {
    constructor() {
        this.localRanking = [];
        this.setupFirebaseConnection();
    }
    
    async setupFirebaseConnection() {
        try {
            console.log('🔍 Firebase接続テスト開始...');
            const testRead = await db.collection('comments').limit(1).get();
            console.log('✅ Firebase接続成功');
        } catch (error) {
            console.error('❌ Firebase接続失敗:', error);
        }
    }
    
    async loadRanking() {
        try {
            const snapshot = await db.collection('rankings')
                .orderBy('score', 'desc')
                .limit(10)
                .get();
            
            const rankings = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('🔍 Firestoreから取得した生データ:', {
                    docId: doc.id,
                    rawData: data,
                    scoreField: data.score,
                    scoreType: typeof data.score
                });
                rankings.push(data);
            });
            
            console.log('📋 取得したランキング配列:', rankings);
            
            if (rankings.length === 0) {
                const localRankings = [...this.localRanking].sort((a, b) => b.score - a.score);
                return localRankings;
            } else {
                return rankings;
            }
        } catch (error) {
            console.error('ランキング読み込みエラー:', error);
            const localRankings = [...this.localRanking].sort((a, b) => b.score - a.score);
            return localRankings;
        }
    }
    
    async submitScore(playerName, score, maxChain, difficulty) {
        try {
            const scoreData = {
                name: playerName,
                score: score,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                maxChain: maxChain,
                difficulty: difficulty
            };
            
            console.log('📊 送信するスコアデータ詳細:', {
                name: playerName,
                score: score,
                scoreType: typeof score,
                scoreValue: score,
                maxChain: maxChain,
                difficulty: difficulty
            });
            
            await db.collection('rankings').add(scoreData);
            console.log('Firestoreへの登録成功!');
            return { success: true };
        } catch (error) {
            console.error('スコア登録エラー:', error);
            
            if (error.code === 'permission-denied') {
                return { success: false, error: 'スコア登録の権限がありません。管理者にお問い合わせください。' };
            } else if (error.code === 'unavailable') {
                return { success: false, error: '現在サーバーに接続できません。後でもう一度お試しください。' };
            } else {
                // フォールバック：ローカルデータに追加
                const localScoreData = {
                    name: playerName,
                    score: score,
                    timestamp: new Date(),
                    maxChain: maxChain,
                    difficulty: difficulty
                };
                this.localRanking.push(localScoreData);
                return { success: true, local: true };
            }
        }
    }
    
    async loadComments() {
        try {
            const snapshot = await db.collection('comments')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            const comments = [];
            snapshot.forEach(doc => {
                comments.push(doc.data());
            });
            
            return comments;
        } catch (error) {
            console.error('コメント読み込みエラー:', error);
            return [];
        }
    }
    
    async sendComment(comment) {
        try {
            await db.collection('comments').add({
                comment: comment,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('コメント送信成功');
            return { success: true };
        } catch (error) {
            console.error('コメント送信エラー:', error);
            return { success: false, error: error.message };
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}