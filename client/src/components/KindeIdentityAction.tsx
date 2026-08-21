/** Kākāriki Kai design philosophy: identity state is concise, truthful and never confused with POC role simulation. */
import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getKindeSession, isKindeConfigured, signInWithKinde, signOutFromKinde, type KindeSession } from "@/lib/kinde";

export function KindeIdentityAction() {
  const [session, setSession] = useState<KindeSession | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = isKindeConfigured();

  useEffect(() => {
    if (!configured) return;
    void getKindeSession().then(setSession).catch(() => setSession(null));
  }, [configured]);

  async function signIn(): Promise<void> {
    setLoading(true);
    try { await signInWithKinde(); } finally { setLoading(false); }
  }

  async function signOut(): Promise<void> {
    setLoading(true);
    try { await signOutFromKinde(); } finally { setLoading(false); }
  }

  if (!configured) return <div className="topbar__status"><span className="status-dot" /> SSO setup pending</div>;
  if (session) return <Button type="button" variant="outline" size="sm" onClick={() => void signOut()} disabled={loading}><LogOut size={15} /> {session.displayName}</Button>;
  return <Button type="button" variant="outline" size="sm" onClick={() => void signIn()} disabled={loading}><LogIn size={15} /> Sign in</Button>;
}
