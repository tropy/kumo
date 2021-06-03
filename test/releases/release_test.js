import { Release } from '../../src/releases/release'

describe('Release', () => {
  describe('.select', () => {
    it('returns list of releases', async () => {
      for (let r of (await Release.select())) {
        expect(r).to.be.instanceOf(Release)
      }
    })

    it('supports channel filter', async () => {
      for (let channel of ['latest', 'beta']) {
        let releases = await Release.select({ channel })

        expect(releases).not.to.be.empty
        expect(releases.every(r => r.channel === channel)).to.be.true
      }
    })

    it('supports platform/channel filter', async () => {
      for (let platform of ['darwin', 'linux', 'win32']) {
        for (let channel of ['latest', 'beta']) {
          let releases = await Release.select({ platform, channel })

          expect(releases).not.to.be.empty
          expect(
            releases.every(r => r.channel === channel && (platform in r.build))
          ).to.be.true
        }
      }
    })
  })
})
