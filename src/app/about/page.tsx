import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const metadata: Metadata = {
  title: "About Lokesh Nedunuri — ECE Student at VIT-AP",
  description: "Learn about Lokesh Nedunuri, an Electronics and Communication Engineering student at VIT-AP University in Andhra Pradesh, India, and explore his interests in electronics, software and engineering projects.",
  alternates: siteUrl ? { canonical: `${siteUrl}/about` } : undefined,
  openGraph: {
    title: "About Lokesh Nedunuri",
    description: "Electronics and Communication Engineering student at VIT-AP University, exploring technology and building projects.",
    url: siteUrl ? `${siteUrl}/about` : undefined,
    images: ["/og-image.png"],
  },
};

const profilePageSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "Lokesh Nedunuri",
    givenName: "Lokesh",
    familyName: "Nedunuri",
    description: "Electronics and Communication Engineering student at VIT-AP University in Andhra Pradesh, India.",
    ...(siteUrl ? { url: siteUrl } : {}),
    affiliation: { "@type": "CollegeOrUniversity", name: "VIT-AP University" },
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0b0a09] px-6 py-24 text-white sm:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema).replace(/</g, "\\u003c") }} />
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#e8a33d] hover:underline">← Back to portfolio</Link>
        <p className="mt-12 font-mono text-xs uppercase tracking-[0.3em] text-[#e8a33d]">Personal profile</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Lokesh Nedunuri</h1>
        <p className="mt-5 text-xl text-white/75">Electronics and Communication Engineering student at VIT-AP University</p>
        <div className="mt-10 space-y-6 text-base leading-8 text-white/65">
          <p>Lokesh Nedunuri is a B.Tech Electronics and Communication Engineering student at VIT-AP University in Andhra Pradesh, India. His interests include electronics, semiconductor devices, embedded systems, digital electronics, communication systems and software development.</p>
          <p>He enjoys learning how technology works, experimenting with development tools and building prototypes that combine software and engineering ideas. His projects and explorations include real-time communication, mobile applications, marketplace concepts and game development.</p>
          <p>Lokesh has participated in Megathon at IIIT Hyderabad. He is interested in collaborative problem-solving, hackathons and continuously improving his engineering skills.</p>
        </div>
        <h2 className="mt-12 text-2xl font-semibold">Explore</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-white/70">
          <li><Link className="text-[#e8a33d] hover:underline" href="/#projects">Projects and prototypes</Link></li>
          <li><Link className="text-[#e8a33d] hover:underline" href="/#interests">Electronics and engineering interests</Link></li>
          <li><Link className="text-[#e8a33d] hover:underline" href="/#hackathons">Megathon at IIIT Hyderabad</Link></li>
          <li><Link className="text-[#e8a33d] hover:underline" href="/#contact">Contact and collaboration</Link></li>
        </ul>
      </article>
    </main>
  );
}
