// POST /api/report  { logs: PlayLog[] } → ReportText
// 로컬 AI(Ollama)만 호출합니다. 아이 기록을 외부 서비스로 보내지 않습니다.
import { facts, parseAiReport, ruleReport, SYSTEM } from "@/lib/report";
import type { PlayLog } from "@/types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "noridari";

export async function POST(req: Request) {
  const { logs } = (await req.json()) as { logs: PlayLog[] };
  if (!Array.isArray(logs) || logs.length === 0) return Response.json({ error: "기록이 없어요" }, { status: 400 });

  try {
    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: "json",
        options: { temperature: 0.3 },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: facts(logs) },
        ],
      }),
    });
    const ai = r.ok ? parseAiReport((await r.json()).message?.content ?? "") : null;
    if (ai) return Response.json(ai);
  } catch {
    // 로컬 AI가 꺼져 있거나 느림 → 규칙 문장
  }
  return Response.json(ruleReport(logs));
}
