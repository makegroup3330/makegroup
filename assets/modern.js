const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#navigation');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);toggle.querySelector('span').textContent=open?'−':'＋';});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('is-open')){toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');toggle.querySelector('span').textContent='＋';toggle.focus();}});
const filters=[...document.querySelectorAll('[data-filter]')],search=document.querySelector('#project-search');
let active='전체';
function filterProjects(){const term=(search?.value||'').trim().toLocaleLowerCase('ko');let count=0;document.querySelectorAll('#project-list>[data-category]').forEach(card=>{const match=(active==='전체'||(card.dataset.categories||card.dataset.category).split('|').includes(active))&&card.dataset.title.toLocaleLowerCase('ko').includes(term);card.hidden=!match;if(match)count++;});const total=document.querySelector('.result-count');if(total)total.textContent=(term||active!=='전체'?'검색 결과 ':'전체 ')+count+'개 프로젝트';const empty=document.querySelector('#empty-results');if(empty)empty.hidden=count!==0;}
filters.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filterProjects();}));
search?.addEventListener('input',filterProjects);
const viewer=document.querySelector('#viewer');let origin;
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{origin=button;viewer.querySelector('img').src=button.dataset.image;viewer.querySelector('img').alt=button.dataset.caption;viewer.querySelector('p').textContent=button.dataset.caption;viewer.showModal();}));
viewer?.querySelector('.close-viewer').addEventListener('click',()=>viewer.close());
viewer?.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
viewer?.addEventListener('close',()=>origin?.focus());
