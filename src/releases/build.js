import assert from 'assert'

export class Build {
  static parse(spec, release) {
    return Object.entries(spec)
      .reduce((build, [platform, arch]) => (
        build[platform] = new Build({ platform, arch, release }), build
      ), {})
  }

  constructor({ release, platform, arch }) {
    this.release = release
    this.platform = platform
    this.arch = arch
  }

  getAssets() {
    return Object.entries(this.arch).flatMap(([arch, value]) =>
      value && getAssets(this.release, this.platform, arch)
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

const SQUIRREL_RELEASE = /^[A-H\d]+ [\w\d.-]+\.nupkg \d+$/

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

function getAssets({ base, name, version }, platform, arch) {
  let assets = []

  switch (platform) {
    case DARWIN:
      if (arch === 'x64') {
        assets.push({
          platform,
          arch,
          url: `${base}/${name}-${version}.dmg`
        })
      } else {
        assets.push({
          platform,
          arch,
          url: `${base}/${name}-${version}-${arch}.dmg`
        })
      }
      break

    case LINUX:
      assets.push({
        platform,
        arch,
        url: `${base}/${name}-${version}-${arch}.bz2`
      })
      break

    case WIN32:
      assets.push({
        platform,
        arch,
        url: `${base}/setup-${name}-${version}-${arch}.exe`
      })
      break
  }

  return assets
}
