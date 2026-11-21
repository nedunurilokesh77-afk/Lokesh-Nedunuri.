"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Github, Linkedin, Loader2, Mail, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Reveal, SectionShell } from "@/components/experience/SectionShell";
import { contact, profile } from "@/data/portfolio";

const contactSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Transmission failed");
      toast({
        title: "Signal received",
        description: "Your message landed in the inbox node. Response protocol engaged.",
      });
      reset();
    } catch (err) {
      toast({
        title: "Transmission failed",
        description: err instanceof Error ? err.message : "Unknown fault — try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden py-28 sm:py-36">
      {/* Converging network backdrop */}
      <Image
        src={contact.background}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-30"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#050403] via-[#050403]/70 to-[#050403]"
        aria-hidden="true"
      />

      <SectionShell id="contact" eyebrow={contact.eyebrow} heading={contact.heading} lead={contact.lead}>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Node information */}
          <div className="space-y-4">
            {profile.email && (
              <Reveal>
                <a
                  href={`mailto:${profile.email}`}
                  className="glass-panel group flex items-center gap-4 rounded-xl p-5 transition-all duration-300 hover:border-[#e8a33d]/40"
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-[#e8a33d]/25 bg-[#e8a33d]/10">
                    <Mail className="h-[18px] w-[18px] text-[#e8a33d]" />
                  </span>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">Email node</p>
                    <p className="mt-0.5 text-sm text-white/80 transition-colors group-hover:text-[#ffd98a]">
                      {profile.email}
                    </p>
                  </div>
                </a>
              </Reveal>
            )}

            <Reveal delay={0.08}>
              <div className="glass-panel flex items-center gap-4 rounded-xl p-5">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-[#e8a33d]/25 bg-[#e8a33d]/10">
                  <MapPin className="h-[18px] w-[18px] text-[#e8a33d]" />
                </span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">Base station</p>
                  <p className="mt-0.5 text-sm text-white/80">{profile.location}</p>
                </div>
              </div>
            </Reveal>

            {(profile.github || profile.linkedin) && (
              <Reveal delay={0.16}>
                <div className="flex gap-4">
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" className="glass-panel flex flex-1 items-center justify-center gap-2 rounded-xl p-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 transition-all duration-300 hover:border-[#e8a33d]/40 hover:text-[#ffd98a]">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="glass-panel flex flex-1 items-center justify-center gap-2 rounded-xl p-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 transition-all duration-300 hover:border-[#e8a33d]/40 hover:text-[#ffd98a]">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                </div>
              </Reveal>
            )}

            <Reveal delay={0.22}>
              <p className="pt-4 font-mono text-[9px] uppercase leading-loose tracking-[0.3em] text-white/30">
                Typical response window · under 48 hours
              </p>
            </Reveal>
          </div>

          {/* Transmission form */}
          <Reveal delay={0.1}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="glass-panel flex flex-col gap-5 rounded-xl p-6 sm:p-8"
              noValidate
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white/90">Open a channel</h3>
                <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8a33d]" />
                  Node online
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">Name</span>
                  <input
                    {...register("name")}
                    placeholder="Your name"
                    className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85 placeholder:text-white/25 focus:border-[#e8a33d]/60 focus:outline-none focus:ring-1 focus:ring-[#e8a33d]/40"
                  />
                  {errors.name && <span className="font-mono text-[9px] text-[#ffb09a]">{errors.name.message}</span>}
                </label>
                <label className="flex flex-col gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">Email</span>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85 placeholder:text-white/25 focus:border-[#e8a33d]/60 focus:outline-none focus:ring-1 focus:ring-[#e8a33d]/40"
                  />
                  {errors.email && <span className="font-mono text-[9px] text-[#ffb09a]">{errors.email.message}</span>}
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">Message</span>
                <textarea
                  {...register("message")}
                  rows={5}
                  placeholder="What shall we build?"
                  className="scroll-area-slim resize-none rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85 placeholder:text-white/25 focus:border-[#e8a33d]/60 focus:outline-none focus:ring-1 focus:ring-[#e8a33d]/40"
                />
                {errors.message && <span className="font-mono text-[9px] text-[#ffb09a]">{errors.message.message}</span>}
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="group mt-2 flex h-12 items-center justify-center gap-3 rounded-lg border border-[#e8a33d]/40 bg-[#e8a33d]/10 font-mono text-[11px] uppercase tracking-[0.3em] text-[#ffd98a] transition-all duration-300 hover:bg-[#e8a33d]/20 hover:shadow-[0_0_28px_rgba(232,163,61,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Transmitting
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Send transmission
                  </>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </SectionShell>
    </div>
  );
}
