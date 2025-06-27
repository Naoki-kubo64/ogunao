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

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();