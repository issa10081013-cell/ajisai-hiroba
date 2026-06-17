"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

const ADMIN_EMAIL = "issa10081013@gmail.com";

type Provider = {
  id: string;
  name: string;
  bio: string;
  phone: string;
  verified: boolean;
  verified_status: string | null;
  image_url: string | null;
};

export default function VerifyPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) { router.push("/"); return; }
      setUserId(user.id);

      const { data } = await supabaseBrowser
        .from("providers")
        .select("id, name, bio, phone, verified, verified_status, image_url")
        .eq("verified_status", "pending")
        .order("id");

      setProviders(data ?? []);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleAction = async (providerId: string, action: "approve" | "reject") => {
    setProcessing(providerId);
    await fetch("/api/approve-provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, action, requesterId: userId }),
    });
    setProviders(prev => prev.filter(p => p.id !== providerId));
    setProcessing(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9ca3af" }}>読み込み中...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F3FA", padding: "24px 16px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1a1a", marginBottom: "4px" }}>公式申請の審査</h1>
        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "24px" }}>申請中の主催者：{providers.length}件</p>

        {providers.length === 0 ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center" }}>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>申請中の主催者はいません</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {providers.map(p => (
              <div key={p.id} style={{ background: "white", borderRadius: "16px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#E8E4F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👤</div>
                  )}
                  <div>
                    <p style={{ fontWeight: 700, color: "#1a1a1a", margin: 0, fontSize: "15px" }}>{p.name}</p>
                    {p.phone && <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>📞 {p.phone}</p>}
                  </div>
                </div>
                {p.bio && <p style={{ fontSize: "13px", color: "#374151", marginBottom: "16px", lineHeight: 1.6 }}>{p.bio}</p>}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleAction(p.id, "approve")}
                    disabled={processing === p.id}
                    style={{ flex: 1, background: "#7B6BA8", color: "white", border: "none", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: processing === p.id ? 0.5 : 1 }}
                  >
                    ✓ 公式認定する
                  </button>
                  <button
                    onClick={() => handleAction(p.id, "reject")}
                    disabled={processing === p.id}
                    style={{ flex: 1, background: "white", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: processing === p.id ? 0.5 : 1 }}
                  >
                    却下
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
