import { resolve } from "path"
import { readdir, readFile } from "fs/promises"
import { loadEnv } from 'vite'
import fetch from "node-fetch"

const reInclude = new RegExp('{%\\s+include\\s+("|\')\\./(\\S+?)\\1\\s+%}', 'g')
const VITE_CLIENT = '<script type="module" src="/@vite/client"></script>'


export const resolveTemplates = async (folder) => {
  const names = await readdir(folder)

  const _cached = {}
  await Promise.all(names.map(async (name) => {
    const filename = resolve(folder, name)
    const content = await readFile(filename, { encoding: 'utf-8' })
    _cached[name] = content
  }))

  const resolveIncludes = (content) => {
    const found = content.match(reInclude)
    if (found) {
      found.forEach(str => {
        const name = str.replace(/^{%\s+include\s+("|')\.\//, '').replace(/("|')\s+%}$/, '')
        content = content.replace(str, _cached[name])
      })
    }
    return content.trim()
  }

  const templates = {}
  Object.keys(_cached).forEach(name => {
    if (/\.j2$/.test(name) && !/^[_.]/.test(name)) {
      templates[name] = resolveIncludes(_cached[name])
    }
  })
  return templates
}


export const parseThemeData = async (root = ".") => {
  const themeData = await readFile(resolve(root, "theme.json"), { encoding: "utf-8" })
  const theme = JSON.parse(themeData)
  const templates = await resolveTemplates(resolve(root, "templates"))
  return { ...theme, templates }
}


export const themeDevServer = (root = ".") => {
  const env = loadEnv('development', root, "TYPLOG")
  // TODO: add default theme development api
  const endpoint = env.TYPLOG_THEME_DEVELOP_API || ""

  const request = async (url) => {
    const theme = await parseThemeData(root)
    const body = JSON.stringify({ url, theme })
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
    return resp.json()
  }

  let config
  return {
    name: 'typlog-theme-dev-server',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async transformIndexHtml(html, { originalUrl }) {
      if (config.command === "serve") {
        const data = await request(originalUrl)
        console.info(`"GET ${originalUrl} HTTP/1.1" ${data.status} ${data.duration || ''}`)
        // inject /@vite/client
        return data.html.replace('<head>', `<head>\n${VITE_CLIENT}`)
      } else {
        return html
      }
    },
  }
}
