"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { BadgeCheck, Save } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiPatch } from "@/lib/api";
import { fadeUp, shake } from "@/lib/motion/variants";
import { ROLE_LABEL, initials, type AppUser } from "@/lib/types";

const MAX = { name: 80, phone: 30, area: 80, bio: 280, image: 500 };

export function ProfileForm({ user }: { user: AppUser }) {
  const router = useRouter();
  const controls = useAnimationControls();

  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    area: user.area,
    bio: user.bio,
    image: user.image,
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      controls.start("shake");
      toast.error("Please use at least 2 characters for your name.");
      return;
    }

    setSaving(true);
    try {
      await apiPatch("/api/users/profile", { ...form, name: form.name.trim() }, true);
      toast.success("Profile saved.");
      router.refresh();
    } catch (error) {
      controls.start("shake");
      toast.error(error instanceof ApiError ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
      <form onSubmit={onSubmit} noValidate>
        <motion.div animate={controls} variants={shake}>
          <Card>
            <CardHeader>
              <CardTitle>Profile details</CardTitle>
              <CardDescription>
                Technicians with a complete profile are booked 3× more often. Your email and
                role are fixed by FixMate.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  {form.image ? <AvatarImage src={form.image} alt="" /> : null}
                  <AvatarFallback>{initials(form.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{form.name || "Your name"}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <Badge className="mt-1 bg-signal/12 text-signal">
                    <BadgeCheck className="size-3" />
                    {ROLE_LABEL[user.role]}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  value={form.name}
                  max={MAX.name}
                  onChange={(v) => set("name", v)}
                  required
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  max={MAX.phone}
                  placeholder="+880 1XXX-XXXXXX"
                  onChange={(v) => set("phone", v)}
                />
                <Field
                  label="Service area"
                  value={form.area}
                  max={MAX.area}
                  placeholder="Dhanmondi, Dhaka"
                  onChange={(v) => set("area", v)}
                  className="sm:col-span-2"
                />
                <Field
                  label="Avatar image URL"
                  value={form.image}
                  max={MAX.image}
                  placeholder="https://…"
                  onChange={(v) => set("image", v)}
                  className="sm:col-span-2"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Short bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  maxLength={MAX.bio}
                  rows={4}
                  placeholder="Tell customers who you are and what you fix best."
                  onChange={(e) => set("bio", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {form.bio.length}/{MAX.bio}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner className="mr-2" /> : <Save className="mr-2 size-4" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
  placeholder,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required}
      />
    </div>
  );
}
