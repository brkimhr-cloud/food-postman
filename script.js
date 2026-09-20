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

function productCard(product) {
  return `<article class="product-card">
    <div class="product-image-wrap"><div class="product-image" style="background-image:url('${product.image}')"></div></div>
    <div class="product-info">
      <div class="product-origin"><span>${product.origin}</span><span>${product.category}</span></div>
      <h3>${product.name}</h3><p>${product.description}</p>
      <a class="card-action" href="${product.link}">${product.linkLabel} <span>↗</span></a>
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
    const render = (items) => target.innerHTML = items.map(productCard).join('');
    if (target.id === 'featured-products') render(products.slice(0, 3));
    else {
      render(products);
      $$('.filter-list button').forEach((button) => button.addEventListener('click', () => {
        $$('.filter-list button').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        const filter = button.dataset.filter;
        render(filter === 'all' ? products : products.filter((item) => item.category === filter));
      }));
    }
  } catch (error) {
    target.innerHTML = `<p class="form-message">${error.message} 로컬 서버 또는 배포된 사이트에서 확인해 주세요.</p>`;
  }
}

function storyCard(post) {
  const postPath = 'post.html';
  return `<article class="story-card"><a href="${postPath}?slug=${post.slug}">
    <img src="${post.image}" alt="${post.title}"><div class="story-meta"><span>${post.category}</span><time>${post.date}</time></div>
    <h3>${post.title}</h3><p>${post.excerpt}</p></a></article>`;
}

async function loadStories() {
  const homeTarget = $('#latest-stories');
  const listTarget = $('#story-list');
  if (!homeTarget && !listTarget) return;
  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('이야기를 불러올 수 없습니다.');
    const posts = await response.json();
    const target = homeTarget || listTarget;
    target.innerHTML = (homeTarget ? posts.slice(0, 3) : posts).map(storyCard).join('');
  } catch (error) {
    (homeTarget || listTarget).innerHTML = `<p class="form-message">${error.message}</p>`;
  }
}

async function loadPost() {
  const target = $('#post-article');
  if (!target) return;
  const slug = new URLSearchParams(location.search).get('slug');
  try {
    const posts = await (await fetch('posts.json')).json();
    const post = posts.find((item) => item.slug === slug) || posts[0];
    document.title = `${post.title} | 푸드집배원`;
    target.innerHTML = `<div class="story-meta"><span>${post.category}</span><time>${post.date}</time></div>
      <h1>${post.title}</h1><img src="${post.image}" alt="${post.title}">
      <div class="article-body">${post.content.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>
      <a class="text-link" href="index.html">모든 이야기 보기 <span>→</span></a>`;
  } catch (error) { target.innerHTML = '<p class="form-message">글을 불러오지 못했습니다.</p>'; }
}

function setupForm() {
  const form = $('.inquiry-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    $('.form-message', form).textContent = '문의 내용이 준비되었습니다. 실제 운영 시 이메일 또는 폼 서비스 연결 후 발송할 수 있습니다.';
    form.reset();
  });
}

setupMenu();
loadProducts();
loadStories();
loadPost();
setupForm();
