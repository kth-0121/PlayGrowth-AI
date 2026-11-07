// 시연용 가짜 데이터. 실제 아이 정보 금지 규칙에 따라 전부 지어낸 값입니다.
// 하린 · 28개월 · 새싹발달센터 대기 중 · 기록 12개
import type { PlayLog, SurveyAnswers } from "@/types";
import { EMPTY, replaceAll, uid, type Data } from "@/lib/local-store";
import { scoreSurvey } from "@/lib/survey";

export function seedDemo() {
  const at = (daysAgo: number, hour: number) => {
    const t = new Date();
    t.setDate(t.getDate() - daysAgo);
    t.setHours(hour, 10, 0, 0);
    return t.toISOString();
  };
  const ymd = (offsetDays: number) => at(-offsetDays, 12).slice(0, 10);
  const birth = new Date();
  birth.setMonth(birth.getMonth() - 28);
  birth.setDate(birth.getDate() - 3);

  const childId = uid();
  const log = (
    daysAgo: number,
    hour: number,
    playId: string,
    done: PlayLog["done"],
    reaction: PlayLog["reaction"],
    memo: string | null,
    photo = false,
  ): PlayLog => ({
    id: uid(),
    childId,
    playId,
    done,
    reaction,
    memo,
    photoPath: photo ? "demo/photo.jpg" : null,
    createdAt: at(daysAgo, hour),
  });

  // 3지선다 응답: 자주 그렇다=2, 가끔 그렇다=1, 아직 아니다=0
  const answers: SurveyAnswers = {
    group: "infant",
    dev: { lang: 1, cog: 2, soc: 1, gross: 2, fine: 1 },
    temp: { explore: "sometimes", cautious: "often", initiative: "rarely", recovery: "sometimes" },
  };

  const data: Data = {
    ...EMPTY,
    currentChildId: childId,
    children: [{ id: childId, nickname: "하린", birthDate: birth.toISOString().slice(0, 10), consentAt: at(25, 9), createdAt: at(25, 9) }],
    surveys: [{ id: uid(), childId, answers, result: scoreSurvey(answers), createdAt: at(25, 10) }],
    recommendations: [
      { id: uid(), childId, playId: "lang-sound-1", reason: "언어 영역을 지금 모습에 맞는 1단계부터 시작해요", createdAt: at(0, 7) },
    ],
    playLogs: [
      log(1, 19, "lang-sound-2", "done", "enjoyed", "뚜껑을 두 번 치고 나를 쳐다보며 기다렸어요. 차례를 아는 것 같아요.", true),
      log(2, 18, "fine-clip-1", "partial", "hard", "집게 여는 걸 힘들어해서 두 개만 꽂았어요."),
      log(3, 11, "lang-sound-1", "done", "enjoyed", "'땡!' 소리를 처음으로 따라 했어요."),
      log(5, 20, "soc-peekaboo-2", "done", "neutral", null),
      log(6, 10, "fine-grab-3", "partial", "neutral", "컵은 세 개까지 쌓고 크레파스는 입으로 가져가려 했어요."),
      log(8, 19, "lang-sound-1", "done", "neutral", null),
      log(9, 16, "gross-tummy-3", "done", "enjoyed", "쿠션 언덕을 혼자 넘고 박수를 쳤어요.", true),
      log(11, 18, "cog-peek-3", "notDone", "hard", "졸려 해서 다음에 하기로 했어요."),
      log(13, 11, "lang-babble-3", "partial", "neutral", "인형에게 '맘마'라고 말했어요."),
      log(15, 19, "soc-peekaboo-3", "done", "enjoyed", "까꿍 할 때마다 크게 웃었어요."),
      log(17, 10, "fine-clip-1", "notDone", "hard", null),
      log(20, 18, "lang-babble-2", "done", "neutral", "숟가락을 보고 '숟'까지 말했어요."),
    ],
    center: { name: "새싹발달센터", waitStart: ymd(-60), consultDate: ymd(23) },
    savedPlays: ["gross-tummy-3", "cog-peek-2"],
  };
  replaceAll(data);
}
