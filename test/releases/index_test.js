import { handler } from '../../src/releases'
import { satisfies } from 'semver'

describe('ReleasesFunction', () => {
  it('returns a list of releases', async () => {
    let res = await handler()

    expect(res).to.be.an('array')
    expect(res.length).to.be.above(1)
    expect(res[0]).to.have.a.property('version')
  })

  describe('latest-release event', () => {
    let event

    beforeEach(() => event = E('latest-release'))

    it('returns single release', async () => {
      let res = await handler(event)

      expect(res).to.be.an('array').and.have.lengthOf(1)

      let [release] = res
      expect(release.version).to.match(/^\d+\.\d+\.\d+(-\w+)?$/)
      expect(release.url).to.be.a('string')
      expect(release.assets).to.be.an('array')
      expect(release.assets[0])
        .to.have.keys(['arch', 'platform', 'url'])

    })

    it('supports channel path param', async () => {
      event.pathParameters.channel = 'beta'
      let res = await handler(event)

      expect(res[0].version).to.match(/beta/)
    })

    it('supports order query param', async () => {
      let res1 = await handler(event)
      event.queryStringParameters.order = 'asc'
      let res2 = await handler(event)

      expect(
        satisfies(res1[0].version, `> ${res2[0].version}`)
      ).to.be.true
    })
  })
})
