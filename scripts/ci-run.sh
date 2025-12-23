#!/usr/bin/env bash

# DO NOT use set -e / -u / -o pipefail because it breaks exit code propagation
# We manually capture the exit code instead.

npx playwright test "$@"
RC=$?

echo "Playwright finished with RC=${RC}"

exit ${RC}
