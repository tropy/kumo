import chai from 'chai'
import sinon from 'sinon'

global.expect = chai.expect
global.sinon = sinon

global.E = (name) =>
  require(`../../events/${name}.json`)
