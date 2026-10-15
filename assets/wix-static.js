const slideshow=document.querySelector('#comp-izspnr12');
const slides=JSON.parse(document.querySelector('#static-slides')?.textContent||'[]');
if(slideshow&&slides.length){
 const img=slideshow.querySelector('img');const links=[...slideshow.querySelectorAll('a[href*="#comp-"]')];let current=0;
 const video=document.createElement('video');video.className='static-slide-video';video.muted=true;video.loop=true;video.playsInline=true;video.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none';img.parentElement.append(video);
 function show(i){current=(i+slides.length)%slides.length;img.src=slides[current].src;img.alt=slides[current].alt;if(slides[current].video){video.style.display='block';if(video.getAttribute('src')!==slides[current].video)video.src=slides[current].video;video.poster=slides[current].src;video.play().catch(()=>{});}else{video.pause();video.style.display='none';}links.forEach((link,j)=>{link.style.opacity=j===current?'1':'.65';link.setAttribute('aria-current',String(j===current));link.querySelector('div')?.style.setProperty('background-color',j===current?'#b99e7b':'#fff');});}
 const buttons=[...slideshow.querySelectorAll('button')];buttons.find(b=>b.getAttribute('aria-label')==='이전')?.addEventListener('click',()=>show(current-1));buttons.find(b=>b.getAttribute('aria-label')==='다음')?.addEventListener('click',()=>show(current+1));
 links.forEach((link,i)=>link.addEventListener('click',e=>{e.preventDefault();show(i);}));
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{if(!document.hidden&&!slideshow.matches(':hover'))show(current+1)},7000);
 show(0);
}
document.querySelectorAll('.static-masonry').forEach(gallery=>{
 function arrange(){const width=gallery.clientWidth;const columns=4,gap=6;const cell=(width-gap*(columns+1))/columns;const bottoms=Array(columns).fill(3);gallery.querySelectorAll('.static-photo').forEach(button=>{const col=bottoms.indexOf(Math.min(...bottoms));const height=Math.round(cell*Number(button.dataset.ratio));Object.assign(button.style,{left:`${3+col*(cell+gap)}px`,top:`${bottoms[col]}px`,width:`${cell}px`,height:`${height}px`});bottoms[col]+=height+gap;});gallery.style.height=`${Math.max(...bottoms)}px`;}
 arrange();new ResizeObserver(arrange).observe(gallery);
});
const viewer=document.querySelector('#static-viewer');
document.querySelectorAll('.static-photo').forEach(button=>button.addEventListener('click',()=>{viewer.querySelector('img').src=button.dataset.full;viewer.querySelector('img').alt=button.dataset.title;viewer.querySelector('p').textContent=button.dataset.title;viewer.showModal();}));
viewer?.querySelector('button').addEventListener('click',()=>viewer.close());viewer?.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
document.querySelectorAll('form').forEach(form=>{
 form.querySelectorAll('input,textarea').forEach(input=>{if(!input.getAttribute('aria-label'))input.setAttribute('aria-label',input.placeholder||input.name||'문의 내용');});
 const note=document.createElement('p');note.className='static-form-note';note.textContent='SEND를 누르면 이메일 앱에서 내용을 확인한 뒤 전송합니다.';form.append(note);
 form.addEventListener('submit',e=>{e.preventDefault();const fields=[...form.querySelectorAll('input,textarea')].filter(x=>x.value).map(x=>(x.placeholder||x.name||'내용')+': '+x.value).join('\n');location.href='mailto:Makegroupcg@naver.com?subject='+encodeURIComponent('MAKE GROUP 제작 문의')+'&body='+encodeURIComponent(fields);});
});
const chat=document.createElement('a');chat.id='static-chat';chat.href='mailto:Makegroupcg@naver.com';chat.textContent='✉ 이메일 문의';document.body.append(chat);
document.querySelectorAll('[data-hook="item-container"]').forEach(card=>{const link=card.querySelector('a[href*="project-"]');if(link)card.querySelectorAll('img.gallery-item').forEach(img=>{img.style.cursor='pointer';img.addEventListener('click',()=>location.href=link.getAttribute('href'));});});
if(document.querySelector('[data-hook="feed-page-root"]'))fetch('assets/project-index.json').then(r=>r.json()).then(posts=>{const area=document.createElement('div');area.className='static-archive';const label=document.createElement('label');label.textContent='전체 프로젝트 ';const select=document.createElement('select');select.setAttribute('aria-label','전체 프로젝트 선택');const option=document.createElement('option');option.value='';option.textContent='37개 프로젝트에서 선택';select.append(option);posts.forEach(post=>{const item=document.createElement('option');item.value=post.file;item.textContent=post.title;select.append(item);});select.addEventListener('change',()=>{if(select.value)location.href=select.value;});label.append(select);area.append(label);document.querySelector('[data-hook="post-list-pro-gallery-container"]').after(area);}).catch(()=>{});
