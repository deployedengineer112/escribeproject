import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

await build({
  entryPoints: [path.join(__dirname, './index.ts')],
  outfile: path.join(__dirname, 'dist/server.cjs'),
  platform: 'node',
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'cjs',
  target: ['node20'],
  external: [],
})
