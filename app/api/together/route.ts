import Together from "together-ai";
import { HeliconeManualLogger } from "@helicone/helpers";

// Initialize the Helicone logger
const heliconeLogger = new HeliconeManualLogger({
  apiKey: process.env.HELICONE_API_KEY!,
  headers: {}, // You can add custom headers here
});

const system_prompt = `
You goal is to suggest resume bullet points based on the job description.
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
  } as Together.Chat.CompletionCreateParamsStreaming & { stream: true };

  // Initialize Together client
  const together = new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  // Make the request
  const response = await together.chat.completions.create(body);
  
  // Split the stream into two for logging and processing
  const [loggingStream, clientStream] = response.tee();
  
  // Log the stream to Helicone
  heliconeLogger.logStream(body, async (resultRecorder) => {
    resultRecorder.attachStream(loggingStream.toReadableStream());
  });

  // Return the client stream
  return new Response(clientStream.toReadableStream());
}

export const runtime = "edge";