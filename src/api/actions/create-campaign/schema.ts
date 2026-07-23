import { z } from "zod";

export const venueSchema = z.object({
  name: z.string().min(1, "Nome da academia é obrigatório."),
  city: z.string(),
  state: z.string(),
});

export const missionSchema = z.object({
  title: z.string().min(1, "Título da missão é obrigatório."),
  description: z.string(),
  xp_value: z.number().int().nonnegative(),
  validation_type: z.enum(["qr", "manual", "auto"]),
  repeatable: z.boolean(),
  max_per_day: z.number().int().nonnegative(),
  active: z.boolean(),
});

export const createCampaignSchema = z.object({
  title: z.string().min(1, "Título é obrigatório."),
  slug: z.string().min(1, "Slug é obrigatório."),
  brand_name: z.string().min(1, "Marca é obrigatória."),
  logo_url: z
    .string()
    .refine((v) => v === "" || z.url().safeParse(v).success, "URL de logo inválida."),
  primary_color: z.string(),
  contract_starts_at: z.string().min(1, "Data de início da contratação é obrigatória."),
  contract_ends_at: z.string().min(1, "Data de fim da contratação é obrigatória."),
  active: z.boolean(),
  admin_email: z
    .string()
    .refine((v) => v === "" || z.email().safeParse(v).success, "Email inválido."),
  venues: z.array(venueSchema).min(1, "Adicione pelo menos uma academia."),
  missions: z.array(missionSchema).min(1, "Adicione pelo menos uma missão."),
});

export type VenueInput = z.infer<typeof venueSchema>;
export type MissionInput = z.infer<typeof missionSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
