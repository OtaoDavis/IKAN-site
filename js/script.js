/**
 * IKAN GLOBAL SCRIPT - Fixed & Bulletproof
 */

(function () {
  // --- 0. EMAILJS INITIALIZATION ---
  if (typeof emailjs !== "undefined") {
    // Your Public Key
    emailjs.init("mY7kmKYVI_e0uo_q6");
  } else {
    console.warn("EmailJS SDK not found.");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("ikan-loader");
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");

  // --- 1. LOADER HIDE LOGIC ---
  const hideLoader = () => {
    if (!preloader) return;
    setTimeout(() => {
      preloader.classList.add("loader-finished");
      document.body.classList.remove("content-hidden");
      document.body.style.opacity = "1";
    }, 1000);
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader);
  }

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
  allLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const destination = link.getAttribute("href");

      // Only apply transition to internal page links
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
        // Show loader again before leaving
        if (preloader) {
          preloader.classList.remove("loader-finished");
        }
        setTimeout(() => {
          window.location.href = destination;
        }, 500);
      }
    });
  });

  // --- 4. MOBILE MENU LOGIC ---
  if (btn && menu) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.toggle("open");
      menu.classList.toggle("hidden");
    });
  }

  // --- 5. EMAILJS: HOME PAGE CONTACT FORM ---
  const homeContactForm = document.getElementById("ikan-contact-form");
  if (homeContactForm && typeof emailjs !== "undefined") {
    homeContactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector("button");
      const originalText = submitBtn ? submitBtn.innerText : "Send Message";

      const nameInp = document.getElementById("user_name");
      const phoneInp = document.getElementById("user_phone");
      const emailInp = document.getElementById("user_email");
      const msgInp = document.getElementById("message");

      if (submitBtn) {
        submitBtn.innerText = "INITIATING DIALOGUE...";
        submitBtn.disabled = true;
      }

      const params = {
        user_name: nameInp ? nameInp.value : "N/A",
        user_phone: phoneInp ? phoneInp.value : "N/A",
        user_email: emailInp ? emailInp.value : "N/A",
        selected_service: "General Inquiry",
        message: msgInp ? msgInp.value : "N/A",
      };

      emailjs.send("service_apy8trc", "template_6czv8uv", params).then(
        () => {
          if (submitBtn) {
            submitBtn.innerText = "MESSAGE RECEIVED";
            submitBtn.style.background = "#48bb78";
          }
          homeContactForm.reset();
          setTimeout(() => {
            if (submitBtn) {
              submitBtn.innerText = originalText;
              submitBtn.style.background = "";
              submitBtn.disabled = false;
            }
          }, 4000);
        },
        (error) => {
          console.error("EmailJS Error:", error);
          if (submitBtn) {
            submitBtn.innerText = "ERROR. RETRY.";
            submitBtn.disabled = false;
          }
        },
      );
    });
  }

  // --- 5b. EMAILJS: PILOT PAGE FORM ---
  const pilotForm = document.getElementById("ikan-pilot-form");
  if (pilotForm && typeof emailjs !== "undefined") {
    pilotForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector("button");
      const originalText = submitBtn
        ? submitBtn.innerText
        : "Request Pilot Info";

      const nameInp = document.getElementById("pilot_user_name");
      const companyInp = document.getElementById("pilot_company");
      const emailInp = document.getElementById("pilot_email");
      const msgInp = document.getElementById("pilot_message");

      if (submitBtn) {
        submitBtn.innerText = "SENDING REQUEST...";
        submitBtn.disabled = true;
      }

      const params = {
        user_name: nameInp ? nameInp.value : "N/A",
        user_email: emailInp ? emailInp.value : "N/A",
        company_name: companyInp ? companyInp.value : "N/A",
        selected_service: "Insights Pilot Application",
        message: msgInp ? msgInp.value : "N/A",
      };

      emailjs.send("service_apy8trc", "template_fhiskuk", params).then(
        () => {
          if (submitBtn) {
            submitBtn.innerText = "APPLICATION RECEIVED";
            submitBtn.style.background = "#48bb78";
          }
          pilotForm.reset();
          setTimeout(() => {
            if (submitBtn) {
              submitBtn.innerText = originalText;
              submitBtn.style.background = "";
              submitBtn.disabled = false;
            }
          }, 4000);
        },
        (error) => {
          console.error("EmailJS Error:", error);
          if (submitBtn) {
            submitBtn.innerText = "ERROR. RETRY.";
            submitBtn.disabled = false;
          }
        },
      );
    });
  }

  // --- 6. EMAILJS: SERVICES MODAL FORM ---
  const serviceModalForm = document.getElementById("service-inquiry-form");
  if (serviceModalForm && typeof emailjs !== "undefined") {
    serviceModalForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector("button");
      const originalText = submitBtn ? submitBtn.innerText : "Send Inquiry";

      const nameInp = document.getElementById("modal_user_name");
      const emailInp = document.getElementById("modal_user_email");
      const phoneInp = document.getElementById("modal_user_phone");
      const serviceInp = document.getElementById("selectedService");
      const msgInp = document.getElementById("modal_message");

      if (submitBtn) {
        submitBtn.innerText = "SENDING INQUIRY...";
        submitBtn.disabled = true;
      }

      const params = {
        user_name: nameInp ? nameInp.value : "N/A",
        user_email: emailInp ? emailInp.value : "N/A",
        user_phone: phoneInp ? phoneInp.value : "N/A",
        selected_service: serviceInp ? serviceInp.value : "Service Inquiry",
        message: msgInp ? msgInp.value : "N/A",
      };

      emailjs.send("service_apy8trc", "template_6czv8uv", params).then(
        () => {
          if (submitBtn) {
            submitBtn.innerText = "SENT SUCCESSFULLY";
            submitBtn.style.background = "#48bb78";
          }
          serviceModalForm.reset();
          setTimeout(() => {
            closeServiceModal();
            if (submitBtn) {
              submitBtn.innerText = originalText;
              submitBtn.style.background = "";
              submitBtn.disabled = false;
            }
          }, 2000);
        },
        (error) => {
          console.error("EmailJS Error:", error);
          if (submitBtn) {
            submitBtn.innerText = "FAILED TO SEND";
            submitBtn.disabled = false;
          }
        },
      );
    });
  }
});

// --- 7. GLOBAL FUNCTIONS (Safe for all pages) ---

function openServiceModal(serviceName) {
  const modal = document.getElementById("serviceModal");
  const serviceField = document.getElementById("selectedService");
  const title = document.getElementById("modalTitle");

  // Auto-detect service name from page if not provided
  if (!serviceName) {
    const serviceTag = document.querySelector(".blue-tag");
    if (serviceTag) {
      serviceName = serviceTag.innerText.replace(/[0-9]/g, "").trim();
    } else {
      serviceName = "Service Inquiry";
    }
  }

  if (modal) {
    if (serviceField) serviceField.value = serviceName;
    if (title) title.innerHTML = "Inquire: " + serviceName;
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
    // Fixed the syntax error here
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

document.addEventListener("DOMContentLoaded", function () {
  const swiper = new Swiper(".storySwiper", {
    loop: true,
    speed: 2500,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    // spaceBetween is not needed for fade effect
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
});
