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

  static async select({ order, offset, limit, ...query } = {}) {
    if (!cache.releases)
      cache.releases = await Release.load()

    let releases = cache.releases.filter(r => r.meets(query))

    if (order === 'asc')
      releases = releases.reverse()
    if (offset || limit != null)
      releases = releases.slice(offset, limit)

    return releases
  }

  static async latest({ channel = 'latest', ...opts } = {}) {
    return (await Release.select({
      channel,
      ...opts,
      order: 'desc',
      offset: 0,
      limit: 1
    }))[0]
  }

  constructor({ version, product = RELEASES.name, build = {} }) {
    this.product = product
    this.version = Object.freeze(parse(version))
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

  getDefaultAssets() {
    return Object.values(this.build).flatMap(build => build.getDefaultAssets())
  }

  getUpdateInfo(platform, arch) {
    switch (platform) {
      case 'darwin':
        return {
          name: this.version.toString(),
          notes: this.url,
          url: this.build[platform].getUpdateAsset(arch)
        }
      case 'win32':
        return this.build[platform].getUpdateAsset(arch)
    }
  }

  meets({ range, channel, platform, arch }) {
    if (range && !satisfies(this.version, range))
      return false
    if (channel && this.channel !== channel)
      return false
    if (platform && !this.build[platform])
      return false
    if (arch && !this.build[platform]?.arch[arch])
      return false

    return true
  }

  toJSON() {
    return {
      version: this.version?.toString(),
      url: this.url,
      assets: this.getDefaultAssets()
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

