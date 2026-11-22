"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { toast } from "sonner";

import { GoogleIcon } from "@/components/auth/google-icon";
import { PasswordInput } from "@/components/auth/password-input";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { shake } from "@/lib/motion/variants";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

/** Only ever redirect internally — an open redirect is a free phishing link. */
function safeRedirect(target: string | null): string {
  if (target && target.startsWith("/") && !target.startsWith("//")) return target;
  return "/dashboard";
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirectTo"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const controls = useAnimationControls();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (!email.trim() || password.length < 6) {
      setInvalid(true);
      void controls.start("shake");
      toast.error("Enter your email and password to continue.");
      return;
    }
    setInvalid(false);

    setPending(true);
    const { error } = await signIn.email({ email: email.trim(), password });

    if (error) {
      setPending(false);
      setInvalid(true);
      void controls.start("shake");
      toast.error(error.message || "That email and password don't match our records.");
      return;
    }

    toast.success("Welcome back to FixMate.");
    router.replace(redirectTo);
    router.refresh();
  }

  async function handleGoogle() {
    setSocialPending(true);
    const { error } = await signIn.social({ provider: "google", callbackURL: redirectTo });
    if (error) {
      setSocialPending(false);
      toast.error(error.message || "Google sign-in is unavailable right now.");
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={invalid || undefined}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            invalid={invalid}
          />
        </div>

        <Button type="submit" size="lg" className="h-10 w-full" disabled={pending}>
          {pending ? (
            <>
              <Spinner /> Signing in…
            </>
          ) : (
            "Sign in"
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
