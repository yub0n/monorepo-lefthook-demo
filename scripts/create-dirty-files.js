const fs = require('node:fs');
const path = require('node:path');

const files = [
  // apps/web: セミコロン禁止だが、セミコロン付きのファイルを作成
  {
    path: 'apps/web/src/dirty.ts',
    content: 'export const dirty = () => { return "semicolon"; };',
  },
  // apps/admin: 行長120だが、非常に長い行を作成
  {
    path: 'apps/admin/src/dirty.ts',
    content: `export const veryLongLine = "This is a very long line that should exceed the limit of 120 characters set in the biome configuration for this package. It is intentionally made this long to trigger a formatting error when checking the staged files with lefthook.";`,
  },
  // packages/ui: 末尾カンマ禁止だが、末尾カンマ付きのオブジェクトを作成
  {
    path: 'packages/ui/src/dirty.ts',
    content: `export const dirtyObj = {
  key: "value",
};
`,
  },
  // packages/logger: アロー関数括弧省略だが、括弧付きの関数を作成
  {
    path: 'packages/logger/src/dirty.ts',
    content: 'export const dirtyArrow = (x) => x;',
  },
];

files.forEach((file) => {
  const filePath = path.resolve(process.cwd(), file.path);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, file.content);
  console.log(`Created: ${file.path}`);
});

