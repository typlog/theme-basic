import { loadThemeData, updateTemplatesContext, submitTheme } from "@typlog/theme-dev-plugin"


async function release () {
  const theme = await loadThemeData(process.cwd())
  // use jsdelivr to host static files from GitHub
  const staticURL = `https://cdn.jsdelivr.net/gh/${theme.repo}@${theme.version}/static`
  updateTemplatesContext(theme.templates, {_static_url: staticURL})
  await submitTheme(theme, process.env.THEME_SUBMIT_TOKEN)
}

release()
