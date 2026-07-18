document.addEventListener("DOMContentLoaded", () => {
  // Detect current directory to adjust paths
  const pathname = window.location.pathname.toLowerCase();
  // Check if we're inside the blog directory (e.g., /blog/page.html)
  const isInBlogDirectory = 
    pathname.includes("/blog/") || 
    pathname.includes("\\blog\\") ||
    (pathname.includes("/blog") && !pathname.endsWith("/blog.html")) ||
    (pathname.includes("\\blog") && !pathname.endsWith("\\blog.html"));
  const pathPrefix = isInBlogDirectory ? "../" : "";

  // 1. STICKY HEADER & SCROLL SPY
  const header = document.getElementById("header");
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".main-nav ul li a");

  window.addEventListener("scroll", () => {
    // Sticky Header
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Scroll Spy (Active Links)
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= sectionTop - 150) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").includes(current) && current !== "") {
        link.classList.add("active");
      }
    });
  });

  // 2. MOBILE MENU TOGGLE
  const menuBtn = document.getElementById("menuBtn");
  const mainNav = document.getElementById("mainNav");

  if (menuBtn && mainNav) {
    menuBtn.addEventListener("click", () => {
      mainNav.classList.toggle("active");
    });

    // Close menu when clicking a link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("active");
      });
    });
  }

  // 3. SMOOTH SCROLLING FOR IN-PAGE ANCHORS
  document.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href) return;

      // Extract hash and path
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const hash = href.substring(hashIndex);
      if (hash === "#" || hash === "") return;

      const path = href.substring(0, hashIndex);
      
      // Determine if path points to current page
      const currentPath = window.location.pathname;
      const cleanPath = path.replace(/^\/index\.html/, '').replace(/^\//, '');
      const cleanCurrentPath = currentPath.replace(/^\/index\.html/, '').replace(/^\//, '');

      if (cleanPath === "" || cleanPath === cleanCurrentPath) {
        try {
          const targetElement = document.querySelector(hash);
          if (targetElement) {
            e.preventDefault();
            
            // Smooth scroll
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });

            // Update URL hash without jumping
            window.history.pushState(null, null, hash);
          }
        } catch (err) {
          // Fallback if querySelector throws on invalid selectors
        }
      }
    });
  });

  // 4. RENDER ARTICLES WITH PAGINATION & FILTERING
  const articlesContainer = document.getElementById("articlesContainer");
  if (articlesContainer) {
    let filteredArticles = [...articles];
    let currentPage = 1;
    const itemsPerPage = 9;
    const isHomePage = document.getElementById("home") !== null;

    const renderArticles = () => {
      let articlesHTML = "";

      let displayArticles = filteredArticles;

      if (isHomePage) {
        displayArticles = filteredArticles.slice(0, 3);
      } else {
        const startIndex = (currentPage - 1) * itemsPerPage;
        displayArticles = filteredArticles.slice(
          startIndex,
          startIndex + itemsPerPage,
        );
      }

      if (displayArticles.length === 0) {
        articlesContainer.innerHTML =
          '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; font-size: 18px; color: var(--text-body);">لا توجد مقالات تطابق بحثك.</div>';
        renderPagination();
        return;
      }

      displayArticles.forEach((article) => {
        articlesHTML += `
                    <article class="article-card">
                        <div class="article-img">
                            <img src="${pathPrefix}${article.image}" alt="${article.title}" loading="lazy" decoding="async" width="400" height="250">
                        </div>
                        <div class="article-content">
                            <span class="article-category">${article.category}</span>
                            <h3 class="article-title"><a href="${pathPrefix}blog/${article.slug}.html" style="color:inherit; text-decoration:none;">${article.title}</a></h3>
                            <p class="article-desc">${article.excerpt}</p>
                            <div class="article-bottom" style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                                <div class="article-date">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span>${article.date}</span>
                                </div>
                                <a href="${pathPrefix}blog/${article.slug}.html" class="read-more-link">اقرأ المقال <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></a>
                            </div>
                        </div>
                    </article>
                `;
      });

      articlesContainer.innerHTML = articlesHTML;
      if (!isHomePage) renderPagination();
    };

    const renderPagination = () => {
      const paginationContainer = document.getElementById("blogPagination");
      if (!paginationContainer) return;

      const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
      let paginationHTML = "";

      if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
          const activeClass = i === currentPage ? "active" : "";
          const inlineStyle = activeClass
            ? "background-color: var(--primary); color: white; border: none;"
            : "background-color: white; color: var(--primary); border: 1px solid var(--border-color);";
          paginationHTML += `
                        <button class="page-btn" data-page="${i}" style="width: 40px; height: 40px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s; ${inlineStyle}">${i}</button>
                    `;
        }
      }
      paginationContainer.innerHTML = paginationHTML;

      // Add events
      document.querySelectorAll(".page-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          currentPage = parseInt(e.target.getAttribute("data-page"));
          renderArticles();
          window.scrollTo({
            top: document.querySelector(".articles").offsetTop - 100,
            behavior: "smooth",
          });
        });
      });
    };

    const searchInput = document.getElementById("blogSearch");
    const categorySelect = document.getElementById("blogCategory");

    const filterArticles = () => {
      let searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
      let category = categorySelect ? categorySelect.value : "all";

      filteredArticles = articles.filter((article) => {
        const matchesSearch =
          article.title.toLowerCase().includes(searchTerm) ||
          article.excerpt.toLowerCase().includes(searchTerm);
        const matchesCategory =
          category === "all" || article.category === category;
        return matchesSearch && matchesCategory;
      });

      currentPage = 1;
      renderArticles();
    };

    if (searchInput) searchInput.addEventListener("input", filterArticles);
    if (categorySelect)
      categorySelect.addEventListener("change", filterArticles);

    // Initial render
    renderArticles();
  }

  // 5. WHATSAPP FORM SUBMISSION (for both homepage and article forms)
  const handleFormSubmit = (form, idPrefix) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get form values (handle both id prefixes: "user" for homepage, "art" for articles)
      const nameInput = document.getElementById(idPrefix + "Name");
      const phoneInput = document.getElementById(idPrefix + "Phone");
      const serviceInput = document.getElementById(idPrefix === "user" ? "serviceType" : idPrefix + "Service");
      const messageInput = document.getElementById(idPrefix === "user" ? "userMessage" : idPrefix + "Message");
      
      const name = nameInput?.value.trim() || "";
      const phone = phoneInput?.value.trim() || "";
      const service = serviceInput?.value || "";
      const message = messageInput?.value.trim() || "";

      // Validate basic inputs
      if (!name || !phone || !service) {
        alert("يرجى تعبئة الحقول المطلوبة.");
        return;
      }

      // Validate privacy consent
      const consentChecked = document.getElementById("privacyConsent");
      if (consentChecked && !consentChecked.checked) {
        alert("يرجى الموافقة على معالجة البيانات وسياسة الخصوصية للمتابعة.");
        return;
      }

      // Target Phone Number (Without '+' or '00', just country code + number)
      const targetWhatsApp = "201065696741";

      // Format message
      const formattedMessage = `الاسم: ${name}\nرقم الهاتف: ${phone}\nنوع الخدمة: ${service}\nالرسالة: ${message || "لا توجد تفاصيل إضافية."}`;

      // Encode URI component
      const encodedMessage = encodeURIComponent(formattedMessage);

      // Generate WhatsApp URL
      const whatsappURL = `https://wa.me/${targetWhatsApp}?text=${encodedMessage}`;

      // Open in new tab
      window.open(whatsappURL, "_blank");

      // Optional: Reset form
      form.reset();
    });
  };

  // Handle homepage form
  const whatsappForm = document.getElementById("whatsappForm");
  if (whatsappForm) {
    handleFormSubmit(whatsappForm, "user");
  }

  // Handle article forms
  const articleContactForm = document.getElementById("articleContactForm");
  if (articleContactForm) {
    handleFormSubmit(articleContactForm, "art");
  }

  // 6. FLOATING CONTACT WIDGET AND EXTENDED LOGIC
  const createFloatingWidget = () => {
    const widgetHTML = `
            <div class="floating-contact-widget hero-state" id="floatingContact">
                <a href="https://wa.me/201065696741" target="_blank" class="fc-card fc-card-whatsapp whatsapp-btn mobile-whatsapp floating-whatsapp contact-whatsapp">
                    <div class="fc-normal">
                        <svg class="fc-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span class="fc-title">واتساب</span>
                    </div>
                    <div class="fc-hover">
                        <svg class="fc-hover-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span class="fc-info">01065696741</span>
                    </div>
                </a>
                <a href="tel:201065696741" class="fc-card fc-card-phone">
                    <div class="fc-normal">
                        <svg class="fc-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span class="fc-title">اتصال</span>
                    </div>
                    <div class="fc-hover">
                        <svg class="fc-hover-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <span class="fc-info">01065696741</span>
                    </div>
                </a>
                <a href="mailto:lawerhany22@gmail.com" class="fc-card fc-card-email">
                    <div class="fc-normal">
                        <svg class="fc-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span class="fc-title">البريد</span>
                    </div>
                    <div class="fc-hover">
                        <svg class="fc-hover-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <span class="fc-info" style="font-size: 13px; letter-spacing: 0;">lawerhany22@gmail.com</span>
                    </div>
                </a>
            </div>
            
            <button id="backToTop" class="back-to-top" aria-label="العودة للأعلى">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
            
            <div class="mobile-bottom-bar" id="mobileContactBar">
                <a href="https://wa.me/201065696741" target="_blank" class="mb-item whatsapp-btn mobile-whatsapp floating-whatsapp contact-whatsapp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    <span>واتساب</span>
                </a>
                <a href="tel:01065696741" class="mb-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span>اتصال</span>
                </a>
                <a href="mailto:lawerhany22@gmail.com" class="mb-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <span>البريد</span>
                </a>
            </div>
        `;
    document.body.insertAdjacentHTML("beforeend", widgetHTML);

    const desktopWidget = document.getElementById("floatingContact");
    const mobileWidget = document.getElementById("mobileContactBar");
    const backToTopBtn = document.getElementById("backToTop");

    // fc-card touch support
    const fcCards = document.querySelectorAll(".fc-card");
    fcCards.forEach((card) => {
      card.addEventListener(
        "touchstart",
        function (e) {
          // Let native active state handle it if CSS manages it
        },
        { passive: true },
      );
    });

    const handleScroll = () => {
      const heroSection = document.getElementById("home");
      let heroHeight = 100;
      if (heroSection) heroHeight = heroSection.offsetHeight;

      if (window.scrollY > heroHeight) {
        // Scrolled past Hero
        desktopWidget.classList.remove("hero-state");
        desktopWidget.classList.add("mini-state");
      } else {
        // Inside Hero
        desktopWidget.classList.add("hero-state");
        desktopWidget.classList.remove("mini-state");
      }

      // Back to top button visibility
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger initially
    handleScroll();

    // Set up Back to Top actions
    const scrollUp = (e) => {
      if (e) e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (backToTopBtn) backToTopBtn.addEventListener("click", scrollUp);
    const mbBack = document.getElementById("mbBackToTop");
    if (mbBack) mbBack.addEventListener("click", scrollUp);
  };
  createFloatingWidget();

  // 7. ANIMATED COUNTERS
  const counters = document.querySelectorAll(".stat-value");
  if (counters.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute("data-target"));
          const duration = 2000; // 2 seconds
          const increment = target / (duration / 16); // 60fps
          let currentCount = 0;

          const updateCounter = () => {
            currentCount += increment;
            if (currentCount < target) {
              counter.innerText = Math.ceil(currentCount);
              requestAnimationFrame(updateCounter);
            } else {
              counter.innerText = target;
            }
          };

          updateCounter();
          observer.unobserve(counter); // Run once
        }
      });
    }, observerOptions);

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  }

  // 8. HERO SLIDER
  const slides = document.querySelectorAll(".hero-slide");
  const dotsContainer = document.getElementById("sliderDots");

  if (slides.length > 0) {
    let currentSlide = 0;
    const totalSlides = slides.length;
    let slideInterval;

    // Create dots if container exists
    if (dotsContainer) {
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("div");
        dot.classList.add("slider-dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => {
          goToSlide(i);
          resetInterval();
        });
        dotsContainer.appendChild(dot);
      }
    }
    const dots = document.querySelectorAll(".slider-dot");

    function goToSlide(index) {
      slides[currentSlide].classList.remove("active");
      if (dots && dots.length > currentSlide) {
        dots[currentSlide].classList.remove("active");
      }

      currentSlide = (index + totalSlides) % totalSlides;

      slides[currentSlide].classList.add("active");
      if (dots && dots.length > currentSlide) {
        dots[currentSlide].classList.add("active");
      }
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startInterval() {
      slideInterval = setInterval(nextSlide, 5000);
    }

    function resetInterval() {
      clearInterval(slideInterval);
      startInterval();
    }

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;
    const sliderElement = document.getElementById("heroSlider");

    if (sliderElement) {
      sliderElement.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
          clearInterval(slideInterval);
        },
        { passive: true },
      );

      sliderElement.addEventListener(
        "touchend",
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
          startInterval();
        },
        { passive: true },
      );
    }

    function handleSwipe() {
      if (touchEndX < touchStartX - 50) {
        // swiped left
        nextSlide();
      }
      if (touchEndX > touchStartX + 50) {
        // swiped right
        prevSlide();
      }
    }

    startInterval();
  }

  // 9. PROFESSIONAL ACCORDION FAQ
  const accordionHeaders = document.querySelectorAll(".faq-accordion-header");
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const isActive = item.classList.contains("active");

      // Close all other items for a true single-expand accordion
      document.querySelectorAll(".faq-accordion-item").forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const otherBody = otherItem.querySelector(".faq-accordion-body");
          otherBody.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove("active");
        const body = item.querySelector(".faq-accordion-body");
        body.style.maxHeight = null;
      } else {
        item.classList.add("active");
        const body = item.querySelector(".faq-accordion-body");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
});
