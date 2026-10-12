#!/usr/bin/env bash
# usage: ./repro.sh            (nested async chunking on)
#        NESTED=0 ./repro.sh   (flag off)
set -u
cd "$(dirname "$0")"
rm -rf .next
node node_modules/next/dist/bin/next dev . --turbopack -p 3456 > /tmp/next-repro-dev.log 2>&1 &
pid=$!
cleanup() {
  pkill -P "$pid" 2>/dev/null
  kill "$pid" 2>/dev/null
  while lsof -tiTCP:3456 -sTCP:LISTEN > /dev/null
  do
    sleep 0.2
  done
}
trap cleanup EXIT
until curl -s -o /dev/null http://localhost:3456/other
do
  sleep 0.5
done
node check.mjs / /other
