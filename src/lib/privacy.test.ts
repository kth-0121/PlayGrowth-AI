// 실명/기관명 탐지 점검: npx tsx src/lib/privacy.test.ts
import assert from "node:assert/strict";
import { DEMO_COMMENTS, DEMO_POSTS } from "./demo-posts";
import { findIdentifyingTerms } from "./privacy";

const hit = (text: string, expected: string[]) => assert.deepEqual(findIdentifyingTerms(text), expected, text);
const none = (text: string) => assert.deepEqual(findIdentifyingTerms(text), [], text);

// 잡아야 하는 것
hit("새싹병원에서 검사 받았어요", ["새싹병원"]);
hit("햇살발달센터 대기 중이에요", ["햇살발달센터"]);
hit("김지은 선생님이 친절하셨어요", ["김지은 선생님"]);
hit("박쌤이 알려주셨어요", ["박쌤"]);
hit("서울소아과의원 원장님", ["서울소아과의원"]);
hit("이민호 치료사님 최고예요", ["이민호 치료사님"]);

// 일반 표현은 넘어가야 하는 것
none("발달센터 대기 순번 문의는 어떻게 하셨어요?");
none("담임 선생님께 여쭤봤어요");
none("언어치료 선생님이 놀이를 추천해 주셨어요");
none("대학병원은 대기가 길어요");
none("냄비 뚜껑 놀이, 3일째 하고 있어요");
none("어린이집 가기 전에 15분 놀았어요");

// 예시 글·댓글은 전부 오탐 없어야 함
for (const p of DEMO_POSTS) none(p.title + " " + p.body);
for (const c of DEMO_COMMENTS) none(c.body);

console.log("privacy: 모든 점검 통과");
