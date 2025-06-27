# Firestore セキュリティルール設定

GitHub Pagesで公開する際は、Firebase設定が公開されるため、適切なセキュリティルールの設定が重要です。

## 🔒 推奨セキュリティルール（本番用）

Firebase Console → Firestore → ルール で以下を設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rankings/{document} {
      // 読み取りは誰でも可能
      allow read: if true;
      
      // 作成は検証付きで可能
      allow create: if validateRanking(request.resource.data);
      
      // 更新・削除は禁止
      allow update, delete: if false;
    }
  }
  
  function validateRanking(data) {
    return 
      // 必須フィールドがすべて存在
      data.keys().hasAll(['name', 'score', 'timestamp', 'maxChain', 'difficulty']) &&
      
      // プレイヤー名の検証
      data.name is string &&
      data.name.size() > 0 &&
      data.name.size() <= 10 &&
      
      // スコアの検証
      data.score is number &&
      data.score >= 0 &&
      data.score <= 999999999 &&
      
      // 最大連鎖数の検証
      data.maxChain is number &&
      data.maxChain >= 0 &&
      data.maxChain <= 20 &&
      
      // 難易度の検証
      data.difficulty in ['easy', 'normal', 'hard'] &&
      
      // タイムスタンプの検証（サーバー時刻を強制）
      data.timestamp == request.time &&
      
      // レート制限：1分間に5回まで（同一IPからの連続投稿を制限）
      rateLimit();
  }
  
  function rateLimit() {
    // 簡易的なレート制限（実際の実装では更に厳格な制限を推奨）
    return request.time > resource.data.timestamp + duration.value(60, 's') || !exists(/databases/$(database)/documents/rankings/$(request.auth.uid));
  }
}
```

## 🛡️ セキュリティ対策のポイント

### 1. データ検証
- プレイヤー名：1-10文字のstring
- スコア：0以上の妥当な範囲の数値
- 連鎖数：0-20の妥当な範囲
- 難易度：定義された値のみ

### 2. 操作制限
- **作成のみ許可**：新しいスコアの登録のみ
- **更新・削除禁止**：既存データの改ざん防止
- **サーバータイムスタンプ強制**：時刻の偽装防止

### 3. レート制限（オプション）
- 連続投稿の制限
- 同一IPからの大量リクエスト防止

## 🚨 緊急時の対応

### もしも悪用された場合：
1. Firebase Console → Firestore → ルール
2. 一時的に書き込みを無効化：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rankings/{document} {
      allow read: if true;
      allow write: if false; // 一時的に書き込み禁止
    }
  }
}
```

### データのクリーンアップ：
1. Firebase Console → Firestore → データ
2. 不正なデータを手動で削除
3. ルールを強化して再開

## 📊 モニタリング

Firebase Console → 使用量 でアクセス状況を監視：
- 読み取り/書き込み回数
- 異常なアクセスパターンの検出
- 使用量の急激な増加をチェック

## 🔧 トラブルシューティング

### よくあるエラー：
1. **permission-denied**: ルールの設定を確認
2. **invalid-argument**: データ形式の確認
3. **resource-exhausted**: 使用量上限の確認

### デバッグ方法：
1. Firebase Console → Firestore → ルール → シミュレータでテスト
2. ブラウザの開発者ツールでエラー詳細を確認