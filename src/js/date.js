/** @type {NodeListOf<HTMLTimeElement>} */
const elements = document.querySelectorAll('time.dt-published')
const lang = document.documentElement.lang

/** @param {HTMLTimeElement} element */
function showPrettyDate (element) {
  const datetime = element.getAttribute('datetime')
  const d = new Date(datetime)
  const style = Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  element.textContent = style.format(d)
}

for (let i = 0; i < elements.length; i++) {
  showPrettyDate(elements[i])
}
