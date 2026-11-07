# 놀이다리 디자인 결정 기록

> 대상: 프론트엔드 UI (클린 화이트 & 세이지). 2026-11-07 작성, 화면 담당 @pioneerwy
> 레퍼런스는 **패턴만** 참고합니다. 로고·브랜드 컬러·일러스트·고유 문구는 가져오지 않고, 색과 타이포는 `src/app/globals.css`의 토큰만 씁니다.

## 1. 참고한 레퍼런스와 가져온 패턴

| 레퍼런스 | 가져온 패턴 | 놀이다리 적용 |
|---|---|---|
| [App in Toss 소비자 UX 가이드](https://developers-apps-in-toss.toss.im/landing-page/landing-page-en/design/consumer-ux-guide) | 사용자는 할 일을 끝내러 온다. 진입 직후 홍보·동의 바텀시트, 뒤로가기를 막는 시트는 다크 패턴 | 진입 직후 팝업 금지. 바텀시트는 사용자가 누른 동작의 확인(삭제, 공유)에만 사용 |
| [SAP Fiori — Empty States](https://www.sap.com/design-system/fiori-design-web/v1-136/foundations/best-practices/global-patterns/designing-for-empty-states), [Setproduct — Empty state](https://setproduct.com/blog/empty-state-ui-design) | 빈 상태는 "무엇·왜·다음 행동"을 말한다. 첫 사용과 결과 없음은 다르게 보여 준다. 좁은 곳에는 그림 대신 글만 | `EmptyState`를 첫 사용형(일러스트 + 버튼)과 결과 없음형(한 줄 글)으로 나눔 |
| [CDC Milestone Tracker](https://www.cdc.gov/milestonetracker), [Harvard Health 소개](https://www.health.harvard.edu/blog/app-helps-track-developmental-milestones-2017111412718) | 체크리스트 + 놀이 팁 + "언제 전문가와 이야기할지(Act Early)"를 분리해서 차분하게 안내. 의료진에게 보여 줄 요약 공유. 개인 식별 정보 비수집 | 결과 화면의 상담 권유는 경고가 아니라 별도 안내 박스(sage-xlight). 상담 리포트는 "보여 주기용 요약"으로 설계 |
| [MilkBaby Calendar](https://apps.apple.com/app/id6761759626), [TimeHut](https://apps.apple.com/app/id565951606), [BabyTime](https://apps.apple.com/app/id1052459780) | 하나의 시간순 타임라인에 메모·사진을 섞음. 주간/일 단위 보기를 화면 전환 없이. 한 손으로 빠른 기록. 월령 기준 정리 | 기록 다이어리: 주간 캘린더 + 타임라인. 기록 입력은 탭 3번 + 저장으로 끝 |
| [Baby diary formats](https://jejememe.com/en/articles/baby-diary-format-templates) | "날짜 + 사진 + 한 줄"로 시작하면 꾸준히 쓴다 | 메모는 선택, 한 줄 placeholder로 부담 낮춤 |
| [Recipe cooking mode UX](https://screensdesign.com/articles/recipe-cooking-mode-step-navigation-ux/), [vp0 — step-by-step UI](https://vp0.com/blogs/recipe-cooking-app-step-by-step-ui-ios), [SideChef UX](https://business.sidechef.com/recipe-platform/ux-best-practices-for-recipe-sites) | 한 화면 한 단계 큰 글씨, 단계 안 타이머, 유지되는 재료 체크리스트, 다시 돌아왔을 때 진행 위치 복원, 화면 꺼짐 방지 | **놀이 진행 모드** 신설: 단계 넘기기, 선택형 타이머, 팁 바로 보기, 준비물 체크, 진행 위치 저장 |
| [SurveyMonkey — One question at a time](https://help.surveymonkey.com/en/create/one-question-at-a-time/), [QuestionPro — 이탈](https://www.questionpro.com/blog/survey-abandonment/), [Iowa Qualtrics 가이드](https://dxtraining.iowa.gov/qualtrics/understanding-qualtrics-cx/guide-creating-great-surveys/survey-design-best-practices) | 한 질문씩이면 모바일에서 집중·스크롤 감소. 중간 저장으로 이탈 방지. 짧은 설문에서 "3/25" 같은 숫자는 부담이 될 수 있음 | 9문항이라 진행 바 + 작은 "언어 · 3/9" 캡션. 답할 때마다 자동 저장, 다시 들어오면 이어서 |
| Material 3 / Apple HIG (2차 자료: [MDC iOS BottomNavigation](https://chromium.googlesource.com/external/github.com/material-components/material-components-ios/+show/stable/components/BottomNavigation/README.md), [OVO 바텀시트 접근성](https://design.ovo.com/latest/components/bottom-sheet/accessibility-zW0zBTuq)) | 하단 탭 3~5개 + 항상 라벨 표시, 터치 영역 44~48px, 바텀시트는 열릴 때 포커스 이동·닫기 버튼 명시 | 탭 5개 라벨 항상 표시, 최소 44px, 바텀시트 포커스 관리 + 닫기 버튼 |

> 공식 M3 문서(m3.material.io)는 검색 결과에 직접 나오지 않아 2차 자료로 확인했습니다.

## 2. 시안에 없어서 추가하기로 한 것 (사용자 관점 이유)

| 추가 | 이유 |
|---|---|
| **랜딩(비로그인 첫 화면)** | 처음 온 부모가 "이게 뭐고, 나한테 뭘 해 주는지"를 10초 안에 알아야 함. 의료 서비스가 아니라는 안내를 겁주지 않게 첫 화면 하단에 |
| **온보딩에 센터·상담일 단계 (선택, 나중에 하기)** | 홈의 D-day 카드가 핵심 동기. 다만 대기 신청 전인 부모도 있어 건너뛸 수 있어야 함 |
| **설문 중간 저장** | 아이를 보면서 답하다 끊기기 쉬움. 다시 열면 이어서 |
| **놀이 진행 모드 (`/play/[id]/go`)** | 부모는 아이를 붙잡고 화면을 봄. 한 번에 한 단계만 크게, 손이 바쁠 때 팁 바로 보기. 타이머는 선택 (시간 압박 금지) |
| **준비물 체크리스트** | "시작했는데 숟가락이 없네"를 줄임. 체크 상태는 놀이별로 유지 |
| **놀이 저장(북마크)** | "이번 주말에 해 볼 놀이"를 모아 두는 행동이 자연스러움 |
| **놀이 탐색 필터** | 영역 칩 + 시간(10분 이하) + 준비물 적은 것 + 추천/저장/해 본 놀이 탭. 퇴근 후 짧은 시간에 고르기 쉽게 |
| **기록 저장 후 피드백 토스트** | "다음 놀이에 반영할게요" — 기록이 쓸모 있다는 걸 바로 보여 줌 (기록 지속 동기) |
| **기록 상세·수정·삭제** | 잘못 누른 반응을 고칠 수 있어야 신뢰가 생김. 삭제는 확인 바텀시트 |
| **리포트 기간 선택 + 미리보기 + PDF 저장·링크 공유** | 상담 직전에 "최근 2주"처럼 골라서 보여 주는 장면이 실제 사용 시나리오 |
| **커뮤니티 글 상세·댓글·신고, "검증되지 않은 정보" 라벨** | 효과를 단정하는 글로부터 부모를 보호. 신고는 바텀시트로 사유 선택 |
| **MY: 아이 여러 명 전환, 알림, 데이터 관리(사진·기록 삭제, 동의 철회), 문의** | 아이 정보를 다루므로 지우고 철회하는 길이 눈에 보여야 함 |
| **공통 상태: Skeleton, 오류, 오프라인 배너, Toast, 확인 BottomSheet** | 모든 데이터 화면에 로딩·빈·오류 상태가 있어야 실제 서비스처럼 동작 |
| **부드러운 격려 (이번 주 N일 함께했어요)** | 쌓인 것만 보여 주고, 끊긴 것은 말하지 않음 |
| **선택형 놀이 알림 (MY에서 켜기)** | 바쁜 부모가 잊지 않게. 기본은 꺼짐, 시간은 부모가 정함 |

## 3. 고민했지만 뺀 것

| 뺀 것 | 이유 |
|---|---|
| 연속 기록(streak) 끊김 경고, 랭킹, 다른 아이와 비교 | 불안한 부모에게 압박·죄책감을 줌. "이번 주 N일"처럼 쌓인 것만 표시 |
| 점수 게이지, 백분위, 빨간 경고색 | 진단처럼 보임. 결과는 문장 + 부드러운 막대만 |
| 진입 직후 알림 권한·마케팅 동의 팝업 | Toss 가이드의 다크 패턴. 알림은 MY에서 부모가 원할 때 |
| 필수 타이머, 카운트다운 압박 | 놀이는 훈련이 아님. 타이머는 선택이고 끝나도 소리·경고 없음 |
| 사진으로 발달 판단, 얼굴 자동 인식 | 서비스 원칙 위반. 흐림 처리 "권장" 안내만 |
| 음성 제어·스마트워치 | 해커톤 범위 밖. 진행 모드의 큰 버튼으로 대체 |
| 다크 모드 | 이번 범위 제외 (토큰 구조는 나중에 추가 가능) |

## 4. 데이터 계약과의 관계

- **설문 3지선다 (보호자 결정, 2026-11-07):** 화면은 모든 문항을 "자주 그렇다 / 가끔 그렇다 / 아직 아니다" 3개로 묻습니다. 계약 파일은 바꾸지 않았습니다.
  - 발달 5문항: `questions.json`의 중간 단계(`levels[1]`, ②) 행동 문장을 질문으로 쓰고, 답을 단계 값으로 저장합니다 (자주=2, 가끔=1, 아직=0). `SurveyAnswers`·`scoreSurvey`·추천 규칙은 그대로 동작합니다.
  - 놀이 스타일 4문항: 자주 그렇다 / 가끔 그렇다 / 거의 아니다 → often / sometimes / rarely
  - 영향: 3단계(③) 응답이 없어져 `startStep`이 최대 2단계부터 시작합니다. 3단계 놀이는 "즐거워함 + 완료" 기록 후 추천 규칙으로 올라갑니다. 모든 영역 답이 같으면 결과 화면은 "골고루 추천"으로 안내합니다. **기획·통합 담당 확인 필요.**
- 진행 표시는 "언어 · 3/9" (9문항). 답할 때마다 `surveyDraft`에 자동 저장하고 홈에서 "이어서 답하기"로 돌아옵니다.
- 추천 규칙(`src/lib/recommend.ts`)과 리포트 문장(`src/lib/report.ts`, `/api/report`)은 통합 담당 코드를 그대로 씁니다.
- 센터·상담일, 저장한 놀이, 알림 설정, 준비물 체크는 `schema.sql`에 아직 없어 로컬 저장소(mock)로 만들고 통합 담당과 컬럼을 논의합니다.
