"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import Toggle from "../components/Toggle";
import TabSelector from "../components/TabSelector";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(``);
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const [generatedBios, setGeneratedBios] = useState<String>("");
  const [isDemo, setIsDemo] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  
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
  ### Task
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
  ${bio}${bio.slice(-1) === "." ? "" : "."}`;

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
        prompt,
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
          <div className="flex mt-10 items-center space-x-3">
            {/* <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            /> */}
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
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
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
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={bioRef}
                >
                  Your generated bullets
                </h2>
                <span className="text-slate-500">(Click on the bullets to copy to clipboard)</span>.
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {generatedBios
                  .substring(generatedBios.indexOf("1") + 3)
                  .split(/^\d+\./gm)
                  .map((generatedBio) => {
                    return (
                      <div
                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}