export const getUnixTimestamp = () => {
  return Math.floor((new Date().getTime()) / 1000)
}