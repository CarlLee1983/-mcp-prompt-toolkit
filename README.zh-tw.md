# @carllee1983/prompt-toolkit

<div align="center">

**適用於 MCP 的提示倉庫治理工具集**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/CarlLee1983/prompts-tooling-sdk)
[![Production Ready](https://img.shields.io/badge/production-ready-success.svg)](https://github.com/CarlLee1983/prompts-tooling-sdk)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

</div>

## 📋 簡介

`@carllee1983/prompt-toolkit` 是一套**生產就緒**的 TypeScript 工具集，專為驗證與管理 Model Context Protocol (MCP) 所使用的提示倉庫而設計。它提供對 registry 檔案、提示定義與 partials 目錄的完整驗證，確保提示倉庫的完整性與正確性。

**版本 1.0.0** 標示穩定發布，並提供 API 穩定性保證。從 1.0.0 開始，工具集遵循語義化版本控制，並在主版本內保持向後兼容。

## ✨ 特色

- **Registry 驗證**：驗證 `registry.yaml` 的結構並確保所有引用的檔案存在
- **提示檔驗證**：依據結構定義檢查單一提示 YAML 檔
- **Partials 驗證**：驗證 partials 目錄結構與檔案存在性
- **Partials 使用驗證**：偵測模板中缺少的 partials 與循環相依
- **倉庫驗證**：一次性檢查所有元件的完整倉庫驗證流程
- **型別安全**：完整的 TypeScript 型別支援
- **結構驗證**：基於 Zod 的結構驗證，提供穩健的型別檢查
- **程式碼品質**：ESLint 設定與自動格式化
- **Git Hooks**：Pre-commit hook 自動執行 lint 修復
- **完善測試**：88 個單元測試，涵蓋完整功能
- **生產就緒**：穩定的 API 與語義化版本控制保證
- **API 穩定性**：主版本內保持向後兼容

## 🚀 安裝

### 作為依賴套件

```bash
# 使用 npm
npm install @carllee1983/prompt-toolkit

# 使用 pnpm
pnpm add @carllee1983/prompt-toolkit

# 使用 yarn
yarn add @carllee1983/prompt-toolkit
```

### 全域安裝（CLI）

```bash
# 使用 npm
npm install -g @carllee1983/prompt-toolkit

# 使用 pnpm
pnpm add -g @carllee1983/prompt-toolkit

# 使用 yarn
yarn global add @carllee1983/prompt-toolkit
```

### 使用 npx（無需安裝）

```bash
# 直接執行命令，無需安裝
npx @carllee1983/prompt-toolkit validate repo
```

## ⚡ 快速開始（5 分鐘）

在 5 分鐘內開始使用 prompt-toolkit！

### 步驟 1：安裝

```bash
npm install -g @carllee1983/prompt-toolkit
```

### 步驟 2：導航到您的倉庫

```bash
cd /path/to/your/prompt-repository
```

### 步驟 3：驗證

```bash
prompt-toolkit validate repo
```

### 步驟 4：檢查結果

**成功：**
```
✅ Repository validation passed!
Summary: 0 fatal(s), 0 error(s), 0 warning(s), 0 info(s)
```

**發現錯誤：**
工具會顯示：
- 哪些檔案有錯誤
- 錯誤碼和嚴重程度
- 修復問題的提示
- 檔案位置

### 下一步

- 📖 閱讀[使用指南](#-使用方式)了解詳細命令
- 🔍 探索[錯誤碼](#-錯誤碼與嚴重程度)了解驗證結果
- 📚 查看[範例](examples/)了解實際使用場景
- 🤝 了解[與 MCP Prompt Manager 整合](#-與-mcp-prompt-manager-整合)

## 💡 使用案例

### CI/CD 整合

在 CI/CD 流程中驗證提示倉庫，確保部署前的品質：

```yaml
# .github/workflows/validate-prompts.yml
- name: Validate prompts
  run: prompt-toolkit validate repo --exit-code --severity error
```

查看[CI/CD 整合範例](examples/ci-cd-integration/)了解完整工作流程。

### 本地開發

在開發過程中驗證提示，及早發現錯誤：

```bash
# 監看模式（如果已實作）
prompt-toolkit validate repo --watch

# 提交前驗證
prompt-toolkit validate repo --exit-code
```

### 團隊協作

確保所有團隊成員遵循相同的提示結構：

```bash
# 驗證並分享結果
prompt-toolkit validate repo --format json --output validation-results.json
```

### 自動化監控

與監控系統整合以追蹤倉庫健康狀態：

```javascript
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'

const result = validatePromptRepo('./prompts')
if (!result.passed) {
  // 發送警報到監控系統
  sendAlert(result.summary)
}
```

查看[整合範例](examples/integration/)了解更多場景。

## 📖 使用方式

### CLI 使用方式

此套件包含一個 CLI 工具，可從命令列驗證與管理提示倉庫。

#### 安裝

安裝套件後，CLI 可透過 `prompt-toolkit` 命令使用：

```bash
# 使用 npx（無需安裝）
npx @carllee1983/prompt-toolkit --help

# 或全域安裝
npm install -g @carllee1983/prompt-toolkit
prompt-toolkit --help
```

#### CLI 命令

**驗證命令：**
```bash
# 驗證整個倉庫
prompt-toolkit validate repo [path]

# 驗證 registry.yaml
prompt-toolkit validate registry [path] --repo-root <path>

# 驗證單一提示檔
prompt-toolkit validate file <file-path>

# 驗證 partials 目錄
prompt-toolkit validate partials [path] --partials-path <path>
```

**檢查命令：**
```bash
# 檢查 partials 使用情況（缺少的 partials 與循環相依）
prompt-toolkit check partials [path]
```

**列表命令：**
```bash
# 列出所有 prompts
prompt-toolkit list prompts [path] [--group <name>] [--enabled-only]

# 列出所有 groups
prompt-toolkit list groups [path] [--enabled-only]
```

**統計資訊：**
```bash
# 顯示倉庫統計資訊
prompt-toolkit stats [path]
```

**輸出選項：**
- `--format <json|text>` - 輸出格式（預設：text）
- `--output <file>` - 將輸出寫入檔案
- `--exit-code` - 驗證失敗時以非零退出碼退出

**範例：**
```bash
# 以 JSON 格式驗證倉庫
prompt-toolkit validate repo --format json

# 檢查 partials 並將結果儲存到檔案
prompt-toolkit check partials --format json --output results.json

# 列出所有啟用的 prompts
prompt-toolkit list prompts --enabled-only

# 以 JSON 格式顯示統計資訊
prompt-toolkit stats --format json
```

### 程式化使用方式

#### API 穩定性

從版本 1.0.0 開始，所有公開 API 都是**穩定**的，並遵循語義化版本控制：

- **1.x.x**：向後兼容 - 無破壞性變更
- **2.0.0+**：破壞性變更（附遷移指南）

詳見 [API 穩定性文檔](docs/API_STABILITY.md)。

#### 從 0.4.x 遷移

從 0.4.x 升級到 1.0.0 **無需修改程式碼** - API 完全向後兼容。詳見 [遷移指南](docs/MIGRATION_GUIDE.md)。

### 基本範例

```typescript
import { validatePromptRepo } from '@carllee1983/prompt-toolkit'

// 驗證整個提示倉庫
const result = validatePromptRepo('/path/to/prompt-repo')

if (result.passed) {
  console.log('Repository validation passed!')
} else {
  console.error('Validation errors:', result.errors)
}
```

### 驗證 Registry

```typescript
import { validateRegistry } from '@carllee1983/prompt-toolkit'

const result = validateRegistry('/path/to/registry.yaml', '/path/to/repo-root')

if (result.success) {
  console.log('Registry is valid:', result.data)
} else {
  console.error('Registry validation failed:', result.error)
}
```

### 驗證提示檔

```typescript
import { validatePromptFile } from '@carllee1983/prompt-toolkit'

const result = validatePromptFile('/path/to/prompt.yaml')

if (result.success) {
  console.log('Prompt is valid:', result.data)
} else {
  console.error('Prompt validation failed:', result.error)
}
```

### 驗證 Partials

```typescript
import { validatePartials } from '@carllee1983/prompt-toolkit'

// 回傳 partial 檔案路徑的陣列；若 partialPath 未設定則回傳空陣列
const partials = validatePartials('/path/to/repo-root', 'partials')

console.log('Found partials:', partials)
```

### 更多範例

查看 [examples 目錄](examples/) 了解：
- [基本使用範例](examples/basic-usage/) - 簡單驗證場景
- [進階場景](examples/advanced-scenarios/) - 自訂錯誤處理、錯誤碼檢查
- [CI/CD 整合](examples/ci-cd-integration/) - GitHub Actions、GitLab CI 工作流程
- [TypeScript 範例](examples/typescript/) - TypeScript 使用模式
- [整合範例](examples/integration/) - MCP Prompt Manager、監控系統
- [實際場景](examples/real-world/) - 批次驗證、CI 流程

## 🔗 與 MCP Prompt Manager 整合

此工具集設計為與 [MCP Prompt Manager](https://github.com/CarlLee1983/mcp-prompt-manager) 無縫整合。

### 工作流程

1. **開發提示**：在倉庫中建立和編輯提示
2. **本地驗證**：使用此工具集在提交前驗證
   ```bash
   prompt-toolkit validate repo
   ```
3. **CI/CD 驗證**：在 CI/CD 流程中自動驗證
4. **部署到 MCP Prompt Manager**：MCP Prompt Manager 載入已驗證的提示

### 最佳實踐

- 在推送到倉庫前驗證提示
- 使用 CI/CD 自動捕捉驗證錯誤
- 監控驗證結果以維持倉庫健康
- 使用嚴重程度過濾以專注於關鍵問題

查看[整合範例](examples/integration/mcp-prompt-manager-integration.js)了解詳細整合程式碼。

## 📚 API 參考

### `validatePromptRepo(repoRoot: string)`

驗證整個提示倉庫，包含 registry、所有提示檔案與 partials。

**參數：**
- `repoRoot`: 倉庫根目錄路徑

**回傳：**
```typescript
{
  passed: boolean
  errors: Array<{ file: string; errors: ZodError }>
}
```

### `validateRegistry(registryPath: string, repoRoot: string)`

驗證 registry.yaml 的結構，並確保所有引用的群組與提示存在。

**參數：**
- `registryPath`: registry.yaml 檔案路徑
- `repoRoot`: 倉庫根目錄路徑

**回傳：**
```typescript
ZodSafeParseReturnType<RegistryDefinition>
```

**可能拋出：**
- 當群組資料夾或提示檔案缺少時拋出 `Error`

### `validatePromptFile(filePath: string)`

依據提示結構驗證單一提示 YAML 檔案。

**參數：**
- `filePath`: 提示 YAML 檔案路徑

**回傳：**
```typescript
ZodSafeParseReturnType<PromptDefinition>
```

### `validatePartials(repoRoot: string, partialPath?: string)`

驗證並回傳指定目錄中的所有 partial 檔案。

**參數：**
- `repoRoot`: 倉庫根目錄路徑
- `partialPath`: 選填，partials 目錄路徑（相對於 repoRoot）

**回傳：**
```typescript
string[] // 檔案路徑陣列
```

**可能拋出：**
- 若提供 partialPath 且 partials 資料夾不存在時拋出 `Error`

## 📝 結構定義

### Registry 結構

```typescript
interface RegistryDefinition {
  version: number
  globals?: Record<string, string>
  partials?: {
    enabled: boolean
    path: string
  }
  groups: Record<string, RegistryGroup>
}

interface RegistryGroup {
  path: string
  enabled: boolean
  prompts: string[]
}
```

### 提示結構

```typescript
interface PromptDefinition {
  id: string
  title: string
  description: string
  args: Record<string, PromptArg>
  template: string
}

interface PromptArg {
  type: 'string' | 'number' | 'boolean' | 'object'
  description?: string
  required?: boolean
  default?: unknown
}
```

## 🧪 測試

```bash
# 執行測試
pnpm test

# 監看模式執行測試
pnpm test

# 單次執行測試
pnpm test:run

# 產生覆蓋率報告（本地開發）
pnpm test:coverage

# 產生覆蓋率報告並檢查門檻（CI 模式）
pnpm test:coverage:ci

# 產生覆蓋率報告並開啟 HTML 報告
pnpm test:coverage:view
```

### 測試覆蓋率

本專案透過完善的測試覆蓋率維持高程式碼品質，設有以下門檻：

- **語句覆蓋率**：≥ 80%
- **行覆蓋率**：≥ 75%
- **函數覆蓋率**：≥ 75%
- **分支覆蓋率**：≥ 70%

#### 查看覆蓋率報告

1. **本地開發**：執行 `pnpm test:coverage:view` 會產生並自動在瀏覽器中開啟 HTML 覆蓋率報告。

2. **CI/CD**：覆蓋率報告會在 CI 中自動產生並上傳為 artifacts。您可以從 GitHub Actions 工作流程執行中下載：
   - 前往儲存庫的 Actions 標籤
   - 選擇一個工作流程執行
   - 下載 `coverage-reports` artifact
   - 解壓縮並在瀏覽器中開啟 `coverage/index.html`

3. **覆蓋率門檻**：如果未達到覆蓋率門檻，CI 流程會失敗，確保在合併或發布前維持程式碼品質標準。

## 🛠️ 開發

```bash
# 安裝相依套件
pnpm install

# 建置專案
pnpm build

# 監看模式建置
pnpm dev

# 執行 linter
pnpm lint

# 自動修復 lint 問題
pnpm lint:fix
```

## 🔧 程式碼品質

本專案使用 ESLint 確保程式碼品質與一致性：

- **ESLint 設定**：現代扁平配置格式（ESLint 9+）
- **TypeScript 支援**：完整的 TypeScript linting，使用 `@typescript-eslint`
- **程式碼風格**：強制不使用分號、單引號等專案規範
- **Pre-commit Hooks**：使用 Husky 在每次 commit 前自動執行 `lint:fix`

### Pre-commit Hook

專案包含 pre-commit hook，會自動：
- 在 commit 前對所有檔案執行 ESLint 修復
- 將修復後的檔案重新加入 staging area
- 確保 commit 前的程式碼品質

當你執行 `pnpm install` 時會自動設定（透過 `prepare` script）。

## ❓ 常見問題（FAQ）

### 一般問題

**Q: 什麼是提示倉庫？**  
A: 提示倉庫是一個結構化的提示模板集合，按群組組織，用於 Model Context Protocol (MCP) 系統。

**Q: 我需要全域安裝嗎？**  
A: 不需要，您可以使用 `npx @carllee1983/prompt-toolkit` 無需安裝，或將其安裝為專案依賴。

**Q: 可以使用 TypeScript 嗎？**  
A: 可以！套件包含完整的 TypeScript 型別定義。查看[TypeScript 範例](examples/typescript/)了解使用模式。

### 驗證問題

**Q: 如果驗證失敗會發生什麼？**  
A: CLI 會顯示詳細的錯誤資訊，包括錯誤碼、嚴重程度、檔案位置和提示。使用 `--exit-code` 讓 CI/CD 流程在錯誤時失敗。

**Q: 可以依嚴重程度過濾錯誤嗎？**  
A: 可以！使用 `--severity` 選項：`prompt-toolkit validate repo --severity warning` 以顯示警告和錯誤。

**Q: 如何驗證多個倉庫？**  
A: 在腳本中使用程式化 API。查看[批次驗證範例](examples/real-world/batch-validation.js)。

### 錯誤處理

**Q: fatal、error、warning 和 info 有什麼區別？**  
A: 
- **fatal**：阻止驗證繼續的嚴重錯誤（例如，缺少 registry 檔案）
- **error**：應該修復的驗證失敗
- **warning**：需要審查的非關鍵問題
- **info**：資訊性訊息

**Q: 如何處理特定錯誤碼？**  
A: 使用 `ERROR_CODE_CONSTANTS` 並依錯誤碼過濾。查看[錯誤碼檢查範例](examples/advanced-scenarios/error-code-checker.js)。

### CI/CD 問題

**Q: 如何整合到 GitHub Actions？**  
A: 查看[GitHub Actions 範例](examples/ci-cd-integration/github-actions.yml)了解完整工作流程。

**Q: 可以取得 JSON 輸出以便解析嗎？**  
A: 可以！使用 `--format json` 取得機器可讀的輸出：`prompt-toolkit validate repo --format json`。

**Q: 如何在驗證錯誤時讓 CI 失敗？**  
A: 使用 `--exit-code` 標誌：`prompt-toolkit validate repo --exit-code`。

### 故障排除

**Q: "Registry file not found" 錯誤**  
A: 確保 `registry.yaml` 存在於倉庫根目錄。檢查您正在驗證的路徑。

**Q: "Partial not found" 錯誤**  
A: 檢查 partial 檔案是否存在於 partials 目錄中，以及模板中的路徑是否正確。

**Q: "Circular dependency" 錯誤**  
A: Partials 在循環中互相引用。檢視您的 partial 相依關係並打破循環。

更多故障排除幫助，請查看[故障排除指南](docs/TROUBLESHOOTING.md)。

## 🔧 故障排除

### 常見問題

#### Registry 檔案未找到

**錯誤**：`REGISTRY_FILE_NOT_FOUND` (fatal)

**解決方案**：
1. 確保 `registry.yaml` 存在於倉庫根目錄
2. 檢查路徑：`prompt-toolkit validate repo /正確/路徑`
3. 驗證檔案權限

#### 無效的 YAML 語法

**錯誤**：`FILE_NOT_YAML` (error)

**解決方案**：
1. 使用線上 YAML 驗證器驗證 YAML 語法
2. 檢查縮排問題（YAML 對空格敏感）
3. 確保沒有使用 tab（使用空格代替）

#### 缺少 Partials

**錯誤**：`PARTIAL_NOT_FOUND` (error)

**解決方案**：
1. 驗證 partial 檔案存在於 `partials/` 目錄中
2. 檢查模板中的 partial 路徑（例如，`{{> partial-name}}`）
3. 確保 `registry.yaml` 中的 partials 目錄路徑正確

#### 循環相依

**錯誤**：`PARTIAL_CIRCULAR_DEPENDENCY` (error)

**解決方案**：
1. 檢視 partial 相依關係
2. 透過重構 partials 打破循環引用
3. 使用錯誤的 `meta.chain` 查看相依循環

#### 結構驗證錯誤

**錯誤**：`PROMPT_SCHEMA_INVALID` 或 `REGISTRY_SCHEMA_INVALID` (error)

**解決方案**：
1. 檢查[結構定義](#-結構定義)區塊
2. 確保所有必填欄位都存在
3. 驗證欄位型別符合結構

### 取得幫助

- 📖 查看[使用指南](#-使用方式)了解詳細使用
- 🔍 檢視[錯誤碼](#-錯誤碼與嚴重程度)了解錯誤含義
- 💡 查看[範例](examples/)了解使用模式
- 🐛 開啟[Issue](https://github.com/CarlLee1983/mcp-prompt-toolkit/issues) 如果您發現錯誤
- 💬 查看[FAQ](#-常見問題faq)了解常見問題

## 📚 額外文檔

- **[API 穩定性](docs/API_STABILITY.md)**：API 穩定性保證與版本控制策略
- **[遷移指南](docs/MIGRATION_GUIDE.md)**：從 0.4.x 升級到 1.0.0 的指南
- **[使用案例](docs/USE_CASES.md)**：實際使用場景與範例
- **[最佳實踐](docs/BEST_PRACTICES.md)**：推薦的模式與實踐
- **[快速參考](docs/QUICK_REFERENCE.md)**：命令與 API 快速參考
- **[故障排除](docs/TROUBLESHOOTING.md)**：常見問題與解決方案

## 📦 專案結構

```
prompts-tooling-sdk/
├── src/
│   ├── index.ts              # 主要進入點
│   ├── validators/           # 驗證函式
│   │   ├── validateRepo.ts
│   │   ├── validateRegistry.ts
│   │   ├── validatePromptFile.ts
│   │   ├── validatePartials.ts
│   │   └── validatePartialsUsage.ts
│   ├── partials/             # Partials 工具
│   │   ├── extractPartials.ts
│   │   ├── resolvePartialPath.ts
│   │   ├── buildPartialGraph.ts
│   │   └── detectCircular.ts
│   ├── schema/               # Zod 結構定義
│   │   ├── registry.schema.ts
│   │   └── prompt.schema.ts
│   ├── types/                # TypeScript 型別定義
│   │   ├── registry.ts
│   │   └── prompt.ts
│   └── utils/                # 工具函式
│       ├── loadYaml.ts
│       └── walkDir.ts
├── test/                     # 測試檔案
├── .husky/                   # Git hooks (pre-commit)
├── dist/                     # 建置產物
├── eslint.config.mjs         # ESLint 設定檔
└── package.json
```

## 📄 授權

ISC

## 👤 作者

CarlLee1983

## 🤝 貢獻

歡迎任何形式的貢獻！請隨時提交 Pull Request。

## 📝 更新日誌

### [0.3.1] - CI/CD 增強

- 新增 GitHub Actions CI workflow
- 自動化 lint、test 和 build 檢查
- 改善開發流程可靠性
- 確保合併前程式碼品質

### [0.3.0] - CLI 工具發佈

- 新增完整的 CLI 工具，提供命令列介面
- 實作驗證命令（repo, registry, file, partials）
- 實作檢查命令（partials 使用情況）
- 實作列表命令（prompts, groups）
- 實作統計命令，顯示倉庫統計資訊
- 支援文字和 JSON 兩種輸出格式
- 彩色終端機輸出與載入動畫
- 支援輸出到檔案與退出碼控制
- 新增 CLI 文件與使用範例

### [0.2.0] - 程式碼品質與 Partials 增強

- 新增 ESLint 設定，支援 TypeScript
- 新增 Husky pre-commit hooks，自動執行 lint 修復
- 新增 partials 使用驗證（偵測缺少的 partials 與循環相依）
- 增強倉庫驗證，包含 partials 使用檢查
- 改善型別安全，使用明確的錯誤型別
- 新增 partials 功能的完整單元測試（總計 82 個測試）
- 新增 CLI 工具，包含 validate、check、list 和 stats 命令
- 支援文字和 JSON 兩種輸出格式
- 更新套件名稱為 `@carllee1983/prompt-toolkit`

### [0.1.0] - 初始版本

- prompts-tooling-sdk 初始發佈
- Registry 驗證功能
- 提示檔驗證功能
- Partials 目錄驗證功能
- 完整的倉庫驗證流程
- YAML 載入與資料夾掃描工具
- 完整的單元測試套件（28 個測試案例）
- TypeScript 專案設定與建置配置
