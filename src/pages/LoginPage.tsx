import { login } from "@/api/auth";
import { Button, Input } from "@/components/atoms";
import { IcDog, IcLock, IcUtensils } from "@/icons";
import { setAuth } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const PEOPLE = [
  { id: "alex" as const, name: "Alex", color: "#7c3aed" },
  { id: "yuka" as const, name: "Yuka", color: "#db2777" },
];

export function LoginPage() {
  const [code, setCode] = useState("");
  const [who, setWho] = useState<"alex" | "yuka" | null>(null);
  const [shake, setShake] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);

  const { mutate, isPending } = useMutation({
    mutationFn: () => login({ code: code.toLowerCase().trim(), who: who! }),
    onSuccess: (data) => {
      dispatch(setAuth(data));
      navigate("/home");
    },
    onError: () => {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setCode("");
      }, 450);
    },
  });

  useEffect(() => {
    const color = who
      ? (PEOPLE.find((p) => p.id === who)?.color ?? "#f3eefe")
      : "#f3eefe";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
  }, [who]);

  if (token) return <Navigate to="/home" replace />;

  const tryUnlock = () => {
    if (!who || code.length < 3 || isPending) return;
    mutate();
  };

  return (
    <div
      className="h-full flex flex-col px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #f3eefe 0%, #faf8ff 55%)" }}
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-16 w-[220px] h-[220px] rounded-full pointer-events-none opacity-70"
        style={{
          background: "radial-gradient(circle, #d6c9ff 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-[250px] -left-20 w-[200px] h-[200px] rounded-full pointer-events-none opacity-50"
        style={{
          background: "radial-gradient(circle, #ffd9d9 0%, transparent 70%)",
        }}
      />

      <div className="flex-1" />

      <div
        className="relative"
        style={{ animation: shake ? "shake 0.4s" : undefined }}
      >
        <div className="mb-7 flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-3xl text-white flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
            }}
          >
            <IcUtensils size={28} />
          </div>
          <div className="flex-1">
            <h1 className="m-0 text-[22px] font-extrabold text-ink tracking-[-0.6px] leading-[1.1]">
              Cooking With Her
            </h1>
            <div className="text-[13px] text-muted mt-0.5">
              só pra Alex &amp; Yuka
            </div>
          </div>
        </div>

        <div className="bg-card rounded-[22px] p-[22px]">
          <div className="text-sm font-bold text-ink mb-1">
            Bem-vindos de volta
          </div>
          <div className="text-[13px] text-muted mb-4 leading-[1.45]">
            Quem vai cozinhar hoje?
          </div>

          <div className="flex gap-3 mb-5">
            {PEOPLE.map((p) => {
              const selected = who === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setWho(p.id)}
                  className="flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: selected ? p.color : "#e8e4f2",
                    background: selected ? p.color + "14" : "transparent",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[15px] transition-all"
                    style={{ background: selected ? p.color : "#d4cfe5" }}
                  >
                    {p.name[0]}
                  </div>
                  <span
                    className="text-[13px] font-semibold transition-colors"
                    style={{ color: selected ? p.color : "#9a94b0" }}
                  >
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[13px] text-muted mb-3 leading-[1.45] flex items-center gap-1.5">
            <IcDog size={14} />
            <span>Digite nossa palavra secreta. Dica: nosso pet.</span>
          </div>

          <div className="relative mb-3.5">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
              placeholder="nossa palavra secreta"
              autoFocus
              className="pr-10 text-base"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-subtle">
              <IcLock size={16} />
            </div>
          </div>

          <Button
            variant="primary"
            full
            size="lg"
            onClick={tryUnlock}
            disabled={!who || code.length < 3 || isPending}
          >
            {isPending ? "Verificando…" : "Entrar"}
          </Button>
        </div>

        <div className="text-center text-xs text-subtle mt-4 leading-[1.5] flex items-center justify-center gap-1.5">
          <IcDog size={12} />
          <span>Esqueceu a palavra? Pergunta pro nosso pet</span>
        </div>
      </div>

      <div className="flex-[1.4]" />
    </div>
  );
}
