import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Participante não usa Supabase Auth (ver AUTENTICAÇÃO-PARTICIPANTE no
// CLAUDE.md) — o cookie carrega só o user_id, assinado com HMAC pra impedir
// forjar o id de outra pessoa. Comparação em tempo constante (timingSafeEqual)
// pra não vazar a assinatura correta por diferença de tempo de resposta.
function getSecret() {
  const secret = process.env.PARTICIPANT_SESSION_SECRET;
  if (!secret) throw new Error("PARTICIPANT_SESSION_SECRET não configurado.");
  return secret;
}

export function signParticipantSession(userId: string) {
  const signature = createHmac("sha256", getSecret()).update(userId).digest("hex");
  return `${userId}.${signature}`;
}

export function verifyParticipantSession(cookieValue: string | undefined) {
  if (!cookieValue) return null;

  const [userId, signature] = cookieValue.split(".");
  if (!userId || !signature) return null;

  const expectedSignature = createHmac("sha256", getSecret())
    .update(userId)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  return userId;
}
