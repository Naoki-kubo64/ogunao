// Firebase設定ファイルのサンプル
// 実際の設定値に変更して firebase-config.js として保存してください

const firebaseConfig = {
    apiKey: "AIzaSyA53kNq2dy8KAlDOreacplG2ddA8GTjhT8",
    authDomain: "ogunaogames.firebaseapp.com",
    projectId: "ogunaogames",
    storageBucket: "ogunaogames.firebasestorage.app",
    messagingSenderId: "737503471226",
    appId: "1:737503471226:web:166745d7ac81f141683dc3",
    measurementId: "G-77Z4H2HZM6"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();