
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { TestInfo } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';

// Optional zip support (install `archiver` if you want zip output)
let Archiver: any = null;
try {
    // lazy require so the package is optional
    // npm i -D archiver
    // @ts-ignore
    Archiver = require('archiver');
} catch (e) {
    Archiver = null;
}

export interface EvidenceOptions {
    // Optional named artifacts that tests/framework created (absolute paths)
    extraPaths?: string[];

    // If provided, tabManager should implement listTabs(): string[] and optionally dump state
    tabManager?: any;

    // Optional friendly name to include in evidence folder
    friendlyName?: string;

    // Whether to zip the evidence folder (requires archiver)
    zip?: boolean;

    // Main tab name for tab cleanup / snapshot
    mainTabName?: string;
}

export class EvidenceCollector {
    logger: Logger | undefined;

    constructor(logger?: Logger) {
        this.logger = logger ?? (globalThis as any).__TEST_LOGGER__;
    }

    /**
     * Collect evidence for a single test into testInfo.outputPath('evidence', <testid>)
     */
    async collect(testInfo: TestInfo, opts: EvidenceOptions = {}) {
        const { extraPaths = [], tabManager, friendlyName, zip = true, mainTabName = 'Main Tab' } = opts;

        const outDir = testInfo.outputPath('evidence');
        await fsp.mkdir(outDir, { recursive: true });

        // subfolders
        const logsDir = path.join(outDir, 'logs');
        const metaDir = path.join(outDir, 'meta');
        const attachmentsDir = path.join(outDir, 'attachments');

        await Promise.all(
            [logsDir, metaDir, attachmentsDir].map((d) => fsp.mkdir(d, { recursive: true }))
        );

        // 1) Collect logger output if available
        try {
            const gLogger = this.logger ?? (globalThis as any).__TEST_LOGGER__;
            // try both properties commonly used earlier
            const testOutputDir = gLogger?.testOutputDir || gLogger?.outputDir || null;
            if (testOutputDir && typeof testOutputDir === 'string') {
                await this.copyIfExists(testOutputDir, logsDir);
            } else {
                // Try default location used by config: test-results/logs or test-results/auth-state etc.
                // Copy anything in testInfo.outputPath('logs') if exists
                const localLogs = testInfo.outputPath('logs');
                if (await this.exists(localLogs)) {
                    await this.copyIfExists(localLogs, logsDir);
                }
            }
        } catch (e) {
            // do not fail collection
            this.logger?.warn('[EvidenceCollector] failed to copy logger dir', { error: String(e) });
        }

        // 2) Copy testInfo attachments (Playwright testInfo has attachments array in runtime)
        try {
            // some Playwright versions expose testInfo.attachments
            // others only persist attachments into output dir — handle both
            // @ts-ignore
            const attachments = (testInfo as any).attachments ?? [];
            for (const att of attachments) {
                try {
                    // Playwright attachment object often has path OR body
                    if (att.path) {
                        const fileName = path.basename(att.path);
                        await this.safeCopyFile(att.path, path.join(attachmentsDir, fileName));
                    } else if (att.body) {
                        const fileName = att.name ? `${att.name}.txt` : `attachment-${Date.now()}.txt`;
                        await fsp.writeFile(path.join(attachmentsDir, fileName), att.body);
                    }
                } catch (err) {
                    // ignore
                }
            }
        } catch (e) {
            this.logger?.warn('[EvidenceCollector] failed to gather testInfo attachments', {
                error: String(e),
            });
        }

        // 3) Copy extraPaths passed explicitly (trace, video, screenshots known paths)
        for (const p of extraPaths) {
            try {
                if (!p) continue;
                const stat = await this.safeStat(p);
                if (!stat) continue;

                if (stat.isDirectory()) {
                    // copy directory content
                    const dest = path.join(outDir, path.basename(p));
                    await this.copyIfExists(p, dest);
                } else {
                    const destPath = path.join(attachmentsDir, path.basename(p));
                    await this.safeCopyFile(p, destPath);
                }
            } catch (err) {
                this.logger?.warn('[EvidenceCollector] failed copying extraPath', { path: p, error: String(err) });
            }
        }

        // 4) Capture tab snapshot if tabManager provided
        if (tabManager) {
            try {
                const tabs = typeof tabManager.listTabs === 'function'
                    ? tabManager.listTabs()
                    : null;
                const tabSnapshot = {
                    tabs: tabs ?? [],
                    active: (tabManager as any).activeTabName ?? null,
                    mainTabName,
                };
                await fsp.writeFile(path.join(metaDir, 'tabs.snapshot.json'), JSON.stringify(tabSnapshot, null, 2));
            } catch (e) {
                this.logger?.warn('[EvidenceCollector] failed to capture tab snapshot', { error: String(e) });
            }
        }

        // 5) Test metadata
        try {
            const rawStart = (testInfo as any)._startTime ?? null;
            const meta: any = {
                title: testInfo.title,
                status: testInfo.status,
                duration: testInfo.duration,
                startTime: rawStart ? new Date(rawStart).toISOString() : null,
                project: testInfo.project?.name ?? null,
                file: testInfo.file,
                line: testInfo.line,
                repeatEachIndex: (testInfo as any).repeatEachIndex ?? null,
                friendlyName: friendlyName ?? null,
            };
            await fsp.writeFile(
                path.join(metaDir, 'testinfo.json'),
                JSON.stringify(meta, null, 2)
            );
        } catch (e) {
            this.logger?.warn('[EvidenceCollector] failed to write testinfo meta', {
                error: String(e),
            });
        }


        // 6) If archiver available and zip requested -> generate zip archive
        const zipPath = path.join(outDir, '..', `${testInfo.title.replace(/[^a-z0-9_\-]/gi, '_') || 'evidence'}.zip`);
        if (zip && Archiver) {
            try {
                await this.zipFolder(outDir, zipPath);
                this.logger?.info(`[EvidenceCollector] Evidence zipped to ${zipPath}`);
            } catch (e) {
                this.logger?.warn('[EvidenceCollector] zip creation failed', { error: String(e) });
            }
        } else if (zip && !Archiver) {
            this.logger?.info('[EvidenceCollector] archiver not installed; skipping zip generation');
        }

        this.logger?.info('[EvidenceCollector] Evidence collected', { dir: outDir });
        return outDir;
    }

    // Helper to zip a folder (uses archiver)
    private async zipFolder(folderPath: string, zipPath: string) {
        if (!Archiver) throw new Error('Archiver not available. `npm i -D archiver`');
        return new Promise<void>((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = Archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve());
            archive.on('error', (err: any) => reject(err));

            archive.pipe(output);
            archive.directory(folderPath, false);
            archive.finalize();
        });
    }

    // copy directory contents if exists
    private async copyIfExists(srcDir: string, destDir: string) {
        if (!(await this.exists(srcDir))) return;
        await fsp.mkdir(destDir, { recursive: true });

        const entries = await fsp.readdir(srcDir);
        for (const e of entries) {
            const srcPath = path.join(srcDir, e);
            const destPath = path.join(destDir, e);
            const stat = await this.safeStat(srcPath);
            if (!stat) continue;
            if (stat.isDirectory()) {
                await this.copyIfExists(srcPath, destPath);
            } else {
                await this.safeCopyFile(srcPath, destPath);
            }
        }
    }

    private async safeCopyFile(src: string, dest: string) {
        try {
            await fsp.mkdir(path.dirname(dest), { recursive: true });
            await fsp.copyFile(src, dest);
        } catch (e) {
            // ignore copy errors
            this.logger?.warn('[EvidenceCollector] copyFile failed', { src, dest, error: String(e) });
        }
    }

    private async exists(p: string) {
        try {
            await fsp.access(p, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    private async safeStat(p: string) {
        try {
            return await fsp.stat(p);
        } catch {
            return null;
        }
    }
}
