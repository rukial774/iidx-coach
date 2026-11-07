'use strict';
const CACHE='iidx-coach-public-v1';
const ASSETS=["./", "./index.html", "./app.css", "./app.js", "./photo.js", "./photo-parse.js", "./remote.js", "./manifest.json", "./data.json", "./data/latest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./vendor/ocr/ASSETS.json", "./vendor/ocr/tesseract.min.js", "./vendor/ocr/worker.min.js", "./vendor/ocr/tesseract.min.js.LICENSE.txt", "./vendor/ocr/worker.min.js.LICENSE.txt", "./vendor/ocr/lang/jpn.traineddata.gz", "./vendor/ocr/lang/eng.traineddata.gz", "./vendor/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js", "./vendor/ocr/core/tesseract-core-simd-lstm.wasm.js", "./vendor/ocr/core/tesseract-core-lstm.wasm.js", "./vendor/ocr/core/tesseract-core-relaxedsimd.wasm.js", "./vendor/ocr/core/tesseract-core.wasm.js", "./vendor/ocr/core/tesseract-core-simd.wasm.js", "./vendor/ocr/licenses/tesseract.js-LICENSE", "./vendor/ocr/licenses/LANGUAGE-DATA.txt", "./vendor/ocr/licenses/tesseract.js-core-LICENSE"];
const LATEST=new URL('./data/latest.json',self.location.href).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('iidx-coach-public-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.href===LATEST){
  event.respondWith(fetch(request,{cache:'no-cache'}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));}return response;}).catch(()=>caches.match(request).then(cached=>cached||Response.error())));return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));}return response;}).catch(()=>request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});
