/**
 * IKAN DYNAMIC BOOKING SYSTEM
 * Powered by Axios & JSONbin.io
 */

// --- 1. CONFIGURATION ---
const BIN_ID = "6a1c7397ddf5aa59f77c7548";
const JSONBIN_ACCESS_KEY =
  "$2a$10$UnslywmJWeF7BNUjrr12U.Z/qUVqhLBRsvtRI/WxwDBJgUduIkjZ."; // Preferred for browser usage
const JSONBIN_MASTER_KEY = ""; // Optional fallback (leave empty if using access key)
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const EMAILJS_SERVICE_ID = "service_apy8trc";
const EMAILJS_BOOKING_TEMPLATE_ID = "template_2u49wd8";
const PRESENTATION_MODE = true;
const JSONBIN_ACCESS_KEY_PLACEHOLDER =
  "$2a$10$UnslywmJWeF7BNUjrr12U.Z/qUVqhLBRsvtRI/WxwDBJgUduIkjZ.";

function getJsonbinHeaders() {
  if (
    JSONBIN_ACCESS_KEY &&
    JSONBIN_ACCESS_KEY !== JSONBIN_ACCESS_KEY_PLACEHOLDER
  ) {
    return { "X-Access-Key": JSONBIN_ACCESS_KEY };
  }

  if (JSONBIN_MASTER_KEY) {
    return { "X-Master-Key": JSONBIN_MASTER_KEY };
  }

  throw new Error(
    "JSONbin is not configured. Add JSONBIN_ACCESS_KEY (preferred) or JSONBIN_MASTER_KEY.",
  );
}

const standardSlots = [
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];
const blackoutDates = ["2024-12-25", "2025-01-01"]; // Manual office closures

// --- 2. STATE MANAGEMENT ---
let remoteBookings = {};
let selectedDate = "";
let selectedDateISO = "";
let selectedTime = "";
let currentMonth = new Date();
const stepDate = document.getElementById("step-date");
const stepTime = document.getElementById("step-time");
const stepForm = document.getElementById("step-form");
const formNotice = document.getElementById("bookingFormNotice");
const successModal = document.getElementById("bookingSuccessModal");
const realToday = new Date();
realToday.setHours(0, 0, 0, 0); // Normalize to midnight for accurate date comparison

function setActiveStep(stepId) {
  [stepDate, stepTime, stepForm].forEach((step) =>
    step.classList.remove("active"),
  );

  if (stepId === "date") stepDate.classList.add("active");
  if (stepId === "time") stepTime.classList.add("active");
  if (stepId === "form") stepForm.classList.add("active");
}

function closeSuccessModal() {
  successModal.classList.remove("active");
  successModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openSuccessModal() {
  successModal.classList.add("active");
  successModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function getSelectedPlans() {
  const serviceSelect = document.getElementById("service");
  return Array.from(serviceSelect.selectedOptions)
    .map((option) => option.value)
    .filter((value) => value);
}

async function sendBookingEmail() {
  if (typeof emailjs === "undefined") {
    throw new Error("EmailJS SDK is not available on this page.");
  }

  const selectedPlans = getSelectedPlans();

  const params = {
    full_name: document.getElementById("name").value,
    your_role: document.getElementById("role").value,
    company_name: document.getElementById("company").value,
    state_country: document.getElementById("location").value,
    business_description: document.getElementById("businessDescription").value,
    preferred_plan: selectedPlans.join(", "),
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    meeting_date: selectedDate,
    meeting_time: selectedTime,
    meeting_date_iso: selectedDateISO,
  };

  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_BOOKING_TEMPLATE_ID, params);
}

/**
 * 3. INITIAL DATA FETCH (Read from Cloud)
 */
async function fetchBookings() {
  try {
    const response = await axios.get(`${URL}/latest`, {
      headers: getJsonbinHeaders(),
    });
    // JSONbin wraps the data in a "record" object
    remoteBookings = response.data.record.bookedSlots || {};
    renderCalendar();
  } catch (error) {
    console.error("Error fetching cloud data:", error);
    renderCalendar(); // Fallback to empty calendar if cloud fails
  }
}

/**
 * 4. SYNC DATA (Write to Cloud)
 */
async function syncBookings(dateISO, time) {
  // Update local copy
  if (!remoteBookings[dateISO]) remoteBookings[dateISO] = [];
  if (!remoteBookings[dateISO].includes(time)) {
    remoteBookings[dateISO].push(time);
  }

  try {
    await axios.put(
      URL,
      { bookedSlots: remoteBookings },
      {
        headers: {
          "Content-Type": "application/json",
          ...getJsonbinHeaders(),
        },
      },
    );
  } catch (error) {
    console.error("Cloud Sync Error:", error);
    throw new Error("There was an issue saving your slot.");
  }
}

/**
 * 5. CALENDAR RENDERING
 */
function renderCalendar() {
  const daysContainer = document.getElementById("calDays");
  const monthYear = document.getElementById("monthYear");
  const prevBtn = document.getElementById("prevMo");
  daysContainer.innerHTML = "";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  monthYear.innerText = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  // --- PREVENT PAST MONTH NAVIGATION ---
  if (year <= realToday.getFullYear() && month <= realToday.getMonth()) {
    prevBtn.style.visibility = "hidden";
  } else {
    prevBtn.style.visibility = "visible";
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill empty slots for start of month
  for (let i = 0; i < firstDay; i++) {
    const div = document.createElement("div");
    div.classList.add("c-day", "empty");
    daysContainer.appendChild(div);
  }

  // Fill actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const div = document.createElement("div");
    div.classList.add("c-day");
    div.innerText = d;

    const dateObj = new Date(year, month, d);
    // Format YYYY-MM-DD manually to avoid timezone shifts
    const dateISO = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = dateObj.getDay();

    // --- DISABLE LOGIC: PAST DATES, WEEKENDS, & BLACKOUTS ---
    const isPast = dateObj < realToday;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBlackout = blackoutDates.includes(dateISO);

    if (isPast || isWeekend || isBlackout) {
      div.classList.add("disabled");
    } else {
      div.onclick = () => selectDate(div, d, month, year, dateISO);
    }
    daysContainer.appendChild(div);
  }
}

/**
 * 6. SELECTION LOGIC
 */
function selectDate(element, day, month, year, dateISO) {
  document
    .querySelectorAll(".c-day")
    .forEach((el) => el.classList.remove("selected"));
  element.classList.add("selected");

  const dateObj = new Date(year, month, day);
  selectedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  selectedDateISO = dateISO;

  selectedTime = ""; // Reset time selection
  formNotice.classList.remove("active");
  formNotice.textContent = "";
  renderTimeSlots(dateISO);

  // Replace current step with time selection
  setActiveStep("time");
  updateSummary();
}

/**
 * 7. TIME SLOT RENDERING
 */
function renderTimeSlots(dateISO) {
  const grid = document.getElementById("timeGrid");
  grid.innerHTML = "";

  const unavailableTimes = remoteBookings[dateISO] || [];

  standardSlots.forEach((time) => {
    const btn = document.createElement("button");
    btn.classList.add("t-slot");
    btn.innerText = time;

    if (unavailableTimes.includes(time)) {
      btn.classList.add("disabled");
    } else {
      btn.onclick = () => {
        document
          .querySelectorAll(".t-slot")
          .forEach((s) => s.classList.remove("active"));
        btn.classList.add("active");
        selectedTime = time;
        formNotice.classList.remove("active");
        formNotice.textContent = "";

        // Replace time step with form
        setActiveStep("form");
        updateSummary();
      };
    }
    grid.appendChild(btn);
  });
}

/**
 * 8. FORM SUBMISSION & CLOUD SYNC
 */
document.getElementById("bookingForm").onsubmit = async function (e) {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  const defaultBtnText = "Confirm Meeting";
  const selectedPlans = getSelectedPlans();

  if (!selectedDateISO || !selectedTime) {
    formNotice.textContent =
      "Please select both a date and time before confirming your meeting.";
    formNotice.classList.add("active");
    return;
  }

  if (selectedPlans.length === 0) {
    formNotice.textContent = "Please select at least one preferred plan.";
    formNotice.classList.add("active");
    return;
  }

  formNotice.classList.remove("active");
  formNotice.textContent = "";

  btn.innerText = "Processing...";
  btn.disabled = true;
  btn.style.opacity = "0.5";

  // 1. Sync with Cloud
  try {
    await syncBookings(selectedDateISO, selectedTime);
  } catch (error) {
    console.warn("Presentation mode: ignoring sync error.", error);

    if (!PRESENTATION_MODE) {
      formNotice.textContent =
        "There was an issue saving your slot. Please refresh and try again.";
      formNotice.classList.add("active");
      btn.innerText = defaultBtnText;
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.background = "";
      return;
    }
  }

  // 1.5. Send booking confirmation details through EmailJS
  try {
    await sendBookingEmail();
  } catch (error) {
    console.warn("Presentation mode: ignoring EmailJS error.", error);

    if (!PRESENTATION_MODE) {
      formNotice.textContent =
        "Your slot was saved, but email delivery failed. Please verify your EmailJS service/template IDs.";
      formNotice.classList.add("active");
    }
  }

  // 2. UI Feedback
  btn.innerText = "Booking Confirmed";
  btn.style.opacity = "1";
  btn.style.background = "#48bb78"; // Success Green

  // 3. Refresh UI to show the slot is now taken
  renderTimeSlots(selectedDateISO);
  renderCalendar();

  openSuccessModal();
};

/**
 * 9. SUMMARY & NAVIGATION
 */
function updateSummary() {
  const text = document.getElementById("finalDetails");

  if (!selectedDate) {
    text.textContent =
      "Choose a date and time to preview your meeting details.";
    return;
  }

  text.textContent = `${selectedDate}${selectedTime ? " at " + selectedTime : ""}`;
}

document.getElementById("prevMo").onclick = () => {
  const targetMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1,
  );
  // Only allow going back if the target month is not in the past
  if (
    targetMonth >= new Date(realToday.getFullYear(), realToday.getMonth(), 1)
  ) {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
  }
};

document.getElementById("nextMo").onclick = () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
};

document.getElementById("changeDateFromTime").onclick = () => {
  selectedTime = "";
  formNotice.classList.remove("active");
  formNotice.textContent = "";
  setActiveStep("date");
  updateSummary();
};

document.getElementById("changeDateFromForm").onclick = () => {
  selectedTime = "";
  formNotice.classList.remove("active");
  formNotice.textContent = "";
  setActiveStep("date");
  updateSummary();
};

document.getElementById("changeTimeFromForm").onclick = () => {
  formNotice.classList.remove("active");
  formNotice.textContent = "";
  setActiveStep("time");
  updateSummary();
};

document.getElementById("closeBookingModal").onclick = closeSuccessModal;

successModal.onclick = (event) => {
  if (event.target === successModal) {
    closeSuccessModal();
  }
};

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && successModal.classList.contains("active")) {
    closeSuccessModal();
  }
});

// --- INITIALIZE ---
document.addEventListener("DOMContentLoaded", fetchBookings);
