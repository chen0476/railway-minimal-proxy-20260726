# Railway 测试记录

测试日期：

2026-07-26

测试目录：

```text
E:\Codex开发中心\部署域名反向代理项目\【新平台测试】域名反向代理线路测试\railway-minimal-proxy-20260726
```

测试源站：

```text
https://httpbingo.org
```

平台默认访问域名：

```text
待部署后填写，常见为 Railway 生成的 railway.app / up.railway.app 域名
```

GitHub 测试仓库：

```text
https://github.com/chen0476/railway-minimal-proxy-20260726
```

## 测试项

| 项目 | 结果 | 证据或备注 |
| --- | --- | --- |
| 默认访问域名格式 | 待线上确认 | Railway 需要手动 Generate Domain |
| 是否能部署反向代理 | 本地通过，线上待测 | Node.js 原生 fetch 最小代理；本地 GET/query/POST 已验证 |
| 是否支持 HTTPS | 待测 | 生成公开域名后验证 |
| 是否会休眠 | 待确认 | 看当前套餐和实测 |
| 国内是否能访问 | 待测 | 用国内浏览器和移动网络实测 |
| 微信内是否能访问 | 待测 | 用微信内置浏览器实测 |
| 首次打开是否慢 | 待测 | 记录冷启动和二次打开耗时 |
| 是否适合后续客户业务 | 待评估 | 至少完成国内、微信、路径、query、POST 后再判断 |

## 当前结论

本地验证通过，GitHub 测试仓库已创建。下一步在 Railway 中从 GitHub 导入仓库部署，并在 Networking / Public Networking 中 Generate Domain。
