"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Footer newsletter capture — validates, toasts, stays local. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (!EMAIL_PATTERN.test(email.trim())) {
      toast.error("Enter a valid email address to subscribe.");
      return;
    }

    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setPending(false);
    setEmail("");
    toast.success("You're on the list — repair tips, once a month.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2" noValidate>
      <Input
        type="email"
        name="newsletter-email"
        autoComplete="email"
        aria-label="Email address for the FixMate newsletter"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="h-9 border-white/20 bg-white/10 text-white placeholder:text-white/45 focus-visible:border-white/45 focus-visible:ring-white/25"
      />
      <Button
        type="submit"
        size="lg"
        variant="secondary"
        disabled={pending}
        className="h-9 shrink-0"
      >
        {pending ? <Spinner /> : "Subscribe"}
      </Button>
    </form>
  );
}
