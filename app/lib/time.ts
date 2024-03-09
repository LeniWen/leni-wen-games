export function ts2HMS(timestamp: number) {
  const secondsTotal = Math.floor(timestamp / 1000)
  const hours = Math.floor(secondsTotal / 3600)
  const minutes = Math.floor((secondsTotal % 3600) / 60)
  const seconds = secondsTotal % 60

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  }
}
