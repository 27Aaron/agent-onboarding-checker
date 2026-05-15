const input = document.querySelector("#taskInput");
const analyzeBtn = document.querySelector("#analyzeBtn");
const sampleBtn = document.querySelector("#sampleBtn");
const riskCard = document.querySelector("#riskCard");
const riskScore = document.querySelector("#riskScore");
const riskReason = document.querySelector("#riskReason");
const permissions = document.querySelector("#permissions");
const approvals = document.querySelector("#approvals");
const permissionCount = document.querySelector("#permissionCount");
const approvalCount = document.querySelector("#approvalCount");
const permissionPreview = document.querySelector("#permissionPreview");
const approvalPreview = document.querySelector("#approvalPreview");
const handoffMode = document.querySelector("#handoffMode");
const handoffPermission = document.querySelector("#handoffPermission");
const handoffApproval = document.querySelector("#handoffApproval");
const handoffSandbox = document.querySelector("#handoffSandbox");
const brief = document.querySelector("#brief");
const policyBadge = document.querySelector("#policyBadge");
const claudeNotes = document.querySelector("#claudeNotes");
const codexNotes = document.querySelector("#codexNotes");
const sandboxRules = document.querySelector("#sandboxRules");
const sandboxLevel = document.querySelector("#sandboxLevel");
const hooks = document.querySelector("#hooks");
const hookCount = document.querySelector("#hookCount");
const promptInput = document.querySelector("#promptInput");
const providerSelect = document.querySelector("#providerSelect");
const providerTrigger = document.querySelector("#providerTrigger");
const providerTriggerText = document.querySelector("#providerTriggerText");
const providerMenu = document.querySelector("#providerMenu");
const baseUrlInput = document.querySelector("#baseUrlInput");
const providerBadge = document.querySelector("#providerBadge");
const dockModelBadge = document.querySelector("#dockModelBadge");
const settingsProviderBadge = document.querySelector("#settingsProviderBadge");
const apiKeyInput = document.querySelector("#apiKeyInput");
const modelInput = document.querySelector("#modelInput");
const modelMenu = document.querySelector("#modelMenu");
const modelMenuBtn = document.querySelector("#modelMenuBtn");
const modelHint = document.querySelector("#modelHint");
const fetchModelsBtn = document.querySelector("#fetchModelsBtn");
const testModelBtn = document.querySelector("#testModelBtn");
const testStatus = document.querySelector("#testStatus");
const copyPromptBtn = document.querySelector("#copyPromptBtn");
const settingsBtn = document.querySelector("#settingsBtn");
const closeSettingsBtn = document.querySelector("#closeSettingsBtn");
const saveSettingsBtn = document.querySelector("#saveSettingsBtn");
const settingsOverlay = document.querySelector("#settingsOverlay");
const themeToggleBtn = document.querySelector("#themeToggleBtn");
const apiStatus = document.querySelector("#apiStatus");
const resultTabs = [...document.querySelectorAll(".result-tab")];
const resultPanels = [...document.querySelectorAll(".result-panel")];
const summaryTiles = [...document.querySelectorAll("[data-open-tab]")];
const copyClaudeBtn = document.querySelector("#copyClaudeBtn");
const copyCodexBtn = document.querySelector("#copyCodexBtn");
let modelFetchTimer;
let modelTestTimer;
let availableModelIds = [];
let activeResultTab = "policy";
const apiKeyCachePrefix = "agent-checker-api-key:";
const themePreferenceKey = "agent-checker-theme";
const themePreferences = ["light", "dark"];
const systemThemeQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
const BASE_WORK_POLICY = [
  "默认使用沙箱环境，不直接触碰真实生产数据",
  "文件写入限制在任务目录或临时分支",
  "网络访问采用白名单或审批流程，新增域名必须确认",
];
const DELIVERY_CHECKLIST = [
  "说明改了什么、为什么改、影响哪些文件或数据",
  "给出可复现的测试或检查步骤",
  "不发送、不删除、不提交任何未经确认的结果",
];

const providers = [
  {
    id: "openai",
    group: "常规模型 API",
    name: "OpenAI 官方",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-5.4",
  },
  {
    id: "zhipu-cn",
    group: "常规模型 API",
    name: "智谱 GLM（国内）",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4.7",
  },
  {
    id: "zhipu-global",
    group: "常规模型 API",
    name: "智谱 GLM（海外）",
    baseUrl: "https://api.z.ai/api/paas/v4",
    model: "glm-4.7",
  },
  {
    id: "kimi",
    group: "常规模型 API",
    name: "Kimi（国内）",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "kimi-k2-0905-preview",
  },
  {
    id: "moonshot-global",
    group: "常规模型 API",
    name: "Moonshot（海外）",
    baseUrl: "https://api.moonshot.ai/v1",
    model: "kimi-k2-0905-preview",
  },
  {
    id: "minimax-cn",
    group: "常规模型 API",
    name: "MiniMax（国内）",
    baseUrl: "https://api.minimaxi.com/v1",
    model: "MiniMax-M2.1",
  },
  {
    id: "minimax-global",
    group: "常规模型 API",
    name: "MiniMax（海外）",
    baseUrl: "https://api.minimax.io/v1",
    model: "MiniMax-M2.1",
  },
  {
    id: "volcengine-ark",
    group: "常规模型 API",
    name: "火山引擎方舟（豆包）",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    model: "doubao-seed-1-6-250615",
  },
  {
    id: "mimo",
    group: "常规模型 API",
    name: "小米 MiMo",
    baseUrl: "https://api.xiaomimimo.com/v1",
    model: "mimo-v2-pro",
    auth: "both",
  },
  {
    id: "dashscope",
    group: "常规模型 API",
    name: "阿里云百炼（通义）",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
  },
  {
    id: "openrouter",
    group: "常规模型 API",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-5.4",
  },
  {
    id: "zhipu-coding-cn",
    group: "Coding Plan",
    name: "智谱 Coding Plan（国内）",
    baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4",
    model: "",
  },
  {
    id: "zhipu-coding-global",
    group: "Coding Plan",
    name: "智谱 Coding Plan（海外）",
    baseUrl: "https://z.ai/api/coding/paas/v4",
    model: "",
  },
  {
    id: "mimo-coding",
    group: "Coding Plan",
    name: "小米 MiMo Coding Plan",
    baseUrl: "https://token-plan-cn.xiaomimimo.com/v1",
    model: "",
    auth: "both",
  },
  {
    id: "custom",
    group: "自定义",
    name: "自定义",
    baseUrl: "",
    model: "",
  },
];

const SYSTEM_PROMPT = `你是一名 Claude Code / Codex 安全入职官。请用中文分析用户准备交给这两个编码 Agent 的任务，把建议写成可以直接放进产品界面的结构化结果。

请只输出 JSON，不要 Markdown，不要代码块，不要额外解释。JSON 结构如下：

{
  "riskLevel": "低风险 / 中风险 / 高风险 三选一",
  "riskReason": "一句话说明为什么这样判定风险",
  "claudeNotes": [
    "指出 Claude Code 里哪些会真正生效、哪些只是 CLAUDE.md 提醒，3-5 条"
  ],
  "codexNotes": [
    "指出 Codex 里哪些会真正生效、哪些只是 AGENTS.md 指令，3-5 条"
  ],
  "permissions": [
    "Claude Code / Codex 应该拿到的临时权限，3-5 条，越具体越好"
  ],
  "approvals": [
    "必须暂停并请求人类确认的动作，3-5 条，越具体越好"
  ],
  "workPolicy": [
    "写给 Claude Code / Codex 的工作制度，5-7 条，每条必须是可执行的制度"
  ],
  "sandboxRules": [
    "沙箱配置建议，4-6 条，每条要说明限制、记录或回滚边界"
  ],
  "hooks": [
    "hook-name：触发条件 -> 暂停、记录、阻断或要求确认的动作"
  ]
}

要求：
- 只针对 Claude Code 和 Codex，不要扩展到其他编码工具
- 准确区分 Claude Code 的 CLAUDE.md、.claude/settings.json、permissions、PreToolUse hooks、sandbox
- 准确区分 Codex 的 AGENTS.md、.codex/config.toml、sandbox_mode、approval_policy、default_permissions、hooks 和项目 trust
- Codex 的 PreToolUse 只能可靠 deny 或补充上下文，不要声称 permissionDecision: ask 会拦住工具；需要人工确认时依赖 approval_policy = on-request 或 PermissionRequest
- 不要声称自动脱敏、日志保留、回滚快照、外部发送审批已经实现；除非明确说明需要另接系统
- 不要建议用户把真实密钥、cookie、隐私数据直接交给 Claude Code 或 Codex
- 不要鼓励绕过审批、删除日志、隐藏操作记录
- 不要写“加强安全意识”这类空话，要写具体规则
- permissions 和 approvals 不能照抄本地规则，要结合任务改写
- 普通人要能看懂，但技术部分必须准确
- 可以吸收本地规则，但不要机械重复`;

const rules = [
  {
    keys: ["登录", "账号", "后台", "cookie", "密码", "token"],
    permission: "临时账号权限，只允许访问任务相关页面",
    approval: "任何登录、授权、读取 cookie 或 token 的动作",
    weight: 3,
  },
  {
    keys: ["客户", "用户", "订单", "隐私", "数据", "表格"],
    permission: "只读数据权限，默认隐藏敏感字段",
    approval: "导出、复制或汇总包含个人信息的数据",
    weight: 3,
  },
  {
    keys: ["发送", "发给", "群", "邮件", "发布", "提交", "push"],
    permission: "外部发送权限默认关闭",
    approval: "向外部系统发送消息、邮件、文件或提交代码",
    weight: 4,
  },
  {
    keys: ["删除", "清空", "覆盖", "重置", "rm", "drop"],
    permission: "破坏性操作必须进入沙箱",
    approval: "删除、覆盖、重置、清空这类不可逆动作",
    weight: 4,
  },
  {
    keys: ["改代码", "修 bug", "运行测试", "PR", "代码", "仓库"],
    permission: "仓库写权限限制在工作分支",
    approval: "提交 PR、修改测试、触碰配置和密钥文件",
    weight: 2,
  },
  {
    keys: ["浏览器", "网页", "点击", "表单", "下载"],
    permission: "浏览器沙箱，只允许访问白名单网站",
    approval: "点击付款、确认、删除、提交表单等关键按钮",
    weight: 2,
  },
];

const taskSamples = [
  "帮我登录公司后台，导出本月客户数据，整理成表格，再发给销售群。",
  "帮我修复这个仓库里的登录 bug，允许运行测试和改代码，但不要修改 .env，不要直接 git push。",
  "帮我打开竞品官网和定价页，截图记录差异，整理成一份产品对比文档。",
  "帮我登录邮箱，筛选最近一周的客户投诉邮件，汇总高频问题并草拟回复。",
  "帮我读取这份订单表格，找出退款率异常的客户和产品，生成一份内部分析报告。",
  "帮我把会议录音整理成纪要，更新到飞书文档，并发到项目群里。",
  "帮我清理项目文件夹，删除重复截图和过期导出文件，只保留最新版本。",
  "帮我修改网站首页文案，跑完测试后提交 PR，但不要碰支付和登录相关代码。",
  "帮我进入云控制台查看线上日志，定位 500 报错原因，并给出回滚建议。",
  "帮我抓取今天 X、Reddit 和即刻上关于 AI Agent 的热门讨论，写成公众号选题备忘。",
  "帮我连接数据库导出流失用户名单，按城市和付费档位分组，发给运营同事。",
  "帮我检查 CI 配置，修掉构建失败的问题，并把变更说明写进 PR 描述。",
];
let sampleIndex = 0;

promptInput.value = SYSTEM_PROMPT;

function compactProviderName(name) {
  return name.replace(" 官方", "");
}

function hasModelConfig() {
  return Boolean(apiKeyInput.value.trim() && baseUrlInput.value.trim() && modelInput.value.trim());
}

function updatePrimaryButtonLabel() {
  analyzeBtn.textContent = hasModelConfig() ? "AI 深度体检" : "体检任务";
}

function updateSampleButtonLabel() {
  sampleBtn.textContent = `换个案例 ${sampleIndex + 1}/${taskSamples.length}`;
}

function getApiKeyCacheKey(providerId) {
  return `${apiKeyCachePrefix}${providerId}`;
}

function readCachedApiKey(providerId) {
  return localStorage.getItem(getApiKeyCacheKey(providerId)) || "";
}

function cacheApiKey(providerId, apiKey = apiKeyInput.value.trim()) {
  if (!providerId) return;
  if (apiKey) {
    localStorage.setItem(getApiKeyCacheKey(providerId), apiKey);
    return;
  }
  localStorage.removeItem(getApiKeyCacheKey(providerId));
}

function updateProviderBadges(suffix = "") {
  const provider = getProvider();
  const providerName = compactProviderName(provider.name);
  const model = modelInput.value.trim() || "未选模型";
  const isConfigured = hasModelConfig();
  providerBadge.textContent = isConfigured ? providerName : "本地规则";
  dockModelBadge.hidden = !isConfigured;
  dockModelBadge.textContent = isConfigured ? `${model}${suffix}` : "";
  settingsProviderBadge.textContent = providerName;
  updatePrimaryButtonLabel();
}

function openSettings(focusNode) {
  settingsOverlay.hidden = false;
  document.body.classList.add("settings-open");
  window.setTimeout(() => (focusNode || providerTrigger).focus(), 0);
}

function closeSettings() {
  hideProviderMenu();
  hideModelMenu();
  settingsOverlay.hidden = true;
  document.body.classList.remove("settings-open");
  settingsBtn.focus();
}

function normalizeThemePreference(preference) {
  return themePreferences.includes(preference) ? preference : "";
}

function readThemePreference() {
  const storedPreference = localStorage.getItem(themePreferenceKey);
  const normalizedPreference = normalizeThemePreference(storedPreference);
  if (storedPreference && !normalizedPreference) localStorage.removeItem(themePreferenceKey);
  return normalizedPreference;
}

function getSystemTheme() {
  return systemThemeQuery?.matches ? "dark" : "light";
}

function resolveTheme(preference) {
  const normalizedPreference = normalizeThemePreference(preference);
  return normalizedPreference || getSystemTheme();
}

function getNextTheme(theme) {
  return theme === "dark" ? "light" : "dark";
}

function getThemeLabel(theme) {
  return theme === "dark" ? "深色" : "浅色";
}

function applyThemePreference(preference = readThemePreference(), { persist = false } = {}) {
  const nextPreference = normalizeThemePreference(preference);
  const resolvedTheme = resolveTheme(nextPreference);
  const nextTheme = getNextTheme(resolvedTheme);
  const resolvedLabel = getThemeLabel(resolvedTheme);
  const nextLabel = getThemeLabel(nextTheme);
  document.body.dataset.theme = resolvedTheme;
  if (nextPreference) {
    document.body.dataset.themePreference = nextPreference;
  } else {
    delete document.body.dataset.themePreference;
  }
  themeToggleBtn.textContent = nextLabel;
  themeToggleBtn.title =
    nextPreference
      ? `当前固定为${resolvedLabel}模式。点击切换为${nextLabel}模式。`
      : `当前跟随系统显示${resolvedLabel}模式。点击切换为${nextLabel}模式并记住偏好。`;
  themeToggleBtn.setAttribute("aria-label", `切换到${nextLabel}模式`);
  if (persist && nextPreference) localStorage.setItem(themePreferenceKey, nextPreference);
}

function renderProviders() {
  providerSelect.innerHTML = "";
  const groups = new Map();
  providers.forEach((provider) => {
    const option = document.createElement("option");
    option.value = provider.id;
    option.textContent = provider.name;
    if (provider.group === "自定义") {
      providerSelect.appendChild(option);
      return;
    }
    if (!groups.has(provider.group)) {
      const group = document.createElement("optgroup");
      group.label = provider.group;
      groups.set(provider.group, group);
      providerSelect.appendChild(group);
    }
    groups.get(provider.group).appendChild(option);
  });
  renderProviderMenu();
  applyProvider("openai");
}

function getProvider() {
  return providers.find((provider) => provider.id === providerSelect.value) || providers[0];
}

function applyProvider(providerId) {
  const provider = providers.find((item) => item.id === providerId) || providers[0];
  const previousProviderId = providerSelect.value;
  if (previousProviderId && previousProviderId !== provider.id) {
    cacheApiKey(previousProviderId);
  }
  providerSelect.value = provider.id;
  baseUrlInput.value = provider.baseUrl;
  modelInput.value = provider.model;
  apiKeyInput.value = readCachedApiKey(provider.id);
  resetTestFeedback({ autoDetect: true });
  updateProviderTrigger();
  updateProviderBadges();
  clearModelOptions();
  if (provider.id === "custom") {
    apiStatus.textContent = "当前仍使用本地策略。自定义模式下填 Base URL、API Key 和模型名后可接入模型。";
    baseUrlInput.focus();
    return;
  }
  apiStatus.textContent = apiKeyInput.value.trim()
    ? "已选择服务商，正在准备模型列表。"
    : "未使用模型 API，当前由本地关键词策略完成体检。";
  scheduleModelFetch();
}

function clearModelOptions(message = "填完 API Key 后会自动获取模型列表；点箭头可展开，或者直接手动填写模型名。") {
  availableModelIds = [];
  renderModelMenu();
  hideModelMenu();
  modelHint.textContent = message;
}

function normalizeBaseUrl(value) {
  return value
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/(?:chat\/completions|responses|models)$/i, "");
}

function buildAuthHeaders(apiKey, provider = getProvider()) {
  const headers = {};
  if (!apiKey) return headers;
  headers.Authorization = `Bearer ${apiKey}`;
  if (provider.auth === "both") headers["api-key"] = apiKey;
  return headers;
}

function isBrowserRequestBlocked(error) {
  return error instanceof TypeError && /failed to fetch|load failed|networkerror/i.test(error.message || "");
}

function formatRequestError(error, baseUrl = "") {
  if (isBrowserRequestBlocked(error)) {
    const target = baseUrl ? `（${baseUrl}）` : "";
    return `浏览器没有拿到接口响应${target}，通常是服务商不允许静态网页直连，或被 CORS、网络策略、证书拦截。`;
  }
  return error.message || "未知错误";
}

function sentenceEnd(text) {
  return /[。！？.!?]$/.test(text) ? text : `${text}。`;
}

function buildAiRequestFailureMessage(error, baseUrl) {
  if (isBrowserRequestBlocked(error)) {
    return `${formatRequestError(error, baseUrl)}已保留本地规则建议。`;
  }

  return `AI 请求失败：${sentenceEnd(formatRequestError(error, baseUrl))}已保留本地规则建议。`;
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function uniq(items) {
  return [...new Set(items)];
}

function renderList(node, items) {
  node.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    node.appendChild(li);
  });
}

function getPanelItems(node) {
  return [...node.querySelectorAll("li")].map((li) => li.textContent.trim()).filter(Boolean);
}

function summarizeItem(items, fallback) {
  return items[0] || fallback;
}

function updateSummaryPreviews(permissionItems, approvalItems) {
  permissionPreview.textContent = summarizeItem(permissionItems, "只读资料权限，记录完整操作日志");
  approvalPreview.textContent = summarizeItem(approvalItems, "访问新网站或要求额外权限时停下来问人");
}

function updateHandoffSummary(source, permissionTotal, approvalTotal, sandboxLabel) {
  handoffMode.textContent = source;
  handoffPermission.textContent = `${permissionTotal} 项权限`;
  handoffApproval.textContent = `${approvalTotal} 个确认点`;
  handoffSandbox.textContent = sandboxLabel;
}

function setActiveResultTab(tab) {
  activeResultTab = tab;
  resultTabs.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.setAttribute("aria-selected", String(isActive));
  });
  resultPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab;
  });
}

function normalizeRiskLevel(value) {
  const text = String(value || "");
  if (text.includes("高")) return "高风险";
  if (text.includes("中")) return "中风险";
  if (text.includes("低")) return "低风险";
  return "";
}

function sandboxModeForRisk(level) {
  return level === "高风险" ? "Strict" : level === "中风险" ? "Guarded" : "Light";
}

function applyRiskResult(level, reason) {
  const normalizedLevel = normalizeRiskLevel(level) || "低风险";
  riskCard.className = `risk-card ${normalizedLevel === "低风险" ? "low" : normalizedLevel === "中风险" ? "medium" : ""}`;
  riskScore.textContent = normalizedLevel;
  riskReason.textContent = reason || "这个任务适合 Claude Code / Codex 自主处理，保留日志和只读边界即可。";
}

function toList(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(/\n+/);
  return source
    .map((item) => String(item).replace(/^\s*(?:[-*•]|\d+[.、)]|\[[^\]]+\])\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function extractJsonObject(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(fenced);
  } catch {
    const start = fenced.indexOf("{");
    const end = fenced.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(fenced.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function parseAiEnhancement(output) {
  const data = extractJsonObject(output);
  if (!data) {
    return {
      rawText: String(output || "").trim(),
      riskLevel: "",
      riskReason: "",
      claudeNotes: [],
      codexNotes: [],
      permissions: [],
      approvals: [],
      workPolicy: [],
      sandboxRules: [],
      hooks: [],
    };
  }

  return {
    rawText: String(output || "").trim(),
    riskLevel: normalizeRiskLevel(data.riskLevel || data.level || data.risk),
    riskReason: String(data.riskReason || data.reason || data.summary || "").trim(),
    claudeNotes: toList(data.claudeNotes || data.claudeCodeNotes || data.effectiveControls),
    codexNotes: toList(data.codexNotes || data.codexCodeNotes || data.codexControls),
    permissions: toList(data.permissions || data.permissionItems || data.accessRules),
    approvals: toList(data.approvals || data.approvalItems || data.confirmations),
    workPolicy: toList(data.workPolicy || data.policy || data.agentPolicy || data.brief),
    sandboxRules: toList(data.sandboxRules || data.sandbox || data.sandboxSuggestions),
    hooks: toList(data.hooks || data.hookRules || data.guardHooks),
  };
}

function formatPolicyBrief({ title, task, level, reason, workPolicy, approvals = [], checklist = [], rawText = "" }) {
  const lines = [title, "", `任务：${task || "未填写任务"}`, `风险等级：${level}`];
  if (reason) lines.push(`判断：${reason}`);

  if (workPolicy.length) {
    lines.push("", "工作制度", ...workPolicy.map((item) => `- ${item}`));
  }

  if (approvals.length) {
    lines.push("", "必须暂停并请求人类确认", ...approvals.map((item) => `- ${item}`));
  }

  if (checklist.length) {
    lines.push("", "交付前自检", ...checklist.map((item) => `- ${item}`));
  }

  if (rawText) {
    lines.push("", "AI 补充判断", rawText);
  }

  return lines.join("\n");
}

function applyAiEnhancement(output) {
  const enhancement = parseAiEnhancement(output);
  const task = input.value.trim() || "未填写任务";
  const level = enhancement.riskLevel || riskScore.textContent;
  const reason = enhancement.riskReason || riskReason.textContent;
  const finalPermissions = enhancement.permissions.length ? enhancement.permissions : getPanelItems(permissions);
  const finalApprovals = enhancement.approvals.length ? enhancement.approvals : getPanelItems(approvals);
  const hasStructuredPolicy = enhancement.workPolicy.length > 0;
  const hasStructuredContent =
    hasStructuredPolicy ||
    enhancement.claudeNotes.length > 0 ||
    enhancement.codexNotes.length > 0 ||
    enhancement.permissions.length > 0 ||
    enhancement.approvals.length > 0 ||
    enhancement.sandboxRules.length > 0 ||
    enhancement.hooks.length > 0;

  applyRiskResult(level, reason);
  renderList(permissions, finalPermissions);
  renderList(approvals, finalApprovals);
  renderList(claudeNotes, enhancement.claudeNotes.length ? enhancement.claudeNotes : buildClaudeCodeNotes(level, task));
  renderList(codexNotes, enhancement.codexNotes.length ? enhancement.codexNotes : buildCodexNotes(level, task));
  permissionCount.textContent = `${finalPermissions.length} 项`;
  approvalCount.textContent = `${finalApprovals.length} 项`;
  updateSummaryPreviews(finalPermissions, finalApprovals);

  brief.textContent = formatPolicyBrief({
    title: hasStructuredContent ? "Claude Code / Codex 工作制度" : "AI 补充后的 Claude Code / Codex 工作制度",
    task,
    level,
    reason,
    workPolicy: enhancement.workPolicy,
    approvals: finalApprovals,
    rawText: hasStructuredPolicy ? "" : enhancement.rawText,
  });
  policyBadge.textContent = hasStructuredContent ? "AI 写入" : "AI 原文";

  if (enhancement.sandboxRules.length) {
    renderList(sandboxRules, enhancement.sandboxRules);
    sandboxLevel.textContent = `AI · ${sandboxModeForRisk(level)}`;
  } else {
    sandboxLevel.textContent = `${sandboxModeForRisk(level)} · 本地`;
  }

  if (enhancement.hooks.length) {
    renderList(hooks, enhancement.hooks);
    hookCount.textContent = `${enhancement.hooks.length} 个`;
  }

  updateHandoffSummary("AI 写入", finalPermissions.length, finalApprovals.length, sandboxLevel.textContent);

  return hasStructuredContent;
}

function analyze() {
  const text = input.value.trim();
  const matched = rules.filter((rule) => rule.keys.some((key) => text.includes(key)));
  const total = matched.reduce((sum, rule) => sum + rule.weight, 0);
  const level = total >= 7 ? "高风险" : total >= 4 ? "中风险" : "低风险";
  const reason =
    level === "高风险"
      ? "这个任务已经接近真实员工权限，必须先设沙箱、审批和审计记录。"
      : level === "中风险"
        ? "这个任务可以交给 Claude Code / Codex，但需要明确边界，至少保留关键动作审批。"
        : "这个任务适合 Claude Code / Codex 自主处理，保留日志和只读边界即可。";

  const permissionItems = uniq(matched.map((rule) => rule.permission));
  const approvalItems = uniq(matched.map((rule) => rule.approval));
  const fallbackPermissions = ["只读资料权限", "记录完整操作日志"];
  const fallbackApprovals = ["访问新网站或要求额外权限时停下来问人"];

  applyRiskResult(level, reason);

  const finalPermissions = permissionItems.length ? permissionItems : fallbackPermissions;
  const finalApprovals = approvalItems.length ? approvalItems : fallbackApprovals;
  renderList(permissions, finalPermissions);
  renderList(approvals, finalApprovals);
  permissionCount.textContent = `${finalPermissions.length} 项`;
  approvalCount.textContent = `${finalApprovals.length} 项`;
  updateSummaryPreviews(finalPermissions, finalApprovals);

  const sandboxItems = buildSandboxRules(level, text);
  const hookItems = buildHooks(text);
  const claudeItems = buildClaudeCodeNotes(level, text);
  const codexItems = buildCodexNotes(level, text);
  renderList(claudeNotes, claudeItems);
  renderList(codexNotes, codexItems);
  renderList(sandboxRules, sandboxItems);
  renderList(hooks, hookItems);
  sandboxLevel.textContent = sandboxModeForRisk(level);
  hookCount.textContent = `${hookItems.length} 个`;
  policyBadge.textContent = "本地版";
  updateHandoffSummary("本地规则", finalPermissions.length, finalApprovals.length, sandboxLevel.textContent);

  brief.textContent = formatPolicyBrief({
    title: "Claude Code / Codex 入职说明",
    task: text || "未填写任务",
    level,
    workPolicy: BASE_WORK_POLICY,
    approvals: finalApprovals,
    checklist: DELIVERY_CHECKLIST,
  });

  if (!apiKeyInput.value.trim()) {
    apiStatus.textContent = "未使用模型 API，当前由本地关键词策略完成体检。";
  }
}

analyzeBtn.addEventListener("click", () => {
  if (hasModelConfig()) {
    runAiAnalysis();
    return;
  }
  analyze();
});
sampleBtn.addEventListener("click", () => {
  const currentIndex = taskSamples.findIndex((sample) => sample === input.value.trim());
  sampleIndex = currentIndex >= 0 ? (currentIndex + 1) % taskSamples.length : (sampleIndex + 1) % taskSamples.length;
  input.value = taskSamples[sampleIndex];
  updateSampleButtonLabel();
  analyze();
});
resultTabs.forEach((button) => {
  button.addEventListener("click", () => setActiveResultTab(button.dataset.tab));
});
summaryTiles.forEach((tile) => {
  tile.addEventListener("click", () => setActiveResultTab(tile.dataset.openTab));
});
providerSelect.addEventListener("change", () => applyProvider(providerSelect.value));
providerTrigger.addEventListener("click", () => {
  if (providerMenu.hidden) {
    showProviderMenu();
    return;
  }
  hideProviderMenu();
});
providerTrigger.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    showProviderMenu();
    focusProviderOption(1);
  }
  if (event.key === "Escape") {
    event.stopPropagation();
    hideProviderMenu();
  }
});
providerMenu.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusProviderOption(1);
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    focusProviderOption(-1);
  }
  if (event.key === "Escape") {
    event.stopPropagation();
    hideProviderMenu();
    providerTrigger.focus();
  }
});
baseUrlInput.addEventListener("input", () => {
  resetTestFeedback({ autoDetect: true });
  if (providerSelect.value !== "custom") {
    updateProviderBadges(" · 已改");
  }
  scheduleModelFetch();
});
apiKeyInput.addEventListener("input", () => {
  cacheApiKey(providerSelect.value);
  resetTestFeedback({ autoDetect: true });
  updateProviderBadges();
  if (!apiKeyInput.value.trim()) {
    apiStatus.textContent = "未使用模型 API，当前由本地关键词策略完成体检。";
    return;
  }
  scheduleModelFetch();
});
modelInput.addEventListener("focus", () => {
  if (availableModelIds.length) showModelMenu();
});
modelInput.addEventListener("input", () => {
  resetTestFeedback({ autoDetect: true });
  updateProviderBadges();
  if (availableModelIds.length) showModelMenu({ filter: true });
});
modelInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    showModelMenu();
    focusModelOption(1);
  }
  if (event.key === "Escape") {
    event.stopPropagation();
    hideModelMenu();
  }
});
modelMenuBtn.addEventListener("click", () => {
  if (modelMenu.hidden) {
    showModelMenu();
    modelInput.focus();
    return;
  }
  hideModelMenu();
});
modelMenu.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusModelOption(1);
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    focusModelOption(-1);
  }
  if (event.key === "Escape") {
    event.stopPropagation();
    hideModelMenu();
    modelInput.focus();
  }
});
fetchModelsBtn.addEventListener("click", fetchAvailableModels);
testModelBtn.addEventListener("click", () => testModelAvailability());
settingsBtn.addEventListener("click", () => openSettings());
closeSettingsBtn.addEventListener("click", closeSettings);
saveSettingsBtn.addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) closeSettings();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (!modelMenu.hidden || !providerMenu.hidden)) return;
  if (event.key === "Escape" && !settingsOverlay.hidden) closeSettings();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".select-field")) hideProviderMenu();
  if (!event.target.closest(".model-field")) hideModelMenu();
});
themeToggleBtn.addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = getNextTheme(currentTheme);
  applyThemePreference(nextTheme, { persist: true });
});

if (systemThemeQuery) {
  const refreshSystemTheme = () => {
    if (!readThemePreference()) {
      applyThemePreference("", { persist: false });
    }
  };
  if (systemThemeQuery.addEventListener) {
    systemThemeQuery.addEventListener("change", refreshSystemTheme);
  } else if (systemThemeQuery.addListener) {
    systemThemeQuery.addListener(refreshSystemTheme);
  }
}

copyPromptBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptInput.value);
  apiStatus.textContent = "提示词已复制，可以直接拿去改。";
});

function buildClaudeCodeNotes(level, text) {
  const items = [
    "真正会被 Claude Code 执行的是 .claude/settings.json 里的 permissions、sandbox 和 PreToolUse hook；CLAUDE.md 只提供上下文提醒。",
    "自动脱敏、日志保留 30 天、快照回滚和外部发送审批不会凭空发生，需要另接脱敏、审计、备份或消息系统。",
    "项目级 settings 只在从该项目目录启动 Claude Code 时稳定生效；安装后建议用 /status、/permissions、/hooks 和 /sandbox 复核。",
    "PermissionRequest、UserPromptSubmit 和 UserPromptExpansion 也会接入同一个门卫，减少误粘贴密钥或持久化危险权限的机会。",
    "HTTP hook 出口默认不放开；需要外部审计或通知时，应由人工配置 allowlist。",
  ];
  if (level !== "低风险") {
    items.push("高/中风险任务会生成更严格的 sandbox：启用 failIfUnavailable，并关闭 dangerouslyDisableSandbox 逃逸。");
  }
  if (text.includes("客户") || text.includes("用户") || text.includes("数据") || text.includes("后台")) {
    items.push("涉及客户或后台数据时，hook 只能阻断明显危险的工具调用；数据内容审核仍必须由人或专门数据治理流程完成。");
  }
  return items;
}

function buildCodexNotes(level, text) {
  const items = [
    "真正会被 Codex 执行的是 .codex/config.toml 里的 sandbox_mode、approval_policy、default_permissions 和 hooks；AGENTS.md 只提供模型指令。",
    "项目级 .codex/config.toml、项目本地 hooks 和 rules 只有在项目被 Codex 标记为 trusted 后才会加载；安装后必须用 /status、/permissions、/hooks 和 /debug-config 复核。",
    "Codex PreToolUse 目前适合 deny 或补充上下文，permissionDecision: ask 会 fail open；需要人确认时用 approval_policy = on-request 和 PermissionRequest hook。",
    "高风险模板会显式关闭 live/cached web_search、Codex memories 和本地历史持久化，避免客户数据被额外留存。",
    "App/connector 默认禁用 destructive/open-world 工具，并把工具调用审批模式设为 prompt。",
  ];
  if (level !== "低风险") {
    items.push("高/中风险任务建议使用 sandbox_mode = workspace-write、approval_policy = on-request，并避免 danger-full-access + never 组合。");
  }
  if (text.includes("客户") || text.includes("用户") || text.includes("数据") || text.includes("后台")) {
    items.push("涉及客户或后台数据时，Codex hook 只能拦明显命令和敏感路径；数据内容脱敏、收件人审核和审计留存仍要接业务系统。");
  }
  return items;
}

function buildSandboxRules(level, text) {
  const items = uniq([...buildClaudeSandboxRules(level, text), ...buildCodexSandboxRules(level, text)]);
  if (level !== "低风险") {
    items.unshift("共同原则：网络访问默认不放开；新增域名、下载依赖、导出数据都要走工具自身审批流程。");
  }
  return items;
}

function buildClaudeSandboxRules(level, text) {
  const items = [
    "Claude Code：启用 sandbox.enabled；如果沙箱不可用，启动时直接失败而不是静默降级。",
    "Claude Code：关闭 allowUnsandboxedCommands，阻止通过 dangerouslyDisableSandbox 逃出沙箱。",
    "Claude Code：Bash 子进程默认只能读写当前项目目录和必要临时目录，拒绝读取 .env、secrets、.ssh、.aws/credentials 等凭证路径。",
    "Claude Code：限制 HTTP hooks 的 URL 和环境变量出口，避免 hook 自身成为数据外传通道。",
    "Claude Code：保护 .claude、.codex、.git、.agents 等控制目录，默认不允许修改自己的护栏。",
  ];
  if (level !== "低风险") items.unshift("Claude Code：网络访问默认无白名单；新增 WebFetch、curl、wget 等外部访问必须要求人工确认。");
  if (text.includes("后台") || text.includes("客户") || text.includes("数据")) {
    items.push("Claude Code：真实客户数据不能只靠 CLAUDE.md 保护；导出、复制和发送必须走人工确认。");
  }
  if (text.includes(".env") || text.includes("token") || text.includes("密钥")) {
    items.push("Claude Code：密钥文件通过 Read/Edit/Write deny、sandbox denyRead/denyWrite 和 PreToolUse hook 多层拦截。");
  }
  if (text.includes("push") || text.includes("PR") || text.includes("提交")) {
    items.push("Claude Code：git push、npm/pnpm/yarn publish 直接 deny，只允许生成待 review 的本地变更。");
  }
  return items;
}

function buildCodexSandboxRules(level, text) {
  const items = [
    "Codex：使用 sandbox_mode = workspace-write、approval_policy = on-request，避免 danger-full-access + never 组合。",
    "Codex：default_permissions 指向 agent_onboarding_guarded，只允许项目根写入，并把 .env、secrets、.ssh、.aws/credentials 等路径设为 none。",
    "Codex：workspace-write sandbox 内默认 network_access = false；需要联网时让 Codex 触发 on-request 审批。",
    "Codex：显式把 .codex、.git、.agents、.claude 等控制目录降为只读，减少 Agent 自改护栏的空间。",
    "Codex：添加 .codex/rules/agent_onboarding.rules，用 execpolicy prefix_rule 在 hook 之外再拦一层高危命令。",
  ];
  if (level !== "低风险") items.unshift("Codex：项目级 .codex/config.toml、hooks 和 rules 只有在项目被 trust 后才会加载，安装后必须复核。");
  if (text.includes("后台") || text.includes("客户") || text.includes("数据")) {
    items.push("Codex：真实客户数据不能只靠 AGENTS.md 保护；导出、复制和发送必须走人工确认和业务系统脱敏。");
  }
  if (text.includes("push") || text.includes("PR") || text.includes("提交")) {
    items.push("Codex：git push、publish、sudo、danger-full-access 和 approval_policy = never 直接 deny。");
  }
  return items;
}

function buildHooks(text) {
  return uniq([...buildClaudeHookRules(text), ...buildCodexHookRules(text)]);
}

function buildClaudeHookRules(text) {
  const items = [
    "Claude Code PreToolUse：对危险命令、敏感路径、WebFetch 和数据库/传输命令返回 ask/deny。",
    "Claude Code PermissionRequest：对准备持久化的危险权限、bypassPermissions 或敏感路径请求直接 deny。",
    "Claude Code UserPromptSubmit：拦截用户误粘贴的 API key、private key、cookie、token 或密码。",
    "Claude Code UserPromptExpansion：拦截 slash command 或 prompt expansion 中误带出的密钥。",
    "Claude Code PreToolUse/Bash：拦截 git push、publish、sudo、危险 rm、数据库 drop/truncate 和 --dangerously-skip-permissions。",
    "Claude Code PreToolUse/WebSearch/Grep/Glob：搜索外部网络或项目外路径前暂停确认。",
  ];
  if (text.includes("网页") || text.includes("后台") || text.includes("浏览器")) {
    items.push("Claude Code 不会自动理解网页按钮的业务风险；涉及后台登录/提交时必须由人确认凭证和最终动作。");
  }
  if (text.includes("数据") || text.includes("客户") || text.includes("用户")) {
    items.push("Claude Code：客户或用户数据导出不是 hook 能完全识别的语义动作，仍需人工审核导出用途和结果文件。");
  }
  return items;
}

function buildCodexHookRules(text) {
  const items = [
    "Codex PreToolUse：只返回 deny 或 additionalContext，不使用尚未支持的 ask 决策。",
    "Codex PermissionRequest：当 sandbox 或网络边界触发审批时二次检查，危险请求直接 deny，普通请求交给用户审批。",
    "Codex UserPromptSubmit：拦截用户误粘贴的 API key、private key、cookie、token 或密码。",
    "Codex PreToolUse/MCP：对命名上明显是发送、上传、删除、更新的 MCP 调用直接阻断，要求人类改用手动流程。",
    "Codex permission_mode 检查：如果会话已经处于 bypassPermissions 或 dontAsk，hook 会拒绝继续执行高风险动作。",
  ];
  if (text.includes("网页") || text.includes("后台") || text.includes("浏览器")) {
    items.push("Codex hook 不能自动理解网页按钮的业务风险；涉及后台登录/提交时必须由人确认凭证和最终动作。");
  }
  if (text.includes("数据") || text.includes("客户") || text.includes("用户")) {
    items.push("Codex：客户或用户数据导出不是 hook 能完全识别的语义动作，仍需人工审核导出用途、脱敏状态和结果文件。");
  }
  return items;
}

function buildToolPolicyBrief(toolName) {
  return formatPolicyBrief({
    title: `${toolName} 入职说明`,
    task: input.value.trim() || "未填写任务",
    level: riskScore.textContent.trim() || "未判断",
    reason: riskReason.textContent.trim() || "",
    workPolicy: BASE_WORK_POLICY,
    approvals: getPanelItems(approvals),
    checklist: DELIVERY_CHECKLIST,
  });
}

function buildAiInput() {
  return [
    "任务",
    input.value.trim() || "未填写任务",
    "",
    "本地规则体检结果",
    brief.textContent,
    "",
    "Claude Code 生效边界",
    [...claudeNotes.querySelectorAll("li")].map((li) => `- ${li.textContent}`).join("\n"),
    "",
    "Codex 生效边界",
    [...codexNotes.querySelectorAll("li")].map((li) => `- ${li.textContent}`).join("\n"),
    "",
    "沙箱配置建议",
    [...sandboxRules.querySelectorAll("li")].map((li) => `- ${li.textContent}`).join("\n"),
    "",
    "Hooks 门卫脚本",
    [...hooks.querySelectorAll("li")].map((li) => `- ${li.textContent}`).join("\n"),
  ].join("\n");
}

function markdownList(title, items, fallbackItems = []) {
  const finalItems = items.length ? items : fallbackItems;
  return [`### ${title}`, ...finalItems.map((item) => `- ${item}`)].join("\n");
}

function buildClaudeMdSection() {
  const permissionItems = getPanelItems(permissions);
  const approvalItems = getPanelItems(approvals);
  const claudeItems = getPanelItems(claudeNotes);
  const sandboxItems = buildClaudeSandboxRules(riskScore.textContent.trim(), input.value.trim());
  const hookItems = buildClaudeHookRules(input.value.trim());
  return [
    "<!-- AGENT_ONBOARDING_CHECKER_START -->",
    "## Claude Code 入职规则",
    "",
    "> 由 Agent Onboarding Checker 生成。把这里当作当前项目的 Claude Code 上岗说明。",
    "",
    "### 当前任务",
    input.value.trim() || "未填写任务",
    "",
    "### 风险判断",
    `- 风险等级：${riskScore.textContent.trim() || "未判断"}`,
    `- 判断：${riskReason.textContent.trim() || "暂无判断"}`,
    "",
    "### 工作制度",
    buildToolPolicyBrief("Claude Code"),
    "",
    markdownList("Claude Code 生效边界", claudeItems, ["CLAUDE.md 只提供上下文，真正生效的限制在 .claude/settings.json 和 hook 脚本中"]),
    "",
    markdownList("权限边界", permissionItems, ["默认只给任务所需的最小权限"]),
    "",
    markdownList("必须人工确认", approvalItems, ["导出、删除、发送、发布、登录授权前必须确认"]),
    "",
    markdownList("沙箱原则", sandboxItems, ["文件写入限制在当前项目目录或临时输出目录"]),
    "",
    markdownList("Hooks 门卫", hookItems, ["高风险命令、密钥文件和外部发送动作需要拦截或确认"]),
    "<!-- AGENT_ONBOARDING_CHECKER_END -->",
  ].join("\n");
}

function buildCodexAgentsSection() {
  const permissionItems = getPanelItems(permissions);
  const approvalItems = getPanelItems(approvals);
  const codexItems = getPanelItems(codexNotes);
  const sandboxItems = buildCodexSandboxRules(riskScore.textContent.trim(), input.value.trim());
  const hookItems = buildCodexHookRules(input.value.trim());
  return [
    "<!-- AGENT_ONBOARDING_CHECKER_START -->",
    "## Codex 入职规则",
    "",
    "> 由 Agent Onboarding Checker 生成。把这里当作当前项目的 Codex 上岗说明。",
    "",
    "### 当前任务",
    input.value.trim() || "未填写任务",
    "",
    "### 风险判断",
    `- 风险等级：${riskScore.textContent.trim() || "未判断"}`,
    `- 判断：${riskReason.textContent.trim() || "暂无判断"}`,
    "",
    "### 工作制度",
    buildToolPolicyBrief("Codex"),
    "",
    markdownList("Codex 生效边界", codexItems, ["AGENTS.md 只提供模型指令，真正生效的限制在 .codex/config.toml、sandbox、approval 和 hook 中"]),
    "",
    markdownList("权限边界", permissionItems, ["默认只给任务所需的最小权限"]),
    "",
    markdownList("必须人工确认", approvalItems, ["导出、删除、发送、发布、登录授权前必须确认"]),
    "",
    markdownList("沙箱原则", sandboxItems, ["Codex 使用 workspace-write + on-request，超出边界时走审批"]),
    "",
    markdownList("Hooks 门卫", hookItems, ["高风险命令、密钥文件和外部发送动作需要拦截或确认"]),
    "<!-- AGENT_ONBOARDING_CHECKER_END -->",
  ].join("\n");
}

function buildClaudeSettings() {
  return JSON.stringify(
    {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      permissions: {
        defaultMode: "default",
        disableBypassPermissionsMode: "disable",
        deny: [
          "Read(./.env)",
          "Read(./.env.*)",
          "Read(./secrets/**)",
          "Read(./.aws/credentials)",
          "Read(./.ssh/**)",
          "Read(./id_rsa)",
          "Read(./id_ed25519)",
          "Read(~/.aws/**)",
          "Read(~/.config/gcloud/**)",
          "Read(~/.kube/**)",
          "Read(~/.docker/**)",
          "Read(~/.npmrc)",
          "Read(~/.pypirc)",
          "Read(~/.netrc)",
          "Edit(./.env)",
          "Edit(./.env.*)",
          "Edit(./secrets/**)",
          "Edit(./.aws/credentials)",
          "Edit(./.ssh/**)",
          "Edit(./id_rsa)",
          "Edit(./id_ed25519)",
          "Edit(./.claude/settings.json)",
          "Edit(./.claude/settings.local.json)",
          "Edit(./.claude/hooks/**)",
          "Edit(./.codex/config.toml)",
          "Edit(./.codex/hooks/**)",
          "Edit(./.codex/rules/**)",
          "Edit(./.agents/**)",
          "Edit(./.git/**)",
          "Write(./.env)",
          "Write(./.env.*)",
          "Write(./secrets/**)",
          "Write(./.aws/credentials)",
          "Write(./.ssh/**)",
          "Write(./id_rsa)",
          "Write(./id_ed25519)",
          "Write(./.claude/settings.json)",
          "Write(./.claude/settings.local.json)",
          "Write(./.claude/hooks/**)",
          "Write(./.codex/config.toml)",
          "Write(./.codex/hooks/**)",
          "Write(./.codex/rules/**)",
          "Write(./.agents/**)",
          "Write(./.git/**)",
          "MultiEdit(./.env)",
          "MultiEdit(./.env.*)",
          "MultiEdit(./secrets/**)",
          "MultiEdit(./.aws/credentials)",
          "MultiEdit(./.ssh/**)",
          "MultiEdit(./id_rsa)",
          "MultiEdit(./id_ed25519)",
          "MultiEdit(./.claude/settings.json)",
          "MultiEdit(./.claude/settings.local.json)",
          "MultiEdit(./.claude/hooks/**)",
          "MultiEdit(./.codex/config.toml)",
          "MultiEdit(./.codex/hooks/**)",
          "MultiEdit(./.codex/rules/**)",
          "MultiEdit(./.agents/**)",
          "MultiEdit(./.git/**)",
          "Bash(git push)",
          "Bash(git push *)",
          "Bash(npm publish *)",
          "Bash(pnpm publish *)",
          "Bash(yarn publish *)",
          "Bash(rm -rf*)",
          "Bash(sudo *)",
        ],
        ask: [
          "WebFetch",
          "WebSearch",
          "Bash(rm *)",
          "Bash(curl *)",
          "Bash(wget *)",
          "Bash(scp *)",
          "Bash(rsync *)",
          "Bash(psql *)",
          "Bash(mysql *)",
        ],
      },
      sandbox: {
        enabled: true,
        failIfUnavailable: true,
        autoAllowBashIfSandboxed: false,
        allowUnsandboxedCommands: false,
        filesystem: {
          allowRead: ["."],
          allowWrite: [".", "/tmp"],
          denyRead: ["~/", "./.env", "./secrets", "./.aws/credentials", "./.ssh"],
          denyWrite: [
            "./.env",
            "./secrets",
            "./.aws/credentials",
            "./.ssh",
            "./.git",
            "./.claude",
            "./.codex",
            "./.agents",
          ],
        },
        network: {
          allowedDomains: [],
          deniedDomains: [],
          allowLocalBinding: false,
          allowUnixSockets: [],
        },
      },
      skipWebFetchPreflight: false,
      allowedHttpHookUrls: [],
      httpHookAllowedEnvVars: [],
      hooks: {
        PreToolUse: [
          {
            matcher: "Bash|Read|Edit|Write|MultiEdit|WebFetch|WebSearch|Glob|Grep",
            hooks: [
              {
                type: "command",
                command: "${CLAUDE_PROJECT_DIR}/.claude/hooks/agent-guard.sh",
              },
            ],
          },
        ],
        PermissionRequest: [
          {
            matcher: "Bash|Read|Edit|Write|MultiEdit|WebFetch|WebSearch|Glob|Grep",
            hooks: [
              {
                type: "command",
                command: "${CLAUDE_PROJECT_DIR}/.claude/hooks/agent-guard.sh",
              },
            ],
          },
        ],
        UserPromptSubmit: [
          {
            hooks: [
              {
                type: "command",
                command: "${CLAUDE_PROJECT_DIR}/.claude/hooks/agent-guard.sh",
              },
            ],
          },
        ],
        UserPromptExpansion: [
          {
            hooks: [
              {
                type: "command",
                command: "${CLAUDE_PROJECT_DIR}/.claude/hooks/agent-guard.sh",
              },
            ],
          },
        ],
      },
    },
    null,
    2,
  );
}

function buildGuardHookScript() {
  return String.raw`#!/usr/bin/env bash
set -euo pipefail

payload_file="$(mktemp)"
cat > "$payload_file"
cleanup() { rm -f "$payload_file"; }
trap cleanup EXIT

if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"agent-guard.sh 需要 python3 才能检查本次 Claude Code 工具调用，请人工确认后再继续。"}}'
  exit 0
fi

python3 - "$payload_file" <<'PY'
import json
import os
import re
import sys
from urllib.parse import urlparse

try:
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        payload = json.load(f)
except Exception:
    sys.exit(0)

hook_event_name = str(payload.get('hook_event_name') or '')
tool = str(payload.get('tool_name') or '')
tool_input = payload.get('tool_input') or {}
if not isinstance(tool_input, dict):
    tool_input = {}

command = str(tool_input.get('command') or '')
file_path = str(tool_input.get('file_path') or tool_input.get('path') or '')
url = str(tool_input.get('url') or '')
prompt = str(payload.get('prompt') or '')
permission_mode = str(payload.get('permission_mode') or '')
serialized_input = json.dumps(tool_input, ensure_ascii=False)
content = '\n'.join([command, serialized_input, prompt, permission_mode])
project_dir = os.path.realpath(os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd())

def respond(decision, reason):
    print(json.dumps({
        'hookSpecificOutput': {
            'hookEventName': 'PreToolUse',
            'permissionDecision': decision,
            'permissionDecisionReason': reason,
        }
    }, ensure_ascii=False))

def emit_prompt_block(reason):
    print(json.dumps({
        'decision': 'block',
        'reason': reason,
    }, ensure_ascii=False))

def emit_permission_deny(reason):
    print(json.dumps({
        'hookSpecificOutput': {
            'hookEventName': 'PermissionRequest',
            'decision': {
                'behavior': 'deny',
                'message': reason,
                'interrupt': True,
            }
        }
    }, ensure_ascii=False))

def deny(reason):
    if hook_event_name == 'PermissionRequest':
        emit_permission_deny(reason)
    elif hook_event_name in {'UserPromptSubmit', 'UserPromptExpansion'}:
        emit_prompt_block(reason)
    else:
        respond('deny', reason)

def normalize(path):
    if not path:
        return ''
    path = os.path.expanduser(path)
    if not os.path.isabs(path):
        path = os.path.join(project_dir, path)
    return os.path.realpath(path)

def in_project_or_tmp(path):
    return path.startswith(project_dir + os.sep) or path == project_dir or path.startswith('/tmp/')

def contains_any(patterns, text):
    return any(re.search(pattern, text, re.I) for pattern in patterns)

protected_path_patterns = [
    r'(^|[/\s"\'])\.env(\.[^\s"\']*)?($|[/\s"\'])',
    r'(^|[/\s"\'])secrets($|[/\s"\']/)',
    r'(^|[/\s"\'])\.aws/credentials($|[/\s"\'])',
    r'(^|[/\s"\'])\.ssh($|[/\s"\']/)',
    r'(^|[/\s"\'])(id_rsa|id_ed25519)($|[/\s"\'])',
]

protected_config_write_patterns = [
    r'(^|[/\s"\'])\.claude/settings(\.local)?\.json($|[/\s"\'])',
    r'(^|[/\s"\'])\.claude/hooks($|[/\s"\']/)',
    r'(^|[/\s"\'])\.codex/config\.toml($|[/\s"\'])',
    r'(^|[/\s"\'])\.codex/hooks($|[/\s"\']/)',
    r'(^|[/\s"\'])\.codex/rules($|[/\s"\']/)',
    r'(^|[/\s"\'])\.agents($|[/\s"\']/)',
    r'(^|[/\s"\'])\.git($|[/\s"\']/)',
]

secret_value_patterns = [
    r'-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----',
    r'\b(?:sk|gh[pousr]|xox[baprs]?|claude)[-_][A-Za-z0-9_\-]{20,}\b',
    r'\b(api[_-]?key|secret|token|password|cookie)\s*[:=]\s*[^\s"\']{12,}',
]

if hook_event_name in {'UserPromptSubmit', 'UserPromptExpansion'} and contains_any(secret_value_patterns, prompt):
    emit_prompt_block('疑似把 API key、private key、cookie、token 或密码粘贴进了 Claude Code；请改用安全凭证注入方式。')
    sys.exit(0)

if permission_mode == 'bypassPermissions':
    deny('当前 Claude Code 会话处于 bypassPermissions 模式，高风险入职规则拒绝继续执行。')
    sys.exit(0)

if tool_input.get('dangerouslyDisableSandbox') is True or 'dangerouslyDisableSandbox' in serialized_input:
    deny('禁止使用 dangerouslyDisableSandbox：Claude Code 沙箱逃逸口已关闭。')
    sys.exit(0)

if contains_any(protected_path_patterns, content):
    deny('禁止读取或修改 .env、secrets、SSH、AWS 凭证等敏感文件。')
    sys.exit(0)

if contains_any(secret_value_patterns, content):
    deny('疑似工具输入中包含真实密钥、token、cookie 或密码；请先移除敏感值。')
    sys.exit(0)

if tool in {'Edit', 'Write', 'MultiEdit'} and contains_any(protected_config_write_patterns, content):
    deny('禁止修改 .claude、.codex、.agents、.git 等安全控制目录。需要变更护栏时请人工编辑。')
    sys.exit(0)

if tool in {'Read', 'Edit', 'Write', 'MultiEdit', 'Glob', 'Grep'} and file_path:
    resolved = normalize(file_path)
    if not in_project_or_tmp(resolved):
        if hook_event_name == 'PermissionRequest':
            deny('这个文件不在当前项目目录或 /tmp 内，拒绝把项目外路径持久加入权限。')
        else:
            respond('ask', '这个文件不在当前项目目录或 /tmp 内，请人工确认 Claude Code 是否允许访问。')
        sys.exit(0)

if tool == 'WebFetch':
    host = urlparse(url).hostname or '未知域名'
    if hook_event_name == 'PermissionRequest':
        deny(f'拒绝持久放行外部 URL（{host}）；高风险任务需人工逐次确认。')
    else:
        respond('ask', f'Claude Code 准备访问外部 URL（{host}），请确认该域名属于本任务白名单。')
    sys.exit(0)

if tool == 'WebSearch':
    if hook_event_name == 'PermissionRequest':
        deny('拒绝持久放行 WebSearch；高风险任务需人工逐次确认搜索内容。')
    else:
        respond('ask', 'Claude Code 准备进行 WebSearch；高风险任务默认不允许外部搜索，请确认搜索内容不会泄露客户或内部信息。')
    sys.exit(0)

if tool == 'Bash':
    compact = ' '.join(command.split())
    deny_patterns = [
        r'\bgit\s+push\b',
        r'\b(?:npm|pnpm|yarn)\s+publish\b',
        r'\brm\s+-rf\s+(?:/|~|\*|\.)',
        r'\bsudo\b',
        r'\b(?:drop|truncate)\s+database\b',
        r'\bchmod\s+777\b',
        r'--dangerously-skip-permissions\b',
        r'--allow-dangerously-skip-permissions\b',
        r'--permission-mode\s+bypassPermissions\b',
    ]
    ask_patterns = [
        r'\brm\b',
        r'\bcurl\b',
        r'\bwget\b',
        r'\bscp\b',
        r'\brsync\b',
        r'\bchmod\s+-R\b',
        r'\bpsql\b',
        r'\bmysql\b',
        r'\bsqlite3\b',
        r'\bpg_dump\b',
        r'\bmysqldump\b',
        r'\b(open|osascript)\b',
        r'\b(login|export|dump|upload|send|mail)\b',
    ]
    if contains_any(protected_config_write_patterns, compact):
        deny('禁止通过 Bash 修改 .claude、.codex、.agents、.git 等安全控制目录。')
        sys.exit(0)
    if contains_any(deny_patterns, compact):
        deny('高风险命令已拦截：需要人工改写任务或手动执行。')
        sys.exit(0)
    if contains_any(ask_patterns, compact):
        respond('ask', '命令可能删除文件、访问网络、触碰数据库、导出数据或调用本机应用，请人工确认。')
        sys.exit(0)

sys.exit(0)
PY`;
}

function buildCodexConfigToml() {
  return [
    "#:schema https://developers.openai.com/codex/config-schema.json",
    "# AGENT_ONBOARDING_CHECKER_START",
    'approval_policy = "on-request"',
    'approvals_reviewer = "user"',
    'sandbox_mode = "workspace-write"',
    'default_permissions = "agent_onboarding_guarded"',
    'web_search = "disabled"',
    "allow_login_shell = false",
    "",
    "[history]",
    'persistence = "none"',
    "",
    "[otel]",
    'environment = "dev"',
    'exporter = "none"',
    "log_user_prompt = false",
    "",
    "[sandbox_workspace_write]",
    "network_access = false",
    "exclude_tmpdir_env_var = false",
    "exclude_slash_tmp = false",
    "",
    "[features]",
    "hooks = true",
    "memories = false",
    "plugin_hooks = false",
    "skill_mcp_dependency_install = false",
    "codex_git_commit = false",
    "",
    "[shell_environment_policy]",
    'inherit = "core"',
    'exclude = ["*KEY*", "*SECRET*", "*TOKEN*", "*COOKIE*", "*PASSWORD*", "*AUTH*"]',
    "",
    '[apps."_default"]',
    "enabled = true",
    "destructive_enabled = false",
    "open_world_enabled = false",
    'default_tools_approval_mode = "prompt"',
    "",
    "[permissions.agent_onboarding_guarded.filesystem]",
    "glob_scan_max_depth = 3",
    "",
    '[permissions.agent_onboarding_guarded.filesystem.":project_roots"]',
    '"." = "write"',
    '"AGENTS.md" = "read"',
    '".codex/**" = "read"',
    '".claude/**" = "read"',
    '".agents/**" = "read"',
    '".git/**" = "read"',
    '"**/.env" = "none"',
    '"**/.env.*" = "none"',
    '"secrets/**" = "none"',
    '".aws/credentials" = "none"',
    '".ssh/**" = "none"',
    '"**/id_rsa" = "none"',
    '"**/id_ed25519" = "none"',
    "",
    "[permissions.agent_onboarding_guarded.network]",
    "enabled = false",
    "allow_local_binding = false",
    "",
    "[[hooks.PreToolUse]]",
    'matcher = "Bash|apply_patch|Edit|Write|mcp__.*"',
    "",
    "[[hooks.PreToolUse.hooks]]",
    'type = "command"',
    'command = \'root=$(git rev-parse --show-toplevel 2>/dev/null || pwd); /usr/bin/python3 "$root/.codex/hooks/agent_guard.py"\'',
    "timeout = 30",
    'statusMessage = "Checking Codex project policy"',
    "",
    "[[hooks.PermissionRequest]]",
    'matcher = "Bash|apply_patch|Edit|Write|mcp__.*"',
    "",
    "[[hooks.PermissionRequest.hooks]]",
    'type = "command"',
    'command = \'root=$(git rev-parse --show-toplevel 2>/dev/null || pwd); /usr/bin/python3 "$root/.codex/hooks/agent_guard.py"\'',
    "timeout = 30",
    'statusMessage = "Checking Codex approval request"',
    "",
    "[[hooks.UserPromptSubmit]]",
    "",
    "[[hooks.UserPromptSubmit.hooks]]",
    'type = "command"',
    'command = \'root=$(git rev-parse --show-toplevel 2>/dev/null || pwd); /usr/bin/python3 "$root/.codex/hooks/agent_guard.py"\'',
    "timeout = 30",
    'statusMessage = "Scanning prompt for secrets"',
    "# AGENT_ONBOARDING_CHECKER_END",
  ].join("\n");
}

function buildCodexRulesFile() {
  return String.raw`# Agent Onboarding Checker Codex command rules.
# Project-local rules load only after this .codex layer is trusted.

prefix_rule(
    pattern = ["git", "push"],
    decision = "forbidden",
    justification = "Do not push from Codex. Ask a human to review and push manually.",
    match = ["git push", "git push origin main"],
)

prefix_rule(
    pattern = [["npm", "pnpm", "yarn"], "publish"],
    decision = "forbidden",
    justification = "Publishing packages is an external release action and must be manual.",
    match = ["npm publish", "pnpm publish --access public", "yarn publish"],
)

prefix_rule(
    pattern = ["sudo"],
    decision = "forbidden",
    justification = "Privilege escalation is outside the project onboarding boundary.",
    match = ["sudo make install"],
)

prefix_rule(
    pattern = ["rm", "-rf"],
    decision = "forbidden",
    justification = "Recursive deletion must be reviewed and performed manually.",
    match = ["rm -rf build", "rm -rf /tmp/out"],
)

prefix_rule(
    pattern = [["curl", "wget", "scp", "rsync"]],
    decision = "prompt",
    justification = "Network transfer commands require an explicit human approval.",
    match = ["curl https://example.com", "wget https://example.com/file", "scp a b:c", "rsync -a out/ host:/tmp/out/"],
)

prefix_rule(
    pattern = [["psql", "mysql", "sqlite3", "pg_dump", "mysqldump"]],
    decision = "prompt",
    justification = "Database access or export requires an explicit human approval and data purpose.",
    match = ["psql production", "pg_dump app"],
)`;
}

function buildCodexGuardHookScript() {
  return String.raw`#!/usr/bin/env python3
import json
import re
import sys

try:
    payload = json.load(sys.stdin)
except Exception:
    sys.exit(0)

event = str(payload.get("hook_event_name") or "")
tool = str(payload.get("tool_name") or "")
permission_mode = str(payload.get("permission_mode") or "")
tool_input = payload.get("tool_input") or {}
if not isinstance(tool_input, dict):
    tool_input = {}

command = str(tool_input.get("command") or "")
prompt = str(payload.get("prompt") or "")
serialized_input = json.dumps(tool_input, ensure_ascii=False)
content = "\n".join([tool, command, serialized_input, prompt, permission_mode])

def emit_pretool_deny(reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }, ensure_ascii=False))

def emit_pretool_context(message):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "additionalContext": message,
        }
    }, ensure_ascii=False))

def emit_permission_deny(reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PermissionRequest",
            "decision": {
                "behavior": "deny",
                "message": reason,
            }
        }
    }, ensure_ascii=False))

def emit_prompt_block(reason):
    print(json.dumps({
        "decision": "block",
        "reason": reason,
    }, ensure_ascii=False))

def deny(reason):
    if event == "PermissionRequest":
        emit_permission_deny(reason)
    elif event == "UserPromptSubmit":
        emit_prompt_block(reason)
    else:
        emit_pretool_deny(reason)

def contains_any(patterns, text):
    return any(re.search(pattern, text, re.I) for pattern in patterns)

protected_path_patterns = [
    r"(^|[/\s\"'])\.env(\.[^\s\"']*)?($|[/\s\"'])",
    r"(^|[/\s\"'])secrets($|[/\s\"']/)",
    r"(^|[/\s\"'])\.aws/credentials($|[/\s\"'])",
    r"(^|[/\s\"'])\.ssh($|[/\s\"']/)",
    r"(^|[/\s\"'])(id_rsa|id_ed25519)($|[/\s\"'])",
]

protected_config_write_patterns = [
    r"(^|[/\s\"'])\.codex/(?:config\.toml|hooks|rules)($|[/\s\"'])",
    r"(^|[/\s\"'])\.claude/(?:settings(?:\.local)?\.json|hooks)($|[/\s\"'])",
    r"(^|[/\s\"'])\.agents($|[/\s\"']/)",
    r"(^|[/\s\"'])\.git($|[/\s\"']/)",
]

secret_value_patterns = [
    r"-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----",
    r"\b(?:sk|gh[pousr]|xox[baprs]?|claude)[-_][A-Za-z0-9_\-]{20,}\b",
    r"\b(api[_-]?key|secret|token|password|cookie)\s*[:=]\s*[^\s\"']{12,}",
]

dangerous_patterns = [
    r"\bgit\s+push\b",
    r"\b(?:npm|pnpm|yarn)\s+publish\b",
    r"\brm\s+-rf\s+(?:/|~|\*|\.)",
    r"\bsudo\b",
    r"\b(?:drop|truncate)\s+database\b",
    r"\bchmod\s+777\b",
    r"--danger-full-access\b",
    r"--dangerously-bypass-approvals-and-sandbox\b",
    r"--yolo\b",
    r"--ask-for-approval\s+never\b",
    r"(?:^|\s)-a\s+never\b",
    r"\bsandbox_mode\s*=\s*[\"']danger-full-access[\"']",
    r"\bapproval_policy\s*=\s*[\"']never[\"']",
    r"\bdefault_permissions\s*=\s*[\"']:danger-no-sandbox[\"']",
]

side_effecting_mcp_patterns = [
    r"(?:^|[_\W])(send|mail|message|upload|delete|remove|destroy|create|update|post|put|patch|publish|share|invite)(?:$|[_\W])",
]

caution_patterns = [
    r"\brm\b",
    r"\bcurl\b",
    r"\bwget\b",
    r"\bscp\b",
    r"\brsync\b",
    r"\bpsql\b",
    r"\bmysql\b",
    r"\bsqlite3\b",
    r"\bpg_dump\b",
    r"\bmysqldump\b",
    r"\b(login|export|dump|upload|send|mail)\b",
]

if event == "UserPromptSubmit" and contains_any(secret_value_patterns, prompt):
    emit_prompt_block("疑似把 API key、private key、cookie、token 或密码粘贴进了 Codex；请改用安全凭证注入方式。")
    sys.exit(0)

if permission_mode in {"bypassPermissions", "dontAsk"}:
    deny("当前 Codex 会话处于 bypassPermissions/dontAsk 权限模式，高风险入职规则拒绝继续执行。")
    sys.exit(0)

if contains_any(protected_path_patterns, content):
    deny("禁止读取或修改 .env、secrets、SSH、AWS 凭证等敏感路径。")
    sys.exit(0)

if contains_any(secret_value_patterns, content):
    deny("疑似工具输入中包含真实密钥、token、cookie 或密码；请先移除敏感值。")
    sys.exit(0)

if contains_any(protected_config_write_patterns, content):
    deny("禁止修改 .codex、.claude、.agents、.git 等安全控制目录。需要变更护栏时请人工编辑。")
    sys.exit(0)

if contains_any(dangerous_patterns, content):
    deny("高风险 Codex 操作已拦截：不要推送、发布、提权、删除根目录、绕过 sandbox 或把 approval_policy 改成 never。")
    sys.exit(0)

if tool.startswith("mcp__") and contains_any(side_effecting_mcp_patterns, content):
    deny("疑似 side-effecting MCP 工具调用已阻断：发送、上传、删除、发布或更新外部系统前必须人工处理。")
    sys.exit(0)

if event == "PreToolUse" and tool == "Bash" and contains_any(caution_patterns, command):
    emit_pretool_context("本次 Bash 命令涉及删除、网络、数据库、导出或发送动作；如果超出 workspace-write sandbox，请保留 on-request 人工审批。")
    sys.exit(0)

sys.exit(0)`;
}

function buildClaudeProjectSetupScript() {
  const claudeSection = buildClaudeMdSection();
  const settingsJson = buildClaudeSettings();
  const guardScript = buildGuardHookScript();
  return [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "",
    "mkdir -p .claude/hooks",
    "timestamp=\"$(date +%Y%m%d%H%M%S)\"",
    "",
    "backup_if_exists() {",
    "  if [ -e \"$1\" ]; then",
    "    cp \"$1\" \"$1.bak.$timestamp\"",
    "  fi",
    "}",
    "",
    "replace_or_append_section() {",
    "  file=\"$1\"",
    "  start_marker=\"$2\"",
    "  end_marker=\"$3\"",
    "  section_file=\"$4\"",
    "  if [ -f \"$file\" ] && grep -Fq \"$start_marker\" \"$file\"; then",
    "    awk -v start=\"$start_marker\" -v end=\"$end_marker\" -v section=\"$section_file\" '",
    "      $0 == start { while ((getline line < section) > 0) print line; skipping=1; next }",
    "      $0 == end { skipping=0; next }",
    "      !skipping { print }",
    "    ' \"$file\" > \"$file.tmp.$$\"",
    "    mv \"$file.tmp.$$\" \"$file\"",
    "  else",
    "    touch \"$file\"",
    "    if [ -s \"$file\" ]; then printf '\\n\\n' >> \"$file\"; fi",
    "    cat \"$section_file\" >> \"$file\"",
    "  fi",
    "}",
    "",
    "backup_if_exists CLAUDE.md",
    "section_file=\"$(mktemp)\"",
    "cat > \"$section_file\" <<'AGENT_ONBOARDING_CLAUDE'",
    claudeSection,
    "AGENT_ONBOARDING_CLAUDE",
    "replace_or_append_section CLAUDE.md '<!-- AGENT_ONBOARDING_CHECKER_START -->' '<!-- AGENT_ONBOARDING_CHECKER_END -->' \"$section_file\"",
    "rm -f \"$section_file\"",
    "",
    "settings_file=\"$(mktemp)\"",
    "cat > \"$settings_file\" <<'AGENT_ONBOARDING_SETTINGS'",
    settingsJson,
    "AGENT_ONBOARDING_SETTINGS",
    "backup_if_exists .claude/settings.json",
    "if command -v python3 >/dev/null 2>&1; then",
    "  python3 - \"$settings_file\" .claude/settings.json <<'PY'",
    "import json",
    "import os",
    "import sys",
    "",
    "generated_path, target_path = sys.argv[1], sys.argv[2]",
    "with open(generated_path, 'r', encoding='utf-8') as f:",
    "    generated = json.load(f)",
    "",
    "try:",
    "    with open(target_path, 'r', encoding='utf-8') as f:",
    "        existing = json.load(f)",
    "except Exception:",
    "    existing = {}",
    "",
    "def stable_key(value):",
    "    return json.dumps(value, ensure_ascii=False, sort_keys=True)",
    "",
    "def merge(existing_value, generated_value):",
    "    if isinstance(existing_value, dict) and isinstance(generated_value, dict):",
    "        result = dict(existing_value)",
    "        for key, value in generated_value.items():",
    "            result[key] = merge(result.get(key), value)",
    "        return result",
    "    if isinstance(existing_value, list) and isinstance(generated_value, list):",
    "        result = list(existing_value)",
    "        seen = {stable_key(item) for item in result}",
    "        for item in generated_value:",
    "            key = stable_key(item)",
    "            if key not in seen:",
    "                result.append(item)",
    "                seen.add(key)",
    "        return result",
    "    return generated_value",
    "",
    "merged = merge(existing, generated)",
    "with open(target_path, 'w', encoding='utf-8') as f:",
    "    json.dump(merged, f, ensure_ascii=False, indent=2)",
    "    f.write('\\n')",
    "PY",
    "else",
    "  cp \"$settings_file\" .claude/settings.json",
    "fi",
    "rm -f \"$settings_file\"",
    "",
    "backup_if_exists .claude/hooks/agent-guard.sh",
    "cat > .claude/hooks/agent-guard.sh <<'AGENT_ONBOARDING_HOOK'",
    guardScript,
    "AGENT_ONBOARDING_HOOK",
    "chmod +x .claude/hooks/agent-guard.sh",
    "",
    "printf '\\nClaude Code onboarding files are ready in %s\\n' \"$(pwd)\"",
    "printf '  - CLAUDE.md\\n'",
    "printf '  - .claude/settings.json\\n'",
    "printf '  - .claude/hooks/agent-guard.sh\\n'",
    "printf '\\nNext: start Claude Code from this project directory, then run /status, /permissions, /hooks and /sandbox to verify the active policy.\\n'",
  ].join("\n");
}

function buildCodexProjectSetupScript() {
  const agentsSection = buildCodexAgentsSection();
  const configToml = buildCodexConfigToml();
  const rulesFile = buildCodexRulesFile();
  const guardScript = buildCodexGuardHookScript();
  return [
    "#!/usr/bin/env bash",
    "set -euo pipefail",
    "",
    "mkdir -p .codex/hooks .codex/rules",
    "timestamp=\"$(date +%Y%m%d%H%M%S)\"",
    "",
    "backup_if_exists() {",
    "  if [ -e \"$1\" ]; then",
    "    cp \"$1\" \"$1.bak.$timestamp\"",
    "  fi",
    "}",
    "",
    "replace_or_append_section() {",
    "  file=\"$1\"",
    "  start_marker=\"$2\"",
    "  end_marker=\"$3\"",
    "  section_file=\"$4\"",
    "  if [ -f \"$file\" ] && grep -Fq \"$start_marker\" \"$file\"; then",
    "    awk -v start=\"$start_marker\" -v end=\"$end_marker\" -v section=\"$section_file\" '",
    "      $0 == start { while ((getline line < section) > 0) print line; skipping=1; next }",
    "      $0 == end { skipping=0; next }",
    "      !skipping { print }",
    "    ' \"$file\" > \"$file.tmp.$$\"",
    "    mv \"$file.tmp.$$\" \"$file\"",
    "  else",
    "    touch \"$file\"",
    "    if [ -s \"$file\" ]; then printf '\\n\\n' >> \"$file\"; fi",
    "    cat \"$section_file\" >> \"$file\"",
    "  fi",
    "}",
    "",
    "write_codex_config() {",
    "  file='.codex/config.toml'",
    "  config_file=\"$1\"",
    "  start_marker='# AGENT_ONBOARDING_CHECKER_START'",
    "  end_marker='# AGENT_ONBOARDING_CHECKER_END'",
    "  if [ -f \"$file\" ] && grep -Fq \"$start_marker\" \"$file\"; then",
    "    awk -v start=\"$start_marker\" -v end=\"$end_marker\" -v section=\"$config_file\" '",
    "      $0 == start { while ((getline line < section) > 0) print line; skipping=1; next }",
    "      $0 == end { skipping=0; next }",
    "      !skipping { print }",
    "    ' \"$file\" > \"$file.tmp.$$\"",
    "    mv \"$file.tmp.$$\" \"$file\"",
    "  else",
    "    backup_if_exists \"$file\"",
    "    cp \"$config_file\" \"$file\"",
    "  fi",
    "}",
    "",
    "backup_if_exists AGENTS.md",
    "section_file=\"$(mktemp)\"",
    "cat > \"$section_file\" <<'AGENT_ONBOARDING_AGENTS'",
    agentsSection,
    "AGENT_ONBOARDING_AGENTS",
    "replace_or_append_section AGENTS.md '<!-- AGENT_ONBOARDING_CHECKER_START -->' '<!-- AGENT_ONBOARDING_CHECKER_END -->' \"$section_file\"",
    "rm -f \"$section_file\"",
    "",
    "config_file=\"$(mktemp)\"",
    "cat > \"$config_file\" <<'AGENT_ONBOARDING_CODEX_CONFIG'",
    configToml,
    "AGENT_ONBOARDING_CODEX_CONFIG",
    "write_codex_config \"$config_file\"",
    "rm -f \"$config_file\"",
    "",
    "backup_if_exists .codex/rules/agent_onboarding.rules",
    "cat > .codex/rules/agent_onboarding.rules <<'AGENT_ONBOARDING_CODEX_RULES'",
    rulesFile,
    "AGENT_ONBOARDING_CODEX_RULES",
    "",
    "backup_if_exists .codex/hooks/agent_guard.py",
    "cat > .codex/hooks/agent_guard.py <<'AGENT_ONBOARDING_CODEX_HOOK'",
    guardScript,
    "AGENT_ONBOARDING_CODEX_HOOK",
    "chmod +x .codex/hooks/agent_guard.py",
    "",
    "printf '\\nCodex onboarding files are ready in %s\\n' \"$(pwd)\"",
    "printf '  - AGENTS.md\\n'",
    "printf '  - .codex/config.toml\\n'",
    "printf '  - .codex/rules/agent_onboarding.rules\\n'",
    "printf '  - .codex/hooks/agent_guard.py\\n'",
    "printf '\\nNext: open Codex in this project, trust the project if prompted, then run /status, /permissions, /hooks and /debug-config to verify the active policy.\\n'",
  ].join("\n");
}

function buildExecutablePasteCommand(setupScript, marker) {
  return [
    `bash <<'${marker}'`,
    setupScript,
    marker,
  ].join("\n");
}

async function copyInstallCommand(button, setupScript, marker, toolName, fileSummary) {
  const defaultLabel = button.dataset.defaultLabel || button.textContent;
  button.dataset.defaultLabel = defaultLabel;
  try {
    await navigator.clipboard.writeText(buildExecutablePasteCommand(setupScript, marker));
    button.textContent = "已复制";
    apiStatus.textContent = `${toolName} 命令已复制。进入目标项目目录后直接粘贴回车，会创建 ${fileSummary}。`;
  } catch {
    button.textContent = "复制失败";
    apiStatus.textContent = "浏览器拒绝访问剪贴板，可以换到 HTTPS/localhost 后再试。";
  }
  window.setTimeout(() => {
    button.textContent = defaultLabel;
  }, 1600);
}

copyClaudeBtn.addEventListener("click", () => {
  copyInstallCommand(
    copyClaudeBtn,
    buildClaudeProjectSetupScript(),
    "AGENT_ONBOARDING_CLAUDE_INSTALL",
    "Claude Code",
    "CLAUDE.md、项目级 .claude/settings.json、sandbox 配置和 PreToolUse hook",
  );
});

copyCodexBtn.addEventListener("click", () => {
  copyInstallCommand(
    copyCodexBtn,
    buildCodexProjectSetupScript(),
    "AGENT_ONBOARDING_CODEX_INSTALL",
    "Codex",
    "AGENTS.md、项目级 .codex/config.toml、.codex/rules/agent_onboarding.rules、workspace-write sandbox、on-request approval 和 hooks",
  );
});

function parseModelIds(data) {
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return uniq(
    list
      .map((item) => (typeof item === "string" ? item : item?.id || item?.name))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
  );
}

function renderProviderMenu() {
  providerMenu.innerHTML = "";
  let currentGroup = "";

  providers.forEach((provider) => {
    if (provider.group !== "自定义" && provider.group !== currentGroup) {
      currentGroup = provider.group;
      const group = document.createElement("div");
      group.className = "select-group";
      group.textContent = currentGroup;
      providerMenu.appendChild(group);
    }

    if (provider.group === "自定义" && currentGroup !== "自定义") {
      currentGroup = "自定义";
      const group = document.createElement("div");
      group.className = "select-group";
      group.textContent = "自定义";
      providerMenu.appendChild(group);
    }

    const option = document.createElement("button");
    option.type = "button";
    option.className = "select-option";
    option.dataset.providerId = provider.id;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(provider.id === providerSelect.value));
    option.textContent = provider.name;
    option.addEventListener("mousedown", (event) => event.preventDefault());
    option.addEventListener("click", () => selectProvider(provider.id));
    providerMenu.appendChild(option);
  });
}

function updateProviderTrigger() {
  const provider = getProvider();
  providerTriggerText.textContent = provider.name;
  [...providerMenu.querySelectorAll(".select-option")].forEach((option) => {
    option.setAttribute("aria-selected", String(option.dataset.providerId === providerSelect.value));
  });
}

function showProviderMenu() {
  hideModelMenu();
  renderProviderMenu();
  updateProviderTrigger();
  providerMenu.hidden = false;
  providerTrigger.setAttribute("aria-expanded", "true");
}

function hideProviderMenu() {
  providerMenu.hidden = true;
  providerTrigger.setAttribute("aria-expanded", "false");
}

function selectProvider(id) {
  hideProviderMenu();
  applyProvider(id);
  if (id !== "custom") providerTrigger.focus();
}

function focusProviderOption(direction) {
  const options = [...providerMenu.querySelectorAll(".select-option")];
  if (!options.length) return;
  const currentIndex = options.indexOf(document.activeElement);
  const nextIndex = currentIndex === -1
    ? direction > 0 ? 0 : options.length - 1
    : (currentIndex + direction + options.length) % options.length;
  options[nextIndex].focus();
}

function renderModelMenu(options = {}) {
  const shouldFilter = options.filter === true;
  const query = modelInput.value.trim().toLowerCase();
  const visibleModels = shouldFilter && query
    ? availableModelIds.filter((id) => id.toLowerCase().includes(query))
    : availableModelIds;

  modelMenu.innerHTML = "";

  if (!availableModelIds.length) {
    const empty = document.createElement("div");
    empty.className = "model-empty";
    empty.textContent = "先获取模型列表，或直接手动填写模型名。";
    modelMenu.appendChild(empty);
    return;
  }

  if (!visibleModels.length) {
    const empty = document.createElement("div");
    empty.className = "model-empty";
    empty.textContent = "没有匹配模型，当前输入仍会作为模型名使用。";
    modelMenu.appendChild(empty);
    return;
  }

  visibleModels.slice(0, 80).forEach((id) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "model-option";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(id === modelInput.value.trim()));
    option.textContent = id;
    option.addEventListener("mousedown", (event) => event.preventDefault());
    option.addEventListener("click", () => selectModel(id));
    modelMenu.appendChild(option);
  });

  if (visibleModels.length > 80) {
    const more = document.createElement("div");
    more.className = "model-empty";
    more.textContent = `已显示前 80 个，继续输入可缩小范围。`;
    modelMenu.appendChild(more);
  }
}

function showModelMenu(options = {}) {
  hideProviderMenu();
  renderModelMenu(options);
  modelMenu.hidden = false;
  modelInput.setAttribute("aria-expanded", "true");
  modelMenuBtn.setAttribute("aria-expanded", "true");
}

function hideModelMenu() {
  modelMenu.hidden = true;
  modelInput.setAttribute("aria-expanded", "false");
  modelMenuBtn.setAttribute("aria-expanded", "false");
}

function selectModel(id) {
  modelInput.value = id;
  hideModelMenu();
  resetTestFeedback({ autoDetect: true });
  updateProviderBadges();
  modelInput.focus();
}

function focusModelOption(direction) {
  const options = [...modelMenu.querySelectorAll(".model-option")];
  if (!options.length) return;
  const currentIndex = options.indexOf(document.activeElement);
  const nextIndex = currentIndex === -1
    ? direction > 0 ? 0 : options.length - 1
    : (currentIndex + direction + options.length) % options.length;
  options[nextIndex].focus();
}

function renderModelOptions(modelIds, options = {}) {
  availableModelIds = modelIds;
  renderModelMenu();

  if (modelIds.length && (!modelInput.value.trim() || !modelIds.includes(modelInput.value.trim()))) {
    modelInput.value = modelIds[0];
    resetTestFeedback({ autoDetect: true });
  }
  modelHint.textContent = `已获取 ${modelIds.length} 个模型。点箭头可查看列表，输入关键词可过滤。`;
  updateProviderBadges();
  if (options.open) showModelMenu();
}

function setTestFeedback(state, message, buttonText = "检测可用性") {
  testStatus.dataset.state = state;
  testStatus.textContent = message;
  testModelBtn.dataset.state = state;
  testModelBtn.textContent = buttonText;
}

function getModelConfig() {
  return {
    apiKey: apiKeyInput.value.trim(),
    baseUrl: normalizeBaseUrl(baseUrlInput.value),
    model: modelInput.value.trim(),
  };
}

function resetTestFeedback(options = {}) {
  window.clearTimeout(modelTestTimer);
  testModelBtn.classList.remove("loading");
  testModelBtn.dataset.state = "";
  testModelBtn.textContent = "检测可用性";
  const { apiKey, baseUrl, model } = getModelConfig();

  if (!apiKey) {
    testStatus.dataset.state = "idle";
    testStatus.textContent = "填写 API Key 后，会自动检测当前模型是否可用。";
    return;
  }
  if (!baseUrl) {
    testStatus.dataset.state = "idle";
    testStatus.textContent = "已填写 API Key；请补上 Base URL，随后会自动检测。";
    return;
  }
  if (!model) {
    testStatus.dataset.state = "idle";
    testStatus.textContent = "已填写 API Key；请选择或填写模型名，随后会自动检测。";
    return;
  }

  setTestFeedback("queued", `配置已就绪，将自动检测 ${compactProviderName(getProvider().name)} · ${model}。`, "等待检测");
  if (options.autoDetect) scheduleModelTest();
}

function scheduleModelFetch() {
  window.clearTimeout(modelFetchTimer);
  const apiKey = apiKeyInput.value.trim();
  const baseUrl = normalizeBaseUrl(baseUrlInput.value);
  if (!apiKey || !baseUrl) return;
  modelFetchTimer = window.setTimeout(() => fetchAvailableModels({ auto: true }), 700);
}

function scheduleModelTest() {
  window.clearTimeout(modelTestTimer);
  const { apiKey, baseUrl, model } = getModelConfig();
  if (!apiKey || !baseUrl || !model) return;
  modelTestTimer = window.setTimeout(() => testModelAvailability({ auto: true }), 1200);
}

async function fetchAvailableModels(options = {}) {
  const isAuto = options.auto === true;
  const apiKey = apiKeyInput.value.trim();
  const baseUrl = normalizeBaseUrl(baseUrlInput.value);

  if (!baseUrl) {
    if (!isAuto) {
      apiStatus.textContent = "先填 Base URL，通常长得像 https://example.com/v1。";
      baseUrlInput.focus();
    }
    return;
  }
  if (!apiKey) {
    if (!isAuto) {
      apiStatus.textContent = "先填 API Key 再拉模型列表；有些平台的 /models 必须鉴权。";
      apiKeyInput.focus();
    }
    return;
  }

  fetchModelsBtn.classList.add("loading");
  fetchModelsBtn.textContent = isAuto ? "自动获取中..." : "获取中...";
  apiStatus.textContent = `正在请求 ${baseUrl}/models...`;

  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: buildAuthHeaders(apiKey),
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || `请求失败 ${response.status}`);
    }

    const modelIds = parseModelIds(data);
    if (!modelIds.length) {
      throw new Error("接口返回了结果，但没有识别到模型 id。");
    }

    renderModelOptions(modelIds, { open: !isAuto });
    baseUrlInput.value = baseUrl;
    apiStatus.textContent = `已获取 ${modelIds.length} 个模型。选一个，或继续手动填写模型名。`;
  } catch (error) {
    const detail = sentenceEnd(formatRequestError(error, baseUrl));
    clearModelOptions("获取失败，继续手动填写模型名");
    apiStatus.textContent = `模型列表获取失败：${detail}可以直接手动填写模型名。`;
  } finally {
    fetchModelsBtn.classList.remove("loading");
    fetchModelsBtn.textContent = "获取模型列表";
  }
}

async function testModelAvailability(options = {}) {
  window.clearTimeout(modelTestTimer);
  const isAuto = options.auto === true;
  const { apiKey, baseUrl, model } = getModelConfig();

  if (!apiKey) {
    const message = "先填 API Key，再检测模型是否可用。";
    setTestFeedback("error", message, "缺 API Key");
    apiStatus.textContent = message;
    if (!isAuto) apiKeyInput.focus();
    return;
  }
  if (!baseUrl) {
    const message = "先填 Base URL，再检测模型是否可用。";
    setTestFeedback("error", message, "缺 Base URL");
    apiStatus.textContent = message;
    if (!isAuto) baseUrlInput.focus();
    return;
  }
  if (!model) {
    const message = "先填模型名，或先获取模型列表。";
    setTestFeedback("error", message, "缺模型名");
    apiStatus.textContent = message;
    if (!isAuto) modelInput.focus();
    return;
  }

  testModelBtn.classList.add("loading");
  setTestFeedback("loading", `正在检测 ${compactProviderName(getProvider().name)} · ${model}...`, "检测中...");
  apiStatus.textContent = `正在检测 ${model} 是否可用...`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(apiKey),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: "请只回复 OK，用来检测当前模型接口是否可用。",
          },
        ],
      }),
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error?.message || `请求失败 ${response.status}`);
    }

    const output = extractOutputText(data);
    const message = output
      ? `检测通过：${compactProviderName(getProvider().name)} · ${model} 可用。`
      : `检测通过：接口可用，但返回内容为空。`;
    setTestFeedback("success", message, "检测通过");
    apiStatus.textContent = message;
    updateProviderBadges();
  } catch (error) {
    const detail = sentenceEnd(formatRequestError(error, baseUrl));
    const message = `检测失败：${detail}可以检查 Key、Base URL，或手动换一个模型名。`;
    setTestFeedback("error", message, "检测失败");
    apiStatus.textContent = message;
  } finally {
    testModelBtn.classList.remove("loading");
  }
}

function extractOutputText(data) {
  const chatMessage = data.choices?.[0]?.message;
  if (Array.isArray(chatMessage?.content)) {
    return chatMessage.content
      .map((item) => item.text || item.content || "")
      .join("\n")
      .trim();
  }
  if (chatMessage?.content) return chatMessage.content;
  if (data.output_text) return data.output_text;
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim() || JSON.stringify(data, null, 2);
}

async function runAiAnalysis() {
  const apiKey = apiKeyInput.value.trim();
  const baseUrl = normalizeBaseUrl(baseUrlInput.value);
  const model = modelInput.value.trim();
  if (!apiKey) {
    apiStatus.textContent = "先填 API Key，或者继续使用本地规则版。";
    openSettings(apiKeyInput);
    apiKeyInput.focus();
    return;
  }
  if (!baseUrl) {
    apiStatus.textContent = "先填 Base URL，例如 https://api.openai.com/v1，或选择一个服务商预设。";
    openSettings(baseUrlInput);
    baseUrlInput.focus();
    return;
  }
  if (!model) {
    apiStatus.textContent = "先填模型名；也可以点「获取模型列表」自动选择。";
    openSettings(modelInput);
    modelInput.focus();
    return;
  }

  analyze();
  analyzeBtn.classList.add("loading");
  analyzeBtn.textContent = "体检中...";
  policyBadge.textContent = "AI 生成中";
  sandboxLevel.textContent = "生成中";
  hookCount.textContent = "生成中";
  apiStatus.textContent = `正在请求 ${baseUrl}/chat/completions...`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(apiKey),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: promptInput.value,
          },
          {
            role: "user",
            content: buildAiInput(),
          },
        ],
      }),
    });

    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(data.error?.message || `请求失败 ${response.status}`);
    }

    const output = extractOutputText(data);
    const hasStructuredContent = applyAiEnhancement(output);
    setActiveResultTab("policy");
    apiStatus.textContent = hasStructuredContent
      ? "AI 建议已写入工作制度、沙箱配置和 Hooks。"
      : "AI 返回的不是结构化 JSON，已写入工作制度补充判断。";
  } catch (error) {
    analyze();
    apiStatus.textContent = buildAiRequestFailureMessage(error, baseUrl);
  } finally {
    analyzeBtn.classList.remove("loading");
    updatePrimaryButtonLabel();
  }
}

applyThemePreference(readThemePreference(), { persist: false });
renderProviders();
updateSampleButtonLabel();
analyze();
setActiveResultTab("policy");
