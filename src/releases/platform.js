
export const DARWIN = 'darwin'
export const LINUX = 'linux'
export const WIN32 = 'win32'

export const SUPPORT_MATRIX = {
  [DARWIN]: {
    x64: true,
    arm64: true
  },

  [LINUX]: {
    x64: true
  },

  [WIN32]: {
    x64: true,
    x32: true
  },
}
