// ストーリーモード（ローグライク）システム
class StoryMode {
    constructor() {
        // プレイヤーステータス
        this.player = {
            maxHP: 30,
            currentHP: 30,
            attack: 1,
            defense: 0,
            gold: 0,
            equipment: {},
            potions: {},
            puyoRates: {
                red: 20,      // 攻撃ぷよ
                blue: 20,     // 攻撃ぷよ
                yellow: 20,   // 攻撃ぷよ
                green: 20,    // 盾ぷよ
                purple: 20,   // 盾ぷよ
                special: {}   // 特殊ぷよ: {type: rate, ...}
            }
        };
        
        // 現在のフロア情報
        this.currentFloor = 1;
        this.maxFloor = 10;
        
        // 敵データベース
        this.enemyDatabase = {
            // 通常敵（強さ1）
            normal: [
                { name: '見習い戦士', portrait: '🛡️', hp: 20, attack: 1, defense: 0, tier: 'normal', reward: 'low' },
                { name: '農民兵', portrait: '🧑‍🌾', hp: 25, attack: 1, defense: 0, tier: 'normal', reward: 'low' },
                { name: 'ゴブリン', portrait: '👺', hp: 18, attack: 1, defense: 0, tier: 'normal', reward: 'low' },
                { name: 'スライム', portrait: '💧', hp: 15, attack: 1, defense: 0, tier: 'normal', reward: 'low' },
                { name: '野良犬', portrait: '🐕', hp: 22, attack: 1, defense: 0, tier: 'normal', reward: 'low' },
                { name: '山賊', portrait: '🏹', hp: 28, attack: 1, defense: 0, tier: 'normal', reward: 'low' }
            ],
            // 強敵（強さ2）
            strong: [
                { name: '熟練戦士', portrait: '⚔️', hp: 35, attack: 2, defense: 1, tier: 'strong', reward: 'medium' },
                { name: '重装歩兵', portrait: '🛡️', hp: 40, attack: 2, defense: 1, tier: 'strong', reward: 'medium' },
                { name: 'オーク戦士', portrait: '👹', hp: 38, attack: 2, defense: 1, tier: 'strong', reward: 'medium' },
                { name: '魔法使い', portrait: '🧙‍♀️', hp: 30, attack: 3, defense: 0, tier: 'strong', reward: 'medium' },
                { name: '弓兵隊長', portrait: '🏹', hp: 32, attack: 2, defense: 1, tier: 'strong', reward: 'medium' }
            ],
            // エリート敵（強さ3）
            elite: [
                { name: 'エリート騎士', portrait: '🏇', hp: 55, attack: 3, defense: 2, tier: 'elite', reward: 'high' },
                { name: '魔法戦士', portrait: '🧙‍♂️', hp: 50, attack: 3, defense: 1, tier: 'elite', reward: 'high' },
                { name: 'ドラゴン', portrait: '🐉', hp: 60, attack: 4, defense: 2, tier: 'elite', reward: 'high' },
                { name: '闇の騎士', portrait: '⚫', hp: 58, attack: 3, defense: 2, tier: 'elite', reward: 'high' }
            ],
            // ボス敵（強さ4）
            boss: [
                { name: '魔王', portrait: '👹', hp: 80, attack: 4, defense: 3, tier: 'boss', reward: 'legendary' },
                { name: '古龍', portrait: '🐲', hp: 90, attack: 5, defense: 3, tier: 'boss', reward: 'legendary' },
                { name: '最終ボス', portrait: '💀', hp: 100, attack: 5, defense: 4, tier: 'boss', reward: 'legendary' }
            ]
        };
        
        this.currentEnemy = null;
        this.gameState = 'menu'; // 'menu', 'battle', 'victory', 'defeat'
        
        // 装備品データ
        this.equipmentDatabase = {
            weapons: [
                { id: 'iron_sword', name: '鉄の剣', icon: '⚔️', effect: 'attack', value: 1, rarity: 'common' },
                { id: 'steel_sword', name: '鋼の剣', icon: '🗡️', effect: 'attack', value: 2, rarity: 'rare' },
                { id: 'magic_sword', name: '魔剣', icon: '🔱', effect: 'attack', value: 3, rarity: 'epic' }
            ],
            armor: [
                { id: 'wood_shield', name: '木の盾', icon: '🛡️', effect: 'defense', value: 1, rarity: 'common' },
                { id: 'iron_shield', name: '鉄の盾', icon: '🔰', effect: 'defense', value: 2, rarity: 'rare' },
                { id: 'holy_shield', name: '聖なる盾', icon: '🏛️', effect: 'defense', value: 3, rarity: 'epic' }
            ],
            accessories: [
                { id: 'heal_ring', name: '回復の指輪', icon: '💚', effect: 'special', value: 'heal_on_chain', rarity: 'rare' },
                { id: 'chain_bracelet', name: '連鎖の腕輪', icon: '⚡', effect: 'special', value: 'speed_boost', rarity: 'rare' },
                { id: 'magic_amulet', name: '魔力のお守り', icon: '🔮', effect: 'special', value: 'puyo_rate_boost', rarity: 'epic' }
            ]
        };
        
        // 特殊ぷよデータ
        this.specialPuyoDatabase = {
            fire: { name: '炎ぷよ', icon: '🔥', effect: 'expand_clear', rarity: 'common' },
            poison: { name: '毒ぷよ', icon: '🧪', effect: 'poison_damage', rarity: 'common' },
            crystal: { name: '水晶ぷよ', icon: '💎', effect: 'wildcard', rarity: 'rare' },
            lightning: { name: '雷ぷよ', icon: '⚡', effect: 'column_clear', rarity: 'rare' },
            ice: { name: '氷ぷよ', icon: '❄️', effect: 'slow_enemy', rarity: 'rare' },
            wind: { name: '風ぷよ', icon: '🌪️', effect: 'push_down', rarity: 'epic' }
        };
        
        this.potionDatabase = {
            heal: { name: '回復ポーション', icon: '❤️', effect: 'heal', value: 10 },
            power: { name: '攻撃力ポーション', icon: '💪', effect: 'attack', value: 2 },
            speed: { name: '速度ポーション', icon: '💨', effect: 'speed', value: 1 },
            shield: { name: '防御ポーション', icon: '🛡️', effect: 'defense', value: 1 }
        };
        
        this.battleLog = [];
        this.isInitialized = false;
        
        // マップシステム
        this.mapData = null;
        this.currentMapPosition = { floor: 0, nodeId: 'start' };
        this.completedNodes = new Set();
        this.availableNodes = new Set(['start']);
        this.showingInitialPathChoice = false;
        
        // セーブ/ロードシステム
        this.saveSlots = 3; // 3つのセーブスロット
        this.currentSaveSlot = 0;
    }
    
    // 初期化
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.updateDisplay();
        this.loadCurrentEnemy();
        this.addLogEntry('冒険の始まりです...', 'info');
        
        // マップシステム初期化
        this.initializeMapSystem();
        
        // 初回はマップを表示
        this.showMapScreen();
        
        this.isInitialized = true;
        
        console.log('🗡️ ストーリーモード初期化完了');
    }
    
    // イベントリスナー設定
    setupEventListeners() {
        // タイトルに戻る
        const backBtn = document.getElementById('story-back-to-title');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.returnToTitle();
            });
        }
        
        // 戦闘開始
        const battleBtn = document.getElementById('start-battle-btn');
        if (battleBtn) {
            battleBtn.addEventListener('click', () => {
                this.startBattle();
            });
        }
        
        // 3選択肢システム
        const pathLeft = document.getElementById('path-left');
        const pathCenter = document.getElementById('path-center');
        const pathRight = document.getElementById('path-right');
        
        if (pathLeft) {
            pathLeft.addEventListener('click', () => {
                this.selectPath('left');
            });
        }
        
        if (pathCenter) {
            pathCenter.addEventListener('click', () => {
                this.selectPath('center');
            });
        }
        
        if (pathRight) {
            pathRight.addEventListener('click', () => {
                this.selectPath('right');
            });
        }
        
        // ショップ
        const shopBtn = document.getElementById('visit-shop-btn');
        if (shopBtn) {
            shopBtn.addEventListener('click', () => {
                this.visitShop();
            });
        }
        
        // 休憩
        const restBtn = document.getElementById('rest-btn');
        if (restBtn) {
            restBtn.addEventListener('click', () => {
                this.rest();
            });
        }
        
        // ESCキーでポーズメニュー表示
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                
                // 現在の画面状態に応じてポーズメニューを表示
                if (this.canShowPauseMenu()) {
                    this.showPauseMenu();
                }
            }
        });
        
        // ストーリーポーズメニューのイベントリスナー
        this.setupStoryPauseMenuEventListeners();
        
        // デバッグボタンのイベントリスナー
        this.setupDebugEventListeners();
    }
    
    // ストーリーポーズメニューのイベントリスナー設定
    setupStoryPauseMenuEventListeners() {
        // ゲームに戻る
        const resumeBtn = document.getElementById('story-pause-resume');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.hidePauseMenu();
            });
        }
        
        // セーブ
        const saveBtn = document.getElementById('story-pause-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.showSaveSelectMenu();
            });
        }
        
        // タイトルに戻る
        const titleBtn = document.getElementById('story-pause-title');
        if (titleBtn) {
            titleBtn.addEventListener('click', () => {
                this.hidePauseMenu();
                this.returnToTitle();
            });
        }
        
        // 設定
        const settingsBtn = document.getElementById('story-pause-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.hidePauseMenu();
                this.showSettingsMenu();
            });
        }
        
        // セーブスロット選択
        const saveSlots = document.querySelectorAll('.save-slot');
        saveSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.saveGame(index);
                this.hideSaveSelectMenu();
                this.hidePauseMenu();
                alert(`スロット${index + 1}にセーブしました！`);
            });
        });
        
        // セーブ選択画面の戻るボタン
        const saveBackBtn = document.getElementById('save-select-back');
        if (saveBackBtn) {
            saveBackBtn.addEventListener('click', () => {
                this.hideSaveSelectMenu();
            });
        }
    }
    
    // 現在の敵を読み込み
    loadCurrentEnemy() {
        // 初期敵を生成
        if (!this.currentEnemy) {
            this.generateNewEnemy();
        }
        this.updateEnemyDisplay();
    }
    
    // 表示更新
    updateDisplay() {
        this.updatePlayerDisplay();
        this.updateFloorDisplay();
        this.updatePuyoRatesDisplay();
        this.updateEquipmentDisplay();
    }
    
    // デバッグイベントリスナー設定
    setupDebugEventListeners() {
        // 敵HP0ボタン
        const enemyHpZeroBtn = document.getElementById('debug-enemy-hp-zero');
        if (enemyHpZeroBtn) {
            enemyHpZeroBtn.addEventListener('click', () => {
                this.debugSetEnemyHPZero();
            });
        }
        
        // 自分HP0ボタン
        const playerHpZeroBtn = document.getElementById('debug-player-hp-zero');
        if (playerHpZeroBtn) {
            playerHpZeroBtn.addEventListener('click', () => {
                this.debugSetPlayerHPZero();
            });
        }
    }
    
    // デバッグ: 敵HPを0にする
    debugSetEnemyHPZero() {
        if (this.currentEnemy) {
            this.currentEnemy.currentHP = 0;
            this.updateEnemyDisplay();
            this.updateBattleScreenHP();
            console.log('🔧 デバッグ: 敵HPを0に設定しました');
            
            // 戦闘終了判定
            if (this.gameRunning) {
                this.handleBattleEnd();
            }
        }
    }
    
    // デバッグ: プレイヤーHPを0にする
    debugSetPlayerHPZero() {
        if (this.player) {
            this.player.currentHP = 0;
            this.updatePlayerDisplay();
            this.updateBattleScreenHP();
            console.log('🔧 デバッグ: プレイヤーHPを0に設定しました');
            
            // 戦闘終了判定
            if (this.gameRunning) {
                this.handleBattleEnd();
            }
        }
    }
    
    // 戦闘終了処理
    handleBattleEnd() {
        if (this.player.currentHP <= 0) {
            // プレイヤー敗北
            this.gameRunning = false;
            setTimeout(() => {
                alert('敗北しました...');
                this.returnFromBattle();
            }, 500);
        } else if (this.currentEnemy && this.currentEnemy.currentHP <= 0) {
            // プレイヤー勝利
            this.gameRunning = false;
            setTimeout(() => {
                alert('勝利しました！');
                this.showVictoryScreen();
            }, 500);
        }
    }
    
    // プレイヤー表示更新
    updatePlayerDisplay() {
        const hpFill = document.getElementById('player-hp-fill');
        const hpText = document.getElementById('player-hp-text');
        const attackText = document.getElementById('player-attack');
        const defenseText = document.getElementById('player-defense');
        const goldText = document.getElementById('player-gold');
        
        if (hpFill && hpText) {
            const hpPercent = (this.player.currentHP / this.player.maxHP) * 100;
            hpFill.style.width = `${hpPercent}%`;
            hpText.textContent = `${this.player.currentHP}/${this.player.maxHP}`;
        }
        
        if (attackText) attackText.textContent = this.player.attack;
        if (defenseText) defenseText.textContent = this.player.defense;
        if (goldText) goldText.textContent = this.player.gold;
    }
    
    // 敵表示更新
    updateEnemyDisplay() {
        if (!this.currentEnemy) return;
        
        const portrait = document.querySelector('.enemy-portrait');
        const name = document.getElementById('enemy-name');
        const hpFill = document.getElementById('enemy-hp-fill');
        const hpText = document.getElementById('enemy-hp-text');
        const attackText = document.getElementById('enemy-attack');
        const defenseText = document.getElementById('enemy-defense');
        
        if (portrait) portrait.textContent = this.currentEnemy.portrait;
        if (name) name.textContent = this.currentEnemy.name;
        
        if (hpFill && hpText) {
            const hpPercent = (this.currentEnemy.currentHP / this.currentEnemy.maxHP) * 100;
            hpFill.style.width = `${hpPercent}%`;
            hpText.textContent = `${this.currentEnemy.currentHP}/${this.currentEnemy.maxHP}`;
        }
        
        if (attackText) attackText.textContent = this.currentEnemy.attack;
        if (defenseText) defenseText.textContent = this.currentEnemy.defense;
    }
    
    // フロア表示更新
    updateFloorDisplay() {
        const floorText = document.getElementById('current-floor-text');
        if (floorText) {
            floorText.textContent = `フロア ${this.currentFloor}`;
        }
    }
    
    // ぷよ出現率表示更新
    updatePuyoRatesDisplay() {
        const rates = this.player.puyoRates;
        
        document.getElementById('red-rate').textContent = `${rates.red}%`;
        document.getElementById('blue-rate').textContent = `${rates.blue}%`;
        document.getElementById('yellow-rate').textContent = `${rates.yellow}%`;
        document.getElementById('green-rate').textContent = `${rates.green}%`;
        document.getElementById('purple-rate').textContent = `${rates.purple}%`;
        
        // 特殊ぷよがある場合は追加表示
        const puyoRatesContainer = document.getElementById('puyo-rates');
        
        // 既存の特殊ぷよ表示を削除
        const existingSpecial = puyoRatesContainer.querySelectorAll('.special-puyo-rate');
        existingSpecial.forEach(el => el.remove());
        
        // 新しい特殊ぷよ表示を追加
        for (const [type, rate] of Object.entries(rates.special)) {
            const specialPuyo = this.specialPuyoDatabase[type];
            if (specialPuyo) {
                const div = document.createElement('div');
                div.className = 'puyo-rate special-puyo-rate';
                div.innerHTML = `${specialPuyo.icon} <span>${rate}%</span>`;
                puyoRatesContainer.appendChild(div);
            }
        }
    }
    
    // 装備品表示更新
    updateEquipmentDisplay() {
        const grid = document.getElementById('equipment-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        Object.entries(this.player.equipment).forEach(([effect, value]) => {
            if (value > 0) {
                const equipmentItem = Object.values(this.equipmentDatabase).find(item => item.effect === effect);
                if (equipmentItem) {
                    const div = document.createElement('div');
                    div.className = 'equipment-item';
                    div.innerHTML = `
                        <div style="font-size: 24px; margin-bottom: 5px;">${equipmentItem.icon}</div>
                        <div style="font-size: 10px;">${effect}+${value}</div>
                    `;
                    div.title = `${equipmentItem.name}: ${effect} +${value}`;
                    grid.appendChild(div);
                }
            }
        });
    }
    
    // ログエントリ追加
    addLogEntry(message, type = 'info') {
        this.battleLog.push({ message, type, timestamp: Date.now() });
        
        const logContent = document.getElementById('log-content');
        if (logContent) {
            const div = document.createElement('div');
            div.className = `log-entry ${type}`;
            div.textContent = message;
            logContent.appendChild(div);
            logContent.scrollTop = logContent.scrollHeight;
        }
    }
    
    // 戦闘開始
    startBattle() {
        if (this.gameState !== 'menu') return;
        
        this.gameState = 'battle';
        this.addLogEntry(`${this.currentEnemy.name}との戦闘開始！`, 'info');
        
        // 戦闘開始ボタンを無効化
        const battleBtn = document.getElementById('start-battle-btn');
        if (battleBtn) battleBtn.disabled = true;
        
        // 実際のぷよぷよ戦闘画面に遷移
        this.showBattleScreen();
    }
    
    // 戦闘画面表示
    showBattleScreen() {
        console.log('🎮 ぷよぷよ戦闘画面表示');
        
        // ストーリー画面を非表示
        const storyScreen = document.getElementById('story-screen');
        if (storyScreen) {
            storyScreen.classList.add('hidden');
        }
        
        // 戦闘画面を表示
        const battleScreen = document.getElementById('story-battle-screen');
        if (battleScreen) {
            battleScreen.classList.remove('hidden');
            this.initializeBattleScreen();
        }
    }
    
    // 戦闘画面初期化
    initializeBattleScreen() {
        // 敵情報を更新
        const enemyName = document.getElementById('story-enemy-name');
        const enemyHpFill = document.getElementById('story-enemy-hp-fill');
        const enemyHpText = document.getElementById('story-enemy-hp-text');
        
        if (enemyName) enemyName.textContent = `${this.currentEnemy.portrait} ${this.currentEnemy.name}`;
        if (enemyHpFill && enemyHpText) {
            const hpPercent = (this.currentEnemy.currentHP / this.currentEnemy.maxHP) * 100;
            enemyHpFill.style.width = `${hpPercent}%`;
            enemyHpText.textContent = `${this.currentEnemy.currentHP}/${this.currentEnemy.maxHP}`;
        }
        
        // プレイヤー情報を更新
        const playerHpFill = document.getElementById('story-player-hp-fill');
        const playerHpText = document.getElementById('story-player-hp-text');
        
        if (playerHpFill && playerHpText) {
            const hpPercent = (this.player.currentHP / this.player.maxHP) * 100;
            playerHpFill.style.width = `${hpPercent}%`;
            playerHpText.textContent = `${this.player.currentHP}/${this.player.maxHP}`;
        }
        
        // ポーション表示
        this.updatePotionsDisplay();
        
        // HP表示を再度更新（確実にするため）
        this.updateBattleScreenHP();
        
        // 戦闘ゲーム開始
        this.startPuyoBattle();
        
        // 戻るボタンのイベントリスナー
        const backBtn = document.getElementById('story-battle-back');
        if (backBtn) {
            backBtn.onclick = () => {
                this.returnFromBattle();
            };
        }
    }
    
    // 戦闘画面HP表示更新
    updateBattleScreenHP() {
        // 敵HP更新
        const enemyHpFill = document.getElementById('story-enemy-hp-fill');
        const enemyHpText = document.getElementById('story-enemy-hp-text');
        
        if (enemyHpFill && enemyHpText && this.currentEnemy) {
            const hpPercent = (this.currentEnemy.currentHP / this.currentEnemy.maxHP) * 100;
            enemyHpFill.style.width = `${hpPercent}%`;
            enemyHpText.textContent = `${this.currentEnemy.currentHP}/${this.currentEnemy.maxHP}`;
        }
        
        // プレイヤーHP更新
        const playerHpFill = document.getElementById('story-player-hp-fill');
        const playerHpText = document.getElementById('story-player-hp-text');
        
        if (playerHpFill && playerHpText) {
            const hpPercent = (this.player.currentHP / this.player.maxHP) * 100;
            playerHpFill.style.width = `${hpPercent}%`;
            playerHpText.textContent = `${this.player.currentHP}/${this.player.maxHP}`;
        }
    }
    
    // ぷよぷよ戦闘開始
    startPuyoBattle() {
        console.log('🔥 ぷよぷよ戦闘開始');
        
        // 前の戦闘データを完全にクリア
        this.cleanupBattle();
        
        // ゲーム状態を戦闘に設定
        this.gameState = 'battle';
        
        // ステータス更新
        const statusText = document.getElementById('battle-status-text');
        if (statusText) statusText.textContent = '戦闘中！';
        
        // プレイヤー側キャンバス初期化
        const playerCanvas = document.getElementById('story-player-canvas');
        const enemyCanvas = document.getElementById('story-enemy-canvas');
        
        if (playerCanvas) {
            this.playerCtx = playerCanvas.getContext('2d');
            this.initializePlayerBoard();
        }
        
        if (enemyCanvas) {
            this.enemyCtx = enemyCanvas.getContext('2d');
            this.initializeEnemyBoard();
        }
        
        // タイマー開始
        this.startBattleTimer();
        
        // 敵AI開始
        this.startEnemyAI();
        
        // プレイヤーのぷよ生成
        this.generatePlayerPuyo();
        
        // 敵のぷよ生成
        this.generateEnemyPuyo();
        
        // ゲームループ開始
        this.startGameLoop();
        
        // プレイヤー操作を設定
        this.setupPlayerControls();
    }
    
    // プレイヤーボード初期化
    initializePlayerBoard() {
        this.playerBoard = Array(12).fill().map(() => Array(6).fill(0));
        this.playerCurrentPuyo = null;
        this.playerNextPuyo = null;
        this.playerPuyoX = 2; // 初期X位置
        this.playerPuyoY = 0; // 初期Y位置
        this.playerPuyoRotation = 0; // 回転状態 (0-3)
        this.playerFallTimer = 0;
        this.playerFallSpeed = 60; // フレーム数（1秒、元の速度に戻す）
        
        // パフォーマンス最適化用フラグ
        this.playerBoardDirty = true;
        this.enemyBoardDirty = true;
        this.lastRenderTime = 0;
        this.renderInterval = 32; // 30FPSに制限（さらに軽量化）
        
        this.renderPlayerBoard();
    }
    
    // 敵ボード初期化
    initializeEnemyBoard() {
        this.enemyBoard = Array(12).fill().map(() => Array(6).fill(0));
        this.enemyCurrentPuyo = null;
        this.enemyNextPuyo = null;
        this.enemyBoardDirty = true;
        this.renderEnemyBoard();
    }
    
    // プレイヤーボード描画
    renderPlayerBoard() {
        if (!this.playerCtx) return;
        
        this.playerCtx.clearRect(0, 0, 390, 780);
        
        // グリッド描画
        this.playerCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.playerCtx.lineWidth = 1;
        for (let x = 0; x <= 6; x++) {
            this.playerCtx.moveTo(x * 65, 0);
            this.playerCtx.lineTo(x * 65, 780);
            this.playerCtx.stroke();
        }
        for (let y = 0; y <= 12; y++) {
            this.playerCtx.moveTo(0, y * 65);
            this.playerCtx.lineTo(390, y * 65);
            this.playerCtx.stroke();
        }
        
        // 固定されたぷよ描画
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 6; x++) {
                if (this.playerBoard[y][x] !== 0) {
                    this.drawPuyoOnCanvas(this.playerCtx, x, y, this.playerBoard[y][x]);
                }
            }
        }
        
        // 落下中のぷよ描画
        if (this.playerCurrentPuyo && this.gameRunning) {
            const positions = this.getPuyoPositions(this.playerPuyoX, this.playerPuyoY, this.playerPuyoRotation);
            positions.forEach((pos, index) => {
                if (pos.y >= 0 && pos.y < 12 && pos.x >= 0 && pos.x < 6) {
                    this.drawPuyoOnCanvas(this.playerCtx, pos.x, pos.y, this.playerCurrentPuyo.colors[index]);
                }
            });
        }
    }
    
    // 敵ボード描画
    renderEnemyBoard() {
        if (!this.enemyCtx) return;
        
        this.enemyCtx.clearRect(0, 0, 390, 780);
        
        // グリッド描画
        this.enemyCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.enemyCtx.lineWidth = 1;
        for (let x = 0; x <= 6; x++) {
            this.enemyCtx.moveTo(x * 65, 0);
            this.enemyCtx.lineTo(x * 65, 780);
            this.enemyCtx.stroke();
        }
        for (let y = 0; y <= 12; y++) {
            this.enemyCtx.moveTo(0, y * 65);
            this.enemyCtx.lineTo(390, y * 65);
            this.enemyCtx.stroke();
        }
        
        // ぷよ描画
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 6; x++) {
                if (this.enemyBoard[y][x] !== 0) {
                    this.drawPuyoOnCanvas(this.enemyCtx, x, y, this.enemyBoard[y][x]);
                }
            }
        }
        
        // 敵の落下中ぷよを描画
        if (this.enemyAI && this.enemyAI.currentPuyo) {
            const positions = this.getEnemyPuyoPositions(this.enemyAI.puyoX, this.enemyAI.puyoY, this.enemyAI.puyoRotation);
            positions.forEach((pos, index) => {
                if (pos.y >= 0 && pos.y < 12 && pos.x >= 0 && pos.x < 6) {
                    this.drawPuyoOnCanvas(this.enemyCtx, pos.x, pos.y, this.enemyAI.currentPuyo.colors[index]);
                }
            });
        }
    }
    
    // キャンバスにぷよ描画
    drawPuyoOnCanvas(ctx, x, y, colorIndex) {
        const colors = ['', '#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF'];
        
        ctx.fillStyle = colors[colorIndex] || '#888888';
        ctx.fillRect(x * 65 + 2, y * 65 + 2, 61, 61);
        
        // 光沢効果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * 65 + 6, y * 65 + 6, 53, 53);
        
        // 境界線
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * 65 + 2, y * 65 + 2, 61, 61);
    }
    
    // 次ぷよ専用の描画関数（軽量版）
    drawNextPuyo(ctx, x, y, colorIndex) {
        const colors = ['', '#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF'];
        const size = 50; // 50x50の大きなサイズ
        const padding = 5;
        
        // メインぷよ
        ctx.fillStyle = colors[colorIndex] || '#888888';
        ctx.fillRect(x * size + padding, y * size + padding, size - padding * 2, size - padding * 2);
        
        // シンプルな光沢効果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x * size + padding + 3, y * size + padding + 3, size - padding * 2 - 6, size - padding * 2 - 6);
        
        // 境界線
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * size + padding, y * size + padding, size - padding * 2, size - padding * 2);
    }
    
    // プレイヤーぷよ生成
    generatePlayerPuyo() {
        // プレイヤーの特殊ぷよ率を考慮したぷよ生成
        const rates = this.player.puyoRates;
        const color1 = this.getRandomPuyoColor(rates);
        const color2 = this.getRandomPuyoColor(rates);
        
        this.playerCurrentPuyo = { colors: [color1, color2] };
        this.playerNextPuyo = { 
            colors: [this.getRandomPuyoColor(rates), this.getRandomPuyoColor(rates)]
        };
        
        this.updatePlayerNextDisplay();
        this.spawnNewPlayerPuyo();
    }
    
    // 新しいプレイヤーぷよをスポーン
    spawnNewPlayerPuyo() {
        if (this.playerCurrentPuyo) {
            this.playerCurrentPuyo = { ...this.playerNextPuyo };
            this.playerNextPuyo = { 
                colors: [this.getRandomPuyoColor(this.player.puyoRates), this.getRandomPuyoColor(this.player.puyoRates)]
            };
            this.updatePlayerNextDisplay();
        } else {
            this.playerCurrentPuyo = { colors: [this.getRandomPuyoColor(this.player.puyoRates), this.getRandomPuyoColor(this.player.puyoRates)] };
        }
        
        // 初期位置にリセット
        this.playerPuyoX = 2;
        this.playerPuyoY = 0;
        this.playerPuyoRotation = 0;
        this.playerFallTimer = 0;
        
        console.log('🟢 新しいぷよをスポーン:', this.playerCurrentPuyo.colors);
    }
    
    // ゲームループ開始
    startGameLoop() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    // メインゲームループ
    gameLoop(currentTime = performance.now()) {
        if (!this.gameRunning) return;
        
        // フレームレート制限
        if (currentTime - this.lastRenderTime < this.renderInterval) {
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
        // プレイヤーぷよの落下処理
        this.updatePlayerPuyo();
        
        // 敵AIぷよの落下処理
        this.updateEnemyAI();
        
        // 必要な場合のみ描画更新
        if (this.playerBoardDirty) {
            this.renderPlayerBoard();
            this.playerBoardDirty = false;
        }
        
        if (this.enemyBoardDirty) {
            this.renderEnemyBoard();
            this.enemyBoardDirty = false;
        }
        
        this.lastRenderTime = currentTime;
        
        // 次フレーム
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // プレイヤーぷよ更新
    updatePlayerPuyo() {
        if (!this.playerCurrentPuyo) return;
        
        this.playerFallTimer++;
        
        // 落下時間に達したら下に移動
        if (this.playerFallTimer >= this.playerFallSpeed) {
            this.playerFallTimer = 0;
            
            if (this.canMovePuyo(this.playerPuyoX, this.playerPuyoY + 1, this.playerPuyoRotation)) {
                this.playerPuyoY++;
                this.playerBoardDirty = true; // 位置変更時にdirty flag設定
            } else {
                // 着地処理
                this.placePuyo();
            }
        }
    }
    
    // ぷよ移動可能チェック
    canMovePuyo(x, y, rotation) {
        const positions = this.getPuyoPositions(x, y, rotation);
        
        for (const pos of positions) {
            // 境界チェック
            if (pos.x < 0 || pos.x >= 6 || pos.y >= 12) {
                return false;
            }
            
            // 上端は通過可能
            if (pos.y < 0) {
                continue;
            }
            
            // 既存ぷよとの衝突チェック
            if (this.playerBoard[pos.y][pos.x] !== 0) {
                return false;
            }
        }
        
        return true;
    }
    
    // ぷよのローカル座標取得
    getPuyoPositions(x, y, rotation) {
        const positions = [
            { x: x, y: y },      // メインぷよ
            { x: x, y: y - 1 }   // サブぷよ（初期状態：上）
        ];
        
        // 回転に応じてサブぷよの位置を調整
        switch (rotation) {
            case 0: // 上
                positions[1] = { x: x, y: y - 1 };
                break;
            case 1: // 右
                positions[1] = { x: x + 1, y: y };
                break;
            case 2: // 下
                positions[1] = { x: x, y: y + 1 };
                break;
            case 3: // 左
                positions[1] = { x: x - 1, y: y };
                break;
        }
        
        return positions;
    }
    
    // ぷよ配置
    placePuyo() {
        if (!this.playerCurrentPuyo) return;
        
        const positions = this.getPuyoPositions(this.playerPuyoX, this.playerPuyoY, this.playerPuyoRotation);
        
        // 🔧 修正: 各ぷよを個別に着地判定し、分離可能にする
        const landedPuyos = [];
        const floatingPuyos = [];
        
        positions.forEach((pos, index) => {
            if (pos.y >= 0 && pos.y < 12 && pos.x >= 0 && pos.x < 6) {
                // 着地可能かチェック
                if (pos.y === 11 || this.playerBoard[pos.y + 1][pos.x] !== 0) {
                    // 着地
                    landedPuyos.push({ pos, color: this.playerCurrentPuyo.colors[index] });
                } else {
                    // 浮遊状態 - 重力で落下
                    floatingPuyos.push({ pos, color: this.playerCurrentPuyo.colors[index] });
                }
            }
        });
        
        // 着地したぷよをボードに配置
        landedPuyos.forEach(({ pos, color }) => {
            this.playerBoard[pos.y][pos.x] = color;
        });
        
        // 浮遊ぷよを重力で落下
        floatingPuyos.forEach(({ pos, color }) => {
            // 最終着地位置を計算
            let finalY = pos.y;
            while (finalY < 11 && this.playerBoard[finalY + 1][pos.x] === 0) {
                finalY++;
            }
            this.playerBoard[finalY][pos.x] = color;
        });
        
        this.playerBoardDirty = true; // ボード更新時にdirty flag設定
        console.log(`📍 ぷよ配置完了 - 着地:${landedPuyos.length}, 分離落下:${floatingPuyos.length}`);
        
        // 連鎖チェック
        this.checkChains();
        
        // 新しいぷよをスポーン
        this.spawnNewPlayerPuyo();
    }
    
    // 連鎖チェック
    checkChains() {
        // 簡単な連鎖チェック（4個以上の同色グループ）
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            console.log(`🔥 ${matches.length}個のマッチを発見`);
            
            // マッチしたぷよを削除
            matches.forEach(match => {
                match.forEach(pos => {
                    this.playerBoard[pos.y][pos.x] = 0;
                });
            });
            
            // 重力適用
            this.applyGravity();
            
            // 敵にダメージ
            const damage = matches.length;
            this.dealDamageToEnemy(damage);
            
            // 再帰的に連鎖チェック（超高速化）
            setTimeout(() => this.checkChains(), 50);
        }
    }
    
    // マッチ検索
    findMatches(board = null) {
        const targetBoard = board || this.playerBoard;
        const visited = Array(12).fill().map(() => Array(6).fill(false));
        const matches = [];
        
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 6; x++) {
                if (targetBoard[y][x] !== 0 && !visited[y][x]) {
                    const group = this.findConnectedGroup(x, y, targetBoard[y][x], visited, targetBoard);
                    if (group.length >= 4) {
                        matches.push(group); // グループとして追加
                    }
                }
            }
        }
        
        return matches;
    }
    
    // 接続グループ検索
    findConnectedGroup(startX, startY, color, visited, board = null) {
        const targetBoard = board || this.playerBoard;
        const group = [];
        const stack = [{x: startX, y: startY}];
        
        while (stack.length > 0) {
            const {x, y} = stack.pop();
            
            if (x < 0 || x >= 6 || y < 0 || y >= 12 || visited[y][x] || targetBoard[y][x] !== color) {
                continue;
            }
            
            visited[y][x] = true;
            group.push({x, y});
            
            // 4方向をチェック
            stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
        }
        
        return group;
    }
    
    
    // 重力適用
    applyGravity(board = null) {
        const targetBoard = board || this.playerBoard;
        
        for (let x = 0; x < 6; x++) {
            let writePos = 11;
            for (let y = 11; y >= 0; y--) {
                if (targetBoard[y][x] !== 0) {
                    if (y !== writePos) {
                        targetBoard[writePos][x] = targetBoard[y][x];
                        targetBoard[y][x] = 0;
                    }
                    writePos--;
                }
            }
        }
    }
    
    // プレイヤー操作設定
    setupPlayerControls() {
        // 既存のキーハンドラーを削除
        if (this.playerKeyHandler) {
            document.removeEventListener('keydown', this.playerKeyHandler);
        }
        
        this.playerKeyHandler = (e) => {
            if (!this.gameRunning || !this.playerCurrentPuyo) return;
            
            switch (e.key.toLowerCase()) {
                case 'a':
                case 'arrowleft':
                    this.movePlayerPuyo(-1, 0);
                    e.preventDefault();
                    break;
                case 'd':
                case 'arrowright':
                    this.movePlayerPuyo(1, 0);
                    e.preventDefault();
                    break;
                case 's':
                case 'arrowdown':
                    this.fastDropPlayerPuyo(); // 高速落下機能を追加
                    e.preventDefault();
                    break;
                case ' ':
                case 'space':
                    this.rotatePlayerPuyo();
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.playerKeyHandler);
        console.log('🎮 プレイヤー操作を設定しました');
    }
    
    // プレイヤーぷよ移動
    movePlayerPuyo(dx, dy) {
        const newX = this.playerPuyoX + dx;
        const newY = this.playerPuyoY + dy;
        
        if (this.canMovePuyo(newX, newY, this.playerPuyoRotation)) {
            this.playerPuyoX = newX;
            this.playerPuyoY = newY;
            this.playerBoardDirty = true; // 移動時にdirty flag設定
            
            // 下移動の場合は落下タイマーをリセット
            if (dy > 0) {
                this.playerFallTimer = 0;
            }
        }
    }
    
    // プレイヤーぷよ高速落下（適度な速度）
    fastDropPlayerPuyo() {
        if (!this.playerCurrentPuyo) return;
        
        // 1段ずつ下に移動（通常の4倍速程度）
        if (this.canMovePuyo(this.playerPuyoX, this.playerPuyoY + 1, this.playerPuyoRotation)) {
            this.playerPuyoY++;
            this.playerBoardDirty = true;
            this.playerFallTimer = 0; // 落下タイマーリセット
            console.log(`⬇️ プレイヤー高速落下: 1段`);
        } else {
            // 着地処理
            this.placePuyo();
        }
    }
    
    // プレイヤーぷよ回転
    rotatePlayerPuyo() {
        const newRotation = (this.playerPuyoRotation + 1) % 4;
        
        if (this.canMovePuyo(this.playerPuyoX, this.playerPuyoY, newRotation)) {
            this.playerPuyoRotation = newRotation;
            this.playerBoardDirty = true; // 回転時にdirty flag設定
        }
    }
    
    // ランダムぷよ色取得
    getRandomPuyoColor(rates) {
        const random = Math.random() * 100;
        let cumulative = 0;
        
        // 基本色
        const basicColors = ['red', 'blue', 'yellow', 'green', 'purple'];
        for (let i = 0; i < basicColors.length; i++) {
            cumulative += rates[basicColors[i]];
            if (random <= cumulative) {
                return i + 1; // 1-5の色インデックス
            }
        }
        
        // 特殊ぷよ
        for (const [type, rate] of Object.entries(rates.special)) {
            cumulative += rate;
            if (random <= cumulative) {
                return this.getSpecialPuyoColorIndex(type);
            }
        }
        
        return 1; // デフォルト赤
    }
    
    // 特殊ぷよ色インデックス取得
    getSpecialPuyoColorIndex(type) {
        const specialColorMap = {
            fire: 6,
            poison: 7,
            crystal: 8,
            lightning: 9,
            ice: 10,
            wind: 11
        };
        return specialColorMap[type] || 1;
    }
    
    // プレイヤー次ぷよ表示更新
    updatePlayerNextDisplay() {
        const nextDisplay = document.getElementById('story-player-next');
        if (!nextDisplay || !this.playerNextPuyo) return;
        
        // 既存のcanvasを再利用、なければ作成
        let canvas = nextDisplay.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width = 100;  // 50x2の幅
            canvas.height = 50;  // 50の高さ
            nextDisplay.innerHTML = '';
            nextDisplay.appendChild(canvas);
        }
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 次のぷよ2個を描画（30x30のサイズ）
        this.drawNextPuyo(ctx, 0, 0, this.playerNextPuyo.colors[0]);
        this.drawNextPuyo(ctx, 1, 0, this.playerNextPuyo.colors[1]);
    }
    
    // 敵ぷよ生成
    generateEnemyPuyo() {
        // 敵は通常のランダムぷよ（特殊ぷよなし）
        const color1 = Math.floor(Math.random() * 5) + 1;
        const color2 = Math.floor(Math.random() * 5) + 1;
        
        this.enemyCurrentPuyo = { colors: [color1, color2] };
        this.enemyNextPuyo = { 
            colors: [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1]
        };
        
        this.updateEnemyNextDisplay();
    }
    
    // 敵次ぷよ表示更新
    updateEnemyNextDisplay() {
        const nextDisplay = document.getElementById('story-enemy-next');
        if (!nextDisplay || !this.enemyNextPuyo) return;
        
        // 既存のcanvasを再利用、なければ作成
        let canvas = nextDisplay.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width = 100;  // 50x2の幅
            canvas.height = 50;  // 50の高さ
            nextDisplay.innerHTML = '';
            nextDisplay.appendChild(canvas);
        }
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 次のぷよ2個を描画（30x30のサイズ）
        this.drawNextPuyo(ctx, 0, 0, this.enemyNextPuyo.colors[0]);
        this.drawNextPuyo(ctx, 1, 0, this.enemyNextPuyo.colors[1]);
    }
    
    // ポーション表示更新
    updatePotionsDisplay() {
        const potionsGrid = document.getElementById('player-potions');
        if (!potionsGrid) return;
        
        potionsGrid.innerHTML = '';
        
        // プレイヤーのポーション（現在は空）
        if (this.player.potions && this.player.potions.length > 0) {
            this.player.potions.forEach(potion => {
                const potionDiv = document.createElement('div');
                potionDiv.className = 'potion-item';
                potionDiv.textContent = potion.name;
                potionDiv.onclick = () => this.usePotion(potion);
                potionsGrid.appendChild(potionDiv);
            });
        } else {
            const emptyDiv = document.createElement('div');
            emptyDiv.textContent = 'ポーションなし';
            emptyDiv.style.gridColumn = '1 / -1';
            emptyDiv.style.textAlign = 'center';
            emptyDiv.style.color = '#888';
            potionsGrid.appendChild(emptyDiv);
        }
    }
    
    // 戦闘タイマー開始（削除済み）
    startBattleTimer() {
        // 制限時間機能を削除
        console.log('⏰ 制限時間なしで戦闘開始');
    }
    
    // 戦闘から戻る
    returnFromBattle() {
        // 戦闘画面を非表示
        const battleScreen = document.getElementById('story-battle-screen');
        if (battleScreen) {
            battleScreen.classList.add('hidden');
        }
        
        // ストーリー画面を表示
        const storyScreen = document.getElementById('story-screen');
        if (storyScreen) {
            storyScreen.classList.remove('hidden');
        }
        
        // タイマーとAI停止
        this.cleanupBattle();
        
        // ゲーム状態をメニューに戻す
        this.gameState = 'menu';
        const battleBtn = document.getElementById('start-battle-btn');
        if (battleBtn) battleBtn.disabled = false;
    }
    
    // 戦闘終了処理
    endBattle(reason) {
        this.cleanupBattle();
        
        // タイムアップ機能削除済み
        console.log('⚔️ 戦闘終了:', reason);
    }
    
    // 戦闘クリーンアップ
    cleanupBattle() {
        // タイマー関連コード削除済み
        this.stopEnemyAI();
        
        // ゲームループ停止
        this.gameRunning = false;
        
        // プレイヤー操作削除
        if (this.playerKeyHandler) {
            document.removeEventListener('keydown', this.playerKeyHandler);
            this.playerKeyHandler = null;
        }
        
        // 戦闘データをクリア
        this.playerBoard = null;
        this.enemyBoard = null;
        this.playerCurrentPuyo = null;
        this.playerNextPuyo = null;
        this.enemyCurrentPuyo = null;
        this.enemyNextPuyo = null;
        this.playerFallTimer = 0;
        this.playerPuyoX = 2;
        this.playerPuyoY = 0;
        this.playerPuyoRotation = 0;
        
        // 敵AI状態をクリア
        this.enemyAI = null;
        this.enemyMoveTimer = 0;
        this.enemyDropTimer = 0;
        
        // キャンバスをクリア
        if (this.playerCtx) {
            this.playerCtx.clearRect(0, 0, this.playerCtx.canvas.width, this.playerCtx.canvas.height);
        }
        if (this.enemyCtx) {
            this.enemyCtx.clearRect(0, 0, this.enemyCtx.canvas.width, this.enemyCtx.canvas.height);
        }
        
        console.log('🧹 戦闘データを完全にクリアしました');
    }
    
    // リアルタイム戦闘システム
    startRealTimeBattle() {
        console.log('⚔️ リアルタイム戦闘開始');
        this.addLogEntry('リアルタイム戦闘が始まりました！', 'info');
        this.addLogEntry('連鎖を組んで敵にダメージを与えよう！', 'info');
        
        // AIの行動パターンを開始
        this.startEnemyAI();
        
        // プレイヤーの連鎖をシミュレート（デモ用）
        setTimeout(() => {
            this.simulatePlayerChain();
        }, 2000);
    }
    
    // 敵AIシステム
    startEnemyAI() {
        this.enemyAI = {
            active: true,
            attackPower: this.currentEnemy.attack,
            puyoFallTimer: 0,
            puyoFallSpeed: 45, // プレイヤーより少し早い中間速度
            currentPuyo: null,
            nextPuyo: null,
            puyoX: 2,
            puyoY: 0,
            puyoRotation: 0,
            thinkingTime: 0,
            actionDecided: false,
            // 連鎖構築システム
            chainPlan: null,
            currentPhase: 'foundation', // foundation, extension, trigger
            targetPattern: 'gtr', // gtr, stairs, tsurukami
            evaluationDepth: 4,
            confidenceThreshold: 0.7,
            chainGoal: 6 // 目標連鎖数
        };
        
        // 敵の最初のぷよを生成
        this.generateEnemyPuyo();
        this.spawnNewEnemyPuyo();
        
        // 連鎖プラン初期化
        this.initializeChainPlan();
        
        console.log(`🧠 高度AI開始 - 連鎖構築システム (目標: ${this.enemyAI.chainGoal}連鎖)`);
    }
    
    // 連鎖プラン初期化
    initializeChainPlan() {
        // GTRテンプレートを基本とした連鎖プラン
        this.enemyAI.chainPlan = {
            type: 'gtr',
            phases: [
                {
                    name: 'foundation',
                    steps: [
                        { col: 0, rotation: 0, priority: 10, description: '1列目土台' },
                        { col: 1, rotation: 0, priority: 9, description: '2列目土台' },
                        { col: 1, rotation: 0, priority: 8, description: '2列目積み上げ' }
                    ]
                },
                {
                    name: 'fold_back',
                    steps: [
                        { col: 2, rotation: 1, priority: 7, description: '3列目横置き' },
                        { col: 1, rotation: 1, priority: 6, description: '2列目上段横置き' }
                    ]
                },
                {
                    name: 'chain_tail',
                    steps: [
                        { col: 3, rotation: 0, priority: 5, description: '4列目連鎖尾' },
                        { col: 4, rotation: 0, priority: 4, description: '5列目延長' },
                        { col: 5, rotation: 0, priority: 3, description: '6列目延長' }
                    ]
                }
            ],
            currentStep: 0,
            completedSteps: 0
        };
    }
    
    // 連鎖評価システム
    evaluateChainPotential(board, simulateDepth = 3) {
        let maxChain = 0;
        let bestScore = 0;
        
        // 各色のぷよを仮想的に置いて連鎖をシミュレート
        for (let col = 0; col < 6; col++) {
            for (let color = 1; color <= 5; color++) {
                const testBoard = this.copyBoard(board);
                
                // ぷよを仮想配置
                const height = this.getColumnHeight(testBoard, col);
                if (height < 12) {
                    testBoard[11 - height][col] = color;
                    
                    // 連鎖シミュレート
                    const chainResult = this.simulateChain(testBoard);
                    if (chainResult.chainCount > maxChain) {
                        maxChain = chainResult.chainCount;
                        bestScore = chainResult.score;
                    }
                }
            }
        }
        
        return {
            maxChain: maxChain,
            score: bestScore,
            potential: this.calculateChainPotential(board)
        };
    }
    
    // 連鎖シミュレート
    simulateChain(board) {
        const testBoard = this.copyBoard(board);
        let chainCount = 0;
        let totalScore = 0;
        
        while (true) {
            const matches = this.findMatches(testBoard);
            if (matches.length === 0) break;
            
            chainCount++;
            
            // マッチしたぷよを削除
            matches.forEach(group => {
                group.forEach(pos => {
                    testBoard[pos.y][pos.x] = 0;
                });
            });
            
            // 重力適用
            this.applyGravity(testBoard);
            
            // スコア計算（連鎖数に応じて指数的に増加）
            let chainScore = 0;
            matches.forEach(group => chainScore += group.length);
            totalScore += chainScore * Math.pow(2, chainCount - 1);
        }
        
        return {
            chainCount: chainCount,
            score: totalScore
        };
    }
    
    // 敵ぷよ配置シミュレーション
    simulateEnemyPlacement(col, rotation) {
        const currentPuyo = this.enemyAI.currentPuyo;
        if (!currentPuyo || !currentPuyo.colors) return null;
        
        // ボードをコピー
        const testBoard = this.copyBoard(this.enemyBoard);
        
        // 回転した後のぷよの位置を計算
        const rotatedPositions = this.getPuyoPositions(col, 0, rotation);
        
        // 配置可能性チェック
        const landedPositions = [];
        for (let i = 0; i < rotatedPositions.length; i++) {
            const pos = rotatedPositions[i];
            if (pos.x < 0 || pos.x >= 6) return null; // 範囲外
            
            // 落下位置を計算
            let finalY = pos.y;
            while (finalY < 11 && testBoard[finalY + 1][pos.x] === 0) {
                finalY++;
            }
            
            if (finalY < 0) return null; // 配置不可能
            
            landedPositions.push({ x: pos.x, y: finalY, color: currentPuyo.colors[i] });
        }
        
        // テストボードにぷよを配置
        landedPositions.forEach(pos => {
            testBoard[pos.y][pos.x] = pos.color;
        });
        
        // 重力適用
        this.applyGravity(testBoard);
        
        // 連鎖シミュレーション
        const chainResult = this.simulateChain(testBoard);
        
        return {
            board: testBoard,
            chains: chainResult.chainCount,
            score: chainResult.score,
            positions: landedPositions
        };
    }
    
    // ボードコピー
    copyBoard(board) {
        return board.map(row => [...row]);
    }
    
    // 列の高さ取得
    getColumnHeight(board, col) {
        for (let row = 0; row < 12; row++) {
            if (board[row][col] !== 0) {
                return 12 - row;
            }
        }
        return 0;
    }
    
    // 連鎖ポテンシャル計算
    calculateChainPotential(board) {
        let potential = 0;
        
        // 各色の分布を分析
        const colorCounts = {};
        const colorPositions = {};
        
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 6; x++) {
                const color = board[y][x];
                if (color !== 0) {
                    colorCounts[color] = (colorCounts[color] || 0) + 1;
                    if (!colorPositions[color]) colorPositions[color] = [];
                    colorPositions[color].push({ x, y });
                }
            }
        }
        
        // 同色グループの隣接性を評価
        for (const color in colorPositions) {
            const positions = colorPositions[color];
            let adjacencyScore = 0;
            
            positions.forEach(pos1 => {
                positions.forEach(pos2 => {
                    const distance = Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
                    if (distance === 1) adjacencyScore += 2;
                    else if (distance === 2) adjacencyScore += 1;
                });
            });
            
            potential += adjacencyScore * Math.sqrt(colorCounts[color]);
        }
        
        return potential;
    }
    
    // 🎮 敵AI更新（リアルキー操作システム）
    updateEnemyAI() {
        if (!this.enemyAI || !this.enemyAI.active) return;
        
        // 敵の現在のぷよがない場合は新しく生成
        if (!this.enemyAI.currentPuyo) {
            this.spawnNewEnemyPuyo();
            return;
        }
        
        // 🎯 AIの思考・操作タイミング管理
        this.enemyAI.thinkingTime++;
        
        // AIが操作を決定するまでの思考時間
        if (this.enemyAI.thinkingTime > 60 && !this.enemyAI.actionDecided) { // プレイヤーと同じペース（約1秒）
            console.log('🎯 AI思考開始');
            this.makeEnemyDecision();
            this.enemyAI.thinkingTime = 0;
            this.enemyAI.actionDecided = true;
            this.enemyAI.operationPhase = 'positioning'; // 位置決めフェーズ開始
            console.log('🎯 AI思考完了、操作フェーズ開始');
        }
        
        // 🎮 操作実行フェーズ（位置決め中）
        if (this.enemyAI.actionDecided && this.enemyAI.operationPhase === 'positioning') {
            this.enemyAI.operationTimer = (this.enemyAI.operationTimer || 0) + 1;
            
            // 🎭 人間らしい可変操作間隔
            const baseDelay = 15; // プレイヤーと同じ操作間隔
            const randomDelay = this.enemyAI.nextActionDelay || 0;
            const currentDelay = baseDelay + randomDelay;
            
            if (this.enemyAI.operationTimer >= currentDelay) {
                console.log('🎮 AI操作実行中...');
                this.executeAIOperation();
                this.enemyAI.operationTimer = 0;
                this.enemyAI.nextActionDelay = 0; // リセット
            }
        }
        
        // 🚀 通常の重力落下（操作していない時のみ）
        if (!this.enemyAI.actionDecided || this.enemyAI.operationPhase === 'falling') {
            this.enemyAI.puyoFallTimer++;
            
            if (this.enemyAI.puyoFallTimer >= this.enemyAI.puyoFallSpeed) {
                this.enemyAI.puyoFallTimer = 0;
                
                if (this.canMoveEnemyPuyo(this.enemyAI.puyoX, this.enemyAI.puyoY + 1, this.enemyAI.puyoRotation)) {
                    this.enemyAI.puyoY++;
                    this.enemyBoardDirty = true;
                } else {
                    // 着地処理
                    this.placeEnemyPuyo();
                }
            }
        }
    }
    
    // 🎮 AI操作実行
    executeAIOperation() {
        if (!this.enemyAI.targetPlacement) return;
        
        const target = this.enemyAI.targetPlacement;
        const currentX = this.enemyAI.puyoX;
        const currentRotation = this.enemyAI.puyoRotation;
        
        // 🎯 操作優先順位: 1.回転 → 2.横移動 → 3.高速落下
        
        // 1. 回転調整
        if (currentRotation !== target.rotation) {
            this.performEnemyKeyAction('SPACE');
            return;
        }
        
        // 2. 横移動調整
        if (currentX < target.column) {
            this.performEnemyKeyAction('D');
            return;
        } else if (currentX > target.column) {
            this.performEnemyKeyAction('A');
            return;
        }
        
        // 3. 位置完了→高速落下で決定
        if (currentX === target.column && currentRotation === target.rotation) {
            this.performEnemyKeyAction('S');
            this.enemyAI.operationPhase = 'completed';
            this.enemyAI.actionDecided = false; // 次の操作準備
            this.enemyAI.targetPlacement = null;
        }
    }
    
    // 🧠 競技レベル高度AI判断システム 
    makeEnemyDecision() {
        const currentPuyo = this.enemyAI.currentPuyo;
        const nextPuyo = this.enemyAI.nextPuyo;
        
        if (!currentPuyo) return;
        
        // 🔍 詳細ボード分析（競技レベル）
        const boardAnalysis = this.performAdvancedBoardAnalysis();
        const playerThreat = this.analyzePlayerThreat();
        
        console.log(`🧠 競技AI思考: ${boardAnalysis.bestPattern}パターン, 連鎖${boardAnalysis.maxChain}, 脅威度${playerThreat.level}`);
        
        // 🛡️ 防御的判断（相手の攻撃に対応）
        if (playerThreat.level >= 3) {
            const counterMove = this.findCounterAttackMove(currentPuyo, playerThreat);
            if (counterMove) {
                console.log(`🛡️ 防御対応: ${counterMove.description}`);
                this.setAITarget(counterMove);
                return;
            }
        }
        
        // 🚨 多段階緊急回避システム
        const maxHeight = Math.max(...Array.from({length: 6}, (_, i) => 
            this.getColumnHeight(this.enemyBoard, i)
        ));
        
        // 超危険：11段以上で即座に連鎖発火
        if (maxHeight >= 11) {
            console.log('🚨 超危険！11段到達、即座に連鎖発火');
            const emergencyTrigger = this.findEmergencyChainTrigger();
            if (emergencyTrigger) {
                this.setAITarget(emergencyTrigger);
                return;
            }
        }
        
        // 危険：9段以上でも連鎖があれば発火
        if (maxHeight >= 9) {
            const emergencyTrigger = this.findEmergencyChainTrigger();
            if (emergencyTrigger && emergencyTrigger.score >= 10) { // 1連鎖以上
                console.log('⚠️ 危険！9段到達、予防的連鎖発火');
                this.setAITarget(emergencyTrigger);
                return;
            }
        }
        
        // ⚔️ 攻撃的判断（連鎖発火タイミング）
        if (this.shouldTriggerChainAdvanced(boardAnalysis, playerThreat)) {
            const triggerMove = this.findOptimalChainTrigger();
            if (triggerMove) {
                console.log(`🔥 競技連鎖発火: ${triggerMove.description}`);
                this.setAITarget(triggerMove);
                return;
            }
        }
        
        // 🏗️ 賢い盤面管理型構築
        const safeConstructionMove = this.findSafeConstructionMove(currentPuyo, nextPuyo, boardAnalysis);
        if (safeConstructionMove) {
            console.log(`🏗️ 安全構築: ${safeConstructionMove.description} (評価: ${safeConstructionMove.score})`);
            this.setAITarget(safeConstructionMove);
        } else {
            // 🎯 高さバランス重視フォールバック
            this.makeHeightBalancedFallback(currentPuyo, boardAnalysis);
        }
    }
    
    // 🎯 AI目標設定
    setAITarget(placement) {
        this.enemyAI.targetPlacement = {
            column: placement.column,
            rotation: placement.rotation,
            description: placement.description
        };
        console.log(`🎯 AI目標設定: ${placement.description} (${placement.column + 1}列目, 回転${placement.rotation})`);
    }
    
    // 🔍 高度ボード分析システム（競技レベル）
    performAdvancedBoardAnalysis() {
        const patterns = this.detectChainPatterns();
        const efficiency = this.calculateBoardEfficiency();
        const potential = this.analyzeChainPotentialAdvanced();
        
        return {
            bestPattern: patterns.dominant,
            patternCount: patterns.count,
            maxChain: potential.maxChain,
            efficiency: efficiency,
            constructionPhase: this.determineConstructionPhase(),
            strategicValue: potential.strategicValue
        };
    }
    
    // 🎯 連鎖パターン検出（GTR, Stairs, L-Shape, STSD等）
    detectChainPatterns() {
        const patterns = {
            gtr: this.detectGTRPattern(),
            stairs: this.detectStairsPattern(),
            lshape: this.detectLShapePattern(),
            sandwich: this.detectSandwichPattern(),
            fold: this.detectFoldPattern()
        };
        
        let dominantPattern = 'gtr';
        let maxScore = patterns.gtr.score;
        
        Object.keys(patterns).forEach(key => {
            if (patterns[key].score > maxScore) {
                maxScore = patterns[key].score;
                dominantPattern = key;
            }
        });
        
        return {
            dominant: dominantPattern,
            patterns: patterns,
            count: Object.values(patterns).filter(p => p.score > 0).length
        };
    }
    
    // 📊 GTRパターン検出
    detectGTRPattern() {
        const board = this.enemyBoard;
        let score = 0;
        
        // GTR基本形状の確認
        const col1Height = this.getColumnHeight(board, 0);
        const col2Height = this.getColumnHeight(board, 1);
        const col3Height = this.getColumnHeight(board, 2);
        
        // GTRの理想的な高さ比率
        if (col1Height >= 2 && col2Height >= 3 && col3Height >= 1) {
            score += 30;
            
            // 色配置の確認
            if (this.checkGTRColorPattern()) {
                score += 20;
            }
            
            // 折り返し構造
            if (col2Height > col1Height && col3Height < col2Height) {
                score += 15;
            }
        }
        
        return { score, type: 'gtr', phase: this.getGTRPhase() };
    }
    
    // 🎯 階段パターン検出
    detectStairsPattern() {
        const board = this.enemyBoard;
        let score = 0;
        
        // 階段状の高さ変化を確認
        for (let col = 0; col < 5; col++) {
            const currentHeight = this.getColumnHeight(board, col);
            const nextHeight = this.getColumnHeight(board, col + 1);
            
            if (Math.abs(currentHeight - nextHeight) === 1) {
                score += 5;
            }
            
            // 3-1階段パターン
            if (this.check31StairsPattern(col)) {
                score += 25;
            }
        }
        
        return { score, type: 'stairs', variant: this.getStairsVariant() };
    }
    
    // 🔄 L字パターン検出
    detectLShapePattern() {
        const board = this.enemyBoard;
        let score = 0;
        
        // L字の基本構造を確認
        for (let x = 0; x < 5; x++) {
            for (let y = 1; y < 11; y++) {
                if (this.checkLShapeAt(x, y)) {
                    score += 20;
                }
            }
        }
        
        return { score, type: 'lshape' };
    }
    
    // 🥪 サンドイッチパターン検出
    detectSandwichPattern() {
        const board = this.enemyBoard;
        let score = 0;
        
        for (let col = 1; col < 5; col++) {
            if (this.checkSandwichPattern(col)) {
                score += 15;
            }
        }
        
        return { score, type: 'sandwich' };
    }
    
    // 📐 折り返しパターン検出
    detectFoldPattern() {
        const board = this.enemyBoard;
        let score = 0;
        
        // 折り返し構造の確認
        const leftSide = this.analyzeLeftSide();
        const rightSide = this.analyzeRightSide();
        
        if (leftSide.height >= 4 && rightSide.height >= 2) {
            score += 20;
            
            if (this.checkFoldConnection()) {
                score += 15;
            }
        }
        
        return { score, type: 'fold' };
    }
    
    // 🎮 プレイヤー脅威度分析
    analyzePlayerThreat() {
        const playerChains = this.evaluateChainPotential(this.playerBoard);
        const playerHeight = Math.max(...Array.from({length: 6}, (_, i) => 
            this.getColumnHeight(this.playerBoard, i)
        ));
        
        let threatLevel = 0;
        
        // 連鎖数による脅威度
        if (playerChains.maxChain >= 6) threatLevel = 5;
        else if (playerChains.maxChain >= 4) threatLevel = 4;
        else if (playerChains.maxChain >= 3) threatLevel = 3;
        else if (playerChains.maxChain >= 2) threatLevel = 2;
        else threatLevel = 1;
        
        // 高さによる脅威度調整
        if (playerHeight >= 10) threatLevel = Math.max(threatLevel, 4);
        else if (playerHeight >= 8) threatLevel = Math.max(threatLevel, 3);
        
        return {
            level: threatLevel,
            maxChain: playerChains.maxChain,
            height: playerHeight,
            urgency: threatLevel >= 4 ? 'critical' : threatLevel >= 3 ? 'high' : 'normal'
        };
    }
    
    // 🛡️ カウンターアタック判定
    findCounterAttackMove(currentPuyo, playerThreat) {
        // 相手の脅威度が高い場合の対応策
        if (playerThreat.urgency === 'critical') {
            // 即座に連鎖発火できるかチェック
            const immediateChain = this.findImmediateChainTrigger(currentPuyo);
            if (immediateChain && immediateChain.chainCount >= 3) {
                return {
                    column: immediateChain.column,
                    rotation: immediateChain.rotation,
                    priority: 200,
                    description: `緊急反撃${immediateChain.chainCount}連鎖`
                };
            }
        }
        
        // 防御的な配置
        if (playerThreat.level >= 3) {
            return this.findDefensiveMove(currentPuyo);
        }
        
        return null;
    }
    
    // ⚔️ 高度連鎖発火判断（小さい連鎖優先版）
    shouldTriggerChainAdvanced(boardAnalysis, playerThreat) {
        const chainCount = boardAnalysis.maxChain;
        const efficiency = boardAnalysis.efficiency;
        
        // フィールド状況を考慮（高さが危険な場合は早めに発火）
        const maxHeight = Math.max(...Array.from({length: 6}, (_, i) => 
            this.getColumnHeight(this.enemyBoard, i)
        ));
        
        // 🎯 賢い連鎖発火判断（絶対に死なない戦略）
        
        // 超緊急：高さが10以上で即座に発火（1連鎖でも）
        if (maxHeight >= 10) {
            console.log('🚨 超緊急！即座に連鎖発火');
            return true;
        }
        
        // 緊急：高さが8以上で2連鎖以上なら発火
        if (maxHeight >= 8 && chainCount >= 2) {
            console.log('⚠️ 緊急回避！2連鎖発火');
            return true;
        }
        
        // 予防：高さが6以上で3連鎖以上なら発火
        if (maxHeight >= 6 && chainCount >= 3) {
            console.log('📊 予防発火！3連鎖で安全確保');
            return true;
        }
        
        // 積極発火：4連鎖以上なら高さに関係なく発火
        if (chainCount >= 4) {
            console.log('🔥 4連鎖完成！積極発火');
            return true;
        }
        
        // 攻撃的発火：5連鎖以上なら必ず発火
        if (chainCount >= 5) {
            console.log('⚡ 5連鎖！必殺発火');
            return true;
        }
        
        // 相手の脅威度に応じた判断（より保守的）
        if (playerThreat.level >= 4 && chainCount >= 2) return true;
        if (playerThreat.level >= 3 && chainCount >= 3) return true;
        
        // 効率性を考慮（より低い閾値）
        if (chainCount >= 3 && efficiency >= 0.5) return true;
        
        // 盤面が半分以上埋まっていたら小さい連鎖でも発火
        const totalPuyos = Array.from({length: 6}, (_, i) => 
            this.getColumnHeight(this.enemyBoard, i)
        ).reduce((sum, h) => sum + h, 0);
        
        if (totalPuyos >= 30 && chainCount >= 2) {
            console.log('🧹 盤面満杯！2連鎖で掃除');
            return true;
        }
        
        return false;
    }
    
    // 🚨 緊急連鎖発火位置検索（ゲームオーバー回避）
    findEmergencyChainTrigger() {
        const currentPuyo = this.enemyAI.currentPuyo;
        if (!currentPuyo) return null;
        
        // どんな小さい連鎖でも発火可能な位置を探す
        for (let col = 0; col < 6; col++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                const simulation = this.simulateEnemyPlacement(col, rotation);
                if (simulation && simulation.chains >= 1) { // 1連鎖でも発火
                    return {
                        column: col,
                        rotation: rotation,
                        score: simulation.chains * 10,
                        description: `緊急回避${simulation.chains}連鎖`
                    };
                }
            }
        }
        
        // 連鎖が見つからない場合は、最も低い列に配置
        let lowestCol = 0;
        let lowestHeight = this.getColumnHeight(this.enemyBoard, 0);
        
        for (let col = 1; col < 6; col++) {
            const height = this.getColumnHeight(this.enemyBoard, col);
            if (height < lowestHeight) {
                lowestHeight = height;
                lowestCol = col;
            }
        }
        
        return {
            column: lowestCol,
            rotation: 0,
            score: 1,
            description: `緊急回避配置(${lowestCol + 1}列目)`
        };
    }
    
    // 🎯 最適連鎖発火位置検索
    findOptimalChainTrigger() {
        const currentPuyo = this.enemyAI.currentPuyo;
        if (!currentPuyo) return null;
        
        let bestTrigger = null;
        let bestScore = 0;
        
        // 全ての可能位置で連鎖シミュレーション
        for (let col = 0; col < 6; col++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                if (this.canMoveEnemyPuyo(col, 0, rotation)) {
                    const result = this.simulateAdvancedChain(col, rotation, currentPuyo);
                    
                    if (result.chainCount >= 2) {
                        const score = result.chainCount * 100 + result.score;
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestTrigger = {
                                column: col,
                                rotation: rotation,
                                priority: 150,
                                description: `${result.chainCount}連鎖 (${result.score}pt)`,
                                chainCount: result.chainCount,
                                score: result.score
                            };
                        }
                    }
                }
            }
        }
        
        return bestTrigger;
    }
    
    // 🏗️ 安全重視構築（高さ制御優先）
    findSafeConstructionMove(currentPuyo, nextPuyo, boardAnalysis) {
        if (!currentPuyo) return null;
        
        const moves = [];
        
        // 全ての配置をテストし、安全性を評価
        for (let col = 0; col < 6; col++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                const simulation = this.simulateEnemyPlacement(col, rotation);
                if (simulation) {
                    const heightAfter = this.getColumnHeight(this.enemyBoard, col) + 2;
                    
                    // 高さ安全性チェック（8段以下を優先）
                    const heightSafety = Math.max(0, 8 - heightAfter) * 10;
                    
                    // 連鎖ポテンシャル
                    const chainPotential = simulation.chains * 20;
                    
                    // 全体的なバランス
                    const heightBalance = this.calculateHeightBalance(col) * 5;
                    
                    const totalScore = heightSafety + chainPotential + heightBalance;
                    
                    moves.push({
                        column: col,
                        rotation: rotation,
                        score: totalScore,
                        heightSafety: heightSafety,
                        description: `安全配置(${col + 1}列,${totalScore.toFixed(1)}点)`
                    });
                }
            }
        }
        
        // 安全性重視でソート
        moves.sort((a, b) => b.score - a.score);
        return moves.length > 0 ? moves[0] : null;
    }
    
    // 高さバランス計算
    calculateHeightBalance(targetCol) {
        const heights = Array.from({length: 6}, (_, i) => 
            this.getColumnHeight(this.enemyBoard, i)
        );
        
        const avgHeight = heights.reduce((sum, h) => sum + h, 0) / 6;
        const variance = heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / 6;
        
        // 分散が小さいほど（バランスが良い）高スコア
        return Math.max(0, 10 - variance);
    }
    
    // 高さバランス重視フォールバック
    makeHeightBalancedFallback(currentPuyo, boardAnalysis) {
        if (!currentPuyo) return;
        
        const heights = Array.from({length: 6}, (_, i) => 
            this.getColumnHeight(this.enemyBoard, i)
        );
        
        // 最も低い列を優先
        let bestCol = 0;
        let minHeight = heights[0];
        
        for (let col = 1; col < 6; col++) {
            if (heights[col] < minHeight) {
                minHeight = heights[col];
                bestCol = col;
            }
        }
        
        // 安全な列に配置
        this.setAITarget({
            column: bestCol,
            rotation: 0,
            score: 100 - minHeight * 10,
            description: `高さバランス配置(${bestCol + 1}列,高さ${minHeight})`
        });
    }
    
    // 🏗️ 高度パターン構築（旧メソッド）
    findAdvancedConstructionMove(currentPuyo, nextPuyo, boardAnalysis) {
        const patternMoves = this.generatePatternBasedMoves(boardAnalysis.bestPattern, currentPuyo);
        const strategicMoves = this.generateStrategicMoves(currentPuyo, nextPuyo);
        
        const allMoves = [...patternMoves, ...strategicMoves];
        let bestMove = null;
        let bestScore = -1;
        
        allMoves.forEach(move => {
            const score = this.evaluateAdvancedMove(move, currentPuyo, boardAnalysis);
            if (score > bestScore) {
                bestScore = score;
                bestMove = { ...move, score };
            }
        });
        
        return bestMove;
    }
    
    // 🎯 戦略的フォールバック
    makeStrategicFallback(currentPuyo, boardAnalysis) {
        console.log('🎯 戦略的配置実行');
        
        // パターンの継続を試みる
        const patternMove = this.continuePattern(boardAnalysis.bestPattern, currentPuyo);
        if (patternMove) {
            this.setAITarget(patternMove);
            return;
        }
        
        // 効率的な配置
        const efficientMove = this.findEfficientPlacement(currentPuyo);
        if (efficientMove) {
            this.setAITarget(efficientMove);
            return;
        }
        
        // 最低限の安全配置
        this.makeEmergencyDecision();
    }
    
    // 🔧 補助関数群（高度AI用）
    
    // ボード効率性計算
    calculateBoardEfficiency() {
        const totalCells = 72; // 6x12
        const usedCells = this.countUsedCells(this.enemyBoard);
        const connectivity = this.calculateConnectivity(this.enemyBoard);
        
        return (connectivity / usedCells) * 0.8 + (usedCells / totalCells) * 0.2;
    }
    
    // 使用セル数カウント
    countUsedCells(board) {
        let count = 0;
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 6; x++) {
                if (board[y][x] !== 0) count++;
            }
        }
        return count;
    }
    
    // 連結性計算
    calculateConnectivity(board) {
        let totalConnections = 0;
        const directions = [[0,1], [0,-1], [1,0], [-1,0]];
        
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 6; x++) {
                if (board[y][x] !== 0) {
                    const color = board[y][x];
                    directions.forEach(([dx, dy]) => {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < 6 && ny >= 0 && ny < 12 && board[ny][nx] === color) {
                            totalConnections++;
                        }
                    });
                }
            }
        }
        
        return totalConnections;
    }
    
    // 高度連鎖ポテンシャル分析
    analyzeChainPotentialAdvanced() {
        const board = this.enemyBoard;
        const chainSim = this.simulateChain(board);
        const strategicValue = this.calculateStrategicValue(board);
        
        return {
            maxChain: chainSim.chainCount,
            score: chainSim.score,
            strategicValue: strategicValue
        };
    }
    
    // 戦略的価値計算
    calculateStrategicValue(board) {
        let value = 0;
        
        // パターン完成度
        value += this.calculatePatternCompleteness(board) * 50;
        
        // 発火準備度
        value += this.calculateTriggerReadiness(board) * 30;
        
        // フィールド安定性
        value += this.calculateFieldStability(board) * 20;
        
        return value;
    }
    
    // パターン完成度計算
    calculatePatternCompleteness(board) {
        const gtrScore = this.detectGTRPattern().score;
        const stairsScore = this.detectStairsPattern().score;
        return Math.max(gtrScore, stairsScore) / 100; // 正規化
    }
    
    // 発火準備度計算
    calculateTriggerReadiness(board) {
        let readiness = 0;
        
        // 各列で連鎖発火可能性をチェック
        for (let col = 0; col < 6; col++) {
            const testBoard = this.copyBoard(board);
            for (let color = 1; color <= 5; color++) {
                const height = this.getColumnHeight(testBoard, col);
                if (height < 12) {
                    testBoard[11 - height][col] = color;
                    const chains = this.simulateChain(testBoard);
                    if (chains.chainCount >= 2) {
                        readiness += chains.chainCount / 10;
                    }
                }
            }
        }
        
        return Math.min(readiness, 1); // 最大1に正規化
    }
    
    // フィールド安定性計算
    calculateFieldStability(board) {
        const heights = Array.from({length: 6}, (_, i) => this.getColumnHeight(board, i));
        const maxHeight = Math.max(...heights);
        const variance = this.calculateVariance(heights);
        
        // 高さが均等で、最大高さが危険でなければ安定
        const stabilityScore = (1 - variance / 50) * (1 - maxHeight / 12);
        return Math.max(0, stabilityScore);
    }
    
    // 分散計算
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }
    
    // 構築フェーズ判定
    determineConstructionPhase() {
        const totalPuyos = this.countUsedCells(this.enemyBoard);
        
        if (totalPuyos < 8) return 'early';
        if (totalPuyos < 20) return 'middle';
        if (totalPuyos < 35) return 'late';
        return 'critical';
    }
    
    // GTR色パターンチェック
    checkGTRColorPattern() {
        const board = this.enemyBoard;
        
        // GTRの典型的な色配置をチェック
        // 簡略化版：基本的な色の連続性を確認
        for (let y = 8; y < 12; y++) {
            for (let x = 0; x < 3; x++) {
                if (board[y][x] !== 0) {
                    const color = board[y][x];
                    // 隣接する同色をチェック
                    if (this.countAdjacentSameColor(board, x, y, color) >= 2) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 隣接同色カウント
    countAdjacentSameColor(board, x, y, color) {
        let count = 0;
        const directions = [[0,1], [0,-1], [1,0], [-1,0]];
        
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < 6 && ny >= 0 && ny < 12 && board[ny][nx] === color) {
                count++;
            }
        });
        
        return count;
    }
    
    // GTRフェーズ取得
    getGTRPhase() {
        const analysis = this.analyzeBoardForGTR();
        
        if (analysis.heights[0] < 2) return 'foundation';
        if (analysis.heights[1] < 3) return 'building';
        if (analysis.heights[2] < 2) return 'folding';
        return 'extension';
    }
    
    // 3-1階段パターンチェック
    check31StairsPattern(col) {
        const board = this.enemyBoard;
        
        if (col >= 5) return false;
        
        const h1 = this.getColumnHeight(board, col);
        const h2 = this.getColumnHeight(board, col + 1);
        
        // 3-1パターン：片方が3、もう片方が1の差
        return Math.abs(h1 - h2) === 2;
    }
    
    // 階段バリエーション取得
    getStairsVariant() {
        const board = this.enemyBoard;
        const heights = Array.from({length: 6}, (_, i) => this.getColumnHeight(board, i));
        
        // 階段の種類を判定
        let ascending = 0;
        let descending = 0;
        
        for (let i = 0; i < 5; i++) {
            if (heights[i] < heights[i + 1]) ascending++;
            if (heights[i] > heights[i + 1]) descending++;
        }
        
        if (ascending > descending) return 'ascending';
        if (descending > ascending) return 'descending';
        return 'mixed';
    }
    
    // L字パターンチェック
    checkLShapeAt(x, y) {
        const board = this.enemyBoard;
        
        if (x >= 5 || y >= 11) return false;
        
        const center = board[y][x];
        if (center === 0) return false;
        
        // L字の基本形状をチェック
        const patterns = [
            [[0,0], [1,0], [0,1]], // ┐型
            [[0,0], [-1,0], [0,1]], // ┌型
            [[0,0], [1,0], [0,-1]], // ┘型
            [[0,0], [-1,0], [0,-1]]  // └型
        ];
        
        return patterns.some(pattern => {
            return pattern.every(([dx, dy]) => {
                const nx = x + dx;
                const ny = y + dy;
                return nx >= 0 && nx < 6 && ny >= 0 && ny < 12 && board[ny][nx] === center;
            });
        });
    }
    
    // サンドイッチパターンチェック
    checkSandwichPattern(col) {
        const board = this.enemyBoard;
        
        if (col <= 0 || col >= 5) return false;
        
        const leftHeight = this.getColumnHeight(board, col - 1);
        const centerHeight = this.getColumnHeight(board, col);
        const rightHeight = this.getColumnHeight(board, col + 1);
        
        // サンドイッチ：中央が両端より低い
        return centerHeight < leftHeight && centerHeight < rightHeight && 
               Math.abs(leftHeight - rightHeight) <= 1;
    }
    
    // 左側分析
    analyzeLeftSide() {
        const heights = Array.from({length: 3}, (_, i) => this.getColumnHeight(this.enemyBoard, i));
        return {
            height: Math.max(...heights),
            avgHeight: heights.reduce((sum, h) => sum + h, 0) / 3,
            stability: this.calculateVariance(heights)
        };
    }
    
    // 右側分析
    analyzeRightSide() {
        const heights = Array.from({length: 3}, (_, i) => this.getColumnHeight(this.enemyBoard, i + 3));
        return {
            height: Math.max(...heights),
            avgHeight: heights.reduce((sum, h) => sum + h, 0) / 3,
            stability: this.calculateVariance(heights)
        };
    }
    
    // 折り返し接続チェック
    checkFoldConnection() {
        const board = this.enemyBoard;
        
        // 左側と右側の接続をチェック
        for (let y = 6; y < 12; y++) {
            for (let x = 2; x <= 3; x++) {
                if (board[y][x] !== 0) {
                    const color = board[y][x];
                    // 隣接する同色があるかチェック
                    if (this.countAdjacentSameColor(board, x, y, color) >= 2) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 即座発火可能連鎖検索
    findImmediateChainTrigger(puyo) {
        for (let col = 0; col < 6; col++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                if (this.canMoveEnemyPuyo(col, 0, rotation)) {
                    const result = this.simulateAdvancedChain(col, rotation, puyo);
                    if (result.chainCount >= 2) {
                        return {
                            column: col,
                            rotation: rotation,
                            chainCount: result.chainCount
                        };
                    }
                }
            }
        }
        return null;
    }
    
    // 防御手検索
    findDefensiveMove(puyo) {
        // 最も安全な位置（低い列）に配置
        const heights = Array.from({length: 6}, (_, i) => this.getColumnHeight(this.enemyBoard, i));
        const safestCol = heights.indexOf(Math.min(...heights));
        
        return {
            column: safestCol,
            rotation: 0,
            priority: 50,
            description: '防御配置'
        };
    }
    
    // 高度連鎖シミュレーション
    simulateAdvancedChain(col, rotation, puyo) {
        const testBoard = this.copyBoard(this.enemyBoard);
        const dropResult = this.simulateEnemyDrop(testBoard, col, rotation, puyo);
        
        if (!dropResult.success) {
            return { chainCount: 0, score: 0 };
        }
        
        return this.simulateChain(dropResult.board);
    }
    
    // パターンベース手生成
    generatePatternBasedMoves(pattern, puyo) {
        const moves = [];
        
        switch (pattern) {
            case 'gtr':
                moves.push(...this.generateGTRMoves(puyo));
                break;
            case 'stairs':
                moves.push(...this.generateStairsMoves(puyo));
                break;
            case 'lshape':
                moves.push(...this.generateLShapeMoves(puyo));
                break;
            case 'sandwich':
                moves.push(...this.generateSandwichMoves(puyo));
                break;
            case 'fold':
                moves.push(...this.generateFoldMoves(puyo));
                break;
        }
        
        return moves;
    }
    
    // GTR構築手生成
    generateGTRMoves(puyo) {
        const moves = [];
        const phase = this.getGTRPhase();
        
        switch (phase) {
            case 'foundation':
                moves.push({ column: 0, rotation: 0, priority: 10, description: 'GTR土台1列目' });
                moves.push({ column: 1, rotation: 0, priority: 9, description: 'GTR土台2列目' });
                break;
            case 'building':
                moves.push({ column: 1, rotation: 0, priority: 8, description: 'GTR2列目積み上げ' });
                moves.push({ column: 2, rotation: 1, priority: 7, description: 'GTR3列目横置き' });
                break;
            case 'folding':
                moves.push({ column: 2, rotation: 1, priority: 7, description: 'GTR折り返し' });
                moves.push({ column: 1, rotation: 1, priority: 6, description: 'GTR上段横置き' });
                break;
            case 'extension':
                moves.push({ column: 3, rotation: 0, priority: 5, description: 'GTR連鎖尾' });
                moves.push({ column: 4, rotation: 0, priority: 4, description: 'GTR延長' });
                break;
        }
        
        return moves;
    }
    
    // 階段構築手生成
    generateStairsMoves(puyo) {
        const moves = [];
        const heights = Array.from({length: 6}, (_, i) => this.getColumnHeight(this.enemyBoard, i));
        
        // 階段パターンに合う配置を生成
        for (let col = 0; col < 5; col++) {
            if (Math.abs(heights[col] - heights[col + 1]) <= 1) {
                moves.push({
                    column: col,
                    rotation: 0,
                    priority: 6,
                    description: `階段${col + 1}列目`
                });
            }
        }
        
        return moves;
    }
    
    // L字構築手生成
    generateLShapeMoves(puyo) {
        const moves = [];
        
        // L字に適した位置を探す
        for (let col = 1; col < 5; col++) {
            const height = this.getColumnHeight(this.enemyBoard, col);
            if (height >= 2 && height <= 6) {
                moves.push({
                    column: col,
                    rotation: 1,
                    priority: 5,
                    description: `L字${col + 1}列目`
                });
            }
        }
        
        return moves;
    }
    
    // サンドイッチ構築手生成
    generateSandwichMoves(puyo) {
        const moves = [];
        
        for (let col = 1; col < 5; col++) {
            if (this.isGoodSandwichPosition(col)) {
                moves.push({
                    column: col,
                    rotation: 0,
                    priority: 6,
                    description: `サンドイッチ${col + 1}列目`
                });
            }
        }
        
        return moves;
    }
    
    // 折り返し構築手生成
    generateFoldMoves(puyo) {
        const moves = [];
        
        // 折り返しに適した中央部分
        for (let col = 2; col <= 3; col++) {
            moves.push({
                column: col,
                rotation: 1,
                priority: 7,
                description: `折り返し${col + 1}列目`
            });
        }
        
        return moves;
    }
    
    // 戦略的手生成
    generateStrategicMoves(currentPuyo, nextPuyo) {
        const moves = [];
        
        // 色を考慮した配置
        const colorMoves = this.generateColorBasedMoves(currentPuyo);
        moves.push(...colorMoves);
        
        // 次のぷよを考慮した配置
        const futureMoves = this.generateFutureMoves(currentPuyo, nextPuyo);
        moves.push(...futureMoves);
        
        return moves;
    }
    
    // 色ベース手生成
    generateColorBasedMoves(puyo) {
        const moves = [];
        const board = this.enemyBoard;
        
        // 同色隣接を狙う配置
        for (let col = 0; col < 6; col++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                if (this.canMoveEnemyPuyo(col, 0, rotation)) {
                    const score = this.evaluateColorSynergy(col, rotation, puyo);
                    if (score > 0) {
                        moves.push({
                            column: col,
                            rotation: rotation,
                            priority: Math.floor(score / 10),
                            description: `色連携${col + 1}列目`
                        });
                    }
                }
            }
        }
        
        return moves;
    }
    
    // 未来手生成
    generateFutureMoves(currentPuyo, nextPuyo) {
        const moves = [];
        
        if (!nextPuyo) return moves;
        
        // 2手先を考慮した配置
        for (let col = 0; col < 6; col++) {
            const synergy = this.evaluateTwoStepSynergy(col, currentPuyo, nextPuyo);
            if (synergy > 0) {
                moves.push({
                    column: col,
                    rotation: 0,
                    priority: Math.floor(synergy / 5),
                    description: `2手先連携${col + 1}列目`
                });
            }
        }
        
        return moves;
    }
    
    // 色相乗効果評価
    evaluateColorSynergy(col, rotation, puyo) {
        let score = 0;
        const testBoard = this.copyBoard(this.enemyBoard);
        const dropResult = this.simulateEnemyDrop(testBoard, col, rotation, puyo);
        
        if (!dropResult.success) return 0;
        
        // 配置後の隣接同色数をカウント
        dropResult.positions.forEach(pos => {
            score += this.countAdjacentSameColor(dropResult.board, pos.x, pos.y, pos.color) * 5;
        });
        
        return score;
    }
    
    // 2手先相乗効果評価
    evaluateTwoStepSynergy(col, currentPuyo, nextPuyo) {
        // 簡略化：同色が来る可能性を評価
        const testBoard = this.copyBoard(this.enemyBoard);
        const height = this.getColumnHeight(testBoard, col);
        
        if (height >= 11) return 0;
        
        // 現在のぷよと次のぷよの色の関係性を評価
        let synergy = 0;
        
        currentPuyo.colors.forEach(color1 => {
            nextPuyo.colors.forEach(color2 => {
                if (color1 === color2) {
                    synergy += 10; // 同色連続ボーナス
                }
            });
        });
        
        return synergy;
    }
    
    // 高度手評価
    evaluateAdvancedMove(move, puyo, boardAnalysis) {
        let score = move.priority || 0;
        
        // パターン適合性
        score += this.evaluatePatternFit(move, boardAnalysis.bestPattern) * 20;
        
        // 効率性
        score += boardAnalysis.efficiency * 30;
        
        // 安全性
        score += this.evaluateMoveSafety(move) * 15;
        
        // 将来性
        score += this.evaluateMoveFuture(move, puyo) * 25;
        
        return score;
    }
    
    // パターン適合性評価
    evaluatePatternFit(move, pattern) {
        switch (pattern) {
            case 'gtr':
                if (move.column <= 2) return 1;
                if (move.column === 3) return 0.7;
                return 0.3;
            case 'stairs':
                return 0.8; // 階段はどこでも適応可能
            case 'lshape':
                if (move.column >= 1 && move.column <= 4) return 0.9;
                return 0.4;
            default:
                return 0.5;
        }
    }
    
    // 手の安全性評価
    evaluateMoveSafety(move) {
        const height = this.getColumnHeight(this.enemyBoard, move.column);
        return Math.max(0, 1 - height / 12); // 高さが低いほど安全
    }
    
    // 手の将来性評価
    evaluateMoveFuture(move, puyo) {
        // 連鎖構築に寄与する度合いを評価
        const testBoard = this.copyBoard(this.enemyBoard);
        const dropResult = this.simulateEnemyDrop(testBoard, move.column, move.rotation, puyo);
        
        if (!dropResult.success) return 0;
        
        const potential = this.calculateChainPotential(dropResult.board);
        const currentPotential = this.calculateChainPotential(this.enemyBoard);
        
        return Math.max(0, (potential - currentPotential) / 100);
    }
    
    // パターン継続
    continuePattern(pattern, puyo) {
        const moves = this.generatePatternBasedMoves(pattern, puyo);
        return moves.length > 0 ? moves[0] : null;
    }
    
    // 効率的配置検索
    findEfficientPlacement(puyo) {
        const heights = Array.from({length: 6}, (_, i) => this.getColumnHeight(this.enemyBoard, i));
        const lowestCol = heights.indexOf(Math.min(...heights));
        
        return {
            column: lowestCol,
            rotation: 0,
            priority: 3,
            description: '効率配置'
        };
    }
    
    // サンドイッチ位置適性チェック
    isGoodSandwichPosition(col) {
        if (col <= 0 || col >= 5) return false;
        
        const leftHeight = this.getColumnHeight(this.enemyBoard, col - 1);
        const centerHeight = this.getColumnHeight(this.enemyBoard, col);
        const rightHeight = this.getColumnHeight(this.enemyBoard, col + 1);
        
        return leftHeight >= centerHeight + 1 && rightHeight >= centerHeight + 1;
    }
    
    // 連鎖発火位置を探す（改良版）
    findChainTrigger() {
        let bestTrigger = null;
        let bestChainCount = 0;
        
        // 現在の手持ちぷよで実際に発火可能な位置を探す
        const currentPuyo = this.enemyAI.currentPuyo;
        if (!currentPuyo) return null;
        
        // 各列・各回転で試す
        for (let col = 0; col < 6; col++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                if (this.canMoveEnemyPuyo(col, 0, rotation)) {
                    const testBoard = this.copyBoard(this.enemyBoard);
                    
                    // 実際のぷよ配置をシミュレート
                    const dropResult = this.simulateEnemyDrop(testBoard, col, rotation, currentPuyo);
                    if (dropResult.success) {
                        const chainResult = this.simulateChain(dropResult.board);
                        
                        if (chainResult.chainCount > bestChainCount) {
                            bestChainCount = chainResult.chainCount;
                            bestTrigger = {
                                column: col,
                                rotation: rotation,
                                priority: 100,
                                description: `${chainResult.chainCount}連鎖発火！ (${Math.round(chainResult.score)}pt)`
                            };
                        }
                    }
                }
            }
        }
        
        // 2連鎖以上なら発火対象とする
        if (bestChainCount >= 2) {
            console.log(`🎯 発火決定: ${bestTrigger.description}`);
            return bestTrigger;
        }
        
        return null;
    }
    
    // 最適な構築手を探す
    findBestConstructionMove(currentPuyo, nextPuyo) {
        const moves = this.generatePossibleMoves(currentPuyo);
        let bestMove = null;
        let bestScore = -1;
        
        moves.forEach(move => {
            const score = this.evaluateMove(move, currentPuyo);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });
        
        return bestMove;
    }
    
    // 可能な手を生成
    generatePossibleMoves(puyo) {
        const moves = [];
        
        // 各列、各回転での配置を評価
        for (let col = 0; col < 6; col++) {
            for (let rotation = 0; rotation < 4; rotation++) {
                if (this.canMoveEnemyPuyo(col, 0, rotation)) {
                    const description = this.getPlacementDescription(col, rotation);
                    moves.push({
                        column: col,
                        rotation: rotation,
                        priority: this.getMovePriority(col, rotation),
                        description: description
                    });
                }
            }
        }
        
        return moves;
    }
    
    // 手の評価（改良版）
    evaluateMove(move, puyo) {
        const testBoard = this.copyBoard(this.enemyBoard);
        
        // 実際に落下位置を計算して配置
        const dropResult = this.simulateEnemyDrop(testBoard, move.column, move.rotation, puyo);
        if (!dropResult.success) {
            return -1000; // 配置不可能
        }
        
        // 配置後の評価
        const evaluation = this.evaluateChainPotential(dropResult.board);
        
        // 色マッチング評価（重要）
        const colorBonus = this.evaluateColorMatching(dropResult.board, move, puyo);
        
        // GTR構築進捗ボーナス
        const gtrBonus = this.evaluateGTRProgress(dropResult.board, move);
        
        // 多様性ボーナス（1列目ばかりを避ける）
        const diversityBonus = this.evaluateDiversity(move);
        
        console.log(`📊 ${move.description}: 評価${Math.round(evaluation.potential + colorBonus + gtrBonus + diversityBonus)}`);
        
        return evaluation.potential + colorBonus + gtrBonus + diversityBonus + move.priority;
    }
    
    // 敵のぷよ落下シミュレート
    simulateEnemyDrop(board, column, rotation, puyo) {
        const testBoard = this.copyBoard(board);
        const positions = this.getEnemyPuyoPositions(column, 0, rotation);
        
        // 各ぷよの最終落下位置を計算
        const finalPositions = [];
        
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            let finalY = pos.y;
            
            // 下に落下させる
            while (finalY < 11 && testBoard[finalY + 1][pos.x] === 0) {
                finalY++;
            }
            
            if (finalY >= 12 || testBoard[finalY][pos.x] !== 0) {
                return { success: false }; // 配置不可能
            }
            
            finalPositions.push({ x: pos.x, y: finalY, color: puyo.colors[i] });
        }
        
        // 実際に配置
        finalPositions.forEach(pos => {
            testBoard[pos.y][pos.x] = pos.color;
        });
        
        return { success: true, board: testBoard, positions: finalPositions };
    }
    
    // 色マッチング評価
    evaluateColorMatching(board, move, puyo) {
        let bonus = 0;
        
        // 同色隣接ボーナス
        for (let y = 0; y < 12; y++) {
            for (let x = 0; x < 6; x++) {
                if (board[y][x] !== 0) {
                    const color = board[y][x];
                    let adjacentSameColor = 0;
                    
                    // 4方向チェック
                    const directions = [[0,1], [0,-1], [1,0], [-1,0]];
                    directions.forEach(([dx, dy]) => {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < 6 && ny >= 0 && ny < 12 && board[ny][nx] === color) {
                            adjacentSameColor++;
                        }
                    });
                    
                    if (adjacentSameColor >= 2) {
                        bonus += adjacentSameColor * 10; // 隣接同色ボーナス
                    }
                }
            }
        }
        
        return bonus;
    }
    
    // 多様性評価（1列目ばかりを避ける）
    evaluateDiversity(move) {
        const heights = [];
        for (let col = 0; col < 6; col++) {
            heights.push(this.getColumnHeight(this.enemyBoard, col));
        }
        
        // 高さの分散を計算
        const avg = heights.reduce((sum, h) => sum + h, 0) / heights.length;
        const variance = heights.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / heights.length;
        
        // 分散が低い（平坦）ほどボーナス、ただし同じ列ばかりはペナルティ
        let bonus = Math.max(0, 20 - variance * 2);
        
        // 特定列への偏重ペナルティ
        if (move.column === 0 && heights[0] > heights[1] + 2) {
            bonus -= 30; // 1列目ばかりはペナルティ
        }
        
        return bonus;
    }
    
    // GTR構築進捗評価
    evaluateGTRProgress(board, move) {
        let bonus = 0;
        
        // 1-2列目の土台構築ボーナス
        if ((move.column === 0 || move.column === 1) && move.rotation === 0) {
            bonus += 20;
        }
        
        // 3列目の折り返しボーナス
        if (move.column === 2 && move.rotation === 1) {
            const leftHeight = this.getColumnHeight(board, 0);
            const midHeight = this.getColumnHeight(board, 1);
            if (leftHeight >= 2 && midHeight >= 2) {
                bonus += 15;
            }
        }
        
        // 連鎖尾ボーナス
        if (move.column >= 3 && move.rotation === 0) {
            bonus += 10;
        }
        
        return bonus;
    }
    
    // 配置説明文生成
    getPlacementDescription(col, rotation) {
        const rotations = ['縦', '右横', '逆縦', '左横'];
        return `${col + 1}列目${rotations[rotation]}置き`;
    }
    
    // 手の基本優先度
    getMovePriority(col, rotation) {
        // GTRパターンに基づく優先度
        if (col === 0 || col === 1) return 8; // 土台
        if (col === 2) return 6; // 折り返し
        if (col >= 3) return 4; // 連鎖尾
        return 2;
    }
    
    // 緊急判断
    makeEmergencyDecision() {
        console.log('⚠️ 緊急配置実行');
        // 最も低い列に配置
        const heights = [];
        for (let col = 0; col < 6; col++) {
            heights.push(this.getColumnHeight(this.enemyBoard, col));
        }
        const lowestCol = heights.indexOf(Math.min(...heights));
        
        this.setAITarget({
            column: lowestCol,
            rotation: 0,
            priority: 1,
            description: '緊急配置'
        });
    }
    
    // GTR配置パターン判断
    getGTRPlacement(currentPuyo, nextPuyo) {
        // GTR基本テンプレート（軽量版）
        const gtrTemplates = this.getGTRTemplates();
        
        // 現在のボード状態を分析
        const boardAnalysis = this.analyzeBoardForGTR();
        
        // 最適なテンプレートを選択
        for (const template of gtrTemplates) {
            if (this.canPlaceGTRTemplate(template, currentPuyo)) {
                return {
                    column: template.column,
                    rotation: template.rotation,
                    priority: template.priority
                };
            }
        }
        
        return null;
    }
    
    // GTRテンプレート定義（改良版）
    getGTRTemplates() {
        const analysis = this.analyzeBoardForGTR();
        
        return [
            // Phase 1: GTR土台の2段階構築
            { 
                name: 'GTR土台1列目',
                column: 0,
                rotation: 0, // 縦
                priority: 10,
                condition: 'foundation_phase1',
                minHeight: 0,
                maxHeight: 2
            },
            { 
                name: 'GTR土台2列目',
                column: 1,
                rotation: 0, // 縦
                priority: 9,
                condition: 'foundation_phase2',
                minHeight: 0,
                maxHeight: 3
            },
            
            // Phase 2: GTR折り返し構築
            { 
                name: 'GTR折り返し準備',
                column: 2,
                rotation: 1, // 横
                priority: 8,
                condition: 'fold_preparation',
                minHeight: 1,
                maxHeight: 4
            },
            { 
                name: 'GTR折り返し完成',
                column: 1,
                rotation: 1, // 横（上に重ねる）
                priority: 7,
                condition: 'fold_completion',
                minHeight: 2,
                maxHeight: 4
            },
            
            // Phase 3: 連鎖尾の多様化
            { 
                name: '連鎖尾3列目',
                column: 2,
                rotation: 0,
                priority: 6,
                condition: 'chain_tail',
                minHeight: 2,
                maxHeight: 6
            },
            { 
                name: '連鎖尾4列目',
                column: 3,
                rotation: 0,
                priority: 5,
                condition: 'chain_tail',
                minHeight: 0,
                maxHeight: 5
            },
            { 
                name: '連鎖尾5列目',
                column: 4,
                rotation: 0,
                priority: 4,
                condition: 'chain_tail',
                minHeight: 0,
                maxHeight: 4
            },
            
            // Phase 4: フレキシブル配置
            { 
                name: '低い列優先',
                column: analysis.lowestColumn,
                rotation: 0,
                priority: 2,
                condition: 'flexible',
                minHeight: 0,
                maxHeight: 7
            }
        ];
    }
    
    // ボード分析（GTR用）
    analyzeBoardForGTR() {
        const heights = [];
        for (let x = 0; x < 6; x++) {
            let height = 0;
            for (let y = 11; y >= 0; y--) {
                if (this.enemyBoard[y][x] !== 0) {
                    height = 12 - y;
                    break;
                }
            }
            heights.push(height);
        }
        
        return {
            heights: heights,
            lowestColumn: heights.indexOf(Math.min(...heights)),
            totalPuyos: heights.reduce((sum, h) => sum + h, 0),
            isEarlyGame: heights.reduce((sum, h) => sum + h, 0) < 8
        };
    }
    
    // GTRテンプレート配置可能性チェック（改良版）
    canPlaceGTRTemplate(template, currentPuyo) {
        const analysis = this.analyzeBoardForGTR();
        const columnHeight = analysis.heights[template.column];
        
        // 高さ制限チェック
        if (columnHeight < template.minHeight || columnHeight > template.maxHeight) {
            return false;
        }
        
        switch (template.condition) {
            case 'foundation_phase1':
                // 1列目の土台：最初の2個まで
                return columnHeight <= 2 && analysis.totalPuyos <= 6;
                
            case 'foundation_phase2':
                // 2列目の土台：1列目がある程度積まれてから
                return columnHeight <= 3 && analysis.heights[0] >= 1;
                
            case 'fold_preparation':
                // 折り返し準備：土台ができてから
                return analysis.heights[0] >= 2 && analysis.heights[1] >= 2;
                
            case 'fold_completion':
                // 折り返し完成：3列目に横置きがあってから
                return analysis.heights[2] >= 2 && analysis.heights[1] >= 2;
                
            case 'chain_tail':
                // 連鎖尾：折り返しができてから
                return analysis.heights[1] >= 3 && analysis.heights[2] >= 2;
                
            case 'flexible':
                // フレキシブル：いつでも可能
                return columnHeight <= 7;
                
            default:
                return false;
        }
    }
    
    // 🎮 リアルなAI操作システム（キー操作シミュレート）
    moveTowardsTarget(placement) {
        if (!this.enemyAI.currentPuyo) return;
        
        const targetX = placement.column;
        const targetRotation = placement.rotation;
        
        // 🎯 目標位置に向けて実際のキー操作をシミュレート
        
        // スペースキー（回転）操作
        if (this.enemyAI.puyoRotation !== targetRotation) {
            this.performEnemyKeyAction('SPACE');
            return;
        }
        
        // A/Dキー（左右移動）操作
        if (this.enemyAI.puyoX < targetX) {
            this.performEnemyKeyAction('D'); // 右移動
            return;
        } else if (this.enemyAI.puyoX > targetX) {
            this.performEnemyKeyAction('A'); // 左移動
            return;
        }
        
        // 位置が合ったらSキー（高速落下）で決定
        if (this.enemyAI.puyoX === targetX && this.enemyAI.puyoRotation === targetRotation) {
            this.performEnemyKeyAction('S');
        }
    }
    
    // 🎮 AIキー操作実行システム（臨場感強化版）
    performEnemyKeyAction(key) {
        if (!this.enemyAI || !this.enemyAI.currentPuyo) return;
        
        const actionStartTime = Date.now();
        
        // 🎭 人間らしい操作ミスの可能性（5%）
        const humanError = Math.random() < 0.05;
        if (humanError && key !== 'S') {
            console.log('🤖 AI: ⚡ 操作ミス（人間らしさ）');
            return; // 操作をスキップ
        }
        
        switch (key) {
            case 'A': // 左移動
                if (this.canMoveEnemyPuyo(this.enemyAI.puyoX - 1, this.enemyAI.puyoY, this.enemyAI.puyoRotation)) {
                    this.enemyAI.puyoX--;
                    this.enemyBoardDirty = true;
                    console.log('🤖 AI: ⬅️ A (左移動)');
                } else {
                    console.log('🤖 AI: ❌ A (移動不可)');
                }
                break;
                
            case 'D': // 右移動
                if (this.canMoveEnemyPuyo(this.enemyAI.puyoX + 1, this.enemyAI.puyoY, this.enemyAI.puyoRotation)) {
                    this.enemyAI.puyoX++;
                    this.enemyBoardDirty = true;
                    console.log('🤖 AI: ➡️ D (右移動)');
                } else {
                    console.log('🤖 AI: ❌ D (移動不可)');
                }
                break;
                
            case 'S': // 高速落下
                // 🎯 1段ずつ下に移動（プレイヤーと同じ動作）
                if (this.canMoveEnemyPuyo(this.enemyAI.puyoX, this.enemyAI.puyoY + 1, this.enemyAI.puyoRotation)) {
                    this.enemyAI.puyoY++;
                    this.enemyBoardDirty = true;
                    console.log('🤖 AI: ⬇️ S (1段下移動)');
                } else {
                    // 着地処理
                    console.log('🤖 AI: ⬇️ S (着地)');
                    setTimeout(() => {
                        if (this.enemyAI && this.enemyAI.currentPuyo) {
                            this.placeEnemyPuyo();
                        }
                    }, 20); // プレイヤーと同じタイミング
                }
                break;
                
            case 'SPACE': // 回転
                const newRotation = (this.enemyAI.puyoRotation + 1) % 4;
                if (this.canMoveEnemyPuyo(this.enemyAI.puyoX, this.enemyAI.puyoY, newRotation)) {
                    this.enemyAI.puyoRotation = newRotation;
                    this.enemyBoardDirty = true;
                    const rotationNames = ['縦', '右横', '逆縦', '左横'];
                    console.log(`🤖 AI: 🔄 SPACE (回転→${rotationNames[newRotation]})`);
                } else {
                    console.log('🤖 AI: ❌ SPACE (回転不可)');
                }
                break;
        }
        
        // 🎭 人間らしい操作後の小さな間（ランダム）
        this.enemyAI.lastActionTime = actionStartTime;
        this.enemyAI.nextActionDelay = 10 + Math.random() * 10; // 10-20フレーム後（プレイヤーと同じペース）
    }
    
    // 基本的な判断（GTRが使えない場合）
    makeBasicDecision() {
        const analysis = this.analyzeBoardForGTR();
        
        // 同色を隣接する列に置く戦略
        const sameColorStrategy = this.findSameColorPlacement();
        if (sameColorStrategy) {
            this.moveTowardsTarget(sameColorStrategy);
            return;
        }
        
        // 低い列を優先
        const targetX = analysis.lowestColumn;
        this.moveTowardsTarget({ column: targetX, rotation: 0 });
    }
    
    // 同色配置戦略
    findSameColorPlacement() {
        if (!this.enemyAI.currentPuyo) return null;
        
        const colors = this.enemyAI.currentPuyo.colors;
        const analysis = this.analyzeBoardForGTR();
        
        // 同色のぷよを隣接させる列を探す
        for (let col = 0; col < 5; col++) {
            if (analysis.heights[col] < 10 && analysis.heights[col + 1] < 10) {
                // 隣接する2列に同色を置けるなら優先
                if (colors[0] === colors[1]) {
                    return { column: col, rotation: 1 }; // 横置き
                }
            }
        }
        
        // 既存の同色ぷよの上に積む
        for (let col = 0; col < 6; col++) {
            const topColor = this.getTopPuyoColor(col);
            if (topColor && (colors[0] === topColor || colors[1] === topColor)) {
                return { column: col, rotation: 0 }; // 縦置き
            }
        }
        
        return null;
    }
    
    // 列の一番上のぷよの色を取得
    getTopPuyoColor(column) {
        for (let row = 0; row < 12; row++) {
            if (this.enemyBoard[row][column] !== 0) {
                return this.enemyBoard[row][column];
            }
        }
        return null;
    }
    
    // 敵ぷよ移動可能チェック
    canMoveEnemyPuyo(x, y, rotation) {
        const positions = this.getEnemyPuyoPositions(x, y, rotation);
        
        for (const pos of positions) {
            // 境界チェック
            if (pos.x < 0 || pos.x >= 6 || pos.y >= 12) {
                return false;
            }
            
            // ボード上の既存ぷよとの衝突チェック
            if (pos.y >= 0 && this.enemyBoard[pos.y][pos.x] !== 0) {
                return false;
            }
        }
        
        return true;
    }
    
    // 敵ぷよ位置取得
    getEnemyPuyoPositions(x, y, rotation) {
        const positions = [
            { x: x, y: y }, // 主ぷよ
            { x: x, y: y - 1 } // 副ぷよ（デフォルトは上）
        ];
        
        // 回転に応じて副ぷよの位置を変更
        switch (rotation) {
            case 1: // 右
                positions[1] = { x: x + 1, y: y };
                break;
            case 2: // 下
                positions[1] = { x: x, y: y + 1 };
                break;
            case 3: // 左
                positions[1] = { x: x - 1, y: y };
                break;
            // case 0: 上（デフォルト）
        }
        
        return positions;
    }
    
    // 敵ぷよ配置
    placeEnemyPuyo() {
        if (!this.enemyAI.currentPuyo) return;
        
        const positions = this.getEnemyPuyoPositions(this.enemyAI.puyoX, this.enemyAI.puyoY, this.enemyAI.puyoRotation);
        
        // 🔧 修正: 各ぷよを個別に着地判定し、分離可能にする
        const landedPuyos = [];
        const floatingPuyos = [];
        
        positions.forEach((pos, index) => {
            if (pos.y >= 0 && pos.y < 12 && pos.x >= 0 && pos.x < 6) {
                // 着地可能かチェック
                if (pos.y === 11 || this.enemyBoard[pos.y + 1][pos.x] !== 0) {
                    // 着地
                    landedPuyos.push({ pos, color: this.enemyAI.currentPuyo.colors[index] });
                } else {
                    // 浮遊状態 - 重力で落下
                    floatingPuyos.push({ pos, color: this.enemyAI.currentPuyo.colors[index] });
                }
            }
        });
        
        // 着地したぷよをボードに配置
        landedPuyos.forEach(({ pos, color }) => {
            this.enemyBoard[pos.y][pos.x] = color;
        });
        
        // 浮遊ぷよを重力で落下
        floatingPuyos.forEach(({ pos, color }) => {
            // 最終着地位置を計算
            let finalY = pos.y;
            while (finalY < 11 && this.enemyBoard[finalY + 1][pos.x] === 0) {
                finalY++;
            }
            this.enemyBoard[finalY][pos.x] = color;
        });
        
        this.enemyBoardDirty = true;
        console.log(`🤖 敵ぷよ配置完了 - 着地:${landedPuyos.length}, 分離落下:${floatingPuyos.length}`);
        
        // 連鎖チェック
        this.checkEnemyChains();
        
        // 新しい敵ぷよをスポーン
        this.spawnNewEnemyPuyo();
    }
    
    // 新しい敵ぷよ生成
    spawnNewEnemyPuyo() {
        if (!this.enemyAI) return;
        
        // nextPuyoをcurrentPuyoに移動
        if (this.enemyAI.nextPuyo) {
            this.enemyAI.currentPuyo = this.enemyAI.nextPuyo;
        } else {
            // 最初の場合は新規生成
            this.enemyAI.currentPuyo = {
                colors: [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1]
            };
        }
        
        // 新しいnextPuyoを生成
        this.enemyAI.nextPuyo = {
            colors: [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1]
        };
        
        // 位置リセット
        this.enemyAI.puyoX = 2;
        this.enemyAI.puyoY = 0;
        this.enemyAI.puyoRotation = 0;
        this.enemyAI.puyoFallTimer = 0;
        this.enemyAI.thinkingTime = 0;
        this.enemyAI.actionDecided = false;
        
        // 次ぷよ表示更新
        this.updateEnemyNextDisplay();
        
        // ゲームオーバーチェック
        if (!this.canMoveEnemyPuyo(this.enemyAI.puyoX, this.enemyAI.puyoY, this.enemyAI.puyoRotation)) {
            console.log('🤖 敵フィールド満杯 - プレイヤー勝利');
            this.onVictory(0, 0);
        }
    }
    
    // 敵連鎖チェック
    checkEnemyChains() {
        const matches = this.findMatches(this.enemyBoard);
        
        if (matches.length > 0) {
            // 連鎖が発生した場合
            console.log(`🤖 敵が${matches.length}グループの連鎖！`);
            
            // マッチしたぷよを削除
            matches.forEach(group => {
                group.forEach(pos => {
                    this.enemyBoard[pos.y][pos.x] = 0;
                });
            });
            
            // 重力適用
            this.applyGravity(this.enemyBoard);
            
            // プレイヤーにダメージ
            let totalPuyoCount = 0;
            matches.forEach(group => totalPuyoCount += group.length);
            const chainDamage = Math.floor(totalPuyoCount / 4) * this.currentEnemy.attack;
            const actualDamage = this.calculateDamage(chainDamage, this.player.defense);
            this.dealDamageToPlayer(actualDamage);
            this.addLogEntry(`${this.currentEnemy.name}の連鎖！${actualDamage}ダメージ`, 'damage');
            
            this.enemyBoardDirty = true;
            
            // 継続的な連鎖チェック（プレイヤーと同速度）
            setTimeout(() => this.checkEnemyChains(), 100);
        }
    }
    
    // 敵の行動実行
    executeEnemyAction() {
        if (this.gameState !== 'battle') {
            this.stopEnemyAI();
            return;
        }
        
        // 敵の攻撃パターンを決定
        const actionType = this.determineEnemyAction();
        
        switch (actionType) {
            case 'attack':
                this.enemyAttack();
                break;
            case 'defend':
                this.enemyDefend();
                break;
            case 'special':
                this.enemySpecialAttack();
                break;
        }
    }
    
    // 敵の行動パターン決定
    determineEnemyAction() {
        const enemyHpPercent = this.currentEnemy.currentHP / this.currentEnemy.maxHP;
        const playerHpPercent = this.player.currentHP / this.player.maxHP;
        
        // 敵のHPが低い場合は特殊攻撃の確率が上がる
        if (enemyHpPercent < 0.3 && Math.random() < 0.4) {
            return 'special';
        }
        
        // プレイヤーのHPが高い場合は積極的に攻撃
        if (playerHpPercent > 0.7 && Math.random() < 0.8) {
            return 'attack';
        }
        
        // 基本的な行動パターン
        const rand = Math.random();
        if (rand < 0.7) return 'attack';
        if (rand < 0.9) return 'defend';
        return 'special';
    }
    
    // 敵の通常攻撃
    enemyAttack() {
        const damage = this.calculateDamage(this.currentEnemy.attack, this.player.defense);
        this.dealDamageToPlayer(damage);
        this.addLogEntry(`${this.currentEnemy.name}の攻撃！${damage}ダメージ`, 'damage');
        
        // 攻撃間隔をランダムに調整
        this.enemyAI.attackFrequency = 2500 + Math.random() * 3000;
    }
    
    // 敵の防御
    enemyDefend() {
        this.addLogEntry(`${this.currentEnemy.name}は身構えた`, 'info');
        // 次の攻撃のダメージを軽減する効果
        this.currentEnemy.defendBonus = 2;
        
        setTimeout(() => {
            this.currentEnemy.defendBonus = 0;
        }, 4000);
    }
    
    // 敵の特殊攻撃
    enemySpecialAttack() {
        const specialDamage = this.calculateDamage(this.currentEnemy.attack * 1.5, this.player.defense);
        this.dealDamageToPlayer(specialDamage);
        this.addLogEntry(`${this.currentEnemy.name}の特殊攻撃！${specialDamage}ダメージ`, 'damage');
        
        // 特殊攻撃後は攻撃間隔が長くなる
        this.enemyAI.attackFrequency = 4000 + Math.random() * 2000;
    }
    
    // ダメージ計算システム
    calculateDamage(attack, defense) {
        const baseDamage = Math.max(1, attack - defense);
        const randomFactor = 0.8 + Math.random() * 0.4; // 80%-120%の乱数
        return Math.round(baseDamage * randomFactor);
    }
    
    // プレイヤーにダメージを与える
    dealDamageToPlayer(damage) {
        this.player.currentHP = Math.max(0, this.player.currentHP - damage);
        this.updatePlayerDisplay();
        this.updateBattleScreenHP(); // 戦闘画面HP表示更新
        
        if (this.player.currentHP <= 0) {
            this.onDefeat();
        }
    }
    
    // 敵にダメージを与える
    dealDamageToEnemy(damage) {
        const actualDamage = Math.max(1, damage - (this.currentEnemy.defendBonus || 0));
        this.currentEnemy.currentHP = Math.max(0, this.currentEnemy.currentHP - actualDamage);
        this.updateEnemyDisplay();
        this.updateBattleScreenHP(); // 戦闘画面HP表示更新
        
        if (this.currentEnemy.currentHP <= 0) {
            this.onVictory(0, actualDamage);
        }
        
        return actualDamage;
    }
    
    // プレイヤーの連鎖シミュレーション（デモ用）
    simulatePlayerChain() {
        if (this.gameState !== 'battle') return;
        
        // ランダムな連鎖を生成
        const chainCount = 1 + Math.floor(Math.random() * 4); // 1-4連鎖
        const chainDamage = this.calculateChainDamage(chainCount);
        
        this.addLogEntry(`${chainCount}連鎖！${chainDamage}ダメージ`, 'heal');
        const actualDamage = this.dealDamageToEnemy(chainDamage);
        
        // 次の連鎖をランダムな間隔で実行
        if (this.gameState === 'battle') {
            setTimeout(() => {
                this.simulatePlayerChain();
            }, 1500 + Math.random() * 2500);
        }
    }
    
    // 連鎖ダメージ計算
    calculateChainDamage(chainCount) {
        const baseMultiplier = [0, 1, 1.5, 2.2, 3.0, 4.0]; // 連鎖倍率
        const multiplier = baseMultiplier[Math.min(chainCount, 5)] || 5.0;
        const baseDamage = this.player.attack * multiplier;
        return Math.round(baseDamage * (0.9 + Math.random() * 0.2));
    }
    
    // 敵AI停止
    stopEnemyAI() {
        if (this.enemyAI && this.enemyAI.actionInterval) {
            clearInterval(this.enemyAI.actionInterval);
            this.enemyAI = null;
            console.log('🛑 敵AI停止');
        }
    }
    
    // 戦闘終了処理
    onBattleEnd(playerWon, chainCount = 0, damageDealt = 0) {
        if (playerWon) {
            this.onVictory(chainCount, damageDealt);
        } else {
            this.onDefeat();
        }
    }
    
    // 勝利処理
    onVictory(chainCount, damageDealt) {
        this.gameState = 'victory';
        this.stopEnemyAI(); // AI停止
        this.gameRunning = false; // ゲームループ停止
        this.addLogEntry(`${this.currentEnemy.name}を倒した！`, 'heal');
        
        console.log('🎉 勝利！勝利画面を表示します');
        
        // 戦闘画面を非表示
        const battleScreen = document.getElementById('story-battle-screen');
        if (battleScreen) {
            battleScreen.classList.add('hidden');
        }
        
        // 勝利画面を表示
        this.showVictoryScreen();
    }
    
    // 敗北処理
    onDefeat() {
        this.gameState = 'defeat';
        this.stopEnemyAI(); // AI停止
        this.addLogEntry('敗北...', 'damage');
        
        // ゲームオーバー処理
        setTimeout(() => {
            alert('ゲームオーバー！タイトルに戻ります。');
            this.returnToTitle();
        }, 2000);
    }
    
    // 報酬獲得
    grantRewards(chainCount) {
        let rewards = [];
        
        // 基本ゴールド
        const goldReward = 10 + this.currentFloor * 5;
        this.player.gold += goldReward;
        rewards.push(`ゴールド +${goldReward}`);
        
        // 特殊ぷよ獲得（70%の確率）
        if (Math.random() < 0.7) {
            const specialPuyo = this.getRandomSpecialPuyo();
            this.addSpecialPuyo(specialPuyo);
            rewards.push(`${this.specialPuyoDatabase[specialPuyo].name}を獲得！`);
        }
        
        // 装備品獲得（20%の確率、エリートとボスは確定）
        const isEliteOrBoss = [5, 10].includes(this.currentFloor);
        if (isEliteOrBoss || Math.random() < 0.2) {
            const equipment = this.getRandomEquipment();
            this.player.equipment.push(equipment);
            this.applyEquipmentEffect(equipment);
            rewards.push(`${equipment.name}を獲得！`);
        }
        
        // 5連鎖以上で体力回復
        if (chainCount >= 5) {
            const healAmount = Math.min(3, this.player.maxHP - this.player.currentHP);
            this.player.currentHP += healAmount;
            rewards.push(`5連鎖達成！体力 +${healAmount}`);
        }
        
        // ログに報酬を表示
        rewards.forEach(reward => {
            this.addLogEntry(reward, 'heal');
        });
    }
    
    // ランダム特殊ぷよ取得
    getRandomSpecialPuyo() {
        const types = Object.keys(this.specialPuyoDatabase);
        return types[Math.floor(Math.random() * types.length)];
    }
    
    // ランダム装備品取得
    getRandomEquipment() {
        const allEquipment = [
            ...this.equipmentDatabase.weapons,
            ...this.equipmentDatabase.armor,
            ...this.equipmentDatabase.accessories
        ];
        return {...allEquipment[Math.floor(Math.random() * allEquipment.length)]};
    }
    
    // 特殊ぷよ追加
    addSpecialPuyo(type) {
        const baseRate = 5; // 基本出現率5%
        
        // 既存の特殊ぷよがある場合は出現率を低くする
        const currentSpecialCount = Object.keys(this.player.puyoRates.special).length;
        const adjustedRate = Math.max(2, baseRate - currentSpecialCount); // 最低2%
        
        // 既存の出現率を調整（通常ぷよから減らす）
        const reductionPerColor = adjustedRate / 5;
        
        // 通常ぷよの出現率を下げる（最低10%は保持）
        this.player.puyoRates.red = Math.max(10, this.player.puyoRates.red - reductionPerColor);
        this.player.puyoRates.blue = Math.max(10, this.player.puyoRates.blue - reductionPerColor);
        this.player.puyoRates.yellow = Math.max(10, this.player.puyoRates.yellow - reductionPerColor);
        this.player.puyoRates.green = Math.max(10, this.player.puyoRates.green - reductionPerColor);
        this.player.puyoRates.purple = Math.max(10, this.player.puyoRates.purple - reductionPerColor);
        
        // 特殊ぷよ追加
        if (this.player.puyoRates.special[type]) {
            this.player.puyoRates.special[type] += adjustedRate;
        } else {
            this.player.puyoRates.special[type] = adjustedRate;
        }
        
        // 出現率を正規化（合計100%になるように調整）
        this.normalizePuyoRates();
    }
    
    // ぷよ出現率正規化
    normalizePuyoRates() {
        const basicRates = [
            this.player.puyoRates.red,
            this.player.puyoRates.blue,
            this.player.puyoRates.yellow,
            this.player.puyoRates.green,
            this.player.puyoRates.purple
        ];
        
        const specialRates = Object.values(this.player.puyoRates.special);
        const totalRate = basicRates.reduce((sum, rate) => sum + rate, 0) + 
                         specialRates.reduce((sum, rate) => sum + rate, 0);
        
        if (totalRate !== 100) {
            const factor = 100 / totalRate;
            
            // 基本ぷよの率を調整
            this.player.puyoRates.red = Math.round(this.player.puyoRates.red * factor * 10) / 10;
            this.player.puyoRates.blue = Math.round(this.player.puyoRates.blue * factor * 10) / 10;
            this.player.puyoRates.yellow = Math.round(this.player.puyoRates.yellow * factor * 10) / 10;
            this.player.puyoRates.green = Math.round(this.player.puyoRates.green * factor * 10) / 10;
            this.player.puyoRates.purple = Math.round(this.player.puyoRates.purple * factor * 10) / 10;
            
            // 特殊ぷよの率を調整
            for (const type in this.player.puyoRates.special) {
                this.player.puyoRates.special[type] = Math.round(this.player.puyoRates.special[type] * factor * 10) / 10;
            }
        }
    }
    
    // 装備品効果適用
    applyEquipmentEffect(equipment) {
        switch (equipment.effect) {
            case 'attack':
                this.player.attack += equipment.value;
                this.addLogEntry(`攻撃力が${equipment.value}上昇！`, 'heal');
                break;
            case 'defense':
                this.player.defense += equipment.value;
                this.addLogEntry(`防御力が${equipment.value}上昇！`, 'heal');
                break;
            case 'special':
                this.applySpecialEquipmentEffect(equipment);
                break;
        }
    }
    
    // 特殊装備品効果
    applySpecialEquipmentEffect(equipment) {
        switch (equipment.value) {
            case 'heal_on_chain':
                this.player.specialEffects = this.player.specialEffects || {};
                this.player.specialEffects.healOnChain = true;
                this.addLogEntry('5連鎖以上で体力回復効果を獲得！', 'heal');
                break;
            case 'speed_boost':
                this.player.specialEffects = this.player.specialEffects || {};
                this.player.specialEffects.speedBoost = true;
                this.addLogEntry('連鎖速度上昇効果を獲得！', 'heal');
                break;
            case 'puyo_rate_boost':
                this.player.specialEffects = this.player.specialEffects || {};
                this.player.specialEffects.puyoRateBoost = true;
                this.addLogEntry('特殊ぷよ出現率上昇効果を獲得！', 'heal');
                break;
        }
    }
    
    // 装備品の統計情報を取得
    getEquipmentStats() {
        let totalAttack = 0;
        let totalDefense = 0;
        let specialEffects = [];
        
        Object.entries(this.player.equipment).forEach(([effect, value]) => {
            if (effect === 'attack') {
                totalAttack += value;
            } else if (effect === 'defense') {
                totalDefense += value;
            } else if (effect === 'special') {
                specialEffects.push(effect);
            }
        });
        
        return { totalAttack, totalDefense, specialEffects };
    }
    
    // 3選択肢システム表示
    showPathChoices() {
        const pathChoices = document.getElementById('path-choices');
        const battleBtn = document.getElementById('start-battle-btn');
        
        if (pathChoices && battleBtn) {
            pathChoices.classList.remove('hidden');
            battleBtn.classList.add('hidden');
        }
        
        // 選択肢を生成
        this.generatePathOptions();
    }
    
    // 道の選択肢生成
    generatePathOptions() {
        const leftText = document.getElementById('left-choice-text');
        const centerText = document.getElementById('center-choice-text');
        const rightText = document.getElementById('right-choice-text');
        
        const leftBtn = document.getElementById('path-left');
        const centerBtn = document.getElementById('path-center');
        const rightBtn = document.getElementById('path-right');
        
        // 選択肢のタイプを決定
        const options = this.getRandomPathOptions();
        
        // 左の道
        if (leftText && leftBtn) {
            leftText.textContent = options.left.name;
            leftBtn.className = `choice-btn ${options.left.type}`;
            leftBtn.querySelector('.choice-icon').textContent = options.left.icon;
        }
        
        // 中央の道
        if (centerText && centerBtn) {
            centerText.textContent = options.center.name;
            centerBtn.className = `choice-btn ${options.center.type}`;
            centerBtn.querySelector('.choice-icon').textContent = options.center.icon;
        }
        
        // 右の道
        if (rightText && rightBtn) {
            rightText.textContent = options.right.name;
            rightBtn.className = `choice-btn ${options.right.type}`;
            rightBtn.querySelector('.choice-icon').textContent = options.right.icon;
        }
        
        // 選択肢データを保存
        this.currentPathOptions = options;
    }
    
    // ランダムな道の選択肢を取得
    getRandomPathOptions() {
        const optionTypes = [
            { type: 'battle', name: '次の敵', icon: '⚔️', probability: 0.6 },
            { type: 'shop', name: 'ショップ', icon: '🛒', probability: 0.2 },
            { type: 'rest', name: '休憩所', icon: '🏥', probability: 0.2 }
        ];
        
        const options = { left: null, center: null, right: null };
        const positions = ['left', 'center', 'right'];
        
        // 必ず1つは戦闘を含む
        const battlePosition = positions[Math.floor(Math.random() * 3)];
        options[battlePosition] = { ...optionTypes[0] };
        
        // 残りの2つの選択肢
        const remainingPositions = positions.filter(pos => pos !== battlePosition);
        
        for (const position of remainingPositions) {
            const rand = Math.random();
            if (rand < 0.4) {
                // ショップ
                options[position] = { ...optionTypes[1] };
            } else if (rand < 0.7) {
                // 休憩所
                options[position] = { ...optionTypes[2] };
            } else {
                // 追加の戦闘
                options[position] = { ...optionTypes[0] };
            }
        }
        
        return options;
    }
    
    // 道を選択
    selectPath(position) {
        const selectedOption = this.currentPathOptions[position];
        
        if (!selectedOption) return;
        
        this.addLogEntry(`${selectedOption.name}を選択しました`, 'info');
        
        // 選択肢を隠す
        const pathChoices = document.getElementById('path-choices');
        if (pathChoices) {
            pathChoices.classList.add('hidden');
        }
        
        // 初回パス選択の場合はマップ画面に遷移
        if (this.showingInitialPathChoice) {
            this.showingInitialPathChoice = false;
            this.showMapScreen();
            return;
        }
        
        // 選択に応じて処理
        switch (selectedOption.type) {
            case 'battle':
                this.nextFloor();
                break;
            case 'shop':
                this.visitShop();
                this.nextFloor();
                break;
            case 'rest':
                this.rest();
                this.nextFloor();
                break;
        }
    }
    
    // 次のフロアへ
    nextFloor() {
        if (this.currentFloor >= this.maxFloor) {
            this.addLogEntry('すべてのフロアをクリア！おめでとうございます！', 'heal');
            this.showGameClearScreen();
            return;
        }
        
        this.currentFloor++;
        this.gameState = 'menu';
        
        // フロア進行時の特別イベント
        this.processFloorEvents();
        
        this.loadCurrentEnemy();
        this.updateDisplay();
        
        // ボタン状態をリセット
        const pathChoices = document.getElementById('path-choices');
        const battleBtn = document.getElementById('start-battle-btn');
        
        if (pathChoices) pathChoices.classList.add('hidden');
        if (battleBtn) {
            battleBtn.classList.remove('hidden');
            battleBtn.disabled = false;
        }
        
        this.addLogEntry(`フロア ${this.currentFloor} に到達！`, 'info');
        
        // フロアごとの説明
        this.addFloorDescription();
    }
    
    // フロアイベント処理
    processFloorEvents() {
        // エリートフロア（5フロア目）での特別報酬
        if (this.currentFloor === 5) {
            this.addLogEntry('🏆 エリートフロア！追加報酬が期待できる', 'heal');
            this.player.gold += 50;
            this.addLogEntry('ゴールド +50（エリートボーナス）', 'heal');
        }
        
        // ボスフロア（10フロア目）での警告
        if (this.currentFloor === 10) {
            this.addLogEntry('👹 最終ボス！最強の敵が待ち受けている', 'damage');
            this.addLogEntry('装備を確認して万全の準備を！', 'info');
        }
        
        // 中間フロアでの回復イベント
        if (this.currentFloor % 3 === 0 && this.currentFloor < 10) {
            const healAmount = Math.min(5, this.player.maxHP - this.player.currentHP);
            if (healAmount > 0) {
                this.player.currentHP += healAmount;
                this.addLogEntry(`泉を発見！体力を ${healAmount} 回復`, 'heal');
            }
        }
    }
    
    // フロア説明を追加
    addFloorDescription() {
        const floorInfo = {
            2: '農民兵が立ちはだかる',
            3: '熟練戦士との戦い',
            4: '重装歩兵の堅い守り',
            5: '🏆 エリートボス戦！',
            6: '上級戦士の鋭い攻撃',
            7: '精鋭戦士の連続攻撃',
            8: '騎士隊長の威圧感',
            9: '魔法戦士の神秘的な力',
            10: '👹 最終ボス戦！'
        };
        
        if (floorInfo[this.currentFloor]) {
            this.addLogEntry(floorInfo[this.currentFloor], 'info');
        }
    }
    
    // ゲームクリア画面
    showGameClearScreen() {
        this.addLogEntry('🎉 ローグライク冒険完了！', 'heal');
        this.addLogEntry(`最終スコア - フロア: ${this.currentFloor}`, 'info');
        this.addLogEntry(`装備品: ${this.player.equipment.length}個`, 'info');
        this.addLogEntry(`ゴールド: ${this.player.gold}`, 'info');
        
        const stats = this.getEquipmentStats();
        this.addLogEntry(`合計攻撃力: ${this.player.attack}`, 'info');
        this.addLogEntry(`合計防御力: ${this.player.defense}`, 'info');
        
        setTimeout(() => {
            alert(`ゲームクリア！おめでとうございます！\n\nスコア:\nフロア: ${this.currentFloor}\n装備品: ${this.player.equipment.length}個\nゴールド: ${this.player.gold}\n攻撃力: ${this.player.attack}\n防御力: ${this.player.defense}`);
            this.returnToTitle();
        }, 3000);
    }
    
    // ショップ訪問（イベントから）
    visitShop() {
        console.log('🏪 ショップに訪問しました');
        const shopItems = this.generateShopItems();
        this.showShopPopup(shopItems);
    }
    
    // ショップアイテムを生成
    generateShopItems() {
        const items = [
            {
                id: 'heal_potion',
                name: '体力ポーション',
                icon: '❤️',
                description: 'HPを20回復します',
                price: 15,
                effect: 'heal',
                value: 20
            },
            {
                id: 'attack_potion',
                name: '攻撃ポーション',
                icon: '⚔️',
                description: '攻撃力を1増加します',
                price: 25,
                effect: 'attack',
                value: 1
            },
            {
                id: 'defense_potion',
                name: '防御ポーション',
                icon: '🛡️',
                description: '防御力を1増加します',
                price: 20,
                effect: 'defense',
                value: 1
            },
            {
                id: 'max_hp_potion',
                name: '体力増強ポーション',
                icon: '💪',
                description: '最大HPを5増加します',
                price: 40,
                effect: 'max_hp',
                value: 5
            },
            {
                id: 'special_puyo_scroll',
                name: '特殊ぷよ巻物',
                icon: '🌟',
                description: 'ランダムな特殊ぷよ確率+10%',
                price: 35,
                effect: 'special_puyo',
                value: 10
            },
            {
                id: 'speed_potion',
                name: '速度ポーション',
                icon: '💨',
                description: 'ぷよ落下速度を一時的に上昇',
                price: 30,
                effect: 'speed',
                value: 1
            },
            {
                id: 'lucky_charm',
                name: '幸運のお守り',
                icon: '🍀',
                description: '戦闘での報酬確率が上昇',
                price: 45,
                effect: 'luck',
                value: 1
            },
            {
                id: 'mega_heal_potion',
                name: '特大回復ポーション',
                icon: '💊',
                description: 'HPを完全回復します',
                price: 50,
                effect: 'heal',
                value: 999
            }
        ];
        
        // ランダムに3-5個のアイテムを選択
        const itemCount = 3 + Math.floor(Math.random() * 3);
        const selectedItems = [];
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < itemCount && i < shuffled.length; i++) {
            selectedItems.push(shuffled[i]);
        }
        
        return selectedItems;
    }
    
    // ショップポップアップを表示
    showShopPopup(shopItems) {
        const popup = document.getElementById('shop-popup');
        const goldDisplay = document.getElementById('shop-player-gold');
        const itemsContainer = document.getElementById('shop-items');
        
        // 所持ゴールドを表示
        goldDisplay.textContent = this.player.gold || 0;
        
        // ショップアイテムを作成
        itemsContainer.innerHTML = '';
        shopItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            
            const canAfford = (this.player.gold || 0) >= item.price;
            if (!canAfford) {
                itemElement.classList.add('disabled');
            }
            
            itemElement.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-description">${item.description}</div>
                <div class="shop-item-price">${item.price} ゴールド</div>
                <button class="shop-item-buy" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? '購入' : '購入不可'}
                </button>
            `;
            
            // 購入ボタンのイベントリスナー
            const buyBtn = itemElement.querySelector('.shop-item-buy');
            if (canAfford) {
                buyBtn.onclick = () => {
                    this.buyShopItem(item);
                    popup.classList.add('hidden');
                    this.showMapScreen();
                };
            }
            
            itemsContainer.appendChild(itemElement);
        });
        
        // ポップアップを表示
        popup.classList.remove('hidden');
        
        // イベントリスナーを設定
        this.setupShopEventListeners();
    }
    
    // ショップイベントリスナーを設定
    setupShopEventListeners() {
        const popup = document.getElementById('shop-popup');
        const closeBtn = document.getElementById('shop-close');
        const leaveBtn = document.getElementById('shop-leave');
        
        // 閉じるボタン
        closeBtn.onclick = () => {
            popup.classList.add('hidden');
            this.showMapScreen();
        };
        
        // 立ち去るボタン
        leaveBtn.onclick = () => {
            popup.classList.add('hidden');
            this.showMapScreen();
        };
    }
    
    // ショップアイテム購入処理
    buyShopItem(item) {
        // ゴールドを消費
        this.player.gold -= item.price;
        
        switch (item.effect) {
            case 'heal':
                this.player.currentHP = Math.min(this.player.maxHP, this.player.currentHP + item.value);
                console.log(`❤️ HPを${item.value}回復しました`);
                break;
            case 'attack':
                this.player.attack += item.value;
                console.log(`⚔️ 攻撃力が${item.value}増加しました`);
                break;
            case 'defense':
                this.player.defense += item.value;
                console.log(`🛡️ 防御力が${item.value}増加しました`);
                break;
            case 'max_hp':
                this.player.maxHP += item.value;
                this.player.currentHP += item.value;
                console.log(`💪 最大HPが${item.value}増加しました`);
                break;
            case 'special_puyo':
                const specialTypes = Object.keys(this.specialPuyoDatabase);
                const randomType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
                this.player.puyoRates.special[randomType] = (this.player.puyoRates.special[randomType] || 0) + item.value;
                console.log(`🌟 ${this.specialPuyoDatabase[randomType].name} 確率が${item.value}%増加しました`);
                break;
            case 'speed':
                // 速度ポーションの効果（戦闘中のみ有効）
                console.log(`💨 速度ポーションを使用しました`);
                break;
            case 'luck':
                // 幸運のお守りの効果
                console.log(`🍀 幸運のお守りを装備しました`);
                break;
        }
        
        console.log(`🏪 ${item.name}を購入しました！`);
        
        // 表示を更新
        this.updatePlayerDisplay();
    }
    
    // 装備の効果を適用
    applyEquipmentEffects(equipment) {
        switch (equipment.effect) {
            case 'attack':
                this.player.attack += equipment.value;
                console.log(`⚔️ 攻撃力が${equipment.value}増加しました`);
                break;
            case 'defense':
                this.player.defense += equipment.value;
                console.log(`🛡️ 防御力が${equipment.value}増加しました`);
                break;
            case 'special':
                // 特殊効果は別途処理
                console.log(`🌟 特殊効果「${equipment.value}」を習得しました`);
                break;
        }
    }
    
    // 休憩（イベントから）
    rest() {
        const healAmount = Math.min(10, this.player.maxHP - this.player.currentHP);
        this.player.currentHP += healAmount;
        this.addLogEntry(`休憩して体力を ${healAmount} 回復した`, 'heal');
        this.updatePlayerDisplay();
    }
    
    // 勝利画面表示
    showVictoryScreen() {
        const victoryScreen = document.getElementById('story-victory-screen');
        if (victoryScreen) {
            victoryScreen.classList.remove('hidden');
            
            // ステータス情報を更新
            this.updateVictoryStatus();
            
            // 報酬候補を生成
            this.generateRewardCandidates();
            
            // 報酬ボタンのイベントリスナーを設定
            this.setupRewardButtons();
        }
    }
    
    // 報酬候補を生成
    generateRewardCandidates() {
        // 特殊ぷよの候補
        const specialTypes = ['fire', 'poison', 'crystal', 'lightning', 'ice', 'wind'];
        this.rewardCandidates = {
            specialPuyo: specialTypes[Math.floor(Math.random() * specialTypes.length)],
            potion: ['heal', 'power', 'speed', 'shield'][Math.floor(Math.random() * 4)],
            equipment: Object.keys(this.equipmentDatabase)[Math.floor(Math.random() * Object.keys(this.equipmentDatabase).length)]
        };
        
        // ボタンの表示を更新
        this.updateRewardButtons();
    }
    
    // 報酬ボタンの表示更新
    updateRewardButtons() {
        // 特殊ぷよボタン
        const specialBtn = document.getElementById('reward-special-puyo');
        if (specialBtn && this.rewardCandidates) {
            const specialData = this.specialPuyoDatabase[this.rewardCandidates.specialPuyo];
            const icon = specialBtn.querySelector('.reward-icon');
            const title = specialBtn.querySelector('.reward-title');
            const desc = specialBtn.querySelector('.reward-desc');
            
            if (icon) icon.textContent = specialData.icon;
            if (title) title.textContent = specialData.name;
            if (desc) desc.textContent = `${specialData.name}の確率+5%`;
        }
        
        // ポーションボタン
        const potionBtn = document.getElementById('reward-potion');
        if (potionBtn && this.rewardCandidates) {
            const potionData = this.potionDatabase[this.rewardCandidates.potion];
            const icon = potionBtn.querySelector('.reward-icon');
            const title = potionBtn.querySelector('.reward-title');
            const desc = potionBtn.querySelector('.reward-desc');
            
            if (icon) icon.textContent = potionData.icon;
            if (title) title.textContent = potionData.name;
            if (desc) desc.textContent = `${potionData.name} x1を獲得`;
        }
        
        // 装飾品ボタン
        const equipBtn = document.getElementById('reward-equipment');
        if (equipBtn && this.rewardCandidates) {
            const equipData = this.equipmentDatabase[this.rewardCandidates.equipment];
            const icon = equipBtn.querySelector('.reward-icon');
            const title = equipBtn.querySelector('.reward-title');
            const desc = equipBtn.querySelector('.reward-desc');
            
            if (icon) icon.textContent = equipData.icon;
            if (title) title.textContent = equipData.name;
            if (desc) desc.textContent = `${equipData.effect}+${equipData.value}`;
        }
    }
    
    // 勝利画面のステータス情報更新
    updateVictoryStatus() {
        // HP表示更新
        const hpText = document.getElementById('victory-hp-text');
        const hpFill = document.getElementById('victory-hp-fill');
        if (hpText && hpFill) {
            hpText.textContent = `${this.player.currentHP}/${this.player.maxHP}`;
            const hpPercent = (this.player.currentHP / this.player.maxHP) * 100;
            hpFill.style.width = `${hpPercent}%`;
        }
        
        // 階層表示更新
        const floorText = document.getElementById('victory-floor-text');
        if (floorText) {
            floorText.textContent = this.currentFloor;
        }
        
        // 特殊ぷよ表示更新
        this.updateVictorySpecialPuyo();
        
        // ポーション表示更新
        this.updateVictoryPotions();
        
        // 装飾品表示更新
        this.updateVictoryEquipment();
    }
    
    // 勝利画面の特殊ぷよ表示更新
    updateVictorySpecialPuyo() {
        const container = document.getElementById('victory-special-puyo');
        if (!container) return;
        
        container.innerHTML = '';
        
        const hasSpecialPuyo = Object.entries(this.player.puyoRates.special).some(([type, rate]) => rate > 0);
        
        if (!hasSpecialPuyo) {
            container.innerHTML = '<div class="item-entry"><span class="item-name">なし</span></div>';
            return;
        }
        
        Object.entries(this.player.puyoRates.special).forEach(([type, rate]) => {
            if (rate > 0) {
                const specialData = this.specialPuyoDatabase[type];
                if (specialData) {
                    const entry = document.createElement('div');
                    entry.className = 'item-entry';
                    entry.innerHTML = `
                        <span class="item-name">${specialData.icon} ${specialData.name}</span>
                        <span class="item-value">${rate}%</span>
                    `;
                    container.appendChild(entry);
                }
            }
        });
    }
    
    // 勝利画面のポーション表示更新
    updateVictoryPotions() {
        const container = document.getElementById('victory-potions');
        if (!container) return;
        
        container.innerHTML = '';
        
        const hasPotions = Object.values(this.player.potions).some(count => count > 0);
        
        if (!hasPotions) {
            container.innerHTML = '<div class="item-entry"><span class="item-name">なし</span></div>';
            return;
        }
        
        Object.entries(this.player.potions).forEach(([type, count]) => {
            if (count > 0) {
                const potionData = this.potionDatabase[type];
                if (potionData) {
                    const entry = document.createElement('div');
                    entry.className = 'item-entry';
                    entry.innerHTML = `
                        <span class="item-name">${potionData.icon} ${potionData.name}</span>
                        <span class="item-value">x${count}</span>
                    `;
                    container.appendChild(entry);
                }
            }
        });
    }
    
    // 勝利画面の装飾品表示更新
    updateVictoryEquipment() {
        const container = document.getElementById('victory-equipment');
        if (!container) return;
        
        container.innerHTML = '';
        
        const hasEquipment = Object.values(this.player.equipment).some(value => value > 0);
        
        if (!hasEquipment) {
            container.innerHTML = '<div class="item-entry"><span class="item-name">なし</span></div>';
            return;
        }
        
        Object.entries(this.player.equipment).forEach(([effect, value]) => {
            if (value > 0) {
                // 装飾品データベースから該当するアイテムを探す
                const equipmentItem = Object.values(this.equipmentDatabase).find(item => item.effect === effect);
                if (equipmentItem) {
                    const entry = document.createElement('div');
                    entry.className = 'item-entry';
                    entry.innerHTML = `
                        <span class="item-name">${equipmentItem.icon} ${effect}</span>
                        <span class="item-value">+${value}</span>
                    `;
                    container.appendChild(entry);
                }
            }
        });
    }
    
    // 報酬ボタンの設定
    setupRewardButtons() {
        const rewardButtons = [
            { id: 'reward-special-puyo', type: 'special-puyo' },
            { id: 'reward-potion', type: 'potion' },
            { id: 'reward-equipment', type: 'equipment' }
        ];
        
        rewardButtons.forEach(({ id, type }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.onclick = () => this.selectReward(type);
            }
        });
    }
    
    // 報酬選択処理
    selectReward(type) {
        let reward = null;
        
        switch (type) {
            case 'special-puyo':
                const selectedSpecial = this.rewardCandidates.specialPuyo;
                this.player.puyoRates.special[selectedSpecial] = (this.player.puyoRates.special[selectedSpecial] || 0) + 5;
                reward = `${this.specialPuyoDatabase[selectedSpecial].name} 確率+5%`;
                break;
                
            case 'potion':
                const selectedPotion = this.rewardCandidates.potion;
                const potionData = this.potionDatabase[selectedPotion];
                this.player.potions[selectedPotion] = (this.player.potions[selectedPotion] || 0) + 1;
                reward = `${potionData.name} x1`;
                break;
                
            case 'equipment':
                const selectedEquipment = this.rewardCandidates.equipment;
                const equipData = this.equipmentDatabase[selectedEquipment];
                this.player.equipment[equipData.effect] = (this.player.equipment[equipData.effect] || 0) + equipData.value;
                reward = `${equipData.name} (${equipData.effect}+${equipData.value})`;
                break;
        }
        
        console.log(`🎁 報酬獲得: ${reward}`);
        this.addLogEntry(`報酬獲得: ${reward}`, 'heal');
        
        // 勝利画面を非表示にしてマップ画面を表示
        const victoryScreen = document.getElementById('story-victory-screen');
        if (victoryScreen) {
            victoryScreen.classList.add('hidden');
        }
        
        // マップシステムに移行
        if (!this.mapData) {
            this.initializeMapSystem();
        }
        this.showMapScreen();
    }
    
    // エリア選択画面表示
    showAreaSelection() {
        const areaScreen = document.getElementById('story-area-selection');
        if (areaScreen) {
            areaScreen.classList.remove('hidden');
            this.generateAreaOptions();
        }
    }
    
    // エリア選択肢を生成
    generateAreaOptions() {
        const container = document.getElementById('area-options');
        if (!container) return;
        
        container.innerHTML = '';
        
        // 選択肢の確率設定
        const options = [];
        
        // 通常敵（60%の確率で1-2体）
        const normalCount = Math.random() < 0.6 ? (Math.random() < 0.5 ? 1 : 2) : 0;
        for (let i = 0; i < normalCount; i++) {
            const enemy = this.getRandomEnemy('normal');
            options.push({
                type: 'enemy',
                tier: 'normal',
                data: enemy,
                icon: enemy.portrait,
                title: enemy.name,
                description: `HP:${enemy.hp} 攻撃:${enemy.attack}`
            });
        }
        
        // 強敵（40%の確率で1体）
        if (Math.random() < 0.4) {
            const enemy = this.getRandomEnemy('strong');
            options.push({
                type: 'enemy',
                tier: 'strong',
                data: enemy,
                icon: enemy.portrait,
                title: `💪 ${enemy.name}`,
                description: `強敵 - HP:${enemy.hp} 攻撃:${enemy.attack}`
            });
        }
        
        // エリート敵（15%の確率で1体）
        if (Math.random() < 0.15) {
            const enemy = this.getRandomEnemy('elite');
            options.push({
                type: 'enemy',
                tier: 'elite',
                data: enemy,
                icon: enemy.portrait,
                title: `⭐ ${enemy.name}`,
                description: `エリート - HP:${enemy.hp} 攻撃:${enemy.attack}`
            });
        }
        
        // 宝箱（10%の確率）
        if (Math.random() < 0.1) {
            options.push({
                type: 'treasure',
                icon: '📦',
                title: '宝箱',
                description: '貴重なアイテムが眠っている'
            });
        }
        
        // ランダムイベント（20%の確率）
        if (Math.random() < 0.2) {
            const events = this.getRandomEvents();
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            options.push({
                type: 'event',
                data: randomEvent,
                icon: randomEvent.icon,
                title: randomEvent.title,
                description: randomEvent.description
            });
        }
        
        // 休憩（常に1つ）
        options.push({
            type: 'rest',
            icon: '😴',
            title: '休憩所',
            description: 'HPを30%回復する'
        });
        
        // 選択肢が少なすぎる場合は通常敵を追加
        while (options.length < 2) {
            const enemy = this.getRandomEnemy('normal');
            options.push({
                type: 'enemy',
                tier: 'normal',
                data: enemy,
                icon: enemy.portrait,
                title: enemy.name,
                description: `HP:${enemy.hp} 攻撃:${enemy.attack}`
            });
        }
        
        // 選択肢を表示
        options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = `area-btn ${option.tier || option.type}`;
            btn.innerHTML = `
                <div class="area-icon">${option.icon}</div>
                <div class="area-title">${option.title}</div>
                <div class="area-desc">${option.description}</div>
            `;
            btn.onclick = () => this.selectAreaOption(option);
            container.appendChild(btn);
        });
    }
    
    // ランダム敵を取得
    getRandomEnemy(tier) {
        const enemies = this.enemyDatabase[tier];
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        return { ...randomEnemy };
    }
    
    // ランダムイベント候補を取得
    getRandomEvents() {
        return [
            {
                id: 'merchant',
                icon: '🧙‍♂️',
                title: '謎の商人',
                description: '特別な取引を持ちかけてくる',
                type: 'choice'
            },
            {
                id: 'fountain',
                icon: '⛲',
                title: '神秘の泉',
                description: '魔法の力で何かが起こりそう',
                type: 'random'
            },
            {
                id: 'shrine',
                icon: '⛩️',
                title: '古い祠',
                description: '祈りを捧げると良いことが？',
                type: 'blessing'
            },
            {
                id: 'trap',
                icon: '🕳️',
                title: '怪しい道',
                description: 'リスクがあるが報酬も大きい',
                type: 'risk'
            },
            {
                id: 'library',
                icon: '📚',
                title: '古い図書館',
                description: '知識が力になるかもしれない',
                type: 'knowledge'
            }
        ];
    }
    
    // エリア選択処理
    selectAreaOption(option) {
        const areaScreen = document.getElementById('story-area-selection');
        if (areaScreen) {
            areaScreen.classList.add('hidden');
        }
        
        switch (option.type) {
            case 'enemy':
                // 敵との戦闘
                this.currentFloor++;
                this.currentEnemy = { ...option.data };
                this.currentEnemy.currentHP = this.currentEnemy.hp;
                this.currentEnemy.maxHP = this.currentEnemy.hp;
                this.returnToStoryScreen();
                this.addLogEntry(`階層 ${this.currentFloor}: ${this.currentEnemy.name}と遭遇`, 'info');
                break;
                
            case 'treasure':
                // 宝箱を開ける
                this.currentFloor++;
                this.openTreasureChest();
                this.returnToStoryScreen();
                break;
                
            case 'event':
                // ランダムイベント
                this.currentFloor++;
                this.executeRandomEvent(option.data);
                this.returnToStoryScreen();
                break;
                
            case 'rest':
                // 休憩してHP回復
                this.currentFloor++;
                const healAmount = Math.floor(this.player.maxHP * 0.3);
                this.player.currentHP = Math.min(this.player.maxHP, this.player.currentHP + healAmount);
                this.addLogEntry(`休憩所でHP ${healAmount} 回復した`, 'heal');
                this.returnToStoryScreen();
                break;
        }
        
        this.updateDisplay();
    }
    
    // 宝箱を開ける
    openTreasureChest() {
        const treasures = [
            { type: 'gold', amount: 50, message: 'ゴールド50枚を発見！' },
            { type: 'special-puyo', message: '特殊ぷよの確率が上昇！' },
            { type: 'potion', message: 'ポーションを発見！' },
            { type: 'equipment', message: '装飾品を発見！' },
            { type: 'hp-boost', amount: 10, message: '最大HPが10増加！' }
        ];
        
        const treasure = treasures[Math.floor(Math.random() * treasures.length)];
        
        switch (treasure.type) {
            case 'gold':
                this.player.gold = (this.player.gold || 0) + treasure.amount;
                break;
            case 'special-puyo':
                const specialTypes = Object.keys(this.specialPuyoDatabase);
                const randomSpecial = specialTypes[Math.floor(Math.random() * specialTypes.length)];
                this.player.puyoRates.special[randomSpecial] = (this.player.puyoRates.special[randomSpecial] || 0) + 10;
                break;
            case 'potion':
                const potionTypes = Object.keys(this.potionDatabase);
                const randomPotion = potionTypes[Math.floor(Math.random() * potionTypes.length)];
                this.player.potions[randomPotion] = (this.player.potions[randomPotion] || 0) + 1;
                break;
            case 'equipment':
                const equipmentTypes = Object.keys(this.equipmentDatabase);
                const randomEquipment = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
                const equipData = this.equipmentDatabase[randomEquipment];
                this.player.equipment[equipData.effect] = (this.player.equipment[equipData.effect] || 0) + equipData.value;
                break;
            case 'hp-boost':
                this.player.maxHP += treasure.amount;
                this.player.currentHP += treasure.amount;
                break;
        }
        
        this.addLogEntry(`📦 宝箱: ${treasure.message}`, 'heal');
    }
    
    // ランダムイベント実行
    executeRandomEvent(event) {
        switch (event.id) {
            case 'merchant':
                // 謎の商人：ランダムなアイテムを購入可能
                const items = ['特殊ぷよ強化', 'HP回復', '攻撃力UP'];
                const randomItem = items[Math.floor(Math.random() * items.length)];
                this.addLogEntry(`🧙‍♂️ 謎の商人: ${randomItem}を購入した`, 'info');
                break;
                
            case 'fountain':
                // 神秘の泉：ランダムな効果
                const effects = [
                    { message: '全てのぷよ確率が5%上昇！', type: 'puyo-boost' },
                    { message: 'HP完全回復！', type: 'full-heal' },
                    { message: '何も起こらなかった...', type: 'nothing' }
                ];
                const effect = effects[Math.floor(Math.random() * effects.length)];
                
                if (effect.type === 'puyo-boost') {
                    Object.keys(this.player.puyoRates.special).forEach(type => {
                        this.player.puyoRates.special[type] += 5;
                    });
                } else if (effect.type === 'full-heal') {
                    this.player.currentHP = this.player.maxHP;
                }
                
                this.addLogEntry(`⛲ 神秘の泉: ${effect.message}`, 'heal');
                break;
                
            case 'shrine':
                // 古い祠：祝福効果
                this.player.maxHP += 5;
                this.player.currentHP += 5;
                this.addLogEntry('⛩️ 古い祠: 祝福を受けてHP+5', 'heal');
                break;
                
            case 'trap':
                // 怪しい道：リスクと報酬
                if (Math.random() < 0.5) {
                    // 成功：大きな報酬
                    this.player.gold = (this.player.gold || 0) + 100;
                    this.addLogEntry('🕳️ 怪しい道: 隠された宝を発見！ゴールド+100', 'heal');
                } else {
                    // 失敗：ダメージ
                    const damage = Math.floor(this.player.maxHP * 0.2);
                    this.player.currentHP = Math.max(1, this.player.currentHP - damage);
                    this.addLogEntry(`🕳️ 怪しい道: 罠にかかってダメージ${damage}`, 'damage');
                }
                break;
                
            case 'library':
                // 古い図書館：知識による強化
                this.player.attack = (this.player.attack || 1) + 1;
                this.addLogEntry('📚 古い図書館: 古代の知識で攻撃力+1', 'heal');
                break;
        }
    }
    
    // 新しい敵を生成
    generateNewEnemy() {
        // 現在の階層に応じて敵のティアを決定
        let tier = 'normal';
        if (this.currentFloor >= 8) {
            tier = 'elite';
        } else if (this.currentFloor >= 5) {
            tier = 'strong';
        }
        
        const enemy = this.getRandomEnemy(tier);
        this.currentEnemy = { ...enemy };
        this.currentEnemy.currentHP = this.currentEnemy.hp;
        this.currentEnemy.maxHP = this.currentEnemy.hp;
        
        // 階層に応じて敵を強化
        if (this.currentFloor > 1) {
            const multiplier = 1 + (this.currentFloor - 1) * 0.2;
            this.currentEnemy.maxHP = Math.floor(this.currentEnemy.maxHP * multiplier);
            this.currentEnemy.currentHP = this.currentEnemy.maxHP;
            this.currentEnemy.attack = Math.floor(this.currentEnemy.attack * multiplier);
        }
        
        console.log(`🎯 新しい敵生成: ${this.currentEnemy.name} (HP:${this.currentEnemy.maxHP}, 攻撃:${this.currentEnemy.attack})`);
    }
    
    // ストーリー画面に戻る
    returnToStoryScreen() {
        // 戦闘状態をリセット
        this.gameState = 'menu';
        
        // ストーリー画面を表示
        const storyScreen = document.getElementById('story-screen');
        if (storyScreen) {
            storyScreen.classList.remove('hidden');
        }
        
        // 戦闘開始ボタンを有効化
        const battleBtn = document.getElementById('start-battle-btn');
        if (battleBtn) {
            battleBtn.disabled = false;
        }
        
        this.updateEnemyDisplay();
    }
    
    // タイトルに戻る
    returnToTitle() {
        if (window.gameModeManager) {
            window.gameModeManager.switchToTitleMode();
        }
    }
    
    // マップシステム初期化
    initializeMapSystem() {
        this.generateMapData();
        this.setupMapEventListeners();
        
        // 初期位置を最初のノードに設定
        if (this.mapData && this.mapData.floors[0] && this.mapData.floors[0][0]) {
            this.currentMapPosition = { 
                floor: 0, 
                nodeId: this.mapData.floors[0][0].id 
            };
            // スタートノードを完了状態にして、次のフロアのノードを利用可能にする
            const startNode = this.mapData.floors[0][0];
            startNode.completed = true;
            startNode.available = false;
            
            // 次のフロアのノードを利用可能にする
            if (this.mapData.floors[1]) {
                this.mapData.floors[1].forEach(node => {
                    node.available = true;
                });
            }
        }
        
        this.renderMap();
    }
    
    // マップデータ生成（15フロア）
    generateMapData() {
        this.mapData = {
            floors: [],
            connections: []
        };
        
        // 各フロアのノード生成
        for (let floor = 0; floor < 15; floor++) {
            let nodesInFloor;
            
            if (floor === 0) {
                nodesInFloor = 1; // スタート
            } else if (floor === 1) {
                nodesInFloor = 3; // 最初の選択肢は必ず3つ
            } else if (floor === 14) {
                nodesInFloor = 1; // ボス
            } else {
                nodesInFloor = Math.random() < 0.4 ? 2 : 3; // 中間は2-3個
            }
            
            const floorNodes = [];
            
            for (let i = 0; i < nodesInFloor; i++) {
                const nodeId = `floor_${floor}_node_${i}`;
                const nodeType = this.determineNodeType(floor);
                
                // ノードのX座標を均等に配置
                const totalWidth = 600;
                const spacing = totalWidth / (nodesInFloor + 1);
                const x = 100 + spacing * (i + 1);
                
                floorNodes.push({
                    id: nodeId,
                    floor: floor,
                    type: nodeType,
                    x: x,
                    y: 100 + floor * 75,
                    completed: false,
                    available: floor === 0
                });
            }
            
            this.mapData.floors.push(floorNodes);
        }
        
        // 接続生成（行き止まりなし）
        this.generateMapConnections();
    }
    
    // ノードタイプ決定
    determineNodeType(floor) {
        if (floor === 0) return 'start';
        if (floor === 14) return 'boss';
        
        // 確率でノードタイプを決定
        const rand = Math.random();
        if (rand < 0.6) return 'enemy';      // 60% 通常敵
        if (rand < 0.8) return 'elite';     // 20% エリート敵
        if (rand < 0.9) return 'treasure';  // 10% 宝箱
        if (rand < 0.95) return 'event';    // 5% ランダムイベント
        return 'shop';                      // 5% ショップ
    }
    
    // マップ接続生成（行き止まりなし）
    generateMapConnections() {
        for (let floor = 0; floor < this.mapData.floors.length - 1; floor++) {
            const currentFloor = this.mapData.floors[floor];
            const nextFloor = this.mapData.floors[floor + 1];
            
            // まず各次フロアノードが少なくとも1つの接続を持つことを保証
            nextFloor.forEach((nextNode, index) => {
                const sourceNode = currentFloor[Math.min(index, currentFloor.length - 1)];
                this.mapData.connections.push({
                    from: sourceNode.id,
                    to: nextNode.id,
                    fromFloor: floor,
                    toFloor: floor + 1
                });
            });
            
            // 追加の接続を生成（より多様なパスを作成）
            currentFloor.forEach(currentNode => {
                const additionalConnections = Math.random() < 0.6 ? 1 : 0;
                
                for (let i = 0; i < additionalConnections; i++) {
                    const targetNode = nextFloor[Math.floor(Math.random() * nextFloor.length)];
                    
                    // 重複接続をチェック
                    const existingConnection = this.mapData.connections.find(conn => 
                        conn.from === currentNode.id && conn.to === targetNode.id
                    );
                    
                    if (!existingConnection) {
                        this.mapData.connections.push({
                            from: currentNode.id,
                            to: targetNode.id,
                            fromFloor: floor,
                            toFloor: floor + 1
                        });
                    }
                }
            });
        }
    }
    
    // マップレンダリング
    renderMap() {
        const mapSvg = document.getElementById('adventure-map');
        if (!mapSvg) return;
        
        mapSvg.innerHTML = '';
        
        // 接続線を先に描画
        this.renderMapConnections(mapSvg);
        
        // ノードを描画
        this.renderMapNodes(mapSvg);
        
        // プレイヤー位置を表示
        this.renderPlayerPosition(mapSvg);
    }
    
    // マップ接続線描画
    renderMapConnections(svg) {
        this.mapData.connections.forEach(connection => {
            const fromNode = this.findNodeById(connection.from);
            const toNode = this.findNodeById(connection.to);
            
            if (!fromNode || !toNode) return;
            
            const isPath = this.isConnectionAvailable(connection);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);
            line.setAttribute('stroke', isPath ? '#ffd700' : '#666');
            line.setAttribute('stroke-width', isPath ? '3' : '2');
            line.setAttribute('stroke-dasharray', isPath ? 'none' : '5,5');
            line.style.opacity = isPath ? '1' : '0.3';
            
            svg.appendChild(line);
        });
    }
    
    // マップノード描画
    renderMapNodes(svg) {
        this.mapData.floors.forEach(floor => {
            floor.forEach(node => {
                const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                nodeGroup.setAttribute('class', 'map-node');
                nodeGroup.setAttribute('data-node-id', node.id);
                
                // ノード背景円
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', node.x);
                circle.setAttribute('cy', node.y);
                circle.setAttribute('r', '25');
                circle.setAttribute('fill', this.getNodeColor(node));
                circle.setAttribute('stroke', node.available ? '#ffd700' : '#666');
                circle.setAttribute('stroke-width', node.available ? '3' : '2');
                circle.style.opacity = node.available || node.completed ? '1' : '0.5';
                
                // ノードアイコン
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', node.x);
                text.setAttribute('y', node.y + 6);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '20');
                text.setAttribute('fill', 'white');
                text.textContent = this.getNodeIcon(node.type);
                
                nodeGroup.appendChild(circle);
                nodeGroup.appendChild(text);
                
                // クリックイベント
                if (node.available && !node.completed) {
                    nodeGroup.style.cursor = 'pointer';
                    nodeGroup.addEventListener('click', () => {
                        this.onNodeClick(node);
                    });
                }
                
                svg.appendChild(nodeGroup);
            });
        });
    }
    
    // プレイヤー位置表示
    renderPlayerPosition(svg) {
        const currentNode = this.findNodeById(this.currentMapPosition.nodeId);
        if (!currentNode) return;
        
        const playerMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        playerMarker.setAttribute('cx', currentNode.x);
        playerMarker.setAttribute('cy', currentNode.y - 35);
        playerMarker.setAttribute('r', '8');
        playerMarker.setAttribute('fill', '#ff4444');
        playerMarker.setAttribute('stroke', '#ffff00');
        playerMarker.setAttribute('stroke-width', '2');
        playerMarker.setAttribute('class', 'player-marker');
        
        svg.appendChild(playerMarker);
    }
    
    // ノード色取得
    getNodeColor(node) {
        if (node.completed) return '#2a5d2a';
        
        switch (node.type) {
            case 'start': return '#4a90e2';
            case 'enemy': return '#e24a4a';
            case 'elite': return '#e2a04a';
            case 'boss': return '#8b0000';
            case 'treasure': return '#ffd700';
            case 'event': return '#9b59b6';
            case 'shop': return '#2ecc71';
            default: return '#666';
        }
    }
    
    // ノードアイコン取得
    getNodeIcon(type) {
        switch (type) {
            case 'start': return '🏠';
            case 'enemy': return '⚔️';
            case 'elite': return '👹';
            case 'boss': return '💀';
            case 'treasure': return '📦';
            case 'event': return '❓';
            case 'shop': return '🏪';
            default: return '●';
        }
    }
    
    // ノードクリック処理
    onNodeClick(node) {
        console.log(`マップノードクリック: ${node.type} (Floor ${node.floor})`);
        
        // ノードを完了状態にする
        node.completed = true;
        node.available = false;
        
        // 同じフロアの他のノードを利用不可にする
        this.mapData.floors[node.floor].forEach(floorNode => {
            if (floorNode.id !== node.id && !floorNode.completed) {
                floorNode.available = false;
            }
        });
        
        // 次の利用可能ノードを更新
        this.updateAvailableNodes(node);
        
        // プレイヤー位置更新
        this.currentMapPosition = { floor: node.floor, nodeId: node.id };
        
        // ノードタイプに応じた処理
        this.handleNodeAction(node);
        
        // マップを再描画
        this.renderMap();
    }
    
    // 利用可能ノード更新
    updateAvailableNodes(completedNode) {
        // 完了ノードから接続されている次のノードを利用可能にする
        this.mapData.connections.forEach(connection => {
            if (connection.from === completedNode.id) {
                const targetNode = this.findNodeById(connection.to);
                if (targetNode) {
                    targetNode.available = true;
                }
            }
        });
    }
    
    // ノードアクション処理
    handleNodeAction(node) {
        switch (node.type) {
            case 'start':
                // スタートノードは単純に次のノードを開放するだけ
                console.log('🏠 冒険開始！');
                break;
            case 'enemy':
                this.startEnemyBattle('normal');
                break;
            case 'elite':
                this.startEnemyBattle('elite');
                break;
            case 'boss':
                this.startEnemyBattle('boss');
                break;
            case 'treasure':
                this.openTreasure();
                break;
            case 'event':
                this.triggerRandomEvent();
                break;
            case 'shop':
                this.visitShop();
                break;
        }
    }
    
    // 敵戦闘開始
    startEnemyBattle(tier) {
        // マップ画面を隠す
        const mapScreen = document.getElementById('story-map-screen');
        if (mapScreen) mapScreen.classList.add('hidden');
        
        // 敵を生成
        this.generateEnemyByTier(tier);
        
        // 戦闘画面を表示
        const storyScreen = document.getElementById('story-screen');
        if (storyScreen) {
            storyScreen.classList.remove('hidden');
        }
        
        this.updateEnemyDisplay();
        
        // 戦闘を自動的に開始
        this.gameState = 'menu'; // startBattle()が実行されるようにmenu状態に設定
        setTimeout(() => {
            this.startBattle();
        }, 500);
    }
    
    // ティア別敵生成
    generateEnemyByTier(tier) {
        const enemies = this.enemyDatabase[tier] || this.enemyDatabase.normal;
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
        
        this.currentEnemy = {
            ...randomEnemy,
            maxHP: randomEnemy.hp,
            currentHP: randomEnemy.hp
        };
        
        // 階層ボーナス適用
        if (this.currentFloor > 1) {
            const multiplier = 1 + (this.currentFloor - 1) * 0.15;
            this.currentEnemy.maxHP = Math.floor(this.currentEnemy.maxHP * multiplier);
            this.currentEnemy.currentHP = this.currentEnemy.maxHP;
            this.currentEnemy.attack = Math.floor(this.currentEnemy.attack * multiplier);
        }
        
        console.log(`🗺️ マップから敵生成: ${this.currentEnemy.name} (${tier})`);
    }
    
    // 宝箱開封
    openTreasure() {
        console.log('📦 宝箱を開けています...');
        const rewards = this.generateTreasureRewards();
        this.showTreasurePopup(rewards);
    }
    
    // 宝箱の報酬を生成
    generateTreasureRewards() {
        const rewards = [];
        
        // 必ずゴールドを獲得
        const goldAmount = 20 + Math.floor(Math.random() * 31); // 20-50ゴールド
        rewards.push({
            type: 'gold',
            icon: '💰',
            name: 'ゴールド',
            amount: goldAmount
        });
        
        // 50%の確率でポーション
        if (Math.random() < 0.5) {
            const potionTypes = Object.keys(this.potionDatabase);
            const randomPotion = potionTypes[Math.floor(Math.random() * potionTypes.length)];
            const potionData = this.potionDatabase[randomPotion];
            
            rewards.push({
                type: 'potion',
                icon: potionData.icon,
                name: potionData.name,
                amount: 1,
                potionType: randomPotion
            });
        }
        
        // 30%の確率で特殊ぷよ
        if (Math.random() < 0.3) {
            const specialTypes = Object.keys(this.specialPuyoDatabase);
            const randomSpecial = specialTypes[Math.floor(Math.random() * specialTypes.length)];
            const specialData = this.specialPuyoDatabase[randomSpecial];
            
            rewards.push({
                type: 'special_puyo',
                icon: specialData.icon,
                name: specialData.name,
                amount: 5,
                specialType: randomSpecial
            });
        }
        
        // 20%の確率で装備品
        if (Math.random() < 0.2) {
            const equipmentTypes = Object.keys(this.equipmentDatabase);
            const randomEquipType = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
            const equipmentArray = this.equipmentDatabase[randomEquipType];
            const randomEquip = equipmentArray[Math.floor(Math.random() * equipmentArray.length)];
            
            rewards.push({
                type: 'equipment',
                icon: randomEquip.icon,
                name: randomEquip.name,
                amount: 1,
                equipment: randomEquip
            });
        }
        
        return rewards;
    }
    
    // 宝箱ポップアップを表示
    showTreasurePopup(rewards) {
        const popup = document.getElementById('treasure-popup');
        const rewardsContainer = document.getElementById('treasure-rewards');
        
        // 報酬リストを作成
        rewardsContainer.innerHTML = '';
        rewards.forEach(reward => {
            const rewardItem = document.createElement('div');
            rewardItem.className = 'treasure-reward-item';
            rewardItem.innerHTML = `
                <div class="reward-item-info">
                    <div class="reward-item-icon">${reward.icon}</div>
                    <div class="reward-item-name">${reward.name}</div>
                </div>
                <div class="reward-item-amount">+${reward.amount}</div>
            `;
            rewardsContainer.appendChild(rewardItem);
        });
        
        // ポップアップを表示
        popup.classList.remove('hidden');
        
        // イベントリスナーを設定
        this.setupTreasureEventListeners(rewards);
    }
    
    // 宝箱イベントリスナーを設定
    setupTreasureEventListeners(rewards) {
        const popup = document.getElementById('treasure-popup');
        const closeBtn = document.getElementById('treasure-close');
        const acceptBtn = document.getElementById('treasure-accept');
        
        // 閉じるボタン
        closeBtn.onclick = () => {
            popup.classList.add('hidden');
            this.showMapScreen();
        };
        
        // 受け取るボタン
        acceptBtn.onclick = () => {
            this.processTreasureRewards(rewards);
            popup.classList.add('hidden');
            this.showMapScreen();
        };
    }
    
    // 宝箱の報酬を処理
    processTreasureRewards(rewards) {
        rewards.forEach(reward => {
            switch (reward.type) {
                case 'gold':
                    this.player.gold = (this.player.gold || 0) + reward.amount;
                    console.log(`💰 ゴールド +${reward.amount}`);
                    break;
                case 'potion':
                    this.player.potions[reward.potionType] = (this.player.potions[reward.potionType] || 0) + reward.amount;
                    console.log(`🧪 ${reward.name} +${reward.amount}`);
                    break;
                case 'special_puyo':
                    this.player.puyoRates.special[reward.specialType] = (this.player.puyoRates.special[reward.specialType] || 0) + reward.amount;
                    console.log(`🌟 ${reward.name} 確率 +${reward.amount}%`);
                    break;
                case 'equipment':
                    if (!this.player.equipment[reward.equipment.id]) {
                        this.player.equipment[reward.equipment.id] = reward.equipment;
                        this.applyEquipmentEffects(reward.equipment);
                        console.log(`⚔️ ${reward.name} を装備しました`);
                    }
                    break;
            }
        });
        
        // 表示を更新
        this.updatePlayerDisplay();
    }
    
    // ランダムイベント発生
    triggerRandomEvent() {
        console.log('🌟 ランダムイベントが発生しました');
        
        const events = [
            {
                title: '神秘の泉',
                icon: '⛲',
                description: '澄んだ水が湧き出る神秘的な泉を発見しました。',
                effects: [
                    { type: 'heal', icon: '❤️', text: 'HPが全回復', value: 'full' }
                ]
            },
            {
                title: '古代の遺跡',
                icon: '🏛️',
                description: '古代文明の遺跡を発見しました。内部で不思議な力を感じます。',
                effects: [
                    { type: 'special_puyo', icon: '🌟', text: '特殊ぷよ確率+10%', value: 10 }
                ]
            },
            {
                title: '商人との出会い',
                icon: '🤝',
                description: '旅の商人に出会いました。彼は感謝の印にお金をくれました。',
                effects: [
                    { type: 'gold', icon: '💰', text: 'ゴールド+50', value: 50 }
                ]
            },
            {
                title: '魔法の木',
                icon: '🌳',
                description: '魔法の力を帯びた巨大な木を発見しました。',
                effects: [
                    { type: 'max_hp', icon: '💪', text: '最大HP+5', value: 5 },
                    { type: 'heal', icon: '❤️', text: 'HPが+10', value: 10 }
                ]
            },
            {
                title: '隠された宝庫',
                icon: '🗝️',
                description: '秘密の宝庫を発見しました。中には貴重な品物が！',
                effects: [
                    { type: 'potion', icon: '🧪', text: 'ポーション+2個', value: 2 },
                    { type: 'gold', icon: '💰', text: 'ゴールド+30', value: 30 }
                ]
            },
            {
                title: '賢者の祝福',
                icon: '🧙‍♂️',
                description: '森の賢者があなたを祝福してくれました。',
                effects: [
                    { type: 'attack', icon: '⚔️', text: '攻撃力+1', value: 1 },
                    { type: 'defense', icon: '🛡️', text: '防御力+1', value: 1 }
                ]
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        this.showEventPopup(event);
    }
    
    // イベントポップアップを表示
    showEventPopup(event) {
        const popup = document.getElementById('event-popup');
        const titleElement = document.getElementById('event-title');
        const iconElement = document.getElementById('event-icon');
        const descriptionElement = document.getElementById('event-description');
        const effectsContainer = document.getElementById('event-effects');
        
        // イベント情報を設定
        titleElement.textContent = `${event.icon} ${event.title}`;
        iconElement.textContent = event.icon;
        descriptionElement.textContent = event.description;
        
        // 効果リストを作成
        effectsContainer.innerHTML = '';
        event.effects.forEach(effect => {
            const effectItem = document.createElement('div');
            effectItem.className = 'event-effect-item';
            effectItem.innerHTML = `
                <div class="effect-icon">${effect.icon}</div>
                <div class="effect-text">${effect.text}</div>
            `;
            effectsContainer.appendChild(effectItem);
        });
        
        // ポップアップを表示
        popup.classList.remove('hidden');
        
        // イベントリスナーを設定
        this.setupEventEventListeners(event);
    }
    
    // イベントのイベントリスナーを設定
    setupEventEventListeners(event) {
        const popup = document.getElementById('event-popup');
        const closeBtn = document.getElementById('event-close');
        const acceptBtn = document.getElementById('event-accept');
        
        // 閉じるボタン
        closeBtn.onclick = () => {
            popup.classList.add('hidden');
            this.showMapScreen();
        };
        
        // OKボタン
        acceptBtn.onclick = () => {
            this.processEventEffects(event.effects);
            popup.classList.add('hidden');
            this.showMapScreen();
        };
    }
    
    // イベントの効果を処理
    processEventEffects(effects) {
        effects.forEach(effect => {
            switch (effect.type) {
                case 'heal':
                    if (effect.value === 'full') {
                        this.player.currentHP = this.player.maxHP;
                        console.log('❤️ HPが全回復しました');
                    } else {
                        this.player.currentHP = Math.min(this.player.maxHP, this.player.currentHP + effect.value);
                        console.log(`❤️ HP +${effect.value}`);
                    }
                    break;
                case 'max_hp':
                    this.player.maxHP += effect.value;
                    this.player.currentHP += effect.value;
                    console.log(`💪 最大HP +${effect.value}`);
                    break;
                case 'gold':
                    this.player.gold = (this.player.gold || 0) + effect.value;
                    console.log(`💰 ゴールド +${effect.value}`);
                    break;
                case 'attack':
                    this.player.attack += effect.value;
                    console.log(`⚔️ 攻撃力 +${effect.value}`);
                    break;
                case 'defense':
                    this.player.defense += effect.value;
                    console.log(`🛡️ 防御力 +${effect.value}`);
                    break;
                case 'special_puyo':
                    const specialTypes = Object.keys(this.specialPuyoDatabase);
                    const randomType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
                    this.player.puyoRates.special[randomType] = (this.player.puyoRates.special[randomType] || 0) + effect.value;
                    console.log(`🌟 ${this.specialPuyoDatabase[randomType].name} 確率 +${effect.value}%`);
                    break;
                case 'potion':
                    const potionTypes = Object.keys(this.potionDatabase);
                    const randomPotion = potionTypes[Math.floor(Math.random() * potionTypes.length)];
                    this.player.potions[randomPotion] = (this.player.potions[randomPotion] || 0) + effect.value;
                    console.log(`🧪 ${this.potionDatabase[randomPotion].name} +${effect.value}`);
                    break;
            }
        });
        
        // 表示を更新
        this.updatePlayerDisplay();
    }
    
    // マップ画面表示
    showMapScreen() {
        // 他の画面を隠す
        const storyScreen = document.getElementById('story-screen');
        const victoryScreen = document.getElementById('story-victory-screen');
        const areaScreen = document.getElementById('story-area-selection');
        
        if (storyScreen) storyScreen.classList.add('hidden');
        if (victoryScreen) victoryScreen.classList.add('hidden');
        if (areaScreen) areaScreen.classList.add('hidden');
        
        // マップ画面を表示
        const mapScreen = document.getElementById('story-map-screen');
        if (mapScreen) {
            mapScreen.classList.remove('hidden');
            this.updateMapPlayerStatus();
            this.renderMap();
        }
    }
    
    // マップ画面のプレイヤーステータス更新
    updateMapPlayerStatus() {
        // HP表示
        const hpElement = document.getElementById('map-player-hp');
        if (hpElement) {
            hpElement.textContent = `${this.player.currentHP}/${this.player.maxHP}`;
        }
        
        // ゴールド表示
        const goldElement = document.getElementById('map-player-gold');
        if (goldElement) {
            goldElement.textContent = this.player.gold;
        }
        
        // ポーション表示
        const potionsElement = document.getElementById('map-player-potions');
        if (potionsElement) {
            const potionCount = Object.keys(this.player.potions).length;
            const totalPotions = Object.values(this.player.potions).reduce((sum, count) => sum + count, 0);
            potionsElement.textContent = `${potionCount}種類 (${totalPotions}個)`;
        }
        
        // 装備表示
        const equipmentElement = document.getElementById('map-player-equipment');
        if (equipmentElement) {
            const equipmentCount = Object.keys(this.player.equipment).length;
            equipmentElement.textContent = `${equipmentCount}個`;
        }
        
        // 所持ぷよ表示を追加（冒険マップエリアに）
        this.updateMapPuyoDisplay();
    }
    
    // マップ画面での所持ぷよ表示更新
    updateMapPuyoDisplay() {
        // 所持ぷよ情報を冒険マップエリアに表示
        let puyoDisplayElement = document.getElementById('map-puyo-display');
        if (!puyoDisplayElement) {
            // 要素が存在しない場合は作成
            const mapPlayerStatus = document.querySelector('.map-player-status');
            if (mapPlayerStatus) {
                const puyoSection = document.createElement('div');
                puyoSection.className = 'status-section';
                puyoSection.innerHTML = `
                    <div class="status-item">
                        <span class="status-label">🌈 所持ぷよ:</span>
                        <div id="map-puyo-display" class="status-value puyo-rates-display"></div>
                    </div>
                `;
                mapPlayerStatus.appendChild(puyoSection);
                puyoDisplayElement = document.getElementById('map-puyo-display');
            }
        }
        
        if (puyoDisplayElement) {
            const puyoRatesText = [
                `🔴${this.player.puyoRates.red}%`,
                `🔵${this.player.puyoRates.blue}%`,
                `🟡${this.player.puyoRates.yellow}%`,
                `🟢${this.player.puyoRates.green}%`,
                `🟣${this.player.puyoRates.purple}%`
            ].join(' ');
            puyoDisplayElement.textContent = puyoRatesText;
        }
        
        // 現在フロア表示
        const floorElement = document.getElementById('current-floor-display');
        if (floorElement) {
            floorElement.textContent = `階層: ${this.currentFloor}/15`;
        }
    }
    
    // マップイベントリスナー設定
    setupMapEventListeners() {
        // マップ戻るボタン
        const mapBackBtn = document.getElementById('map-back-to-title');
        if (mapBackBtn) {
            mapBackBtn.addEventListener('click', () => {
                this.returnToTitle();
            });
        }
    }
    
    // ヘルパー関数: ノードID検索
    findNodeById(nodeId) {
        for (const floor of this.mapData.floors) {
            const node = floor.find(n => n.id === nodeId);
            if (node) return node;
        }
        return null;
    }
    
    // ヘルパー関数: 接続利用可能チェック
    isConnectionAvailable(connection) {
        const fromNode = this.findNodeById(connection.from);
        const toNode = this.findNodeById(connection.to);
        return fromNode && toNode && (fromNode.completed || fromNode.available) && toNode.available;
    }
    
    // 初回パス選択表示
    showInitialPathChoice() {
        this.showingInitialPathChoice = true;
        
        // ストーリー画面を表示
        const storyScreen = document.getElementById('story-screen');
        if (storyScreen) {
            storyScreen.classList.remove('hidden');
        }
        
        // パス選択を表示
        this.showPathChoices();
        
        console.log('🛤️ 初回パス選択を表示');
    }
    
    // セーブ機能
    saveGame(slotNumber = 0) {
        try {
            const saveData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                player: this.player,
                currentFloor: this.currentFloor,
                maxFloor: this.maxFloor,
                currentMapPosition: this.currentMapPosition,
                completedNodes: Array.from(this.completedNodes),
                availableNodes: Array.from(this.availableNodes),
                mapData: this.mapData,
                battleLog: this.battleLog,
                showingInitialPathChoice: this.showingInitialPathChoice
            };
            
            const saveKey = `puyoStoryMode_save_${slotNumber}`;
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            
            console.log(`💾 ゲームをスロット${slotNumber}に保存しました`);
            return true;
        } catch (error) {
            console.error('❌ セーブに失敗:', error);
            return false;
        }
    }
    
    // ロード機能
    loadGame(slotNumber = 0) {
        try {
            const saveKey = `puyoStoryMode_save_${slotNumber}`;
            const saveDataStr = localStorage.getItem(saveKey);
            
            if (!saveDataStr) {
                console.log(`📂 スロット${slotNumber}にセーブデータがありません`);
                return false;
            }
            
            const saveData = JSON.parse(saveDataStr);
            
            // データを復元
            this.player = saveData.player;
            this.currentFloor = saveData.currentFloor;
            this.maxFloor = saveData.maxFloor;
            this.currentMapPosition = saveData.currentMapPosition;
            this.completedNodes = new Set(saveData.completedNodes);
            this.availableNodes = new Set(saveData.availableNodes);
            this.mapData = saveData.mapData;
            this.battleLog = saveData.battleLog || [];
            this.showingInitialPathChoice = saveData.showingInitialPathChoice || false;
            
            // マップデータが存在しない場合は再生成
            if (!this.mapData) {
                this.initializeMapSystem();
            }
            
            // ゲーム状態をマップモードに設定
            this.gameState = 'map';
            
            // 画面を更新
            this.updateDisplay();
            
            // 必ずマップ画面を表示
            this.showMapScreen();
            
            console.log('🗺️ ロード完了 - マップ画面を表示');
            
            console.log(`📂 スロット${slotNumber}からゲームをロードしました`);
            return true;
        } catch (error) {
            console.error('❌ ロードに失敗:', error);
            return false;
        }
    }
    
    // セーブデータ存在チェック
    hasSaveData(slotNumber = 0) {
        const saveKey = `puyoStoryMode_save_${slotNumber}`;
        return localStorage.getItem(saveKey) !== null;
    }
    
    // セーブデータ情報取得
    getSaveInfo(slotNumber = 0) {
        try {
            const saveKey = `puyoStoryMode_save_${slotNumber}`;
            const saveDataStr = localStorage.getItem(saveKey);
            
            if (!saveDataStr) return null;
            
            const saveData = JSON.parse(saveDataStr);
            return {
                timestamp: saveData.timestamp,
                floor: saveData.currentFloor,
                playerHP: saveData.player.currentHP,
                playerMaxHP: saveData.player.maxHP,
                gold: saveData.player.gold
            };
        } catch (error) {
            console.error('❌ セーブ情報取得に失敗:', error);
            return null;
        }
    }
    
    // ポーズメニューを表示できる状態かチェック
    canShowPauseMenu() {
        // ポーズメニューが既に表示されている場合は表示しない
        const pauseMenu = document.getElementById('story-pause-menu');
        if (pauseMenu && !pauseMenu.classList.contains('hidden')) {
            return false;
        }
        
        // セーブ選択メニューが表示されている場合は表示しない
        const saveMenu = document.getElementById('save-select-menu');
        if (saveMenu && !saveMenu.classList.contains('hidden')) {
            return false;
        }
        
        // ポップアップが表示されている場合は表示しない
        const popups = ['treasure-popup', 'event-popup', 'shop-popup'];
        for (const popupId of popups) {
            const popup = document.getElementById(popupId);
            if (popup && !popup.classList.contains('hidden')) {
                return false;
            }
        }
        
        // 戦闘画面またはマップ画面が表示されている場合は表示可能
        const battleScreen = document.getElementById('story-battle-screen');
        const mapScreen = document.getElementById('story-map-screen');
        
        const isBattleScreenActive = battleScreen && !battleScreen.classList.contains('hidden');
        const isMapScreenActive = mapScreen && !mapScreen.classList.contains('hidden');
        
        return isBattleScreenActive || isMapScreenActive;
    }
    
    // ESCキー押下時のポーズメニュー表示
    showPauseMenu() {
        const pauseMenu = document.getElementById('story-pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.remove('hidden');
        }
    }
    
    // ポーズメニューを隠す
    hidePauseMenu() {
        const pauseMenu = document.getElementById('story-pause-menu');
        if (pauseMenu) {
            pauseMenu.classList.add('hidden');
        }
    }
    
    // セーブ選択メニュー表示
    showSaveSelectMenu() {
        const saveMenu = document.getElementById('save-select-menu');
        if (saveMenu) {
            saveMenu.classList.remove('hidden');
            this.updateSaveSlotInfo();
        }
    }
    
    // セーブ選択メニューを隠す
    hideSaveSelectMenu() {
        const saveMenu = document.getElementById('save-select-menu');
        if (saveMenu) {
            saveMenu.classList.add('hidden');
        }
    }
    
    // セーブスロット情報更新
    updateSaveSlotInfo() {
        for (let i = 0; i < 3; i++) {
            const infoElement = document.getElementById(`save-info-${i}`);
            if (infoElement) {
                const saveInfo = this.getSaveInfo(i);
                if (saveInfo) {
                    const date = new Date(saveInfo.timestamp);
                    infoElement.innerHTML = `
                        <div>フロア: ${saveInfo.floor}</div>
                        <div>HP: ${saveInfo.playerHP}/${saveInfo.playerMaxHP}</div>
                        <div>ゴールド: ${saveInfo.gold}</div>
                        <div class="save-date">${date.toLocaleString()}</div>
                    `;
                } else {
                    infoElement.textContent = '空のスロット';
                }
            }
        }
    }
}

// グローバルに公開
window.StoryMode = StoryMode;