# Firestore セキュリティルール設定手順（コメント機能対応版）

## 概要
「おぐなお」ゲームのコメント機能とランキング機能をFirestoreで管理するためのセキュリティルール設定手順です。

## 手順

### 1. Firebase Consoleにアクセス
1. [Firebase Console](https://console.firebase.google.com/)にログイン
2. 「ogunaogames」プロジェクトを選択
3. 左メニューから「Firestore Database」を選択
4. 「ルール」タブをクリック

### 2. 開発・テスト用ルール（最初に設定）

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

### 3. 本番用ルール（動作確認後に設定）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ランキング機能
    match /rankings/{document} {
      allow read: if true;
      allow create: if validateRanking(request.resource.data);
      allow update, delete: if false;
    }
    
    // コメント機能
    match /comments/{document} {
      allow read: if true;
      allow create: if validateComment(request.resource.data);
      allow update, delete: if false;
    }
  }
  
  // ランキングデータ検証関数
  function validateRanking(data) {
    return data.keys().hasAll(['name', 'score', 'timestamp', 'maxChain', 'difficulty']) &&
           data.name is string &&
           data.name.size() > 0 &&
           data.name.size() <= 10 &&
           data.score is number &&
           data.score >= 0 &&
           data.maxChain is number &&
           data.maxChain >= 0 &&
           data.difficulty in ['easy', 'normal', 'hard'] &&
           data.timestamp == request.time;
  }
  
  // コメントデータ検証関数
  function validateComment(data) {
    return data.keys().hasAll(['text', 'timestamp', 'gameTime', 'score']) &&
           data.text is string &&
           data.text.size() > 0 &&
           data.text.size() <= 50 &&
           data.gameTime is number &&
           data.gameTime >= 0 &&
           data.score is number &&
           data.score >= 0 &&
           data.timestamp == request.time;
  }
}
```

## データ構造

### コメント（commentsコレクション）
```javascript
{
  text: string,         // コメント内容（1-50文字）
  timestamp: timestamp, // 送信時刻（サーバータイムスタンプ）
  gameTime: number,     // ゲーム経過時間（秒）
  score: number         // コメント送信時のスコア
}
```

### ランキング（rankingsコレクション）
```javascript
{
  name: string,         // プレイヤー名（1-10文字）
  score: number,        // 最終スコア
  timestamp: timestamp, // 記録時刻
  maxChain: number,     // 最大連鎖数
  difficulty: string    // 難易度（easy/normal/hard）
}
```

## 現在の実装機能

### コメント機能（script.js実装済み）
- **コメント送信**: `sendComment()` - 50文字以内のコメントをFirestoreに保存
- **リアルタイム監視**: `startCommentListener()` - 新しいコメントを自動検出
- **ニコニコ風表示**: `displayFlyingComment()` - 横スクロールアニメーション
- **コメント履歴**: `loadCommentHistory()` - 過去50件のコメント表示
- **データ構造**: text, timestamp, gameTime, score

### セキュリティ機能
- **文字数制限**: 1-50文字
- **必須フィールド**: text, timestamp, gameTime, score
- **読み取り**: 誰でも可能
- **書き込み**: 検証通過のみ
- **更新・削除**: 禁止

## 設定手順

1. **開発用ルールで開始**
   - 最初は制限の緩い開発用ルールを設定
   - ゲームの動作確認とデバッグを実施

2. **本番用ルールに移行**
   - 動作確認完了後、セキュリティが強化された本番用ルールに変更
   - データ検証機能により不正なデータの投稿を防止

3. **動作確認項目**
   - コメント送信・表示機能
   - ニコニコ風スクロール表示
   - コメント履歴表示
   - リアルタイム更新
   - ランキング登録・表示

## 注意事項

- 最初は必ず開発用ルールでテストしてください
- 本番用ルール適用前に全機能の動作確認を実施してください
- ルール変更は即座に反映されるため、慎重に行ってください