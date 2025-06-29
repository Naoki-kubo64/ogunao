# おぐなお (Ogunao) - ぷよぷよ風ゲーム
## 🌐 GitHub Pages デモ

このプロジェクトのライブデモ: https://yourusername.github.io/ogunao/

### GitHub Pagesでの制限事項
- Firebase設定ファイルが公開されるため、Firestoreセキュリティルールを適切に設定してください
- 本番環境では適切な認証機能の実装を推奨します



本格的なぷよぷよ風パズルゲームです。連鎖でカットインが表示され、Firebaseを使用したオンラインランキング機能を搭載しています。

## 🎮 ゲーム機能

- **本格的なぷよぷよゲームプレイ**
  - 4つ以上同じ色がくっつくと消える
  - 連鎖システム
  - 難易度選択（簡単・普通・難しい）

- **視覚効果**
  - ぷよぷよの角丸表示
  - 同じ色がくっつく視覚表現
  - 着地時のバウンスアニメーション
  - 接続時のぷるぷる効果

- **カットイン機能**
  - 3連鎖以上でカットイン表示
  - 5連鎖で専用画像
  - 連鎖数に応じたメッセージ

- **オンラインランキング**
  - Firebaseを使用したリアルタイムランキング
  - スコア、最大連鎖、難易度を記録
  - 上位10位まで表示

- **デバッグ機能**
  - 各連鎖のテスト機能
  - 連鎖パターン自動設置
  - カットインテスト

## 🌐 GitHub Pages デモ

**ライブデモ**: https://yourusername.github.io/ogunao/
（URLは実際のGitHubユーザー名に置き換えてください）

## 🚀 セットアップ

### GitHub Pagesで公開する場合

1. **自動デプロイ（推奨）**
```bash
# masterブランチにプッシュするだけで自動デプロイ
git push origin master
```

2. **手動ビルド**
```bash
npm run build
git add docs/
git commit -m "Build for GitHub Pages"
git push origin master
```

### ローカル開発の場合

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd ogunao
```

### 2. Firebase設定
1. Firebase Consoleでプロジェクトを作成
2. Firestoreを有効化
3. `firebase-config.example.js` を `firebase-config.js` にコピー
4. 実際のFirebase設定値を入力

```javascript
// firebase-config.js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789",
    measurementId: "G-XXXXXXXXXX"
};
```

### 3. Firestoreセキュリティルール設定
Firebase Console → Firestore → ルール で以下を設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rankings/{document} {
      allow read: if true;
      allow create: if validateRanking(resource.data);
    }
  }
  
  function validateRanking(data) {
    return data.keys().hasAll(['name', 'score', 'timestamp', 'maxChain', 'difficulty']) &&
           data.name is string &&
           data.name.size() <= 10 &&
           data.score is number &&
           data.score >= 0 &&
           data.maxChain is number &&
           data.maxChain >= 0 &&
           data.difficulty in ['easy', 'normal', 'hard'];
  }
}
```

### 4. 画像・音声ファイルの配置
`images/` フォルダに以下の画像を配置：
- `nao11.jpg` - ぷよ画像1
- `nao12.jpg` - ぷよ画像2
- `nao4.png` - ぷよ画像3
- `raw.png` - ぷよ画像4
- `ホラーなお.png` - ぷよ画像5
- `saginaoki.jpg` - カットイン画像
- `5rensa.png` - 5連鎖専用カットイン画像

`music/` フォルダに以下の音声ファイルを配置：
- `ぷよぷよっと始まる毎日.mp3` - BGM

### 5. ローカルサーバーで実行
```bash
# 簡単なHTTPサーバーを起動
python -m http.server 8000
# または
npx serve
```

ブラウザで `http://localhost:8000` にアクセス

## 🎯 操作方法

- **A** : 左移動
- **D** : 右移動  
- **S** : 下移動
- **Space** : 回転
- **Enter** : ゲーム開始/一時停止

## 📁 プロジェクト構造

```
ogunao/
├── index.html              # メインHTML
├── script.js               # ゲームロジック
├── style.css               # スタイルシート
├── firebase-config.js      # Firebase設定（gitignore対象）
├── firebase-config.example.js # Firebase設定例
├── images/                 # ゲーム画像
│   ├── nao11.jpg
│   ├── nao12.jpg
│   ├── nao4.png
│   ├── raw.png
│   ├── ホラーなお.png
│   ├── saginaoki.jpg
│   └── 5rensa.png
├── .gitignore              # Git無視ファイル
└── README.md               # このファイル
```

## 🔒 セキュリティ

### ローカル開発
- Firebase設定ファイルは `.gitignore` で管理対象外
- 開発時は緩いセキュリティルールでテスト

### GitHub Pages公開
- **⚠️ 重要**: Firebase設定が公開されるため、適切なFirestoreセキュリティルールが必須
- データ検証とレート制限を実装
- 詳細は `firestore-security-rules.md` を参照

### 共通
- ユーザー入力のHTMLエスケープ処理
- プレイヤー名の文字数制限（10文字）
- スコアと連鎖数の妥当性検証

## 🎨 カスタマイズ

### 画像の変更
`images/` フォルダ内の画像ファイルを差し替えることで、ぷよやカットイン画像をカスタマイズできます。

### カットインメッセージの変更
`script.js` の `showCutinEffect` メソッド内でメッセージを編集できます。

### 難易度調整
`updateFallSpeed` メソッドで各難易度の落下速度を調整できます。

## 🐛 トラブルシューティング

### Firebaseエラー
- Firebase設定値が正しいか確認
- Firestoreが有効化されているか確認
- セキュリティルールが正しく設定されているか確認

### 画像が表示されない
- 画像ファイルが正しいパスに配置されているか確認
- ブラウザの開発者ツールでエラーを確認

### ランキングが表示されない
- ネットワーク接続を確認
- Firebase Consoleでデータが正しく保存されているか確認

## 📄 ライセンス

このプロジェクトはMITライセンスのもとで公開されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成