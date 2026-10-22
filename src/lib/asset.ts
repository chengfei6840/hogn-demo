/**
 * public/ 下的静态资源必须拼上 Vite 的 base 前缀。
 * 部署到 GitHub Pages 子路径（如 /hogn-demo/）时，写死 "/xxx.png" 会请求到域名根，
 * 必然 404；而且构建与部署流水线都是绿的，只有真点进页面才看得见。
 * 新增静态资源引用时一律走这里，别再在组件里手写绝对路径。
 */
export const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`
