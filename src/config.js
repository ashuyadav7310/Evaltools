function toolRoute(envValue, defaultPath) {
  return envValue?.trim() || defaultPath;
}

export const toolConfig = [
  {
    id: "evalai",
    name: "EvalAI",
    badge: "Evaluation",
    href: toolRoute(import.meta.env.VITE_EVALAI_URL, "/evalai/"),
    apiBaseUrl: toolRoute(import.meta.env.VITE_EVALAI_API_URL, "/api/evalai/"),
    description:
      "Automate assignment/case-study evaluation. Generate consistent scores and detailed feedback at scale.",
    backDescription: [
      "Takes case study, rubric/keypoints, and student submissions, then scores answers using hybrid matching/scoring logic and generates Excel reports. It is mainly for structured academic/internal evaluation."
    ],
    usage: "Only for internal Purpose",
    client: "",
    pills: ["Case Study & Problem Statement", "Rubric based Scoring", "Reports"],
    icon: "clipboard"
  },
  {
    id: "comcoachai",
    name: "ComcoachAI",
    badge: "Communication",
    href: toolRoute(import.meta.env.VITE_COMCOACHAI_URL, "/comcoachai"),
    apiBaseUrl: toolRoute(import.meta.env.VITE_COMCOACHAI_API_URL, "/api/comcoachai/"),
    description:
      "Improve communication skills with quality feedback on  strengths and area of improvement in tone, clarity, and confidence.",
    backDescription: [
      "Trainers create scenarios and rubrics; participants record audio responses. The backend transcribes speech, analyzes audio quality, evaluates the transcript with AI, gives scores, strengths, improvements, and report/dashboard data."
    ],
    usage: "Used for",
    client: "communication skill assessment.",
    pills: ["Speech Analysis", "Rubric based Scores", " Strengths & Improvements",],
    icon: "message"
  },
  {
    id: "convai",
    name: "ConvAI",
    badge: "Conversation",
    href: toolRoute(import.meta.env.VITE_CONVAI_URL, "/convai/"),
    apiBaseUrl: toolRoute(import.meta.env.VITE_CONVAI_API_URL, "/api/convai/"),
    description:
      "Run scenario-based interview or role-play assessments with AI-driven feedback on dialogue quality and flow. ",
    backDescription: [
      "Trainers create tests with scenarios and rubrics. Candidates join via test code, answer AI-generated adaptive questions through audio/text, and the system transcribes, follows up, completes the session, and produces rubric-based evaluation reports. It is designed for conversational skill assessment in interviews or training contexts."
    ],
    usage: "Used for",
    client: "conversational skill assessment.",
    pills: ["Scenario-based", "Rubric based", "Adaptive Questioning"],
    icon: "conversation"
  },
  {
    id: "survey360",
    name: "Survey 360",
    badge: "Assessment",
    href: "https://survey360.u-next.com",
    apiBaseUrl: "",
    description:
      "Collect structured feedback through Self, 270°, and 360° evaluations. Generate actionable insights on employee performance, competencies, and development areas.",
    backDescription: [
      "Survey 360 enables organizations to collect structured feedback through Self, 270°, and 360° assessments across multiple stakeholders including managers, peers, and direct reports.",
      "It aggregates responses to provide a comprehensive view of employee performance, competencies, and behavioral patterns."
    ],
    usage: "Used for",
    client: "employee performance assessment.",
    pills: ["Self Assessment", "270° Feedback", "360° Feedback"],
    icon: "clipboard"
  },
  {
    id: "careerinventory",
    name: "Career Inventory",
    badge: "Assessment",
    href: "https://survey.u-next.com",
    apiBaseUrl: "",
    description:
      "Identify career strengths, motivations, and ideal role alignment. Based on Career Anchor Assessment to improve fit and long-term satisfaction.",
    backDescription: [
      "Career Inventory helps individuals understand their career drivers, strengths, and motivations using the Career Anchor Assessment framework.",
      "It identifies eight key anchors including Autonomy, Challenge, Entrepreneurial Creativity, Managerial Competence, Lifestyle, Security, Service, and Technical Expertise.",
      "The tool supports better career planning, role alignment, and long-term job satisfaction by matching individuals with suitable opportunities."
    ],
    usage: "Used for",
    client: "career pathing and role alignment.",
    pills: ["Career Guidance", "Self Awareness", "Career Planning"],
    icon: "conversation"
  },
  {
    id: "codeevaluation",
    name: "Code Evaluation",
    badge: "Technical",
    href: "https://fdeevaluatoragent-escotkya6v5bmw2ewnaybt.streamlit.app/",
    apiBaseUrl: "",
    description:
      "Assess coding skills through real-time challenges and practical tests. Measure problem-solving ability, logic, and programming efficiency.",
    backDescription: [
      "Code Evaluation is designed to assess technical and programming skills through real-time coding challenges and practical problem-solving exercises.",
      "It evaluates logic, efficiency, and coding standards across different difficulty levels and domains.",
      "The system generates structured performance reports, helping organizations make data-driven hiring and skill assessment decisions."
    ],
    usage: "Used for",
    client: "technical skill assessment.",
    pills: ["Coding Tests", "Problem Solving", "Logic Evaluation"],
    icon: "clipboard"
  }
];
