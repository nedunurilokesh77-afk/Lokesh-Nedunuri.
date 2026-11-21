/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO CONTENT — single source of truth
 *  All copy lives here so details can be refined without touching components.
 *  Add verified contact details and social profile URLs before publishing.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const profile = {
  name: "Lokesh Nedunuri",
  firstName: "LOKESH",
  lastName: "NEDUNURI",
  role: "Electronics & Communication Engineering",
  tagline: "Exploring technology. Understanding systems. Building possibilities.",
  university: "VIT-AP University",
  location: "VIT-AP University, Amaravati, Andhra Pradesh, India",
  // Add verified contact details and public profile URLs before publishing.
  email: "",
  github: "",
  linkedin: "",
} as const;

export const navLinks = [
  { id: "about", label: "About" },
  { id: "interests", label: "Interests" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "hackathons", label: "Hackathons" },
  { id: "lab", label: "Lab" },
  { id: "contact", label: "Contact" },
] as const;

export const about = {
  eyebrow: "01 — About",
  heading: "From curiosity\nto circuits.",
  paragraphs: [
    "I am Lokesh Nedunuri, an Electronics and Communication Engineering student at VIT-AP University in Andhra Pradesh, India. I am curious about how electronic systems work, from semiconductor devices and digital logic to communication and embedded technology.",
    "I learn by exploring concepts, experimenting with tools and building software and engineering prototypes. My interests span electronics, app development, real-time communication, game development and practical problem-solving.",
    "I have also taken part in Megathon at IIIT Hyderabad, an experience that strengthened my interest in collaborative building, rapid prototyping and learning through challenges.",
  ],
  stats: [
    { value: "B.Tech · ECE", label: "VIT-AP University" },
    { value: "Megathon", label: "IIIT Hyderabad" },
    { value: "Electronics · Software", label: "Areas of interest" },
    { value: "Build · Learn · Iterate", label: "Approach" },
  ],
  image: "/assets/images/about-portrait.webp",
  imageCaption: "The bench where theory becomes hardware",
} as const;

export const interests = {
  eyebrow: "02 — Interests",
  heading: "Five territories.\nOne signal.",
  lead: "The camera travels across the board — every region of this discipline lights up a different way of thinking.",
  items: [
    {
      id: "embedded",
      index: "01",
      title: "Embedded Systems",
      description:
        "Bringing silicon to life — firmware, real-time control, and the craft of making hardware think.",
      icon: "Cpu",
    },
    {
      id: "vlsi",
      index: "02",
      title: "VLSI & Digital Design",
      description:
        "From logic gates to layout — how billions of transistors cooperate inside a chip.",
      icon: "CircuitBoard",
    },
    {
      id: "signals",
      index: "03",
      title: "Signal Processing",
      description:
        "Extracting meaning from noise — filters, transforms, and the hidden language of waveforms.",
      icon: "AudioWaveform",
    },
    {
      id: "communication",
      index: "04",
      title: "Communication Systems",
      description:
        "How information travels — modulation, channels, and the physics of staying connected.",
      icon: "RadioTower",
    },
    {
      id: "iot",
      index: "05",
      title: "IoT & Smart Systems",
      description:
        "Networked sensing and edge intelligence — connecting the physical world to the cloud.",
      icon: "Network",
    },
  ],
} as const;

export const skills = {
  eyebrow: "03 — Skills",
  heading: "Every trace\ncarries a current.",
  lead:
    "A snapshot of technologies and engineering topics I have studied, used or am actively exploring.",
  core: "LN CORE",
  groups: [
    {
      id: "electronics",
      title: "ECE & Electronics",
      trace: "TRACE-A",
      items: ["Digital Electronics", "Signals & Systems", "Semiconductor Devices", "Microprocessors", "Embedded Systems", "Verilog"],
    },
    {
      id: "programming",
      title: "Programming",
      trace: "TRACE-B",
      items: ["C / C++", "Python", "Java", "TypeScript", "Rust", "Kotlin"],
    },
    {
      id: "web",
      title: "Web & App Development",
      trace: "TRACE-C",
      items: ["React", "Next.js", "Node.js", "Flutter", "HTML / CSS", "REST APIs"],
    },
    {
      id: "tools",
      title: "Tools & Creative Technology",
      trace: "TRACE-D",
      items: ["Git / GitHub", "Linux", "Godot", "Blender", "VS Code", "Docker"],
    },
  ]
} as const;

export const projects = {
  eyebrow: "04 — Projects",
  heading: "Ideas into\nexperiments.",
  lead: "Selected software and engineering prototypes — each at its own stage of exploration and development.",
  items: [
    {
      id: "omingle",
      index: "01",
      title: "Omingle",
      subtitle: "Random video, audio & text chat · In development",
      description:
        "A stranger-chat platform built around WebRTC and Socket.IO. The project explores random matchmaking, real-time signaling, audio/video connectivity, moderation and reliable session handling.",
      tags: ["WebRTC", "Socket.IO", "Node.js", "React"],
      image: "/assets/images/projects/signal-project.webp",
    },
    {
      id: "vitap-mate",
      index: "02",
      title: "VITAP Mate",
      subtitle: "Campus companion app · In development",
      description:
        "A Flutter-based campus companion concept using Riverpod, SQLite and a Rust-based VTOP client. The focus is a modular app foundation, navigation, caching and a smoother student workflow.",
      tags: ["Flutter", "Dart", "Rust", "SQLite"],
      image: "/assets/images/projects/iot-project.webp",
    },
    {
      id: "repairme",
      index: "03",
      title: "RepairMe",
      subtitle: "Repair marketplace · Hackathon prototype",
      description:
        "A marketplace concept designed to connect people who need repairs with nearby repair professionals. The prototype explores service discovery, request flows and a simple marketplace experience.",
      tags: ["React", "Web Development", "Marketplace", "Prototyping"],
      image: "/assets/images/projects/robot-project.webp",
    },
    {
      id: "operationisland",
      index: "04",
      title: "OperationIsland",
      subtitle: "Multiplayer FPS · Prototype",
      description:
        "A Godot-based first-person shooter prototype exploring 3D environments, player movement, weapon interactions, multiplayer networking and game-world construction.",
      tags: ["Godot", "GDScript", "3D", "ENet"],
      image: "/assets/images/projects/fpga-project.webp",
    },
    {
      id: "phoneagent",
      index: "05",
      title: "PhoneAgent",
      subtitle: "Android application foundation · In development",
      description:
        "An Android assistant foundation focused on clean architecture, modular structure, navigation, logging and dependency injection using Kotlin and Jetpack Compose.",
      tags: ["Kotlin", "Jetpack Compose", "Hilt", "Room"],
      image: "/assets/images/projects/energy-project.webp",
    },
  ]
} as const;

export const hackathons = {
  eyebrow: "05 — Hackathons",
  heading: "The current\ntravels here.",
  lead:
    "A timeline energised by a travelling signal — follow the pulse to the Megathon experience at IIIT Hyderabad.",
  timeline: [
    {
      id: "megathon",
      title: "Megathon",
      org: "IIIT Hyderabad",
      tag: "Participant",
      description:
        "Hackathon participation at IIIT Hyderabad. Megathon was an opportunity to experience collaborative problem-solving, rapid ideation and building under time constraints.",
      highlights: [
        "Collaborative problem-solving",
        "Rapid ideation and prototyping",
        "Learning in a hackathon environment",
      ],
    },
  ]
} as const;

export const lab = {
  eyebrow: "06 — Engineering Lab",
  heading: "Bend the signal\nyourself.",
  lead:
    "Theory becomes belief when you see it respond to your own hands. Three small instruments — no lab bench required.",
} as const;

export const contact = {
  eyebrow: "07 — Contact",
  heading: "Every pathway\nconverges here.",
  lead:
    "All signals eventually find their destination. If you'd like to talk embedded systems, VLSI, hackathons or collaborations — this is the node.",
  background: "/assets/images/contact-network.webp",
} as const;

export const heroFallbackImage = "/assets/images/hero-environment.webp";

export const sectionBackgrounds = {
  interestsVideo: "/assets/videos/ambient-circuit.mp4",
  interestsPoster: "/assets/posters/circuit-poster.webp",
  labVideo: "/assets/videos/ambient-lab.mp4",
  labPoster: "/assets/posters/lab-poster.webp",
} as const;
