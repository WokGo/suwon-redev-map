# 수원 재개발 협업 플랫폼 아키텍처 제안

## 1. 목표
- 기존 `suwon-redev-map` 지도 뷰를 확장해 시민·관리자가 함께 쓰는 협업형 포털로 발전.
- 회원 가입/로그인/로그아웃, 게시판(공지·토론·자료실), 검색, 관리자 도구 제공.
- UI는 제공된 PNG 레이아웃(세로 내비게이션, 밝은 파스텔 톤) 기준으로 구성.
- 인프라는 AWS(IaC: Terraform, 구성관리: Ansible) 기반으로 자동 구축하며, 자격 증명은 스크립트에 하드코딩하지 않고 보안 저장소에서 자동 주입.

## 2. 도메인 모델
| 엔터티 | 주요 속성 | 설명 |
| --- | --- | --- |
| `User` | `id`, `email`, `password_hash`, `name`, `role`, `last_login_at`, `is_active` | 회원/관리자 구분, 비밀번호는 Argon2 |
| `Session` | `id`, `user_id`, `refresh_token`, `expires_at`, `client_meta` | JWT 액세스 토큰은 짧게, 리프레시 토큰은 DB 저장 |
| `BoardCategory` | `id`, `slug`, `name`, `visibility` | 메뉴에 노출되는 카테고리 |
| `Post` | `id`, `category_id`, `author_id`, `title`, `body`, `status`, `attachments[]`, `tags[]` | 공지·자료·토론 · 지도 이슈 등 |
| `Comment` | `id`, `post_id`, `author_id`, `body`, `status` | 게시물 댓글 |
| `Zone` | `id`, `name`, `geom`, `units`, `status`, `last_updated_at` | 지도 폴리곤 정보, 향후 GeoJSON |
| `AuditLog` | `id`, `actor_id`, `action`, `target`, `payload`, `created_at` | 관리자용 추적 |

검색은 PostgreSQL `tsvector`(게시물/댓글), `PostGIS`(구역) 기반.

## 3. 백엔드
- **프레임워크:** FastAPI + SQLAlchemy + Alembic + Pydantic Schemas.
- **구조:** `app/` 아래 `api`, `services`, `repositories`, `schemas`, `models`, `core`(config/security), `workers`(비동기 작업 Celery).
- **인증:** JWT(access 15분, refresh 14일), HTTP-only 쿠키 + SPA용 bearer 지원. Argon2 패스워드 해시. 관리자 전용 스코프.
- **기능**
  - 사용자: 회원가입, 이메일 검증(SES), 로그인/로그아웃, 비밀번호 재설정, 프로필 수정.
  - 게시판: CRUD, 첨부파일(S3 presigned URL), 태그, 댓글, 좋아요(선택).
  - 지도: `/api/zones`(리스트/검색), `/api/zones/<id>` 상세, GeoJSON 업로드(관리자).
  - 검색: `/api/search?q=` 통합 검색(게시물, 지도, 문서).
  - 관리자: 사용자 관리, 권한 변경, 게시물 고정/비공개, 시스템 로그 열람.
  - 실시간 알림(optional): WebSocket + Redis Pub/Sub.
- **테스트:** pytest + httpx AsyncClient + factory_boy.

## 4. 프론트엔드
- **기술:** React + Vite + TypeScript + React Router + TanStack Query + TailwindCSS.
- **상태/인증:** React Query + zustand(store)로 auth/session 관리, axios instance with interceptors.
- **레이아웃**
  - 좌측 사이드바: 카테고리 메뉴(등록·게시판·지도·관리자), PNG 스타일 반영.
  - 상단 헤더: 검색창, 사용자 메뉴(로그인/로그아웃/프로필).
  - 메인 콘텐츠: 라우트별 페이지(대시보드, 지도, 게시판 목록/상세, 글쓰기, 관리자 콘솔).
- **주요 페이지**
  - `Landing`: 최근 공지, 주요 지도 카드, 빠른 링크.
  - `Map`: Leaflet + GeoJSON, 검색/필터, 구역 상세 drawer.
  - `BoardList`, `BoardDetail`, `BoardEditor`.
  - `Auth`: 로그인, 회원가입, 비밀번호 찾기.
  - `Admin`: 사용자/게시물 관리 테이블, 감사 로그 뷰.
- **테스트:** Vitest + React Testing Library + Cypress(주요 플로우).

## 5. 검색 & 협업
- PostgreSQL `tsvector` + trigram index로 게시판/댓글 검색.
- 지도 구역은 PostGIS `ST_` 함수로 범위 검색, 키워드 기반 필터(동/구).
- 협업 기능(선택): 게시물 멘션, 첨부파일, 지도 이슈에 댓글.

## 6. 인프라 & 배포
- **Terraform**
  - VPC, 공용/사설 서브넷, NAT 게이트웨이.
  - ALB + Target Group(Flask/FastAPI behind Gunicorn/Uvicorn workers).
  - ECS Fargate 혹은 EC2 ASG(초기엔 EC2 하나, 확장 고려).
  - RDS PostgreSQL, Elasticache Redis.
  - S3(정적 파일/첨부), CloudFront(CDN) + ACM 인증서.
  - IAM: 애플리케이션 역할, SSM Parameter Store에 비밀 저장.
- **Ansible**
  - `frontend` 역할: Vite 빌드 -> S3 deploy (또는 Nginx).
  - `backend` 역할: 컨테이너 배포/업데이트, Gunicorn + Systemd 경우.
  - `common` 역할: metrics(CloudWatch agent), log shipping.
- **CI/CD:** GitHub Actions
  - Lint/Test -> Build Docker -> push ECR -> Terraform plan -> manual approve apply.
  - Frontend build -> upload to S3/CloudFront invalidation.

## 7. AWS 자격 증명 자동 주입
- `.env`나 스크립트에 키 저장 금지.
- `aws sso login` 또는 AWS Vault 사용 권장. 필요시 Terraform/Ansible 실행 전:
  - `aws sts assume-role` with `credential_process` (stored in `~/.aws/config`).
  - 또는 `direnv` + `aws-vault exec` 래퍼 스크립트 (`aws_key.sh` 대체).
- `aws_key.sh`는 `aws configure set` 호출 대신, `.env.aws`에서 값을 읽어 `aws configure import --csv`로 CLI 프로필 생성 후 즉시 삭제.
- GitHub Actions에서는 OpenID Connect + IAM role federation 사용.

## 8. 단계별 구현 로드맵
1. **기초 정리**
   - 기존 Flask API → FastAPI 구조 전환, Poetry/uv pipenv 정리.
   - DB 마이그레이션 파이프라인(Alembic) 준비, Zone 데이터 스키마 확정.
   - `aws_key.sh` 제거, `.env.example`, README 보안 가이드 업데이트.
2. **인증 & 사용자 관리**
   - 가입/로그인/토큰 갱신 엔드포인트, 이메일 검증, 관리자 롤 시드.
   - 프론트 인증 플로우 연동, 보호 라우트 가드.
3. **게시판/검색**
   - 카테고리/게시물/댓글 CRUD, S3 presigned 업로드.
   - 통합 검색 API + 프론트 자동완성 UI.
4. **지도 & 협업 기능**
   - GeoJSON 기반 구역 관리, 상세 모달, 즐겨찾기.
   - 협업 기능(멘션, 할 일) 추가.
5. **관리자 콘솔**
   - 사용자/게시물/로그 테이블, 대시보드 차트.
6. **인프라 자동화**
   - Terraform 모듈화, dev/stage/prod 작업공간(workspace).
   - Ansible 역할 분리, CI/CD 파이프라인 연결.
7. **품질관리**
   - 자동 테스트, 코드 스캔, 모니터링/알람 설정.

## 9. 다음 액션 제안
1. FastAPI 기반 백엔드 초기 구조/Poetry 세팅 및 Dockerfile 작성.
2. React + TypeScript 리팩터링, 테마/레이아웃 컴포넌트 작업 시작.
3. Terraform 변수/비밀 관리 개선(`terraform.tfvars` → SSM/Secrets Manager).
4. `aws_key.sh` 제거 후 보안 친화적인 자격 증명 핸들링 스크립트 도입.
