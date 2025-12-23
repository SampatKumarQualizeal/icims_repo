import fs from 'fs';
import path from 'path';
import { processPlaceholders } from './placeholder-processor.util';

function readJSON(filePath: string) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function deepMerge(...objects: any[]) {
  const result: any = {};
  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        result[key] = deepMerge(result[key] || {}, obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

/**
 * Load final merged test data:
 *   common defaults
 * + env overrides
 * + scenario-specific data
 */
export function loadTestData(testId: string, env: string = 'qa') {
  const commonDefaults = deepMerge(
    readJSON('tests/data/common/defaults.global.json'),
    readJSON('tests/data/common/defaults.phone.json'),
    readJSON('tests/data/common/defaults.address.json')
  );

  const envOverrides = readJSON(`tests/data/env/${env}/env-overrides.json`);
  
  // Extract module from testId (e.g., "ATS" from "ATS-T123", "CST" from "CST-T263")
  const moduleMatch = testId.match(/^([A-Z]+)-/);
  const module = moduleMatch ? moduleMatch[1].toLowerCase() : 'ats';
  
  const scenario = readJSON(`tests/data/scenarios/${module}/${testId}.json`);

  const merged = deepMerge(commonDefaults, envOverrides, scenario);
  
  // Process placeholders (e.g., {{alnum:6}}, {{uuid}}, {{fieldName}})
  return processPlaceholders(merged);
}
