import Cloudflare from 'cloudflare';

async function getIPs(client: Cloudflare, account_id: string, tunnelId: string): Promise<Set<string>> {
	const response: Cloudflare.ZeroTrust.TunnelGetResponse = await client.zeroTrust.tunnels.get(tunnelId, { account_id });
	return new Set(
		(response.connections || [])
			.map(({ origin_ip }): string => origin_ip || '')
			.filter((ip): boolean => ip !== '')
			.filter((ip): boolean => ip.includes('.'))
	);
}

async function getRecords(client: Cloudflare, zone_id: string, DOMAIN_NAME: string): Promise<Map<string, string>> {
	return new Map(
		(await Array.fromAsync(client.dns.records.list({ zone_id })))
			.filter(({ name, type }): boolean => type === 'A' && name === DOMAIN_NAME)
			.map(({ content, id }): [string, string] => [content || '', id])
			.filter(([content, id]): boolean => content !== '')
	);
}

async function updateDNSRecord(env: Env): Promise<string> {
	if (env.CLOUDFLARE_API_TOKEN === '') throw 'CLOUDFLARE_API_TOKEN unconfigured. Please add it.';
	if (env.CLOUDFLARE_ACCOUNT_ID === '') throw 'CLOUDFLARE_ACCOUNT_ID unconfigured. Please add it.';
	if (env.CLOUDFLARE_TUNNEL_ID === '') throw 'CLOUDFLARE_TUNNEL_ID unconfigured. Please add it.';
	if (env.CLOUDFLARE_ZONE_ID === '') throw 'CLOUDFLARE_ZONE_ID unconfigured. Please add it.';
	if (env.DOMAIN_NAME === '') throw 'DOMAIN_NAME unconfigured. Please add it.';

	const client = new Cloudflare({ apiToken: env.CLOUDFLARE_API_TOKEN });
	const [IPs, records] = await Promise.all([
		getIPs(client, env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_TUNNEL_ID),
		getRecords(client, env.CLOUDFLARE_ZONE_ID, env.DOMAIN_NAME),
	]);

	const newIPs: Set<string> = new Set([...IPs].filter((ip): boolean => !records.has(ip)));
	const oldIDs: Set<string> = new Set([...records].filter(([ip, id]): boolean => !IPs.has(ip)).map(([ip, id]): string => id));

	if (newIPs.size + oldIDs.size === 0) return 'Created 0 records; Modified 0 records; Deleted 0 records.';

	const toPatch: Map<string, string> = new Map();
	for (let i: number = 0; i < Math.min(newIPs.size, oldIDs.size); i++) {
		const [content] = newIPs;
		const [id] = oldIDs;
		toPatch.set(id, content);
		newIPs.delete(content);
		oldIDs.delete(id);
	}

	const result: Cloudflare.DNS.RecordBatchResponse = await client.dns.records.batch({
		zone_id: env.CLOUDFLARE_ZONE_ID,
		deletes: [...oldIDs].map((id): Cloudflare.DNS.RecordBatchParams.Delete => ({ id })),
		patches: [...toPatch].map(([id, content]): Cloudflare.DNS.BatchPatch.ARecord => ({ content, id })),
		posts: [...newIPs].map((content): Cloudflare.DNS.ARecord => ({ content, name: env.DOMAIN_NAME, type: 'A' })),
	});

	return `Created ${result.posts?.length || 0} records; Modified ${result.patches?.length || 0} records; Deleted ${
		result.deletes?.length || 0
	} records.`;
}

export default {
	async scheduled(event, env: Env, ctx): Promise<void> {
		ctx.waitUntil(updateDNSRecord(env));
	},
	async fetch(request: Request, env: Env, ctx): Promise<Response> {
		const currentURL: URL = new URL(request.url);

		// Only respond to root, in order not to trigger multiple times.
		if (currentURL.pathname !== '/') return new Response('', { status: 404 });

		try {
			return new Response(JSON.stringify(await updateDNSRecord(env)));
		} catch (e: any) {
			return new Response(e, { status: 500 });
		}
	},
} satisfies ExportedHandler<Env>;
