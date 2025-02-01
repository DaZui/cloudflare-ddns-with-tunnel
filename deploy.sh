# /bin/bash
echo Installing Dependencies...
bun install

echo

for key in CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN CLOUDFLARE_TUNNEL_ID CLOUDFLARE_ZONE_ID DOMAIN_NAME; do
    echo Enter value for $key
    bun wrangler secret put $key
    echo
done

echo Deploying...
bun wrangler deploy
