/* Établi — cache hors ligne. Incrémenter VERSION à chaque mise en ligne. */
"use strict";

var VERSION = "etabli-v4";
var FONT_CACHE = "etabli-fonts";   /* survit aux versions */
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
    caches.open(VERSION).then(function(c){
      return c.addAll(SHELL.map(function(u){ return new Request(u, { cache: "reload" }); }));
    })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== VERSION && k !== FONT_CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function cacheFor(url){
  if (url.origin === self.location.origin) return VERSION;
  if (FONT_HOSTS.indexOf(url.hostname) !== -1) return FONT_CACHE;
  return null;
}

/* Cache d'abord, réseau en arrière-plan pour rafraîchir. */
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  var name = cacheFor(new URL(e.request.url));
  if (!name) return;

  e.respondWith(
    caches.open(name).then(function(c){
      return c.match(e.request).then(function(cached){
        var fresh = (name === VERSION)
          ? fetch(e.request.url, { cache: "no-cache", credentials: "same-origin" })
          : fetch(e.request);
        var network = fresh.then(function(res){
          if (res && (res.ok || res.type === "opaque")) c.put(e.request, res.clone());
          return res;
        }).catch(function(){
          if (e.request.mode === "navigate") return caches.match("./index.html");
          return cached;
        });
        return cached || network;
      });
    })
  );
});
