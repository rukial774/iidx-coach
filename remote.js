/* Shared chart snapshots are read-only. User logs and names never leave this device. */
(function(){
'use strict';
const cacheKey='iidx-coach-shared-snapshot-v1';
const api={status:'最新データを確認中',ready:null,refresh};window.IIDXSnapshot=api;
function status(text){api.status=text;const node=document.getElementById('remote-status');if(node)node.textContent=text+' (JST)';}
async function refresh(){
 try{
  const response=await fetch(new URL('./data/latest.json',document.baseURI),{cache:'no-cache',credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const snapshot=await response.json();
  if(window.IIDXApp.applySnapshot(snapshot)){
   try{localStorage.setItem(cacheKey,JSON.stringify(snapshot));}catch{}
   status('最新スナップショット '+snapshot.snapshotAsOf+' を反映');return true;
  }
  status('保存済みの新しいスナップショットを維持');return false;
 }catch{
  status('オフライン／更新未取得。保存済みデータと端末内ログを維持');return false;
 }
}
try{const cached=localStorage.getItem(cacheKey);if(cached){window.IIDXApp.applySnapshot(JSON.parse(cached));status('保存済みスナップショットを反映');}}catch{}
api.ready=refresh();
})();
