"use client";

import { FormEvent, useState } from "react";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("pending");

    const res = await fetch("/api/answer", {
      method: "POST",
      body: JSON.stringify({ question }),
    });

    if (!res.body) return;

    ChatCompletionStream.fromReadableStream(res.body)
      .on("content", (delta) => setAnswer((text) => text + delta))
      .on("end", () => setStatus("done"));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl grow flex-col px-4">
      {status === "idle" ? (
        <div className="flex grow flex-col justify-center">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <input
              placeholder="Ask me a question"
              autoFocus
              name="prompt"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="block w-full rounded border border-gray-300 p-2 outline-black"
            />
            <button
              className="rounded bg-black px-3 py-1 font-medium text-white outline-offset-[3px] outline-black"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col justify-end">
            <div className="grid grid-cols-4">
              <p className="col-span-3 text-xl">{question}</p>

              <div className="text-right">
                <button
                  className="rounded bg-black px-3 py-2 font-medium text-white disabled:opacity-50"
                  disabled={status === "pending"}
                  onClick={() => {
                    setQuestion("");
                    setAnswer("");
                    setStatus("idle");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="py-8">
            <p className="whitespace-pre-wrap">{answer}</p>
          </div>
        </>
      )}
    </div>
  );
}
