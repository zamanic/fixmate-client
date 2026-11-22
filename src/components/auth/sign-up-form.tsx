"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { Check, Hammer, Pencil } from "lucide-react";
import { toast } from "sonner";

import { GoogleIcon } from "@/components/auth/google-icon";
import { PasswordInput } from "@/components/auth/password-input";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";
import { shake } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

type SignupRole = "customer" | "technician";

const ROLE_CARDS: {
  value: SignupRole;
  label: string;
  body: string;
  icon: typeof Hammer;
}[] = [
  {
    value: "customer",
    label: "Customer",
    body: "Book repairs and track every job you request.",
    icon: Pencil,
  },
  {
    value: "technician",
    label: "Technician",
    body: "List your services and accept job requests.",
    icon: Hammer,
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function ruleSet(password: string) {
  return [
    { label: "At least 6 characters", ok: password.length >= 6 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One lowercase letter", ok: /[a-z]/.test(password) },
  ];
}

function safeRedirect(target: string | null): string {
  if (target && target.startsWith("/") && !target.startsWith("//")) return target;
  return "/dashboard";
}

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirectTo"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignupRole>("customer");
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const controls = useAnimationControls();

  const rules = useMemo(() => ruleSet(password), [password]);
  const passwordValid = rules.every((rule) => rule.ok);
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const nameValid = name.trim().length >= 2;
  const showErrors = submitted;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);

    if (!nameValid || !emailValid || !passwordValid) {
      void controls.start("shake");
      toast.error(
        !passwordValid
          ? "Your password doesn't meet all the rules yet."
          : !emailValid
            ? "Enter a valid email address."
            : "Enter your full name (at least 2 characters)."
      );
      return;
    }

    setPending(true);
    const { error } = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    });

    if (error) {
      setPending(false);
      void controls.start("shake");
      toast.error(error.message || "We couldn't create that account. Try signing in instead.");
      return;
    }

    toast.success("Your FixMate account is ready.");
    router.replace(redirectTo);
    router.refresh();
  }

  async function handleGoogle() {
    setSocialPending(true);
    const { error } = await signIn.social({ provider: "google", callbackURL: redirectTo });
    if (error) {
      setSocialPending(false);
      toast.error(error.message || "Google sign-up is unavailable right now.");
    }
  }

  return (
    <div className="space-y-5">
      <motion.form
        animate={controls}
        variants={shake}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Ayesha Rahman"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={(showErrors && !nameValid) || undefined}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={(showErrors && !emailValid) || undefined}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            invalid={showErrors && !passwordValid}
          />
          <ul className="mt-1 space-y-1.5">
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  rule.ok ? "text-status-completed" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid size-3.5 place-items-center rounded-full",
                    rule.ok ? "bg-status-completed/15" : "bg-muted"
                  )}
                >
                  {rule.ok ? <Check className="size-2.5" strokeWidth={3} /> : null}
                </span>
                {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm leading-none font-medium">I&apos;m joining as</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLE_CARDS.map((card) => {
              const selected = role === card.value;
              return (
                <button
                  key={card.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRole(card.value)}
                  className={cn(
                    "group/role flex items-start gap-3 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected
                      ? "border-signal bg-signal/8 ring-1 ring-signal/35"
                      : "border-border hover:border-signal/40 hover:bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                      selected ? "bg-signal text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <card.icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{card.label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      {card.body}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Admin accounts are provisioned by FixMate staff and can&apos;t be self-selected.
          </p>
        </fieldset>

        <Button
          type="submit"
          size="lg"
          className="h-10 w-full"
          disabled={pending || (showErrors && (!nameValid || !emailValid || !passwordValid))}
        >
          {pending ? (
            <>
              <Spinner /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </motion.form>

      {GOOGLE_ENABLED ? (
        <>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 w-full"
            onClick={handleGoogle}
            disabled={socialPending}
          >
            {socialPending ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </Button>
        </>
      ) : null}
    </div>
  );
}
