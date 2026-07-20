const body = document.body;
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const cursorOrb = document.querySelector(".cursor-orb");
const revealItems = document.querySelectorAll(".reveal");
const tabButtons = document.querySelectorAll("[data-price-tab]");
const priceSets = document.querySelectorAll("[data-price-set]");
const leadForm = document.querySelector(".lead-form");
const taskTypeSelect = leadForm?.querySelector('select[name="taskType"]');
const contactInput = leadForm?.querySelector('input[name="contact"]');
const projectMessage = leadForm?.querySelector('textarea[name="comment"]');
const contactLinks = document.querySelectorAll('.service-card a[href="#contact"], .price-card a[href="#contact"], .benefits-section a[href="#contact"], .portfolio-link[href="#contact"]');
const siteHeader = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const finePointer = window.matchMedia("(pointer: fine)").matches;

// Navbar scroll effect
if (siteHeader) {
  let scrollFrame = null;

  window.addEventListener("scroll", () => {
    if (scrollFrame) return;

    scrollFrame = requestAnimationFrame(() => {
      siteHeader.classList.toggle("scrolled", window.pageYOffset > 50);
      scrollFrame = null;
    });
  }, { passive: true });
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

if (cursorOrb && finePointer) {
  let cursorFrame = null;
  let cursorX = 0;
  let cursorY = 0;

  window.addEventListener("pointermove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;

    if (cursorFrame) return;

    cursorFrame = requestAnimationFrame(() => {
      cursorOrb.style.transform = `translate3d(${cursorX - 110}px, ${cursorY - 110}px, 0)`;
      cursorFrame = null;
    });
  }, { passive: true });
} else if (cursorOrb) {
  cursorOrb.remove();
}

if (hero && finePointer) {
  let heroFrame = null;
  let heroPointerX = 0;
  let heroPointerY = 0;

  hero.addEventListener("pointermove", (event) => {
    heroPointerX = event.clientX;
    heroPointerY = event.clientY;

    if (heroFrame) return;

    heroFrame = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const x = (heroPointerX - rect.left) / rect.width - 0.5;
      const y = (heroPointerY - rect.top) / rect.height - 0.5;

      hero.style.setProperty("--hero-parallax-x", `${x * 18}px`);
      hero.style.setProperty("--hero-parallax-y", `${y * 14}px`);
      heroFrame = null;
    });
  }, { passive: true });

  hero.addEventListener("pointerleave", () => {
    if (heroFrame) {
      cancelAnimationFrame(heroFrame);
      heroFrame = null;
    }

    hero.style.setProperty("--hero-parallax-x", "0px");
    hero.style.setProperty("--hero-parallax-y", "0px");
  });
}

const motionContainers = document.querySelectorAll(".hero, section, .footer, .tech-strip, .marquee");

if ("IntersectionObserver" in window && motionContainers.length) {
  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("motion-paused", !entry.isIntersecting);
      });
    },
    {
      rootMargin: "180px 0px",
      threshold: 0,
    }
  );

  motionContainers.forEach((container) => motionObserver.observe(container));
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 3, 2) * 90}ms`;
  revealObserver.observe(item);
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const activeTab = button.dataset.priceTab;
    const currentActive = document.querySelector(".price-set.active");
    const targetSet = document.querySelector(`[data-price-set="${activeTab}"]`);

    // Update button states
    tabButtons.forEach((item) => item.classList.toggle("active", item === button));

    // If clicking the same tab, do nothing
    if (currentActive === targetSet) return;

    // Fade out current set
    if (currentActive) {
      currentActive.classList.add("fade-out");
      currentActive.classList.remove("active");

      setTimeout(() => {
        currentActive.classList.remove("fade-out");
        currentActive.style.display = "none";

        // Fade in new set
        if (targetSet) {
          targetSet.style.display = "grid";
          // Force reflow
          targetSet.offsetHeight;
          targetSet.classList.add("active");
        }
      }, 400);
    } else {
      // First time, just show
      if (targetSet) {
        targetSet.style.display = "grid";
        targetSet.offsetHeight;
        targetSet.classList.add("active");
      }
    }
  });
});

contactLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const card = link.closest(".service-card, .price-card, .benefits-section, .portfolio-card");
    const heading = card?.querySelector("h2, h3")?.textContent || "";
    const service = detectService(heading);

    if (taskTypeSelect && service) {
      taskTypeSelect.value = service;
    }

    if (projectMessage && !projectMessage.value.trim() && heading) {
      projectMessage.placeholder = `Интересует: ${heading}`;
    }
  });
});

function detectService(text) {
  const normalized = text.toLowerCase();

  if (normalized.includes("telegram") || normalized.includes("vk") || normalized.includes("бот")) return "Бот";
  if (normalized.includes("комплекс") || normalized.includes("автомат")) return "Сайт + бот";
  if (normalized.includes("план")) return "Сайт + бот";

  return "Сайт";
}
const faqItems = document.querySelectorAll(".faq-list details");

faqItems.forEach((details) => {
  const summary = details.querySelector("summary");
  if (details.open) details.classList.add("is-open");

  summary?.addEventListener("click", (event) => {
    event.preventDefault();
    toggleFaq(details);
  });
});

function toggleFaq(target) {
  if (target.dataset.animating === "true") return;

  if (target.open) {
    closeFaq(target);
    return;
  }

  faqItems.forEach((item) => {
    if (item !== target && item.open) closeFaq(item);
  });

  openFaq(target);
}

function openFaq(details) {
  const summary = details.querySelector("summary");
  if (!summary) return;

  details.dataset.animating = "true";
  details.open = true;
  details.classList.add("is-open");

  const startHeight = summary.offsetHeight;
  const endHeight = details.scrollHeight;
  details.style.height = `${startHeight}px`;

  requestAnimationFrame(() => {
    details.style.height = `${endHeight}px`;
  });

  finishFaqAnimation(details);
}

function closeFaq(details) {
  const summary = details.querySelector("summary");
  if (!summary) return;

  details.dataset.animating = "true";
  details.style.height = `${details.offsetHeight}px`;
  details.classList.remove("is-open");

  requestAnimationFrame(() => {
    details.style.height = `${summary.offsetHeight}px`;
  });

  finishFaqAnimation(details, () => {
    details.open = false;
  });
}

function finishFaqAnimation(details, onFinish) {
  const finish = (event) => {
    if (event.propertyName !== "height") return;
    details.style.height = "";
    details.dataset.animating = "false";
    onFinish?.();
    details.removeEventListener("transitionend", finish);
  };

  details.addEventListener("transitionend", finish);
}

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      contact: String(formData.get("contact") || "").trim(),
      taskType: String(formData.get("taskType") || "").trim(),
      budget: String(formData.get("budget") || "").trim(),
      comment: String(formData.get("comment") || "").trim(),
      source: "Vizitka landing",
    };

    const contactPattern = /^(\+?[0-9][0-9\s()\-]{6,}|@[A-Za-z0-9_]{5,32})$/;

    if (payload.name.length < 2) {
      showToast("Напишите имя, чтобы мы знали как к вам обратиться.");
      leadForm.querySelector('input[name="name"]')?.focus();
      return;
    }

    if (!contactPattern.test(payload.contact)) {
      showToast("Оставьте телефон или Telegram username в формате @username.");
      contactInput?.focus();
      return;
    }

    if (!payload.taskType) {
      showToast("Выберите тип задачи: сайт, бот или оба направления.");
      taskTypeSelect?.focus();
      return;
    }

    const submitButton = leadForm.querySelector('button[type="submit"]');
    const buttonText = submitButton?.innerHTML;
    const endpoint = leadForm.dataset.endpoint || "/api/send-telegram";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = "Отправляем...";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Telegram webhook request failed");
      }

      showToast("Заявка отправлена. Ответим в течение 15 минут.");
      leadForm.reset();
    } catch (error) {
      showToast("Не удалось отправить заявку. Напишите нам в Telegram или попробуйте ещё раз.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = buttonText;
      }
    }
  });
}
function showToast(message) {
  const oldToast = document.querySelector(".toast");
  oldToast?.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  body.append(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 260);
  }, 5200);
}
