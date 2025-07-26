export const getURL = () => {
	let url =
		process?.env?.NEXT_PUBLIC_SITE_URL ?? // 本番環境で設定
		process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercelが自動設定
		"http://localhost:3000/"; // 開発環境のデフォルト

	// httpsを含めるように修正
	url = url.startsWith("http") ? url : `https://${url}`;
	// 末尾のスラッシュを確保
	url = url.endsWith("/") ? url : `${url}/`;

	return url;
};
