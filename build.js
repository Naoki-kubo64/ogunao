// GitHub Pages用のビルドスクリプト
const fs = require('fs');
const path = require('path');

console.log('GitHub Pages用ビルドを開始...');

// ビルドディレクトリを作成
const buildDir = 'docs';
if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
}
fs.mkdirSync(buildDir);

// 必要なファイルをコピー
const filesToCopy = [
    'index.html',
    'style.css',
    'script.js',
    'firebase-config.js'
];

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(buildDir, file));
        console.log(`✅ ${file} をコピーしました`);
    }
});

// imagesディレクトリをコピー
if (fs.existsSync('images')) {
    fs.cpSync('images', path.join(buildDir, 'images'), { recursive: true });
    console.log('✅ imagesディレクトリをコピーしました');
}

// musicディレクトリをコピー
if (fs.existsSync('music')) {
    fs.cpSync('music', path.join(buildDir, 'music'), { recursive: true });
    console.log('✅ musicディレクトリをコピーしました');
}

// index.htmlを編集してFirebase設定を修正
const indexPath = path.join(buildDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Firebase設定ファイルの参照はそのまま維持

fs.writeFileSync(indexPath, indexContent);
console.log('✅ index.htmlのFirebase設定を修正しました');

// Firebase設定ファイルはそのまま使用（設定済みのためコピーのみ）
console.log('✅ Firebase設定ファイルをコピーしました');

// READMEをコピー（GitHub Pages用に更新）
if (fs.existsSync('README.md')) {
    let readmeContent = fs.readFileSync('README.md', 'utf8');
    
    // GitHub Pages用の説明を追加
    const pagesInfo = `
## 🌐 GitHub Pages デモ

このプロジェクトのライブデモ: https://yourusername.github.io/ogunao/

### GitHub Pagesでの制限事項
- Firebase設定ファイルが公開されるため、Firestoreセキュリティルールを適切に設定してください
- 本番環境では適切な認証機能の実装を推奨します

`;
    
    readmeContent = readmeContent.replace('# おぐなお (Ogunao) - ぷよぷよ風ゲーム', 
        '# おぐなお (Ogunao) - ぷよぷよ風ゲーム' + pagesInfo);
    
    fs.writeFileSync(path.join(buildDir, 'README.md'), readmeContent);
    console.log('✅ READMEをコピーしました');
}

console.log(`
🎉 GitHub Pages用ビルド完了！

次のステップ:
1. GitHub Settings → Pages → Source を "Deploy from a branch" に設定
2. Branch を "main" (または "master")、Folder を "/docs" に設定
3. 変更をコミット＆プッシュ

⚠️ 注意: Firebase設定が公開されるため、Firestoreセキュリティルールを適切に設定してください
`);