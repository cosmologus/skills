#!/bin/sh
# Re-copy pstack from upstream cursor/plugins (skills, agents, docs).
set -e
DST="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
git clone -q --depth 1 --filter=blob:none --sparse \
  https://github.com/cursor/plugins.git "$TMP/plugins"
git -C "$TMP/plugins" sparse-checkout set pstack
SRC="$TMP/plugins/pstack"
rm -rf "$DST/skills" "$DST/agents" "$DST/docs"
cp -R "$SRC/skills" "$SRC/agents" "$SRC/docs" "$SRC/LICENSE" "$SRC/README.md" "$DST/"
VER="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$SRC/plugin.json")"
sed -i '' "s/\"version\": *\"[^\"]*\"/\"version\": \"$VER\"/" \
  "$DST/.claude-plugin/plugin.json"
echo "pstack $VER ($(git -C "$TMP/plugins" rev-parse --short HEAD))"
