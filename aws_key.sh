#!/usr/bin/env bash
set -euo pipefail

# 이 스크립트는 하드코딩된 자격 증명을 제거하고, 로컬 비공개 파일이나
# AWS SSO 세션을 통해 자격 증명을 자동으로 주입한다.
# 기본 경로: 프로젝트 루트의 `.secrets/aws_credentials.env`
#   AWS_ACCESS_KEY_ID=...
#   AWS_SECRET_ACCESS_KEY=...
#   AWS_SESSION_TOKEN=... (선택)
#   AWS_DEFAULT_REGION=ap-northeast-2 (선택)
# 또는 AWS SSO/AssumeRole 이 이미 로그인된 경우 `AWS_USE_SSO=true` 로 설정.

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_SECRET_FILE="${PROJECT_ROOT}/.secrets/aws_credentials.env"
CREDENTIALS_FILE="${AWS_CREDENTIALS_FILE:-$DEFAULT_SECRET_FILE}"
PROFILE_NAME="${AWS_PROFILE:-suwon-redev}"

if [[ "${AWS_USE_SSO:-false}" == "true" ]]; then
  echo "[aws_key] AWS SSO 프로필(${PROFILE_NAME}) 로그인 체크..."
  aws sso login --profile "$PROFILE_NAME"
  exit 0
fi

if [[ ! -f "$CREDENTIALS_FILE" ]]; then
  cat >&2 <<EOF
[aws_key] 자격 증명 파일을 찾을 수 없습니다: $CREDENTIALS_FILE
  - 프로젝트 루트에 .secrets/aws_credentials.env 생성 후 아래 형식으로 작성하세요.
    AWS_ACCESS_KEY_ID=AKIA....
    AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
    # (옵션) AWS_SESSION_TOKEN=...
    # (옵션) AWS_DEFAULT_REGION=ap-northeast-2
  - 파일은 git에 커밋되지 않도록 .gitignore에 추가하세요.
EOF
  exit 1
fi

set -a
source "$CREDENTIALS_FILE"
set +a

export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=${AWS_SESSION_TOKEN:-}
export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-${AWS_REGION:-}}

aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID" --profile "$PROFILE_NAME"
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY" --profile "$PROFILE_NAME"

if [[ -n "${AWS_SESSION_TOKEN:-}" ]]; then
  aws configure set aws_session_token "$AWS_SESSION_TOKEN" --profile "$PROFILE_NAME"
fi

if [[ -n "${AWS_DEFAULT_REGION:-}" ]]; then
  aws configure set region "$AWS_DEFAULT_REGION" --profile "$PROFILE_NAME"
fi

echo "[aws_key] AWS CLI 프로필(${PROFILE_NAME}) 설정이 완료되었습니다."
