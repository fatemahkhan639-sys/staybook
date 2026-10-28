# StayBook — hotel booking platform

A full MERN-stack hotel booking website, built with the same pages
and booking flow as the big booking sites: search, filters, hotel
detail pages, a three-step checkout, guest reviews, accounts, and
trip management.

## Stack

- **Frontend:** React (Vite) + Bootstrap + React Router
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)

## Pages

| Route | Page |
| --- | --- |
| `/` | Homepage — hero search, property types, offers, featured stays, destinations |
| `/search` | Results — destination search, budget/type/stars/score/amenity filters, sorting |
| `/hotel/:id` | Property detail — gallery, amenities, room availability table, house rules, reviews |
| `/checkout` | Booking flow — 1. Your selection, 2. Your details, 3. Finish booking |
| `/deals` | Today's deals — stays with a cut price and discount badge |
| `/destinations` | Browse by destination — every city with its hotel count |
| `/help` | Help Center — booking, payment and account questions, answered |
| `/login`, `/register` | Sign in / create an account |
| `/my-bookings` | Manage your trips — view and cancel bookings |
| `/list-property` | List your own property |

Demo data: 24 stays across 15 Pakistani cities in 7 property types
(Hotel, Apartment, Resort, Villa, Hostel, Lodge, Guest House), with
discount deals on some stays and guest reviews on every hotel, so
no page looks empty. Adding another hotel is one new row in
`server/src/seedData.js`.

## Run it

```bash
# 0. Server settings file — pehli dafa zaroori hai, warna login
#    kaam nahi kare ga. server/.env.example ko copy karke server/.env
#    naam dein (andar ki values waisi hi rehne dein).
#    Windows:  copy .env.example .env
#    Mac/Linux: cp .env.example .env

# 1. Backend (port 5000) — terminal 1
cd server
npm install
npm run dev

# 2. Frontend (port 5173) — terminal 2 (pehli terminal khuli rakhen)
cd client
npm install
npm run dev
```

Open http://localhost:5173.

**Demo account:** demo@staybook.local / demo1234

> Note: database khaali ho to server pehli dafa khud hi 4 demo
> hotels aur demo account daal deta hai, is liye `npm run seed`
> sirf data reset karne ke liye hai, roz chalane ke liye nahi.

## Database

If `MONGO_URI` is set in `server/.env` (local MongoDB or a MongoDB
Atlas cluster), the server uses it. Otherwise it starts an
in-memory MongoDB automatically, so the project runs anywhere
without installing MongoDB first. Copy `server/.env.example` to
`server/.env` and fill in your values.

On this machine a MongoDB binary is already extracted at
`server/.mongodb-bin/bin/mongod`. Start it once with:

```bash
./server/.mongodb-bin/bin/mongod --dbpath ./server/.mongodb-data \
  --bind_ip 127.0.0.1 --port 27017 --fork \
  --logpath ./server/.mongodb-data/mongod.log
```

Then `MONGO_URI=mongodb://127.0.0.1:27017/staybook` in `server/.env`
just works. On your own computer, install MongoDB normally or use
a free Atlas cluster instead.

## How the booking flow works

1. Search a destination and dates, open a hotel, pick a room and
   room count in the availability table.
2. Step 1 shows the selection and total. "I'll reserve" moves on —
   nothing is charged yet.
3. Step 2 collects guest details (works signed in or as a guest).
4. Step 3 confirms the booking and shows its reference. Signed-in
   guests find it under "My trips", where they can cancel it.

## Project layout

```
server/src/
  config/db.js        database connection (real or in-memory MongoDB)
  models/             User, Hotel, Booking, Review
  routes/             auth, hotels, bookings, reviews
  middleware/auth.js  JWT checks (required + optional)
  server.js           Express app
  seed.js             demo data
client/src/
  pages/              one file per page
  components/         Navbar, SearchBar, HotelCard, FilterSidebar, Footer
  context/            signed-in guest state
  services/api.js     every API call goes through here
```

## Notes

- Prices are in PKR per night in the demo data.
- Email confirmation is not wired up: the confirmation step says
  so honestly instead of pretending an email was sent.
- Payment is intentionally not included: the reference flow
  reserves first and charges later, and real card handling needs a
  payment provider (Stripe) added with its own keys.
