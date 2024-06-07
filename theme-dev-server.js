import { resolve } from "path"
import { readdir, readFile, lstat } from "fs/promises"
import { loadEnv } from 'vite'
import colors from 'picocolors'
import fetch from "node-fetch"

const reInclude = new RegExp('{%\\s+include\\s+("|\')\\./(\\S+?)\\1\\s+%}', 'g')
const VITE_CLIENT = '<script type="module" src="/@vite/client"></script>'


export const resolveTemplates = async (folder) => {
  const _cached = {}

  const loadTemplates = async (baseDir, prefix = '') => {
    const names = await readdir(baseDir)

    await Promise.all(names.map(async (name) => {
      const filepath = resolve(baseDir, name)
      const stat = await lstat(filepath)
      if (stat.isFile()) {
        const content = await readFile(filepath, { encoding: 'utf-8' })
        _cached[prefix + name] = content
      } else if (stat.isDirectory()) {
        await loadTemplates(filepath, name + '/')
      }
    }))
  }

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

  await loadTemplates(folder)

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

  if (theme.context) {
    const updateContext = (content) => {
      Object.keys(theme.context).forEach(key => {
        const reVar = new RegExp('\\{\\{\\s*' + key + '\\s*\\}\\}', 'g')
        content = content.replace(reVar, theme.context[key])
      })
      return content
    }
    Object.keys(templates).forEach(key => {
      const value = templates[key]
      if (typeof value === 'string') {
        templates[key] = updateContext(value)
      }
    })
  }
  return { ...theme, templates }
}


export const themeDevServer = (root = ".") => {
  const env = loadEnv('development', root, "TYPLOG")
  // TODO: add default theme development api
  const endpoint = env.TYPLOG_THEME_DEVELOP_API || ""

  const request = async (url) => {
    const theme = await parseThemeData(root)
    const data = { url, theme }
    if (theme.context) {
      // for debugging context
      data.override_context = theme.context
    }
    const body = JSON.stringify(data)
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
        let message
        if (data.status === 200) {
          message = colors.green(`"GET ${originalUrl} HTTP/1.1"`) + ` ${data.status} ${data.duration}ms`
        } else {
          message = colors.red(`"GET ${originalUrl} HTTP/1.1"`) + ` ${data.status}`
        }
        config.logger.info(message, { timestamp: true })
        // inject /@vite/client
        return data.html.replace('<head>', `<head>\n${VITE_CLIENT}`)
      } else {
        return html
      }
    },
  }
}
