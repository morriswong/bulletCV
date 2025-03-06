import Together from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY
});

export async function POST(request: Request) {
  const { question } = await request.json();

  const res = await together.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages: [{ role: "user", content: question }],
    stream: true,
  });

  return new Response(res.toReadableStream());
}
