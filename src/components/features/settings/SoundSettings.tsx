"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { soundEffects } from "@/lib/notifications";

export function SoundSettings() {
	const [enabled, setEnabled] = useState(true);
	const soundEffectsId = useId();

	useEffect(() => {
		setEnabled(soundEffects.isEnabled());
	}, []);

	const handleToggle = (checked: boolean) => {
		setEnabled(checked);
		soundEffects.setEnabled(checked);
		if (checked) {
			soundEffects.play("click");
		}
	};

	return (
		<div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
			<div className="flex items-center gap-3">
				{enabled ? (
					<Volume2 className="h-5 w-5 text-slate-400" />
				) : (
					<VolumeX className="h-5 w-5 text-slate-500" />
				)}
				<Label htmlFor={soundEffectsId} className="text-slate-200">
					音響効果
				</Label>
			</div>
			<Switch
				id={soundEffectsId}
				checked={enabled}
				onCheckedChange={handleToggle}
			/>
		</div>
	);
}
