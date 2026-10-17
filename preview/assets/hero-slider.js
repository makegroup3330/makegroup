(() => {
  const art = document.querySelector('.hero-art');
  const config = document.querySelector('#hero-slides');
  if (!art || !config) return;
  const slides = JSON.parse(config.textContent);
  const picture = art.closest('picture');
  const sources = picture.querySelectorAll('source');
  const buttons = [...document.querySelectorAll('[data-slide]')];
  let active = 0;

  buttons.forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.slide);
    if (index === active || !slides[index]) return;
    const slide = slides[index];
    // Change every source in one event so picture selects the matching format and crop.
    sources[0].srcset = slide.mobile.avif;
    sources[1].srcset = slide.mobile.webp;
    sources[2].srcset = slide.desktop.avif;
    art.srcset = slide.desktop.webp;
    art.src = slide.fallback.src;
    art.width = slide.fallback.width;
    art.height = slide.fallback.height;
    art.alt = slide.alt;
    document.querySelector('.hero-stage').dataset.heroSlide = String(index);
    document.querySelector('#hero-number').textContent = String(index + 1).padStart(2, '0');
    document.querySelector('#hero-name').textContent = slide.name;
    const link = document.querySelector('.hero-explore');
    link.href = slide.href;
    link.setAttribute('aria-label', slide.name + ' 프로젝트 보기');
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    active = index;
  }));
})();
