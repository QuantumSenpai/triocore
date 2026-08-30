export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  skills: string[];
  projects: { title: string; desc?: string }[];
  githubUrl?: string;
  linkedinUrl?: string;
  order: number;
  isPlaceholder?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  badge: string;
  colSpan: string;
  features: string[];
  accent: string;
  iconName: string;
}

export interface InnovationProject {
  id: string;
  title: string;
  category: string;
  status: "Completed" | "Active" | "Research" | "Ongoing";
  statusColor: string;
  desc: string;
  tech: string[];
  colSpan: string;
  accent: string;
  metric: string;
  iconName: string;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  tech: string[];
  status: "Completed" | "Coming Soon";
  order: number;
}

export interface TimelineStep {
  step: string;
  title: string;
  desc: string;
  status: "Completed" | "Active" | "Upcoming";
  iconName: string;
}

export interface WhyUsValue {
  title: string;
  desc: string;
  iconName: string;
}

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

export interface RoadmapMilestone {
  text: string;
  status: "completed" | "in-progress" | "future";
}

export interface RoadmapPhase {
  year: string;
  phase: string;
  title: string;
  status: string;
  statusType: "active" | "upcoming" | "future";
  badgeBg: string;
  nodeBorder: string;
  milestones: RoadmapMilestone[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  period?: string;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  desc: string;
  features: string[];
}

export interface SimplePriceItem {
  name: string;
  price: string;
}

export const siteConfig = {
  name: "TrioCore",
  tagline: "BUILDING DIGITAL ESSENCE",
  motto: "Think. Build. Scale.",
  description:
    "Student-led digital solutions studio in India building custom high-performance websites, web applications, NFC business systems, and intelligent hardware.",
  email: "triocorebusiness@gmail.com",
  location: "Serving clients across India 🇮🇳 (HQ: Kolkata)",
  github: "https://github.com",
  url: "https://triocore.vercel.app",
};

export const teamMembers: TeamMember[] = [
  {
    id: "krishnendu-adak",
    name: "Krishnendu Adak",
    role: "Full Stack Dev / ML Enthusiast / Creative Editor",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    skills: ["Python", "Flask", "Java", "JavaScript", "ML", "Video Editing", "Next.js", "Tailwind CSS"],
    projects: [
      { title: "Sentiment Analysis System", desc: "NLP pipeline for multi-source feedback evaluation" },
      { title: "SortAnime", desc: "Anime sorting & smart algorithmic recommender engine" },
      { title: "AuraAnime", desc: "Modern streaming index & community metadata platform" }
    ],
    githubUrl: "https://github.com",
    order: 1
  },
  {
    id: "nandita-ghosh",
    name: "Nandita Ghosh",
    role: "Software Developer / Hardware Innovator",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    skills: ["C", "C++", "Java", "Python", "HTML", "CSS", "Arduino", "Embedded Systems"],
    projects: [
      { title: "VacuumX", desc: "Autonomous obstacle-avoiding smart cleaning device" },
      { title: "SafeMet Smart Helmet", desc: "IoT sensor-driven accident prevention & detection system" },
      { title: "Fitness Club Website", desc: "Full-scale membership booking & scheduling portal" }
    ],
    githubUrl: "https://github.com",
    order: 2
  },
  {
    id: "chandrima-chowdhury",
    name: "Chandrima Chowdhury",
    role: "Software Developer / Robotics Builder",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
    skills: ["C", "C++", "Java", "JavaScript", "DBMS", "Robotics", "SQL", "Tailwind CSS"],
    projects: [
      { title: "Coaching Institute Website", desc: "Student LMS, batch scheduler & notice board engine" },
      { title: "Smart Helmet", desc: "Hardware safety tracking with automated SOS beacon" },
      { title: "Fire Boat (Ongoing)", desc: "Autonomous waterborne firefighting & rescue craft" }
    ],
    githubUrl: "https://github.com",
    order: 3
  },
  {
    id: "md-danish-raza",
    name: "MD Danish Raza",
    role: "Frontend Developer / UI Engineer",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=80",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "JavaScript", "HTML5", "CSS3", "Git"],
    projects: [
      { title: "Interactive UI Systems", desc: "Dynamic component architecture & responsive layouts" },
      { title: "Web Interfaces", desc: "Modern frontend engineering and state management" }
    ],
    githubUrl: "https://github.com/mddanish-31",
    linkedinUrl: "https://www.linkedin.com/in/md-danish-raza31",
    order: 4
  }
];

export const services: ServiceItem[] = [
  {
    id: "web-dev",
    title: "Full-Stack Web Development",
    desc: "Custom, scalable Next.js 15 web applications engineered with clean component architectures, dynamic database integrations, and ultra-fast page speeds.",
    iconName: "Globe",
    badge: "Most Popular",
    colSpan: "lg:col-span-2",
    features: ["Server Components & Edge Caching", "Postgres & Drizzle ORM Backends", "High SEO & Lighthouse 95+ Scores"],
    accent: "from-[#374BFF] to-[#14141A]",
  },
  {
    id: "qr-menus",
    title: "Restaurant QR Menu Systems",
    desc: "Instant contactless digital menus optimized for smartphone cameras, instant updates, chef specials, and allergen filters.",
    iconName: "QrCode",
    badge: "Specialized",
    colSpan: "lg:col-span-1",
    features: ["Zero-App Frictionless Scanning", "Instant Real-Time Price Sync", "Mobile Category Navigators"],
    accent: "from-[#14141A] to-[#374BFF]",
  },
  {
    id: "nfc-cards",
    title: "NFC Smart Business Cards",
    desc: "Modern tap-to-connect physical cards paired with dynamic digital vCards, social profile switches, and lead capture telemetry.",
    iconName: "CreditCard",
    badge: "Hardware + Web",
    colSpan: "lg:col-span-1",
    features: ["Instant iOS & Android Tap", "Dynamic Profile Dashboard", "One-Touch Contact Save (.vcf)"],
    accent: "from-[#374BFF] to-[#1C1C26]",
  },
  {
    id: "landing-pages",
    title: "High-Conversion Landing Pages",
    desc: "Conversion-optimized single-page web experiences engineered to turn ad clicks and visitors into loyal paying customers.",
    iconName: "Layers",
    badge: "Growth",
    colSpan: "lg:col-span-1",
    features: ["Persuasive UX Architecture", "Frictionless Contact Hooks", "A/B Test Ready Structures"],
    accent: "from-[#1C1C26] to-[#374BFF]",
  },
  {
    id: "portfolios",
    title: "Developer & Creator Portfolios",
    desc: "Bespoke personal portfolio websites designed to highlight engineering projects, creative showreels, and technical depth.",
    iconName: "UserCheck",
    badge: "Personal Branding",
    colSpan: "lg:col-span-1",
    features: ["Interactive 3D & Bento Grids", "Automated GitHub Sync", "Dynamic Blog / MDX Engine"],
    accent: "from-[#374BFF] to-[#14141A]",
  },
  {
    id: "maintenance",
    title: "Website Maintenance & Tuning",
    desc: "Long-term monitoring, dependency upgrades, security audits, database backups, and UI refinement packages.",
    iconName: "Wrench",
    badge: "Reliability",
    colSpan: "lg:col-span-3",
    features: ["24/7 Health Monitoring", "Automated Daily Cloud Backups", "Continuous Speed Optimization"],
    accent: "from-[#14141A] via-[#1C1C26] to-[#374BFF]",
  },
];

export const innovationProjects: InnovationProject[] = [
  {
    id: "safemet",
    title: "SafeMet Smart Helmet",
    category: "IoT / Safety Hardware",
    status: "Completed",
    statusColor: "text-[#14141A] dark:text-[#CFFF04] border-[#14141A]/20 dark:border-[#CFFF04]/40 bg-[#14141A]/8 dark:bg-[#CFFF04]/15",
    desc: "Intelligent headgear integrated with accelerometer sensors, impact thresholds, and automated GPS emergency beacon broadcast to prevent delay in medical assistance.",
    tech: ["Arduino", "GSM/GPS Module", "Piezo Sensors", "C++", "Emergency Telemetry"],
    iconName: "ShieldAlert",
    colSpan: "lg:col-span-2",
    accent: "from-[#374BFF] to-[#14141A]",
    metric: "0.2s Impact Detection",
  },
  {
    id: "sentiment-analysis",
    title: "Sentiment Analysis Engine",
    category: "NLP / Machine Learning",
    status: "Research",
    statusColor: "text-[#374BFF] border-[#374BFF]/40 bg-[#374BFF]/15",
    desc: "Multi-layered natural language processing pipeline evaluating emotional polarity and sentiment metrics across customer feedback datasets.",
    tech: ["Python", "Flask", "PyTorch", "Scikit-Learn", "NLTK"],
    iconName: "BrainCircuit",
    colSpan: "lg:col-span-1",
    accent: "from-[#14141A] to-[#374BFF]",
    metric: "94.2% Multi-Class Accuracy",
  },
  {
    id: "vacuumx",
    title: "VacuumX Smart Cleaner",
    category: "Autonomous Hardware",
    status: "Active",
    statusColor: "text-[#14141A] dark:text-[#CFFF04] border-[#14141A]/20 dark:border-[#CFFF04]/40 bg-[#14141A]/8 dark:bg-[#CFFF04]/15",
    desc: "Self-navigating obstacle-avoidance cleaning rover utilizing ultrasonic sonar sweeps and adaptive motor controllers.",
    tech: ["Ultrasonic Sonar", "Motor Drivers", "Embedded C", "Chassis Design"],
    iconName: "Cpu",
    colSpan: "lg:col-span-1",
    accent: "from-[#374BFF] to-[#1C1C26]",
    metric: "360° Sonar Sweep",
  },
  {
    id: "fireboat",
    title: "Autonomous Fire Boat",
    category: "Marine Robotics / Safety",
    status: "Ongoing",
    statusColor: "text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/15",
    desc: "Unmanned amphibious craft engineered for rapid waterborne fire suppression, remote thermal sensing, and obstacle-free water navigation.",
    tech: ["Thermal Imaging", "Pump Actuators", "RF Long-Range", "Robotics"],
    iconName: "Flame",
    colSpan: "lg:col-span-1",
    accent: "from-[#14141A] to-[#1C1C26]",
    metric: "Dual Water Cannons",
  },
  {
    id: "path-follower",
    title: "Path Follower Rover",
    category: "Precision Robotics",
    status: "Completed",
    statusColor: "text-[#14141A] dark:text-[#CFFF04] border-[#14141A]/20 dark:border-[#CFFF04]/40 bg-[#14141A]/8 dark:bg-[#CFFF04]/15",
    desc: "High-speed industrial path-following autonomous vehicle leveraging IR sensor arrays and PID feedback loops for factory automation simulation.",
    tech: ["PID Controllers", "Infrared Arrays", "Microcontrollers", "Feedback Control"],
    iconName: "Navigation2",
    colSpan: "lg:col-span-1",
    accent: "from-[#374BFF] via-[#1C1C26] to-[#14141A]",
    metric: "99.4% Path Accuracy",
  },
];

export const showcaseProjects: ShowcaseProject[] = [
  {
    id: "sort-anime",
    title: "SortAnime",
    description: "Algorithmic Anime discovery and sorting engine with dynamic multi-parameter filtering and rating analytics.",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    liveUrl: "https://triocore.vercel.app",
    tech: ["JavaScript", "HTML5", "CSS3", "REST API"],
    status: "Completed",
    order: 1
  },
  {
    id: "coaching-institute",
    title: "Coaching Institute Portal",
    description: "Comprehensive management portal for coaching academies with student tracking, course schedules, and fee records.",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    liveUrl: "https://triocore.vercel.app",
    tech: ["Next.js", "Tailwind CSS", "PostgreSQL", "Node.js"],
    status: "Completed",
    order: 2
  },
  {
    id: "fitness-club",
    title: "Fitness Club Website",
    description: "High-performance marketing & membership booking website featuring dynamic class timetables and lead capture.",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
    liveUrl: "https://triocore.vercel.app",
    tech: ["React", "Tailwind CSS", "Framer Motion"],
    status: "Completed",
    order: 3
  },
  {
    id: "restaurant-template",
    title: "Restaurant QR Menu System",
    description: "Contactless digital QR menu with instant category search, chef highlights, and multilingual translation support.",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    liveUrl: "#",
    tech: ["Next.js 15", "Tailwind CSS", "QR Engine"],
    status: "Coming Soon",
    order: 4
  },
  {
    id: "nfc-digital-card",
    title: "NFC Digital Smart Card",
    description: "Next-generation digital business card system integrating tap-to-share profile vCards with social telemetry.",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    liveUrl: "#",
    tech: ["NFC Tech", "Web App", "Analytics"],
    status: "Coming Soon",
    order: 5
  }
];

export const aboutTags: string[] = [
  "Web Development",
  "UI/UX Design",
  "NFC Technology",
  "Machine Learning",
  "Digital Solutions",
  "Hardware & Robotics",
  "Cloud APIs",
  "Performance Tuning",
];

export const aboutTimeline: TimelineStep[] = [
  {
    step: "01",
    title: "The Idea",
    desc: "Recognizing that businesses and creators lacked fast, modern, and high-performance digital tools, three CSE students converged to engineer custom tech solutions.",
    iconName: "Lightbulb",
    status: "Completed",
  },
  {
    step: "02",
    title: "Team Formation",
    desc: "Uniting Krishnendu (Full Stack & ML), Nandita (Software & Hardware), and Chandrima (Robotics & DBMS) into a multidisciplinary development trio.",
    iconName: "Users2",
    status: "Completed",
  },
  {
    step: "03",
    title: "TrioCore Launch",
    desc: "Deploying our flagship digital hub and releasing open-source prototypes, QR menu architectures, and intelligent web platforms.",
    iconName: "Rocket",
    status: "Completed",
  },
  {
    step: "04",
    title: "First Clients",
    desc: "Partnering with educational institutes, local businesses, and founders to build high-converting web apps and contactless NFC touchpoints across India.",
    iconName: "Briefcase",
    status: "Active",
  },
  {
    step: "05",
    title: "Future Products",
    desc: "Scaling into specialized SaaS tools, autonomous robotics, AI agents, and modular hardware suites for commercial use.",
    iconName: "Sparkles",
    status: "Upcoming",
  },
];

export const whyUsValues: WhyUsValue[] = [
  {
    iconName: "Zap",
    title: "3x Faster Turnaround",
    desc: "We write streamlined code using modern Next.js 15 stacks and lean architectures, delivering production builds in days rather than months.",
  },
  {
    iconName: "Palette",
    title: "100% Modern Custom UI",
    desc: "Zero generic cookie-cutter templates. Every component, micro-interaction, and layout is tailored to elevate your brand's unique identity.",
  },
  {
    iconName: "BadgePercent",
    title: "Transparent INR Pricing",
    desc: "Fair startup and student-friendly rates in Indian Rupees with zero surprise charges or hidden maintenance fees.",
  },
  {
    iconName: "GraduationCap",
    title: "Fresh Student Innovation",
    desc: "As passionate CSE engineers, we stay ahead of latest AI algorithms, edge runtimes, and modern UI paradigms.",
  },
  {
    iconName: "HeartHandshake",
    title: "Direct Founder Access",
    desc: "Direct communication with the actual developers building your product. Fast iterations and responsive feedback loops.",
  },
  {
    iconName: "ShieldCheck",
    title: "Full Code Ownership",
    desc: "You own 100% of your source code and design assets. We support your growth with updates and technical guidance.",
  },
];

export const whyUsStats: StatItem[] = [
  { value: 100, suffix: "%", label: "Custom Tailored Code" },
  { value: 3, suffix: "x", label: "Faster Turnaround Rate" },
  { value: 24, suffix: "/7", label: "Direct Developer Access" },
  { value: 15, suffix: "+", label: "Total Builds Delivered" },
];

export const roadmapData: RoadmapPhase[] = [
  {
    year: "2026",
    phase: "Phase 01",
    title: "Foundations & Launch",
    status: "Active Execution",
    statusType: "active",
    badgeBg: "border-[#374BFF]/50 bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]",
    nodeBorder: "border-[#374BFF] shadow-[0_0_24px_rgba(55,75,255,0.35)]",
    milestones: [
      { text: "Launch TrioCore studio brand & digital platform", status: "completed" },
      { text: "Deploy open-source prototypes & live showcase", status: "completed" },
      { text: "Onboard first client web applications & QR menus", status: "in-progress" },
      { text: "Standardize rapid 48-hour delivery pipelines", status: "in-progress" },
    ],
  },
  {
    year: "2027",
    phase: "Phase 02",
    title: "Expansion & SaaS",
    status: "Upcoming Horizon",
    statusType: "upcoming",
    badgeBg: "border-[#14141A]/20 dark:border-[#374BFF]/40 bg-[#14141A]/6 dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC]",
    nodeBorder: "border-2 border-dashed border-[#14141A]/30 dark:border-[#374BFF]/45 shadow-none",
    milestones: [
      { text: "Launch proprietary micro-SaaS web products", status: "future" },
      { text: "Expand engineering collective & developer network", status: "future" },
      { text: "Roll out subscription-based maintenance suites", status: "future" },
      { text: "Pilot commercial hardware safety IoT deployments", status: "future" },
    ],
  },
  {
    year: "2028",
    phase: "Phase 03",
    title: "Intelligence & Scale",
    status: "Future Vision",
    statusType: "future",
    badgeBg: "border-[#14141A]/20 dark:border-[#374BFF]/40 bg-[#14141A]/6 dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC]",
    nodeBorder: "border-2 border-dashed border-[#14141A]/30 dark:border-[#374BFF]/45 shadow-none",
    milestones: [
      { text: "Enterprise custom AI agents & automated pipelines", status: "future" },
      { text: "Autonomous hardware & robotics commercial fleet", status: "future" },
      { text: "Full-scale international digital client footprint", status: "future" },
      { text: "End-to-end intelligent automation ecosystem", status: "future" },
    ],
  },
];

export const techArsenal = {
  row1: [
    "Next.js 15",
    "React 19",
    "TypeScript",
    "Tailwind CSS",
    "Python",
    "Flask",
    "Java",
    "JavaScript",
    "HTML5",
    "CSS3",
    "Framer Motion",
    "Neon Postgres",
  ],
  row2: [
    "Arduino",
    "Embedded C",
    "Git",
    "GitHub",
    "VS Code",
    "Premiere Pro",
    "After Effects",
    "Canva",
    "Drizzle ORM",
    "Better Auth",
    "REST APIs",
    "Machine Learning",
  ],
};

export const launchOffers = [
  {
    title: "Starter Website",
    originalPrice: "₹1,499",
    launchPrice: "₹999",
    savings: "Save ₹500",
    desc: "1 page quick launch package",
  },
  {
    title: "Business Website",
    originalPrice: "₹2,999",
    launchPrice: "₹1,999",
    savings: "Save ₹1,000",
    desc: "Up to 4 custom pages with SEO",
  },
  {
    title: "Premium Website",
    originalPrice: "₹4,999",
    launchPrice: "₹3,499",
    savings: "Save ₹1,500",
    desc: "Up to 6 pages, full React/Next.js stack",
  },
  {
    title: "E-Commerce System",
    originalPrice: "₹9,999",
    launchPrice: "₹7,999",
    savings: "Save ₹2,000",
    desc: "Full product catalogue & checkout",
  },
  {
    title: "Custom Web App",
    originalPrice: "₹12,999+",
    launchPrice: "₹9,999+",
    savings: "Save ₹3,000+",
    desc: "Custom database, auth & dashboard",
  },
];

export const comboPackages = [
  {
    title: "Logo + Starter Website",
    originalPrice: "₹1,998",
    comboPrice: "₹1,499",
    desc: "Brand identity mark paired with a responsive 1-page business web presence.",
  },
  {
    title: "Logo + Business Website",
    originalPrice: "₹3,498",
    comboPrice: "₹2,499",
    desc: "Custom logo design + 4-page responsive website with WhatsApp & lead system.",
  },
  {
    title: "Business Website + SEO",
    originalPrice: "₹3,498",
    comboPrice: "₹2,499",
    desc: "Complete 4-page site + Google Search Console, Analytics & on-page SEO setup.",
  },
  {
    title: "Website + Maintenance (3 Months)",
    originalPrice: "₹3,796",
    comboPrice: "₹2,999",
    desc: "Business website development plus 90 days of continuous maintenance & backups.",
  },
  {
    title: "Local Business Complete",
    originalPrice: "₹3,497",
    comboPrice: "₹2,499",
    desc: "Website + Google Business Profile setup + Google Maps integration + WhatsApp button.",
  },
];

export const websiteDevelopmentPlans: PricingPlan[] = [
  {
    id: "plan-starter",
    name: "Starter Website",
    price: "₹999",
    desc: "Perfect for single-page business showcases and personal introductions.",
    features: [
      "1 Responsive Modern Page",
      "Business Information & Bio",
      "Direct WhatsApp Chat Button",
      "Google Maps Location Integration",
      "Mobile & Tablet Optimized",
      "Cloud Deployment Included",
    ],
  },
  {
    id: "plan-business",
    name: "Business Website",
    price: "₹1,999",
    badge: "Popular ⭐",
    isPopular: true,
    desc: "Engineered for local shops, consultancies, coaching, and clinics.",
    features: [
      "Up to 4 Custom Tailored Pages",
      "Custom UI/UX Design (No Generic Themes)",
      "Interactive Contact / Lead Form",
      "Direct WhatsApp Call-to-Action",
      "Google Maps Integration",
      "Basic On-Page SEO Setup",
      "Smooth Framer Motion Animations",
      "Fast Edge Cloud Deployment",
    ],
  },
  {
    id: "plan-premium",
    name: "Premium Website",
    price: "₹3,499",
    badge: "Best Value 🔥",
    isBestValue: true,
    desc: "High-performance React/Next.js build for established brands and startups.",
    features: [
      "Up to 6 Premium Custom Pages",
      "Next.js 15 Server-Side Architecture",
      "Advanced Lead Capture & Email Dispatch",
      "Search Engine Optimization (SEO)",
      "Performance & 95+ Speed Optimization",
      "Custom Micro-Animations & Bento Grids",
      "Social Media & Analytics Integration",
      "Production Deployment & Domain Link",
    ],
  },
  {
    id: "plan-advanced",
    name: "Advanced Website",
    price: "₹5,999+",
    desc: "Dynamic web solution with custom backend, authentication, and database.",
    features: [
      "Next.js 15 + PostgreSQL Database",
      "User Authentication & Login Portal",
      "Admin Management Dashboard",
      "Dynamic Content & Database Queries",
      "Custom Backend API Integration",
      "Automated Database Backups",
      "Role-Based Access Controls",
      "High Security & Performance Tuning",
    ],
  },
  {
    id: "plan-ecommerce",
    name: "E-Commerce Website",
    price: "₹7,999+",
    desc: "Online store setup to sell products with digital catalogues and cart.",
    features: [
      "Dynamic Product Catalogue & Grid",
      "Category Filtering & Instant Search",
      "Shopping Cart & Order Management",
      "Postgres Database for Inventory",
      "Admin Product Upload Portal",
      "WhatsApp / Email Order Alerts",
      "Mobile-First Responsive Layout",
      "Payment Gateway Integration Ready",
    ],
  },
  {
    id: "plan-custom-app",
    name: "Custom Web Application",
    price: "₹9,999+",
    desc: "Bespoke SaaS platform, CRM, or specialized workflow software.",
    features: [
      "Tailored Frontend & Backend Architecture",
      "Custom Database Schema & Relations",
      "Secure Multi-User Auth System",
      "Interactive Analytics & Metrics Charts",
      "Custom Workflow & Automation Hooks",
      "Third-Party API & Webhook Integrations",
      "Comprehensive Testing & Edge CDN",
      "Dedicated Technical Support",
    ],
  },
];

export const localBusinessPlans: PricingPlan[] = [
  {
    id: "local-starter",
    name: "Local Business Starter",
    price: "₹1,499",
    desc: "Essential local online presence with instant contact capabilities.",
    features: [
      "1-Page High-Impact Business Showcase",
      "Direct Click-to-WhatsApp Integration",
      "Interactive Google Maps Location",
      "Quick Contact Details Section",
      "Mobile & Touch Screen Responsive",
      "Free Cloud Hosting Deployment",
    ],
  },
  {
    id: "local-pro",
    name: "Local Business Pro",
    price: "₹2,499",
    badge: "Recommended ⭐",
    isPopular: true,
    desc: "Multi-page local powerhouse with SEO and lead capture.",
    features: [
      "Up to 5 Custom Business Pages",
      "Services / Menu / Portfolio Showcase",
      "Interactive Lead & Inquiry Form",
      "Google Business Profile Sync Guidance",
      "Local Search (SEO) Optimization",
      "Smooth UI Micro-Interactions",
      "WhatsApp & Direct Call Buttons",
      "Complete Production Deployment",
    ],
  },
];

export const ecommercePlans: PricingPlan[] = [
  {
    id: "ecom-starter",
    name: "E-Commerce Starter",
    price: "₹7,999+",
    desc: "Launch your online shop with product catalogue and seamless checkout.",
    features: [
      "Dynamic Product Listings & Categories",
      "Interactive Shopping Cart System",
      "Order Submission & Invoicing",
      "Database Product Storage",
      "Mobile-Optimized Fast UI",
      "WhatsApp Order Notification",
    ],
  },
  {
    id: "ecom-business",
    name: "E-Commerce Business",
    price: "₹11,999+",
    badge: "Popular ⭐",
    isPopular: true,
    desc: "Full-scale commerce portal with automated inventory and admin control.",
    features: [
      "Everything in E-Commerce Starter",
      "Full Admin Product & Inventory Dashboard",
      "Order Status Tracking System",
      "Customer Account Sign-In / Sign-Up",
      "Automated Email Order Receipts",
      "Online Payment Gateway Integration",
    ],
  },
  {
    id: "ecom-custom",
    name: "Custom E-Commerce",
    price: "₹15,999+",
    desc: "Advanced multi-vendor, subscription, or complex marketplace workflows.",
    features: [
      "Custom Business Logic & Workflows",
      "Multi-Category Complex Catalogs",
      "Advanced Payment Gateway & Payouts",
      "Discount Codes & Coupon Engine",
      "Customer Reviews & Ratings Module",
      "High-Traffic Database Optimization",
    ],
  },
];

export const webAppServices: SimplePriceItem[] = [
  { name: "High-Converting Landing Page", price: "₹999" },
  { name: "Custom Admin Dashboard", price: "₹1,999+" },
  { name: "User Authentication System", price: "₹999+" },
  { name: "Postgres Database Integration", price: "₹999+" },
  { name: "Custom REST API & Backend", price: "₹1,999+" },
  { name: "Online Booking / Appointment System", price: "₹2,499+" },
  { name: "Inventory & Stock System", price: "₹3,499+" },
  { name: "CRM / Client Management Portal", price: "₹4,999+" },
  { name: "Custom Web Application", price: "₹9,999+" },
  { name: "SaaS Software MVP", price: "₹14,999+" },
];

export const designServices: SimplePriceItem[] = [
  { name: "Professional Logo Design", price: "₹499" },
  { name: "Brand Identity Mini Kit", price: "₹999" },
  { name: "Digital & Print Business Card Design", price: "₹299" },
  { name: "Marketing Poster / Banner", price: "₹299" },
  { name: "Social Media Creative Post", price: "₹199" },
  { name: "Single Page Website UI Design (Figma)", price: "₹999+" },
  { name: "Complete Multi-Page Website UI Design", price: "₹1,999+" },
];

export const seoServices: SimplePriceItem[] = [
  { name: "Basic On-Page SEO Setup", price: "₹499" },
  { name: "Google Business Profile Setup & Optimization", price: "₹399" },
  { name: "Full Website SEO Optimization", price: "₹999+" },
  { name: "Website Performance & Core Web Vitals", price: "₹499+" },
  { name: "Google Analytics 4 Setup", price: "₹299" },
  { name: "Google Search Console Indexing Setup", price: "₹299" },
  { name: "Monthly SEO Maintenance & Ranking", price: "₹999/month" },
];

export const maintenancePlans: PricingPlan[] = [
  {
    id: "maint-basic",
    name: "Basic Care",
    price: "₹299",
    period: "/month",
    desc: "Essential health checks for personal and small showcase websites.",
    features: [
      "Minor Content Updates",
      "Basic Bug Fixes & Checks",
      "Uptime & Status Monitoring",
      "Email Technical Support",
    ],
  },
  {
    id: "maint-business",
    name: "Business Care",
    price: "₹599",
    period: "/month",
    badge: "Popular ⭐",
    isPopular: true,
    desc: "Active upkeep, speed tuning, and monthly content refreshes.",
    features: [
      "Regular Content & Image Updates",
      "Fast Bug & Layout Fixes",
      "Monthly Performance Checks",
      "Security & Framework Upgrades",
      "Automated Cloud Database Backups",
    ],
  },
  {
    id: "maint-pro",
    name: "Pro Care",
    price: "₹999",
    period: "/month",
    desc: "Priority dedicated developer assistance for growing businesses.",
    features: [
      "Priority Developer Support (24h SLA)",
      "Frequent Content & Feature Changes",
      "Weekly Performance & Speed Audits",
      "Daily Cloud Database Backups",
      "Continuous Security Monitoring",
      "Minor Feature & Component Additions",
    ],
  },
];

export const addOns: SimplePriceItem[] = [
  { name: "Additional Web Page", price: "₹250" },
  { name: "Additional Major Feature", price: "₹499+" },
  { name: "WhatsApp Direct Chat Integration", price: "₹199" },
  { name: "Interactive Contact Form", price: "₹199" },
  { name: "Google Maps Embed & Routing", price: "₹149" },
  { name: "Product Upload & Formatting", price: "₹20/product" },
  { name: "Content / Blog Post Upload", price: "₹199+" },
  { name: "Major Post-Approval Design Revision", price: "₹499+" },
  { name: "Urgent 24-Hour Delivery Sprint", price: "₹999+" },
  { name: "Additional Database Query / Table", price: "₹499+" },
  { name: "Payment Gateway Integration", price: "₹999+" },
];

export const pricingTerms = [
  "All prices listed are starting prices based on standard project scope.",
  "Final price depends on exact project requirements, custom features, and complexity.",
  "Domain name and hosting server charges are separate and directly billed to the client.",
  "Paid third-party APIs, payment gateway transaction fees, and external services are charged separately.",
  "Packages include only the features specifically mentioned in the selected plan.",
  "Additional pages and bespoke features requested outside the scope are charged as add-ons.",
  "Major design changes requested after prototype approval may incur revision charges.",
  "Text content, logo assets, images, and product details are to be provided by the client unless copywriting/design add-ons are included.",
  "Maintenance plans are completely optional with no lock-in contracts.",
  "Custom web applications and enterprise projects receive a detailed formal quotation.",
  "Development officially begins after the agreed initial advance payment is confirmed.",
  "Delivery timeline depends on project size, timely content provision, and feedback turnaround.",
];

export const faqItems: FAQItem[] = [
  {
    id: "faq-1",
    category: "About TrioCore",
    question: "Why should I choose TrioCore over other agencies or freelancers?",
    answer:
      "TrioCore is a student-led, engineer-first studio founded by CSE innovators. When you work with us, you communicate directly with the developers building your software—no middlemen, no bloated agency markups, and no delays. We deliver production-grade, hand-crafted code with 48-hour rapid prototyping and crystal-clear pricing in Indian Rupees.",
  },
  {
    id: "faq-2",
    category: "Process",
    question: "How does working with TrioCore actually work?",
    answer:
      "The process is simple and transparent: 1) You share your requirements via our contact form or WhatsApp. 2) We discuss your project and send a fixed quote with timeline milestones. 3) You approve the plan and pay the initial advance. 4) We build your interactive prototype on a live staging link. 5) You review and request revisions. 6) Upon final settlement, we connect your domain and hand over 100% full source code ownership.",
  },
  {
    id: "faq-3",
    category: "Process",
    question: "Do I need any technical knowledge to work with you?",
    answer:
      "Not at all! We handle the entire technical architecture—from domain configuration, cloud hosting, SSL security certificates, and database setup to responsive UI design. We explain everything in plain, straightforward language with zero confusing jargon.",
  },
  {
    id: "faq-4",
    category: "Pricing",
    question: "Are your prices fixed or will they increase later?",
    answer:
      "Our package prices are completely fixed for the features outlined in your agreed project scope. If you decide to add brand-new pages or advanced functionality halfway through, we discuss the exact add-on price upfront before writing a single line of extra code. There are never unexpected surprise bills.",
  },
  {
    id: "faq-5",
    category: "Pricing",
    question: "Are there any hidden charges or surprise renewal fees?",
    answer:
      "Zero hidden fees. Our pricing covers design, coding, animations, and deployment. Standard external costs (like purchasing your own domain name ~₹800/year or third-party payment gateway fees) are stated transparently upfront. Maintenance plans are completely optional.",
  },
  {
    id: "faq-6",
    category: "Trust",
    question: "How do I know TrioCore is trustworthy and reliable?",
    answer:
      "We operate with complete accountability: 1) We provide live demo staging URLs throughout development so you watch real progress in real time. 2) We work on milestone-based payments rather than demanding full payment upfront. 3) Our team members are verified Computer Science students in Kolkata with active GitHub repositories, documented innovation builds, and direct phone/email contact lines.",
  },
  {
    id: "faq-7",
    category: "Process",
    question: "Can I review and test the website before it goes live to the public?",
    answer:
      "Yes, absolutely. We host your website on a private live preview link (staging environment). You can click around, test forms on your mobile phone, review colors and text, and test responsiveness before we point your official custom domain live.",
  },
  {
    id: "faq-8",
    category: "Process",
    question: "What if I want revisions or changes after seeing the first version?",
    answer:
      "Every project includes revision rounds. If you want to tweak colors, swap images, adjust copy, or refine section layouts, we make the changes promptly during the staging review stage until you are 100% satisfied.",
  },
  {
    id: "faq-9",
    category: "Technical",
    question: "Will my website work properly on smartphones and tablets?",
    answer:
      "100% yes. Over 75% of web traffic in India comes from mobile devices. Every website we engineer is built mobile-first, ensuring lightning-fast touch interactions, perfectly scaled typography, fluid layouts, and instant button tapping across all screen sizes.",
  },
  {
    id: "faq-10",
    category: "Technical",
    question: "Can I update text, images, or prices myself after launch?",
    answer:
      "Yes. For websites with dynamic needs (e.g. restaurant menus, product catalogs, notice boards, or blogs), we can connect simple content management dashboards so you can add products, update prices, or post announcements in seconds without touching code. We also offer affordable monthly maintenance starting at ₹299/mo where we do it all for you.",
  },
  {
    id: "faq-11",
    category: "Technical",
    question: "Do you build websites with database storage and user login systems?",
    answer:
      "Yes! Our Advanced Website and Web Application tiers include modern PostgreSQL databases, secure email/OAuth authentication, password hashing, and administrative dashboards tailored to your exact workflow.",
  },
  {
    id: "faq-12",
    category: "Technical",
    question: "Do I need to buy domain and web hosting myself?",
    answer:
      "You can either purchase the domain yourself (e.g. from GoDaddy, Namecheap, or Hostinger) and share DNS access with us, or we can guide you step-by-step through purchasing it in your own name so you retain 100% legal ownership. We handle the hosting deployment configuration on top-tier global edge networks (Vercel/Cloudflare).",
  },
  {
    id: "faq-13",
    category: "Timeline",
    question: "How long does a project typically take to deliver?",
    answer:
      "Starter and 1-page websites are delivered within 48 to 72 hours. Business websites (3–5 pages) take 4 to 7 days. Complex e-commerce systems, database portals, and custom web applications typically take 1 to 3 weeks depending on the feature list.",
  },
  {
    id: "faq-14",
    category: "Support",
    question: "Do you provide technical support after the website is launched?",
    answer:
      "Yes. Every completed project comes with a free post-launch warranty period to ensure everything runs smoothly. After that, you can opt into our monthly care packages starting at ₹299/month for continuous updates, monitoring, and database backups.",
  },
  {
    id: "faq-15",
    category: "Services",
    question: "Can you redesign or upgrade an existing outdated website?",
    answer:
      "Absolutely. We can take your existing content, brand assets, and domain, and rebuild the entire interface into a lightning-fast, modern Next.js 15 web application with contemporary aesthetics and improved search ranking.",
  },
  {
    id: "faq-16",
    category: "Process",
    question: "What details or content do you need from me to start building?",
    answer:
      "To kick off, we just need: 1) Your business name and logo (if you have one; otherwise we can design one), 2) Basic information about your services/products, 3) Contact details (WhatsApp, phone, email, address), and 4) Any preferred color schemes or reference websites you like.",
  },
  {
    id: "faq-17",
    category: "Clients",
    question: "Who do you work with — only companies or small businesses and individuals too?",
    answer:
      "We work with everyone! Our clients range from local shops, cafes, coaching institutes, doctors, and real estate consultants to student founders, creators, and tech startups across all states in India.",
  },
  {
    id: "faq-18",
    category: "Pricing",
    question: "Why are your prices so affordable compared to big digital agencies?",
    answer:
      "Traditional agencies have heavy overheads—fancy commercial offices, non-technical project managers, marketing executives, and sales commissions. TrioCore is a student-led engineering collective. We have minimal overhead and pass 100% of those cost savings directly to our clients while using newer, faster technology stacks.",
  },
  {
    id: "faq-19",
    category: "Pricing",
    question: "Can you work within a very tight or small budget?",
    answer:
      "Yes! Our Starter Website begins at just ₹999 during our Launch Offer, and our local business packages start at ₹1,499. We can prioritize the most impactful features first and scale your website as your business revenue grows.",
  },
  {
    id: "faq-20",
    category: "Technical",
    question: "Do you use generic pre-made WordPress templates or build custom code?",
    answer:
      "We write 100% clean, custom code using modern Next.js 15, React 19, and Tailwind CSS. We avoid bloated, slow WordPress templates that break with plugin updates. Our sites load in milliseconds, have top-tier security, and score 95+ on Google Lighthouse audits.",
  },
  {
    id: "faq-21",
    category: "Technical",
    question: "What technologies and coding frameworks do you use?",
    answer:
      "Our core frontend stack is Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, and Framer Motion. Our backend and database stack includes PostgreSQL with Drizzle ORM, Neon Serverless, Node.js, and Python/Flask for AI/ML pipelines. For hardware, we use C/C++, Arduino, and embedded firmware.",
  },
  {
    id: "faq-22",
    category: "Services",
    question: "Can you build custom hardware, IoT, or physical NFC smart cards?",
    answer:
      "Yes! In our Innovation Lab, we actively engineer embedded robotics, IoT safety prototypes, and physical laser-engraved NFC smart business cards paired with instant tap-to-share digital profile dashboards.",
  },
  {
    id: "faq-23",
    category: "Legal",
    question: "Who owns the source code and website after project delivery?",
    answer:
      "You receive 100% full, unencumbered ownership of all source code, database schemas, and digital design assets upon final milestone payment. TrioCore retains only the standard right to showcase the completed work in our digital portfolio, unless an exclusive NDA is requested.",
  },
  {
    id: "faq-24",
    category: "Process",
    question: "How do I get started with TrioCore right now?",
    answer:
      "Simply scroll to our contact section below, pick your service and budget range, or email us at triocorebusiness@gmail.com. We will review your vision and reply within 24 hours with an actionable roadmap and timeline!",
  },
];
