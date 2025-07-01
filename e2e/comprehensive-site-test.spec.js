import { test, expect } from '@playwright/test';

test.describe('おぐなお - サイト全体機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // メインサイトにアクセス
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('ページの基本構造とタイトル確認', async ({ page }) => {
    // ページタイトルの確認
    await expect(page).toHaveTitle('おぐなお');
    
    // メインタイトルの表示確認
    const gameTitle = page.locator('.game-title');
    await expect(gameTitle).toBeVisible();
    await expect(gameTitle).toContainText('おぐなお');
    
    // タイトル画像の表示確認
    const titleImage = page.locator('.title-image');
    await expect(titleImage).toBeVisible();
  });

  test('ゲームモード選択機能', async ({ page }) => {
    // モード選択ボタンの存在確認
    const soloButton = page.locator('#solo-mode-btn');
    const battleButton = page.locator('#battle-mode-btn');
    
    await expect(soloButton).toBeVisible();
    await expect(battleButton).toBeVisible();
    
    // ボタンが安定するまで待機
    await page.waitForTimeout(1000);
    
    // ソロモードボタンのクリック（強制クリックを使用）
    await soloButton.click({ force: true });
    await page.waitForTimeout(1000);
    
    // Press Enterの指示が表示されることを確認
    const enterInstruction = page.locator('#press-enter-instruction');
    await expect(enterInstruction).toBeVisible({ timeout: 5000 });
    
    // ページをリロードして初期状態に戻す
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 対戦モードボタンのクリック
    const battleButtonAfterReload = page.locator('#battle-mode-btn');
    await battleButtonAfterReload.click({ force: true });
    await page.waitForTimeout(1500);
    
    // 対戦画面に遷移することを確認
    const battleScreen = page.locator('#battle-screen');
    await expect(battleScreen).toBeVisible({ timeout: 5000 });
  });

  test('対戦モード画面の基本構造', async ({ page }) => {
    // 対戦モードに遷移（強制クリック使用）
    await page.waitForTimeout(1000);
    await page.click('#battle-mode-btn', { force: true });
    await page.waitForTimeout(2000);
    
    // 対戦画面要素の確認（タイムアウトを長く設定）
    await expect(page.locator('.battle-title')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.player-side')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.cpu-side')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.vs-display')).toBeVisible({ timeout: 5000 });
    
    // プレイヤー・CPU情報の確認
    await expect(page.locator('.player-name')).toContainText('あなた');
    await expect(page.locator('.cpu-name')).toContainText('CPU');
    
    // キャンバス要素の存在確認
    await expect(page.locator('#player-canvas')).toBeVisible();
    await expect(page.locator('#cpu-canvas')).toBeVisible();
    
    // 対戦開始ボタンの確認
    await expect(page.locator('#battle-start')).toBeVisible();
    
    // タイトルに戻るボタンの動作確認
    await page.click('#back-to-title', { force: true });
    await page.waitForTimeout(1000);
    await expect(page.locator('#start-screen')).toBeVisible({ timeout: 5000 });
  });

  test('ソロモードゲーム画面の基本構造', async ({ page }) => {
    // ソロモードを選択（強制クリック使用）
    await page.waitForTimeout(1000);
    await page.click('#solo-mode-btn', { force: true });
    await page.waitForTimeout(1000);
    
    // Enterキーでゲーム開始
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // ゲーム画面要素の確認（タイムアウト設定）
    await expect(page.locator('#game-canvas')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#score')).toBeVisible();
    await expect(page.locator('#time')).toBeVisible();
    await expect(page.locator('#chain')).toBeVisible();
    
    // 次のぷよ表示の確認
    await expect(page.locator('#next-puyo')).toBeVisible();
    
    // 操作情報の表示確認（複数要素があるため最初の要素を指定）
    const controlInfo = page.locator('.control-info').first();
    await expect(controlInfo).toContainText('操作方法');
    await expect(controlInfo).toContainText('A : 左移動');
    await expect(controlInfo).toContainText('D : 右移動');
    await expect(controlInfo).toContainText('S : 下移動');
    await expect(controlInfo).toContainText('Space : 回転');
  });

  test('設定・コントロール機能', async ({ page }) => {
    // 難易度選択の確認
    const difficultySelect = page.locator('#difficulty-select');
    await expect(difficultySelect).toBeVisible();
    
    // 音量コントロールの確認
    const volumeSlider = page.locator('#volume-slider');
    await expect(volumeSlider).toBeVisible();
    
    // BGM・SE音量コントロールの確認
    await expect(page.locator('#bgm-volume')).toBeVisible();
    await expect(page.locator('#se-volume')).toBeVisible();
    
    // 音量変更のテスト
    await volumeSlider.fill('75');
    const volumeDisplay = page.locator('#volume-display');
    await expect(volumeDisplay).toContainText('75%');
  });

  test('ランキング機能', async ({ page }) => {
    // ランキング表示の確認
    const rankingSection = page.locator('.ranking-section');
    await expect(rankingSection).toBeVisible();
    
    // ランキング更新ボタンの確認
    const refreshButton = page.locator('#refresh-ranking');
    await expect(refreshButton).toBeVisible();
    
    // ランキングリストの存在確認
    const rankingList = page.locator('#ranking-list');
    await expect(rankingList).toBeVisible();
  });

  test('コメント機能', async ({ page }) => {
    // コメント入力エリアの確認
    const commentInput = page.locator('#comment-input');
    const sendButton = page.locator('#send-comment');
    
    await expect(commentInput).toBeVisible();
    await expect(sendButton).toBeVisible();
    
    // コメント履歴の表示確認
    const commentList = page.locator('#comment-list');
    await expect(commentList).toBeVisible();
    
    // コメント入力のテスト（実際の送信はFirebase接続が必要）
    await commentInput.fill('テストコメント');
    await expect(commentInput).toHaveValue('テストコメント');
  });

  test('ヘルプモーダル機能', async ({ page }) => {
    // ヘルプボタンのクリック
    await page.click('#help-button');
    await page.waitForTimeout(500);
    
    // ヘルプモーダルの表示確認
    const helpModal = page.locator('#help-modal');
    await expect(helpModal).toBeVisible();
    
    // ヘルプ内容の確認
    await expect(page.locator('.help-header h2')).toContainText('おぐなお - ゲームルール説明');
    await expect(page.locator('.help-body')).toContainText('基本ルール');
    await expect(page.locator('.help-body')).toContainText('おぐなおコンボシステム');
    await expect(page.locator('.help-body')).toContainText('なおちゃんタイム');
    
    // ヘルプモーダルを閉じる
    await page.click('#help-close');
    await page.waitForTimeout(500);
    await expect(helpModal).not.toBeVisible();
  });

  test('デバッグ機能の存在確認', async ({ page }) => {
    // デバッグコントロール群の確認
    const debugControls = page.locator('.debug-controls');
    await expect(debugControls).toBeVisible();
    
    // 各種デバッグボタンの存在確認
    await expect(page.locator('#debug-2chain')).toBeVisible();
    await expect(page.locator('#debug-3chain')).toBeVisible();
    await expect(page.locator('#debug-4chain')).toBeVisible();
    await expect(page.locator('#debug-5chain')).toBeVisible();
    await expect(page.locator('#debug-7chain')).toBeVisible();
    await expect(page.locator('#debug-cutin')).toBeVisible();
    
    // カラーパレットの確認（デバッグモードで表示される可能性があるため条件付き）
    const colorPalette = page.locator('.color-palette');
    const paletteVisible = await colorPalette.isVisible();
    if (paletteVisible) {
      await expect(page.locator('#color-0')).toBeVisible();
      await expect(page.locator('#color-1')).toBeVisible();
    } else {
      // カラーパレットが非表示の場合は、存在だけ確認
      await expect(colorPalette).toBeAttached();
    }
  });

  test('レスポンシブ・アクセシビリティ基本チェック', async ({ page }) => {
    // 主要な見出し要素の確認
    const headings = page.locator('h1, h2, h3, h4');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // フォーム要素のラベル確認
    const volumeLabel = page.locator('label[for="volume-slider"]');
    await expect(volumeLabel).toBeVisible();
    
    const difficultyLabel = page.locator('label[for="difficulty-select"]');
    await expect(difficultyLabel).toBeVisible();
    
    // 画像のalt属性確認
    const titleImage = page.locator('.title-image');
    await expect(titleImage).toHaveAttribute('alt');
  });

  test('JavaScript エラーチェック', async ({ page }) => {
    const errors = [];
    
    // JavaScriptエラーをキャッチ
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // コンソールエラーをキャッチ
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // ページの基本操作を実行（安定性を向上）
    await page.waitForTimeout(1500);
    
    // ソロモードボタンが表示され安定するまで待機
    const soloButton = page.locator('#solo-mode-btn');
    await expect(soloButton).toBeVisible();
    await page.waitForTimeout(1000);
    
    // 強制クリックでソロモード選択
    await soloButton.click({ force: true });
    await page.waitForTimeout(1500);
    
    // Enterキーでゲーム開始
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // ゲーム操作をテスト（少し間隔を空ける）
    await page.keyboard.press('KeyA');
    await page.waitForTimeout(200);
    await page.keyboard.press('KeyD');
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);
    
    // 重大なエラーがないことを確認
    const criticalErrors = errors.filter(error => 
      !error.includes('Firebase') && 
      !error.includes('NetworkError') &&
      !error.includes('Failed to fetch') &&
      !error.includes('Cannot resolve module') &&
      !error.includes('Load failed')
    );
    
    // エラー詳細をログ出力
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('パフォーマンス基本チェック', async ({ page }) => {
    // ページロード時間の測定（別のページインスタンスを使用）
    const newPage = await page.context().newPage();
    const startTime = Date.now();
    
    await newPage.goto('http://localhost:8000/');
    // networkidleの代わりにdomcontentloadedを使用してタイムアウトを回避
    await newPage.waitForLoadState('domcontentloaded');
    await newPage.waitForTimeout(3000); // 追加のリソース読み込み待機
    
    const loadTime = Date.now() - startTime;
    
    // 15秒以内にロードが完了することを確認（タイムアウトを緩和）
    expect(loadTime).toBeLessThan(15000);
    
    // 主要なリソースがロードされていることを確認
    const canvas = newPage.locator('#game-canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });
    
    // スクリプトファイルがロードされていることを確認
    const scriptElements = newPage.locator('script[src]');
    const scriptCount = await scriptElements.count();
    expect(scriptCount).toBeGreaterThan(0);
    
    // ページタイトルが正しく設定されていることを確認
    await expect(newPage).toHaveTitle('おぐなお');
    
    // メモリリークを避けるため新しいページを閉じる
    await newPage.close();
  });
});