# Lefthook Monorepo Demo (パターン3)

このリポジトリは、[こちらの記事](https://zenn.dev/atamaplus/articles/monorepo-lefthook)で紹介されている、モノレポにおけるLefthookの**パターン3: スクリプトによる動的ディスパッチ**のデモです。

## 構成

- `packages/`:
    - `ui`: サンプルパッケージ (末尾カンマなし, シングルクォート)
    - `logger`: サンプルパッケージ (アロー関数括弧省略)
- `apps/`:
    - `web`: サンプルアプリ (インデント: スペース2, セミコロンなし)
    - `admin`: サンプルアプリ (行長: 120)
- `scripts/dispatch-by-package.js`: コマンドを適切なパッケージに振り分けるスクリプト
- `lefthook.yml`: スクリプトを呼び出す単一の設定ファイル
- `biome.jsonc`: ルートの共通設定ファイル
- `**/biome.jsonc`: 各パッケージの個別設定ファイル（ルートを継承・上書き）

## 仕組み

1. `lefthook.yml` がステージされたファイルをキャプチャし、`scripts/dispatch-by-package.js` に渡します。
2. スクリプトはファイルをパッケージごとにグループ化します（最も近い `package.json` を探します）。
3. 各パッケージに対して、そのパッケージの `package.json` で定義された `check:staged` スクリプトを実行します。

## 試し方

1. 依存関係のインストール:
   ```bash
   pnpm install
   ```

2. Gitフックの有効化:
   ```bash
   npx lefthook install
   ```

3. パッケージ内にフォーマット違反を含むファイルを作成（例: `apps/web` はセミコロン禁止設定）:
   ```bash
   echo "const a = 1;" > apps/web/src/dirty.ts
   ```

4. ファイルをステージ:
   ```bash
   git add apps/web/src/dirty.ts
   ```

5. フックを実行（またはコミット）:
   ```bash
   npx lefthook run pre-commit
   ```

   `apps/web` パッケージ内でのみ `biome check --write` が実行され、ファイルが修正される（セミコロンが削除される）のが確認できるはずです。

## 設定

- **`lefthook.yml`**:
  ```yaml
  pre-commit:
    commands:
      check:
        glob: "*.{js,ts,jsx,tsx,json,jsonc}"
        run: node scripts/dispatch-by-package.js check:staged {staged_files}
  ```

- **各 `package.json`**:
  ```json
  "scripts": {
    "check:staged": "biome check --write"
  }
  ```
