module.exports = {
  servers: {
    one: {
      host: 'ip-address',
      username: 'root',
      password: ''
    }
  },
  app: {
    name: 'flatbid',
    path: '../',
    volumes: {
      '/mnt/volume_lon1_01': '/mnt/flatbid_cache'
    //   // '/root/flatbid_cache': '/mnt/flatbid_cache'
    },
    docker: {
      image: 'abernix/meteord:base'
    },
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true
    },
    env: {
      ROOT_URL: 'https://www.spotmycrib.ie/',
      MONGO_URL: 'mongodb://Kirill0611:Kirill0611@cluster0.3dlb0.mongodb.net:11461/sandboxdb',
      "MAIL_URL": "smtp://dev%40spotmycrib.ie:b399dbc946d2ef90dac4a1c3414d31dc-1d8af1f4-9c3055ea@smtp.mailgun.org:587"
      "CDN_URL": "https://d30nklzkhaqiiz.cloudfront.net/"
    }
  }
  ,
  proxy: {
    domains: 'www.spotmycrib.ie',
    ssl: {
      // Enable let's encrypt to create free certificates.
      // The email is used by Let's Encrypt to notify you when the
      // certificates are close to expiring.
      letsEncryptEmail: 'support@spotmycrib.com',
      forceSSL: true
    }
  }
};
