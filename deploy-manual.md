# 🚀 手動デプロイ手順

GitHub Actionsがうまく動作しない場合の手動デプロイ方法です。

## 🔧 改善されたデプロイ手順

### 1. ビルド実行
```bash
# ローカルでビルド（改善されたビルドシステム）
npm run build

# または直接実行
node build.js

# ビルド結果をプレビュー
npm run preview
```

ビルド完了後、以下の情報が表示されます：
- 📄 ファイル数
- 📦 総サイズ  
- 🕐 ビルド時刻
- ✅ 最適化項目（デバッグ無効化、Firebase設定など）

### 2. ファイルをgitに追加
```bash
# ビルド成果物をgit管理に追加
git add docs/
git add build.js package.json
git add *.md

# コミット（自動生成されたビルド情報は除外される）
git commit -m "🚀 Deploy: Updated build with latest features

- デバッグモード無効化
- Firebase設定最適化  
- プロダクション用メタタグ追加
- SEO対応完了"
```

### 3. プッシュ
```bash
# メインブランチにプッシュ
git push origin main

# または masterブランチの場合
git push origin master
```

### 4. GitHub Pages設定
1. GitHubリポジトリページを開く
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: "master" (または "main")
5. Folder: "/docs"
6. Save

### 5. 確認
- 数分後に `https://yourusername.github.io/ogunao/` でアクセス可能

## 🎯 シンプルな設定方法

GitHub Actionsを使わずに、docsディレクトリを直接管理する方法：

### .gitignore からdocsを除外
```bash
# .gitignoreファイルを編集してdocsディレクトリのignoreルールを削除
# または、docsディレクトリ専用の除外ルールを追加

# .gitignore に以下を追加（docsは管理対象にする）
# docs/ の行をコメントアウトまたは削除
```

### 更新時の手順
1. ゲームを更新
2. `node build.js` でビルド
3. `git add docs/` でコミット
4. `git push` でデプロイ

## 🚨 トラブルシューティング

### GitHub Actionsエラーの場合
- リポジトリの Settings → Actions → General
- Workflow permissions を "Read and write permissions" に設定

### Pages設定が見つからない場合
- リポジトリがpublicである必要があります
- Settings → General → Change repository visibility

### デプロイ後にアクセスできない場合
- 10-15分程度待ってから再アクセス
- ブラウザのキャッシュをクリア
- GitHub Pages の Status を確認