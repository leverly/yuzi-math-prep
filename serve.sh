#!/bin/bash
# 本地预览：启动静态服务器并打开浏览器
set -e
cd "$(dirname "$0")"

PORT="${1:-8000}"

# 端口被占用则顺延
while lsof -i ":$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  echo "端口 $PORT 已被占用，尝试 $((PORT+1))"
  PORT=$((PORT+1))
done

# 先重新构建，保证产物是最新的
node build.mjs

echo ""
echo "  本地预览：http://127.0.0.1:$PORT"
echo "  按 Ctrl+C 停止"
echo ""

# 后台等服务器起来再开浏览器
( sleep 1; open "http://127.0.0.1:$PORT" ) &

exec python3 -m http.server "$PORT" --bind 127.0.0.1
