# Nice-Xclusive: Event Booking Platform

A multi-page, dark luxury event booking website. Attendees can discover events, pick seats and manage their tickets, while organizers create events and track sign-ups and sales from their own dashboard.

**Live demo:** https://nice-xclusive-events.vercel.app

> Sign up with any email to explore both the attendee and organizer sides. All data is stored in your own browser, so every visitor starts with a clean slate.

## Features

- **Two user roles**: role-based sign-in sends attendees and organizers to separate dashboards
- **Multi-step sign-up wizard**: Details, Password, Done
- **Event discovery**: event listings and a detail page for each event
- **Interactive seat selection** on the ticket page
- **Live countdown timers**, scroll-reveal animations and a lightbox image viewer
- **In-app notifications**: organizers see sign-ups and ticket sales, attendees see event updates
- **Dashboards**: attendee pages (my events, my tickets, saved events, schedule, order history, reviews) and organizer pages (events, analytics, revenue, payouts, vendors, settings)
- **Dynamic content** loaded from a REST API (JSONPlaceholder)
- **Data persistence** with `localStorage`
- Consistent dark luxury theme across every page

## Tech Stack

- HTML5
- Tailwind CSS
- Vanilla JavaScript (ES6+)
- JSONPlaceholder REST API
- Deployed on Vercel

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/ifeco1765-beep/Learning-Html-Tailwindcss.git
   cd Learning-Html-Tailwindcss
   ```

2. Install dependencies (if the project has a `package.json`):

   ```bash
   npm install
   ```

3. Build the Tailwind CSS (re-run after changing styles):

   ```bash
   npx tailwindcss -i ./src/input.css -o ./src/output.css
   ```

4. Open the `src` folder with a local server. With the VS Code Live Server extension, right-click `src/index.html` and choose **Open with Live Server**.

## Project Structure

```
src/
├── index.html            Landing page
├── Tickets.html          Ticket and seat selection
├── event-details.html    Single event page
├── sign-in.html          Sign in
├── sign-up.html          Multi-step sign-up
├── dashboard.html        Attendee dashboard
├── organizer.html        Organizer dashboard
├── Services.html, Aboutus.html, Contact-us.html, vendors.html, terms.html
├── ticket.js             Seat selection and booking logic
├── input.css             Tailwind source
└── output.css            Compiled Tailwind CSS
```

## How It Works

There is no backend. Accounts, events and notifications are kept in the browser's `localStorage`, and the user's role decides which dashboard they see after signing in.

## Author

**Ndukaife Ifeanyi**
- GitHub: [@ifeco1765-beep](https://github.com/ifeco1765-beep)
- LinkedIn: [Ndukaife Ifeanyi](https://www.linkedin.com/in/ndukaife-ifeanyi-07a406331/)
