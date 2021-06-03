import { eq, parse } from 'semver'
import { Release } from '../releases/release'
import { badRequest, noContent, notFound, redirect, send } from '../http'

export async function handleUpdateRequest({ arch, channel, file }) {
  let releases = await Release.select({
    arch,
    channel,
    platform: 'win32',
    order: 'asc'
  })

  if (file === 'RELEASES') {
    if (releases.length)
      return send(RELEASES(releases, arch))
    else
      return noContent()
  }

  let version = nuPkgVersion(file, channel, arch)

  if (version == null)
    return badRequest('invalid version')

  let release = releases.find(r => eq(r.version, version))

  // TODO redirect full/delta accordingly if we want to support delta updates!
  if (release != null)
    return redirect(release.getUpdateInfo('win32', arch))
  else
    return notFound()
}

export const nuPkgVersion = (file, channel, arch) => parse(
  file
    .replace(/^\D+/, '')
    .replace(/-(delta|full)\.nupkg$/, '')
    .replace(channel, `${channel}.`)
    .replace(`-${arch}`, '')
)

const RELEASES = (releases, arch) =>
  releases
    .map(r => r.build.win32.arch[arch])
    .concat('')
    .join('\r\n')

