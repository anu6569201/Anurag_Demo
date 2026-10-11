import path from 'node:path'
import { definePolicy, none, self, ws, wss } from 'csp-toolkit'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import csp from 'vite-plugin-csp-guard'
import { readApiOrigin } from './src/security/api-origin.ts'
import { localSecurityHeaders, readIndexCsp, writeSecurityHeaders } from './security/headers.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiOrigin = readApiOrigin(env.VITE_API_BASE_URL, {
    requireHttps: mode === 'production',
  })
  const connectSrc = [
    self,
    ...(mode === 'development' ? [ws, wss] : []),
    ...(apiOrigin === undefined ? [] : [apiOrigin]),
  ]

  let root = process.cwd()
  let outDir = 'dist'

  const emitHostHeaders: Plugin = {
    name: 'emit-host-security-headers',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
    },
    writeBundle() {
      const destination = path.isAbsolute(outDir) ? outDir : path.join(root, outDir)
      const indexCsp = readIndexCsp(path.join(destination, 'index.html'))
      if (indexCsp === undefined) {
        this.warn('Content-Security-Policy was not found in index.html; host header files were not written.')
        return
      }
      const policy = indexCsp.replace(/;+\s*$/u, '')
      const productionCsp = policy.includes('upgrade-insecure-requests')
        ? policy
        : `${policy}; upgrade-insecure-requests`
      writeSecurityHeaders(destination, productionCsp)
    },
  }

  const apiProxy = {
    '/api': {
      target: 'http://127.0.0.1:5001',
      changeOrigin: true,
    },
  }

  return {
    plugins: [
      react(),
      csp({
        algorithm: 'sha384',
        dev: {
          run: true,
          override: false,
        },
        build: {
          sri: {
            runtimePatchDynamicLinks: true,
            preloadDynamicChunks: true,
            crossorigin: 'anonymous',
          },
          override: true,
        },
        policy: definePolicy({
          defaultSrc: [self],
          baseUri: [self],
          objectSrc: [none],
          scriptSrcElem: [self],
          scriptSrcAttr: [none],
          styleSrcElem: [self],
          styleSrcAttr: [none],
          imgSrc: [self],
          fontSrc: [self],
          connectSrc,
          workerSrc: [self],
          manifestSrc: [self],
          mediaSrc: [none],
          frameSrc: [none],
          frameAncestors: [none],
          formAction: [self],
        }),
      }),
      emitHostHeaders,
    ],
    build: {
      assetsInlineLimit: 0,
      sourcemap: false,
      modulePreload: {
        polyfill: false,
      },
    },
    server: {
      host: '127.0.0.1',
      strictPort: true,
      cors: false,
      allowedHosts: ['localhost', '127.0.0.1'],
      fs: {
        strict: true,
      },
      headers: localSecurityHeaders,
      proxy: apiProxy,
    },
    preview: {
      host: '127.0.0.1',
      strictPort: true,
      cors: false,
      allowedHosts: ['localhost', '127.0.0.1'],
      headers: {
        ...localSecurityHeaders,
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      proxy: apiProxy,
    },
  }
})
