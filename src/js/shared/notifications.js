/* ─────────────────────────────────────────────────────
   Shared notification bell.
   Requires this markup somewhere on the page:
     #nx-notif-bell, #nx-notif-panel, #nx-notif-list,
     #nx-notif-empty, #nx-notif-badge, #nx-notif-mark-all
   and <body data-dashboard="attendee|organizer">.

   Exposes window.NXNotify.push({...}) globally so any page
   (ticket.js, events.html, sign-up.html, etc.) can queue a
   notification even if it doesn't render the bell itself —
   as long as this script has run on that page too.
───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {

  const STORAGE_KEY = "nx_notifications";

  // ---- who is viewing this page? ----
  const dashboardType = document.body.dataset.dashboard; // "organizer" | "attendee"
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("loggedInUser") || localStorage.getItem("currentUser") || "null");
  } catch (e) {
    currentUser = null;
  }
  const currentEmail = currentUser && currentUser.email ? currentUser.email : null;

  // ---- storage helpers ----
  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function getMine() {
    return readAll().filter(function (n) {
      return n.forRole === dashboardType && (!currentEmail || n.forEmail === currentEmail);
    }).sort(function (a, b) { return b.timestamp - a.timestamp; });
  }

  // ---- public push API (call this from ticket.js / events publish flow) ----
  window.NXNotify = {
    push: function (partial) {
      const list = readAll();
      list.push({
        id: "n_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        forRole: partial.forRole,
        forEmail: partial.forEmail,
        type: partial.type || "event_update",
        eventId: partial.eventId || null,
        eventName: partial.eventName || "",
        message: partial.message || "",
        timestamp: Date.now(),
        read: false
      });
      writeAll(list);
      render();
    }
  };

  // If this page has no bell markup (e.g. sign-in.html including this
  // script just to get window.NXNotify.push available), stop here —
  // there's nothing to render.
  const bell = document.getElementById("nx-notif-bell");
  const panel = document.getElementById("nx-notif-panel");
  if (!bell || !panel) return;

  // ---- icons per type ----
  function iconFor(type) {
    switch (type) {
      case "signup": return "ri-user-add-line";
      case "sale": return "ri-ticket-2-line";
      case "event_update": return "ri-refresh-line";
      case "reminder": return "ri-alarm-line";
      default: return "ri-information-line";
    }
  }

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  // ---- render ----
  const listEl = document.getElementById("nx-notif-list");
  const emptyEl = document.getElementById("nx-notif-empty");
  const badgeEl = document.getElementById("nx-notif-badge");

  function render() {
    const mine = getMine();
    const unreadCount = mine.filter(function (n) { return !n.read; }).length;

    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
      badgeEl.classList.remove("hidden");
    } else {
      badgeEl.classList.add("hidden");
    }

    if (mine.length === 0) {
      listEl.innerHTML = "";
      emptyEl.classList.remove("hidden");
      return;
    }
    emptyEl.classList.add("hidden");

    listEl.innerHTML = mine.map(function (n) {
      return (
        '<div class="flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition cursor-pointer nx-notif-item" data-id="' + n.id + '">' +
          '<div class="w-8 h-8 shrink-0 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">' +
            '<i class="' + iconFor(n.type) + ' text-yellow-400 text-sm"></i>' +
          '</div>' +
          '<div class="flex-1 min-w-0">' +
            '<p class="font-cormorant text-sm ' + (n.read ? "text-white/50" : "text-white") + ' leading-snug">' + n.message + '</p>' +
            (n.eventName ? '<p class="text-white/30 text-[11px] mt-0.5">' + n.eventName + '</p>' : "") +
            '<p class="text-yellow-500/50 text-[10px] mt-1 font-cinzel tracking-wide">' + timeAgo(n.timestamp) + '</p>' +
          '</div>' +
          (n.read ? "" : '<span class="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0"></span>') +
        '</div>'
      );
    }).join("");
  }

  // ---- interactions ----
  bell.addEventListener("click", function (e) {
    e.stopPropagation();
    panel.classList.toggle("hidden");
  });

  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && !bell.contains(e.target)) {
      panel.classList.add("hidden");
    }
  });

  document.getElementById("nx-notif-mark-all").addEventListener("click", function (e) {
    e.stopPropagation();
    const list = readAll().map(function (n) {
      if (n.forRole === dashboardType && (!currentEmail || n.forEmail === currentEmail)) {
        n.read = true;
      }
      return n;
    });
    writeAll(list);
    render();
  });

  listEl.addEventListener("click", function (e) {
    const item = e.target.closest(".nx-notif-item");
    if (!item) return;
    const id = item.dataset.id;
    const list = readAll().map(function (n) {
      if (n.id === id) n.read = true;
      return n;
    });
    writeAll(list);
    render();
  });

  // keep in sync across tabs (e.g. attendee buys ticket in one tab,
  // organizer dashboard open in another)
  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) render();
  });

  render();

});