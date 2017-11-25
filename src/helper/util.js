import Vue from 'vue'

/**
 *
 * @param {String} title
 * @param {String} message
 * @param {String} type success, info, error
 */
export function showAlert (title, message = null, type = 'info') {
  let content
  if (!message) {
    content = title
  } else {
    content = '<strong>' + title + '</strong><span class="pl-2">' + message + '</span>'
  }
  console.log(content)
  switch (type) {
    case 'success':
      Vue.toasted.success(content)
      break
    case 'error':
      Vue.toasted.error(content)
      break
    default:
      Vue.toasted.info(content)
      break
  }
}
