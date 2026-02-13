/* ==============================================
   API.JS - Handling Warehouses & Items
   ============================================== */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Security Guard
const Warehouse = require('../models/warehouse');
const Item = require('../models/items');

// --- WAREHOUSE ROUTES ---

// @route   POST /api/data/warehouse
// @desc    Create a new warehouse
// @access  Private (Logged in users only)
router.post('/warehouse', auth, async (req, res) => {
    try {
        const { name, location } = req.body;

        const newWarehouse = new Warehouse({
            name,
            location,
            user: req.user.id // Link it to the logged-in user
        });

        const warehouse = await newWarehouse.save();
        res.json(warehouse);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/data/warehouses
// @desc    Get all warehouses for the current user
// @access  Private
router.get('/warehouses', auth, async (req, res) => {
    try {
        // Find warehouses that belong to THIS user
        const warehouses = await Warehouse.find({ user: req.user.id }).sort({ date: -1 });
        res.json(warehouses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- ITEM ROUTES ---

// @route   POST /api/data/item
// @desc    Add an item to a specific warehouse
// @access  Private
router.post('/item', auth, async (req, res) => {
    try {
        const { warehouseId, name, category, quantity, price } = req.body;

        const newItem = new Item({
            warehouse: warehouseId,
            name,
            category,
            quantity,
            price
        });

        const item = await newItem.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/data/items/:warehouseId
// @desc    Get all items for a specific warehouse
// @access  Private
router.get('/items/:warehouseId', auth, async (req, res) => {
    try {
        const items = await Item.find({ warehouse: req.params.warehouseId });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/data/item/:id
// @desc    Update an item (Quantity, Price, Name)
// @access  Private
router.put('/item/:id', auth, async (req, res) => {
    try {
        const { name, quantity, price } = req.body;
        
        let item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });

        item.name = name;
        item.quantity = quantity;
        item.price = price;
        item.lastUpdated = Date.now(); // UPDATE THE DATE

        await item.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/item/:id', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ msg: 'Item not found' });
        }

        // Use deleteOne() to remove the document
        await item.deleteOne();

        res.json({ msg: 'Item removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;