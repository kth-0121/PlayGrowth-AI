// 화면 문구 도우미
import type { Area } from "@/types";

/** 받침 있으면 a, 없으면 b ("하린" → "하린이랑", "콩이" → "콩이랑") */
export function josa(word: string, withFinal: string, withoutFinal: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasFinal = code >= 0 && code <= 11171 && code % 28 !== 0;
  return word + (hasFinal ? withFinal : withoutFinal);
}

/** 아이를 부를 때: "하린" → "하린이", "콩이" → "콩이" */
export const callName = (nickname: string) => josa(nickname, "이", "");

/** 영역 → 홈 인사말에 쓰는 놀이 이름 */
export const AREA_PLAY_NAME: Record<Area, string> = {
  lang: "소리 놀이",
  cog: "생각 놀이",
  soc: "주고받기 놀이",
  gross: "몸 놀이",
  fine: "손 놀이",
};
