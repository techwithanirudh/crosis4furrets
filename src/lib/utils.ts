import fetch from '@replit/node-fetch';
import type { Response } from '@replit/node-fetch';

import { FetchConnectionMetadataError } from '@replit/crosis';
import type { FetchConnectionMetadataResult } from '@replit/crosis';

interface Options {
	token: string;
	replId: string;
}

export const govalMetadata = async (
	signal: AbortSignal,
	options: Options,
): Promise<FetchConnectionMetadataResult> => {
	let res: Response;

	try {
		res = await fetch(
			`https://replit.com/data/repls/${options.replId}/get_connection_metadata`,
			{
				signal,
				method: 'POST',
				headers: {
					'User-Agent': 'Mozilla/5.0',
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
					Referrer: 'https://replit.com',
					Cookie: `connect.sid=${options.token};`,
				},
				body: JSON.stringify({}),
			},
		);
	} catch (error) {
		if (error.name === 'AbortError') {
			return {
				error: new Error(FetchConnectionMetadataError.Aborted),
			};
		}

		throw error;
	}

	if (res.status !== 200) {
		if (res.status > 500) {
			return {
				error: new Error(FetchConnectionMetadataError.Retriable),
			};
		}

		const errorText = await res.text();
		throw new Error(errorText);
	}

	// coerce to type any like previous node-fetch version
	const connectionMetadata = (await res.json()) as any;

	return {
		token: connectionMetadata.token,
		gurl: connectionMetadata.gurl,
		conmanURL: connectionMetadata.conmanURL,
		error: null,
	};
};
