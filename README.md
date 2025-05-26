# 效率清单

一个基于React的现代化待办事项和时间管理应用程序，帮助用户提高工作效率和时间管理能力。

## 功能特点

- **多功能待办任务管理**：创建、编辑、完成和删除任务，按日期分组显示已完成任务
- **专注计时器**：基于番茄工作法的专注时间管理工具，帮助用户保持专注
- **自动布局适配**：根据屏幕尺寸自动调整最佳布局模式
  - 小屏幕 (< 768px): 标准卡片模式
  - 大屏幕 (> 1024px): 全屏模式
- **数据统计分析**：可视化展示任务完成情况和专注时间记录
- **笔记功能**：记录想法和感悟，支持内容与感想分开记录
- **全屏工作模式**：提供沉浸式的工作环境，最大化专注效率
- **本地数据存储**：使用浏览器本地存储，确保数据安全和隐私

## 技术栈

- **前端框架**：React + TypeScript
- **构建工具**：Vite
- **状态管理**：Zustand
- **持久化存储**：Zustand-persist (localStorage)
- **样式方案**：CSS原生（模块化组织）

## 安装和运行

### 前置条件

- Node.js 16+
- npm 或 yarn

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/lmaonewhow/todolist.git
cd todolist
```

2. 安装依赖

```bash
npm install
# 或使用 yarn
yarn
```

3. 本地开发

```bash
npm run dev
# 或使用 yarn
yarn dev
```

4. 构建生产版本

```bash
npm run build
# 或使用 yarn
yarn build
```

## 使用方法

1. **添加任务**：在待办任务页面输入新任务并点击"添加"
2. **开始专注**：在专注页面输入任务名称，点击"开始专注"
3. **查看统计**：在统计页面查看任务完成情况和专注时间记录
4. **记录笔记**：在笔记页面创建和编辑笔记
5. **切换模式**：双击页面顶部区域调出模式选择菜单

## 界面展示

### 标准卡片模式

![待办任务](/image/img.png)
![已完成任务](/image/img_2.png)

### 全屏模式

![全屏模式](/image/img_1.png)

## 主要功能页面
### 专注计时器

![专注计时器](/image/img_3.png)

### 数据统计

![数据统计标准模式](/image/img_4.png)

### 笔记功能

![笔记标准模式](/image/img_5.png)

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加一些特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 许可证

本项目使用 MIT 许可证 - 详情请查看 [LICENSE](LICENSE) 文件
