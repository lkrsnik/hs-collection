import jsdom from 'jsdom'

export default (html) => new Promise((resolve, reject) => {
  jsdom.env(html, (err, window) => {
    if (err) {
      reject(err)
    } else {
      resolve(window)
    }
  })
})
