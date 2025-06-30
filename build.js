// GitHub Pages用のビルドスクリプト
const fs = require('fs');
const path = require('path');

console.log('🚀 GitHub Pages用ビルドを開始...');

// ビルドディレクトリを作成
const buildDir = 'docs';
console.log(`📁 ビルドディレクトリ: ${buildDir}`);

if (fs.existsSync(buildDir)) {
    console.log('🗑️  既存のビルドディレクトリを削除中...');
    fs.rmSync(buildDir, { recursive: true });
}
fs.mkdirSync(buildDir);
console.log('✅ ビルドディレクトリを作成しました');

// 必要なファイルをコピー
const filesToCopy = [
    'index.html',
    'style.css', 
    'script.js',
    'firebase-config.example.js'
];

console.log('📄 コアファイルをコピー中...');

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(buildDir, file));
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ⚠️  ${file} が見つかりません`);
    }
});

// アセットディレクトリをコピー
console.log('🎨 アセットディレクトリをコピー中...');
const assetDirs = [
    { name: 'images', emoji: '🖼️' },
    { name: 'music', emoji: '🎵' },
    { name: 'SE', emoji: '🔊' },
    { name: 'Video', emoji: '🎬' }
];

assetDirs.forEach(({ name, emoji }) => {
    if (fs.existsSync(name)) {
        fs.cpSync(name, path.join(buildDir, name), { recursive: true });
        console.log(`  ✅ ${emoji} ${name}ディレクトリ`);
    } else {
        console.log(`  ⚠️  ${name}ディレクトリが見つかりません`);
    }
});

// index.htmlを編集してプロダクション用に最適化
console.log('🔧 index.htmlを本番用に最適化中...');
const indexPath = path.join(buildDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Firebase設定ファイルの参照を変更
if (indexContent.includes('firebase-config.js')) {
    indexContent = indexContent.replace(
        '<script src="firebase-config.js"></script>',
        '<script src="firebase-config.example.js"></script>'
    );
    console.log('  ✅ Firebase設定ファイル参照を変更');
} else {
    console.log('  ⚠️  firebase-config.js の参照が見つかりません');
}

// デバッグコントロールを非表示にする（より確実な方法）
if (indexContent.includes('debug-controls')) {
    // CSS で強制的に非表示
    indexContent = indexContent.replace(
        /<div class="debug-controls">/g,
        '<div class="debug-controls" style="display: none !important;">'
    );
    console.log('  ✅ デバッグコントロールを非表示に設定');
} else {
    console.log('  ⚠️  debug-controls が見つかりません');
}

// プロダクション用メタタグを追加
const metaTag = `
    <!-- GitHub Pages プロダクション用 -->
    <meta name="robots" content="index, follow">
    <meta name="description" content="おぐなお - ぷよぷよ風パズルゲーム。なおちゃんタイムで高得点を狙おう！">
    <meta property="og:title" content="おぐなお - ぷよぷよ風ゲーム">
    <meta property="og:description" content="なおちゃんタイム搭載のぷよぷよ風パズルゲーム">
    <meta property="og:type" content="website">`;

if (indexContent.includes('<head>')) {
    indexContent = indexContent.replace('<head>', '<head>' + metaTag);
    console.log('  ✅ プロダクション用メタタグを追加');
}

fs.writeFileSync(indexPath, indexContent);
console.log('🎯 index.html最適化完了');

// firebase-config.example.jsを編集してページ用の設定にする
console.log('🔥 Firebase設定を本番用に更新中...');
const configPath = path.join(buildDir, 'firebase-config.example.js');

if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Firebase設定値のマッピング
    const firebaseConfig = {
        'YOUR_API_KEY_HERE': 'AIzaSyA53kNq2dy8KAlDOreacplG2ddA8GTjhT8',
        'your-project\\.firebaseapp\\.com': 'ogunaogames.firebaseapp.com',
        'your-project-id': 'ogunaogames',
        'your-project\\.firebasestorage\\.app': 'ogunaogames.firebasestorage.app',
        '123456789012': '737503471226',
        '1:123456789012:web:abcdef123456789': '1:737503471226:web:166745d7ac81f141683dc3',
        'G-XXXXXXXXXX': 'G-77Z4H2HZM6'
    };
    
    // 設定値を置換
    Object.entries(firebaseConfig).forEach(([placeholder, actual]) => {
        const regex = new RegExp(placeholder, 'g');
        if (configContent.match(regex)) {
            configContent = configContent.replace(regex, actual);
            console.log(`  ✅ ${placeholder.substring(0, 20)}... → 設定済み`);
        }
    });
    
    fs.writeFileSync(configPath, configContent);
    console.log('🔥 Firebase設定更新完了');
} else {
    console.log('  ⚠️  firebase-config.example.js が見つかりません');
}

// READMEをコピー（GitHub Pages用に更新）
console.log('📖 README処理中...');
if (fs.existsSync('README.md')) {
    let readmeContent = fs.readFileSync('README.md', 'utf8');
    
    // GitHub Pages用の説明を追加
    const pagesInfo = `
## 🌐 GitHub Pages デモ

このプロジェクトのライブデモ: https://yourusername.github.io/puyo-puyo/

### 🎮 プレイ方法
- **A**: 左移動
- **D**: 右移動  
- **S**: 下移動
- **Space**: 回転
- **Enter**: ゲーム開始/一時停止

### 🌟 特別機能
- **なおちゃんタイム**: 高得点でスコア3倍モード発動
- **おぐコンボ**: 緑と青の同時消去で高速落下
- **なおコンボ**: 赤と黄の同時消去で先読み表示
- **最強コンボ**: 5色同時消去で特別ボーナス

### ⚙️ GitHub Pagesでの制限事項
- Firebase設定ファイルが公開されるため、Firestoreセキュリティルールを適切に設定
- 本番環境では適切な認証機能の実装を推奨

`;
    
    if (readmeContent.includes('# おぐなお')) {
        readmeContent = readmeContent.replace('# おぐなお (Ogunao) - ぷよぷよ風ゲーム', 
            '# おぐなお (Ogunao) - ぷよぷよ風ゲーム' + pagesInfo);
    } else {
        readmeContent = pagesInfo + '\n\n' + readmeContent;
    }
    
    fs.writeFileSync(path.join(buildDir, 'README.md'), readmeContent);
    console.log('  ✅ GitHub Pages用READMEを生成');
} else {
    console.log('  ⚠️  README.md が見つかりません');
}

// ビルド情報を生成
const buildInfo = {
    buildTime: new Date().toISOString(),
    version: require('./package.json').version || '1.0.0',
    files: fs.readdirSync(buildDir).length,
    totalSize: getDirectorySize(buildDir)
};

fs.writeFileSync(path.join(buildDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2));

// ビルドサイズ計算関数
function getDirectorySize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            size += getDirectorySize(fullPath);
        } else {
            size += fs.statSync(fullPath).size;
        }
    }
    
    return size;
}

// 完了メッセージ
console.log(`
🎉 GitHub Pages用ビルド完了！

📊 ビルド情報:
  📁 出力ディレクトリ: ${buildDir}/
  📄 ファイル数: ${buildInfo.files}
  📦 総サイズ: ${(buildInfo.totalSize / 1024).toFixed(1)} KB
  🕐 ビルド時刻: ${buildInfo.buildTime}

🚀 次のステップ:
  1. GitHub Settings → Pages → Source を "Deploy from a branch" に設定
  2. Branch を "main"、Folder を "/docs" に設定  
  3. 変更をコミット＆プッシュ
  4. GitHub Pages URLでゲームにアクセス

⚠️  セキュリティ注意事項:
  • Firebase設定が公開されるため、Firestoreセキュリティルールを確認
  • 本番環境では適切な認証・認可の実装を推奨
  • デバッグモードは自動的に無効化済み

🌟 おぐなおゲームをお楽しみください！
`);