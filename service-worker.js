const CACHE="sst-v1";

const FILES=[
"index.html",
"login.html",
"home.html",
"scan.html",
"timeline.html",
"list.html",
"style.css",
"app.js"
];

self.addEventListener("install",e=>{
e.waitUntil(
caches.open(CACHE).then(c=>c.addAll(FILES))
);
});

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request).then(r=>r||fetch(e.request))
);
});