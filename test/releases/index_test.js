import { handler } from '../../src/releases'
import { satisfies } from 'semver'

describe('ReleasesFunction', () => {
  it('returns a list of releases', async () => {
    let res = await handler()

    expect(res).to.have.property('statusCode', 200)
    expect(res).have.property('body').be.a('string')

    let body = JSON.parse(res.body)
    expect(body.length).to.be.above(1)
    expect(body[0]).to.have.a.property('version')
  })

  describe('latest-release event', () => {
    let event

    beforeEach(() => event = E('latest-release'))

    it('returns single release', async () => {
      let res = await handler(event)

      expect(res)
        .to.have.property('body')
        .be.a('string')

      let body = JSON.parse(res.body)
      expect(body).to.be.an('array').and.have.lengthOf(1)

      let [release] = body
      expect(release.version).to.match(/^\d+\.\d+\.\d+(-\w+)?$/)
      expect(release.url).to.be.a('string')
      expect(release.assets).to.be.an('array')
      expect(release.assets[0])
        .to.have.keys(['arch', 'platform', 'url'])

    })

    it('supports channel path param', async () => {
      event.pathParameters.channel = 'beta'
      let res = await handler(event)
      let body = JSON.parse(res.body)

      expect(body[0].version).to.match(/beta/)
    })

    it('supports order query param', async () => {
      let res1 = await handler(event)
      event.queryStringParameters.order = 'asc'
      let res2 = await handler(event)

      let body1 = JSON.parse(res1.body)
      let body2 = JSON.parse(res2.body)

      expect(
        satisfies(body1[0].version, `> ${body2[0].version}`)
      ).to.be.true
    })
  })
})
