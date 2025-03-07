import { Tab } from "@headlessui/react";

interface JobDescription {
  title: string;
  description: string;
}

interface TabSelectorProps {
  selectedJob: string;
  onSelectJob: (description: string) => void;
  isDemo: boolean;
}

const sampleJobs: JobDescription[] = [
  {
    title: "Marketing",
    description: `Senior Marketing Manager Position
Responsibilities include developing integrated marketing campaigns, analyzing market trends, and managing brand strategy.
Requirements: 5+ years of marketing experience, proven track record in digital marketing, experience with marketing analytics tools, and strong team leadership skills.`
  },
  {
    title: "Finance",
    description: `Financial Analyst Position
Responsibilities include conducting financial analysis, preparing budget forecasts, and developing financial models.
Requirements: Bachelor's degree in Finance or related field, 3+ years of financial analysis experience, proficiency in Excel and financial modeling, and CFA certification preferred.`
  },
  {
    title: "Tech",
    description: `Senior Software Engineer Position
Responsibilities include developing scalable applications, leading technical design discussions, and mentoring junior developers.
Requirements: 5+ years of experience in full-stack development, expertise in React/Node.js, experience with cloud services (AWS/GCP), and strong system design skills.`
  }
];

export default function TabSelector({ selectedJob, onSelectJob, isDemo }: TabSelectorProps) {
  return (
    <div className="w-full max-w-xl px-2 py-4">
      <Tab.Group
        onChange={(index) => {
          if (isDemo) {
            onSelectJob(sampleJobs[index].description);
          }
        }}
      >
        <Tab.List className="flex space-x-1 rounded-xl bg-slate-100 p-1">
          {sampleJobs.map((job) => (
            <Tab
              key={job.title}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected 
                  ? 'bg-white text-black shadow'
                  : 'text-slate-600 hover:bg-white/[0.12] hover:text-black'}
              `}
            >
              {job.title}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  );
}