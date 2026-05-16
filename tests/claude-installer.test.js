import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const appSource = readFileSync(join(projectRoot, "app.js"), "utf8");
const htmlSource = readFileSync(join(projectRoot, "index.html"), "utf8");
const cssSource = readFileSync(join(projectRoot, "styles.css"), "utf8");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertRuleHas(selector, declarationPattern) {
  assert.match(cssSource, new RegExp(`${escapeRegex(selector)}\\s*\\{[\\s\\S]*?${declarationPattern}`));
}

function extractFunctionSource(name) {
  const marker = `function ${name}`;
  const start = appSource.indexOf(marker);
  assert.notEqual(start, -1, `${name} should exist`);

  const bodyStart = appSource.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < appSource.length; index += 1) {
    const char = appSource[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return appSource.slice(start, index + 1);
  }

  throw new Error(`Could not extract ${name}`);
}

function extractRawTemplateFunctionSource(name) {
  const source = extractFunctionSource(name);
  const marker = "return String.raw`";
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} should return a raw template`);
  const bodyStart = start + marker.length;
  const end = source.lastIndexOf("`;");
  assert.notEqual(end, -1, `${name} raw template should end`);
  return source.slice(bodyStart, end);
}

function runClaudeGuardHook(payload) {
  const root = mkdtempSync(join(tmpdir(), "agent-claude-hook-test-"));
  const hookPath = join(root, "agent-guard.sh");
  writeFileSync(hookPath, extractRawTemplateFunctionSource("buildGuardHookScript"));
  chmodSync(hookPath, 0o755);
  const result = spawnSync("bash", [hookPath], {
    cwd: root,
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    input: JSON.stringify(payload),
    encoding: "utf8",
  });
  rmSync(root, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim() ? JSON.parse(result.stdout) : {};
}

function runCodexGuardHook(payload) {
  const root = mkdtempSync(join(tmpdir(), "agent-codex-hook-test-"));
  const hookPath = join(root, "agent_guard.py");
  writeFileSync(hookPath, extractRawTemplateFunctionSource("buildCodexGuardHookScript"));
  chmodSync(hookPath, 0o755);
  const result = spawnSync("python3", [hookPath], {
    cwd: root,
    input: JSON.stringify(payload),
    encoding: "utf8",
  });
  rmSync(root, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim() ? JSON.parse(result.stdout) : {};
}

function hookDecision(output) {
  const hookOutput = output.hookSpecificOutput || {};
  return hookOutput.permissionDecision || hookOutput.decision?.behavior || output.decision || "";
}

function extractTaskSamples() {
  const match = appSource.match(/const taskSamples = \[([\s\S]*?)\];/);
  assert.ok(match, "taskSamples should exist");
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function extractSystemPromptSource() {
  const match = appSource.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;/);
  assert.ok(match, "SYSTEM_PROMPT should exist");
  return match[1];
}

function extractCuratedSampleResultsSource() {
  const start = appSource.indexOf("const curatedSampleResults = new Map");
  assert.notEqual(start, -1, "curatedSampleResults should exist");
  const end = appSource.indexOf("let sampleIndex", start);
  assert.notEqual(end, -1, "curatedSampleResults should end before sampleIndex");
  return appSource.slice(start, end);
}

test("installer UI offers Claude Code and Codex project setup commands", () => {
  assert.equal(htmlSource.includes("copyClaudeBtn"), true);
  assert.equal(htmlSource.includes("copyCodexBtn"), true);
  assert.match(htmlSource, /Claude Code/);
  assert.match(htmlSource, /Codex/);
  assert.equal(appSource.includes("buildClaudeProjectSetupScript"), true);
  assert.equal(appSource.includes("buildCodexProjectSetupScript"), true);
  assert.equal(appSource.includes("buildCodexConfigToml"), true);
});

test("install command copy is disabled until an inspection result exists", () => {
  const copySource = extractFunctionSource("copyInstallCommand");

  assert.match(htmlSource, /id="copyClaudeBtn"[\s\S]*disabled/);
  assert.match(htmlSource, /id="copyCodexBtn"[\s\S]*disabled/);
  assert.match(appSource, /function setInstallCopyEnabled/);
  assert.match(appSource, /function isInspectionReady/);
  assert.match(appSource, /copyClaudeBtn\.disabled = !enabled/);
  assert.match(appSource, /copyCodexBtn\.disabled = !enabled/);
  assert.match(copySource, /if \(!isInspectionReady\(\)\)/);
  assert.match(copySource, /先点击「体检任务」/);
  assert.match(appSource, /resetResultWorkspaceForSample[\s\S]*setInstallCopyEnabled\(false\)/);
  assert.match(appSource, /setAiAnalysisPendingState[\s\S]*setInstallCopyEnabled\(false\)/);
  assert.match(appSource, /applyKeywordInspectionResult[\s\S]*setInstallCopyEnabled\(true\)/);
  assert.match(appSource, /applyCuratedInspectionResult[\s\S]*setInstallCopyEnabled\(true\)/);
  assert.match(appSource, /applyAiEnhancement[\s\S]*setInstallCopyEnabled\(true\)/);
});

test("page copy is specific to Claude Code and Codex", () => {
  assert.match(htmlSource, /<title>AI 入职体检器<\/title>/);
  assert.match(htmlSource, /<h1>AI 入职体检器<\/h1>/);
  assert.match(htmlSource, /真正会生效的配置和 hooks/);
  assert.match(htmlSource, /Claude Code \/ Codex Onboarding Desk/);
  assert.match(cssSource, /h1\s*\{[\s\S]*white-space:\s*nowrap/);
  assert.doesNotMatch(cssSource, /h1\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
});

test("result tabs follow the onboarding flow order", () => {
  assert.match(
    htmlSource,
    /data-tab="policy"[\s\S]*data-tab="permissions"[\s\S]*data-tab="approvals"[\s\S]*data-tab="sandbox"[\s\S]*data-tab="hooks"/,
  );
  assert.match(
    htmlSource,
    /data-panel="policy"[\s\S]*data-panel="permissions"[\s\S]*data-panel="approvals"[\s\S]*data-panel="sandbox"[\s\S]*data-panel="hooks"/,
  );
});

test("sandbox level labels are localized in the UI", () => {
  assert.match(htmlSource, /id="handoffSandbox">待生成<\/small>/);
  assert.match(htmlSource, /沙箱 <strong id="sandboxLevel">待生成<\/strong>/);
  assert.match(appSource, /level === "高风险" \? "严格" : level === "中风险" \? "守护" : "轻量"/);
});

test("default UI does not show generated counts before inspection", () => {
  assert.match(htmlSource, /id="handoffMode">待体检<\/strong>/);
  assert.match(htmlSource, /id="handoffPermission">待生成<\/small>/);
  assert.match(htmlSource, /id="handoffApproval">待生成<\/small>/);
  assert.match(htmlSource, /id="permissionCount">待生成<\/strong>/);
  assert.match(htmlSource, /id="approvalCount">待生成<\/strong>/);
  assert.match(htmlSource, /id="policyBadge">待体检<\/strong>/);
  assert.match(htmlSource, /id="hookCount">待生成<\/strong>/);
  assert.match(appSource, /function formatHandoffCount/);
  assert.match(appSource, /Number\.isFinite\(total\) \? `\$\{total\} \$\{unit\}` : "待生成"/);
  assert.match(appSource, /updateHandoffSummary\("待体检", null, null, "待生成"\)/);
  assert.doesNotMatch(htmlSource, /id="handoffPermission">0 项权限|id="handoffApproval">0 个确认点/);
});

test("AI prompt keeps generated guidance aligned to the current task", () => {
  const promptSource = extractSystemPromptSource();

  assert.match(promptSource, /你是“AI 入职体检器”的安全策略生成器/);
  assert.match(promptSource, /所有内容都必须围绕用户当前任务/);
  assert.match(promptSource, /如果任务没有客户数据，就不要写客户数据/);
  assert.match(promptSource, /permissions 写“能做什么”，approvals 写“做到哪一步必须停下来问人”/);
  assert.match(promptSource, /Claude Code ask \/ Codex PermissionRequest \/ deny \/ 记录 \/ additionalContext/);
  assert.match(promptSource, /Codex 的 PreToolUse 不要声称可以可靠 ask/);
  assert.match(promptSource, /danger-full-access \+ never/);
  assert.match(promptSource, /代码仓库任务/);
  assert.match(
    promptSource,
    new RegExp(escapeRegex("git commit 走确认；git push、git tag、gh pr create/merge/edit/close、gh release、publish 必须 deny")),
  );
  assert.match(promptSource, /网页和浏览器任务/);
  assert.match(promptSource, /只读数据库任务/);
  assert.match(promptSource, /云服务器和生产日志任务/);
  assert.match(promptSource, /CI 和发布任务/);
  assert.match(promptSource, /curl、wget、scp、rsync、aws s3、gsutil、rclone、mail、sendmail/);
  assert.match(promptSource, /风险关键词镜像/);
  assert.match(promptSource, /登录\/账号\/后台\/cookie\/密码\/token -> 临时账号权限/);
  assert.match(promptSource, /删除\/清空\/覆盖\/重置\/rm\/drop -> 破坏性操作必须进沙箱/);
  assert.match(promptSource, /Claude Code 配置镜像/);
  assert.match(promptSource, /disableBypassPermissionsMode/);
  assert.match(promptSource, /allowedHttpHookUrls = 空/);
  assert.match(promptSource, /Codex 配置镜像/);
  assert.match(promptSource, /web_search = disabled/);
  assert.match(promptSource, /history.persistence = none/);
  assert.match(promptSource, /memories、plugin_hooks、skill_mcp_dependency_install、codex_git_commit 都关闭/);
  assert.match(promptSource, /命令决策镜像/);
  assert.match(promptSource, /git commit、依赖 install\/add、rm、curl\/wget、数据库连接命令 -> ask\/prompt/);
  assert.match(promptSource, /敏感内容镜像/);
  assert.match(promptSource, /-----BEGIN .*PRIVATE KEY-----/);
  assert.match(promptSource, /sk-、ghp_\/gho_\/ghu_\/ghs_\/ghr_、xoxb-\/xoxp-\/xoxa-、claude-/);
});

test("sample tasks are five curated cases and randomize without auto-running checks", () => {
  const samples = extractTaskSamples();
  assert.equal(samples.length, 5);
  assert.equal(new Set(samples).size, 5);
  assert.ok(samples.some((sample) => sample.includes("登录回调 bug") && sample.includes(".env")));
  assert.ok(samples.some((sample) => sample.includes("竞品官网") && sample.includes("截图")));
  assert.ok(samples.some((sample) => sample.includes("只读数据库") && sample.includes("CSV")));
  assert.ok(samples.some((sample) => sample.includes("云服务器") && sample.includes("回滚方案")));
  assert.ok(samples.some((sample) => sample.includes("CI 配置") && sample.includes("PR 描述")));
  assert.ok(samples.every((sample) => !sample.includes("公司后台")));
  assert.ok(samples.every((sample) => !sample.includes("登录邮箱")));
  assert.ok(samples.every((sample) => !sample.includes("云控制台")));
  assert.match(htmlSource, /placeholder="描述准备交给 Claude Code 或 Codex 的任务"/);
  assert.match(appSource, /function getRandomSampleIndex/);
  assert.match(appSource, /Math\.random\(\) \* taskSamples\.length/);
  assert.match(appSource, /function applyTaskSample/);
  assert.match(appSource, /sampleBtn\.textContent = "换个案例"/);
  assert.doesNotMatch(appSource, /换个案例 \$\{sampleIndex/);
  assert.match(appSource, /function resetResultWorkspaceForSample/);
  assert.match(htmlSource, /class="risk-card pending" id="riskCard"[\s\S]*id="riskScore">待体检<\/div>/);
  assert.match(appSource, /riskScore\.textContent = "待体检"/);
  assert.match(appSource, /当前案例/);
  assert.match(appSource, /当前任务已更新/);
  assert.match(appSource, /resetResultWorkspaceForSample\(\{ isRandomSample: false \}\)/);
  assert.match(appSource, /resetResultWorkspaceForSample\(\{ isRandomSample: true \}\)/);
  assert.match(appSource, /applyTaskSample\(getRandomSampleIndex\(\)\)/);
  assert.doesNotMatch(appSource, /applyTaskSample\(getRandomSampleIndex\(\)\);\s*analyze\(\)/);
});

test("curated samples have prompt-shaped local inspection results", () => {
  assert.match(appSource, /const curatedSampleResults = new Map/);
  for (const index of [0, 1, 2, 3, 4]) {
    assert.match(appSource, new RegExp(`taskSamples\\[${index}\\]`));
  }
  for (const field of [
    "riskLevel",
    "riskReason",
    "claudeNotes",
    "codexNotes",
    "permissions",
    "approvals",
    "workPolicy",
    "sandboxRules",
    "hooks",
  ]) {
    assert.match(appSource, new RegExp(`${field}:`));
  }
  assert.match(appSource, /function getCuratedSampleResult/);
  assert.match(appSource, /function applyCuratedInspectionResult/);
  assert.match(appSource, /const curatedResult = getCuratedSampleResult\(text\)/);
  assert.match(appSource, /applyCuratedInspectionResult\(curatedResult\)/);
  assert.match(appSource, /policyBadge\.textContent = "精选版"/);
  assert.match(appSource, /已按精选案例生成本地体检结果/);
});

test("AI inspection waits for model output instead of rendering curated samples first", () => {
  const source = extractFunctionSource("runAiAnalysis");

  assert.match(source, /const fallbackResult = buildKeywordInspectionResult\(input\.value\.trim\(\)\)/);
  assert.match(source, /setAiAnalysisPendingState\(baseUrl\)/);
  assert.match(source, /applyAiEnhancement\(output, fallbackResult\)/);
  assert.match(source, /applyKeywordInspectionResult\(fallbackResult\)/);
  assert.doesNotMatch(source, /analyze\(\)/);
  assert.doesNotMatch(source, /getCuratedSampleResult/);
  assert.match(appSource, /function buildKeywordInspectionResult/);
});

test("curated samples stay aligned with current generated guard coverage", () => {
  const curatedSource = extractCuratedSampleResultsSource();
  for (const phrase of [
    "git commit 走确认",
    "gh pr create/merge/edit/close",
    "git tag",
    "依赖安装",
    "浏览器登录、填表、购买、提交或删除类交互",
    "pg_dump/mysqldump/mongoexport",
    "delete/update/insert/alter",
    "aws s3、gsutil、rclone、mail/sendmail",
    "helm、journalctl、pm2、supervisorctl、ansible-playbook",
  ]) {
    assert.match(curatedSource, new RegExp(escapeRegex(phrase)));
  }
});

test("Claude and Codex notes live in install button hover popovers", () => {
  assert.match(htmlSource, /id="claudeInstallInfo"[\s\S]*id="claudeNotes"/);
  assert.match(htmlSource, /id="codexInstallInfo"[\s\S]*id="codexNotes"/);
  assert.match(htmlSource, /aria-describedby="claudeInstallInfo"/);
  assert.match(htmlSource, /aria-describedby="codexInstallInfo"/);
  assert.match(htmlSource, /复制 Claude Code 命令/);
  assert.match(htmlSource, /复制 Codex 命令/);
  assert.doesNotMatch(htmlSource, /复制 Claude Code 安装命令|复制 Codex 安装命令/);
  assert.match(cssSource, /width:\s*min\(560px/);
  assert.match(cssSource, /overflow:\s*visible/);
  assert.match(cssSource, /\.install-action:hover::after/);
  assert.doesNotMatch(cssSource, /max-height:\s*min\(360px/);
  assert.doesNotMatch(htmlSource, /data-tab="claude"/);
  assert.doesNotMatch(htmlSource, /data-tab="codex"/);
});

test("left column keeps expanded task input and poster risk card", () => {
  assert.match(cssSource, /\.task-panel\s*\{[\s\S]*flex:\s*1 1 300px/);
  assert.match(cssSource, /#taskInput\s*\{[\s\S]*min-height:\s*184px/);
  assert.match(cssSource, /\.workspace \.risk-card\s*\{[\s\S]*flex:\s*0 0 176px/);
  assert.match(cssSource, /\.workspace \.risk-card\s*\{[\s\S]*flex-direction:\s*column/);
  assert.match(cssSource, /\.workspace \.risk-card\s*\{[\s\S]*justify-content:\s*center/);
  assert.match(cssSource, /\.workspace \.risk-card\s*\{[\s\S]*min-height:\s*148px/);
  assert.doesNotMatch(cssSource, /\.workspace \.risk-card\s*\{[\s\S]*grid-template-columns:\s*minmax\(112px, auto\) minmax\(0, 1fr\)/);
});

test("framed surfaces use shared balanced spacing tokens", () => {
  assert.match(cssSource, /--surface-pad:\s*18px/);
  assert.match(cssSource, /--hero-pad:\s*24px/);
  assert.match(cssSource, /--field-pad:\s*16px/);
  assert.match(cssSource, /--panel:\s*#fffaf0/);
  assert.match(cssSource, /--card:\s*#fffaf0/);
  assert.match(cssSource, /--field:\s*#fffaf0/);
  assert.match(cssSource, /--pre:\s*#fffaf0/);

  assertRuleHas(".intro", "padding:\\s*var\\(--hero-pad\\)");
  assertRuleHas(".task-panel", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".api-panel", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".ai-dock", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".handoff-panel", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".workspace .risk-card", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".summary-tile", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".workbench", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".result-panel", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".copy-popover", "padding:\\s*var\\(--surface-pad\\)");
  assertRuleHas(".risk-card .label", "margin:\\s*0");
});

test("main panels use shared large shadows and regular buttons keep small shadows", () => {
  assert.match(cssSource, /--panel-shadow:\s*8px 8px 0 var\(--soft-shadow\)/);
  assert.match(cssSource, /--button-shadow:\s*4px 4px 0 var\(--soft-shadow\)/);
  assert.match(cssSource, /body\[data-theme="dark"\]\s*\{[\s\S]*--soft-shadow:\s*#000000/);
  assert.match(cssSource, /body\[data-theme="dark"\]\s*\{[\s\S]*--panel-shadow:\s*8px 8px 0 #000000/);
  assert.match(cssSource, /body\[data-theme="dark"\]\s*\{[\s\S]*--float-shadow:\s*6px 6px 0 #000000/);
  assert.match(cssSource, /body\[data-theme="dark"\]\s*\{[\s\S]*--button-shadow:\s*4px 4px 0 #000000/);
  assertRuleHas(".intro", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas(".task-panel", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas(".api-panel", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas(".ai-dock", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas(".handoff-panel", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas(".workspace .risk-card", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas(".summary-tile", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas(".summary-tile:hover", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas(".workbench", "box-shadow:\\s*var\\(--panel-shadow\\)");
  assertRuleHas("button", "box-shadow:\\s*var\\(--button-shadow\\)");
  assertRuleHas("button:hover", "box-shadow:\\s*var\\(--button-shadow-hover\\)");
});

test("theme preference follows system until the user explicitly toggles", () => {
  assert.match(htmlSource, /id="themeToggleBtn"[\s\S]*>深色<\/button>/);
  assert.match(appSource, /const themePreferenceKey = "agent-checker-theme"/);
  assert.match(appSource, /const themePreferences = \["light", "dark"\]/);
  assert.match(appSource, /prefers-color-scheme: dark/);
  assert.match(appSource, /function readThemePreference/);
  assert.match(appSource, /if \(storedPreference && !normalizedPreference\) localStorage\.removeItem\(themePreferenceKey\)/);
  assert.match(appSource, /function applyThemePreference/);
  assert.match(appSource, /localStorage\.setItem\(themePreferenceKey, nextPreference\)/);
  assert.match(appSource, /themeToggleBtn\.textContent = nextLabel/);
  assert.match(appSource, /applyThemePreference\(nextTheme, \{ persist: true \}\)/);
  assert.match(appSource, /applyThemePreference\(readThemePreference\(\), \{ persist: false \}\)/);
  assert.match(appSource, /if \(!readThemePreference\(\)\)/);
  assert.match(appSource, /systemThemeQuery\.addEventListener\("change", refreshSystemTheme\)/);
});

test("shared policy copy is centralized and Codex install summary mentions rules", () => {
  assert.match(appSource, /const BASE_WORK_POLICY/);
  assert.match(appSource, /const DELIVERY_CHECKLIST/);
  assert.match(appSource, /\.codex\/rules\/agent_onboarding\.rules/);
  assert.match(appSource, /buildToolPolicyBrief[\s\S]*BASE_WORK_POLICY/);
  assert.match(appSource, /buildToolPolicyBrief[\s\S]*DELIVERY_CHECKLIST/);
});

test("Claude settings enable real Claude Code sandbox controls", () => {
  const source = extractFunctionSource("buildClaudeSettings");

  assert.match(source, /defaultMode/);
  assert.match(source, /disableBypassPermissionsMode/);
  assert.match(source, /sandbox/);
  assert.match(source, /enabled/);
  assert.match(source, /failIfUnavailable/);
  assert.match(source, /allowUnsandboxedCommands/);
  assert.match(source, /filesystem/);
  assert.match(source, /allowRead/);
  assert.match(source, /denyRead/);
  assert.match(source, /network/);
  assert.match(source, /allowedDomains/);
  assert.match(source, /WebFetch/);
  assert.match(source, /Edit\(.*\.env/);
  assert.match(source, /Write\(.*\.env/);
  assert.match(source, /MultiEdit\(.*\.env/);
  assert.match(source, /UserPromptSubmit/);
});

test("Claude guard hook handles non-Bash tools and sandbox escape attempts", () => {
  const source = extractFunctionSource("buildGuardHookScript");

  assert.match(source, /hook_event_name/);
  assert.match(source, /serialized_input/);
  assert.match(source, /WebFetch/);
  assert.match(source, /dangerouslyDisableSandbox/);
  assert.match(source, /--dangerously-skip-permissions/);
  assert.match(source, /secret_value_patterns/);
  assert.match(source, /UserPromptSubmit/);
  assert.match(source, /decision.*block/s);
  assert.match(source, /permissionDecision/);
  assert.match(source, /ask/);
  assert.match(source, /deny/);
});

test("Claude settings cover approval, prompt expansion, web search, and hook egress hardening", () => {
  const settingsSource = extractFunctionSource("buildClaudeSettings");
  const hookSource = extractFunctionSource("buildGuardHookScript");

  assert.match(settingsSource, /PermissionRequest/);
  assert.match(settingsSource, /UserPromptExpansion/);
  assert.match(settingsSource, /WebSearch/);
  assert.match(settingsSource, /Glob/);
  assert.match(settingsSource, /Grep/);
  assert.match(settingsSource, /allowedHttpHookUrls/);
  assert.match(settingsSource, /httpHookAllowedEnvVars/);
  assert.match(settingsSource, /skipWebFetchPreflight/);
  assert.equal(settingsSource.includes("Edit(./.claude/settings.json)"), true);
  assert.equal(settingsSource.includes("Write(./.claude/hooks/**)"), true);
  assert.match(hookSource, /emit_permission_deny/);
  assert.match(hookSource, /UserPromptExpansion/);
  assert.match(hookSource, /Glob/);
  assert.match(hookSource, /Grep/);
  assert.match(hookSource, /WebSearch/);
  assert.match(hookSource, /protected_config_write_patterns/);
});

test("Claude hooks use a shell wrapper instead of a bare project-dir placeholder command", () => {
  const settingsSource = extractFunctionSource("buildClaudeSettings");

  assert.match(settingsSource, /function claudeGuardHook/);
  assert.match(settingsSource, /command:\s*"bash"/);
  assert.match(settingsSource, /args:\s*\[/);
  assert.match(settingsSource, /CLAUDE_PROJECT_DIR/);
  assert.match(settingsSource, /git rev-parse --show-toplevel/);
  assert.match(settingsSource, /agent-guard\.sh/);
  assert.doesNotMatch(settingsSource, /command:\s*"\$\{CLAUDE_PROJECT_DIR\}\/\.claude\/hooks\/agent-guard\.sh"/);
});

test("Claude settings mirror generated high-risk command boundaries", () => {
  const settingsSource = extractFunctionSource("buildClaudeSettings");
  for (const rule of [
    "Bash(git tag*)",
    "Bash(gh pr create*)",
    "Bash(gh pr merge*)",
    "Bash(gh release*)",
    "Bash(ssh *)",
    "Bash(systemctl *)",
    "Bash(kubectl *)",
    "Bash(pg_dump *)",
    "Bash(mysqldump *)",
    "Bash(aws s3 cp *)",
    "Bash(mail *)",
    "Bash(git commit*)",
    "Bash(npm install*)",
    "Bash(pnpm add*)",
    "Bash(sqlite3 *)",
  ]) {
    assert.match(settingsSource, new RegExp(escapeRegex(rule)));
  }
});

test("Claude guard hook blocks production server operations", () => {
  const hookSource = extractFunctionSource("buildGuardHookScript");

  for (const command of [
    "ssh",
    "systemctl",
    "service",
    "docker",
    "kubectl",
    "helm",
    "journalctl",
    "pm2",
    "supervisorctl",
    "terraform",
    "ansible",
    "ansible-playbook",
  ]) {
    assert.match(hookSource, new RegExp(command));
  }

  assert.match(hookSource, /rollout\s*\|/);
  assert.match(hookSource, /rollback\s*\|/);
  assert.match(hookSource, /restart\s*\|/);
});

test("Claude guard hook covers code, database, and browser case boundaries", () => {
  const hookSource = extractFunctionSource("buildGuardHookScript");

  for (const pattern of [
    /git\\s\+commit/,
    /gh\\s\+/,
    /create\|merge\|edit\|close/,
    /release/,
    /npm/,
    /pnpm/,
    /yarn/,
    /bun/,
    /pip3/,
    /uv/,
    /poetry/,
    /install\|i\|add/,
    /pg_dump/,
    /mysqldump/,
    /mongoexport/,
    /delete\\s\+from/,
    /update\\s\+\\w\+\\s\+set/,
    /insert\\s\+into/,
    /alter\\s\+table/,
    /aws\\s\+s3/,
    /gsutil\\s\+/,
    /rclone\\s\+/,
    /cp\|sync/,
    /copy\|sync/,
    /sendmail/,
    /browser_interaction_patterns/,
  ]) {
    assert.match(hookSource, pattern);
  }
});

test("Claude guard hook blocks sensitive directories and control-directory writes at runtime", () => {
  for (const [tool, toolInput] of [
    ["Read", { file_path: "./secrets/config.yaml" }],
    ["Read", { file_path: "./app/secrets/key.pem" }],
    ["Read", { file_path: "~/.ssh/config" }],
    ["Bash", { command: "echo test > .claude/hooks/test.sh" }],
    ["Bash", { command: "mkdir -p .git/objects" }],
  ]) {
    const output = runClaudeGuardHook({
      hook_event_name: "PreToolUse",
      tool_name: tool,
      tool_input: toolInput,
    });

    assert.equal(hookDecision(output), "deny", `${tool} ${JSON.stringify(toolInput)} should be denied`);
  }
});

test("Claude guard hook allows the platform temp directory after realpath normalization", () => {
  const output = runClaudeGuardHook({
    hook_event_name: "PreToolUse",
    tool_name: "Read",
    tool_input: { file_path: join(tmpdir(), "agent-onboarding-ok.txt") },
  });

  assert.equal(hookDecision(output), "");
});

test("Claude guard hook allows slash tmp after macOS realpath normalization", () => {
  const output = runClaudeGuardHook({
    hook_event_name: "PreToolUse",
    tool_name: "Read",
    tool_input: { file_path: "/tmp/agent-onboarding-ok.txt" },
  });

  assert.equal(hookDecision(output), "");
});

test("Claude guard hook blocks inline database password arguments", () => {
  const output = runClaudeGuardHook({
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: { command: "mysql -u root -pMySecretPass123456 app" },
  });

  assert.equal(hookDecision(output), "deny");
});

test("Claude guard hook denies persistent permission requests for cautionary Bash commands", () => {
  const output = runClaudeGuardHook({
    hook_event_name: "PermissionRequest",
    tool_name: "Bash",
    tool_input: { command: "curl https://example.com" },
  });

  assert.equal(hookDecision(output), "deny");
});

test("Claude guard hook does not apply browser interaction patterns to ordinary Bash commands", () => {
  const output = runClaudeGuardHook({
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    tool_input: { command: "git checkout -b feature/test" },
  });

  assert.equal(hookDecision(output), "");
});

test("project instructions are tool-specific instead of mixing Claude and Codex rules", () => {
  const claudeSource = extractFunctionSource("buildClaudeMdSection");
  const codexSource = extractFunctionSource("buildCodexAgentsSection");

  assert.match(appSource, /function buildClaudeSandboxRules/);
  assert.match(appSource, /function buildCodexSandboxRules/);
  assert.match(appSource, /function buildClaudeHookRules/);
  assert.match(appSource, /function buildCodexHookRules/);
  assert.match(claudeSource, /buildClaudeSandboxRules/);
  assert.match(claudeSource, /buildClaudeHookRules/);
  assert.match(codexSource, /buildCodexSandboxRules/);
  assert.match(codexSource, /buildCodexHookRules/);
});

test("project instruction markdown stays compact and removes repeated tool prefixes", () => {
  const claudeSource = extractFunctionSource("buildClaudeMdSection");
  const codexSource = extractFunctionSource("buildCodexAgentsSection");

  assert.match(appSource, /function buildProjectWorkPolicy/);
  assert.match(appSource, /function projectDocItems/);
  assert.doesNotMatch(claudeSource, /"### 当前任务"/);
  assert.doesNotMatch(claudeSource, /"### 风险判断"/);
  assert.doesNotMatch(codexSource, /"### 当前任务"/);
  assert.doesNotMatch(codexSource, /"### 风险判断"/);
  assert.match(claudeSource, /buildProjectWorkPolicy\(\)/);
  assert.match(codexSource, /buildProjectWorkPolicy\(\)/);
  assert.match(claudeSource, /markdownList\("生效边界"/);
  assert.match(codexSource, /markdownList\("生效边界"/);
  assert.match(claudeSource, /projectDocItems\(buildClaudeSandboxRules/);
  assert.match(claudeSource, /projectDocItems\(buildClaudeHookRules/);
  assert.match(codexSource, /projectDocItems\(buildCodexSandboxRules/);
  assert.match(codexSource, /projectDocItems\(buildCodexHookRules/);
  assert.match(claudeSource, /markdownList\("交付前自检", DELIVERY_CHECKLIST\)/);
  assert.match(codexSource, /markdownList\("交付前自检", DELIVERY_CHECKLIST\)/);
});

test("Codex config uses real sandbox, approval, permissions, and hooks keys", () => {
  assert.match(appSource, /function buildCodexConfigToml/);
  assert.match(appSource, /approval_policy = "on-request"/);
  assert.match(appSource, /sandbox_mode = "workspace-write"/);
  assert.match(appSource, /default_permissions = "agent_onboarding_guarded"/);
  assert.match(appSource, /\[sandbox_workspace_write\]/);
  assert.match(appSource, /network_access = false/);
  assert.match(appSource, /\[features\]/);
  assert.match(appSource, /hooks = true/);
  assert.match(appSource, /\[shell_environment_policy\]/);
  assert.match(appSource, /\[permissions\.agent_onboarding_guarded\.filesystem\.":project_roots"\]/);
  assert.match(appSource, /\[\[hooks\.PreToolUse\]\]/);
  assert.match(appSource, /\[\[hooks\.PermissionRequest\]\]/);
  assert.match(appSource, /\[\[hooks\.UserPromptSubmit\]\]/);
  assert.match(appSource, /\.codex\/hooks\/agent_guard\.py/);
  assert.match(appSource, /pwd -P/);
  assert.match(appSource, /while \[ "\$root" != "\/" \]/);
});

test("Codex config adds privacy, connector, filesystem, and command-rule hardening", () => {
  assert.match(appSource, /web_search = "disabled"/);
  assert.match(appSource, /\[history\]/);
  assert.match(appSource, /persistence = "none"/);
  assert.match(appSource, /\[otel\]/);
  assert.match(appSource, /log_user_prompt = false/);
  assert.match(appSource, /features\\.memories|memories = false/);
  assert.match(appSource, /plugin_hooks = false/);
  assert.match(appSource, /skill_mcp_dependency_install = false/);
  assert.match(appSource, /\[apps\."_default"\]/);
  assert.match(appSource, /destructive_enabled = false/);
  assert.match(appSource, /open_world_enabled = false/);
  assert.match(appSource, /default_tools_approval_mode = "prompt"/);
  assert.match(appSource, /glob_scan_max_depth = 3/);
  assert.match(appSource, /exclude_tmpdir_env_var = true/);
  assert.match(appSource, /exclude_slash_tmp = true/);
  assert.equal(appSource.includes('".codex/**" = "read"'), true);
  assert.equal(appSource.includes('".git/**" = "read"'), true);
  assert.match(appSource, /function buildCodexRulesFile/);
  assert.equal(appSource.includes("agent_onboarding.rules"), true);
  assert.match(appSource, /prefix_rule/);
});

test("Codex cloud-server guard blocks production server operations", () => {
  const rulesSource = extractFunctionSource("buildCodexRulesFile");
  const hookSource = extractFunctionSource("buildCodexGuardHookScript");

  for (const command of [
    "ssh",
    "systemctl",
    "service",
    "docker",
    "kubectl",
    "helm",
    "journalctl",
    "pm2",
    "supervisorctl",
    "terraform",
    "ansible",
    "ansible-playbook",
  ]) {
    assert.match(rulesSource, new RegExp(`["']${command}["']`));
    assert.match(hookSource, new RegExp(command));
  }

  assert.match(hookSource, /rollout\s*\|/);
  assert.match(hookSource, /rollback\s*\|/);
  assert.match(hookSource, /restart\s*\|/);
});

test("Codex guards cover code, database, browser, and egress case boundaries", () => {
  const rulesSource = extractFunctionSource("buildCodexRulesFile");
  const hookSource = extractFunctionSource("buildCodexGuardHookScript");

  for (const command of ["git", "gh", "npm", "pnpm", "yarn", "bun", "pip", "pip3", "uv", "poetry"]) {
    assert.match(rulesSource, new RegExp(`["']${command}["']`));
  }

  for (const command of ["pg_dump", "mysqldump", "mongoexport", "aws", "gsutil", "rclone", "mail", "sendmail", "sftp", "ftp"]) {
    assert.match(rulesSource, new RegExp(`["']${command}["']`));
    assert.match(hookSource, new RegExp(command));
  }

  for (const pattern of [
    /git\\s\+commit/,
    /gh\\s\+/,
    /create\|merge\|edit\|close/,
    /release/,
    /delete\\s\+from/,
    /update\\s\+\\w\+\\s\+set/,
    /insert\\s\+into/,
    /alter\\s\+table/,
    /risky_browser_words/,
    /browser_mutating_tools/,
  ]) {
    assert.match(hookSource, pattern);
  }
});

test("Codex guard hook does not rely on unsupported PreToolUse ask decisions", () => {
  const source = extractFunctionSource("buildCodexGuardHookScript");

  assert.match(source, /PermissionRequest/);
  assert.match(source, /UserPromptSubmit/);
  assert.match(source, /permissionDecision/);
  assert.match(source, /danger-full-access/);
  assert.match(source, /approval_policy/);
  assert.match(source, /decision.*block/s);
  assert.doesNotMatch(source, /permissionDecision['"]\s*:\s*['"]ask/);
});

test("Codex guard blocks bypass modes and side-effecting MCP tool calls", () => {
  const source = extractFunctionSource("buildCodexGuardHookScript");

  assert.match(source, /permission_mode/);
  assert.match(source, /bypassPermissions/);
  assert.match(source, /dontAsk/);
  assert.match(source, /side_effecting_mcp_patterns/);
  assert.match(source, /tool\.startswith\("mcp__"\)/);
});

test("Codex rules cover shell wrappers and document non-matches", () => {
  const rulesSource = extractFunctionSource("buildCodexRulesFile");

  assert.match(rulesSource, /\[\["bash", "sh", "zsh"/);
  assert.match(rulesSource, /\["-c", "-lc"\]/);
  assert.match(rulesSource, /Shell wrapper commands must be reviewed/);
  assert.match(rulesSource, /"-fr"/);
  assert.match(rulesSource, /"--recursive"/);
  assert.match(rulesSource, /Recursive deletion without force still needs review/);
  assert.match(rulesSource, /not_match =/);
  assert.match(rulesSource, /git status/);
  assert.match(rulesSource, /npm run build/);
});

test("Codex installer does not overwrite an existing unmarked config", () => {
  const setupSource = extractFunctionSource("buildCodexProjectSetupScript");

  assert.match(setupSource, /config\.toml\.onboarding/);
  assert.match(setupSource, /Existing \.codex\/config\.toml has no onboarding marker/);
  assert.match(setupSource, /MERGE_INSTRUCTIONS\.md/);
  assert.match(setupSource, /onboarding config is not active until merged/);
  assert.match(setupSource, /approval_policy, sandbox_mode, default_permissions/);
  assert.match(setupSource, /review and merge/);
});

test("Codex guard denies recursive deletion and destructive SQL at runtime", () => {
  for (const command of [
    "rm -rf build",
    "rm -fr build",
    "rm -r -f build",
    "rm --recursive --force build",
    "sqlite3 app.db 'DROP TABLE users'",
    "psql production -c 'TRUNCATE TABLE users'",
    "mysql production -e 'GRANT ALL ON app.* TO bad'",
  ]) {
    const output = runCodexGuardHook({
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      permission_mode: "default",
      tool_input: { command },
    });
    assert.equal(hookDecision(output), "deny", command);
  }
});

test("Codex guard allows prompt discussion and read-only config inspection", () => {
  const promptOutput = runCodexGuardHook({
    hook_event_name: "UserPromptSubmit",
    permission_mode: "default",
    prompt: "解释一下 git push origin main 会发生什么，不要执行",
  });
  assert.equal(hookDecision(promptOutput), "");

  const readOutput = runCodexGuardHook({
    hook_event_name: "PreToolUse",
    tool_name: "Bash",
    permission_mode: "default",
    tool_input: { command: "sed -n '1p' .codex/config.toml" },
  });
  assert.equal(hookDecision(readOutput), "");
});

test("Codex guard allows ordinary browser research but blocks risky browser actions", () => {
  for (const [tool, toolInput] of [
    ["mcp__browser__navigate", { url: "https://example.com/pricing" }],
    ["mcp__browser__click", { selector: "#pricing", text: "pricing" }],
  ]) {
    const output = runCodexGuardHook({
      hook_event_name: "PreToolUse",
      tool_name: tool,
      permission_mode: "default",
      tool_input: toolInput,
    });
    assert.equal(hookDecision(output), "", `${tool} ${JSON.stringify(toolInput)} should be allowed`);
  }

  for (const [tool, toolInput] of [
    ["mcp__browser__navigate", { url: "https://example.com/login" }],
    ["mcp__browser__click", { selector: "#delete-account", text: "delete account" }],
    ["mcp__browser__fill", { selector: "#email", text: "user@example.com" }],
  ]) {
    const output = runCodexGuardHook({
      hook_event_name: "PreToolUse",
      tool_name: tool,
      permission_mode: "default",
      tool_input: toolInput,
    });
    assert.equal(hookDecision(output), "deny", `${tool} ${JSON.stringify(toolInput)} should be denied`);
  }
});

test("Codex project docs do not strip possessive tool names", () => {
  const prefixSource = extractFunctionSource("removeToolNamePrefix");

  assert.match(appSource, /Codex 的 AGENTS\.md 只能描述调研边界/);
  assert.match(prefixSource, /\(\?!的\)/);
});
