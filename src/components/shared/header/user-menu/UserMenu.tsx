"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserWithEmail } from "@/entities/user";

type UserMenuProps = {
	user: UserWithEmail;
};

export const UserMenu = ({ user }: UserMenuProps) => {
	const avatarUrl = user.avatarUrl;
	const name = user.name || "User";
	const email = user.email;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				>
					<Avatar className="h-8 w-8">
						<AvatarImage src={avatarUrl || undefined} alt={name} />
						<AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56" sideOffset={16}>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">{name}</p>
						{email && (
							<p className="text-muted-foreground text-xs leading-none">
								{email}
							</p>
						)}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile" className="cursor-pointer">
						<UserIcon className="mr-2 h-4 w-4" />
						<span>Profile</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<form action={signOut}>
						<button
							type="submit"
							className="flex w-full cursor-pointer items-center text-destructive focus:text-destructive"
						>
							<LogOut className="mr-2 h-4 w-4" />
							<span>Log out</span>
						</button>
					</form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
