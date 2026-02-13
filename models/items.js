const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'warehouse'
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // NEW FIELD: Tracks when quantity/price last changed
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('item', ItemSchema);