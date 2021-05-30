import { join } from 'path'
import { readFileSync } from 'fs'
import chai from 'chai'
import sinon from 'sinon'

global.expect = chai.expect
global.sinon = sinon

global.E = (name) =>
  JSON.parse(readFileSync(join(__dirname, `../../events/${name}.json`)))
