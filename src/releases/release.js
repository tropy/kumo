import assert from 'assert'
import { parse, satisfies } from 'semver'
import { Build } from './build'
import RELEASES from './releases.json'


export class Release {

  static async all(query) {
    return query ?
      releases.filter(r => !r.meets(query)) :
      [...releases]
  }

  constructor({ version, build = {} }) {
    this.version = parse(version)
    this.build = Build.parse(build)
  }

  get channel() {
    return this.version.prerelease[0] || 'latest'
  }

  getAssets() {
    return Object.values(this.build).flatMap(build => build.getAssets())
  }


  meets({ range, channel, platform, arch }) {
    if (range && !satisfies(this.version, range))
      return false
    if (channel && this.channel != channel)
      return false
    if (platform && !this.build[platform])
      return false
    if (arch && !this.build[platform].arch[arch])
      return false

    return true
  }

  toJSON() {
    return {
      version: this.version?.toString(),
      assets: this.getAssets()
    }
  }

  validate() {
    assert(this.version != null, 'missing version')

    for (let build of Object.values(this.build)) {
      build.validate()
    }

    return this
  }
}

const releases = RELEASES
  .map(spec => (new Release(spec)).validate())
  .sort((a, b) => a.version.compare(b.version))
