"use strict";

// busting local browser cache of github pages hosted static files, i hope.
function import_stamped(url) {
  var script = document.createElement('script');
  script.src = url + "?VVV=" + new Date().getTime();
  script.async = false;
  document.head.appendChild(script);
}