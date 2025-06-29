// Firebase設定ファイルのサンプル
// 実際の設定値に変更して firebase-config.js として保存してください

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789",
    measurementId: "G-XXXXXXXXXX"
};

// グローバルにfirebaseConfigを公開
window.firebaseConfig = firebaseConfig;

// Firebase初期化
try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    // グローバルにdbオブジェクトを公開
    window.db = db;
    
    console.log('✅ Firebase初期化完了');
    console.log('✅ Firestore DB設定完了');
    
} catch (error) {
    console.error('❌ Firebase初期化エラー:', error);
    window.db = null;
}