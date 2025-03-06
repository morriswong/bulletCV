import Together from "together-ai";
const together = new Together();

if (!process.env.TOGETHER_API_KEY) throw new Error("Missing Together env var");

const system_prompt = `
You goal is to suggest resume bullet points based on the job description.
The bullet point needs to be as close to 20 - 25 words as possible, with no hashtags labells and clearly numbered at 1, 2, 3 and so on.
Only numbered bullets are allowed, nothing else should be in the response.
`

export async function POST(req: Request) {
  const { prompt, model } = await req.json();

  const runner = together.chat.completions.stream({
    model,
    messages: [
      { role: "system", content: system_prompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.5,
    max_tokens: 200,
  });

  return new Response(runner.toReadableStream());
}

export const runtime = "edge";
