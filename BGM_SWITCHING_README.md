# BGM切り替え機能 実装完了

## 概要
ぷよぷよゲームにBGM切り替え機能を追加しました。ソロモードと対戦モードの両方で、musicフォルダ内のMP3ファイル（jagler.mp3とjagler1.mp3以外）から好きなBGMを選択できます。

## 利用可能なBGMファイル

### ソロモード用BGM
- ぷよぷよっと始まる毎日.mp3 (デフォルト)
- 2.mp3
- 2 -inst.mp3
- ED.mp3
- instrumental.mp3
- jagler (mp3cut.net).mp3

### 対戦モード用BGM
- battleBGM.MP3 (デフォルト)
- battleBGM-inst].mp3
- 2.mp3
- 2 -inst.mp3
- ED.mp3
- instrumental.mp3
- ぷよぷよっと始まる毎日.mp3

## UI要素の配置

### ソロモード
- 音量設定の下に「BGM選択」セクションを追加
- ドロップダウンメニューでBGMを選択可能

### 対戦モード  
- 対戦モード設定エリア内の音量設定の下に「BGM選択」セクションを追加
- ドロップダウンメニューでBGMを選択可能

## 機能詳細

### リアルタイム切り替え
- ゲーム中でもBGMをリアルタイムで切り替え可能
- 音量設定も即座に反映

### カスタムBGM対応
- 既存のHTML audio要素に含まれていないBGMファイルも動的に読み込み
- 新しいAudio要素を作成して再生

### 音量管理
- 選択したBGMにも音量スライダーの設定が適用
- 一時停止/再開時も設定を維持

## テスト方法

ブラウザのコンソールで以下のコマンドを実行してテストできます：

```javascript
// 包括的機能テスト
testBgmFunctionality();

// ソロモードBGM選択テスト
testSoloBgmSelection();

// 対戦モードBGM選択テスト  
testBattleBgmSelection();
```

## 技術実装詳細

### ソロモード実装
- `setupBgmSelector()`: イベントリスナー設定
- `switchSoloBgm()`: ゲーム中のBGM切り替え
- `startSelectedSoloBgm()`: ゲーム開始時のBGM選択

### 対戦モード実装  
- `setupBattleBgmSelector()`: イベントリスナー設定
- `switchBattleBgm()`: ゲーム中のBGM切り替え
- `startSelectedBattleBgm()`: ゲーム開始時のBGM選択

### 変数管理
- `selectedSoloBgm`: 選択されたソロモードBGM
- `selectedBattleBgm`: 選択された対戦モードBGM  
- `customBgmAudio`: カスタムBGM用Audio要素

## ファイル変更点
- `index.html`: BGM選択UI追加
- `style.css`: BGM選択セレクトボックスのスタイル追加
- `script.js`: BGM切り替え機能実装
- `test-bgm-functionality.js`: テスト用スクリプト追加

## 使用方法
1. ゲームを起動
2. ソロモードまたは対戦モードを選択
3. 音量設定の下にある「BGM選択」でお好みのBGMを選択
4. ゲーム開始時または変更時に即座に新しいBGMが再生されます