document.addEventListener('DOMContentLoaded', () => {
  initNavHighlight();
  initPackagesPage();
  initBookingPage();
  initGalleryPage();
});

function initNavHighlight(){
  const navLinks = document.querySelectorAll('nav a');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
    if (link.hash) link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector(link.hash).scrollIntoView({ behavior: 'smooth' });
    });
  });
}

const PACKAGES = [
  { id: 'maldives', name:'Maldives Escape', destination: 'Maldives', durationDays: 7, basePrice: 1200, season: 'summer' },
  { id: 'himalayas', name:'Himalayan Adventure', destination: 'Himalayas', durationDays: 10, basePrice: 1500, season: 'winter' },
  { id: 'europe', name:'Europe Cultural', destination: 'Europe', durationDays: 14, basePrice: 2200, season: 'autumn' },
  { id: 'dubai', name:'Dubai Quick Trip', destination: 'Dubai', durationDays: 5, basePrice: 800, season: 'summer' }
];

function computeFinalPrice(pkg){
  let price = pkg.basePrice;
  switch(pkg.season){
    case 'summer': price *= 1.10; break;
    case 'winter': price *= 1.15; break;
    case 'autumn': price *= 1.08; break;
    default: price *= 1.00;
  }
  return Number(price.toFixed(2));
}

function initPackagesPage(){
  const tbody = document.getElementById('packages-table-body');
  if (!tbody) return;
  renderPackagesTable(tbody);
}

function renderPackagesTable(tbody){
  tbody.innerHTML = '';
  PACKAGES.forEach(pkg => {
    const finalPrice = computeFinalPrice(pkg);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="small">${pkg.name}</td>
      <td>${pkg.destination}</td>
      <td>${pkg.durationDays} Days</td>
      <td>$${pkg.basePrice.toFixed(2)}</td>
      <td>$${finalPrice.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initBookingPage(){
  const form = document.getElementById('booking-form');
  if (!form) return;
  const packageSelect = document.getElementById('package-select');
  if (packageSelect){
    const placeholder = packageSelect.querySelector('option[value=""]');
    packageSelect.innerHTML = '';
    packageSelect.appendChild(placeholder || document.createElement('option'));
    if (!placeholder) {
      const ph = document.createElement('option'); ph.value=''; ph.text='--Select a package--'; ph.disabled=true; ph.selected=true;
      packageSelect.appendChild(ph);
    }
    PACKAGES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} — ${p.durationDays}d — $${p.basePrice}`;
      packageSelect.appendChild(opt);
    });
  }

  const checkInInput = document.getElementById('checkIn');
  const checkOutInput = document.getElementById('checkOut');
  const guestsInput = document.getElementById('guests');
  const promoCodeInput = document.getElementById('promoCode');
  const totalSpan = document.getElementById('estimated-total');
  const submitBtn = document.getElementById('submit-btn');

  ['change','input'].forEach(evt => {
    form.addEventListener(evt, calculateAndUpdate);
  });

  calculateAndUpdate();

  function calculateAndUpdate(){
    const result = calculateEstimate();
    totalSpan.textContent = formatCurrency(result.total);
    const valid = result.valid;
    submitBtn.disabled = !valid;
  }

  function calculateEstimate(){
    const name = form.querySelector('#name')?.value.trim();
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    const guests = Number(guestsInput.value) || 0;
    const packageId = packageSelect.value;
    const promo = (promoCodeInput.value || '').trim().toUpperCase();

    let valid = true;
    if (!name) valid = false;
    if (!packageId) valid = false;
    if (!checkInInput.value || !checkOutInput.value) valid = false;

    let nights = 0;
    if (checkInInput.value && checkOutInput.value){
      nights = Math.round((checkOut - checkIn) / (1000*60*60*24));
      if (nights <= 0) valid = false;
    } else {
      nights = 0;
    }

    const pkg = PACKAGES.find(p => p.id === packageId);
    if (!pkg) { return { total:0, valid:false }; }

    const perNightBase = pkg.basePrice / Math.max(1, pkg.durationDays);
    let subtotal = perNightBase * Math.max(1, nights);

    let guestMultiplier = 1;
    if (guests > 2){
      const extra = guests - 2;
      guestMultiplier += 0.20 * extra;
    }

    subtotal *= guestMultiplier;

    let weekendSurcharge = 0;
    if (nights > 0){
      for (let i=0;i<nights;i++){
        const d = new Date(checkIn);
        d.setDate(checkIn.getDate() + i);
        const day = d.getDay();
        if (day === 0 || day === 6){ weekendSurcharge = 0.10; break; }
      }
    }
    subtotal *= (1 + weekendSurcharge);

    let seasonMultiplier = 1;
    switch(pkg.season){
      case 'summer': seasonMultiplier = 1.10; break;
      case 'winter': seasonMultiplier = 1.15; break;
      case 'autumn': seasonMultiplier = 1.08; break;
      default: seasonMultiplier = 1.00;
    }
    subtotal *= seasonMultiplier;

    let discount = 0;
    switch(promo){
      case 'EARLYBIRD': discount = 0.10; break;
      case 'FESTIVE': discount = 0.15; break;
      case 'STUDENT': discount = 0.07; break;
      default: discount = 0;
    }
    subtotal *= (1 - discount);

    const total = Number(subtotal.toFixed(2));
    const finalValid = valid && nights > 0 && guests >= 1;

    return { total, nights, valid: finalValid, breakdown: { perNightBase, guestMultiplier, weekendSurcharge, seasonMultiplier, discount } };
  }

  function formatCurrency(num){
    return `$${Number(num).toFixed(2)}`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const estimate = calculateEstimate();
    if (!estimate.valid){
      alert('Please fill required fields correctly. Nights must be > 0.');
      return;
    }
    alert(`Booking ready!\nEstimated total: ${formatCurrency(estimate.total)}\nNights: ${estimate.nights}`);
  });
}

function initGalleryPage(){
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const closeBtn = modal?.querySelector('.close');

  const imgs = gallery.querySelectorAll('img[data-large]');
  imgs.forEach(img => {
    const captionEl = img.closest('.card')?.querySelector('.card-caption');
    const captionText = captionEl ? captionEl.textContent.trim() : img.alt || '';
    if (!img.title && captionText) img.title = captionText;
    img.addEventListener('click', () => {
      if (!modal || !modalImg) return;
      modal.style.display = 'flex';
      modalImg.src = img.getAttribute('data-large');
      modalImg.alt = img.alt || captionText;
      modalImg.style.boxShadow = '0 18px 60px rgba(0,0,0,.6)';
    });
  });

  if (closeBtn){
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      modal.querySelector('img')?.setAttribute('src','');
    });
  }

  window.addEventListener('click', (ev) => {
    if (ev.target === modal){
      modal.style.display = 'none';
      modal.querySelector('img')?.setAttribute('src','');
    }
  });

  const toggle = document.createElement('button');
  toggle.textContent = 'Toggle Layout';
  toggle.className = 'badge';
  toggle.style.marginBottom = '10px';
  gallery.parentNode.insertBefore(toggle, gallery);
  let isGrid = true;
  toggle.addEventListener('click', () => {
    isGrid = !isGrid;
    if (isGrid){
      gallery.style.display = 'grid';
      gallery.style.gridTemplateColumns = 'repeat(auto-fit,minmax(200px,1fr))';
    } else {
      gallery.style.display = 'block';
      gallery.querySelectorAll('.card').forEach(c => c.style.display = 'flex');
      gallery.querySelectorAll('.card img').forEach(i => i.style.width = '220px');
      gallery.querySelectorAll('.card').forEach(c => {
        c.style.flexDirection = 'row';
        c.querySelector('.card-caption').style.padding = '14px';
      });
    }
  });
}
