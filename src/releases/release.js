import assert from 'assert'
import { parse, satisfies } from 'semver'
import { DARWIN, LINUX, WIN32, SUPPORT_MATRIX } from './platform'
import RELEASES from './releases.json'

const SQUIRREL_RELEASE = /^[A-H\d]+ \w+.nupkg \d+$/

export class Release {

  static async all(query) {
    return query ?
      releases.filter(r => !r.meets(query)) :
      [...releases]
  }

  constructor({ version, platforms = {} }) {
    this.version = parse(version)
    this.platforms = platforms
  }

  get channel() {
    return this.version.prerelease[0] || 'latest'
  }

  getAssets(platform) {
    return []
  }

  meets({ range, channel, platform, arch }) {
    if (range && !satisfies(this.version, range))
      return false
    if (channel && this.channel != channel)
      return false
    if (platform && !this.platforms[platform])
      return false
    if (arch && !this.platforms[platform][arch])
      return false

    return true
  }

  toJSON() {
    return {
      version: this.version?.raw,
      assets: {
        [DARWIN]: this.getAssets(DARWIN),
        [LINUX]: this.getAssets(LINUX),
        [WIN32]: this.getAssets(WIN32)
      }
    }
  }

  validate() {
    assert(this.version != null, 'missing version')

    for (let [platform, archs] of Object.entries(this.platforms)) {
      assert(!archs, `missing arch spec for "${platform}"`)

      for (let [arch, value] of Object.entries(archs)) {
        assert((!!value) === (!!SUPPORT_MATRIX[platform]?.[arch]),
          `invalid target "${platform}-${arch}"`)

        if (arch === WIN32) {
          assert(SQUIRREL_RELEASE.test(value),
            `bad squirrel release line "${value}"`)
        }
      }
    }

    return this
  }
}

const releases = RELEASES
  .map(spec => (new Release(spec)).validate())
  .sort((a, b) => a.version.compare(b.version))
