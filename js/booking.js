/**
 * IKAN DYNAMIC BOOKING SYSTEM
 * Powered by Axios & JSONbin.io
 */

// --- 1. CONFIGURATION ---
const BIN_ID = "YOUR_BIN_ID_HERE";
const API_KEY = "$2b$10$YOUR_MASTER_KEY_HERE";
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const standardSlots = [
  "09:00 AM",
  "10:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
];
const blackoutDates = ["2024-12-25", "2025-01-01"]; // Manual office closures

// --- 2. STATE MANAGEMENT ---
let remoteBookings = {};
let selectedDate = "";
let selectedDateISO = "";
let selectedTime = "";
let currentMonth = new Date();
const realToday = new Date();
realToday.setHours(0, 0, 0, 0); // Normalize to midnight for accurate date comparison

/**
 * 3. INITIAL DATA FETCH (Read from Cloud)
 */
async function fetchBookings() {
  try {
    const response = await axios.get(URL, {
      headers: { "X-Master-Key": API_KEY },
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
          "X-Master-Key": API_KEY,
        },
      },
    );
  } catch (error) {
    console.error("Cloud Sync Error:", error);
    alert("There was an issue saving your slot. Please refresh and try again.");
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
  renderTimeSlots(dateISO);

  // Smooth Unfold Transitions
  document.getElementById("step-time").classList.add("active");
  document.getElementById("step-form").classList.remove("active");
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

        // Reveal Form Column
        document.getElementById("step-form").classList.add("active");
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

  btn.innerText = "Processing...";
  btn.disabled = true;
  btn.style.opacity = "0.5";

  // 1. Sync with Cloud
  await syncBookings(selectedDateISO, selectedTime);

  // 2. UI Feedback
  btn.innerText = "Booking Confirmed";
  btn.style.opacity = "1";
  btn.style.background = "#48bb78"; // Success Green

  // 3. Refresh UI to show the slot is now taken
  renderTimeSlots(selectedDateISO);
  renderCalendar();

  alert(
    `Success! Your discovery call is confirmed for ${selectedDate} at ${selectedTime}.`,
  );
};

/**
 * 9. SUMMARY & NAVIGATION
 */
function updateSummary() {
  const footer = document.getElementById("bookingFooter");
  const text = document.getElementById("finalDetails");
  footer.style.opacity = "1";
  text.innerHTML = `${selectedDate} ${selectedTime ? "at " + selectedTime : ""}`;
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

// --- INITIALIZE ---
document.addEventListener("DOMContentLoaded", fetchBookings);
