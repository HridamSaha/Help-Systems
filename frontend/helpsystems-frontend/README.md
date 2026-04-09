# SafeReach — Anonymous Help & Resource System
### Web-Based Anonymous Help & Resource Mapping System for Women and Children

---

## Tech Stack
- **Frontend:** React 18 + Vite
- **Routing:** React Router DOM v6
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Lucide React
- **Styling:** CSS Modules (custom design system)
- **API:** Proxied to Spring Boot backend at `http://localhost:8080`

---

## Project Structure

```
src/
├── api.js                   # All API calls (maps to Spring Boot endpoints)
├── App.jsx                  # Router setup
├── index.css                # Global design system (CSS variables, utilities)
├── main.jsx
│
├── components/
│   ├── Navbar.jsx / .module.css
│   ├── Footer.jsx / .module.css
│   └── ToastProvider.jsx    # Global toast notifications
│
└── pages/
    ├── Home.jsx / .module.css          # Landing page
    ├── SubmitRequest.jsx / .module.css # Anonymous form with AI urgency
    ├── TrackRequest.jsx / .module.css  # Track by request ID
    ├── Resources.jsx / .module.css     # Issue-based resource directory
    └── AdminDashboard.jsx / .module.css # Admin panel with charts & table
```

---

## Setup & Run

```bash
# Install dependencies
npm install

# Run development server (proxies /api → localhost:8080)
npm run dev

# Build for production
npm run build
```

The Vite dev server auto-proxies `/api/*` to your Spring Boot backend.
Make sure your backend is running on `http://localhost:8080`.

---

## API Endpoints Used

| Frontend Action         | Method | Endpoint                    |
|------------------------|--------|-----------------------------|
| Submit help request    | POST   | `/api/help/submit`          |
| Track by request ID    | GET    | `/api/help/track/:requestId`|
| Get all requests       | GET    | `/api/help/all`             |
| Update status          | PUT    | `/api/help/status`          |
| Reassign authority     | PUT    | `/api/help/reassign`        |
| Get resources by type  | GET    | `/api/resources/:issueType` |
| Add resource (admin)   | POST   | `/api/resources/add`        |

---

## Pages & Features

| Page              | Route       | Features                                                           |
|-------------------|-------------|--------------------------------------------------------------------|
| Home              | `/`         | Hero, issue type grid, how-it-works, feature cards, CTA           |
| Submit Request    | `/submit`   | Anonymous form, AI urgency detection, issue selector, result modal |
| Track Request     | `/track`    | Request ID lookup, visual stepper, status details                  |
| Resources         | `/resources`| Issue-filtered resource directory, emergency numbers               |
| Admin Dashboard   | `/admin`    | Stats, Doughnut + Bar charts, searchable table, inline edit        |

---

## Design System

- **Font:** Playfair Display (headings) + Nunito (body)
- **Colors:** Warm rose `#e8536a` · Mauve `#9b6b7e` · Cream `#fdf6f0`
- **Theme:** Warm, safe, empowering — not clinical or cold
- **Responsive:** All pages are fully mobile-responsive

---

## Notes

- The admin dashboard includes **mock data fallback** so it works without a backend connection.
- The **AI urgency detection** on the submit form is client-side keyword analysis (can be replaced with real API call).
- The **resources page** falls back to hardcoded helplines if the backend returns no data.
