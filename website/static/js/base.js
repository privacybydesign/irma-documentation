let base = "//" + document.location.host + "/docs/";
document.write("<base href='" + base + "' />");

document.addEventListener('DOMContentLoaded', () => {
  var links = document.getElementsByTagName("a");
  for (let i=0; i < links.length; i++) {
    let href = links[i].getAttribute("href");
    if (!href) continue;
    if (href[0] === '#') {
      links[i].setAttribute("href", window.location.href.replace(location.hash, "") + href);
    }
  }

});
