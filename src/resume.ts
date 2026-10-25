import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Resume links only show once public/resume.pdf exists
export const hasResume = existsSync(resolve(process.cwd(), 'public/resume.pdf'));
