import {registerRoute as workbox_routing_registerRoute} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-routing/registerRoute.mjs';
import {ExpirationPlugin as workbox_expiration_ExpirationPlugin} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-expiration/ExpirationPlugin.mjs';
import {CacheableResponsePlugin as workbox_cacheable_response_CacheableResponsePlugin} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-cacheable-response/CacheableResponsePlugin.mjs';
import {CacheFirst as workbox_strategies_CacheFirst} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-strategies/CacheFirst.mjs';
import {StaleWhileRevalidate as workbox_strategies_StaleWhileRevalidate} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-strategies/StaleWhileRevalidate.mjs';
import {clientsClaim as workbox_core_clientsClaim} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-core/clientsClaim.mjs';
import {precacheAndRoute as workbox_precaching_precacheAndRoute} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-precaching/precacheAndRoute.mjs';
import {cleanupOutdatedCaches as workbox_precaching_cleanupOutdatedCaches} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-precaching/cleanupOutdatedCaches.mjs';
import {NavigationRoute as workbox_routing_NavigationRoute} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-routing/NavigationRoute.mjs';
import {createHandlerBoundToURL as workbox_precaching_createHandlerBoundToURL} from 'C:/Users/Lekas/Downloads/AmeniEdge/frontend/node_modules/workbox-precaching/createHandlerBoundToURL.mjs';/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */




self.skipWaiting();
workbox_core_clientsClaim();
/**
 * The precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
workbox_precaching_precacheAndRoute([
  {
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  },
  {
    "url": "index.html",
    "revision": "33ec5e2df998436fb623fc524318608b"
  },
  {
    "url": "images/step-help.svg",
    "revision": "64ad8869a9fa4402b7ae1f45817fb250"
  },
  {
    "url": "images/station-wifi.svg",
    "revision": "9e7caee4c56d25feab825e15e2ebf5de"
  },
  {
    "url": "images/rescue-team.svg",
    "revision": "2f180ad00daa2c8d233a3ed2f6babefe"
  },
  {
    "url": "images/phone-sos.svg",
    "revision": "a0f6548b217b52f564c26a7f35cb961a"
  },
  {
    "url": "images/offline-map.svg",
    "revision": "d325d43458b262aa54ef2a2930c55fb6"
  },
  {
    "url": "images/flood-rescue.svg",
    "revision": "6a844f48c6032776a2132b89e75ae54b"
  },
  {
    "url": "assets/index-SCo7W5Nb.css",
    "revision": null
  },
  {
    "url": "assets/index-BZng6Kxi.js",
    "revision": null
  },
  {
    "url": "manifest.webmanifest",
    "revision": "7d2140bd4da5785f03ab85fe6d3b1737"
  }
], {});
workbox_precaching_cleanupOutdatedCaches();workbox_routing_registerRoute(new workbox_routing_NavigationRoute(workbox_precaching_createHandlerBoundToURL("index.html")));
workbox_routing_registerRoute(/^\/api\/v1\/maps\/tiles\/.*/i, new workbox_strategies_CacheFirst({ "cacheName":"ameniedge-map-tiles", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 1000, maxAgeSeconds: 2592000 }), new workbox_cacheable_response_CacheableResponsePlugin({ statuses: [ 0, 200 ] })] }), 'GET');
workbox_routing_registerRoute(/^\/api\/v1\/(bulletins|shelters|hazards).*/i, new workbox_strategies_StaleWhileRevalidate({ "cacheName":"ameniedge-emergency-data", plugins: [new workbox_expiration_ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 86400 })] }), 'GET');


