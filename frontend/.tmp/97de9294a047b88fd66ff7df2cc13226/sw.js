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
    "revision": "763dabd31a592fe199f276c0b471b167"
  },
  {
    "url": "images/step-help.svg",
    "revision": "6ca9d0741e59189f570e35f0a9779ab2"
  },
  {
    "url": "images/station-wifi.svg",
    "revision": "549c3fd570642464529e51646aae587f"
  },
  {
    "url": "images/rescue-team.svg",
    "revision": "23879e80f144d568c99951a9c86692e1"
  },
  {
    "url": "images/phone-sos.svg",
    "revision": "751b51da282dcb42d902b43cd54c7302"
  },
  {
    "url": "images/offline-map.svg",
    "revision": "f5e71026a5ba2ae245e79e50d74661d0"
  },
  {
    "url": "images/flood-rescue.svg",
    "revision": "f046fa2f9ad14a474ea2182da03744f4"
  },
  {
    "url": "assets/index-fOHXFgbD.js",
    "revision": null
  },
  {
    "url": "assets/index-DK15NHyO.css",
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


