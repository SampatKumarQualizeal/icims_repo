
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { Logger } from '@src/utils/logger.util';

export interface TrendRecord {
    id: string;                 // unique test run id
    testTitle: string;
    file: string | undefined;
    status: string;
    category: string;
    confidence: number;
    environment: string;
    timestamp: string;
    durationMs?: number;
    explanation?: string;
    suggestedAction?: string;
    rcaRawMessage?: string;
}

export class FailureTrendStore {
    private static logger: Logger = (globalThis as any).__TEST_LOGGER__;
    private static readonly trendFile = path.join(process.cwd(), 'test-results', 'trends', 'trends.json');

    /**
     * Append a trend entry to trends.json
     */
    static async recordTrend(entry: TrendRecord) {
        try {
            await fsp.mkdir(path.dirname(this.trendFile), { recursive: true });

            let existing: TrendRecord[] = [];
            if (fs.existsSync(this.trendFile)) {
                const raw = await fsp.readFile(this.trendFile, 'utf8');
                existing = JSON.parse(raw);
            }

            existing.push(entry);

            await fsp.writeFile(this.trendFile, JSON.stringify(existing, null, 2), 'utf8');

            this.logger?.info("[FailureTrendStore] Recorded trend entry", {
                test: entry.testTitle,
                category: entry.category,
                confidence: entry.confidence
            });

        } catch (err) {
            this.logger?.error("[FailureTrendStore] Failed to record trend", {
                error: String(err),
            });
        }
    }
}
