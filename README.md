# nightmare-google-oauth2 [![Build Status](https://api.travis-ci.org/h2non/nightmare-google-oauth2.svg?branch=master)][travis] [![NPM version](https://img.shields.io/npm/v/nightmare-google-oauth2.svg)][npm]

[Nightmare](http://github.com/segmentio/nightmare) plugin to automatically authenticate, authorize and retrieve a fresh [OAuth2](https://developers.google.com/accounts/docs/OAuth2WebServer) token ready to be used with [Google APIs](https://developers.google.com/apis-explorer).

This package was designed to simplify server-to-server tasks automation and avoid headaches when dealing with OAuth, since it is the [unique method](https://developers.google.com/youtube/v3/guides/authentication#OAuth2_Flows) to perform most of the user-related write operations via Google APIs, such as creating a post in Blogspot or uploading a video to YouTube

It provides reliable [programmatic](#programmatic-api) interface which abstracts you about performing any kind of manual steps related to the authentication, authorization and handshake process to obtain a valid OAuth2 token, which is usually done manually from the user in the web browser. 
It support multiple associated Google accounts as well, selecting the desired one

For nightware-agnostic interface and command-line solution, see [google-oauth2-token](https://github.com/h2non/google-oauth2-token).

## Installation

```bash
npm install nightmare-google-oauth2 --save
```

## Google API credentials setup

Be sure you have a project and a Web Application credentials with a Client ID and Client Secret 
from the [Google API Console][console] > `API & Auth` > `Credentials`

Then you must add the following URI as allowed redirects (without final slash):
```
http://localhost:8488
```

Then you should see something like this:

<img src="http://oi59.tinypic.com/2w3udmd.jpg" />

## Programmatic API

```js
var Nightmare = require('nightmare')
var NightmareOAuth2 = require('nightmare-google-oauth2')
```

### Supported params

- **email** - Google Account user email. Example: `john@gmail.com`
- **password** - Google Account user password. Be aware with this. Use a temporal environment variable to store it
- **clientId** - Google API Client ID. You can obtain it from the [Google API Console][console]
- **clientSecret** - Google API Client Secret ID. You can obtain it from the [Google API Console][console]
- **scope** - Scope permissions URLs separated by spaces. Read more [here](https://developers.google.com/discovery/v1/using#discovery-doc-methods-scopes)
- **useAccount** - In case of multiple associated Google accounts, define the email of the desired account to use
- **verificationEmail** - In case that Google asks for the verification email. Not too common anyway.

#### .getToken(params, callback [, onChange ])

Return an `object` with valid OAuth2 tokens ready to be used to call Google APIs endpoints

```js
{ 
  access_token: 'H3l5321N123sdI4HLY/RF39FjrCRF39FjrCRF39FjrCRF39FjrC_RF39FjrCRF39FjrC',
  token_type: 'Bearer',
  refresh_token: '1/smWJksmWJksmWJksmWJksmWJk_smWJksmWJksmWJksmWJksmWJk',
  expiry_date: 1425333671141 
}
```

Required params:

- **email**
- **password**
- **clientId**
- **clientSecret**
- **scope**

Example:
```js
var params = {
  email: 'my.user@gmail.com',
  password: 'sup3r_p@s$w0rd',
  clientId: 'blablabla', // Google API Client ID
  clientSecret: 'private', // Google API Client Secret
  scope: 'https://www.googleapis.com/auth/youtube.upload'
}

new Nightmare()
  .use(NightmareOAuth2.getToken(params, function (err, tokens) {
    if (err) {
      return console.error('Cannot retrieve the token:', err)
    }

    console.log('OAuth2 access token:', tokens.access_token)
    console.log('OAuth2 refresh token:', tokens.refresh_token)
    console.log('OAuth2 token expiry date:', new Date(tokens.expiry_date))
  }))
```

#### .getCode(params, callback)

Return an `string` with the OAuth2 exchange code to be used during the OAuth2 handshake to obtain a valid token.
This process is implicitly made when calling `getToken()`

Required params:

- **email**
- **password**
- **clientId**
- **scope**

Example:
```js
var params = {
  email: 'my.user@gmail.com',
  password: 'sup3r_p@s$w0rd',
  clientId: 'blablabla', // Google API Client ID
  scope: 'https://www.googleapis.com/auth/youtube.upload'
}

new Nightmare()
  .use(NightmareOAuth2.getCode(params, function (err, code) {
    if (err) {
      return console.error('Cannot retrieve the token:', err)
    }

    console.log('OAuth2 code:', code)
  }))
```

## License 

[MIT](http://opensource.org/licenses/MIT) © Tomas Aparicio

[console]: https://code.google.com/apis/console
[travis]: https://travis-ci.org/h2non/nightmare-google-oauth2
[npm]: http://npmjs.org/package/nightmare-google-oauth2
