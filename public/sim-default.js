// No server on this host, so start the built-in simulation with every room open.
(function () {
  var h = location.hostname, p = new URLSearchParams(location.search);
  if (h !== 'localhost' && h !== '127.0.0.1' && !p.has('sim')) {
    p.set('sim', '');
    if (!p.has('rooms')) p.set('rooms', 'all');
    history.replaceState(null, '', location.pathname + '?' + p.toString().replace('sim=', 'sim') + location.hash);
  }
})();
