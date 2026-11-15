// Builds the whole site into dist/:
//   dist/        the marketing landing page (static export of /landing)
//   dist/app/    the ReqStudio app (Vite SPA, served from the /app/ sub-path)
// Both live on one origin, so projects already stored in the browser's
// IndexedDB keep working when the app moves from "/" to "/app/".
import { execSync } from 'node:child_process'
import { cpSync, rmSync } from 'node:fs'

const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } })

rmSync('dist', { recursive: true, force: true })

run('npx tsc -b')

// Landing first: `next build` exports to landing/out (see next.config.ts).
run('npm --prefix landing run build')
cpSync('landing/out', 'dist', { recursive: true })

// App second, into dist/app, so it never clobbers the landing files.
run('npx vite build --outDir dist/app --emptyOutDir', { VITE_BASE: '/app/' })
