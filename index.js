var http = require('http')
var request = require('request')
var omit = require('lodash.omit')
var parseUrl = require('url').parse
var decamelize = require('decamelize')

var PORT = 8488
var REDIRECT_URI = 'http://localhost:' + PORT
var BASE_URL = 'https://accounts.google.com/o/oauth2/auth'
var GOOGLE_OAUTH2_TOKEN_URL = 'https://accounts.google.com/o/oauth2/token'

var getCode = exports.getCode = function (params, callback) {
  var url = buildUrl(params)

  return function (nightmare) {
    startCallbackServer(callback)

    nightmare
      .viewport(800, 1600)
      .goto(url)
      .wait('input[type=email]')
      .type('input[type=email]', params.email)
      .type('input[type=password]', params.password)
      .click('input[type=submit]')
      .wait()
      .goto(url)
      .wait('#submit_approve_access')
      .wait(1500)
      .click('#submit_approve_access')
      .wait()
  }
}

var getToken = exports.getToken = function (params, callback) {
  return getCode(params, function getToken(err, code) {
    if (err) return callback(err)

    if (!params.clientSecret) {
      throw missingParam('clientSecret')
    }

    var values = {
      code: code,
      client_id: params.clientId,
      client_secret: params.clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    request({
      method: 'POST',
      uri: GOOGLE_OAUTH2_TOKEN_URL,
      form: values,
      json: true
    }, function (err, res, tokens) {
      if (!err && tokens && tokens.expires_in) {
        tokens.expiry_date = ((new Date()).getTime() + (tokens.expires_in * 1000))
        tokens = omit(tokens, 'expires_in')
      }
      if (!err && tokens.error) {
        err = new Error(tokens.error_description)
        err.code = tokens.error
        tokens = null
      }
      callback(err, tokens)
    })
  })
}

function startCallbackServer(callback) {
  var server = http.createServer(function (req, res) {
    res.writeHead(200)
    res.end()

    server.close()
    server = null

    var query = parseUrl(req.url, true).query
    if (!query || !query.code) {
      return callback(new Error('Missing OAuth2 code in callback'))
    }

    callback(null, query.code)
  })

  server.listen(PORT, function (err) {
    if (err) return callback(err)

    // be sure we kill the server in case of timeout/error
    setTimeout(function () {
      if (server) {
        server.close()
      }
    }, 15 * 1000)
  })
}

function buildUrl(options) {
  var params = defineDefaultParams(options)

  var query = Object.keys(params).map(function (key) {
    return key + '=' + encodeURIComponent(params[key])
  }).join('&')

  return BASE_URL + '?' + query
}

function defineDefaultParams(params) {
  params = validate(normalize(params))

  if (!params.redirect_uri) {
    params.redirect_uri = REDIRECT_URI
  }
  if (!params.access_type) {
    params.access_type = 'offline'
  }

  params.response_type = 'code'

  return omitPrivateParams(params)
}

function omitPrivateParams(params) {
  return omit(params, 'email', 'password', 'client_secret')
}

function validate(params) {
  ['email', 'password', 'scope', 'client_id'].forEach(function (name) {
    if (!params[name]) {
      throw missingParam(name)
    }
  })
  return params
}

function normalize(params) {
  var buf = {}
  Object.keys(params).forEach(function (key) {
    return buf[decamelize(key)] = params[key]
  })
  return buf
}

function missingParam(name) {
  return new TypeError('Missing required param: ' + name)
}
