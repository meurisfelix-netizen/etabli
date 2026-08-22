/* Établi — cache hors ligne. Incrémenter VERSION à chaque mise en ligne. */
"use strict";

var VERSION = "etabli-v1";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];
var FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(VERSION).then(function(c){ return c.addAll(SHELL); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== VERSION) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function isCacheable(url){
  if (url.origin === self.location.origin) return true;
  return FONT_HOSTS.indexOf(url.hostname) !== -1;
}

/* Cache d'abord, réseau en arrière-plan pour rafraîchir. */
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (!isCacheable(url)) return;

  e.respondWith(
    caches.open(VERSION).then(function(c){
      return c.match(e.request).then(function(cached){
        var network = fetch(e.request).then(function(res){
          if (res && (res.ok || res.type === "opaque")) c.put(e.request, res.clone());
          return res;
        }).catch(function(){
          if (e.request.mode === "navigate") return c.match("./index.html");
          return cached;
        });
        return cached || network;
      });
    })
  );
});
