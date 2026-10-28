# StayBook — hotel booking platform

A hotel booking website for Pakistan: search stays across 15 cities,
check real room availability, and book with the price worked out in
rupees. React + Vite + Bootstrap on the front, Express + MongoDB
(Mongoose) on the back.

## What it does

- **Search + filters:** destination, budget, property type, stars,
  review score, amenities, free cancellation, breakfast, bed type,
  pets allowed. Sort by price, rating, or distance from the city
  center, with pages when there are more results than one page.
- **Travel tabs (Stays, Flights, Car rental, Attractions, Airport
  taxis):** 12 daily flights, 10 rental cars, 10 tours and day
  trips, and 8 fixed-price airport pickups, all searchable and
  bookable the same way as stays — pay on the day, with the price
  worked out on the server. Bookings show under My trips and can
  also be found without an account by reference + email.
- **Guest bookings:** a booking made without an account can be
  found and cancelled later from `/booking-lookup` with its
  reference and checkout email. Signed-in guests can also move a
  booking to new dates (availability re-checked, price reworked).
- **Children's ages:** the search asks each child's age, and it is
  stored on the booking for the hotel.
- **Similar stays and recently viewed:** each hotel page shows
  other stays in the same city and the stays you looked at before,
  plus copy-link and WhatsApp share buttons.
- **Hotel pages:** photo gallery, map with the approximate area,
  nearby places, category review scores, house rules and fine print,
  host notes, guest reviews with host replies, Q&A, and a room table
  that shows how many units are actually free for your dates.
- **Checkout in three steps:** your selection, your details, finish.
  The price shows its working: subtotal + 16% GST, minus your
  loyalty discount and any coupon.
- **Payments:** pay at the property (the default), card via Stripe,
  or JazzCash/Easypaisa with a transaction ID that an admin verifies
  by hand. Card and email only switch on once their keys are set
  (see below) — nothing is ever faked as paid.
- **Accounts:** sign up, sign in, forgot/reset password, email
  verification, your trips with cancel, wishlist, price alerts,
  loyalty tier (Bronze, Silver 10% off after 5 stays, Gold 15% off
  after 15), and your own listings with edit and delete.
- **Admin page (`/admin`):** latest bookings, payments with manual
  wallet verification, and coupon management.
- **Hosts:** list a property with rooms, photos, rules and location.
- **Languages:** English and Urdu. **Currencies:** PKR, USD, EUR, GBP
  (display only — the server always stores PKR).

## Demo data

24 stays across 15 Pakistani cities, each written out individually
(no two listings read the same), with guest reviews, deals, and
three discount codes: WELCOME10 (10%), STAY15 (15%), FAMILY20 (20%).
The travel verticals seed alongside: 12 flights, 10 rental cars,
10 activities and 8 airport transfers.

Sign in with:

- Guest: demo@staybook.local / demo1234
- Admin: admin@staybook.local / admin1234

These accounts live in the seed data, not in the code. On a fresh
database the server inserts them on first start; run `npm run seed`
in `server/` any time you want to reset the data. A new hotel is one
new entry in `server/src/seedData.js`.

## Run it

```bash
# Server settings first: copy server/.env.example to server/.env
# and fill it in (JWT_SECRET is required, the rest can wait).
cd server && npm install && npm run dev
cd ../client && npm install && npm run dev
```

Server on :5000, client on :5173. With MONGO_URI empty the server
uses an in-memory database, so it runs on a fresh machine with
nothing to install.

## Settings

Server (`server/.env`):

| Variable | Needed for |
| --- | --- |
| MONGO_URI | A real database (Atlas or local mongod). Empty = in-memory, data gone on restart. |
| JWT_SECRET | Sign-in tokens. Required — the server refuses to start without it. |
| CLIENT_URL | The frontend origin allowed to call the API, and the links in emails. |
| SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM | Emails (welcome, verification, password reset, booking). Without these the site works fine, it just skips sending mail. |
| STRIPE_SECRET_KEY | Card payments. Without it the card option stays hidden. |
| STRIPE_WEBHOOK_SECRET | The webhook at `/api/payments/webhook` that marks card payments paid. Register the URL in the Stripe dashboard. |

Client: `VITE_STRIPE_PUBLISHABLE_KEY` — the card option appears only
when this is set (together with the server key above).

## Live deployment

- Frontend: Vercel (project "staybook", root `client`). `/api/*`
  rewrites to the Render backend; everything else falls back to
  `index.html`, so deep links work.
- Backend: Render (service `staybook-api`, root `server`,
  `npm install` then `npm start`). Free instances sleep when idle,
  so the first request after a while takes a minute to wake up.
- Database: MongoDB Atlas (free cluster).
- Both Vercel and Render redeploy automatically on push to `main`.
- One note on the demo data: a database holding the very first demo
  dataset (listings without coordinates) is upgraded to the
  rewritten listings once, automatically, on the next server start.
  Registered users and contact messages are kept.

## Project layout

- `client/src/pages/` — one file per page
- `client/src/components/` — cards, search bar, filters, map, navbar, footer
- `client/src/i18n/` — English and Urdu strings
- `server/src/routes/` — API endpoints
- `server/src/models/` — MongoDB schemas
- `server/src/services/` — availability, loyalty, coupons, email
- `server/src/seedData.js` — demo listings, reviews, users, coupons
