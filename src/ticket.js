document.addEventListener("DOMContentLoaded", function () {
  /* ─────────────────────────────────────────
     1. HAMBURGER MENU
  ───────────────────────────────────────── */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const hamIcon = document.getElementById("ham-icon");

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = mobileMenu.classList.toggle("open");
    hamIcon.className = open ? "ri-close-line" : "ri-menu-line";
  });
  mobileMenu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamIcon.className = "ri-menu-line";
    });
  });
  document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      mobileMenu.classList.remove("open");
      hamIcon.className = "ri-menu-line";
    }
  });

  /* ─────────────────────────────────────────
     2. NAVBAR SHADOW ON SCROLL
  ───────────────────────────────────────── */
  const nav = document.getElementById("main-nav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("shadow-lg", window.scrollY > 40);
    nav.classList.toggle("shadow-black/40", window.scrollY > 40);
  });

  /* ─────────────────────────────────────────
     3. SCROLL REVEAL
  ───────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));

  /* ─────────────────────────────────────────
     4. LIGHTBOX FOR EVENT IMAGE
  ───────────────────────────────────────── */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");

  document.querySelectorAll(".zoom-img").forEach((img) => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "Event image";
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
      lightboxImg.src = "";
    }, 300);
  }

  /* ─────────────────────────────────────────
     5. WHICH EVENT IS THIS PAGE FOR + LOAD ITS DETAILS
     (moved up so seat prices are correct before anyone clicks a seat)
  ───────────────────────────────────────── */
  function getEventContext() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || document.body.dataset.eventId || "";
    const name =
      params.get("event") ||
      document.body.dataset.eventName ||
      document.getElementById("event-title")?.textContent?.trim() ||
      "";
    return { id, name };
  }

  let currentEvent = null;

  function loadEventDetails() {
    const eventCtx = getEventContext();
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const event = events.find(
      (ev) =>
        (eventCtx.id && ev.id === eventCtx.id) ||
        (eventCtx.name && ev.name === eventCtx.name),
    );

    if (!event) {
      // No matching event — leave the placeholder markup as-is rather
      // than crash, but this means someone landed on Tickets.html
      // without a valid ?id= in the URL.
      return;
    }

    currentEvent = event;

    const imgEl = document.getElementById("ticket-event-img");
    const categoryEl = document.getElementById("ticket-event-category");
    const titleEl = document.getElementById("ticket-event-title");
    const venueEl = document.getElementById("ticket-event-venue");
    const dateEl = document.getElementById("ticket-event-date");
    const priceEl = document.getElementById("ticket-event-price");

    if (imgEl) {
      imgEl.src = event.banner || "";
      imgEl.alt = event.name || "Event thumbnail";
    }
    if (categoryEl) categoryEl.textContent = event.category || "";
    if (titleEl) titleEl.textContent = event.name || "";
    if (venueEl)
      venueEl.textContent =
        "📍 " + [event.venue, event.city].filter(Boolean).join(", ");
    if (dateEl)
      dateEl.textContent =
        "📅 " + [event.date, event.time].filter(Boolean).join(" · ");

    // Row A = VIP, Row B = Regular, Row C = Early Bird.
    // Falls back to the flat ticketPrice if a specific tier price
    // wasn't set on this event (e.g. older events created before
    // tiers existed).
    const TIER_BY_ROW = {
      A: {
        key: "vip",
        label: "VIP",
        price: Number(event.vipPrice) || Number(event.ticketPrice) || 0,
      },
      B: {
        key: "regular",
        label: "Regular",
        price: Number(event.regularPrice) || Number(event.ticketPrice) || 0,
      },
      C: {
        key: "earlyBird",
        label: "Early Bird",
        price: Number(event.earlyBirdPrice) || Number(event.ticketPrice) || 0,
      },
    };

    Object.keys(TIER_BY_ROW).forEach((row) => {
      const tier = TIER_BY_ROW[row];
      const label = document.getElementById(`row-label-${row}`);
      if (label) {
        label.textContent = row;
        label.title = `${tier.label} · ₦${tier.price.toLocaleString("en-NG")}`;
      }
    });

    // Apply the right tier price to every seat in each row, based on
    // the seat id's leading letter (A1, A2... vs B1, B2... etc).
    document.querySelectorAll(".seat:not(.taken)").forEach((btn) => {
      const seatId = btn.dataset.seat || "";
      const row = seatId.charAt(0);
      const tier = TIER_BY_ROW[row];
      if (tier) {
        btn.dataset.price = tier.price;
        btn.dataset.tier = tier.key;
        btn.dataset.tierLabel = tier.label;
      }
    });

    // Show the lowest tier price as the headline "Ticket Price" figure,
    // with a note that it varies by row.
    if (priceEl) {
      const prices = Object.values(TIER_BY_ROW)
        .map((t) => t.price)
        .filter(Boolean);
      const minPrice = prices.length
        ? Math.min(...prices)
        : event.ticketPrice || 0;
      priceEl.textContent = "From ₦" + Number(minPrice).toLocaleString("en-NG");
    }

    renderTierLegend(TIER_BY_ROW);
  }

  // Small legend showing what each row costs, inserted just above the
  // seat map so the price difference between rows is clear before
  // anyone clicks a seat.
  function renderTierLegend(tiersByRow) {
    const seatMap = document.getElementById("seat-map");
    if (!seatMap) return;

    let legend = document.getElementById("tier-legend");
    if (!legend) {
      legend = document.createElement("div");
      legend.id = "tier-legend";
      legend.className = "flex flex-wrap gap-3 mb-4";
      seatMap.parentNode.insertBefore(legend, seatMap);
    }

    legend.innerHTML = Object.entries(tiersByRow)
      .map(
        ([row, tier]) => `
          <span class="font-cinzel text-[10px] px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            Row ${row} · ${tier.label} · ₦${tier.price.toLocaleString("en-NG")}
          </span>
        `,
      )
      .join("");
  }

  loadEventDetails();

  /* ─────────────────────────────────────────
     6. LOCAL STORAGE — SAVE ATTENDEE INFO DRAFT
  ───────────────────────────────────────── */
  const DRAFT_KEY = "nx_ticket_attendee_draft";
  const draftFields = ["full-name", "email", "phone"];

  function saveAttendeeDraft() {
    const draft = {};
    draftFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) draft[id] = el.value;
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }
  function restoreAttendeeDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    draftFields.forEach((id) => {
      const el = document.getElementById(id);
      if (el && draft[id]) el.value = draft[id];
    });
  }
  draftFields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", saveAttendeeDraft);
  });
  restoreAttendeeDraft();

  function clearAttendeeDraft() {
    localStorage.removeItem(DRAFT_KEY);

    draftFields.forEach((id) => {
      const el = document.getElementById(id);

      if (el) {
        el.value = "";
      }
    });
  }

  /* ─────────────────────────────────────────
     7. SEAT SELECTOR LOGIC
  ───────────────────────────────────────── */
  const SERVICE_FEE = 5000;
  let selectedSeats = [];

  const seatButtons = document.querySelectorAll(".seat:not(.taken)");
  const ticketQtyEl = document.getElementById("ticket-qty");
  const seatCountLabelEl = document.getElementById("seat-count-label");
  const subtotalEl = document.getElementById("subtotal");
  const serviceFeeEl = document.getElementById("service-fee");
  const totalAmountEl = document.getElementById("total-amount");
  const confirmBtn = document.getElementById("confirm-btn");
  const selectedListEl = document.getElementById("selected-list");
  const clearBtn = document.getElementById("clear-seats");

  function formatNaira(num) {
    return "₦" + num.toLocaleString("en-NG");
  }

  let appliedDiscount = null; // { code, amount, redemptionId }

  function updateSummary() {
    const count = selectedSeats.length;
    const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const fee = count > 0 ? SERVICE_FEE : 0;
    const discountAmount = appliedDiscount
      ? Math.min(appliedDiscount.amount, subtotal + fee)
      : 0;
    const total = Math.max(subtotal + fee - discountAmount, 0);

    ticketQtyEl.textContent = count + (count === 1 ? " Ticket" : " Tickets");
    seatCountLabelEl.textContent =
      count + (count === 1 ? " × VIP Ticket" : " × VIP Tickets");

    [subtotalEl, serviceFeeEl, totalAmountEl].forEach((el) => {
      el.classList.remove("price-pulse");
      void el.offsetWidth;
      el.classList.add("price-pulse");
    });

    subtotalEl.textContent = formatNaira(subtotal);
    serviceFeeEl.textContent = formatNaira(fee);
    totalAmountEl.textContent = formatNaira(total);
    selectedListEl.textContent =
      count > 0 ? selectedSeats.map((s) => s.id).join(", ") : "None";

    const discountRow = document.getElementById("discount-row");
    if (appliedDiscount && discountRow) {
      discountRow.classList.remove("hidden");
      document.getElementById("discount-amount").textContent =
        "−" + formatNaira(discountAmount);
      document.getElementById("discount-code-label").textContent =
        appliedDiscount.code;
    } else if (discountRow) {
      discountRow.classList.add("hidden");
    }

    localStorage.setItem("nx_selected_seats", JSON.stringify(selectedSeats));

    if (count > 0) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = `Confirm Payment · ${formatNaira(total)}`;
      confirmBtn.classList.remove(
        "bg-white/[0.06]",
        "text-white/30",
        "cursor-not-allowed",
      );
      confirmBtn.classList.add(
        "bg-yellow-500",
        "hover:bg-yellow-400",
        "text-black",
        "shadow-lg",
        "shadow-yellow-500/20",
        "hover:shadow-yellow-500/40",
        "hover:-translate-y-0.5",
        "cursor-pointer",
        "btn-ready",
      );
    } else {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Select Seats to Continue";
      confirmBtn.classList.add(
        "bg-white/[0.06]",
        "text-white/30",
        "cursor-not-allowed",
      );
      confirmBtn.classList.remove(
        "bg-yellow-500",
        "hover:bg-yellow-400",
        "text-black",
        "shadow-lg",
        "shadow-yellow-500/20",
        "hover:shadow-yellow-500/40",
        "hover:-translate-y-0.5",
        "cursor-pointer",
        "btn-ready",
      );
    }
  }

  /* ─── DISCOUNT CODE ─── */
  const applyDiscountBtn = document.getElementById("apply-discount-btn");
  if (applyDiscountBtn) {
    applyDiscountBtn.addEventListener("click", () => {
      const codeInput = document.getElementById("discount-code-input");
      const msgEl = document.getElementById("discount-msg");
      const code = codeInput.value.trim().toUpperCase();

      if (!code) {
        msgEl.textContent = "Please enter a code.";
        msgEl.classList.remove("hidden", "text-green-400");
        msgEl.classList.add("text-red-400");
        return;
      }

      const currentUser =
        JSON.parse(localStorage.getItem("loggedInUser")) ||
        JSON.parse(localStorage.getItem("currentUser"));

      const redemptions =
        JSON.parse(localStorage.getItem("rewardRedemptions")) || [];
      const match = redemptions.find(
        (r) =>
          r.code === code &&
          currentUser &&
          r.email === currentUser.email &&
          !r.used,
      );

      if (!match) {
        msgEl.textContent = "Invalid or already-used code.";
        msgEl.classList.remove("hidden", "text-green-400");
        msgEl.classList.add("text-red-400");
        appliedDiscount = null;
        updateSummary();
        return;
      }

      appliedDiscount = {
        code: match.code,
        amount: match.discountAmount,
        redemptionId: match.id,
      };
      msgEl.textContent = `Code applied — ${formatNaira(match.discountAmount)} off!`;
      msgEl.classList.remove("hidden", "text-red-400");
      msgEl.classList.add("text-green-400");
      updateSummary();
    });
  }

  function toggleSeat(btn) {
    const seatId = btn.dataset.seat;
    const price = parseInt(btn.dataset.price, 10);
    const tier = btn.dataset.tier || "regular";
    const tierLabel = btn.dataset.tierLabel || "Regular";
    const isSelected = btn.classList.contains("selected");

    if (isSelected) {
      btn.classList.remove(
        "selected",
        "bg-yellow-500",
        "border-yellow-600",
        "text-black",
        "font-bold",
      );
      btn.classList.add(
        "bg-white/[0.04]",
        "border-yellow-500/20",
        "text-white/65",
      );
      selectedSeats = selectedSeats.filter((s) => s.id !== seatId);
    } else {
      btn.classList.add(
        "selected",
        "bg-yellow-500",
        "border-yellow-600",
        "text-black",
        "font-bold",
      );
      btn.classList.remove(
        "bg-white/[0.04]",
        "border-yellow-500/20",
        "text-white/65",
      );
      selectedSeats.push({ id: seatId, price, tier, tierLabel });
    }
    updateSummary();
  }

  seatButtons.forEach((btn) =>
    btn.addEventListener("click", () => toggleSeat(btn)),
  );

  clearBtn.addEventListener("click", () => {
    selectedSeats = [];
    seatButtons.forEach((btn) => {
      btn.classList.remove(
        "selected",
        "bg-yellow-500",
        "border-yellow-600",
        "text-black",
        "font-bold",
      );
      btn.classList.add(
        "bg-white/[0.04]",
        "border-yellow-500/20",
        "text-white/65",
      );
    });
    updateSummary();
  });

  // Restore saved seat selection on load
  const savedSeats = localStorage.getItem("nx_selected_seats");
  if (savedSeats) {
    JSON.parse(savedSeats).forEach((s) => {
      const btn = document.querySelector(`[data-seat="${s.id}"]`);
      if (btn && !btn.classList.contains("taken")) toggleSeat(btn);
    });
  }

  updateSummary();

  /* ─────────────────────────────────────────
     8. AI SEAT RECOMMENDATION (Anthropic API)
  ───────────────────────────────────────── */
  const recommendBtn = document.getElementById("ai-recommend-btn");
  if (recommendBtn) {
    recommendBtn.addEventListener("click", async () => {
      const groupSize = document.getElementById("group-size")?.value || "1";
      const aiStatus = document.getElementById("ai-recommend-status");

      aiStatus.classList.remove("hidden");
      recommendBtn.disabled = true;
      recommendBtn.innerHTML =
        '<i class="ri-loader-4-line"></i> Finding best seats...';

      // Build list of available (not taken) seats for context
      const availableSeats = Array.from(
        document.querySelectorAll(".seat:not(.taken)"),
      )
        .map((b) => b.dataset.seat)
        .join(", ");

      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 200,
            messages: [
              {
                role: "user",
                content: `You are a seat recommendation assistant for an event venue. Available seats: ${availableSeats}.
The user wants ${groupSize} seat(s), ideally together/adjacent and close to the stage (lower row letters are closer to stage).
Return ONLY a comma-separated list of seat IDs to recommend (e.g. "A1, A2"), nothing else.`,
              },
            ],
          }),
        });
        const data = await res.json();
        const text = (data.content?.[0]?.text || "").trim();
        const recommended = text
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        // Clear previous suggestions
        document
          .querySelectorAll(".seat.suggested")
          .forEach((s) => s.classList.remove("suggested"));

        // Highlight recommended seats
        recommended.forEach((seatId) => {
          const btn = document.querySelector(`[data-seat="${seatId}"]`);
          if (btn && !btn.classList.contains("taken"))
            btn.classList.add("suggested");
        });

        if (recommended.length) {
          aiStatus.textContent = `✨ Suggested: ${recommended.join(", ")} — click to select`;
        } else {
          aiStatus.textContent =
            "Could not find a recommendation, please select manually.";
        }
      } catch (err) {
        aiStatus.textContent =
          "AI recommendation unavailable. Please select seats manually.";
      } finally {
        recommendBtn.disabled = false;
        recommendBtn.innerHTML =
          '<i class="ri-sparkling-line"></i> AI Recommend Seats';
      }
    });
  }

  /* ─────────────────────────────────────────
     9. CONFIRM PAYMENT
  ───────────────────────────────────────── */

  // Who's booking — same auth pattern as the dashboards (loggedInUser / currentUser)
  function getCurrentUser() {
    return (
      JSON.parse(localStorage.getItem("loggedInUser")) ||
      JSON.parse(localStorage.getItem("currentUser"))
    );
  }

  // Bump the matching event's sold count in the "events" array so the
  // organizer dashboard's totals/progress bars reflect this sale.
  function markSeatsSold(eventCtx, seatCount) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const idx = events.findIndex(
      (ev) =>
        (eventCtx.id && ev.id === eventCtx.id) ||
        (eventCtx.name && ev.name === eventCtx.name),
    );
    if (idx === -1) return;

    events[idx].sold = (Number(events[idx].sold) || 0) + seatCount;
    const total = Number(events[idx].totalTickets) || 0;
    if (total && events[idx].sold >= total) events[idx].status = "Sold Out";

    localStorage.setItem("events", JSON.stringify(events));
  }

  function saveBooking({ name, email, phone, eventCtx, total }) {
    const user = getCurrentUser();
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    const events = JSON.parse(localStorage.getItem("events")) || [];
    const matchedEvent = events.find(
      (ev) =>
        (eventCtx.id && ev.id === eventCtx.id) ||
        (eventCtx.name && ev.name === eventCtx.name),
    );

    // Reflect the real tiers purchased, e.g. "VIP" or "2 VIP, 1 Regular"
    const tierCounts = {};
    selectedSeats.forEach((s) => {
      const label = s.tierLabel || "Regular";
      tierCounts[label] = (tierCounts[label] || 0) + 1;
    });
    const ticketTypeSummary = Object.entries(tierCounts)
      .map(([label, n]) => (n > 1 ? `${n} ${label}` : label))
      .join(", ");

    bookings.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      eventId: eventCtx.id || "",
      eventName:
        (matchedEvent && matchedEvent.name) || eventCtx.name || "Event",
      attendeeEmail: (user && user.email) || email,
      attendeeName: name,
      phone,
      seats: selectedSeats.map((s) => s.id),
      quantity: selectedSeats.length,
      ticketType: ticketTypeSummary || "General",
      totalPaid: total,
      status: "upcoming",
      bookedAt: new Date().toISOString(),
    });

    localStorage.setItem("bookings", JSON.stringify(bookings));
    markSeatsSold(eventCtx, selectedSeats.length);

    // --- notify the organizer (write directly to storage — the bell
    // component isn't loaded on this page, so window.NXNotify doesn't exist here) ---
    if (matchedEvent && matchedEvent.organizerEmail) {
      const notifications =
        JSON.parse(localStorage.getItem("nx_notifications")) || [];
      notifications.push({
        id: "n_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        forRole: "organizer",
        forEmail: matchedEvent.organizerEmail,
        type: "sale",
        eventId: matchedEvent.id,
        eventName: matchedEvent.name,
        message: `${name} just bought ${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""} for ${matchedEvent.name}`,
        timestamp: Date.now(),
        read: false,
      });
      localStorage.setItem("nx_notifications", JSON.stringify(notifications));
    }
  }

  function showFieldError(msg) {
    alert(msg);
  }

  const PAYSTACK_CONFIG = {
    publicKey: "pk_test_120fda7cb1111f7a8c70b74ffba361aed3cdc10c",
    currency: "NGN",
  };

  function generatePaymentReference() {
    return `NX-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  function initializePaystackPayment(orderData) {
    const handler = PaystackPop.setup({
      key: PAYSTACK_CONFIG.publicKey,

      email: orderData.email,

      amount: orderData.total * 100,

      currency: "NGN",

      ref: generatePaymentReference(),

      metadata: {
        eventId: orderData.eventCtx.id,
        eventName: orderData.eventCtx.name,
        ticketType: orderData.ticketType,
        quantity: orderData.quantity,
        selectedSeats: orderData.selectedSeats,
        totalAmount: orderData.total,
        customerName: orderData.name,
        phoneNumber: orderData.phone,
      },

      callback(response) {
        verifyPayment(response.reference, orderData);
      },

      onClose() {
        alert("Payment cancelled.");
        confirmBtn.disabled = false;
        updateSummary();
      },
    });

    handler.openIframe();
  }

  function verifyPayment(reference, orderData) {
    // TODO:
    // Send reference to backend for verification.

    saveTicketPurchase(reference, orderData);
  }

  function saveTicketPurchase(reference, orderData) {
    const purchase = {
      ticketId: "TKT-" + crypto.randomUUID(),

      orderId: "ORD-" + crypto.randomUUID(),

      paymentReference: reference,

      eventId: orderData.eventCtx.id,

      eventName: orderData.eventCtx.name,

      ticketType: orderData.ticketType,

      quantity: orderData.quantity,

      selectedSeats: orderData.selectedSeats,

      amountPaid: orderData.total,

      customerName: orderData.name,

      email: orderData.email,

      phone: orderData.phone,

      paymentStatus: "Paid",

      purchaseDate: new Date().toISOString(),
    };

    

    localStorage.setItem("ticketPurchase", JSON.stringify(purchase));

    saveBooking(orderData);

// Notification for attendee
if (window.NXNotify) {
    NXNotify.push({
        forRole: "attendee",
        forEmail: purchase.email,
        type: "sale",
        eventId: purchase.eventId,
        eventName: purchase.eventName,
        message: `Your ticket for "${purchase.eventName}" has been purchased successfully.`
    });

    NXNotify.push({
        forRole: "attendee",
        forEmail: purchase.email,
        type: "event_update",
        eventId: purchase.eventId,
        eventName: purchase.eventName,
        message: `Payment of ₦${purchase.amountPaid.toLocaleString()} was successful.`
    });
}

if (window.NXNotify) {
    NXNotify.push({
        forRole: "organizer",
        forEmail: purchase.organizerEmail, // replace with your organizer's email if stored
        type: "sale",
        eventId: purchase.eventId,
        eventName: purchase.eventName,
        message: `${purchase.customerName} purchased ${purchase.quantity} ${purchase.ticketType} ticket(s).`
    });
}

    // Clear checkout drafts
    clearAttendeeDraft();

    localStorage.removeItem("nx_selected_seats");

    selectedSeats.length = 0;

    window.location.href = "ticket-success.html";
  }

  // THIS WAS MISSING — nothing ever called saveBooking() or ran the
  // payment simulation, so clicking Confirm Payment did nothing.
  confirmBtn.addEventListener("click", () => {
    if (confirmBtn.disabled) return;

    const name = document.getElementById("full-name").value.trim();

    const email = document.getElementById("email").value.trim();

    const phone = document.getElementById("phone").value.trim();

    if (!name || !email || !phone) {
      showFieldError("Please fill in your full name, email and phone number.");

      return;
    }

    const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    const fee = selectedSeats.length ? SERVICE_FEE : 0;

    const discount = appliedDiscount
      ? Math.min(appliedDiscount.amount, subtotal + fee)
      : 0;

    const total = subtotal + fee - discount;

    const eventCtx = getEventContext();

    const tierCounts = {};

    selectedSeats.forEach((seat) => {
      tierCounts[seat.tierLabel] = (tierCounts[seat.tierLabel] || 0) + 1;
    });

    const ticketType = Object.entries(tierCounts)
      .map(([type, qty]) => (qty > 1 ? `${qty} ${type}` : type))
      .join(", ");

    initializePaystackPayment({
      name,

      email,

      phone,

      total,

      quantity: selectedSeats.length,

      selectedSeats: selectedSeats.map((s) => s.id),

      ticketType,

      eventCtx,
    });
  });

  /* ─────────────────────────────────────────
     10. CARD INPUT FORMATTING
  ───────────────────────────────────────── */
  const cardInput = document.getElementById("card-number");
  if (cardInput) {
    cardInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 16);
      e.target.value = val.replace(/(.{4})/g, "$1 ").trim();
    });
  }
  const expiryInput = document.getElementById("card-expiry");
  if (expiryInput) {
    expiryInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (val.length >= 3) val = val.slice(0, 2) + " / " + val.slice(2);
      e.target.value = val;
    });
  }
});
