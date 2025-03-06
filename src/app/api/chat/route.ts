import Together from "together-ai";

const together = new Together();

export async function POST(request: Request) {
  const { messages } = await request.json();

  const res = await together.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    messages,
    stream: true,
  });

  return new Response(res.toReadableStream());
}
