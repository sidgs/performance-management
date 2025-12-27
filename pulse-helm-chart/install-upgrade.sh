#!/bin/bash

HELM_RELEASE_NAME=${HELM_RELEASE_NAME:-pulse-performance-management}
HELM_NAMESPACE=${HELM_NAMESPACE:-sidgs-apps}
VALUES_FILE=${VALUES_FILE:-values-release.yaml}
RELEASE_VERSION=${RELEASE_VERSION:-latest}

helm upgrade --install ${HELM_RELEASE_NAME} . \
  --namespace ${HELM_NAMESPACE} \
  --create-namespace \
  --set javaApi.image.tag=${RELEASE_VERSION} \
  --set agentAi.image.tag=${RELEASE_VERSION} \
  --values ${VALUES_FILE} 