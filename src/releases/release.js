import assert from 'assert'
import { parse, satisfies } from 'semver'
import { Build } from './build'
import RELEASES from './RELEASES.json'

const cache = {}

export class Release {

  static async load() {
    return RELEASES
      .map(spec => (new Release(spec)).validate())
      .sort((a, b) => a.version.compare(b.version))
  }

  static async all(query) {
    if (!cache.releases)
      cache.releases = await Release.load()

    return query ?
      cache.releases.filter(r => r.meets(query)) :
      [...cache.releases]
  }

  constructor({ version, product = 'Tropy', build = {} }) {
    this.product = product
    this.version = parse(version)
    this.build = Build.parse(build, this)
  }

  get channel() {
    return this.version.prerelease[0] || 'latest'
  }

  get name() {
    return (this.version.prerelease.length > 0) ?
      `${this.product.toLowerCase()}-${this.channel}` :
      this.product.toLowerCase()
  }

  get productName() {
    return (this.version.prerelease.length > 0) ?
      `${this.product} ${capitalize(this.channel)}` :
      this.product
  }

  getAssets() {
    return Object.values(this.build).flatMap(build => build.getAssets())
  }


  meets({ range, channel, platform, arch }) {
    if (range && !satisfies(this.version, range))
      return false
    if (channel && this.channel !== channel)
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

const capitalize = (s) =>
  `${s[0].toUpperCase()}${s.slice(1)}`

