# 🌱 팀원 작업 가이드 (개발 처음이어도 OK)

코딩을 몰라도 괜찮아요. **Claude에게 시키고, 화면에서 확인하고, 올리면** 됩니다.
막히면 혼자 오래 붙잡지 말고 **15분 안에 통합 담당에게 물어보세요.**

---

## 0. 처음 한 번만 하는 준비 (30분)

1. **설치할 것**
   - [Node.js](https://nodejs.org) (LTS 버전, 그냥 "다음"만 누르면 됨)
   - [Git](https://git-scm.com)
   - [VS Code](https://code.visualstudio.com)
   - Claude Code: 위 3개를 설치한 뒤 터미널에 `npm install -g @anthropic-ai/claude-code` 붙여넣기 → `claude` 입력 후 로그인
2. **GitHub 초대 수락**: 메일함이나 GitHub 알림에서 "Accept invitation" 누르기
3. **코드 받기**: 바탕화면에서 터미널을 열고 아래를 한 줄씩 붙여넣기
   ```
   git clone https://github.com/kth-0121/PlayGrowth-AI.git
   cd PlayGrowth-AI
   npm install
   npm run dev
   ```
   (`npm run dev` 전에) Claude에게 `README.md의 .env.local 내용대로 .env.local 파일 만들어줘` 라고 말하기
4. 인터넷 창에서 **http://localhost:3000** 을 열고 **"처음이신가요? 가입하기"**로 가입하면 준비 끝 🎉 (가짜 이메일도 돼요)

---

## 1. 매번 작업하는 순서

> 💡 이 순서가 헷갈리면 Claude에게 **"GUIDE.md의 '매번 작업하는 순서'대로 같이 해줘"** 라고 말하세요.

1. **최신 코드 받기**: Claude에게 `main 브랜치 최신 코드 받아줘`
2. **내 작업 공간 만들기**: Claude에게 `feat/설문화면 이라는 브랜치 만들어줘`
   (브랜치 = 내 작업이 다른 사람 작업을 덮어쓰지 않게 해주는 칸막이)
3. **만들기**: 아래 [역할별 할 일](#2-역할별-할-일)의 프롬프트를 Claude에게 복사해 붙여넣기
4. **확인하기**: http://localhost:3000 에서 직접 눌러보기. 이상하면 Claude에게 **보이는 그대로** 말하기
   - 좋은 예: "설문 화면에서 '자주 그렇다'를 눌러도 색이 안 바뀌어"
   - 나쁜 예: "안 돼"
5. **올리기**: Claude에게 `지금까지 한 거 커밋하고 PR 올려줘`
6. **알리기**: 팀 단톡방에 PR 링크를 공유 → 통합 담당이 확인 후 합침

**한 번에 하나씩**: 화면 하나를 만들면 바로 올리세요. 크게 모아서 올리면 합치기 어려워요.

---


---

## 2. 화면은 다 만들어져 있어요 → 이제는 "고치기"

모든 화면이 실제 DB(Supabase)와 연결되어 있어요. 새로 만들기보다 **고치고 다듬는** 일이 대부분이에요.

| 담당 | 맡은 화면 |
|---|---|
| kjw0916kjw-bit · 기획 | `data/questions.json`(설문), `data/plays.json`(놀이), 화면 문구, `docs/` |
| pioneerwy · 놀이 흐름 | `src/app/onboarding`, `survey`, `play` |
| liveinmonaco1626-web · 기록·리포트·커뮤니티 | `src/app/logs`, `report`, `community` |
| kth-0121 · 데이터·통합 | `src/lib`, `supabase`, `ai`, 배포 |

**Claude에게 붙여넣을 프롬프트 (화면 고치기)**
```
이 프로젝트는 놀이다리라는 Next.js 앱이야. README.md를 먼저 읽어줘.
src/app/(화면 폴더)/ 화면에서 (고치고 싶은 점을 보이는 그대로 적기)를 고쳐줘.
- 공통 컴포넌트(src/components)와 디자인 색(globals.css)을 그대로 써줘
- 저장·불러오기는 src/lib/local-store.ts의 함수만 써줘 (Supabase를 화면에서 직접 부르지 마)
- src/types.ts, data/, supabase/ 는 수정하지 마
- 다 고치면 npm run lint 와 npm run build 를 돌려서 통과하는지 확인해줘
```

**Claude에게 붙여넣을 프롬프트 (놀이 추가, 기획)**
```
data/plays.json에 기존 놀이와 똑같은 형식으로 놀이를 추가해줘.
- 영역: (lang/cog/soc/gross/fine) / 월령: (예: 24~47개월) / 시간: (10~20분)
- 제목, 준비물(집에 있는 물건), 진행 순서 3단계, 아이가 어려워할 때 팁 2개
같은 놀이의 쉬운 단계(step 1)와 발전 단계(step 3)도 series를 같게 해서 만들어줘.
reviewedBy는 null로 두고, 다른 파일은 건드리지 마.
```

## 3. 꼭 지킬 것 ⚠️

- **실제 아이 정보 금지**: 이름, 사진, 생년월일은 전부 가짜로
- **계약 파일 4개는 손대지 않기**: `src/types.ts`, `data/questions.json`·`data/plays.json`(기획 담당만 수정), `supabase/schema.sql`. 바꿔야 하면 통합 담당에게 먼저 말하기
- **AI 기여자 표기 금지**: Claude가 커밋 메시지에 `Co-Authored-By: Claude`를 넣으려 하면 "기여자 표기 빼줘"라고 말하기
- **비밀번호·키는 올리지 않기**: `.env.local` 파일은 절대 올리지 않음

## 4. 자주 막히는 곳

| 상황 | Claude에게 이렇게 말하기 |
|---|---|
| 빨간 에러가 떴어요 | `이 에러 고쳐줘` + 에러 내용 통째로 붙여넣기 |
| 화면이 안 바뀌어요 | `npm run dev 다시 켜줘` |
| 다른 사람 작업과 충돌났대요 | 혼자 해결하지 말고 **통합 담당 호출** |
| 뭘 해야 할지 모르겠어요 | `GUIDE.md 읽고 내 역할(○○)에서 다음에 할 일 알려줘` |
