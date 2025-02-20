const mongoose = require('mongoose');

const guestBookEntrySchema = new mongoose.Schema({
  nama: { type: String, required: true },
  instansi: { type: String, required: true },
  tanggal: { type: Date, required: true },
  tujuan: { type: String, required: true },
  kategori: { type: String, required: true },
  tandaTangan: { type: String, required: true },
});

const GuestBookEntry = mongoose.model('GuestBookEntry', guestBookEntrySchema);
module.exports = GuestBookEntry;