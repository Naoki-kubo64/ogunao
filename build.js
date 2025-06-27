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
    'firebase-config.example.js'
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

// index.htmlを編集してFirebase設定を修正
const indexPath = path.join(buildDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Firebase設定ファイルの参照を変更
indexContent = indexContent.replace(
    '<script src="firebase-config.js"></script>',
    '<script src="firebase-config.example.js"></script>'
);

fs.writeFileSync(indexPath, indexContent);
console.log('✅ index.htmlのFirebase設定を修正しました');

// firebase-config.example.jsを編集してページ用の設定にする
const configPath = path.join(buildDir, 'firebase-config.example.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// 実際の設定値に置換
configContent = configContent.replace(
    /apiKey: "YOUR_API_KEY_HERE"/,
    'apiKey: "AIzaSyA53kNq2dy8KAlDOreacplG2ddA8GTjhT8"'
);
configContent = configContent.replace(
    /authDomain: "your-project\.firebaseapp\.com"/,
    'authDomain: "ogunaogames.firebaseapp.com"'
);
configContent = configContent.replace(
    /projectId: "your-project-id"/,
    'projectId: "ogunaogames"'
);
configContent = configContent.replace(
    /storageBucket: "your-project\.firebasestorage\.app"/,
    'storageBucket: "ogunaogames.firebasestorage.app"'
);
configContent = configContent.replace(
    /messagingSenderId: "123456789012"/,
    'messagingSenderId: "737503471226"'
);
configContent = configContent.replace(
    /appId: "1:123456789012:web:abcdef123456789"/,
    'appId: "1:737503471226:web:166745d7ac81f141683dc3"'
);
configContent = configContent.replace(
    /measurementId: "G-XXXXXXXXXX"/,
    'measurementId: "G-77Z4H2HZM6"'
);

fs.writeFileSync(configPath, configContent);
console.log('✅ Firebase設定ファイルを更新しました');

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