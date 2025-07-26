export const generateWebsiteSchema = () => {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "デイリーリワード",
		description: "RPGスタイルの報酬システムで毎日の楽しみを提供",
		url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};
};

export const generateGameSchema = () => {
	return {
		"@context": "https://schema.org",
		"@type": "VideoGame",
		name: "デイリーリワード",
		description:
			"毎日ログインして報酬をゲット！ルーレットやミニゲームで特別なアイテムを獲得しよう",
		genre: ["RPG", "カジュアルゲーム"],
		gamePlatform: "Web",
		applicationCategory: "Game",
		operatingSystem: "Any",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "JPY",
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.5",
			ratingCount: "1234",
		},
	};
};

export const generateBreadcrumbSchema = (
	items: Array<{ name: string; url: string }>,
) => {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
};

export const generateFAQSchema = (
	faqs: Array<{ question: string; answer: string }>,
) => {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};
};

export const generateOrganizationSchema = () => {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "デイリーリワード",
		url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
		logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
		sameAs: [
			"https://twitter.com/dailyrewards",
			"https://www.facebook.com/dailyrewards",
		],
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "customer support",
			availableLanguage: ["Japanese"],
		},
	};
};
