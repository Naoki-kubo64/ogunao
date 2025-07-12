// BGM切り替え機能テスト用スクリプト

// ソロモードBGM選択テスト
function testSoloBgmSelection() {
    console.log('🎵 ソロモードBGM選択テスト開始');
    
    const soloBgmSelect = document.getElementById('solo-bgm-select');
    if (soloBgmSelect) {
        console.log('✅ ソロBGM選択要素が見つかりました');
        console.log('利用可能なオプション:', Array.from(soloBgmSelect.options).map(o => o.value));
        
        // テスト用に「2.mp3」を選択
        soloBgmSelect.value = '2.mp3';
        soloBgmSelect.dispatchEvent(new Event('change'));
        console.log('🔄 BGMを「2.mp3」に変更しました');
    } else {
        console.error('❌ ソロBGM選択要素が見つかりません');
    }
}

// 対戦モードBGM選択テスト
function testBattleBgmSelection() {
    console.log('🎵 対戦モードBGM選択テスト開始');
    
    const battleBgmSelect = document.getElementById('battle-bgm-select');
    if (battleBgmSelect) {
        console.log('✅ 対戦BGM選択要素が見つかりました');
        console.log('利用可能なオプション:', Array.from(battleBgmSelect.options).map(o => o.value));
        
        // テスト用に「2.mp3」を選択
        battleBgmSelect.value = '2.mp3';
        battleBgmSelect.dispatchEvent(new Event('change'));
        console.log('🔄 対戦BGMを「2.mp3」に変更しました');
    } else {
        console.error('❌ 対戦BGM選択要素が見つかりません');
    }
}

// BGM切り替え機能の包括的テスト
function testBgmFunctionality() {
    console.log('🎮 BGM切り替え機能の包括的テスト開始');
    
    // 1. UI要素の存在確認
    const soloBgmSelect = document.getElementById('solo-bgm-select');
    const battleBgmSelect = document.getElementById('battle-bgm-select');
    
    console.log('ソロBGM選択:', soloBgmSelect ? '✅' : '❌');
    console.log('対戦BGM選択:', battleBgmSelect ? '✅' : '❌');
    
    // 2. ゲームインスタンスの確認
    if (window.game) {
        console.log('✅ ソロゲームインスタンス利用可能');
        console.log('選択されたソロBGM:', window.game.selectedSoloBgm);
    } else {
        console.log('❌ ソロゲームインスタンス未初期化');
    }
    
    if (window.gameModeManager && window.gameModeManager.battleGame) {
        console.log('✅ 対戦ゲームインスタンス利用可能');
        console.log('選択された対戦BGM:', window.gameModeManager.battleGame.selectedBattleBgm);
    } else {
        console.log('❌ 対戦ゲームインスタンス未初期化');
    }
    
    // 3. BGMファイルの存在確認
    const musicFiles = [
        'ぷよぷよっと始まる毎日.mp3',
        '2.mp3',
        '2 -inst.mp3', 
        'ED.mp3',
        'instrumental.mp3',
        'jagler (mp3cut.net).mp3',
        'battleBGM.MP3',
        'battleBGM-inst].mp3'
    ];
    
    console.log('🎵 BGMファイルの存在確認:');
    musicFiles.forEach(file => {
        const audio = new Audio(`music/${file}`);
        audio.addEventListener('canplaythrough', () => {
            console.log(`✅ ${file}: 読み込み可能`);
        });
        audio.addEventListener('error', () => {
            console.log(`❌ ${file}: 読み込みエラー`);
        });
        audio.load();
    });
}

// テスト実行用関数をグローバルに公開
window.testSoloBgmSelection = testSoloBgmSelection;
window.testBattleBgmSelection = testBattleBgmSelection;
window.testBgmFunctionality = testBgmFunctionality;

console.log('🎵 BGMテスト関数が利用可能になりました:');
console.log('- testSoloBgmSelection(): ソロモードBGM選択テスト');
console.log('- testBattleBgmSelection(): 対戦モードBGM選択テスト'); 
console.log('- testBgmFunctionality(): 包括的BGM機能テスト');