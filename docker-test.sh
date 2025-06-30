#!/bin/bash

# バックグラウンドでHTTPサーバーを起動
python3 -m http.server 3000 &
SERVER_PID=$!

# サーバーの起動を待機
sleep 3

# Playwrightテストを実行
npx playwright test --project=chromium

# サーバーを停止
kill $SERVER_PID