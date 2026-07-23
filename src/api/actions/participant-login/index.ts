"use server";

import { cookies } from "next/headers";
import { getCampaignBySlug } from "@/api/data/campaigns";
import {
  findUserByWhatsapp,
  findCampaignParticipant,
  createParticipant,
  joinCampaign,
} from "@/api/data/participants";
import { signParticipantSession } from "@/api/data/participant-session";
import { participantLoginSchema, type ParticipantLoginInput } from "./schema";

const SESSION_COOKIE = "participant_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano — "sem expiração curta" por design

async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signParticipantSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export type ParticipantLoginResult =
  | { status: "authenticated" }
  | { status: "needs_registration"; isNewUser: boolean };

export async function participantLogin(
  campaignSlug: string,
  input: ParticipantLoginInput,
): Promise<ParticipantLoginResult> {
  const { whatsapp, name, venue_id, lgpd_consent } =
    participantLoginSchema.parse(input);

  const campaign = await getCampaignBySlug(campaignSlug);
  if (!campaign) throw new Error("Campanha não encontrada.");

  const existingUser = await findUserByWhatsapp(whatsapp);

  if (!existingUser) {
    if (!name || !venue_id || !lgpd_consent) {
      return { status: "needs_registration", isNewUser: true };
    }

    const { user } = await createParticipant({
      name,
      whatsapp,
      campaignId: campaign.id,
      venueId: venue_id,
      lgpdConsent: lgpd_consent,
    });

    await setSessionCookie(user.id);
    return { status: "authenticated" };
  }

  const participant = await findCampaignParticipant(campaign.id, existingUser.id);

  if (!participant) {
    if (!venue_id || !lgpd_consent) {
      return { status: "needs_registration", isNewUser: false };
    }

    await joinCampaign({
      campaignId: campaign.id,
      userId: existingUser.id,
      venueId: venue_id,
      lgpdConsent: lgpd_consent,
    });
  }

  await setSessionCookie(existingUser.id);
  return { status: "authenticated" };
}
