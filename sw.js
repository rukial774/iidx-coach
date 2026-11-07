'use strict';
const BUILD='2026.11.07-3',CACHE='iidx-coach-v3-20261107-auto-update';
const ASSETS=["./", "./index.html", "./app.css", "./app.js", "./photo.js", "./photo-parse.js", "./vendor/ocr/ASSETS.json", "./vendor/ocr/tesseract.min.js", "./vendor/ocr/worker.min.js", "./vendor/ocr/tesseract.min.js.LICENSE.txt", "./vendor/ocr/worker.min.js.LICENSE.txt", "./vendor/ocr/lang/jpn.traineddata.gz", "./vendor/ocr/lang/eng.traineddata.gz", "./vendor/ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js", "./vendor/ocr/core/tesseract-core-simd-lstm.wasm.js", "./vendor/ocr/core/tesseract-core-lstm.wasm.js", "./vendor/ocr/core/tesseract-core-relaxedsimd.wasm.js", "./vendor/ocr/core/tesseract-core.wasm.js", "./vendor/ocr/core/tesseract-core-simd.wasm.js", "./vendor/ocr/licenses/tesseract.js-LICENSE", "./vendor/ocr/licenses/LANGUAGE-DATA.txt", "./vendor/ocr/licenses/tesseract.js-core-LICENSE", "./manifest.json", "./data.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./remote.js", "./data/latest.json"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting()));});
function capabilities(client){return new Promise(resolve=>{const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();resolve(null);},1500);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};try{client.postMessage({type:'IIDX_SW_CAPABILITIES',build:BUILD},[channel.port2]);}catch{clearTimeout(timer);resolve(null);}});}
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 // Legacy pages have no controllerchange listener. Detect this before claim, then
 // navigate those pages once; simply activating a new worker leaves old JS alive.
 const windows=(await self.clients.matchAll({type:'window',includeUncontrolled:true})).filter(c=>c.url.startsWith(self.registration.scope));
 const support=await Promise.all(windows.map(capabilities));
 const keys=await caches.keys();await Promise.all(keys.filter(k=>/^(iidx-coach-|player-iidx-)/i.test(k)&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
 // Do not await navigation inside activate: that navigation may wait for this worker to finish activation.
 for(let index=0;index<windows.length;index++)if(!support[index]?.autoReload)windows[index].navigate(windows[index].url).catch(()=>{});
})());});
self.addEventListener('message',event=>{if(event.data?.type==='IIDX_GET_VERSION')event.ports[0]?.postMessage({build:BUILD,cache:CACHE});if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 const latestURL=new URL('./data/latest.json',self.registration.scope),latest=url.pathname===latestURL.pathname;
 if(latest){event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{if(response.ok){const cache=await caches.open(CACHE);await cache.put(latestURL.href,response.clone());}return response;}).catch(()=>caches.open(CACHE).then(c=>c.match(latestURL.href)).then(r=>r||Response.error())));return;}
 event.respondWith(caches.open(CACHE).then(c=>c.match(event.request)).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return response;}).catch(()=>event.request.mode==='navigate'?caches.open(CACHE).then(c=>c.match('./index.html')):Response.error())));
});
