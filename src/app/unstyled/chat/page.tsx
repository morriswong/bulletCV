"use client";

import { FormEvent, useState } from "react";
import Together from "together-ai";
import { ChatCompletionStream } from "together-ai/lib/ChatCompletionStream";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<
    Together.Chat.Completions.CompletionCreateParams.Message[]
  >([]);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setPrompt("");
    setIsPending(true);
    setMessages((messages) => [...messages, { role: "user", content: prompt }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [...messages, { role: "user", content: prompt }],
      }),
    });

    if (!res.body) return;

    ChatCompletionStream.fromReadableStream(res.body)
      .on("content", (delta, content) => {
        setMessages((messages) => {
          const lastMessage = messages.at(-1);

          if (lastMessage?.role !== "assistant") {
            return [...messages, { role: "assistant", content }];
          } else {
            return [...messages.slice(0, -1), { ...lastMessage, content }];
          }
        });
      })
      .on("end", () => {
        setIsPending(false);
      });
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <input
            placeholder="Send a message"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" disabled={isPending}>
            Submit
          </button>
        </fieldset>
      </form>

      {messages.map((message, i) => (
        <p key={i}>
          {message.role}: {message.content}
        </p>
      ))}
    </div>
  );
}
