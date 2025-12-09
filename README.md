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

1. 依存関係のインストール（Gitフックも自動でインストールされます）:
   ```bash
   pnpm install
   ```

2. テスト用のフォーマット違反状態を作成:
   ```bash
   pnpm make-dirty
   ```
   これにより、各パッケージの既存ファイルに、わざと設定に違反したコードが追記されます。

3. ファイルをステージ:
   ```bash
   git add .
   ```

4. フックを実行（またはコミット）:
   ```bash
   npx lefthook run pre-commit
   ```

   各パッケージの設定（インデント、クォート、セミコロンなど）に従って、それぞれのファイルが自動修正されるのが確認できるはずです。

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
