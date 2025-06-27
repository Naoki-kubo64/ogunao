# 手動デプロイ手順

GitHub Actionsがうまく動作しない場合の手動デプロイ方法です。

## 🔧 手動デプロイ手順

### 1. ビルド実行
```bash
# ローカルでビルド
node build.js
```

### 2. ファイルをgitに追加
```bash
# docsディレクトリをgit管理に追加
git add docs/
git add .github/
git add *.js *.json *.md
git commit -m "Add GitHub Pages build files"
```

### 3. プッシュ
```bash
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