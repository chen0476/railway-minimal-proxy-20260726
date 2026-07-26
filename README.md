# Railway 最小反向代理测试

用途：

- 测试 Railway 是否能作为国外平台反向代理入口。
- 访问 Railway 生成的默认域名时，浏览器地址栏保持 Railway 域名，内容来自测试源站。
- 只用于线路和平台能力验证，不用于正式客户。

测试源站：

```text
https://httpbingo.org
```

本地测试：

```powershell
$env:ORIGIN='https://httpbingo.org'
$env:APP_PORT='3000'
npm.cmd run check
npm.cmd start
```

Railway 部署方式：

1. 打开 Railway 控制台。
2. New Project。
3. Deploy from GitHub repo。
4. 选择仓库：

```text
chen0476/railway-minimal-proxy-20260726
```

5. 设置变量：

```text
ORIGIN=https://httpbingo.org
```

6. 部署完成后，在 Networking / Public Networking 中点击 Generate Domain。
7. Generate Domain 的 target port 填：

```text
3000
```

验证命令：

```powershell
curl.exe -I https://<railway-domain>/html
curl.exe -s "https://<railway-domain>/anything/railway-test?a=1"
curl.exe -s -X POST "https://<railway-domain>/anything/post-test?b=2" -H "content-type: application/x-www-form-urlencoded" --data-urlencode "ok=true"
```

通过标准：

- Railway 默认域名 HTTPS 可访问。
- 地址栏保持 Railway 默认域名。
- `/html` 返回测试源站页面内容。
- path、query、POST body 能转发。
- 响应头包含 `x-proxy-platform-test: railway`。
