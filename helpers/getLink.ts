export const getLink = (url) => {
  return (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? url : url + '.html'
}