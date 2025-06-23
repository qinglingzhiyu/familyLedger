# 设计规范 (Design Spec) - 家庭账本

---

## 1. 设计原则

- **简洁 (Simplicity)**: 界面元素清晰，避免不必要的装饰，让用户专注于核心任务——记账和分析。
- **高效 (Efficiency)**: 优化操作路径，特别是高频的记账流程，力求用最少的步骤完成任务。
- **一致 (Consistency)**: 在不同平台（小程序、App、Web）间保持统一的视觉语言和交互模式，降低用户的学习成本。
- **智能 (Intelligence)**: 通过数据可视化和智能提醒，将复杂的数据转化为易于理解的洞察，帮助用户做出更好的财务决策。

---

## 2. 色彩体系 (Color Palette)

我们采用以品牌绿为主色，搭配中性灰阶和功能色的色彩方案。优先实现 **暗黑模式 (Dark Mode)**，提供沉浸、护眼的视觉体验。

### 2.1 主色 (Primary Color)

用于品牌标识、核心操作按钮、重要信息高亮等场景。

- **品牌绿 (Brand Green)**: `#2ECC71` (一种充满生机与希望的绿色，象征财务健康)

### 2.2 辅色 (Secondary Colors)

用于图表、标签、状态等，增加界面的丰富性和信息区分度。

- **活力橙 (Vibrant Orange)**: `#F39C12` (用于支出、警告、提醒)
- **宁静蓝 (Calm Blue)**: `#3498DB` (用于收入、信息、链接)
- **优雅紫 (Elegant Purple)**: `#9B59B6`
- **清新青 (Fresh Teal)**: `#1ABC9C`

### 2.3 中性色 (Neutral Colors)

用于背景、边框、文字、图标等，构建界面的基础层次。

**暗黑模式 (Dark Mode - Default)**

- **背景 (Background)**: `#121212` (纯黑，OLED屏幕更省电)
- **内容层 (Surface)**: `#1E1E1E` (卡片、弹窗等内容的背景)
- **边框/分割线 (Border)**: `#2D2D2D`
- **一级文字/标题 (Primary Text)**: `#EAEAEA`
- **二级文字/正文 (Secondary Text)**: `#9E9E9E`
- **三级文字/辅助信息 (Tertiary Text)**: `#6E6E6E`

**明亮模式 (Light Mode)**

- **背景 (Background)**: `#F7F8FA` (非常浅的灰色，避免纯白刺眼)
- **内容层 (Surface)**: `#FFFFFF`
- **边框/分割线 (Border)**: `#EBEEF2`
- **一级文字/标题 (Primary Text)**: `#1F2937`
- **二级文字/正文 (Secondary Text)**: `#6B7280`
- **三级文字/辅助信息 (Tertiary Text)**: `#9CA3AF`

### 2.4 功能色 (Functional Colors)

- **危险/错误 (Danger/Error)**: `#E74C3C`
- **成功 (Success)**: `#2ECC71`
- **警告 (Warning)**: `#F1C40F`
- **信息 (Info)**: `#3498DB`

---

## 3. 字体规范 (Typography)

选用清晰易读的无衬线字体，建立统一的字阶和行高规范。

- **字体家族 (Font Family)**: `Inter` (一款在各种屏幕尺寸上都表现出色的开源字体)。如果无法加载，则使用系统默认无衬线字体 (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `"Helvetica Neue"`, `Arial`, `sans-serif`)。
- **字重 (Font Weight)**: 
  - `Regular (400)`: 正文
  - `Medium (500)`: 强调、小标题
  - `SemiBold (600)`: 主要按钮、标题
  - `Bold (700)`: 重要金额、大标题

### 3.1 移动端 (App & 小程序) 字阶

| 用途 | 字号 (Font Size) | 字重 (Weight) | 行高 (Line Height) |
| :--- | :--- | :--- | :--- |
| 大标题 (Display) | 32px | Bold | 40px |
| 页面标题 (Title 1) | 24px | SemiBold | 32px |
| 卡片标题 (Title 2) | 20px | SemiBold | 28px |
| 列表标题 (Title 3) | 17px | Medium | 24px |
| 正文 (Body) | 15px | Regular | 22px |
| 辅助文字 (Caption) | 13px | Regular | 20px |
| 标签 (Label) | 11px | Medium | 16px |

### 3.2 Web后台 字阶

| 用途 | 字号 (Font Size) | 字重 (Weight) | 行高 (Line Height) |
| :--- | :--- | :--- | :--- |
| 页面大标题 | 36px | Bold | 44px |
| 模块标题 | 24px | SemiBold | 32px |
| 表格/卡片标题 | 18px | SemiBold | 28px |
| 正文/输入框 | 14px | Regular | 20px |
| 辅助信息 | 12px | Regular | 16px |

---

## 4. 间距与布局 (Spacing & Layout)

使用基于 **4px** 的网格系统来定义所有间距、内外边距和组件尺寸，确保布局的和谐与一致性。

- **基础单位**: `1 unit = 4px`
- **常用间距**:
  - `1 unit (4px)`: 元素内微小间距
  - `2 units (8px)`: 图标与文字间距
  - `3 units (12px)`: 小组件内边距
  - `4 units (16px)`: 卡片内边距、列表项间距
  - `5 units (20px)`: 
  - `6 units (24px)`: 卡片间距、模块主标题与内容间距
  - `8 units (32px)`: 页面左右主内边距

---

## 5. 图标库 (Iconography)

- **图标库**: **FontAwesome 6**
- **风格**: 优先使用其 `Solid` (实心) 和 `Regular` (常规) 风格，保持视觉统一。
- **尺寸**: 
  - 移动端: `16px`, `20px`, `24px`
  - Web端: `14px`, `16px`, `20px`
- **要求**: 所有图标必须语义化，表意清晰，与功能紧密相关。

---

## 6. 组件规范 (Component Specs)

### 6.1 按钮 (Buttons)

- **主按钮 (Primary)**: 品牌绿背景，白色文字，用于最主要的操作（如“保存”、“登录”）。
- **次按钮 (Secondary)**: 灰色描边，品牌绿文字，用于次要操作。
- **文本按钮 (Tertiary)**: 无背景边框，品牌绿文字，用于风险较低的操作（如“取消”）。
- **尺寸**: 高度规整，移动端建议 `44px`，Web端建议 `36px`。
- **状态**: 必须包含 `hover`, `active`, `disabled` 状态。

### 6.2 输入框 (Input Fields)

- **背景**: `Surface` 色。
- **边框**: `Border` 色，`focus` 状态时变为品牌绿。
- **文字**: `Primary Text` 色。
- **标签 (Label)**: 位于输入框上方，使用 `Caption` 字体样式。

### 6.3 卡片 (Cards)

- **背景**: `Surface` 色。
- **圆角 (Border Radius)**: `12px` (移动端), `8px` (Web端)。
- **阴影 (Shadow)**: 使用柔和、自然的阴影，增加层次感 (仅在明亮模式下明显)。

---

## 7. 平台特定规范

### 7.1 微信小程序

- **导航**: 遵循微信官方的 `Tab Bar` 和 `Navigation Bar` 规范。
- **胶囊按钮**: 页面布局需考虑右上角胶囊按钮的位置，避免内容遮挡。
- **交互**: 使用微信提供的API实现登录、支付、分享等交互，保持原生体验。

### 7.2 App (iOS 优先)

- **设计语言**: 遵循 Apple Human Interface Guidelines (HIG)。
- **导航**: 使用标准的 `UINavigationBar` 和 `UITabBar` 样式。
- **手势**: 支持 iOS 标准的侧滑返回等手势。
- **字体**: 可优先考虑使用 `SF Pro` 字体。

### 7.3 Web 后台管理系统

- **布局**: 采用经典的左侧菜单栏 + 右侧内容区的布局。
- **数据展示**: 优先使用表格 (`Table`) 和数据网格 (`Data Grid`) 来展示大量数据。
- **响应式**: 确保在主流桌面分辨率下（如 `1440px`, `1920px`）布局良好。