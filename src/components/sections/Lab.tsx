"use client";

import { FlaskConical } from "lucide-react";
import { Reveal, SectionShell } from "@/components/experience/SectionShell";
import { AmbientVideo } from "@/components/experience/AmbientVideo";
import { RCFilterLab } from "@/components/lab/RCFilterLab";
import { LogicGateLab } from "@/components/lab/LogicGateLab";
import { LEDBiasLab } from "@/components/lab/LEDBiasLab";
import { lab, sectionBackgrounds } from "@/data/portfolio";

export default function Lab() {
  return (
    <div className="relative py-28 sm:py-36">
      <SectionShell id="lab" eyebrow={lab.eyebrow} heading={lab.heading} lead={lab.lead}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="glass-panel h-full rounded-xl p-6 sm:p-8">
              <RCFilterLab />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-panel h-full rounded-xl p-6 sm:p-8">
              <LogicGateLab />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="glass-panel h-full rounded-xl p-6 sm:p-8">
              <LEDBiasLab />
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-2">
            <div className="glass-panel group relative h-full min-h-[240px] overflow-hidden rounded-xl">
              <AmbientVideo
                src={sectionBackgrounds.labVideo}
                poster={sectionBackgrounds.labPoster}
                className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-700 group-hover:opacity-75"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0d0b0a]/95 via-transparent to-[#0d0b0a]/40"
                aria-hidden="true"
              />
              <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
                <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[#ffd98a]/80">
                  <FlaskConical className="h-3.5 w-3.5" /> Lab ambience
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/65">
                  The bench never truly sleeps — oscilloscopes breathing, solder flux in the air,
                  and one more measurement between a hypothesis and a working circuit.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </SectionShell>
    </div>
  );
}
