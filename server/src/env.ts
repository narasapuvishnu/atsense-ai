import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';

// Load environment variables BEFORE any other module is imported.
// Controllers/services read process.env at module-load time (e.g. QdrantService
// and GroqService constructors), so this file must be the very first import in
// server.ts.
//
// The project's canonical .env lives in the repository root. A server-local
// server/.env is supported as well (dev-script CWD defaults). Prefer the
// server-local file if present, otherwise fall back to the root .env.
const serverEnvPath = path.resolve(__dirname, '../.env');   // <root>/server/.env   (dev: off src, build: off dist)
const rootEnvPath   = path.resolve(__dirname, '../../.env'); // <root>/.env

const envPath = existsSync(serverEnvPath) ? serverEnvPath : rootEnvPath;
dotenv.config({ path: envPath });