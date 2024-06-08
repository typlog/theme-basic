const columns = document.querySelectorAll('.gallery-column')

/**  @param {HTMLDivElement} el */
function resizeGallery (el) {
  const figures = el.querySelectorAll('figure')
  const images = el.querySelectorAll('img')
  const ratios = new Array(figures.length)

  const styleFigures = () => {
    const maxRatio = Math.max(...ratios)
    figures.forEach((figure, index) => {
      const ratio = ratios[index]
      figure.style = 'flex-basis:' + (ratio * 100 / maxRatio).toFixed(2) + '%'
    })
  }

  images.forEach((img, index) => {
    img.onload = () => {
      ratios[index] = img.naturalWidth / img.naturalHeight
      if (ratios.filter(n => n === undefined).length === 0) {
        styleFigures()
      }
    }
  })
}

columns.forEach(el => {
  resizeGallery(el)
})
