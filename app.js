const input = document.querySelector("#taskInput");
const analyzeBtn = document.querySelector("#analyzeBtn");
const sampleBtn = document.querySelector("#sampleBtn");
const riskCard = document.querySelector("#riskCard");
const riskScore = document.querySelector("#riskScore");
const riskReason = document.querySelector("#riskReason");
const riskToggleBtn = document.querySelector("#riskToggleBtn");
const riskDetails = document.querySelector("#riskDetails");
const permissions = document.querySelector("#permissions");
const approvals = document.querySelector("#approvals");
const permissionCount = document.querySelector("#permissionCount");
const approvalCount = document.querySelector("#approvalCount");
const permissionPreview = document.querySelector("#permissionPreview");
const approvalPreview = document.querySelector("#approvalPreview");
const brief = document.querySelector("#brief");
const policyBadge = document.querySelector("#policyBadge");
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
const copyPanelBtn = document.querySelector("#copyPanelBtn");
let modelFetchTimer;
let modelTestTimer;
let availableModelIds = [];
let activeResultTab = "policy";
const apiKeyCachePrefix = "agent-checker-api-key:";

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

const SYSTEM_PROMPT = `你是一名 AI Agent 安全入职官。请用中文分析用户准备交给 Agent 的任务，把建议写成可以直接放进产品界面的结构化结果。

请只输出 JSON，不要 Markdown，不要代码块，不要额外解释。JSON 结构如下：

{
  "riskLevel": "低风险 / 中风险 / 高风险 三选一",
  "riskReason": "一句话说明具体触发点",
  "workPolicy": [
    "写给 Agent 的工作制度，5-7 条，每条必须是可执行的制度"
  ],
  "sandboxRules": [
    "沙箱配置建议，4-6 条，每条要说明限制、记录或回滚边界"
  ],
  "hooks": [
    "hook-name：触发条件 -> 暂停、记录、阻断或要求确认的动作"
  ]
}

要求：
- 不要建议用户把真实密钥、cookie、隐私数据直接交给 Agent
- 不要鼓励绕过审批、删除日志、隐藏操作记录
- 不要写“加强安全意识”这类空话，要写具体规则
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

const codeSample = "帮我修复这个仓库里的登录 bug，允许运行测试和改代码，但不要修改 .env，不要直接 git push。";
const dataSample = "帮我登录公司后台，导出本月客户数据，整理成表格，再发给销售群。";

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

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  themeToggleBtn.textContent = nextTheme === "dark" ? "浅色" : "深色";
  themeToggleBtn.setAttribute("aria-pressed", String(nextTheme === "dark"));
  localStorage.setItem("agent-checker-theme", nextTheme);
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

function getActivePanelText() {
  if (activeResultTab === "policy") return brief.textContent.trim();
  const panel = resultPanels.find((item) => item.dataset.panel === activeResultTab);
  const items = panel ? getPanelItems(panel) : [];
  return items.map((item) => `- ${item}`).join("\n");
}

function buildRiskDetails(matchedRules) {
  if (!matchedRules.length) {
    return ["没有命中高危关键词，仍建议保留日志和只读边界"];
  }
  return matchedRules.map((rule) => {
    const matchedKeys = rule.keys.filter((key) => input.value.includes(key)).slice(0, 4).join(" / ");
    return `${matchedKeys || rule.keys[0]}：${rule.approval}`;
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
  riskReason.textContent = reason || "这个任务适合 Agent 自主处理，保留日志和只读边界即可。";
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
      workPolicy: [],
      sandboxRules: [],
      hooks: [],
    };
  }

  return {
    rawText: String(output || "").trim(),
    riskLevel: normalizeRiskLevel(data.riskLevel || data.level || data.risk),
    riskReason: String(data.riskReason || data.reason || data.summary || "").trim(),
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
  const localApprovals = [...approvals.querySelectorAll("li")].map((li) => li.textContent);
  const hasStructuredPolicy = enhancement.workPolicy.length > 0;
  const hasStructuredContent = hasStructuredPolicy || enhancement.sandboxRules.length > 0 || enhancement.hooks.length > 0;

  applyRiskResult(level, reason);
  brief.textContent = formatPolicyBrief({
    title: hasStructuredContent ? "AI 员工工作制度" : "AI 补充后的工作制度",
    task,
    level,
    reason,
    workPolicy: enhancement.workPolicy,
    approvals: localApprovals,
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
        ? "这个任务可以交给 Agent，但需要明确边界，至少保留关键动作审批。"
        : "这个任务适合 Agent 自主处理，保留日志和只读边界即可。";

  const permissionItems = uniq(matched.map((rule) => rule.permission));
  const approvalItems = uniq(matched.map((rule) => rule.approval));
  const fallbackPermissions = ["只读资料权限", "记录完整操作日志"];
  const fallbackApprovals = ["访问新网站或要求额外权限时停下来问人"];

  applyRiskResult(level, reason);

  const finalPermissions = permissionItems.length ? permissionItems : fallbackPermissions;
  const finalApprovals = approvalItems.length ? approvalItems : fallbackApprovals;
  renderList(permissions, finalPermissions);
  renderList(approvals, finalApprovals);
  renderList(riskDetails, buildRiskDetails(matched));
  riskDetails.hidden = riskToggleBtn.getAttribute("aria-expanded") !== "true";
  permissionCount.textContent = `${finalPermissions.length} 项`;
  approvalCount.textContent = `${finalApprovals.length} 项`;
  updateSummaryPreviews(finalPermissions, finalApprovals);

  const sandboxItems = buildSandboxRules(level, text);
  const hookItems = buildHooks(text);
  renderList(sandboxRules, sandboxItems);
  renderList(hooks, hookItems);
  sandboxLevel.textContent = sandboxModeForRisk(level);
  hookCount.textContent = `${hookItems.length} 个`;
  policyBadge.textContent = "本地版";

  brief.textContent = formatPolicyBrief({
    title: "AI 员工入职说明",
    task: text || "未填写任务",
    level,
    workPolicy: [
      "默认使用沙箱环境，不直接触碰真实生产数据",
      "文件写入限制在任务目录或临时分支",
      "网络访问采用白名单，新增域名必须确认",
    ],
    approvals: finalApprovals,
    checklist: [
      "说明改了什么、为什么改、影响哪些文件或数据",
      "给出可复现的测试或检查步骤",
      "不发送、不删除、不提交任何未经确认的结果",
    ],
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
riskToggleBtn.addEventListener("click", () => {
  const shouldOpen = riskDetails.hidden;
  riskDetails.hidden = !shouldOpen;
  riskToggleBtn.setAttribute("aria-expanded", String(shouldOpen));
  riskToggleBtn.textContent = shouldOpen ? "收起触发点" : "查看触发点";
});
sampleBtn.addEventListener("click", () => {
  input.value = input.value === codeSample ? dataSample : codeSample;
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
  applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
});

copyPromptBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptInput.value);
  apiStatus.textContent = "提示词已复制，可以直接拿去改。";
});

copyPanelBtn.addEventListener("click", async () => {
  const content = getActivePanelText();
  try {
    await navigator.clipboard.writeText(content);
    copyPanelBtn.textContent = "已复制";
  } catch {
    copyPanelBtn.textContent = "复制失败";
  }
  window.setTimeout(() => {
    copyPanelBtn.textContent = "复制当前";
  }, 1200);
});

function buildSandboxRules(level, text) {
  const items = [
    "文件写入限制在任务目录或临时分支",
    "默认记录命令、文件变更和外部请求",
  ];
  if (level !== "低风险") items.unshift("网络访问使用白名单，新增域名必须确认");
  if (text.includes("后台") || text.includes("客户") || text.includes("数据")) {
    items.push("真实客户数据先脱敏，导出动作必须人工确认");
  }
  if (text.includes(".env") || text.includes("token") || text.includes("密钥")) {
    items.push("密钥文件默认不可读，触碰凭证立即暂停");
  }
  if (text.includes("push") || text.includes("PR") || text.includes("提交")) {
    items.push("禁止直接推送主分支，只允许生成待 review 的变更");
  }
  return items;
}

function buildHooks(text) {
  const items = [
    "pre-command：拦截 rm、drop、delete、git push 等高危命令",
    "post-edit：改文件后自动生成变更摘要",
    "pre-submit：提交前扫描 .env、token、cookie、secret",
    "final-check：交付前列出测试结果和未确认风险",
  ];
  if (text.includes("网页") || text.includes("后台") || text.includes("浏览器")) {
    items.push("browser-action：点击提交、发送、删除、付款按钮前暂停");
  }
  if (text.includes("数据") || text.includes("客户") || text.includes("用户")) {
    items.push("data-export：导出或复制个人数据前暂停并记录用途");
  }
  return items;
}

function buildAiInput() {
  return [
    "任务",
    input.value.trim() || "未填写任务",
    "",
    "本地规则体检结果",
    brief.textContent,
    "",
    "沙箱配置建议",
    [...sandboxRules.querySelectorAll("li")].map((li) => `- ${li.textContent}`).join("\n"),
    "",
    "Hooks 门卫脚本",
    [...hooks.querySelectorAll("li")].map((li) => `- ${li.textContent}`).join("\n"),
  ].join("\n");
}

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

applyTheme(localStorage.getItem("agent-checker-theme") || "light");
renderProviders();
analyze();
setActiveResultTab("policy");
