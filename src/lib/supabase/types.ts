export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instanciate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "12.2.12 (cd3cf9e)";
	};
	public: {
		Tables: {
			achievements: {
				Row: {
					condition_type: string;
					condition_value: number;
					created_at: string;
					description: string | null;
					icon_url: string | null;
					id: string;
					is_active: boolean;
					name: string;
					reward_exp: number;
				};
				Insert: {
					condition_type: string;
					condition_value: number;
					created_at?: string;
					description?: string | null;
					icon_url?: string | null;
					id?: string;
					is_active?: boolean;
					name: string;
					reward_exp?: number;
				};
				Update: {
					condition_type?: string;
					condition_value?: number;
					created_at?: string;
					description?: string | null;
					icon_url?: string | null;
					id?: string;
					is_active?: boolean;
					name?: string;
					reward_exp?: number;
				};
				Relationships: [];
			};
			daily_activities: {
				Row: {
					activity_date: string;
					created_at: string;
					id: string;
					login_count: number;
					mini_game_completed: boolean;
					mini_game_score: number;
					roulette_completed: boolean;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					activity_date: string;
					created_at?: string;
					id?: string;
					login_count?: number;
					mini_game_completed?: boolean;
					mini_game_score?: number;
					roulette_completed?: boolean;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					activity_date?: string;
					created_at?: string;
					id?: string;
					login_count?: number;
					mini_game_completed?: boolean;
					mini_game_score?: number;
					roulette_completed?: boolean;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "daily_activities_user_id_users_id_fk";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			login_streaks: {
				Row: {
					created_at: string;
					current_streak: number;
					id: string;
					last_login_date: string | null;
					longest_streak: number;
					total_login_days: number;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					current_streak?: number;
					id?: string;
					last_login_date?: string | null;
					longest_streak?: number;
					total_login_days?: number;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					current_streak?: number;
					id?: string;
					last_login_date?: string | null;
					longest_streak?: number;
					total_login_days?: number;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "login_streaks_user_id_users_id_fk";
						columns: ["user_id"];
						isOneToOne: true;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			rate_limits: {
				Row: {
					action_type: string;
					attempt_count: number | null;
					created_at: string | null;
					id: string;
					user_id: string;
					window_start: string | null;
				};
				Insert: {
					action_type: string;
					attempt_count?: number | null;
					created_at?: string | null;
					id?: string;
					user_id: string;
					window_start?: string | null;
				};
				Update: {
					action_type?: string;
					attempt_count?: number | null;
					created_at?: string | null;
					id?: string;
					user_id?: string;
					window_start?: string | null;
				};
				Relationships: [];
			};
			reward_items: {
				Row: {
					created_at: string;
					description: string | null;
					icon_url: string | null;
					id: string;
					is_active: boolean;
					item_type: string;
					name: string;
					rarity: string;
					value: number;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					icon_url?: string | null;
					id?: string;
					is_active?: boolean;
					item_type?: string;
					name: string;
					rarity?: string;
					value?: number;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					icon_url?: string | null;
					id?: string;
					is_active?: boolean;
					item_type?: string;
					name?: string;
					rarity?: string;
					value?: number;
				};
				Relationships: [];
			};
			user_achievements: {
				Row: {
					achieved_at: string;
					achievement_id: string;
					id: string;
					user_id: string;
				};
				Insert: {
					achieved_at?: string;
					achievement_id: string;
					id?: string;
					user_id: string;
				};
				Update: {
					achieved_at?: string;
					achievement_id?: string;
					id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "user_achievements_achievement_id_achievements_id_fk";
						columns: ["achievement_id"];
						isOneToOne: false;
						referencedRelation: "achievements";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "user_achievements_user_id_users_id_fk";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			user_inventory: {
				Row: {
					acquired_at: string;
					id: string;
					is_used: boolean;
					quantity: number;
					reward_item_id: string;
					used_at: string | null;
					user_id: string;
				};
				Insert: {
					acquired_at?: string;
					id?: string;
					is_used?: boolean;
					quantity?: number;
					reward_item_id: string;
					used_at?: string | null;
					user_id: string;
				};
				Update: {
					acquired_at?: string;
					id?: string;
					is_used?: boolean;
					quantity?: number;
					reward_item_id?: string;
					used_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "user_inventory_reward_item_id_reward_items_id_fk";
						columns: ["reward_item_id"];
						isOneToOne: false;
						referencedRelation: "reward_items";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "user_inventory_user_id_users_id_fk";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			user_levels: {
				Row: {
					created_at: string;
					current_exp: number;
					current_level: number;
					id: string;
					total_exp: number;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					current_exp?: number;
					current_level?: number;
					id?: string;
					total_exp?: number;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					current_exp?: number;
					current_level?: number;
					id?: string;
					total_exp?: number;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "user_levels_user_id_users_id_fk";
						columns: ["user_id"];
						isOneToOne: true;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			users: {
				Row: {
					avatar_url: string | null;
					created_at: string;
					id: string;
					name: string | null;
					updated_at: string;
				};
				Insert: {
					avatar_url?: string | null;
					created_at?: string;
					id: string;
					name?: string | null;
					updated_at?: string;
				};
				Update: {
					avatar_url?: string | null;
					created_at?: string;
					id?: string;
					name?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			check_daily_limit: {
				Args: { p_user_id: string; p_activity_type: string };
				Returns: boolean;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
