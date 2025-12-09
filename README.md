# Lefthook Monorepo Demo (Pattern 3)

This repository demonstrates **Pattern 3: Dynamic Dispatching with Scripts** for Lefthook in a monorepo, as described in [this article](https://zenn.dev/atamaplus/articles/monorepo-lefthook).

## Structure

- `packages/ui`: A sample package
- `apps/web`: A sample app
- `scripts/dispatch-by-package.js`: The script that dispatches commands to the appropriate package
- `lefthook.yml`: The single configuration file invoking the script

## How it works

1. `lefthook.yml` captures staged files and passes them to `scripts/dispatch-by-package.js`.
2. The script groups files by their package (finding the nearest `package.json`).
3. For each package, it runs the `check:staged` script defined in that package's `package.json`.

## How to try

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Enable git hooks:
   ```bash
   npx lefthook install
   ```

3. Create a file with formatting issues (e.g., single quotes) in a package:
   ```bash
   echo "const a = 'needs format';" > packages/ui/dirty.ts
   ```

4. Stage the file:
   ```bash
   git add packages/ui/dirty.ts
   ```

5. Run the hook (or just commit):
   ```bash
   npx lefthook run pre-commit
   ```

   You should see output indicating that `biome check --write` ran specifically in `packages/ui` and fixed the file.

## Configuration

- **`lefthook.yml`**:
  ```yaml
  pre-commit:
    commands:
      check:
        glob: "*.{js,ts,jsx,tsx,json,jsonc}"
        run: node scripts/dispatch-by-package.js check:staged {staged_files}
  ```

- **`packages/ui/package.json`**:
  ```json
  "scripts": {
    "check:staged": "biome check --write"
  }
  ```

