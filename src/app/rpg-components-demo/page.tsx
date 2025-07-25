import { Coins, Gem, Shield, Sword, Zap } from "lucide-react";
import { GameButton } from "@/components/shared/GameButton";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RewardItem } from "@/components/shared/RewardItem";
import { RPGCard } from "@/components/shared/RpgCard";

export default function RPGComponentsDemo() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
			<div className="mx-auto max-w-6xl space-y-8">
				<h1 className="mb-8 text-center font-bold text-4xl text-white">
					RPG Components Demo
				</h1>

				{/* RPG Cards Section */}
				<section className="space-y-4">
					<h2 className="font-bold text-2xl text-white">RPG Cards</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						<RPGCard variant="default">
							<h3 className="mb-2 font-bold text-lg text-white">
								Default Card
							</h3>
							<p className="text-slate-300">
								Basic card with subtle glow effect.
							</p>
						</RPGCard>

						<RPGCard variant="rare">
							<h3 className="mb-2 font-bold text-lg text-white">Rare Card</h3>
							<p className="text-blue-200">Blue themed card for rare items.</p>
						</RPGCard>

						<RPGCard variant="epic">
							<h3 className="mb-2 font-bold text-lg text-white">Epic Card</h3>
							<p className="text-purple-200">
								Purple themed card for epic items.
							</p>
						</RPGCard>

						<RPGCard variant="legendary">
							<h3 className="mb-2 font-bold text-lg text-white">
								Legendary Card
							</h3>
							<p className="text-amber-200">Golden card with shimmer effect.</p>
						</RPGCard>
					</div>
				</section>

				{/* Progress Bars Section */}
				<section className="space-y-4">
					<h2 className="font-bold text-2xl text-white">Progress Bars</h2>
					<RPGCard>
						<div className="space-y-4">
							<ProgressBar
								value={75}
								max={100}
								variant="exp"
								label="Experience"
								showText={true}
							/>

							<ProgressBar
								value={320}
								max={500}
								variant="health"
								label="Health Points"
								showText={true}
							/>

							<ProgressBar
								value={150}
								max={200}
								variant="mana"
								label="Mana Points"
								showText={true}
							/>

							<ProgressBar
								value={85}
								max={100}
								variant="default"
								showText={false}
							/>
						</div>
					</RPGCard>
				</section>

				{/* Reward Items Section */}
				<section className="space-y-4">
					<h2 className="font-bold text-2xl text-white">Reward Items</h2>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
						<RewardItem
							name="Gold Coins"
							description="Basic currency for purchases"
							rarity="common"
							icon={<Coins className="text-yellow-500" />}
							value={100}
							quantity={5}
						/>

						<RewardItem
							name="Magic Gem"
							description="Rare magical crystal"
							rarity="rare"
							icon={<Gem className="text-blue-500" />}
							value={250}
						/>

						<RewardItem
							name="Lightning Sword"
							description="Epic weapon with electric damage"
							rarity="epic"
							icon={<Sword className="text-purple-500" />}
							value={1000}
						/>

						<RewardItem
							name="Dragon Shield"
							description="Legendary protection from ancient dragons"
							rarity="legendary"
							icon={<Shield className="text-amber-500" />}
							value={5000}
						/>

						<RewardItem
							name="Energy Potion"
							description="Restores energy instantly"
							rarity="common"
							icon={<Zap className="text-green-500" />}
							value={50}
							quantity={3}
						/>

						<RewardItem
							name="Mystery Box"
							description="Contains unknown treasures"
							rarity="epic"
							value={500}
							disabled={true}
						/>
					</div>
				</section>

				{/* Game Buttons Section */}
				<section className="space-y-4">
					<h2 className="font-bold text-2xl text-white">Game Buttons</h2>
					<RPGCard>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
							<GameButton variant="primary" size="md">
								Primary Action
							</GameButton>

							<GameButton variant="secondary" size="md">
								Secondary
							</GameButton>

							<GameButton variant="success" size="md" icon={<Coins />}>
								Collect Reward
							</GameButton>

							<GameButton variant="danger" size="md">
								Delete Item
							</GameButton>

							<GameButton variant="legendary" size="md" icon={<Zap />}>
								Legendary Action
							</GameButton>
						</div>

						<div className="mt-4 flex justify-center gap-4">
							<GameButton variant="primary" size="sm">
								Small
							</GameButton>

							<GameButton variant="primary" size="lg">
								Large Button
							</GameButton>

							<GameButton variant="primary" disabled>
								Disabled
							</GameButton>

							<GameButton variant="primary" loading>
								Loading
							</GameButton>
						</div>
					</RPGCard>
				</section>

				{/* Combined Example */}
				<section className="space-y-4">
					<h2 className="font-bold text-2xl text-white">Combined Example</h2>
					<RPGCard variant="legendary" className="mx-auto max-w-md">
						<div className="space-y-4 text-center">
							<h3 className="font-bold text-amber-200 text-xl">
								Daily Login Bonus
							</h3>

							<RewardItem
								name="Legendary Chest"
								description="Contains rare treasures and gold"
								rarity="legendary"
								icon={<Gem className="text-amber-500" />}
								value={2500}
								className="mx-auto max-w-32"
							/>

							<ProgressBar
								value={7}
								max={7}
								variant="exp"
								label="Login Streak"
								showText={true}
							/>

							<GameButton variant="legendary" size="lg" icon={<Zap />}>
								Claim Reward
							</GameButton>
						</div>
					</RPGCard>
				</section>
			</div>
		</div>
	);
}
