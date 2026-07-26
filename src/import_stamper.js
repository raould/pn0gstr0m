// busting local browser cache of github pages hosted static files, i hope.
function import_stamped(url) {
    const script = document.createElement('script');
    script.src = url + "?VVV=" + new Date().getTime();
    script.async = true;
    document.head.appendChild(script);
}
