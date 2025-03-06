import Together from "together-ai";

const together = new Together();

export async function POST(request: Request) {
  const { messages } = await request.json();

  const res = await together.chat.completions.create({
    model: process.env.TOGETHER_MODEL,
    messages,
    stream: true,
  });

  return new Response(res.toReadableStream());
}
