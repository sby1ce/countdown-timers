# Copyright 2024 sby1ce
# 
# SPDX-License-Identifier: AGPL-3.0-or-later

cd svelte
bun install
cd ../root
bun install
cd ../solid
bun install
cd ../react
bun install
cd ../vue
bun install
bun run postinstall_
cd ..
