// Demo inventory for the travel verticals: flights, rental cars,
// activities and airport transfers. Hand-written, Pakistan-first,
// the way the hotel listings are — no generator, no filler rows.
const Flight = require('./models/Flight');
const Car = require('./models/Car');
const Activity = require('./models/Activity');
const Transfer = require('./models/Transfer');

const flights = [
  { airline: 'PIA', flightNumber: 'PK-302', from: 'Lahore', to: 'Karachi', departAt: '08:30', arriveAt: '10:20', duration: '1h 50m', stops: 0, price: 18400, seatsLeft: 14 },
  { airline: 'PIA', flightNumber: 'PK-303', from: 'Karachi', to: 'Lahore', departAt: '18:00', arriveAt: '19:50', duration: '1h 50m', stops: 0, price: 18400, seatsLeft: 9 },
  { airline: 'Airblue', flightNumber: 'PA-201', from: 'Islamabad', to: 'Karachi', departAt: '07:00', arriveAt: '09:00', duration: '2h 00m', stops: 0, price: 16900, seatsLeft: 21 },
  { airline: 'Airblue', flightNumber: 'PA-202', from: 'Karachi', to: 'Islamabad', departAt: '20:30', arriveAt: '22:30', duration: '2h 00m', stops: 0, price: 16900, seatsLeft: 17 },
  { airline: 'SereneAir', flightNumber: 'ER-501', from: 'Lahore', to: 'Islamabad', departAt: '09:15', arriveAt: '10:05', duration: '50m', stops: 0, price: 9500, seatsLeft: 12 },
  { airline: 'SereneAir', flightNumber: 'ER-502', from: 'Islamabad', to: 'Lahore', departAt: '19:45', arriveAt: '20:35', duration: '50m', stops: 0, price: 9500, seatsLeft: 8 },
  { airline: 'AirSial', flightNumber: 'PF-121', from: 'Multan', to: 'Karachi', departAt: '11:00', arriveAt: '12:30', duration: '1h 30m', stops: 0, price: 14200, seatsLeft: 6 },
  { airline: 'AirSial', flightNumber: 'PF-122', from: 'Karachi', to: 'Multan', departAt: '15:30', arriveAt: '17:00', duration: '1h 30m', stops: 0, price: 14200, seatsLeft: 11 },
  { airline: 'Emirates', flightNumber: 'EK-623', from: 'Karachi', to: 'Dubai', departAt: '04:15', arriveAt: '05:35', duration: '2h 20m', stops: 0, price: 68500, seatsLeft: 19 },
  { airline: 'Qatar Airways', flightNumber: 'QR-611', from: 'Lahore', to: 'Doha', departAt: '03:40', arriveAt: '05:20', duration: '2h 40m', stops: 0, price: 72400, seatsLeft: 15 },
  { airline: 'Saudia', flightNumber: 'SV-703', from: 'Islamabad', to: 'Jeddah', departAt: '10:20', arriveAt: '13:40', duration: '4h 20m', stops: 0, price: 91800, seatsLeft: 10 },
  { airline: 'FlyDubai', flightNumber: 'FZ-342', from: 'Karachi', to: 'Dubai', departAt: '22:10', arriveAt: '23:25', duration: '2h 15m', stops: 0, price: 54900, seatsLeft: 23 },
];

const cars = [
  { name: 'Toyota Corolla', type: 'Sedan', city: 'Lahore', pricePerDay: 6500, seats: 5, transmission: 'Automatic', fuel: 'Petrol', features: ['AC', 'Free cancellation'] },
  { name: 'Honda Civic', type: 'Sedan', city: 'Lahore', pricePerDay: 7800, seats: 5, transmission: 'Automatic', fuel: 'Petrol', features: ['AC', 'Free cancellation'] },
  { name: 'Honda City', type: 'Sedan', city: 'Lahore', pricePerDay: 5800, seats: 5, transmission: 'Automatic', fuel: 'Petrol', features: ['AC'] },
  { name: 'Suzuki Swift', type: 'Hatchback', city: 'Karachi', pricePerDay: 4200, seats: 5, transmission: 'Manual', fuel: 'Petrol', features: ['AC'] },
  { name: 'Toyota Yaris', type: 'Sedan', city: 'Karachi', pricePerDay: 5200, seats: 5, transmission: 'Automatic', fuel: 'Petrol', features: ['AC', 'Free cancellation'] },
  { name: 'Toyota Hilux Revo', type: 'Pickup', city: 'Karachi', pricePerDay: 11000, seats: 5, transmission: 'Manual', fuel: 'Diesel', features: ['AC', '4x4'] },
  { name: 'KIA Sportage', type: 'SUV', city: 'Islamabad', pricePerDay: 9500, seats: 5, transmission: 'Automatic', fuel: 'Petrol', features: ['AC', 'Free cancellation'] },
  { name: 'Hyundai Tucson', type: 'SUV', city: 'Islamabad', pricePerDay: 9200, seats: 5, transmission: 'Automatic', fuel: 'Petrol', features: ['AC'] },
  { name: 'Toyota Fortuner', type: 'SUV', city: 'Multan', pricePerDay: 12500, seats: 7, transmission: 'Automatic', fuel: 'Diesel', features: ['AC', '7 seats'] },
  { name: 'Suzuki Alto', type: 'Hatchback', city: 'Multan', pricePerDay: 3200, seats: 4, transmission: 'Manual', fuel: 'Petrol', features: ['AC'] },
];

const activities = [
  { title: 'Lahore Food Street Evening Tour', city: 'Lahore', category: 'Tour', price: 3500, duration: '4 hours', rating: 4.8, reviewCount: 214, description: 'Taste Lahori chargha, falooda and lassi with a local guide on Fort Food Street.' },
  { title: 'Badshahi Mosque & Lahore Fort Heritage Walk', city: 'Lahore', category: 'Tour', price: 2800, duration: '3 hours', rating: 4.9, reviewCount: 341, description: 'A guided walk through the mosque courtyard, the fort museums and the Sheesh Mahal.' },
  { title: 'Hunza Valley Day Trip from Gilgit', city: 'Hunza', category: 'Day trip', price: 12500, duration: 'Full day', rating: 4.9, reviewCount: 128, description: 'Baltit Fort, Attabad Lake and the Passu Cones in one long, unhurried day.' },
  { title: 'Murree Hills & Patriata Chairlift Tour', city: 'Murree', category: 'Day trip', price: 6800, duration: 'Full day', rating: 4.6, reviewCount: 189, description: 'Mall Road in the morning, the chairlift over the pines after lunch.' },
  { title: 'Karachi Clifton Beach & Do Darya Dinner', city: 'Karachi', category: 'Experience', price: 4200, duration: '5 hours', rating: 4.5, reviewCount: 96, description: 'Sunset on the beach, then dinner at a Do Darya restaurant over the water.' },
  { title: 'Margalla Hills Hiking Trail 3', city: 'Islamabad', category: 'Experience', price: 1800, duration: '3 hours', rating: 4.7, reviewCount: 203, description: 'A guided climb up Trail 3 with a viewpoint stop and water provided.' },
  { title: 'Mohenjo-daro Archaeological Day Trip', city: 'Larkana', category: 'Day trip', price: 8900, duration: 'Full day', rating: 4.8, reviewCount: 74, description: 'The Great Bath, the granary and the museum, with a guide who knows the digs.' },
  { title: 'Multan Shrines & Blue Pottery Tour', city: 'Multan', category: 'Tour', price: 3200, duration: '4 hours', rating: 4.7, reviewCount: 156, description: 'Shah Rukn-e-Alam, the old city lanes and a working blue-pottery workshop.' },
  { title: 'Skardu Lakes: Shangrila & Upper Kachura', city: 'Skardu', category: 'Day trip', price: 14500, duration: 'Full day', rating: 4.9, reviewCount: 88, description: 'Two lakes, one jeep, and a lakeside lunch in the mountains.' },
  { title: 'Faisal Mosque & Daman-e-Koh Sunset Tour', city: 'Islamabad', category: 'Tour', price: 2400, duration: '3 hours', rating: 4.8, reviewCount: 267, description: 'The mosque at golden hour, then the city lights from Daman-e-Koh.' },
];

const transfers = [
  { airport: 'Allama Iqbal Airport, Lahore (LHE)', destination: 'Gulberg, Lahore', vehicleType: 'Sedan', price: 2800, capacity: 3, features: ['Meet & greet', 'Flight tracking'] },
  { airport: 'Allama Iqbal Airport, Lahore (LHE)', destination: 'DHA Lahore', vehicleType: 'Sedan', price: 3200, capacity: 3, features: ['Meet & greet', 'Flight tracking'] },
  { airport: 'Allama Iqbal Airport, Lahore (LHE)', destination: 'DHA Lahore', vehicleType: 'Van', price: 4800, capacity: 6, features: ['Meet & greet', 'Flight tracking'] },
  { airport: 'Jinnah Airport (KHI)', destination: 'Clifton, Karachi', vehicleType: 'Sedan', price: 2600, capacity: 3, features: ['Meet & greet', 'Flight tracking'] },
  { airport: 'Jinnah Airport (KHI)', destination: 'DHA Karachi', vehicleType: 'Sedan', price: 3000, capacity: 3, features: ['Meet & greet', 'Flight tracking'] },
  { airport: 'Islamabad Airport (ISB)', destination: 'F-7, Islamabad', vehicleType: 'Sedan', price: 2400, capacity: 3, features: ['Meet & greet', 'Flight tracking'] },
  { airport: 'Islamabad Airport (ISB)', destination: 'Blue Area, Islamabad', vehicleType: 'Van', price: 4200, capacity: 6, features: ['Meet & greet', 'Flight tracking'] },
  { airport: 'Multan Airport (MUX)', destination: 'Bosan Road, Multan', vehicleType: 'Sedan', price: 1800, capacity: 3, features: ['Meet & greet', 'Flight tracking'] },
];

async function insertVerticalData() {
  await Promise.all([
    Flight.deleteMany({}),
    Car.deleteMany({}),
    Activity.deleteMany({}),
    Transfer.deleteMany({}),
  ]);
  await Promise.all([
    Flight.insertMany(flights),
    Car.insertMany(cars),
    Activity.insertMany(activities),
    Transfer.insertMany(transfers),
  ]);
}

module.exports = { insertVerticalData };
