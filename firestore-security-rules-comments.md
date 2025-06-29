# Firestore セキュリティルール（コメント機能用）

Firebase Consoleで以下のセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 既存のrankingsコレクション
    match /rankings/{document} {
      allow read, write: if true;
    }
    
    // 新しいcommentsコレクション
    match /comments/{document} {
      allow read, write: if true;
      // 作成時のみ許可する場合は以下のようにする：
      // allow read: if true;
      // allow create: if true;
    }
  }
}
```

## セキュリティルール設定手順

1. Firebase Console (https://console.firebase.google.com/) にアクセス
2. プロジェクトを選択
3. 左側メニューから「Firestore Database」を選択
4. 「ルール」タブをクリック
5. 上記のルールをコピー&ペースト
6. 「公開」ボタンをクリック

## 本番環境用のより安全なルール（推奨）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rankings/{document} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    
    match /comments/{document} {
      allow read: if true;
      allow create: if request.auth != null 
        && request.resource.data.text is string
        && request.resource.data.text.size() <= 50;
    }
  }
}
```

注意：本番環境では認証機能も追加することをお勧めします。