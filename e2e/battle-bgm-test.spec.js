import { test, expect } from '@playwright/test';

test.describe('対戦モードBGMテスト', () => {
  test.beforeEach(async ({ page }) => {
    // テストページにアクセス
    await page.goto('http://localhost:8000/test-battle-bgm.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('BGM要素の存在確認', async ({ page }) => {
    // BGM要素チェックボタンをクリック
    await page.click('button:has-text("BGM要素チェック")');
    await page.waitForTimeout(1000);
    
    // 全BGM要素が存在することを確認
    const statusDiv = page.locator('#element-status');
    await expect(statusDiv).toContainText('title-bgm: ✅ 存在');
    await expect(statusDiv).toContainText('game-bgm: ✅ 存在');
    await expect(statusDiv).toContainText('battle-bgm: ✅ 存在');
    
    console.log('✅ BGM要素の存在確認完了');
  });

  test('対戦BGMの単体再生テスト', async ({ page }) => {
    // ユーザー操作を待つためのクリック（autoplay制限回避）
    await page.click('button:has-text("BGM要素チェック")');
    await page.waitForTimeout(500);
    
    // 対戦BGM再生ボタンをクリック
    await page.click('button:has-text("対戦BGM再生")');
    await page.waitForTimeout(2000);
    
    // 現在の状態を確認
    const statusDiv = page.locator('#current-status');
    await expect(statusDiv).toContainText('現在のBGM: battle-bgm');
    await expect(statusDiv).toContainText('状態: 再生中');
    
    // ログを確認
    const logDiv = page.locator('#log');
    await expect(logDiv).toContainText('対戦BGM開始成功');
    
    console.log('✅ 対戦BGM単体再生テスト完了');
  });

  test('対戦モードシミュレーションテスト', async ({ page }) => {
    // ユーザー操作を待つためのクリック（autoplay制限回避）
    await page.click('button:has-text("BGM要素チェック")');
    await page.waitForTimeout(500);
    
    // 対戦開始シミュレート
    await page.click('button:has-text("対戦開始シミュレート")');
    await page.waitForTimeout(3000);
    
    // 対戦BGMが再生されていることを確認
    const statusDiv = page.locator('#current-status');
    await expect(statusDiv).toContainText('現在のBGM: battle-bgm');
    
    // ログを確認
    const logDiv = page.locator('#log');
    await expect(logDiv).toContainText('対戦開始シミュレート開始');
    await expect(logDiv).toContainText('対戦BGM開始成功');
    
    console.log('✅ 対戦モードシミュレーションテスト完了');
  });

  test('BGM切り替えテスト', async ({ page }) => {
    // ユーザー操作を待つためのクリック（autoplay制限回避）
    await page.click('button:has-text("BGM要素チェック")');
    await page.waitForTimeout(500);
    
    // タイトルBGM開始
    await page.click('button:has-text("タイトルBGM再生")');
    await page.waitForTimeout(1500);
    
    let statusDiv = page.locator('#current-status');
    await expect(statusDiv).toContainText('現在のBGM: title-bgm');
    
    // 対戦BGMに切り替え
    await page.click('button:has-text("対戦BGM再生")');
    await page.waitForTimeout(1500);
    
    await expect(statusDiv).toContainText('現在のBGM: battle-bgm');
    
    // ゲームBGMに切り替え
    await page.click('button:has-text("ゲームBGM再生")');
    await page.waitForTimeout(1500);
    
    await expect(statusDiv).toContainText('現在のBGM: game-bgm');
    
    console.log('✅ BGM切り替えテスト完了');
  });

  test('音量制御テスト', async ({ page }) => {
    // ユーザー操作を待つためのクリック（autoplay制限回避）
    await page.click('button:has-text("BGM要素チェック")');
    await page.waitForTimeout(500);
    
    // 音量を75%に設定
    await page.fill('#test-volume', '75');
    await page.waitForTimeout(500);
    
    // 音量表示の確認
    const volumeDisplay = page.locator('#volume-display');
    await expect(volumeDisplay).toContainText('75%');
    
    // 対戦BGM再生
    await page.click('button:has-text("対戦BGM再生")');
    await page.waitForTimeout(2000);
    
    // 状態確認で音量75%が表示されること
    const statusDiv = page.locator('#current-status');
    await expect(statusDiv).toContainText('音量: 75%');
    
    console.log('✅ 音量制御テスト完了');
  });

  test('エラーハンドリングテスト', async ({ page }) => {
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
    
    // 各種BGM操作を実行
    await page.click('button:has-text("BGM要素チェック")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("対戦BGM再生")');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("全BGM停止")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("対戦開始シミュレート")');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("対戦終了シミュレート")');
    await page.waitForTimeout(1000);
    
    // 重大なエラーがないことを確認
    const criticalErrors = errors.filter(error => 
      !error.includes('Failed to load') &&
      !error.includes('NetworkError') &&
      !error.includes('autoplay')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBe(0);
    console.log('✅ エラーハンドリングテスト完了');
  });
});