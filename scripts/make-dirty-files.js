const fs = require('node:fs');
const path = require('node:path');

// 既存のファイルを「汚す」ための定義
// ファイルパスと、そのファイルの末尾に追加する違反コードのペア
const dirtyTargets = [
  {
    path: 'apps/web/src/sample-math.ts',
    // apps/web: セミコロン禁止 (asNeeded)
    // 違反: セミコロンをつけて関数を定義
    append: '\nexport const multiply = (a: number, b: number): number => { return a * b; };\n',
  },
  {
    path: 'apps/admin/src/sample-user.ts',
    // apps/admin: 行長120 (lineWidth)
    // 違反: 120文字を超える長い説明文
    append: `\nexport const ADMIN_DESCRIPTION = "Administrators have full access to all resources within the system, including user management, system configuration, and audit logs. They are responsible for maintaining the security and integrity of the platform.";\n`,
  },
  {
    path: 'packages/ui/src/sample-button.ts',
    // packages/ui: 末尾カンマ禁止 (trailingCommas: none)
    // 違反: オブジェクトの末尾にカンマをつける
    append: `\nexport const BUTTON_STYLES = {
  primary: "bg-blue-500 text-white",
  secondary: "bg-gray-500 text-white",
  danger: "bg-red-500 text-white",
};
\n`,
  },
  {
    path: 'packages/logger/src/index.ts',
    // packages/logger: アロー関数括弧省略 (arrowParentheses: asNeeded)
    // 違反: 引数が1つのアロー関数に括弧をつける
    append: '\nexport const logWarning = (message: string) => console.warn(`[WARN] ${message}`);\n',
  },
];

dirtyTargets.forEach((target) => {
  const filePath = path.resolve(process.cwd(), target.path);
  
  if (fs.existsSync(filePath)) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    // すでに汚染コードが含まれているかチェック（重複追加防止）
    if (!originalContent.includes(target.append.trim())) {
      fs.appendFileSync(filePath, target.append);
      console.log(`Dirtied: ${target.path}`);
    } else {
      console.log(`Skipped (already dirty): ${target.path}`);
    }
  } else {
    console.warn(`File not found: ${target.path}`);
  }
});
