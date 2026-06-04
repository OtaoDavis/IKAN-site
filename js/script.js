/**
 * IKAN GLOBAL SCRIPT - Fixed & Bulletproof
 */

(function () {
  // --- 0. EMAILJS INITIALIZATION ---
  if (typeof emailjs !== "undefined") {
    emailjs.init("mY7kmKYVI_e0uo_q6");
  } else {
    console.warn("EmailJS SDK not found.");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("ikan-loader");

  // --- 1. LOADER HIDE LOGIC ---
  let loaderHidden = false;

  const hideLoaderImmediately = () => {
    if (loaderHidden) return;
    if (!preloader) return;
    loaderHidden = true;

    preloader.classList.add("loader-finished");
    document.body.classList.remove("content-hidden");
    document.body.style.opacity = "1";

    // Final fallback: remove from layout so it can never block interaction.
    setTimeout(() => {
      preloader.style.display = "none";
    }, 700);
  };

  const hideLoader = () => {
    if (!preloader) return;
    setTimeout(() => {
      hideLoaderImmediately();
    }, 1000);
  };

  const navigationEntry = performance.getEntriesByType("navigation")[0];
  const isHistoryNavigation =
    navigationEntry && navigationEntry.type === "back_forward";

  if (isHistoryNavigation) {
    hideLoaderImmediately();
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }

  // Ensure pages restored from BFCache never keep the loader visible.
  window.addEventListener("pageshow", () => {
    hideLoaderImmediately();
  });

  // Absolute safety net: force-hide after a short delay if anything else fails.
  setTimeout(hideLoaderImmediately, 2500);

  // --- 2. ACTIVE NAV LINK LOGIC ---
  const currentUrl = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    const linkHref = link.getAttribute("href");
    if (currentUrl === linkHref) {
      link.classList.add("active-link");
    }
  });

  // --- 3. PAGE REDIRECTION (Smooth Transitions) ---
  const allLinks = document.querySelectorAll("a");

  // Force all anchors to open in a new tab site-wide.
  allLinks.forEach((link) => {
    if (link.closest(".nav-links")) {
      return;
    }

    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  allLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const destination = link.getAttribute("href");
      if (
        destination &&
        !destination.startsWith("#") &&
        !destination.startsWith("http") &&
        !destination.startsWith("mailto:") &&
        !destination.startsWith("tel:") &&
        link.target !== "_blank" &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        if (preloader) {
          preloader.style.display = "flex";
          preloader.classList.remove("loader-finished");
        }
        setTimeout(() => {
          window.location.href = destination;
        }, 500);
      }
    });
  });

  // --- 4. MOBILE MENU LOGIC ---
  const navContainers = document.querySelectorAll(".sticky-nav .nav-container");
  navContainers.forEach((container) => {
    const toggleBtn = container.querySelector(".nav-toggle");
    const menu = container.querySelector(".nav-links");

    if (!toggleBtn || !menu) return;

    const closeMenu = () => {
      container.classList.remove("nav-open");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open-lock");
    };

    const openMenu = () => {
      container.classList.add("nav-open");
      toggleBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open-lock");
    };

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (container.classList.contains("nav-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        closeMenu();
      }
    });
  });

  // --- 5. SWIPER INITIALIZATIONS ---

  // Hero Swiper (Home Page)
  if (document.querySelector(".heroSwiper")) {
    new Swiper(".heroSwiper", {
      loop: true,
      speed: 4000,
      effect: "fade",
      fadeEffect: { crossFade: true },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
    });
  }

  // Story Swiper (About Page)
  if (document.querySelector(".storySwiper")) {
    new Swiper(".storySwiper", {
      loop: true,
      speed: 1000,
      effect: "fade",
      fadeEffect: { crossFade: true },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  }

  // --- 6. FORM LOGIC (Home, Pilot, Project, Internship) ---

  const setupForm = (formId, serviceName, templateId) => {
    const form = document.getElementById(formId);
    if (!form || typeof emailjs === "undefined") return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const submitBtn = this.querySelector("button");
      const originalText = submitBtn.innerText;

      submitBtn.innerText = "SENDING...";
      submitBtn.disabled = true;

      // Collect all form data dynamically
      const formData = new FormData(form);
      const params = Object.fromEntries(formData.entries());
      params.selected_service = serviceName;

      emailjs.send("service_apy8trc", templateId, params).then(
        () => {
          submitBtn.innerText = "SUCCESS";
          submitBtn.style.background = "#48bb78";
          form.reset();
          setTimeout(() => {
            submitBtn.innerText = originalText;
            submitBtn.style.background = "";
            submitBtn.disabled = false;
            if (formId.includes("Modal")) {
              // Close modals if they are part of the form
              if (typeof closeProjectModal === "function") closeProjectModal();
              if (typeof closeInternshipModal === "function")
                closeInternshipModal();
            }
          }, 4000);
        },
        (error) => {
          console.error("EmailJS Error:", error);
          submitBtn.innerText = "ERROR. RETRY.";
          submitBtn.disabled = false;
        },
      );
    });
  };

  setupForm("ikan-contact-form", "General Inquiry", "template_6czv8uv");
  setupForm("ikan-pilot-form", "Insights Pilot", "template_fhiskuk");
  setupForm("projectAnalysisForm", "Project Analysis", "template_6czv8uv");
  setupForm("internshipProjectForm", "Internship Brief", "template_6czv8uv");
});

// --- 7. GLOBAL FUNCTIONS ---

function openServiceModal(serviceName) {
  const modal = document.getElementById("serviceModal");
  const serviceField = document.getElementById("selectedService");
  if (modal) {
    if (serviceField) serviceField.value = serviceName || "Service Inquiry";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeServiceModal() {
  const modal = document.getElementById("serviceModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function openVideoModal(videoID) {
  const modal = document.getElementById("videoModal");
  const player = document.getElementById("videoPlayer");
  if (modal && player) {
    player.src = `https://www.youtube.com/embed/${videoID}?autoplay=1`;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeVideoModal() {
  const modal = document.getElementById("videoModal");
  const player = document.getElementById("videoPlayer");
  if (modal && player) {
    player.src = "";
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function openProjectModal() {
  const m = document.getElementById("projectModal");
  if (m) {
    m.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeProjectModal() {
  const m = document.getElementById("projectModal");
  if (m) {
    m.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function openInternshipModal() {
  const m = document.getElementById("internshipModal");
  if (m) {
    m.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeInternshipModal() {
  const m = document.getElementById("internshipModal");
  if (m) {
    m.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}
