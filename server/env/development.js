var secrets = require("../../secrets");

module.exports = {
    "DATABASE_URI": "mongodb://localhost:27017/girder-gus",
    "SESSION_SECRET": "Optimus Prime is my real mum",
    "TWITTER": {
        "consumerKey": "INSERT_TWITTER_CONSUMER_KEY_HERE",
        "consumerSecret": "INSERT_TWITTER_CONSUMER_SECRET_HERE",
        "callbackUrl": "INSERT_TWITTER_CALLBACK_HERE"
    },
    "FACEBOOK": {
        "clientID": "INSERT_FACEBOOK_CLIENTID_HERE",
        "clientSecret": "INSERT_FACEBOOK_CLIENT_SECRET_HERE",
        "callbackURL": "INSERT_FACEBOOK_CALLBACK_HERE"
    },
    "GOOGLE": {
        'clientID': '617960550221-felsd9smo40r9eff914o7fnkse3j2g77.apps.googleusercontent.com',
        'clientSecret': 'NCxf4IyOYksC93LFKh9CbRhD',
        'callbackURL': 'http://127.0.0.1:1337/auth/google/callback'
    },
    "S3": {
        'ACCESS_KEY_ID': secrets.S3.accessKeyId,
        'SECRET_ACCESS_KEY': secrets.S3.secretAccessKey
    }
};
