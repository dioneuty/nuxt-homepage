# SuperClaude 사용 가이드라인

SuperClaude는 Claude Code의 고급 프레임워크로, 복잡한 소프트웨어 개발 작업을 효율적으로 처리하기 위한 통합 시스템입니다.

## 📋 목차

1. [시작하기](#시작하기)
2. [주요 명령어](#주요-명령어)
3. [플래그 시스템](#플래그-시스템)
4. [페르소나 시스템](#페르소나-시스템)
5. [MCP 서버 통합](#mcp-서버-통합)
6. [오케스트레이션 시스템](#오케스트레이션-시스템)
7. [운영 모드](#운영-모드)
8. [실전 활용 예시](#실전-활용-예시)

## 🚀 시작하기

### 기본 철학
- **증거 > 가정**: 모든 결론은 검증 가능한 데이터를 기반으로
- **코드 > 문서**: 실제 작동하는 코드에 우선순위
- **효율성 > 장황함**: 간결하고 명확한 소통

### 핵심 구성요소
SuperClaude는 8개의 핵심 모듈로 구성됩니다:
- **COMMANDS.md**: 명령어 실행 프레임워크
- **FLAGS.md**: 플래그 시스템 레퍼런스
- **PRINCIPLES.md**: 개발 원칙과 철학
- **RULES.md**: 실행 가능한 운영 규칙
- **MCP.md**: MCP 서버 통합 시스템
- **PERSONAS.md**: 전문 페르소나 시스템
- **ORCHESTRATOR.md**: 지능형 라우팅 시스템
- **MODES.md**: 운영 모드 레퍼런스

## 🎯 주요 명령어

### 개발 명령어

#### `/build $ARGUMENTS`
프로젝트 빌더로 프레임워크 자동 감지
```bash
/build                    # 전체 프로젝트 빌드
/build frontend          # 프론트엔드만 빌드
/build @src/components   # 특정 경로 빌드
/build --optimize        # 성능 최적화 빌드
```

#### `/implement $ARGUMENTS`
기능 및 코드 구현
```bash
/implement 다크모드 토글 기능
/implement --type component LoginForm
/implement API 엔드포인트 --framework fastapi
```

### 분석 명령어

#### `/analyze $ARGUMENTS`
다차원 코드 및 시스템 분석
```bash
/analyze                 # 전체 프로젝트 분석
/analyze @src/utils     # 특정 폴더 분석
/analyze --focus security  # 보안 중심 분석
/analyze --think-hard   # 심층 분석 (10K 토큰)
```

#### `/troubleshoot [symptoms] [flags]`
문제 조사 및 해결
```bash
/troubleshoot "로그인이 안됨"
/troubleshoot --scope module
```

### 품질 향상 명령어

#### `/improve [target] [flags]`
증거 기반 코드 개선
```bash
/improve                 # 전체 개선
/improve --perf         # 성능 개선
/improve --loop         # 반복적 개선
/improve --quality      # 코드 품질 개선
```

#### `/cleanup [target] [flags]`
기술 부채 정리
```bash
/cleanup               # 전체 정리
/cleanup --focus debt # 기술 부채 중심
```

### 문서화 명령어

#### `/document [target] [flags]`
문서 생성
```bash
/document              # 전체 문서화
/document API         # API 문서
/document --persona-scribe=ko  # 한국어 문서
```

### 메타 명령어

#### `/task [operation] [flags]`
장기 프로젝트 관리
```bash
/task create "사용자 인증 시스템"
/task --wave-mode     # 웨이브 모드 활성화
```

#### `/load [path] [flags]`
프로젝트 컨텍스트 로딩
```bash
/load @project        # 전체 프로젝트 로드
/load --all-mcp      # 모든 MCP 서버 활성화
```

## 🏴 플래그 시스템

### 기획 및 분석 플래그

#### 사고 플래그
- `--think`: 다중 파일 분석 (~4K 토큰)
- `--think-hard`: 심층 아키텍처 분석 (~10K 토큰)
- `--ultrathink`: 크리티컬 시스템 재설계 분석 (~32K 토큰)

#### 계획 플래그
- `--plan`: 작업 실행 전 계획 표시
- `--validate`: 사전 검증 및 위험 평가

### 압축 및 효율성 플래그

#### 토큰 최적화
- `--uc` / `--ultracompressed`: 30-50% 토큰 절약
- `--answer-only`: 작업 생성 없이 직접 응답
- `--verbose`: 최대 상세 설명

#### 안전 모드
- `--safe-mode`: 최대 검증으로 보수적 실행
- `--validate`: 위험 평가 활성화

### MCP 서버 제어 플래그

#### 개별 서버
- `--c7` / `--context7`: 라이브러리 문서 조회
- `--seq` / `--sequential`: 복잡한 다단계 분석
- `--magic`: UI 컴포넌트 생성
- `--play` / `--playwright`: 브라우저 자동화 및 E2E 테스트

#### 통합 제어
- `--all-mcp`: 모든 MCP 서버 동시 활성화
- `--no-mcp`: 모든 MCP 서버 비활성화
- `--no-[server]`: 특정 서버 비활성화

### 위임 및 웨이브 플래그

#### 서브 에이전트 위임
- `--delegate [files|folders|auto]`: 병렬 처리를 위한 위임
- `--concurrency [n]`: 최대 동시 에이전트 수 (기본: 7)

#### 웨이브 오케스트레이션
- `--wave-mode [auto|force|off]`: 웨이브 모드 제어
- `--wave-strategy [progressive|systematic|adaptive|enterprise]`: 웨이브 전략
- `--wave-delegation [files|folders|tasks]`: 웨이브 위임 방식

### 반복 개선 플래그

#### 루프 모드
- `--loop`: 반복 개선 모드 활성화
- `--iterations [n]`: 개선 사이클 수 (기본: 3)
- `--interactive`: 사이클 간 사용자 확인

## 👤 페르소나 시스템

SuperClaude는 11개의 전문 페르소나를 제공하여 도메인별 최적화된 작업을 수행합니다.

### 기술 전문가

#### `--persona-architect`
시스템 아키텍처 전문가
- **우선순위**: 장기 유지보수성 > 확장성 > 성능
- **자동 활성화**: "architecture", "design", "scalability" 키워드
- **최적 명령어**: `/analyze`, `/estimate`, `/improve --arch`, `/design`

#### `--persona-frontend`
UX 전문가, 접근성 옹호자
- **우선순위**: 사용자 요구 > 접근성 > 성능
- **성능 예산**: 로딩 시간 <3초, 번들 크기 <500KB
- **자동 활성화**: "component", "responsive", "accessibility" 키워드

#### `--persona-backend`
신뢰성 엔지니어, API 전문가
- **우선순위**: 신뢰성 > 보안 > 성능
- **신뢰성 예산**: 99.9% 가동시간, <0.1% 오류율
- **자동 활성화**: "API", "database", "service" 키워드

#### `--persona-security`
위협 모델링, 취약점 전문가
- **우선순위**: 보안 > 컴플라이언스 > 신뢰성
- **위협 평가**: 크리티컬/높음/보통/낮음 4단계
- **자동 활성화**: "vulnerability", "threat", "compliance" 키워드

#### `--persona-performance`
최적화 전문가, 병목 제거 전문가
- **우선순위**: 측정 우선 > 크리티컬 패스 최적화 > 사용자 경험
- **성능 예산**: API 응답 <500ms, 메모리 사용량 모바일 <100MB
- **자동 활성화**: "optimize", "performance", "bottleneck" 키워드

### 프로세스 및 품질 전문가

#### `--persona-analyzer`
근본 원인 전문가, 증거 기반 조사자
- **우선순위**: 증거 > 체계적 접근 > 철저함
- **조사 방법론**: 증거 수집 → 패턴 인식 → 가설 검증 → 근본 원인 검증
- **자동 활성화**: "analyze", "investigate", "root cause" 키워드

#### `--persona-qa`
품질 옹호자, 테스트 전문가
- **우선순위**: 예방 > 감지 > 수정
- **품질 위험 평가**: 크리티컬 패스 분석, 실패 임팩트, 결함 확률
- **자동 활성화**: "test", "quality", "validation" 키워드

#### `--persona-refactorer`
코드 품질 전문가, 기술 부채 관리자
- **우선순위**: 단순함 > 유지보수성 > 가독성
- **코드 품질 메트릭**: 복잡성 점수, 유지보수성 지수, 기술 부채 비율
- **자동 활성화**: "refactor", "cleanup", "technical debt" 키워드

#### `--persona-devops`
인프라 전문가, 배포 자동화 전문가
- **우선순위**: 자동화 > 관찰 가능성 > 신뢰성
- **인프라 자동화**: 제로 다운타임 배포, 코드형 인프라, 자동 모니터링
- **자동 활성화**: "deploy", "infrastructure", "automation" 키워드

### 지식 및 커뮤니케이션

#### `--persona-mentor`
지식 전수 전문가, 교육자
- **우선순위**: 이해 > 지식 전수 > 교육
- **학습 경로 최적화**: 기술 평가, 점진적 스캐폴딩, 학습 스타일 적응
- **자동 활성화**: "explain", "learn", "understand" 키워드

#### `--persona-scribe=lang`
전문 작가, 문서화 전문가, 현지화 전문가
- **우선순위**: 명확성 > 독자 요구 > 문화적 민감성
- **언어 지원**: en, es, fr, de, ja, zh, pt, it, ru, ko
- **자동 활성화**: "document", "write", "guide" 키워드

## 🔌 MCP 서버 통합

### Context7 (문서 및 연구)
**목적**: 공식 라이브러리 문서, 코드 예제, 모범 사례
- **워크플로**: 라이브러리 감지 → ID 해석 → 문서 검색 → 패턴 추출 → 구현
- **자동 활성화**: 외부 라이브러리 import, 프레임워크 질문

### Sequential (복잡한 분석 및 사고)
**목적**: 다단계 문제 해결, 아키텍처 분석, 체계적 디버깅
- **워크플로**: 문제 분해 → 서버 조정 → 체계적 분석 → 가설 생성 → 증거 수집
- **자동 활성화**: 복잡한 디버깅, 시스템 설계, `--think` 플래그

### Magic (UI 컴포넌트 및 디자인)
**목적**: 현대적 UI 컴포넌트 생성, 디자인 시스템 통합
- **워크플로**: 요구사항 파싱 → 패턴 검색 → 프레임워크 감지 → 코드 생성
- **자동 활성화**: UI 컴포넌트 요청, 디자인 시스템 쿼리

### Playwright (브라우저 자동화 및 테스트)
**목적**: 크로스 브라우저 E2E 테스트, 성능 모니터링
- **워크플로**: 브라우저 연결 → 환경 설정 → 상호작용 → 데이터 수집 → 검증
- **자동 활성화**: 테스트 워크플로, 성능 모니터링

## 🎵 오케스트레이션 시스템

### 감지 엔진
요청을 분석하여 의도, 복잡성, 요구사항을 이해합니다.

#### 복잡성 감지
- **단순** (5K 토큰): 단일 파일 작업, 기본 CRUD
- **중간** (15K 토큰): 다중 파일 작업, 분석 작업
- **복잡** (30K+ 토큰): 시스템 전반 변경, 아키텍처 결정

#### 도메인 식별
- **프론트엔드**: UI, component, React, Vue, CSS 키워드
- **백엔드**: API, database, server, endpoint 키워드
- **보안**: vulnerability, authentication, encryption 키워드
- **문서화**: document, README, wiki, guide 키워드

### 웨이브 오케스트레이션 엔진
복잡성 ≥0.7, 파일 >20개, 작업 유형 >2개일 때 자동 활성화

#### 웨이브 전략
- **progressive**: 점진적 향상을 위한 반복적 개선
- **systematic**: 복잡한 문제를 위한 체계적 방법론 분석
- **adaptive**: 다양한 복잡성에 기반한 동적 구성
- **enterprise**: >100 파일의 대규모 오케스트레이션

### 품질 게이트
8단계 검증 사이클로 품질 보장
1. **구문**: 언어 파서, Context7 검증
2. **타입**: Sequential 분석, 타입 호환성
3. **린트**: Context7 규칙, 품질 분석
4. **보안**: Sequential 분석, 취약점 평가
5. **테스트**: Playwright E2E, 커버리지 분석
6. **성능**: Sequential 분석, 벤치마킹
7. **문서화**: Context7 패턴, 완성도 검증
8. **통합**: Playwright 테스트, 배포 검증

## 🔄 운영 모드

### 작업 관리 모드
구조화된 워크플로 실행 및 진행 추적

#### 아키텍처 레이어
1. **TodoRead/TodoWrite**: 세션 작업 (3-20개 작업)
2. **/task 명령어**: 프로젝트 관리 (일-주 단위)
3. **/spawn 명령어**: 메타 오케스트레이션
4. **/loop 명령어**: 반복적 개선 워크플로

#### 작업 상태
- **pending** 📋: 실행 준비 완료
- **in_progress** 🔄: 현재 활성 (세션당 하나)
- **blocked** 🚧: 의존성 대기
- **completed** ✅: 성공적 완료

### 내성 모드
사고 과정 및 의사결정에 대한 투명성

#### 분석 마커
- **🧠 추론 분석**: 논리적 흐름, 의사결정 근거
- **🔄 액션 시퀀스 리뷰**: 워크플로 회고
- **🎯 자기 평가**: 메타 인지 평가
- **📊 패턴 인식**: 행동 분석
- **🔍 프레임워크 컴플라이언스**: 규칙 준수 확인
- **💡 회고 통찰**: 결과 분석

### 토큰 효율성 모드
지능형 토큰 최적화 엔진

#### 심볼 시스템
- **논리 및 흐름**: → (leads to), ⇒ (transforms), ∴ (therefore)
- **상태 및 진행**: ✅ (완료), ❌ (실패), 🔄 (진행중)
- **기술 도메인**: ⚡ (성능), 🔍 (분석), 🛡️ (보안)

#### 지능형 압축
- **적응형 압축**: 페르소나 및 컨텍스트 인식
- **증거 기반**: 메트릭으로 검증된 압축 기법
- **품질 보존**: ≥95% 정보 보존, <100ms 처리 시간

## 💡 실전 활용 예시

### 예시 1: 새로운 기능 구현
```bash
# 전체적인 기능 구현
/implement 사용자 인증 시스템 --type feature --validate

# 분석이 필요한 경우
/analyze --focus security --think-hard

# UI 컴포넌트가 필요한 경우
/implement LoginForm --type component --magic

# 테스트 추가
/test e2e --play
```

### 예시 2: 성능 문제 해결
```bash
# 성능 분석 시작
/analyze --focus performance --persona-performance --think

# 병목 지점 발견 후 개선
/improve --perf --loop --iterations 3

# 결과 검증
/test --benchmark --play
```

### 예시 3: 대규모 리팩토링
```bash
# 전체 시스템 분석
/analyze --ultrathink --wave-mode --all-mcp

# 체계적 개선
/improve --wave-strategy systematic --wave-delegation folders

# 품질 검증
/test --validate --persona-qa
```

### 예시 4: 문서화 작업
```bash
# API 문서 생성
/document API --persona-scribe=ko --c7

# 사용자 가이드 작성
/document --type guide --focus user-experience
```

### 예시 5: 보안 감사
```bash
# 보안 분석
/analyze --focus security --persona-security --ultrathink

# 취약점 수정
/improve --security --validate --loop

# 보안 테스트
/test security --play --persona-qa
```

## 🎯 핵심 팁

### 효율적 사용법
1. **자동 활성화 활용**: 키워드를 통해 페르소나와 MCP 서버가 자동으로 활성화됩니다
2. **플래그 조합**: 여러 플래그를 조합하여 원하는 동작을 정확히 지정하세요
3. **웨이브 모드**: 복잡한 작업에는 웨이브 모드를 활용하여 단계별 처리하세요
4. **반복 개선**: `--loop` 플래그로 품질을 점진적으로 향상시키세요

### 성능 최적화
1. **토큰 관리**: `--uc` 플래그로 30-50% 토큰 절약
2. **병렬 처리**: `--delegate` 플래그로 서브 에이전트 활용
3. **캐싱**: MCP 서버 결과 재사용으로 효율성 증대

### 품질 보장
1. **검증 우선**: `--validate` 플래그로 사전 위험 평가
2. **안전 모드**: 중요한 작업에는 `--safe-mode` 활용
3. **증거 기반**: 모든 결정을 측정 가능한 데이터로 뒷받침

SuperClaude는 강력하고 유연한 프레임워크입니다. 이 가이드라인을 참고하여 프로젝트에 맞는 최적의 워크플로를 구성하세요.