const dns = require('dns');

dns.resolveSrv(
  '_mongodb._tcp.cluster0.uwkjnqv.mongodb.net',
  (err, addresses) => {
    if (err) {
      console.error('Erreur DNS :', err);
    } else {
      console.log('SRV trouvés :', addresses);
    }
  }
);