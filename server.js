const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function makeSlots(bookings) {
  let slots = [];
  for (let i = 1; i <= 20; i++) {
    let id = 'A-' + i;
    let b = bookings.find(x => x.slot === id);
    if (b) {
      slots.push({ id: id, name: b.name, car: b.plate, booked: true });
    } else {
      slots.push({ id: id, name: '', car: '', booked: false });
    }
  }
  return slots;
}

app.get('/api/slots', async (req, res) => {
  const { data, error } = await supabase.from('bookings').select('*');
  if (error) return res.json(makeSlots([]));
  res.json(makeSlots(data));
});

app.post('/api/book', async (req, res) => {
  const { id, name, car } = req.body;
  const { error } = await supabase.from('bookings').insert([
    { slot: id, name: name, plate: car }
  ]);
  if (error) return res.json({ message: 'Error: ' + error.message });
  res.json({ message: 'Book Ho Gaya!' });
});

app.post('/api/free', async (req, res) => {
  const { id } = req.body;
  await supabase.from('bookings').delete().eq('slot', id);
  res.json({ message: 'Slot Khali Ho Gaya!' });
});

module.exports = app;

if (require.main === module) {
  app.listen(3000, () => console.log('Server chal raha hai http://localhost:3000'));
}
