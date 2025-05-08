"use client";

import Image from "next/image";
import { useRef, useState, useEffect, Fragment } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import Toggle from "../components/Toggle";
import TabSelector from "../components/TabSelector";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream";
import { Menu, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

// Declare Tally type for TypeScript
declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: { 
        width?: number; 
        autoClose?: boolean | number;
        layout?: 'default' | 'modal';
        hiddenFields?: Record<string, any>;
        onSubmit?: (payload: any) => void;
      }) => void;
      closePopup: (formId: string) => void;
    };
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(``);
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const [generatedBios, setGeneratedBios] = useState<String>("");
  const [isDemo, setIsDemo] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [promptType, setPromptType] = useState<string>("Default");
  const [jobUrl, setJobUrl] = useState("");
  const [errorType, setErrorType] = useState<'' | 'validation' | 'api'>('');
  const [errorMessage, setErrorMessage] = useState('');

  // Function to fetch job description from URL using Readability
  const fetchJobDescription = async (url: string) => {
    try {
      // Validate URL format - simplified to just check for http/https protocols
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('VALIDATION_ERROR: Invalid URL format');
      }
      
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${errorData.error || 'API_ERROR: Failed to extract content'}`);
      }
      
      const { content } = await response.json();
      return content || '';
    } catch (error) {
      console.error('Error fetching job description:', error);
      throw error; // Propagate error to UI
    }
  };
  
  // Sample job description for demo mode
  const sampleJobDescription = `Marketing Manager Position
Responsibilities include developing marketing campaigns, analyzing market trends, and managing social media presence. 
Requirements: 3+ years of experience in digital marketing, proven track record of increasing engagement, and experience with SEO/SEM campaigns.`;

  const bioRef = useRef<null | HTMLDivElement>(null);

  // Add useEffect to scroll when generatedBios changes and is not empty
  useEffect(() => {
    if (generatedBios && bioRef.current) {
      setTimeout(() => {
        bioRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [generatedBios]);
  
  // Add useEffect to populate textarea with sample job description when demo mode is toggled on
  useEffect(() => {
    if (isDemo) {
      setBio(selectedJob || sampleJobDescription);
    } else {
      setBio(""); // Clear the textarea when demo is turned off
    }
  }, [isDemo, selectedJob]);

  const scrollToBios = () => {
    if (bioRef.current !== null && generatedBios) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const prompt = `
  ### Task
  You goal is to suggest resume bullet points based on the job description.
  The bullet point needs to be under 20 words, with no hashtags labells and clearly numbered at 1, 2, 3 and so on.
  Only numbered bullets are allowed, nothing else should be in the response.

  ### Bullet Point Writing Instructions
  From the following job description, extract the top 5 key responsibilities or required skills. For each one, generate a resume bullet point that showcases relevant experience or proficiency. Each bullet point should:
  - Start with a powerful action verb
  - Describe a specific accomplishment or task
  - Include quantifiable metrics or results where applicable
  - Integrate keywords from the job description

  Write bullet points using the following XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].
  
  Here are some examples
  Marketing manager 
  Increased page views (X) by 23% (Y) in six months by implementing social media distribution strategies (Z). 
  Reduced ad spend (X) by 30% (Y) by improving customer targeting (Z).
  
  Sales specialist
  Increased conversions (X) by 28% (Y) after training five new team members (Z). 
  Launched a new product (X) that led to a 15% profit increase in Q1 (Y) by engaging newsletter subscribers (Z). 
  
  Customer service 
  Reduced errors (X) by 40% (Y) after creating a new Standard Operating Procedure (SOP) document (Z). 
  Increased customer satisfaction (X) by 18% (Y) by implementing survey feedback (Z). 

  Ensure the bullet points are concise, professional, and directly aligned with the job requirements.

  ### Job Description
  ${bio}${bio.slice(-1) === "." ? "" : "."}`;

  const concisePrompt = `
  ### Task
  Generate 5 concise and impactful resume bullet points based on the job description.
  Each bullet must be under 15 words, clearly numbered (1-5), and focus on core skills.
  
  ### Instructions
  - Use powerful action verbs
  - Be extremely concise and direct
  - Focus on technical skills and measurable achievements
  - No explanatory text, just the numbered bullets
  
  ${bio}${bio.slice(-1) === "." ? "" : "."}`;

  const creativePrompt = `
  ### Task
  Create 5 creative and attention-grabbing resume bullet points that stand out to recruiters.
  Number each point clearly from 1-5.
  
  ### Instructions
  - Use unique, memorable phrasing that showcases personality
  - Highlight transferable skills and innovative approaches
  - Include unexpected achievements and creative problem-solving
  - Focus on what makes the candidate distinctive
  - Keep each bullet under 20 words
  
  ${bio}${bio.slice(-1) === "." ? "" : "."}`;

  const getSelectedPrompt = () => {
    switch(promptType) {
      case "Concise":
        return concisePrompt;
      case "Creative":
        return creativePrompt;
      default:
        return prompt;
    }
  };

  const generateBio = async (e: any) => {
    e.preventDefault();
    setGeneratedBios("");
    setLoading(true);
    const response = await fetch("/api/together", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: getSelectedPrompt(),
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const runner = ChatCompletionStream.fromReadableStream(response.body!);
    let isFirstChunk = true;
    runner.on("content", (delta) => {
      setGeneratedBios((prev) => prev + delta);
      if (isFirstChunk) {
        setTimeout(scrollToBios, 500);
        isFirstChunk = false;
      }
    });

    runner.on("end", () => {
      setLoading(false);
      // Increase timeout and ensure content is rendered before scrolling
      setTimeout(scrollToBios, 1000);
    });
  };

  // Function to open Tally form - keeping this as a fallback
  const openTallyForm = () => {
    // @ts-ignore - Tally is loaded from external script
    if (window.Tally) {
      window.Tally.openPopup('wav27X', {
        width: 540,
        layout: 'modal',
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <p className="border rounded-2xl py-1 px-4 text-slate-500 text-sm mb-5 hover:scale-105 transition duration-300 ease-in-out">
          Over <b>141,592</b> bullets generated so far
        </p>
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
        Resume Bullet Point Ideas in Seconds
        </h1>
        <div className="mt-7">
          <Toggle isDemo={isDemo} setIsDemo={setIsDemo} />
        </div>

        {isDemo && (
          <TabSelector
            selectedJob={selectedJob}
            onSelectJob={setSelectedJob}
            isDemo={isDemo}
          />
        )}

        <div className="max-w-xl w-full">
          {!isDemo && (
            <div className="flex flex-col mt-10 space-y-3">
              <div className="flex items-center space-x-3">
                <p className="text-left font-medium">
                  Paste a job description URL (Beta)
                </p>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={jobUrl}
                  onChange={async (e) => {
                    setJobUrl(e.target.value);
                    if (e.target.value) {
                      try {
                        setErrorType('');
                        const description = await fetchJobDescription(e.target.value);
                        setBio(description);
                      } catch (error: any) {
                        setErrorType(error.message.startsWith('VALIDATION_ERROR') ? 'validation' : 'api');
                        setErrorMessage(error.message.replace(/^(VALIDATION_ERROR|API_ERROR):\s*/i, ''));
                        setBio('');
                      }
                    }
                  }}
                  className={`w-full rounded-md ${errorType ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-black focus:ring-black px-3 py-2`}
                  placeholder="https://example.com/job-description"
                />
                {errorType === 'validation' && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <title>Invalid URL format</title>
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {errorType === 'api' && (
                  <p className="text-red-500 text-sm mt-1">
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex mt-5 items-center space-x-3">
            <p className="text-left font-medium">
              Drop in your job descriptions {" "}
              <span className="text-slate-500">(The key section only for best results)</span>.
            </p>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={"Include sections with key skills, responsibilities, and requirements"}
          />
          {/* <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe.</p>
          </div> */}
          {/* <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div> */}
          {loading ? (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full disabled:opacity-50"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          ) : (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Generate bullets &rarr;
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedBios && (
            <>
              {/* Section separator between top input and results */}
              <div className="w-full flex items-center justify-center mb-8">
                <div className="h-px bg-gray-300 w-1/3"></div>
                <div className="mx-4 text-gray-500">Generated Results</div>
                <div className="h-px bg-gray-300 w-1/3"></div>
              </div>
            
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={bioRef}
                >
                  Your generated bullets
                </h2>
                <p className="text-slate-500 text-sm mt-1 mb-3">(Click on the bullets to copy to clipboard)</p>
                
                <div className="flex justify-center mt-2 mb-4">
                  <Menu as="div" className="relative inline-block text-left mr-2">
                    <div>
                      <Menu.Button className="inline-flex justify-between items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black">
                        {promptType}
                        <ChevronDownIcon
                          className="-mr-1 ml-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                      >
                        <div className="">
                          {["Default", "Concise", "Creative"].map((type) => (
                            <Menu.Item key={type}>
                              {({ active }) => (
                                <button
                                  onClick={() => setPromptType(type)}
                                  className={`${
                                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                  } ${
                                    promptType === type ? "bg-gray-200" : ""
                                  } px-4 py-2 text-sm w-full text-left flex items-center space-x-2 justify-between`}
                                >
                                  <span>{type}</span>
                                  {promptType === type ? (
                                    <CheckIcon className="w-4 h-4 text-bold" />
                                  ) : null}
                                </button>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                
                  {loading ? (
                    <button
                      className="bg-black rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80 disabled:opacity-50"
                      disabled
                    >
                      <LoadingDots color="white" style="large" />
                    </button>
                  ) : (
                    <button
                      className="bg-black rounded-xl text-white font-medium px-4 py-2 hover:bg-black/80"
                      onClick={(e) => generateBio(e)}
                    >
                      Generate Again
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {/* Regular bullet points */}
                <div className="w-full">
                  {generatedBios
                    .substring(generatedBios.indexOf("1") + 3)
                    .split(/^\d+\./gm)
                    .map((generatedBio) => {
                      return (
                        <div
                          className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border mb-4"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedBio);
                            toast("Bio copied to clipboard", {
                              icon: "✂️",
                            });
                          }}
                          key={generatedBio}
                        >
                          <p>{generatedBio}</p>
                        </div>
                      );
                    })}
                </div>
                
                {/* Special bullet point with Tally.so call to action */}
                {generatedBios && (
                  <div
                    className="bg-black text-white rounded-xl shadow-md p-4 hover:bg-black/80 transition cursor-pointer border border-gray-300 w-full"
                    data-tally-open="wav27X"
                    data-tally-emoji-text="💼"
                    data-tally-emoji-animation="bounce"
                    data-source="bullet-generator"
                  >
                    <p className="flex items-center justify-center">
                      <span>💼 Click for Bullets Tailored to You!</span>
                      <span className="text-sm bg-white text-black px-2 py-1 rounded ml-2">PRO</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}