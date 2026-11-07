// 학습 데이터 만들기: 가짜 놀이 기록 → 로컬 선생 모델(Ollama qwen2.5:7b)이 정답 작성 → ai/data/train.jsonl
// 실제 아이 정보는 쓰지 않음. 외부 API 호출 없음.
// 실행: node ai/make_dataset.mjs 200
import { readFileSync, appendFileSync, existsSync } from "node:fs";

const N = Number(process.argv[2] ?? 200);
const OUT = new URL("./data/train.jsonl", import.meta.url);
const TEACHER = process.env.TEACHER ?? "qwen2.5:7b";
const plays = JSON.parse(readFileSync(new URL("../data/plays.json", import.meta.url)));

export const SYSTEM = `너는 '놀이다리'의 기록 정리 도우미야.
부모가 남긴 놀이 기록 정리를 읽고, 센터 상담 때 보여줄 정리를 JSON으로만 답한다.
규칙:
- 기록에 있는 사실만 쓴다. 기록에 없는 행동이나 놀이를 지어내지 않는다.
- 진단, 발달 수준 판정, 놀이 효과 단정("좋아졌다", "향상됐다", "지연이다")을 하지 않는다.
- 정리된 사실(횟수, 즐거워한 놀이, 어려워한 놀이)과 부모 메모만 근거로 쓴다. 숫자를 바꾸지 않는다.
- 어려워한 놀이가 '없음'이면 difficulties에 '기록에서 어려워한 놀이는 없었어요.'라고 쓴다.
- '발달', '향상', '점차', '늘었다'처럼 변화나 효과를 말하는 표현을 쓰지 않는다. 무엇을 했고 어떻게 반응했는지만 쓴다.
- 부모를 탓하거나 평가하지 않는다. 쉬운 말로 쓴다.
형식: {"interests": "아이가 흥미를 보인 점 1~2문장", "difficulties": "아이가 어려워한 점 1~2문장", "summary": "기간 동안의 놀이 모습 요약 3문장"}`;

const AREA = { lang: "언어", cog: "인지", soc: "사회성", gross: "대근육", fine: "소근육" };
const REACT = { enjoyed: "즐거워함", neutral: "보통", hard: "어려워함" };
// 놀이와 상관없는 공통 메모 + 영역별 메모 (놀이와 메모가 어긋나지 않게)
const MEMO = {
  enjoyed: ["계속 또 하자고 했어요", "처음으로 혼자 끝까지 했어요", "아빠한테 자랑하러 갔어요", ""],
  neutral: ["중간에 다른 장난감을 보러 갔다가 돌아왔어요", "조용히 지켜보다가 한두 번 따라 했어요", "", "졸려서 짧게 했어요"],
  hard: ["1분 정도 하고 그만하자고 했어요", "제가 먼저 해주니까 조금 따라 했어요", ""],
};
const AREA_MEMO = {
  lang: { enjoyed: ["깔깔 웃으면서 소리를 따라 했어요", "새로운 말을 하나 따라 했어요"], neutral: ["소리는 냈지만 말은 따라 하지 않았어요"], hard: ["말하라고 하니 고개를 돌렸어요", "차례를 기다리기 힘들어했어요"] },
  cog: { enjoyed: ["맞힐 때마다 손뼉을 쳤어요", "혼자서 한 번 더 해 보겠다고 했어요"], neutral: ["두세 번 하고 다른 걸 만졌어요"], hard: ["헷갈려서 아무거나 집었어요", "규칙이 바뀌니 짜증을 냈어요"] },
  soc: { enjoyed: ["제 눈을 보고 웃었어요", "인형한테도 차례를 줬어요"], neutral: ["혼자 하고 싶어 했어요"], hard: ["차례를 넘기지 않으려고 울었어요", "제가 다가가니 자리를 피했어요"] },
  gross: { enjoyed: ["또 하자며 뛰어다녔어요", "끝까지 혼자 건넜어요"], neutral: ["한 번 하고 앉아서 쉬었어요"], hard: ["넘어질까 봐 손을 놓지 않았어요", "중간에 주저앉았어요"] },
  fine: { enjoyed: ["다 하고 박수를 쳤어요", "만든 걸 아빠한테 보여줬어요"], neutral: ["몇 개만 하고 멈췄어요"], hard: ["손에 힘이 안 들어가서 울었어요", "손이 아프다고 했어요"] },
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// 가짜 기록 만들기
function fakeLogs() {
  const n = 3 + Math.floor(Math.random() * 8);
  const start = new Date(2026, 9, 1 + Math.floor(Math.random() * 20));
  const logs = [];
  let day = -1;
  for (let i = 0; i < n; i++) {
    const p = pick(plays);
    const reaction = pick(Object.keys(REACT));
    const done = reaction === "hard" ? pick(["partial", "notDone", "done"]) : pick(["done", "done", "partial"]);
    day += 1 + Math.floor(Math.random() * 3);
    const date = new Date(start.getTime() + day * 86400000).toISOString().slice(5, 10);
    logs.push({ date, play: p, done, reaction, memo: pick([...MEMO[reaction], ...(AREA_MEMO[p.area]?.[reaction] ?? [])]) });
  }
  return logs;
}

// 기록 → 사실 정리 (앱에서도 같은 형식으로 모델에 넘김). 계산은 규칙이, 문장은 모델이.
export function facts(logs) {
  const count = (arr) => Object.entries(arr.reduce((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {}));
  const list = (f) => count(logs.filter(f).map((l) => l.play.title)).map(([t, c]) => `${t}(${c}회)`).join(", ") || "없음";
  const areas = count(logs.map((l) => AREA[l.play.area])).map(([a, c]) => `${a} ${c}회`).join(", ");
  const memos = logs.filter((l) => l.memo).map((l) => `- ${l.date} ${l.play.title}: "${l.memo}"`);
  return [
    `기록 기간: ${logs[0].date} ~ ${logs.at(-1).date} (${logs.length}회)`,
    `영역별 횟수: ${areas}`,
    `즐거워한 놀이: ${list((l) => l.reaction === "enjoyed")}`,
    `어려워한 놀이: ${list((l) => l.reaction === "hard")}`,
    `못한 놀이: ${list((l) => l.done === "notDone")}`,
    `부모 메모:`,
    ...(memos.length ? memos : ["- 없음"]),
  ].join("\n");
}

async function teach(user) {
  const r = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
      model: TEACHER, stream: false, format: "json", options: { temperature: 0.4 },
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }],
    }),
  });
  const out = (await r.json()).message.content;
  const j = JSON.parse(out); // 형식이 틀리면 throw → 버림
  if (!j.interests || !j.difficulties || !j.summary) throw new Error("missing field");
  if (/진단|지연|향상|좋아졌|발달|점차|늘어|개월간|개월 동안|효과|적응|관심이 없|보여줍니다|보여주|변화|성장|능력|수준/.test(out)) throw new Error("banned word");
  // 기록에 없는 놀이 제목이 나오면 버림
  for (const p of plays) if (out.includes(p.title) && !user.includes(p.title)) throw new Error("unknown play");
  return JSON.stringify(j, null, 0);
}

if (process.argv[1].endsWith("make_dataset.mjs")) {
  let ok = 0;
  for (let i = 0; ok < N && i < N * 3; i++) {
    const user = facts(fakeLogs());
    try {
      const answer = await teach(user);
      appendFileSync(OUT, JSON.stringify({ messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }, { role: "assistant", content: answer }] }) + "\n");
      console.log(`${++ok}/${N}`);
    } catch (e) {
      console.log("skip:", e.message);
    }
  }
  console.log(existsSync(OUT) ? `done → ${OUT.pathname}` : "no data");
}
