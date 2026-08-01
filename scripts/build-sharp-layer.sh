#!/usr/bin/env bash
# Build + publish the sharp Lambda layer (linux-x64) used by the deck-gen
# image-resize functions. sharp is a native module that can't be esbuild-bundled
# for Lambda, so it ships as a layer referenced by amplify/imagegen/resource.ts.
# Re-run when bumping the sharp version, then update SHARP_LAYER_ARN with the
# printed ARN. Requires AWS_PROFILE=personal (us-west-2).
set -euo pipefail

SHARP_VERSION="${SHARP_VERSION:-0.33.5}"
REGION="us-west-2"
BUILD_DIR="$(mktemp -d)"

echo "Building sharp ${SHARP_VERSION} (linux-x64) layer in ${BUILD_DIR}…"
mkdir -p "${BUILD_DIR}/nodejs"
cd "${BUILD_DIR}/nodejs"
npm init -y >/dev/null 2>&1
npm install --cpu=x64 --os=linux --libc=glibc "sharp@${SHARP_VERSION}" >/dev/null 2>&1

cd "${BUILD_DIR}"
zip -rq layer.zip nodejs

aws lambda publish-layer-version \
  --region "${REGION}" \
  --layer-name travel-sharp \
  --description "sharp ${SHARP_VERSION} linux-x64 for travel destination image resize" \
  --compatible-runtimes nodejs20.x nodejs22.x \
  --compatible-architectures x86_64 \
  --zip-file "fileb://${BUILD_DIR}/layer.zip" \
  --query "LayerVersionArn" --output text

rm -rf "${BUILD_DIR}"
echo "Done. Update SHARP_LAYER_ARN in amplify/imagegen/resource.ts with the ARN above."
