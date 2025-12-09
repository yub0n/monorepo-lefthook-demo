#!/usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const [commandName, ...files] = process.argv.slice(2);

if (!commandName) {
  console.error("❌ Error: No command name provided");
  process.exit(1);
}
if (!files.length) {
  console.log("ℹ️  No files to process");
  process.exit(0);
}

// リポジトリルートを検出（package.jsonがあるディレクトリ）
function findRepoRoot(startDir) {
  let currentDir = startDir;
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  return startDir;
}

const repoRoot = findRepoRoot(__dirname);

// ファイルから最も近いpackage.jsonを探索
function findNearestPackage(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  let currentDir = path.dirname(filePath);
  while (currentDir.startsWith(repoRoot)) {
    if (fs.existsSync(path.join(currentDir, "package.json"))) {
      return currentDir;
    }
    if (currentDir === repoRoot) {
      break;
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}

// パッケージがスクリプトを持っているかチェック
function hasScript(packageDir, scriptName) {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, "package.json"), "utf8")
    );
    return pkg.scripts?.[scriptName];
  } catch {
    return false;
  }
}

// パッケージごとにファイルをグループ化
const packageFiles = {};
files.forEach((file) => {
  const absolutePath = path.isAbsolute(file)
    ? file
    : path.resolve(repoRoot, file);
  const packageDir = findNearestPackage(absolutePath);
  if (!packageDir) {
    console.log(`⚠️  Skipping ${file}: no package.json found`);
    return;
  }
  const relPath = path.relative(packageDir, absolutePath);
  if (!packageFiles[packageDir]) packageFiles[packageDir] = [];
  packageFiles[packageDir].push(relPath);
});

if (Object.keys(packageFiles).length === 0) {
  console.log("ℹ️  No files matched any package");
  process.exit(0);
}

// パッケージごとにコマンド実行（Promise でラップ）
function runCommand(packageDir, targetFiles) {
  return new Promise((resolve) => {
    const packageName = path.relative(repoRoot, packageDir) || "root";

    if (!hasScript(packageDir, commandName)) {
      console.log(
        `⚠️  Skipping ${packageName}: script "${commandName}" not found`
      );
      resolve({ packageName, success: false, skipped: true });
      return;
    }

    console.log(`\n📦 Running in ${packageName}:`);
    console.log(`   pnpm run ${commandName} --`, JSON.stringify(targetFiles));

    const child = spawn("pnpm", ["run", commandName, "--", ...targetFiles], {
      cwd: packageDir,
      encoding: "utf8",
      stdio: "pipe",
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";

    child.stdout?.on("data", (data) => {
      stdoutBuffer += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderrBuffer += data.toString();
    });

    child.on("close", (code) => {
      // 終了後にまとめて出力（混ざらないようにする）
      if (stdoutBuffer) {
        console.log(`\n📦 [${packageName}] Output:`);
        console.log(stdoutBuffer.trim());
      }

      if (code !== 0) {
        console.error(`❌ Error in ${packageName}: Exit code ${code}`);
        if (stderrBuffer) console.error(`   stderr:\n${stderrBuffer}`);
        resolve({
          packageName,
          success: false,
          exitCode: code,
          stderr: stderrBuffer,
        });
      } else {
        resolve({ packageName, success: true });
      }
    });
  });
}

// 並列実行
(async () => {
  const promises = Object.keys(packageFiles).map((packageDir) => {
    const targetFiles = packageFiles[packageDir];
    return runCommand(packageDir, targetFiles);
  });

  const results = await Promise.all(promises);
  const processedPackages = results
    .filter((r) => r.success)
    .map((r) => r.packageName);
  const hasError = results.some((r) => !r.success && !r.skipped);

  console.log(
    `\n✅ Processed ${
      processedPackages.length
    } package(s): ${processedPackages.join(", ")}`
  );

  if (hasError) {
    process.exit(1);
  }
})();

