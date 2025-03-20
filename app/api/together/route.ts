import OpenAI from "openai";
import { HeliconeManualLogger } from "@helicone/helpers";

const openai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: process.env.HELICONE_BASE_URL,
});

// Initialize the Helicone logger
const heliconeLogger = new HeliconeManualLogger({
  apiKey: process.env.HELICONE_API_KEY!,
  headers: {}, // You can add custom headers here
});

const system_prompt = `
You are a professional resume writer. You goal is to suggest resume bullet points based on the job description.
The bullet point needs to be as close to 20 - 25 words as possible, with no hashtags labells and clearly numbered at 1, 2, 3 and so on.
Only numbered bullets are allowed, nothing else should be in the response.
`

export async function POST(req: Request) {
  const { prompt, model } = await req.json();

  // Create request body
  const body = {
    model,
    messages: [
      { role: "system", content: system_prompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 200,
    stream: true,
  }

  // Make the request
  const response = await openai.chat.completions.create(body);
  const stream = response.toReadableStream();
  const [streamForUser, streamForLogging] = stream.tee();  
  heliconeLogger.logSingleStream(body, streamForLogging);
  
  return new Response(streamForUser);
}

export const runtime = "edge";