import assert from 'assert'
import { parse, satisfies } from 'semver'
import { Build } from './build'
import RELEASES from './RELEASES.json'
import { capitalize } from '../util'

const cache = {}

export class Release {

  static async load() {
    return RELEASES.releases
      .map(spec => (new Release(spec)).validate())
      .sort((a, b) => -1 * a.version.compare(b.version))
  }

  static async select({ order, offset, limit, ...query }) {
    if (!cache.releases)
      cache.releases = await Release.load()

    let releases = cache.releases.filter(r => r.meets(query))

    if (order === 'asc')
      releases = releases.reverse()
    if (offset || limit != null)
      releases = releases.slice(offset, limit)

    return releases
  }

  constructor({ version, product = RELEASES.name, build = {} }) {
    this.product = product
    this.version = parse(version)
    this.build = Build.parse(build, this)
  }

  get base() {
    return `${RELEASES.repository}/releases/download/${this.version}`
  }

  get url() {
    return `${RELEASES.repository}/releases/tag/${this.version}`
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
      url: this.url,
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


