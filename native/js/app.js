(() => {
  const $all = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const $one = (selector, parent = document) => parent.querySelector(selector);

  const initializePage = () => {
    // Remove captured Webflow runtime nodes after the native page has initialized.
    // Layout classes/data attributes remain intact because the native CSS uses them.
    document.querySelectorAll('script[src*="incode-transfer"], script[src*="gsap"], script[src*="ScrollTrigger"], script[src*="SplitText"]').forEach((script) => script.remove());
    // Replace the captured Incode mark with the supplied Hyper-I brand mark.
    const logoLink = document.querySelector('.navbar__logo');
    if (logoLink && !logoLink.querySelector('.hxi-header-logo')) {
      const logo = document.createElement('img');
      logo.className = 'hxi-header-logo';
      logo.src = 'assets/hyper-i-logo.png';
      logo.alt = 'Hyper-I';
      logoLink.replaceChildren(logo);
      logoLink.setAttribute('aria-label', 'Hyper-I home');
    }
    // Add the same Hyper-I mark to the footer and remove review-brand logos.
    const footer = document.querySelector('footer, .footer');
    const footerBrand = footer?.querySelector('.footer__logo');
    if (footerBrand && !footerBrand.classList.contains('hxi-footer-logo')) {
      const footerLogo = document.createElement('img');
      footerLogo.className = 'hxi-footer-logo';
      footerLogo.src = 'assets/hyper-i-logo.png';
      footerLogo.alt = 'Hyper-I';
      footerBrand.replaceWith(footerLogo);
    } else if (footer && !footer.querySelector('.hxi-footer-logo')) {
      const footerLogo = document.createElement('img');
      footerLogo.className = 'hxi-footer-logo'; footerLogo.src = 'assets/hyper-i-logo.png'; footerLogo.alt = 'Hyper-I';
      footer.prepend(footerLogo);
    }
    [...document.querySelectorAll('.footer__content-col')]
      .find((column) => column.querySelector('.footer__col-heading')?.textContent.trim().toLowerCase() === 'resources')
      ?.remove();
    document.querySelectorAll('.testimonials__slider img[alt*="logo" i], .testimonials__slider img[src*="Incode%20Reviews"], .testimonials__slider img[src*="Incode Reviews"]').forEach((image) => image.remove());
    // Update visible brand copy without rewriting external URLs or script payloads.
    document.querySelectorAll('body *:not(script):not(style)').forEach((element) => {
      element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && /incode/i.test(node.nodeValue)) node.nodeValue = node.nodeValue.replace(/incode/gi, 'Hyper-I');
      });
    });

    // Remove the captured partner-logo section from the native page.
    document.querySelector('.section__partners-grid')?.remove();
    [...document.querySelectorAll('.content__label-txt')]
      .find((label) => label.textContent.trim() === 'Built on trust')
      ?.closest('section')?.remove();
    [...document.querySelectorAll('.content__label-txt')]
      .find((label) => label.textContent.trim() === 'Use cases')
      ?.closest('section')?.classList.add('hxi-use-cases');

    // Rebuild Use Cases in an isolated section so captured Webflow card styles cannot leak in.
    const oldUseCases = document.querySelector('.hxi-use-cases');
    if (oldUseCases && !document.querySelector('.hxi-use-cases-clean')) {
      const title = oldUseCases.querySelector('.section__content-top--title')?.textContent.trim() || 'One platform, limitless applications';
      const description = oldUseCases.querySelector('.section__content-top--rich p')?.textContent.trim() || 'Incode powers every identity moment with zero friction and total trust.';
      const cards = [...oldUseCases.querySelectorAll('.bento__item-w-rive')];
      const clean = document.createElement('section');
      clean.className = 'hxi-use-cases-clean';
      clean.innerHTML = `<div class="hxi-use-cases-clean__inner"><div class="hxi-use-cases-clean__intro"><span>Use cases</span><h2>${title}</h2><p>${description}</p></div><div class="hxi-use-cases-clean__grid"></div></div>`;
      const grid = clean.querySelector('.hxi-use-cases-clean__grid');
      cards.forEach((card, index) => { const item = document.createElement('article'); item.className = 'hxi-use-cases-clean__card'; item.dataset.index = String(index + 1).padStart(2, '0'); item.append(card); grid.append(item); });
      oldUseCases.replaceWith(clean);
    }
    document.querySelector('.hxi-use-cases-clean')?.remove();

    // Replace the captured testimonial carousel with a clean, self-contained review section.
    const oldReviews = document.querySelector('.testimonials__slider')?.closest('section');
    if (oldReviews && !document.querySelector('.hxi-reviews-clean')) {
      const sourceCards = [...oldReviews.querySelectorAll('.card__testimonial')]
        .filter((card) => !card.classList.contains('slick-cloned'));
      const fallback = [
        ['“Hyper-I’s technology helps us fight fraud and deepfakes while keeping our customers protected.”', 'Renato Piparo', 'Chief Value Officer'],
        ['“Hyper-I gives us the extra layer of confidence we need to fight modern fraud without slowing down our customers.”', 'Aleksandar Jovic', 'Customer Operations Director'],
        ['“We rely on Hyper-I Identity Verification to protect our guests and keep every digital check-in secure.”', 'Tim Sheard', 'VP Partnerships'],
        ['“Hyper-I helps us orchestrate better technology and stronger fraud protection at every step.”', 'Hasan Azeem', 'COO']
      ];
      const reviews = document.createElement('section');
      reviews.className = 'hxi-reviews-clean';
      reviews.setAttribute('aria-labelledby', 'hxi-reviews-title');
      reviews.innerHTML = `<div class="hxi-reviews-clean__inner"><div class="hxi-reviews-clean__intro"><span class="hxi-reviews-clean__eyebrow">What our partners say</span><h2 id="hxi-reviews-title">Trust is built into every journey.</h2><p>Teams around the world use Hyper-I to make identity safer, faster, and remarkably simple.</p></div><div class="hxi-reviews-clean__viewport"><div class="hxi-reviews-clean__track"></div></div></div>`;
      const track = reviews.querySelector('.hxi-reviews-clean__track');
      const data = sourceCards.length ? sourceCards.map((card, index) => {
        const text = card.textContent.replace(/\s+/g, ' ').trim();
        const quote = card.querySelector('p, [class*="copy" i]')?.textContent.replace(/\s+/g, ' ').trim() || text;
        const person = card.querySelector('[class*="name" i], [class*="author" i]')?.textContent.replace(/\s+/g, ' ').trim() || `Customer ${String(index + 1).padStart(2, '0')}`;
        let role = card.querySelector('[class*="role" i], [class*="title" i]')?.textContent.replace(/\s+/g, ' ').trim() || 'Verified partner';
        let cleanPerson = person;
        if (role === 'Verified partner') {
          const split = person.match(/^(.*?)(?=(?:Co-founder|SVP|VP|Chief|COO|Head,|Director|Founder|Manager|Officer)\b)/i);
          if (split) { cleanPerson = split[1].trim(); role = person.slice(split[1].length).trim(); }
        }
        return [quote, cleanPerson, role];
      }) : fallback;
      data.forEach(([quote, person, role], index) => {
        const card = document.createElement('article');
        card.className = 'hxi-review-card';
        card.innerHTML = `<div class="hxi-review-card__top"><span class="hxi-review-card__rating">★★★★★</span><span class="hxi-review-card__index">0${index + 1}</span></div><p class="hxi-review-card__quote"></p><div class="hxi-review-card__person"><span class="hxi-review-card__identity"><strong></strong><small></small></span></div>`;
        card.querySelector('.hxi-review-card__quote').textContent = quote;
        card.querySelector('strong').textContent = person;
        card.querySelector('small').textContent = role;
        track.append(card);
      });
      oldReviews.replaceWith(reviews);
      const viewport = reviews.querySelector('.hxi-reviews-clean__viewport');
      const scrollTrack = reviews.querySelector('.hxi-reviews-clean__track');
      const cards = [...track.children];
      const controls = document.createElement('div');
      controls.className = 'hxi-reviews-clean__controls';
      controls.innerHTML = '<button type="button" aria-label="Previous review" data-review-direction="-1">←</button><div class="hxi-reviews-clean__dots"></div><button type="button" aria-label="Next review" data-review-direction="1">→</button>';
      reviews.querySelector('.hxi-reviews-clean__inner').append(controls);
      const dots = controls.querySelector('.hxi-reviews-clean__dots');
      const dotCount = Math.min(3, cards.length);
      for (let index = 0; index < dotCount; index += 1) { const dot = document.createElement('i'); dot.className = index === 0 ? 'is-active' : ''; dots.append(dot); }
      controls.querySelectorAll('[data-review-direction]').forEach((button) => button.addEventListener('click', () => scrollTrack.scrollBy({ left: Number(button.dataset.reviewDirection) * ((cards[0]?.getBoundingClientRect().width || 360) + 20), behavior: 'smooth' })));
      scrollTrack.addEventListener('scroll', () => { const step = (cards[0]?.getBoundingClientRect().width || 360) + 20; const cardIndex = Math.min(cards.length - 1, Math.round(scrollTrack.scrollLeft / step)); const active = dotCount <= 1 ? 0 : Math.min(dotCount - 1, Math.round(cardIndex * (dotCount - 1) / Math.max(1, cards.length - 1))); [...dots.children].forEach((dot, index) => dot.classList.toggle('is-active', index === active)); }, { passive: true });
    }

    // Scope the visual refresh to the AI-security benefits section.
    const benefitsTitle = [...document.querySelectorAll('.section__content-top--title')]
      .find((title) => title.textContent.trim() === 'Your AI-driven security challenges, solved');
    const benefitsSection = benefitsTitle?.closest('section');
    if (benefitsSection && !benefitsSection.classList.contains('hxi-benefits-premium')) {
      const sourceCards = [...benefitsSection.querySelectorAll('.content__card-featured')];
      const cards = sourceCards.map((card, index) => ({
        title: card.querySelector('.content__copy--big')?.textContent.trim() || ['Eliminate fraud', 'Stay ahead of new threats', 'Optimize conversion'][index],
        body: card.querySelector('.card__featured-rich')?.textContent.replace(/\s+/g, ' ').trim() || '',
        icon: card.querySelector('img')?.getAttribute('src') || ''
      }));
      benefitsSection.classList.add('hxi-benefits-premium');
      benefitsSection.innerHTML = `<div class="hxi-benefits-premium__inner"><div class="hxi-benefits-premium__intro"><span class="hxi-benefits-premium__eyebrow">Benefits</span><h2>Your AI-driven security challenges, solved.</h2><p>Safeguard trust with intelligent identity verification that protects every transaction and keeps your users moving.</p></div><div class="hxi-benefits-premium__layout"><div class="hxi-benefits-premium__statement"><span class="hxi-benefits-premium__mark">01</span><h3>One secure layer for every identity moment.</h3><p>From first touch to long-term trust, Hyper-I combines biometrics, intelligence, and automation in one seamless experience.</p><a href="#hxi-hero">Explore the platform <span>↗</span></a></div><div class="hxi-benefits-premium__grid"></div></div></div>`;
      const grid = benefitsSection.querySelector('.hxi-benefits-premium__grid');
      (cards.length ? cards : [{ title: 'Eliminate fraud', body: 'Keep bad actors out with advanced AI-powered prevention.' }, { title: 'Stay ahead of new threats', body: 'Anticipate and defeat deepfakes with continuously evolving models.' }, { title: 'Optimize conversion', body: 'Give users effortless, seamless, and secure verification.' }]).forEach((card, index) => {
        const item = document.createElement('article'); item.className = 'hxi-benefits-premium__card'; item.innerHTML = `<span class="hxi-benefits-premium__number">${String(index + 1).padStart(2, '0')}</span><div class="hxi-benefits-premium__icon">${card.icon ? `<img src="${card.icon}" alt="">` : '✦'}</div><h3></h3><p></p><span class="hxi-benefits-premium__arrow">↗</span>`;
        item.querySelector('h3').textContent = card.title; item.querySelector('p').textContent = card.body; grid.append(item);
      });
    }

    // Present the trust-check total as a prominent, animated counter beside its copy.
    const trustTitle = [...document.querySelectorAll('.section__content-top--title')]
      .find((title) => title.textContent.trim() === '7.1B+ trust checks');
    const trustSection = trustTitle?.closest('section');
    if (trustSection && !trustSection.querySelector('.hxi-trust-counter')) {
      trustSection.classList.add('hxi-trust-checks');
      trustSection.querySelector('.c-section__flex-block--grid')?.remove();
      const counter = document.createElement('div');
      counter.className = 'hxi-trust-counter';
      counter.setAttribute('aria-label', 'Leading organizations secured');
      counter.innerHTML = '<div class="hxi-trust-counter__item"><strong>8/10<br>top banks</strong><span>in the United States</span></div><div class="hxi-trust-counter__item"><strong>8/9<br>top telcos</strong><span>in the United States</span></div><div class="hxi-trust-counter__item"><strong>3/3<br>top neobanks</strong><span>in the World</span></div><div class="hxi-trust-counter__item"><strong>4/5<br>top marketplaces</strong><span>in the World</span></div>';
      const trustRow = trustSection.querySelector('.c-section__flex-block--horizontal');
      if (trustRow) {
        trustRow.append(counter);
        trustRow.style.setProperty('display', 'grid', 'important');
        trustRow.style.setProperty('grid-template-columns', 'minmax(0, 1fr) minmax(360px, .8fr)', 'important');
        trustRow.style.setProperty('align-items', 'center', 'important');
      }
    }
    const hyperHero = document.querySelector('#hxi-hero');
    // Add the platform orchestration section inspired by the reference platform page.
    if (hyperHero && !document.querySelector('.hxi-orchestration')) {
      const orchestration = document.createElement('section');
      orchestration.className = 'hxi-orchestration';
      orchestration.innerHTML = `<div class="hxi-orchestration__inner"><div class="hxi-orchestration__copy"><span class="hxi-orchestration__eyebrow">End-to-end identity verification</span><h2>Hyper-I Identity Orchestration Platform</h2><p>Eliminate duplicate tools and access end-to-end orchestration in one place.</p><a class="hxi-orchestration__cta" href="#hxi-hero">Get started <span>↗</span></a></div><div class="hxi-orchestration__map" aria-label="Hyper-I identity orchestration platform layers"><div class="hxi-orchestration__core">Hyper-I</div><div class="hxi-orchestration__ring hxi-ring-data"><b>Data</b><span>Government data &amp; biometrics</span><span>Business entities</span></div><div class="hxi-orchestration__ring hxi-ring-ai"><b>AI / Technology</b><span>Document verification</span><span>Fraud intelligence</span><span>Face recognition</span></div><div class="hxi-orchestration__ring hxi-ring-enterprise"><b>Enterprise Platform</b><span>No-code orchestration</span><span>Reporting &amp; analytics</span><span>Adaptive workflows</span></div><div class="hxi-orchestration__ring hxi-ring-apps"><b>Applications</b><span>Identity verification</span><span>KYC / KYB</span><span>Continuous monitoring</span></div></div></div></section>`;
      hyperHero.insertAdjacentElement('afterend', orchestration);
      const workflowValues = document.createElement('section');
      workflowValues.className = 'hxi-workflow-values';
      workflowValues.innerHTML = `<div class="hxi-workflow-values__inner"><div class="hxi-workflow-values__intro"><span>Workflows Values</span><h2>Unlock the Core Benefits of Hyper-I Workflows</h2><a href="#hxi-hero">Request a demo <b>↗</b></a></div><div class="hxi-workflow-values__grid"><article><i>◉</i><h3>Reduce operational costs</h3><p>Automate verification tasks and eliminate manual reviews, lowering operational overhead while keeping accuracy high.</p></article><article><i>♙</i><h3>Improve conversion &amp; UX</h3><p>Design smoother verification paths that minimize friction and adapt to each user, boosting completion rates globally.</p></article><article><i>⌁</i><h3>Strengthen fraud defense</h3><p>Combine biometrics, liveness, documents, and risk signals in one flow to stop fraud earlier and reduce false approvals.</p></article><article><i>◎</i><h3>Accelerate time to market</h3><p>Launch verification flows instantly with no code and update them in real time, keeping your teams fast and agile.</p></article><article><i>♜</i><h3>Maintain global compliance</h3><p>Keep pace with evolving regulations through adaptable, up-to-date workflows that adjust instantly to new rules.</p></article><article><i>✦</i><h3>Scale confidently across regions</h3><p>Expand to new markets with localized flows, regulatory presets, and integrations that support global verification needs.</p></article></div></div>`;
      orchestration.insertAdjacentElement('afterend', workflowValues);
    }

    // Insert the Hyper-I feature story immediately after the Hyper-I hero.
    if (hyperHero && !document.querySelector('.feature-story')) {
      hyperHero.dataset.hxiFeatureLoading = 'true';
      fetch('../hyper-i/index.html')
        .then((response) => response.ok ? response.text() : Promise.reject(new Error('Hyper-I source unavailable.')))
        .then((source) => {
          const sourceDocument = new DOMParser().parseFromString(source, 'text/html');
          const sourceSection = sourceDocument.querySelector('.feature-story');
          const sourceStyle = sourceDocument.querySelector('style');
          if (!sourceSection || !sourceStyle) throw new Error('Feature Story not found in Hyper-I.');
          sourceSection.classList.add('hxi-feature-story');
          const css = sourceStyle.textContent;
          const start = css.indexOf('.sidebar-anim');
          const end = css.indexOf('/* ---------- Horizontal Scroll Section ---------- */');
          const importedStyle = document.createElement('style');
          importedStyle.id = 'hyper-i-feature-story-styles';
          importedStyle.textContent = `:root{--canvas:#fff;--heading:#171717;--body-subtle:#666;--body-text:#333;--panel:#f3f5f8;--accent:#0a4fdf;--ring-color:#b7c5e1;} ${css.slice(start, end)}`;
          document.head.append(importedStyle);
          hyperHero.insertAdjacentElement('afterend', document.importNode(sourceSection, true));
          const featureIcon = document.querySelector('.hxi-feature-story .sidebar-anim');
          if (featureIcon) featureIcon.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.5 27 8v7.2c0 6.4-4.4 11.1-11 13.3C9.4 26.3 5 21.6 5 15.2V8l11-4.5Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11.5 16.2c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5M13 20c.8.9 1.8 1.4 3 1.4s2.2-.5 3-1.4M16 8.8v2.9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
          const observer = new IntersectionObserver((entries, instance) => entries.forEach((entry) => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); instance.unobserve(entry.target); }
          }), { threshold: 0.12 });
          document.querySelectorAll('.feature-story .fs-story').forEach((story) => observer.observe(story));
        })
        .catch((error) => console.error(error));
    }
    if (hyperHero && !hyperHero.dataset.hxiFeatureLoading && !document.querySelector('.hxi-feature-story')) {
      hyperHero.insertAdjacentHTML('afterend', `
        <section class="hxi-feature-story" aria-labelledby="hxi-feature-title">
          <div class="hxi-feature-story__inner">
            <aside class="hxi-feature-story__sidebar">
              <div class="hxi-feature-story__icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 3.5 27 8v7.2c0 6.4-4.4 11.1-11 13.3C9.4 26.3 5 21.6 5 15.2V8l11-4.5Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11.5 16.2c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5M13 20c.8.9 1.8 1.4 3 1.4s2.2-.5 3-1.4M16 8.8v2.9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>
              <p class="hxi-feature-story__eyebrow">Hyper-I platform</p>
              <h2 id="hxi-feature-title">The future of identity is touchless and instantaneous.</h2>
              <p>Hyper-I provides a complete suite of AI-driven biometric and document verification tools to onboard users, prevent fraud, and ensure compliance without compromising the user experience.</p>
              <nav class="hxi-feature-story__nav" aria-label="Platform features"><a href="#hxi-biometrics">Face Biometrics</a><a href="#hxi-liveness">Liveness &amp; Deepfakes</a><a href="#hxi-ocr">Document OCR</a><a href="#hxi-fraud">Fraud Intelligence</a><a href="#hxi-age">Age Verification</a></nav>
            </aside>
            <div class="hxi-feature-story__items">
              <article class="hxi-feature-card" id="hxi-biometrics"><div class="hxi-feature-card__visual hxi-visual--biometrics"><span>Left Iris: Scanned</span><strong>◎</strong><span>Match: 99.98%</span></div><h3>3D Face Biometrics</h3><p>Verify users instantly with enterprise-grade facial recognition that maps millions of data points for precise, touchless matching in under two seconds.</p><small>Touchless · High Accuracy · &lt;2s Match</small></article>
              <article class="hxi-feature-card" id="hxi-liveness"><div class="hxi-feature-card__visual hxi-visual--liveness"><div><b>Active Liveness Check</b><em>● Live</em><label>Deepfake Score <strong>0.01%</strong></label><i><u></u></i><label>Presentation Attack <strong>Clear</strong></label><i><u></u></i></div></div><h3>Anti-Spoofing &amp; Deepfake Defense</h3><p>Defeat presentation attacks, printed masks, and deepfakes with advanced active and passive liveness checks powered by generative AI detection.</p><small>ISO 30107-3 Certified · iBeta Level 2</small></article>
              <article class="hxi-feature-card" id="hxi-ocr"><div class="hxi-feature-card__visual hxi-visual--ocr"><span>Hologram: Valid</span><div><b>Driver’s License</b><i></i><i></i><i></i></div><span>MRZ: Extracted</span></div><h3>Document Verification (OCR)</h3><p>Automatically extract and validate data from 10,000+ global ID types, passports, and driver’s licenses with instant security checks.</p><small>10,000+ IDs · Global Coverage · Instant Extraction</small></article>
              <article class="hxi-feature-card" id="hxi-fraud"><div class="hxi-feature-card__visual hxi-visual--fraud"><b>Network Status: Secure</b><span>AML Checked</span><span>KYC Validated</span><span>PEP Cleared</span></div><h3>Fraud Intelligence Network</h3><p>Cross-reference identities against global watchlists, PEPs, and sanctions in real time to detect synthetic identities and stop fraud rings.</p><small>AML/KYC · Sanctions Watchlists · Real-time</small></article>
              <article class="hxi-feature-card" id="hxi-age"><div class="hxi-feature-card__visual hxi-visual--age"><strong>18+<small>VERIFIED</small></strong><strong>21+<small>LOCKED</small></strong></div><h3>Seamless Age Verification</h3><p>Ensure compliance for gaming, gambling, and age-gated commerce without unnecessary friction or physical ID uploads.</p><small>GDPR Compliant · Frictionless · Age Estimation</small></article>
            </div>
          </div>
        </section>`);
    }
    // 1. Mobile navigation menu toggle
    const navbar = $one('.nav, .navbar');
    const menuBtn = $one('.navbar__menu-btn, .w-nav-button');
    if (navbar && menuBtn) {
      menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = navbar.classList.toggle('is-menu-open');
        menuBtn.classList.toggle('is-open', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
      });
    }

    // 2. Dropdown menus in Navigation Bar
    const dropdownContainers = $all('.navbar__dropdown, .w-dropdown');

    dropdownContainers.forEach((container) => {
      const toggle = $one('.navbar__link, .w-dropdown-toggle, .navbar__dropdown-toggle', container);
      const content = $one('.navbar__dropdown--content-wrap, .navbar__dropdown-content, .w-dropdown-list', container);

      if (!toggle || !content) return;

      const openDropdown = () => {
        // Close all other open dropdowns first
        dropdownContainers.forEach((other) => {
          if (other !== container) {
            other.classList.remove('is-open', 'w--open');
            const otherContent = $one('.navbar__dropdown--content-wrap, .navbar__dropdown-content, .w-dropdown-list', other);
            if (otherContent) {
              otherContent.classList.remove('is-open', 'w--open', 'u-visible');
              otherContent.style.display = 'none';
            }
          }
        });

        const nowOpen = container.classList.toggle('is-open');
        container.classList.toggle('w--open', nowOpen);
        content.classList.toggle('is-open', nowOpen);
        content.classList.toggle('w--open', nowOpen);
        content.classList.toggle('u-visible', nowOpen);
        content.style.display = nowOpen ? 'block' : 'none';
      };

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openDropdown();
      });

      // Optional hover for desktop screens
      container.addEventListener('mouseenter', () => {
        if (window.innerWidth > 991) {
          container.classList.add('is-open', 'w--open');
          content.classList.add('is-open', 'w--open', 'u-visible');
          content.style.display = 'block';
        }
      });

      container.addEventListener('mouseleave', () => {
        if (window.innerWidth > 991) {
          container.classList.remove('is-open', 'w--open');
          content.classList.remove('is-open', 'w--open', 'u-visible');
          content.style.display = 'none';
        }
      });
    });

    // Close open dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav, .navbar')) {
        dropdownContainers.forEach((container) => {
          container.classList.remove('is-open', 'w--open');
          const content = $one('.navbar__dropdown--content-wrap, .navbar__dropdown-content, .w-dropdown-list', container);
          if (content) {
            content.classList.remove('is-open', 'w--open', 'u-visible');
            content.style.display = 'none';
          }
        });
      }
    });

    // 3. Tab switching (e.g. Bento grid section / Orchestration / Platform tabs)
    const tabButtons = $all('[role="tab"], .w-tab-link');
    tabButtons.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabList = tab.closest('[role="tablist"], .w-tab-menu') || tab.parentElement;
        if (!tabList) return;

        const allTabsInList = $all('[role="tab"], .w-tab-link', tabList);
        const targetId = tab.getAttribute('aria-controls') || tab.getAttribute('data-w-tab') || tab.getAttribute('data-tab-target');

        allTabsInList.forEach((item) => {
          const isSelected = item === tab;
          item.classList.toggle('w--current', isSelected);
          item.classList.toggle('is-active', isSelected);
          item.setAttribute('aria-selected', String(isSelected));
        });

        if (targetId) {
          const panels = $all('[role="tabpanel"], .w-tab-pane');
          panels.forEach((panel) => {
            const isMatch = panel.id === targetId || panel.getAttribute('data-w-tab') === targetId;
            panel.hidden = !isMatch;
            panel.style.display = isMatch ? 'block' : 'none';
            panel.classList.toggle('w--tab-active', isMatch);
          });
        }
      });
    });

    // 4. Campaign / Announcement Banner Close button
    const closeBtns = $all('[data-dismiss="icdCampaignWrap"], .navbar__info-close, .close');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const banner = btn.closest('.navbar__info, .intro, .campaign-banner');
        if (banner) {
          banner.style.display = 'none';
        }
      });
    });

    // 5. Scroll Reveal Animations (IntersectionObserver)
    const animElements = $all('.animated, [anim-wrapper] > *, [class*="card__"], .partners__list-item');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible', 'start');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });

      animElements.forEach((el) => observer.observe(el));
    } else {
      animElements.forEach((el) => el.classList.add('is-visible', 'start'));
    }
  };

  // Run whether this script loads before or after DOMContentLoaded.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage, { once: true });
  } else {
    initializePage();
  }
})();
