# /bin/bash
echo Installing Dependencies...

pnpm install

echo

for key in CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN CLOUDFLARE_TUNNEL_ID CLOUDFLARE_ZONE_ID DOMAIN_NAME; do
    echo Enter value for $key
    wrangler secret put $key
    echo
done

echo Deploying...
wrangler deploy
