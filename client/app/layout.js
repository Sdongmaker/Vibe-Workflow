import "./globals.css";
import I18nProvider from "./components/I18nProvider";

export const metadata = {
  title: "Vibe Workflow - 开源 AI 工作流编排平台",
  description:
    "Vibe Workflow 是一个免费、开源、可自托管的节点式 AI 工作流编排平台，帮助你用可视化节点编辑器构建生成式 AI 流程，无需订阅。",
  keywords: [
    "Vibe Workflow",
    "开源 AI 工作流",
    "节点式 AI 编辑器",
    "生成式 AI 流程",
    "可视化工作流",
    "自托管 AI",
    "AI 工作流自动化",
    "无代码 AI 工作流",
    "AI 图像生成流程",
    "AI 视频生成流程",
    "开源生成式 AI",
  ],
  openGraph: {
    title: "Vibe Workflow - 开源 AI 工作流编排平台",
    description:
      "免费、开源、可自托管的节点式 AI 工作流编排平台，帮助你用可视化节点编辑器构建生成式 AI 流程。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Workflow - 开源 AI 工作流编排平台",
    description:
      "免费、开源、可自托管的节点式 AI 工作流编排平台，帮助你用可视化节点编辑器构建生成式 AI 流程。",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
