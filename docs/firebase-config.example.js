// Firebase設定ファイルのサンプル
// 実際の設定値に変更して firebase-config.js として保存してください

const firebaseConfig = {
    apiKey: "AIzaSyA53kNq2dy8KAlDOreacplG2ddA8GTjhT8",
    authDomain: "ogunaogames.firebaseapp.com",
    projectId: "ogunaogames",
    storageBucket: "ogunaogames.firebasestorage.app",
    messagingSenderId: "737503471226",
    appId: "1:737503471226:web:abcdef123456789",
    measurementId: "G-77Z4H2HZM6"
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