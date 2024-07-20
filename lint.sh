# Copyright 2024 sby1ce
# 
# SPDX-License-Identifier: AGPL-3.0-or-later

cd svelte
bun run check
cd ../react
bun run lint
cd ../solid
bun run lint
cd ..
