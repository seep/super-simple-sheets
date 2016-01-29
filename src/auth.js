const merge = require('lodash.merge');
const googauth = require('google-auto-auth');
const promisify = require('pify');

// The list of authorization scopes we need for the Google API.
const scopes = [ 'https://spreadsheets.google.com/feeds' ];

/**
 * Tries to create a Google Auth client from a variety of sources. First it
 * looks for an existing auth client or key path on the parameters. Then it
 * looks for credentials in the environment. If it can't find either, it
 * returns undefined.
 *
 * @param opts
 * @param [opts.auth] - A Google Auth client. This would be reused.
 * @param [opts.key] - A path to a Google API JSON credentials.
 *
 * @returns a Google Auth client, or undefined.
 */
function create(opts) {

  let { auth, key } = opts;

  if (auth && auth.authorizeRequest) {

    return auth;

  } else if (typeof key === 'string') {

    return googauth({ keyFilename: key, scopes });

  } else if (key.client_email && key.private_key) {

    return googauth({ credentials: key, scopes });

  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {

    return googauth({ scopes });

  }

}

/**
 * Authorize a request to the Google Spreadsheets API.
 *
 * @param opts
 * @param req - A object with request object. See https://github.com/request/request#requestoptions-callback.
 *
 * @returns a Promise for the request options, plus the authorization headers.
 */
function authorize(opts, req) {

  let auth = create(opts);

  if (auth) {

    // Set the visibility and projection of the request.
    req.uri += '/private/full';

    // Promisify the authorization function on the (possibly new) auth object.
    let authorizer = promisify(auth.authorizeRequest.bind(auth));
    return authorizer(req).then(res => merge(req, res));

  } else {

    // Set the visibility and projection of the request.
    req.uri += '/public/values';

    // Return an empty header object.
    return Promise.resolve(req);

  }

};

module.exports = { create, authorize, scopes };
