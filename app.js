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
const brief = document.querySelector("#brief");
const sandboxRules = document.querySelector("#sandboxRules");
const sandboxLevel = document.querySelector("#sandboxLevel");
const hooks = document.querySelector("#hooks");
const hookCount = document.querySelector("#hookCount");
const promptInput = document.querySelector("#promptInput");
const providerSelect = document.querySelector("#providerSelect");
const baseUrlInput = document.querySelector("#baseUrlInput");
const providerBadge = document.querySelector("#providerBadge");
const settingsProviderBadge = document.querySelector("#settingsProviderBadge");
const apiKeyInput = document.querySelector("#apiKeyInput");
const modelInput = document.querySelector("#modelInput");
const modelList = document.querySelector("#modelList");
const modelSelect = document.querySelector("#modelSelect");
const fetchModelsBtn = document.querySelector("#fetchModelsBtn");
const aiAnalyzeBtn = document.querySelector("#aiAnalyzeBtn");
const copyPromptBtn = document.querySelector("#copyPromptBtn");
const settingsBtn = document.querySelector("#settingsBtn");
const closeSettingsBtn = document.querySelector("#closeSettingsBtn");
const saveSettingsBtn = document.querySelector("#saveSettingsBtn");
const settingsOverlay = document.querySelector("#settingsOverlay");
const themeToggleBtn = document.querySelector("#themeToggleBtn");
const apiStatus = document.querySelector("#apiStatus");
const aiReport = document.querySelector("#aiReport");
const aiBadge = document.querySelector("#aiBadge");

const providers = [
  {
    id: "openai",
    name: "OpenAI 官方",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-5.4",
  },
  {
    id: "zhipu-cn",
    name: "智谱 GLM（国内）",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4.7",
  },
  {
    id: "zhipu-global",
    name: "智谱 GLM（海外）",
    baseUrl: "https://api.z.ai/api/paas/v4",
    model: "glm-4.7",
  },
  {
    id: "kimi",
    name: "Kimi（国内）",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "kimi-k2-0905-preview",
  },
  {
    id: "moonshot-global",
    name: "Moonshot（海外）",
    baseUrl: "https://api.moonshot.ai/v1",
    model: "kimi-k2-0905-preview",
  },
  {
    id: "minimax-cn",
    name: "MiniMax（国内）",
    baseUrl: "https://api.minimaxi.com/v1",
    model: "MiniMax-M2.1",
  },
  {
    id: "minimax-global",
    name: "MiniMax（海外）",
    baseUrl: "https://api.minimax.io/v1",
    model: "MiniMax-M2.1",
  },
  {
    id: "volcengine-ark",
    name: "火山引擎方舟（豆包）",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    model: "doubao-seed-1-6-250615",
  },
  {
    id: "mimo",
    name: "小米 MiMo",
    baseUrl: "https://api.xiaomimimo.com/v1",
    model: "mimo-v2-pro",
    auth: "both",
  },
  {
    id: "dashscope",
    name: "阿里云百炼（通义）",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-5.4",
  },
  {
    id: "custom",
    name: "自定义",
    baseUrl: "",
    model: "",
  },
];

const SYSTEM_PROMPT = `你是一名 AI Agent 安全入职官。请用中文分析用户准备交给 Agent 的任务，输出一份简洁但有判断力的「AI 员工入职体检报告」。

你要像一个懂技术、也懂普通人表达的技术编辑，不要写空话。请按这个结构输出：

1. 风险等级，用「低风险 / 中风险 / 高风险」之一
2. 为什么这么判，指出具体触发点
3. 这名 AI 员工应该拿到哪些临时权限
4. 哪些动作必须暂停并请求人类确认
5. 推荐的沙箱、Hooks、日志和回滚设置
6. 如果要把它放进真实生产环境，还缺哪三件事

要求：
- 不要建议用户把真实密钥、cookie、隐私数据直接交给 Agent
- 不要鼓励绕过审批、删除日志、隐藏操作记录
- 输出要具体，避免泛泛而谈
- 语气像一个认真提醒你的同事，不要像合规报告`;

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

function updateProviderBadges(suffix = "") {
  const provider = getProvider();
  const providerName = compactProviderName(provider.name);
  const model = modelInput.value.trim() || "未选模型";
  providerBadge.textContent = `${providerName} · ${model}${suffix}`;
  settingsProviderBadge.textContent = providerName;
}

function openSettings(focusNode) {
  settingsOverlay.hidden = false;
  document.body.classList.add("settings-open");
  window.setTimeout(() => (focusNode || providerSelect).focus(), 0);
}

function closeSettings() {
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
  providers.forEach((provider) => {
    const option = document.createElement("option");
    option.value = provider.id;
    option.textContent = provider.name;
    providerSelect.appendChild(option);
  });
  applyProvider("openai");
}

function getProvider() {
  return providers.find((provider) => provider.id === providerSelect.value) || providers[0];
}

function applyProvider(providerId) {
  const provider = providers.find((item) => item.id === providerId) || providers[0];
  providerSelect.value = provider.id;
  baseUrlInput.value = provider.baseUrl;
  modelInput.value = provider.model;
  updateProviderBadges();
  clearModelOptions();
  if (provider.id === "custom") {
    apiStatus.textContent = "自定义模式：填 Base URL、API Key 和模型名；如果服务支持 /models，可以点获取模型列表。";
    baseUrlInput.focus();
    return;
  }
  apiStatus.textContent = "预设 Base URL 只是常用入口，真实可用模型以 /models 返回为准；拉不到就手动填模型名。";
}

function clearModelOptions(message = "先获取模型列表，或直接手动填写模型名") {
  modelList.innerHTML = "";
  modelSelect.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.textContent = message;
  modelSelect.appendChild(option);
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

  riskCard.className = `risk-card ${level === "低风险" ? "low" : level === "中风险" ? "medium" : ""}`;
  riskScore.textContent = level;
  riskReason.textContent = reason;

  const finalPermissions = permissionItems.length ? permissionItems : fallbackPermissions;
  const finalApprovals = approvalItems.length ? approvalItems : fallbackApprovals;
  renderList(permissions, finalPermissions);
  renderList(approvals, finalApprovals);
  permissionCount.textContent = `${finalPermissions.length} 项`;
  approvalCount.textContent = `${finalApprovals.length} 项`;

  const sandboxItems = buildSandboxRules(level, text);
  const hookItems = buildHooks(text);
  renderList(sandboxRules, sandboxItems);
  renderList(hooks, hookItems);
  sandboxLevel.textContent = level === "高风险" ? "Strict" : level === "中风险" ? "Guarded" : "Light";
  hookCount.textContent = `${hookItems.length} 个`;

  brief.textContent = [
    "AI 员工入职说明",
    "",
    `任务：${text || "未填写任务"}`,
    `风险等级：${level}`,
    "",
    "工作间设置",
    "- 默认使用沙箱环境，不直接触碰真实生产数据",
    "- 文件写入限制在任务目录或临时分支",
    "- 网络访问采用白名单，新增域名必须确认",
    "",
    "必须暂停并请求人类确认",
    ...finalApprovals.map((item) => `- ${item}`),
    "",
    "交付前自检",
    "- 说明改了什么、为什么改、影响哪些文件或数据",
    "- 给出可复现的测试或检查步骤",
    "- 不发送、不删除、不提交任何未经确认的结果",
  ].join("\n");

  if (!apiKeyInput.value.trim()) {
    aiReport.textContent = [
      "本地规则体检已完成。",
      "",
      "想让这份报告更像真人安全顾问写的，可以点「模型设置」，选择 OpenAI-compatible 服务，填入 API Key 和模型名，然后点击「AI 深度体检」。",
      "页面会把任务、规则体检结果和提示词发给 /chat/completions，生成一份更完整的入职报告。",
    ].join("\n");
    aiBadge.textContent = "Optional";
  }
}

analyzeBtn.addEventListener("click", analyze);
sampleBtn.addEventListener("click", () => {
  input.value = input.value === codeSample ? dataSample : codeSample;
  analyze();
});
providerSelect.addEventListener("change", () => applyProvider(providerSelect.value));
baseUrlInput.addEventListener("input", () => {
  if (providerSelect.value !== "custom") {
    updateProviderBadges(" · 已改");
  }
});
modelInput.addEventListener("input", () => updateProviderBadges());
modelSelect.addEventListener("change", () => {
  if (modelSelect.value) {
    modelInput.value = modelSelect.value;
    updateProviderBadges();
  }
});
fetchModelsBtn.addEventListener("click", fetchAvailableModels);
settingsBtn.addEventListener("click", () => openSettings());
closeSettingsBtn.addEventListener("click", closeSettings);
saveSettingsBtn.addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) closeSettings();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !settingsOverlay.hidden) closeSettings();
});
themeToggleBtn.addEventListener("click", () => {
  applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
});

copyPromptBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(promptInput.value);
  apiStatus.textContent = "提示词已复制，可以直接拿去改。";
});

aiAnalyzeBtn.addEventListener("click", runAiAnalysis);

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

function renderModelOptions(modelIds) {
  modelList.innerHTML = "";
  modelSelect.innerHTML = "";

  modelIds.forEach((id) => {
    const dataOption = document.createElement("option");
    dataOption.value = id;
    modelList.appendChild(dataOption);

    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    modelSelect.appendChild(option);
  });

  if (!modelInput.value.trim() && modelIds.length) {
    modelInput.value = modelIds[0];
  }
  if (modelInput.value.trim()) {
    modelSelect.value = modelInput.value.trim();
  }
  updateProviderBadges();
}

async function fetchAvailableModels() {
  const apiKey = apiKeyInput.value.trim();
  const baseUrl = normalizeBaseUrl(baseUrlInput.value);

  if (!baseUrl) {
    apiStatus.textContent = "先填 Base URL，通常长得像 https://example.com/v1。";
    baseUrlInput.focus();
    return;
  }
  if (!apiKey) {
    apiStatus.textContent = "先填 API Key 再拉模型列表；有些平台的 /models 必须鉴权。";
    apiKeyInput.focus();
    return;
  }

  fetchModelsBtn.classList.add("loading");
  fetchModelsBtn.textContent = "获取中...";
  apiStatus.textContent = `正在请求 ${baseUrl}/models...`;

  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: buildAuthHeaders(apiKey),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || `请求失败 ${response.status}`);
    }

    const modelIds = parseModelIds(data);
    if (!modelIds.length) {
      throw new Error("接口返回了结果，但没有识别到模型 id。");
    }

    renderModelOptions(modelIds);
    baseUrlInput.value = baseUrl;
    apiStatus.textContent = `已获取 ${modelIds.length} 个模型。选一个，或继续手动填写模型名。`;
  } catch (error) {
    clearModelOptions("获取失败，继续手动填写模型名");
    apiStatus.textContent = `模型列表获取失败：${error.message}。可以直接手动填写模型名。`;
  } finally {
    fetchModelsBtn.classList.remove("loading");
    fetchModelsBtn.textContent = "获取模型列表";
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
  aiAnalyzeBtn.classList.add("loading");
  aiAnalyzeBtn.textContent = "体检中...";
  aiBadge.textContent = "Running";
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

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `请求失败 ${response.status}`);
    }

    aiReport.textContent = extractOutputText(data);
    aiBadge.textContent = "AI Report";
    apiStatus.textContent = "AI 深度体检完成。";
  } catch (error) {
    aiReport.textContent = [
      "AI 请求没有成功。",
      "",
      error.message,
      "",
      "如果是浏览器跨域、鉴权格式或密钥安全限制，正式做法是加一个后端代理，把 API Key 放在服务端。",
    ].join("\n");
    aiBadge.textContent = "Error";
    apiStatus.textContent = "AI 请求失败，已保留本地规则报告。";
  } finally {
    aiAnalyzeBtn.classList.remove("loading");
    aiAnalyzeBtn.textContent = "AI 深度体检";
  }
}

applyTheme(localStorage.getItem("agent-checker-theme") || "light");
renderProviders();
analyze();
