# Firebase Firestore セットアップガイド

## 🚀 クイックセットアップ

### 1. Firebase Console アクセス
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「ogunaogames」プロジェクトを選択
3. 左メニュー「Firestore Database」をクリック

### 2. Firestore Database 初期化
もしまだFirestore Databaseが作成されていない場合：
1. 「データベースの作成」をクリック
2. 「テストモードで開始」を選択
3. ロケーションを選択（推奨：asia-northeast1）
4. 「完了」をクリック

### 3. セキュリティルール設定

#### 📝 開発・テスト用ルール（最初に設定）
1. Firestore Database画面で「ルール」タブをクリック
2. 以下のルールを貼り付け：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ランキング機能
    match /rankings/{document} {
      allow read, write: if true;
    }
    
    // コメント機能
    match /comments/{document} {
      allow read, write: if true;
    }
  }
}
```

3. 「公開」ボタンをクリック

### 4. 動作確認

ゲームを起動して以下を確認：
1. ブラウザのコンソール（F12）を開く
2. 以下のログが表示されることを確認：
   ```
   🔥 Firebase初期化開始...
   ✅ Firebase初期化完了
   🌐 Firestore接続成功
   📊 Firestoreテスト読み取り成功: 0 件
   ```

3. コメント送信をテスト
4. コメント履歴の表示を確認

## 🔧 トラブルシューティング

### エラー: permission-denied
**症状**: コメントが送信できない、履歴が読み込めない
**解決**: セキュリティルールが正しく設定されているか確認

### エラー: failed-precondition
**症状**: コメント履歴の並び替えができない
**解決**: Firebase Consoleでインデックスを作成
1. エラーメッセージ内のリンクをクリック
2. インデックス作成ページで「作成」をクリック

### エラー: Firebase初期化エラー
**症状**: Firebase接続自体が失敗
**解決**: firebase-config.jsの設定を確認

## 📊 データ構造

### comments コレクション
```javascript
{
  text: "すごい連鎖！",          // コメント内容（1-50文字）
  timestamp: Timestamp,         // 投稿日時
  gameTime: 120,               // ゲーム経過時間（秒）
  score: 15000                 // 投稿時のスコア
}
```

### rankings コレクション
```javascript
{
  name: "プレイヤー",           // プレイヤー名（1-10文字）
  score: 50000,               // 最終スコア
  timestamp: Timestamp,        // 記録日時
  maxChain: 8,                // 最大連鎖数
  difficulty: "normal"         // 難易度
}
```

## 🛡️ 本番用セキュリティルール（後で設定）

動作確認完了後、以下のより安全なルールに変更することを推奨：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rankings/{document} {
      allow read: if true;
      allow create: if validateRanking(request.resource.data);
      allow update, delete: if false;
    }
    
    match /comments/{document} {
      allow read: if true;
      allow create: if validateComment(request.resource.data);
      allow update, delete: if false;
    }
  }
  
  function validateRanking(data) {
    return data.keys().hasAll(['name', 'score', 'timestamp', 'maxChain', 'difficulty']) &&
           data.name is string &&
           data.name.size() > 0 &&
           data.name.size() <= 10 &&
           data.score is number &&
           data.score >= 0;
  }
  
  function validateComment(data) {
    return data.keys().hasAll(['text', 'timestamp', 'gameTime', 'score']) &&
           data.text is string &&
           data.text.size() > 0 &&
           data.text.size() <= 50 &&
           data.gameTime is number &&
           data.gameTime >= 0;
  }
}
```

## 📱 実装済み機能

✅ **コメント送信** - 50文字以内のコメントをFirestoreに保存
✅ **リアルタイム表示** - 新しいコメントの自動受信
✅ **ニコニコ風アニメーション** - 横スクロールコメント表示
✅ **コメント履歴** - 過去のコメント一覧表示
✅ **ランキング機能** - スコア記録と表示
✅ **エラーハンドリング** - 詳細なエラーメッセージ表示

## 📞 サポート

問題が解決しない場合：
1. ブラウザのコンソールログを確認
2. Firebase Consoleの使用量ページで制限に達していないか確認
3. ネットワーク接続を確認