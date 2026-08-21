/** Kākāriki Kai identity boundary: Kinde PKCE yields bearer tokens; the API remains the authorization authority. */
import createKindeClient, { type KindeClient } from "@kinde-oss/kinde-auth-pkce-js";

export interface KindeSession {
  displayName: string;
  email?: string;
  organizationCode?: string;
}

const domain = import.meta.env.VITE_KINDE_DOMAIN?.trim();
const clientId = import.meta.env.VITE_KINDE_CLIENT_ID?.trim();
const audience = import.meta.env.VITE_KINDE_API_AUDIENCE?.trim();

let clientPromise: Promise<KindeClient> | undefined;

export function isKindeConfigured(): boolean {
  return Boolean(domain && clientId && audience);
}

async function client(): Promise<KindeClient> {
  if (!isKindeConfigured()) throw new Error("Kinde is not configured for this environment.");
  clientPromise ??= createKindeClient({
    client_id: clientId,
    domain: domain!,
    audience,
    redirect_uri: window.location.origin,
    logout_uri: window.location.origin,
    scope: "openid profile email offline",
  });
  return clientPromise;
}

export async function getKindeSession(): Promise<KindeSession | null> {
  if (!isKindeConfigured()) return null;
  const kinde = await client();
  if (!(await kinde.isAuthenticated())) return null;
  const profile = await kinde.getUserProfile();
  if (!profile) return null;
  const organizationCode = kinde.getOrganization()?.orgCode;
  const displayName = [profile.given_name, profile.family_name].filter(Boolean).join(" ") || profile.email || "Signed-in kaimahi";
  return { displayName, email: profile.email, organizationCode };
}

export async function signInWithKinde(): Promise<void> {
  await (await client()).login({ app_state: { redirectTo: window.location.pathname } });
}

export async function signOutFromKinde(): Promise<void> {
  await (await client()).logout({ redirectUrl: window.location.origin });
}

export async function getKindeAccessToken(): Promise<string> {
  const token = await (await client()).getAccessToken();
  if (!token) throw new Error("A Kinde access token is required to call the Kākāriki Kai API.");
  return token;
}
