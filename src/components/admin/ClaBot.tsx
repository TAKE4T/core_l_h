"use client";

import { useMemo, useState } from "react";

type Role = "assistant" | "user";

type Message = {
  id: string;
  role: Role;
  content: string;
};

type BotState = {
  target: string;
  problem: string;
  outcome: string;
  approach: string;
};

function buildCla(state: BotState): string {
  const target = state.target.trim();
  const problem = state.problem.trim();
  const outcome = state.outcome.trim();
  const approach = state.approach.trim();

  const t = target || "（誰のために）";
  const p = problem || "（どんな課題を）";
  const o = outcome || "（どうしたいか）";
  const a = approach || "（どんな考え方で）";

  return `私は${t}のために、${p}を、${a}という考え方で${o}を実現する。`;
}

function nextQuestion(step: number): string {
  switch (step) {
    case 0:
      return "誰のための文章（読者/顧客）ですか？例：中小企業の経営者 / 就活生 / 新任マネージャー";
    case 1:
      return "その人が抱えている“具体的な困りごと”は何ですか？";
    case 2:
      return "読後にその人はどうなっていてほしいですか？（得たい状態/行動）";
    case 3:
      return "それを実現するための“あなたの考え方/型/アプローチ”は何ですか？";
    default:
      return "OK。下書きができました。必要なら言い回しを整えます。どこを直したいですか？";
  }
}

function uid(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function ClaBot({
  onApplyDraft,
}: {
  onApplyDraft: (draft: string) => void;
}) {
  const [state, setState] = useState<BotState>({
    target: "",
    problem: "",
    outcome: "",
    approach: "",
  });

  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "assistant",
      content: "こんにちは。コアランゲージ（CLA）を一緒に言語化しましょう。",
    },
    {
      id: uid(),
      role: "assistant",
      content: nextQuestion(0),
    },
  ]);

  const draft = useMemo(() => buildCla(state), [state]);

  function push(role: Role, content: string) {
    setMessages((prev) => [...prev, { id: uid(), role, content }]);
  }

  function applyAnswer(answerRaw: string) {
    const answer = answerRaw.trim();
    if (!answer) return;

    push("user", answer);

    setState((prev) => {
      if (step === 0) return { ...prev, target: answer };
      if (step === 1) return { ...prev, problem: answer };
      if (step === 2) return { ...prev, outcome: answer };
      if (step === 3) return { ...prev, approach: answer };
      return prev;
    });

    const next = Math.min(step + 1, 4);
    setStep(next);
    push("assistant", nextQuestion(next));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,360px]">
      <div>
        <div className="mb-2 text-sm text-gray-600">BOT（疑似）</div>
        <div
          className="space-y-4 rounded bg-white p-4 shadow-sm border border-gray-200"
          style={{ minHeight: "320px", maxHeight: "420px", overflowY: "auto" }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${
                m.role === "user" ? "bg-gray-50 text-gray-900" : "bg-white text-gray-700"
              } rounded p-3 border border-gray-200`}
            >
              <div className="mb-1 text-xs text-gray-500">
                {m.role === "user" ? "あなた" : "BOT"}
              </div>
              <div className="whitespace-pre-wrap text-sm" style={{ lineHeight: "1.7" }}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded bg-white p-4 shadow-sm border border-gray-200">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const a = input;
                setInput("");
                applyAnswer(a);
              }
            }}
            placeholder="回答を入力...（Enterで送信 / Shift+Enterで改行）"
            className="mb-2 w-full resize-none border border-gray-200 rounded p-3 focus:outline-none focus:ring-1 focus:ring-gray-400"
            rows={3}
          />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="text-sm text-gray-600 underline hover:text-gray-900"
              onClick={() => {
                setState({ target: "", problem: "", outcome: "", approach: "" });
                setStep(0);
                setInput("");
                setMessages([
                  {
                    id: uid(),
                    role: "assistant",
                    content: "こんにちは。コアランゲージ（CLA）を一緒に言語化しましょう。",
                  },
                  { id: uid(), role: "assistant", content: nextQuestion(0) },
                ]);
              }}
            >
              リセット
            </button>

            <button
              type="button"
              className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
              onClick={() => {
                const a = input;
                setInput("");
                applyAnswer(a);
              }}
            >
              送信
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm text-gray-600">下書き</div>
        <div className="rounded bg-white p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-900" style={{ lineHeight: "1.9" }}>
            {draft}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => onApplyDraft(draft)}
            >
              この下書きをCLA入力に反映
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500" style={{ lineHeight: "1.6" }}>
            ※これはMVP用の疑似BOTです（LLM未接続）。
          </p>
        </div>
      </div>
    </div>
  );
}
