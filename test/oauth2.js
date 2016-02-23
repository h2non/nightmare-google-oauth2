var Nightmare = require('nightmare')
var NightmareGoogle = require('../')
var expect = require('chai').expect

suite('google auth2', function () {
  var nightmare = null

  beforeEach(function () {
    nightmare = new Nightmare
  })

  test('#getCode', function (done) {
    if (process.env.CI) return done()

    var params = {
      scope: 'https://www.googleapis.com/auth/youtube',
      clientId: process.env.NIGHTMARE_OAUTH2_CLIENT_ID,
      email: process.env.NIGHTMARE_OAUTH2_EMAIL,
      password: process.env.NIGHTMARE_OAUTH2_PASSWORD,
      verificationEmail: process.env.NIGHTMARE_OAUTH2_VERIFY_EMAIL
    }

    NightmareGoogle.getCode(params, function (err, code) {
      expect(err).to.be.null
      expect(code).to.not.empty
      expect(code).to.be.a('string')
      done()
    })(nightmare)

    nightmare.run()
  })

  test('#getToken', function (done) {
    if (process.env.CI) return done()

    var params = {
      scope: 'https://www.googleapis.com/auth/youtube',
      clientId: process.env.NIGHTMARE_OAUTH2_CLIENT_ID,
      clientSecret: process.env.NIGHTMARE_OAUTH2_CLIENT_SECRET,
      email: process.env.NIGHTMARE_OAUTH2_EMAIL,
      password: process.env.NIGHTMARE_OAUTH2_PASSWORD
    }

    NightmareGoogle.getToken(params, function (err, tokens) {
      expect(err).to.be.null
      expect(tokens).to.not.empty
      expect(tokens).to.be.an('object')
      expect(tokens).to.have.property('access_token')
      expect(tokens).to.have.property('refresh_token')
      done()
    })(nightmare)

    nightmare.run()
  })

  test('missing params', function () {
    expect(function () {
      NightmareGoogle.getCode({})
    })
    .to.throw(TypeError, /missing required param/i)
  })

  test('missing scope', function () {
    expect(function () {
      NightmareGoogle.getCode({ email: 'test@gmail.com', password: 'svp3r_s3cret' })
    })
    .to.throw(TypeError, /missing required param\: scope/i)
  })
})
