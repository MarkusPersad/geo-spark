const tempFiles: Set<string> = new Set<string>()

export const addTempFiles = (file: string) => {
  tempFiles.add(file)
}

export const getTempFiles = () => {
  return tempFiles
}
