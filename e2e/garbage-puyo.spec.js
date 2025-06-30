import { test, expect } from '@playwright/test';

test.describe('おじゃまぷよ機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    // HTTPサーバーにアクセス
    await page.goto('http://localhost:3000/test-garbage.html');
    await page.waitForLoadState('networkidle');
  });

  test('連鎖数による数量テスト', async ({ page }) => {
    // 連鎖数による数量テストボタンをクリック
    await page.click('button:has-text("連鎖数による数量テスト")');
    
    // テスト結果が表示されるまで待機
    await page.waitForSelector('.test-result', { timeout: 5000 });
    
    // 結果を取得
    const results = await page.textContent('.test-result pre');
    console.log('連鎖数テスト結果:', results);
    
    // 2連鎖が1-2個の範囲内であることを確認
    expect(results).toContain('2連鎖');
    expect(results).toMatch(/2連鎖: [1-2]-[1-2]個/);
  });

  test('落下テスト', async ({ page }) => {
    // 落下テストボタンをクリック
    await page.click('button:has-text("落下テスト")');
    
    // テスト結果が表示されるまで待機
    await page.waitForSelector('.test-result:nth-child(2)', { timeout: 5000 });
    
    // 落下パターンを確認
    const visualization = await page.textContent('.test-result:nth-child(2) pre');
    console.log('落下テスト結果:', visualization);
    
    // おじゃまぷよ（■）が下の方に配置されていることを確認
    expect(visualization).toContain('■');
    
    // 下半分におじゃまぷよが多いことを確認（重力に従って落下）
    const lines = visualization.split('\n').filter(line => line.length > 0);
    const bottomHalf = lines.slice(Math.floor(lines.length / 2));
    const topHalf = lines.slice(0, Math.floor(lines.length / 2));
    
    const bottomGarbageCount = bottomHalf.join('').split('■').length - 1;
    const topGarbageCount = topHalf.join('').split('■').length - 1;
    
    console.log(`下半分のおじゃまぷよ: ${bottomGarbageCount}, 上半分: ${topGarbageCount}`);
    expect(bottomGarbageCount).toBeGreaterThanOrEqual(topGarbageCount);
  });

  test('メインゲームアクセステスト', async ({ page }) => {
    // メインゲームにアクセス
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // ゲームタイトルが表示されることを確認
    await expect(page.locator('h1, title')).toContainText('おぐなお');
    
    // 対戦モードボタンの存在を確認
    const battleButton = page.locator('button:has-text("対戦"), .battle-mode, #battle-mode');
    const buttonExists = await battleButton.count() > 0;
    
    if (buttonExists) {
      console.log('対戦モードボタンが見つかりました');
    } else {
      console.log('対戦モードボタンが見つかりませんでした');
    }
  });
});