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
https://railway-minimal-proxy-20260726-production-c40c.up.railway.app
```

GitHub 测试仓库：

```text
https://github.com/chen0476/railway-minimal-proxy-20260726
```

## 测试项

| 项目 | 结果 | 证据或备注 |
| --- | --- | --- |
| 默认访问域名格式 | 已确认 | `https://<service>-<environment>-<suffix>.up.railway.app` |
| 是否能部署反向代理 | 已确认 | `/health` 和 path/query 测试返回 200，响应头含 `x-proxy-platform-test: railway` |
| 是否支持 HTTPS | 已确认 | `https://railway-minimal-proxy-20260726-production-c40c.up.railway.app` |
| 是否会休眠 | 待确认 | 看当前套餐和实测 |
| 国内是否能访问 | 待测 | 用国内浏览器和移动网络实测 |
| 微信内是否能访问 | 待测 | 用微信内置浏览器实测 |
| 首次打开是否慢 | 待测 | 记录冷启动和二次打开耗时 |
| 是否适合后续客户业务 | 待评估 | 至少完成国内、微信、路径、query、POST 后再判断 |

## 当前结论

本地验证通过，GitHub 测试仓库已创建。Railway 通过手动生成的新公开域名已验证成功：

```text
https://railway-minimal-proxy-20260726-production-c40c.up.railway.app
```

该域名 `/health` 返回 `200 ok`，响应头含 `x-proxy-platform-test: railway`；访问 `/anything/railway-test?x=1` 返回 `200 OK`；`curl -L` 最终地址仍保持 Railway 域名，说明是反向代理，不是跳转。

2026-07-27 处理：

- 用户收到 Railway 邮件提示部署曾崩溃，时间为 `2026-07-27 10:23:48`。
- CLI 已安装，但 `railway whoami` 返回 Unauthorized；未获得账号授权前无法用 CLI 读日志或修改域名端口。
- Railway 页面访问日志较慢，暂未稳定拿到运行日志。
- 代码已改为同时监听 Railway 注入的 `PORT` 和默认 `APP_PORT=3000`，用于同时兼容平台默认端口和当前已生成公开域名的 target port。
- 本地双端口健康检查确认 `3000` 与 `8080` 均返回 `200 ok`；线上需等待 Railway 自动部署后复测。
- 最新提交 `82ad5ea` 已推送到 GitHub 触发 Railway 自动部署。
- 线上复测：通过本地代理访问仍未拿到应用 `/health` 响应；直连 DNS 可解析到 Railway IP，但 HTTPS 直连超时。普通 `railway login` 与 `railway login --browserless` 均未自动完成授权。

2026-07-27 手动域名复测：

- 旧域名 `https://railway-minimal-proxy-20260726-production.up.railway.app` 曾返回 502。
- 用户手动生成新域名 `https://railway-minimal-proxy-20260726-production-c40c.up.railway.app`。
- 新域名验证通过，`/health` 首字节约 1.15 秒，首页最终 URL 保持 Railway 域名。

2026-07-27 CLI 状态：

- Railway CLI 已登录：`1221847@qq.com`。
- 当前目录已 link 到成功项目：
  - Project：`calm-intuition`
  - Project ID：`ea6f8813-74c3-4171-a2d4-f513db3a5a8c`
  - Environment：`production`
  - Environment ID：`b27b40ad-8b3e-40e0-8b90-2546968e7431`
  - Service：`railway-minimal-proxy-20260726`
  - Service ID：`5f048027-1958-47ab-b76b-5b02ce1dc9e0`
- 可直接使用：
  - `railway.cmd status --json`
  - `railway.cmd domain list --json`
  - `railway.cmd logs --lines 50`
  - `railway.cmd variable --json`
- 日志确认应用同时监听 `8080` 和 `3000`；有效域名 target port 为 `3000`。
