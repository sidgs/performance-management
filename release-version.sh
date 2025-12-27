#!/bin/bash
# Extract release version from Bitbucket tag or branch
# Usage: RELEASE_VERSION=$(./release-version.sh)

RELEASE_VERSION=""

# Check if running for a tag
if [ -n "${BITBUCKET_TAG}" ]; then
  RELEASE_VERSION=$(echo "${BITBUCKET_TAG}" | sed 's|^release/||')
# Check if running for a branch
elif [ -n "${BITBUCKET_BRANCH}" ]; then
  if [[ "${BITBUCKET_BRANCH}" =~ ^release/ ]]; then
    RELEASE_VERSION=$(echo "${BITBUCKET_BRANCH}" | sed 's|^release/||')
  elif [[ "${BITBUCKET_BRANCH}" =~ ^hotfix/ ]]; then
    RELEASE_VERSION=$(echo "${BITBUCKET_BRANCH}" | sed 's|^hotfix/||')
  fi
fi

# Validate that RELEASE_VERSION matches semantic versioning: x.y.z or x.y.z-rcN (N=1-99)
if [ -n "${RELEASE_VERSION}" ]; then
  if ! [[ "${RELEASE_VERSION}" =~ ^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{1,2})(-rc([1-9][0-9]?))?$ ]]; then
    echo "Error: RELEASE_VERSION '${RELEASE_VERSION}' is not a valid semantic version (x.y.z or x.y.z-rcN where N=1-99)."
    exit 1
  fi
fi
# Output the version (empty string if not found)
echo "${RELEASE_VERSION}"
