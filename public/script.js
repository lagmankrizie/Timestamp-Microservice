const eventForm = document.getElementById("eventForm");

const eventName = document.getElementById("eventName");
const eventDate = document.getElementById("eventDate");

const resultCard = document.getElementById("resultCard");
const resultEvent = document.getElementById("resultEvent");
const resultUnix = document.getElementById("resultUnix");
const resultUtc = document.getElementById("resultUtc");

const eventList = document.getElementById("eventList");
const clearEvents = document.getElementById("clearEvents");

// Load saved events when the page opens
displayEvents();

// Create a new event
eventForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const name = eventName.value.trim();
  const dateValue = eventDate.value;

  if (!name || !dateValue) {
    return;
  }

  try {
    // Convert datetime-local value into a JavaScript Date
    const date = new Date(dateValue);
    // Send the date to our timestamp API
    const response = await fetch(
      "/api/" + encodeURIComponent(date.toISOString())
    );
    const data = await response.json();

    if (data.error) {
      alert("Invalid Date");
      return;
    }

    // Display result
    resultEvent.textContent = name;
    resultUnix.textContent = data.unix;
    resultUtc.textContent = data.utc;

    resultCard.hidden = false;

    // Create event object
    const newEvent = {
      id: Date.now(),
      name: name,
      date: dateValue,
      unix: data.unix,
      utc: data.utc
    };
    // Save event
    saveEvent(newEvent);
    // Refresh event history
    displayEvents();
    // Reset form
    eventForm.reset();
  } catch (error) {
    console.error(error);
    alert("Something went wrong while creating the event.");
  }
});

// Save event to localStorage
function saveEvent(newEvent) {
  const events = getEvents();
  events.unshift(newEvent);
  localStorage.setItem(
    "eventTimestampHistory",
    JSON.stringify(events)
  );
}

// Get saved events
function getEvents() {
  const events = localStorage.getItem(
    "eventTimestampHistory"
  );
  return events ? JSON.parse(events) : [];
}

// Display saved events
function displayEvents() {
  const events = getEvents();
  if (events.length === 0) {
    eventList.innerHTML = `
      <p class="empty-message">
        No events have been created yet.
      </p>
    `;
    return;
  }
  eventList.innerHTML = "";
  events.forEach(function (event) {
    const eventItem = document.createElement("div");
    eventItem.className = "event-item";
    eventItem.innerHTML = `
      <div class="event-information">
        <h3>${escapeHTML(event.name)}</h3>
        <p>
          ${formatDate(event.date)}
        </p>
      </div>
      <div class="event-timestamps">

        <span>
          Unix:
          <code>${event.unix}</code>
        </span>

        <span>
          UTC:
          <code>${event.utc}</code>
        </span>
      </div>
      <button
        class="delete-button"
        data-id="${event.id}"
        type="button"
      >
        Delete
      </button>
    `;
    eventList.appendChild(eventItem);
  });

  document.querySelectorAll(".delete-button").forEach(function (button) {
    button.addEventListener("click", function () {
    const id = Number(button.dataset.id);
    deleteEvent(id);
    });
  });
}

function deleteEvent(id) {
  const events = getEvents();
  const updatedEvents = events.filter(function (event) {
    return event.id !== id;
  });
  localStorage.setItem(
    "eventTimestampHistory",
    JSON.stringify(updatedEvents)
  );
  displayEvents();
}

clearEvents.addEventListener("click", function () {
  const events = getEvents();

  if (events.length === 0) {
    return;
  }
  const confirmation = confirm(
    "Are you sure you want to clear all event history?"
  );
  if (confirmation) {
    localStorage.removeItem(
      "eventTimestampHistory"
    );
    displayEvents();
    resultCard.hidden = true;
  }
});

function formatDate(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleString();
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}