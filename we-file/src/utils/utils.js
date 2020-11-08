export const getFileTime = (orignTime) => {
  const arr = /(.*)T(.*)\+(.*)/g.exec(orignTime)
  return `${arr[1]} ${arr[2]}`
}

export const getBigInt = (num) => {
  return BigInt(num).toString()
}
