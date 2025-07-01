import { test, expect } from '@playwright/test';

test.describe('対戦モードUI変更テスト', () => {
  test.beforeEach(async ({ page }) => {
    // メインサイトにアクセス
    await page.goto('http://localhost:8000/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('対戦モードUIの基本レイアウト確認', async ({ page }) => {
    // 対戦モードに遷移
    await page.waitForTimeout(1000);
    await page.click('#battle-mode-btn', { force: true });
    await page.waitForTimeout(2000);
    
    // 新しい次のぷよ表示要素の存在確認
    const playerNextOutside = page.locator('.player-next-outside');
    const cpuNextOutside = page.locator('.cpu-next-outside');
    
    await expect(playerNextOutside).toBeVisible();
    await expect(cpuNextOutside).toBeVisible();
    
    // ラベルテキストの確認
    await expect(playerNextOutside.locator('.next-label')).toContainText('あなたの次のぷよ');
    await expect(cpuNextOutside.locator('.next-label')).toContainText('CPUの次のぷよ');
    
    console.log('✅ 新しい次のぷよ表示要素が正常に表示されています');
  });

  test('次のぷよ表示がキャンバス上部に配置されていることを確認', async ({ page }) => {
    // 対戦モードに遷移
    await page.waitForTimeout(1000);
    await page.click('#battle-mode-btn', { force: true });
    await page.waitForTimeout(2000);
    
    // キャンバスとプレイヤーエリアの位置を取得
    const playerCanvas = page.locator('#player-canvas');
    const cpuCanvas = page.locator('#cpu-canvas');
    const playerSide = page.locator('.player-side');
    const cpuSide = page.locator('.cpu-side');
    
    const playerCanvasBox = await playerCanvas.boundingBox();
    const cpuCanvasBox = await cpuCanvas.boundingBox();
    const playerSideBox = await playerSide.boundingBox();
    const cpuSideBox = await cpuSide.boundingBox();
    
    // プレイヤー側とCPU側の次のぷよ表示位置を取得
    const playerNext = page.locator('.player-next-outside');
    const cpuNext = page.locator('.cpu-next-outside');
    
    const playerBox = await playerNext.boundingBox();
    const cpuBox = await cpuNext.boundingBox();
    
    // 位置の検証
    expect(playerBox).toBeTruthy();
    expect(cpuBox).toBeTruthy();
    expect(playerCanvasBox).toBeTruthy();
    expect(cpuCanvasBox).toBeTruthy();
    
    // プレイヤー側の次のぷよがキャンバス右側に配置されている（エリア外でもOK）
    expect(playerBox.x).toBeGreaterThan(playerCanvasBox.x + playerCanvasBox.width - 50);
    
    // CPU側の次のぷよがキャンバス左側に配置されている（エリア外でもOK）
    expect(cpuBox.x + cpuBox.width).toBeLessThan(cpuCanvasBox.x + 50);
    
    // 次のぷよがキャンバスの上部に配置されている
    expect(playerBox.y).toBeLessThan(playerCanvasBox.y + 100);
    expect(cpuBox.y).toBeLessThan(cpuCanvasBox.y + 100);
    
    console.log(`✅ キャンバス上部配置確認: CPU(${Math.round(cpuBox.x)}, ${Math.round(cpuBox.y)}), プレイヤー(${Math.round(playerBox.x)}, ${Math.round(playerBox.y)})`);
  });

  test('新UI要素の正常動作確認', async ({ page }) => {
    // 対戦モードに遷移
    await page.waitForTimeout(1000);
    await page.click('#battle-mode-btn', { force: true });
    await page.waitForTimeout(2000);
    
    // 新しい次のぷよ表示要素の詳細確認
    const playerNextOutside = page.locator('.player-next-outside');
    const cpuNextOutside = page.locator('.cpu-next-outside');
    
    // 新UI要素が適切に表示され、スタイリングされていることを確認
    await expect(playerNextOutside).toBeVisible();
    await expect(cpuNextOutside).toBeVisible();
    
    // CSS プロパティの確認
    const playerStyle = await playerNextOutside.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        background: styles.backgroundColor,
        textAlign: styles.textAlign
      };
    });
    
    expect(playerStyle.display).not.toBe('none');
    expect(playerStyle.textAlign).toBe('center');
    
    console.log('✅ 新UI要素が正常に動作しています');
    console.log('プレイヤー側スタイル:', playerStyle);
  });

  test('対戦画面の基本機能動作確認', async ({ page }) => {
    // 対戦モードに遷移
    await page.waitForTimeout(1000);
    await page.click('#battle-mode-btn', { force: true });
    await page.waitForTimeout(2000);
    
    // 基本要素の表示確認
    await expect(page.locator('.player-info')).toBeVisible();
    await expect(page.locator('.cpu-info')).toBeVisible();
    await expect(page.locator('#player-canvas')).toBeVisible();
    await expect(page.locator('#cpu-canvas')).toBeVisible();
    await expect(page.locator('.vs-display')).toBeVisible();
    
    // スコア表示の確認
    await expect(page.locator('#player-score')).toContainText('0');
    await expect(page.locator('#cpu-score')).toContainText('0');
    
    // 対戦開始ボタンの確認
    await expect(page.locator('#battle-start')).toBeVisible();
    
    console.log('✅ 対戦画面の基本機能が正常に動作しています');
  });

  test('レスポンシブデザインの基本確認', async ({ page }) => {
    // 対戦モードに遷移
    await page.waitForTimeout(1000);
    await page.click('#battle-mode-btn', { force: true });
    await page.waitForTimeout(2000);
    
    // デスクトップサイズでの表示確認
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    const playerNext = page.locator('.player-next-outside');
    const cpuNext = page.locator('.cpu-next-outside');
    
    await expect(playerNext).toBeVisible();
    await expect(cpuNext).toBeVisible();
    
    // タブレットサイズに変更
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    // まだ表示されていることを確認
    await expect(playerNext).toBeVisible();
    await expect(cpuNext).toBeVisible();
    
    console.log('✅ レスポンシブデザインが正常に動作しています');
  });
});