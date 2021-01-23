export const getFileTime = (orignTime) => {
  const arr = /(.*)T(.*)\+(.*)/g.exec(orignTime)
  return `${arr[1]} ${arr[2]}`
}

export const getBigInt = (num) => {
  return BigInt(num).toString()
}

export const getFileIcon = (isDirectory, fileName) => {
  if (isDirectory) {
    return '<use xlink:href="#icon-file"></use>'
  } else {
    const suffix = /.*\.(.*)/.exec(fileName)[1]
    switch (suffix) {
      case 'xlsx':
        return '<use xlink:href="#icon-xlsx"></use>'
      case 'pptx':
      case 'ppt':
        return '<use xlink:href="#icon-ppt"></use>'
      case 'doc':
      case 'docx':
      case 'rtf':
        return '<use xlink:href="#icon-word"></use>'
      case 'mp3':
      case 'wav':
        return '<use xlink:href="#icon-music"></use>'
      case 'html':
        return '<use xlink:href="#icon-html"></use>'
      case 'zip':
      case 'rar':
        return '<use xlink:href="#icon-zip"></use>'
      case 'mp4':
      case 'avi':
        return '<use xlink:href="#icon-video"></use>'
      case 'txt':
        return '<use xlink:href="#icon-txt"></use>'
      case 'ios':
        return '<use xlink:href="#icon-ios"></use>'
      case 'exe':
        return '<use xlink:href="#icon-exe"></use>'
      case 'psd':
        return '<use xlink:href="#icon-psd"></use>'
      case 'png':
      case 'jpg':
      case 'gif':
        return '<use xlink:href="#icon-image"></use>'
      case 'pdf':
        return '<use xlink:href="#icon-pdf"></use>'
      default:
        return '<use xlink:href="#icon-undefined"></use>'
    }
  }
}

export const getFileSize = (fileSize, isDirectory) => {
  if (isDirectory) return '-'
  const suffix = ['Byte', 'KB', 'M', 'G', 'T']
  let num = 0
  while (fileSize >= 1024) {
    fileSize /= 1024
    num++
  }
  return `${Math.round(fileSize * 10) / 10}${suffix[num]}`
}

export const downloadFileByA = (name, blob) => {
  const a = document.createElement('a')
  a.download = name
  a.href = blob
  a.click()
}
