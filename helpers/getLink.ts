export const getLink = (url) => {
  if (url == `index`) {
    return (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? `/_MYAPP/` : `./index.html`
  }
  return (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? `/_MYAPP/${url}` : `./${url}.html`
}
