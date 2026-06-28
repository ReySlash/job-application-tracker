#!/usr/bin/env bash

set -euo pipefail

IMAGE_NAME="${IMAGE_NAME:-job-application-tracker-backend}"
CONTAINER_NAME="${CONTAINER_NAME:-job-application-tracker-backend}"
ENV_FILE="${ENV_FILE:-/opt/job-application-tracker/backend.env}"
HOST_PORT="${HOST_PORT:-4000}"
CONTAINER_PORT="${CONTAINER_PORT:-4000}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-apps/backend/Dockerfile}"
DEFAULT_TAG="${DEFAULT_TAG:-latest}"

usage() {
  cat <<EOF
Usage:
  scripts/deploy-backend-docker.sh <command> [tag]

Commands:
  build [tag]      Build the backend Docker image
  run [tag]        Start the backend container
  replace [tag]    Recreate the backend container from the image
  logs             Follow backend container logs
  stop             Stop the backend container
  rm               Remove the backend container
  rollback <tag>   Recreate the backend container with a previous image tag

Environment overrides:
  IMAGE_NAME       Default: ${IMAGE_NAME}
  CONTAINER_NAME   Default: ${CONTAINER_NAME}
  ENV_FILE         Default: ${ENV_FILE}
  HOST_PORT        Default: ${HOST_PORT}
  CONTAINER_PORT   Default: ${CONTAINER_PORT}
  DOCKERFILE_PATH  Default: ${DOCKERFILE_PATH}
  DEFAULT_TAG      Default: ${DEFAULT_TAG}
EOF
}

require_env_file() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    echo "Missing env file: ${ENV_FILE}" >&2
    exit 1
  fi
}

build_image() {
  local tag="${1:-$DEFAULT_TAG}"
  docker build -f "${DOCKERFILE_PATH}" -t "${IMAGE_NAME}:${tag}" .
}

run_container() {
  local tag="${1:-$DEFAULT_TAG}"
  require_env_file
  docker run -d \
    --name "${CONTAINER_NAME}" \
    --restart unless-stopped \
    --env-file "${ENV_FILE}" \
    -p "127.0.0.1:${HOST_PORT}:${CONTAINER_PORT}" \
    "${IMAGE_NAME}:${tag}"
}

stop_container_if_exists() {
  if docker ps -a --format '{{.Names}}' | grep -Fxq "${CONTAINER_NAME}"; then
    docker stop "${CONTAINER_NAME}" >/dev/null || true
  fi
}

remove_container_if_exists() {
  if docker ps -a --format '{{.Names}}' | grep -Fxq "${CONTAINER_NAME}"; then
    docker rm "${CONTAINER_NAME}" >/dev/null || true
  fi
}

replace_container() {
  local tag="${1:-$DEFAULT_TAG}"
  stop_container_if_exists
  remove_container_if_exists
  run_container "${tag}"
}

command="${1:-}"
tag="${2:-}"

case "${command}" in
  build)
    build_image "${tag}"
    ;;
  run)
    run_container "${tag}"
    ;;
  replace)
    replace_container "${tag}"
    ;;
  logs)
    docker logs -f "${CONTAINER_NAME}"
    ;;
  stop)
    stop_container_if_exists
    ;;
  rm)
    remove_container_if_exists
    ;;
  rollback)
    if [[ -z "${tag}" ]]; then
      echo "rollback requires an image tag" >&2
      usage
      exit 1
    fi
    replace_container "${tag}"
    ;;
  *)
    usage
    exit 1
    ;;
esac
