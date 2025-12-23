#!/bin/bash
grep '"@playwright/test"' package.json | sed -E 's/.*"@playwright\/test": "[^"]*([0-9]+\.[0-9]+\.[0-9]+)".*/\1/'
