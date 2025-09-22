import { parse } from 'semver'
import { Release } from '../releases/release'
import { badRequest, noContent } from '../http'

export async function handleUpdateRequest({ arch, channel, version }, event) {
  if (lteBigSur(event?.headers?.['User-Agent']))
    return noContent()

  version = parse(version)

  if (!version)
    return badRequest('invalid version')

  let release = await Release.latest({
    arch,
    channel,
    platform: 'darwin'
  })

  if (!release || version.compare(release.version) >= 0)
    return noContent()

  return release.getUpdateInfo('darwin', arch) || noContent()
}

const lteBigSur = (UA) =>
  (UA?.match(/Tropy.*Darwin\/(\d+)\.\d/))?.[1] < 21
