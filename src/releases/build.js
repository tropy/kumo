import assert from 'assert'

export class Build {
  static parse(spec) {
    return Object.entries(spec)
      .reduce((build, [platform, arch]) => (
        build[platform] = new Build({ platform, arch }), build
      ), {})
  }

  constructor({ platform, arch }) {
    this.platform = platform
    this.arch = arch
  }

  getAssets() {
    return Object.entries(this.arch).flatMap(([arch, value]) =>
      value && getAssets(this.platform, arch)
    )
  }

  toJSON() {
    return {
      platform: this.platform,
      arch: this.arch
    }
  }

  validate() {
    assert(this.platform, 'missing platform')

    for (let [arch, value] of Object.entries(this.arch)) {
      assert((!!value) === (!!SUPPORTED[this.platform]?.[arch]),
        `unsupported platform-arch combination "${this.platform}-${arch}"`)

      if (this.platform === WIN32) {
        assert(SQUIRREL_RELEASE.test(value),
          `bad squirrel release line "${value}"`)
      }
    }

    return this
  }
}

export const DARWIN = 'darwin'
export const LINUX = 'linux'
export const WIN32 = 'win32'

const SQUIRREL_RELEASE = /^[A-H\d]+ \w+.nupkg \d+$/

const SUPPORTED = {
  [DARWIN]: {
    x64: true,
    arm64: true
  },
  [LINUX]: {
    x64: true
  },
  [WIN32]: {
    x64: true,
    ia32: true
  }
}

function getAssets(platform, arch) {
  switch (platform) {
    case DARWIN:
      return ['.dmg']
    case LINUX:
      return ['.bz2']
    case WIN32:
      return ['.exe']
  }
}
