# cloudflare-ddns-with-tunnel

Update Cloudflare A records with IP from Zero Trust Tunnel with Worker

## How to use it?

Prerequisites: DNS handled by Cloudflare; Tunnel configured correctly.

1. Clone this repository.
2. Take the domain that needs DDNS as **`DOMAIN_NAME`**.
3. Create a token with permissions `Cloudflare One Connector: cloudflared:Read` and `DNS:Edit` as your **`CLOUDFLARE_API_TOKEN`** @ https://dash.cloudflare.com/profile/api-tokens.
4. In `Zero Trust - Networks - Tunnels`, take `Tunnel ID` as **`CLOUDFLARE_TUNNEL_ID`**.
5. Find your **`CLOUDFLARE_ZONE_ID`** and **`CLOUDFLARE_ACCOUNT_ID`** @ https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids;
6. Use the script to deploy.

   ```bash
   bash deploy.sh
   ```

7. Access the worker and you can see a brief summary about the result.
8. It is scheduled to run once every minute.

# cloudflare-ddns-with-tunnel

用 Worker 根据 Zero Trust Tunnel 的结果更新 A 记录。

## 如何使用？

前提：DNS 由 Cloudflare 管理并正确配置 Zero Trust Tunnel。

1. 克隆你的仓库。
2. 记下你需要 DDNS 服务的域名作为 **`DOMAIN_NAME`**。
3. 在 https://dash.cloudflare.com/profile/api-tokens 创建一个带有账户 `Cloudflare One 连接器：Cloudflared:读取` 和区域 `DNS:编辑` 权限的令牌，作为 **`CLOUDFLARE_API_TOKEN`**。
4. 在 `Zero Trust - 网络 - Tunnels` 菜单记下 `隧道 ID`，作为 **`CLOUDFLARE_TUNNEL_ID`**。
5. 在 https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids 找到 **`CLOUDFLARE_ZONE_ID`** 和 **`CLOUDFLARE_ACCOUNT_ID`**。
6. 运行脚本部署。

   ```bash
   bash deploy.sh
   ```

7. 访问 worker 可见工作总结。
8. 项目会自动每分钟运行一次。
