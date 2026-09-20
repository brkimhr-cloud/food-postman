const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function setupMenu() {
  const button = $('.menu-button');
  const nav = $('.site-nav');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
}

const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeLink(value, fallback = '') {
  if (!value) return fallback;
  try { const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : fallback; }
  catch { return fallback; }
}
const birdIcon = '<img class="post-bird" src="post-bird.svg" alt="" aria-hidden="true">';
function productCard(product) {
  const pending = product.status === 'pending';
  const name = pending ? '제품 준비 중' : product.name;
  const purchase = pending ? '' : safeLink(product.purchaseUrl);
  const inquiry = safeLink(product.inquiryUrl, 'contact.html');
  const photo = safeLink(product.image);
  const price = pending || product.price === null || product.price === '' || product.price === undefined
    ? '가격 문의' : typeof product.price === 'number' ? product.price.toLocaleString('ko-KR') + '원' : product.price;
  const placeholder = '<div class="product-placeholder">' + birdIcon + '<span>이미지 준비 중</span><small>GOOD FOOD, ON ITS WAY</small></div>';
  return `<article class="product-card">
    <div class="product-image-wrap">${photo ? `<img class="product-image" src="${escapeHTML(photo)}" alt="${escapeHTML(name)}" loading="lazy">` : placeholder}</div>
    <div class="product-info">
      <div class="product-origin"><span>${escapeHTML(product.brand)}</span><span>${escapeHTML(product.category)}</span></div>
      ${pending ? '<span class="pending-badge">제품 준비 중 · 소개 예정</span>' : ''}
      <h3>${escapeHTML(name)}</h3><p>${escapeHTML(product.description)}</p>
      ${product.package ? '<p class="product-package">' + escapeHTML(product.package) + '</p>' : ''}
      ${!pending && product.features?.length ? '<ul class="product-features">' + product.features.map(f => '<li>' + escapeHTML(f) + '</li>').join('') + '</ul>' : ''}
      ${!pending && product.usage ? '<p class="product-usage"><strong>이렇게 활용하세요</strong><br>' + escapeHTML(product.usage) + '</p>' : ''}
      <strong class="product-price">${escapeHTML(price)}</strong>
      ${product.collectedAt ? '<small class="price-note">' + escapeHTML(product.collectedAt) + ' 기준 · ' + escapeHTML(product.priceNote || '수집 당시 가격') + '</small>' : ''}
      <div class="product-actions">${purchase ? '<a class="button button-primary" href="' + escapeHTML(purchase) + '" target="_blank" rel="noopener noreferrer">구매하기 ↗</a>' : ''}
      <a class="card-action" href="${escapeHTML(inquiry)}">${birdIcon}제품 문의하기 ↗</a></div>
    </div>
  </article>`;
}
async function loadProducts() {
  const target = $('#featured-products, #all-products');
  if (!target) return;
  try {
    const response = await fetch('products.json');
    if (!response.ok) throw new Error('상품 정보를 불러올 수 없습니다.');
    const products = await response.json();
    const render = (items) => {
      target.innerHTML = items.length ? items.map(productCard).join('') : '<p>제품을 준비하고 있습니다.</p>';
      $$('.product-image', target).forEach(img => img.addEventListener('error', () => {
        img.parentElement.innerHTML = '<div class="product-placeholder">' + birdIcon + '<span>이미지 준비 중</span></div>';
      }));
      if ($('.product-count')) $('.product-count').textContent = '소개 제품 ' + items.length + '개';
    };
    if (target.id === 'featured-products') render(products.filter(p => p.featured === true).slice(0, 3));
    else {
      const filters = $('.filter-list');
      filters.replaceChildren();
      ['전체', ...new Set(products.map(p => p.category).filter(Boolean))].forEach((category, i) => {
        const button = document.createElement('button');
        button.textContent = category;
        button.className = i === 0 ? 'active' : '';
        button.setAttribute('aria-pressed', String(i === 0));
        button.addEventListener('click', () => {
          $$('button', filters).forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
          render(i === 0 ? products : products.filter(p => p.category === category));
        });
        filters.append(button);
      });
      render(products);
    }
  } catch (error) { target.innerHTML = '<p class="form-message">제품 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>'; }
}
function setupBirdButtons() {
  $$('.hero-actions .button-primary, .letter-cta .button-light').forEach(button => button.insertAdjacentHTML('afterbegin', birdIcon));
}

const inStory = /\/story\//.test(location.pathname);
const storyBase = inStory ? '' : 'story/';
const sortedPosts = posts => [...posts].sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
function storyCard(post) {
  return '<article class="story-card"><a href="' + storyBase + 'post.html?id=' + encodeURIComponent(post.id) + '"><div class="story-meta"><span>' + escapeHTML((post.tags || []).join(' / ')) + '</span><time>' + escapeHTML(post.date) + '</time></div><h3>' + escapeHTML(post.title) + '</h3><p>' + escapeHTML(post.summary) + '</p></a></article>';
}
async function loadStories() {
  const home = $('#latest-stories'), list = $('#story-list');
  if (!home && !list) return;
  try {
    const response = await fetch(storyBase + 'posts.json', {cache:'no-store'});
    if (!response.ok) throw new Error();
    const posts = sortedPosts(await response.json());
    (home || list).innerHTML = (home ? posts.slice(0,3) : posts).map(storyCard).join('');
  } catch { (home || list).textContent = '이야기를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.'; }
}
function inlineText(text) {
  const pattern = /\[([^\]]+)\]\(([^\s)]+)\)/g;
  let output = '', end = 0;
  for (const match of String(text).matchAll(pattern)) {
    output += escapeHTML(text.slice(end, match.index));
    const href = safeLink(match[2]);
    output += href ? '<a href="' + escapeHTML(href) + '">' + escapeHTML(match[1]) + '</a>' : escapeHTML(match[1]);
    end = match.index + match[0].length;
  }
  return output + escapeHTML(text.slice(end));
}
function renderFAQ(items) {
  if (!Array.isArray(items) || !items.length) return '';
  return '<section class="post-faq"><h2>자주 묻는 질문</h2>' + items.map(item => '<details><summary>' + escapeHTML(item.q) + '</summary><p>' + escapeHTML(item.a) + '</p></details>').join('') + '</section>';
}
function renderBody(body) {
  return String(body || '').split(/\n\s*\n/).map(block => {
    if (block.startsWith('## ')) return '<h2>' + escapeHTML(block.slice(3)) + '</h2>';
    if (block.split('\n').every(line => line.startsWith('- '))) return '<ul>' + block.split('\n').map(line => '<li>' + escapeHTML(line.slice(2)) + '</li>').join('') + '</ul>';
    return '<p>' + inlineText(block).replaceAll('\n','<br>') + '</p>';
  }).join('');
}
async function loadPost() {
  const target = $('#post-article');
  if (!target) return;
  try {
    const response = await fetch(storyBase + 'posts.json', {cache:'no-store'});
    if (!response.ok) throw new Error();
    const posts = await response.json();
    const post = posts.find(p => p.id === new URLSearchParams(location.search).get('id'));
    if (!post) { target.innerHTML = '<h1>글을 찾을 수 없습니다.</h1><a href="index.html">편지 목록으로</a>'; return; }
    document.title = post.title + ' | 집배원의 맛있는 편지';
    target.innerHTML = '<div class="story-meta"><span>' + escapeHTML(post.author || '푸드집배원') + '</span><time>' + escapeHTML(post.date) + '</time></div><h1>' + escapeHTML(post.title) + '</h1><div class="article-body">' + renderBody(post.body) + '</div>' + renderFAQ(post.faq) + '<a class="text-link" href="index.html">모든 이야기 보기 →</a>';
  } catch { target.textContent = '글을 불러오지 못했습니다.'; }
}
function setupForm() {
  const form = $('.inquiry-form');
  if (!form) return;
  const inquiryTypes = { sample: '샘플 소포 신청', supply: 'B2B 대량 공급 문의', product: '제품 도입 상담' };
  const inquiryType = inquiryTypes[new URLSearchParams(location.search).get('type')];
  if (inquiryType) $('select[name="type"]', form).value = inquiryType;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    $('.form-message', form).textContent = '문의 내용이 준비되었습니다. 실제 운영 시 이메일 또는 폼 서비스 연결 후 발송할 수 있습니다.';
  });
}

setupMenu();
loadProducts();
loadStories();
loadPost();
setupForm();
setupBirdButtons();
