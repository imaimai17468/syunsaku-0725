import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const title = searchParams.get("title") || "デイリーリワード";
	const description =
		searchParams.get("description") || "RPGスタイルの報酬システム";

	return new ImageResponse(
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#0f172a",
				backgroundImage:
					"radial-gradient(circle at 25% 25%, #1e293b 0%, #0f172a 50%)",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "40px",
					maxWidth: "900px",
				}}
			>
				{/* アイコン */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: "20px",
					}}
				>
					<svg
						width="80"
						height="80"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#fbbf24"
						strokeWidth="2"
						role="img"
						aria-label="スターアイコン"
					>
						<title>スターアイコン</title>
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
					</svg>
				</div>

				{/* タイトル */}
				<h1
					style={{
						fontSize: "72px",
						fontWeight: "bold",
						color: "#ffffff",
						marginBottom: "20px",
						textAlign: "center",
						textShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
					}}
				>
					{title}
				</h1>

				{/* 説明文 */}
				<p
					style={{
						fontSize: "28px",
						color: "#94a3b8",
						textAlign: "center",
						maxWidth: "800px",
					}}
				>
					{description}
				</p>

				{/* 装飾 */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "20px",
						marginTop: "40px",
					}}
				>
					<div
						style={{
							width: "100px",
							height: "4px",
							background:
								"linear-gradient(to right, transparent, #fbbf24, transparent)",
						}}
					/>
					<div
						style={{
							width: "12px",
							height: "12px",
							borderRadius: "50%",
							backgroundColor: "#fbbf24",
						}}
					/>
					<div
						style={{
							width: "100px",
							height: "4px",
							background:
								"linear-gradient(to right, transparent, #fbbf24, transparent)",
						}}
					/>
				</div>
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	);
}
