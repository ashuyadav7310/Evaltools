function toolRoute(envValue, defaultPath) {
  return envValue?.trim() || defaultPath;
}

export const toolConfig = [
  {
    id: "evalai",
    name: "EvalAI",
    badge: "Evaluation",
    status: "Local",
    statusType: "local",
    href: toolRoute(import.meta.env.VITE_EVALAI_URL, "/evalai/"),
    apiBaseUrl: toolRoute(import.meta.env.VITE_EVALAI_API_URL, "/api/evalai/"),
    description:
      "Score, benchmark, and compare AI responses with structured rubrics.",
    usage: "Only for internal Purpose",
    client: "",
    pills: ["Benchmarking", "Scoring", "Reports"],
    icon: "clipboard"
  },
  {
    id: "comcoachai",
    name: "ComcoachAI",
    badge: "Coaching",
    status: "Local",
    statusType: "live",
    href: toolRoute(import.meta.env.VITE_COMCOACHAI_URL, "/comcoachai/"),
    apiBaseUrl: toolRoute(import.meta.env.VITE_COMCOACHAI_API_URL, "/api/comcoachai/"),
    description:
      "Coach communication quality with feedback on tone, clarity, and confidence.",
    usage: "Used by",
    client: "",
    pills: ["Tone Analysis", "Clarity", "Feedback"],
    icon: "message"
  },
  {
    id: "convai",
    name: "ConvAI",
    badge: "Conversation",
    status: "Local",
    statusType: "local",
    href: toolRoute(import.meta.env.VITE_CONVAI_URL, "/convai/"),
    apiBaseUrl: toolRoute(import.meta.env.VITE_CONVAI_API_URL, "/api/convai/"),
    description:
      "Design guided simulations, dialogue journeys, and multi-turn practice flows.",
    usage: "Used by",
    client: "",
    pills: ["Dialogue", "Flow Design", "Multi-turn"],
    icon: "conversation"
  }
];
