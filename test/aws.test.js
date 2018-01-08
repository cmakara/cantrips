/* eslint-env mocha */

const aws = require('../src/aws')
const tmp = require('tmp')
const fs = require('fs')
const path = require('path')
const expect = require('chai').expect

describe('createCredentials', () => {
  var tempDir = tmp.dirSync({unsafeCleanup: true})
  const validAccessKeyId = 'validAccessKeyId'
  const validSecretAccessKey = 'validSecretAccessKey'
  before(() => {
    process.env.AWS_ACCESS_KEY_ID = validAccessKeyId
    process.env.AWS_SECRET_ACCESS_KEY = validSecretAccessKey
  })

  after(() => {
    tempDir.removeCallback()
  })

  it('it uses values from the environment', async () => {
    await aws.createCredentials(null, null, tempDir.name)
    var configData = fs.readFileSync(path.join(tempDir.name, 'config'), 'utf8')
    expect(configData).contain(`aws_access_key_id=${validAccessKeyId}`)
    expect(configData).contain(`aws_secret_access_key=${validSecretAccessKey}`)
  })

  it('creates aws user folder if does not exists', async () => {
    const innerPath = path.join(tempDir.name, 'inner')
    await aws.createCredentials(null, null, innerPath)
    var configData = fs.readFileSync(path.join(innerPath, 'config'), 'utf8')
    expect(configData).not.to.equal(null)
  })

  it('writes the header', async () => {
    await aws.createCredentials(null, null, tempDir.name)
    var configData = fs.readFileSync(path.join(tempDir.name, 'config'), 'utf8')
    expect(configData).contain('[profile eb-cli]')
  })

  it('uses provided values over the environment values', async () => {
    await aws.createCredentials('validAccessParameter', 'validSecretAccessParameter', tempDir.name)
    var configData = fs.readFileSync(path.join(tempDir.name, 'config'), 'utf8')
    expect(configData).contain('aws_access_key_id=validAccessParameter')
    expect(configData).contain('aws_secret_access_key=validSecretAccessParameter')
  })
})
