/* ==========================================================================
   APP.JS - Main Client-Side Logic
   --------------------------------------------------------------------------
   Handles: Authentication, Dashboard Rendering, CRUD Operations, 
   and Data Visualization (Charts/Analytics).
   ========================================================================== */

const API_URL = 'http://localhost:3000/api';
let myChart = null; // Stores the Chart.js instance for global access/updates

/* --- UI UTILITIES --- */

/**
 * Toggles the visibility of the "Custom Category" input field.
 * Triggered when the user selects "+ Create New Category" from the dropdown.
 */
function toggleCategoryInput(selectElement) {
    const input = document.getElementById('newCategoryInput');
    if (selectElement.value === 'new_category_option') {
        input.style.display = 'block';
        input.required = true;
        input.focus();
    } else {
        input.style.display = 'none';
        input.required = false;
        input.value = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    const path = window.location.pathname;
    const token = localStorage.getItem('token');

    // ============================================================
    //  SECTION A: AUTHENTICATION CONTROLLERS
    //  Handles interactions with the Auth API (Login/Register)
    // ============================================================

    // Handle User Registration
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regCompany').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            try {
                // Send credentials to backend
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                
                // On success: Store JWT token and redirect
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.msg || 'Registration failed');
                }
            } catch (err) { console.error(err); alert('Server error'); }
        });
    }

    // Handle User Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    // Store Session Data (Token + User Name)
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userName', data.userName || 'User');
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.msg || 'Login failed');
                }
            } catch (err) { console.error(err); alert('Server error'); }
        });
    }

    // ============================================================
    //  SECTION B: DASHBOARD LOGIC & STATE MANAGEMENT
    //  (Only executes on the dashboard page)
    // ============================================================
    
    if (path.includes('dashboard.html')) {
        
        // 1. Protected Route Check
        // If no valid token exists, redirect immediately to login.
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // 2. Initialize UI (User Info & Logout)
        const userName = localStorage.getItem('userName') || 'Admin';
        const displayUser = document.getElementById('displayUserName');
        const welcomeUser = document.getElementById('welcomeUserName');
        if (displayUser) displayUser.textContent = userName;
        if (welcomeUser) welcomeUser.textContent = userName;

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.clear(); // Clear session
                window.location.href = 'login.html';
            });
        }

        // --- VIEW CONTROLLER (SPA BEHAVIOR) ---
        // Manages switching between "Dashboard Overview" and "Warehouse Details"
        // without reloading the page.
        
        const viewDashboard = document.getElementById('view-dashboard');
        const viewDetail = document.getElementById('view-warehouse-detail');

        // Switches to Main Dashboard View
        window.showDashboard = function() {
            viewDashboard.style.display = 'block';
            viewDetail.style.display = 'none';
            viewDetail.classList.add('hidden');
            loadDashboardStats(); // Refresh analytics
        };

        // Switches to Warehouse Detail View
        window.showWarehouseDetail = function(warehouseId, warehouseName) {
            viewDashboard.style.display = 'none';
            viewDetail.classList.remove('hidden'); 
            viewDetail.style.display = 'block';    
            
            // Set Context (IDs and Names) for Add/Edit forms
            const titleEl = document.getElementById('currentWarehouseTitle');
            if(titleEl) titleEl.textContent = warehouseName;
            
            const targetNameEl = document.getElementById('targetWarehouseName');
            if(targetNameEl) targetNameEl.textContent = warehouseName;

            const targetIdEl = document.getElementById('targetWarehouseId');
            if(targetIdEl) targetIdEl.value = warehouseId;

            loadItems(warehouseId); // Fetch inventory
        };

        // Navigation Event Listeners
        const backBtn = document.getElementById('btnBackToDash');
        if (backBtn) backBtn.addEventListener('click', window.showDashboard);

        const navDash = document.getElementById('navDashboard');
        if(navDash) navDash.addEventListener('click', window.showDashboard);

        // --- MODAL MANAGEMENT ---
        // Handles opening/closing of pop-up forms
        const warehouseModal = document.getElementById('addWarehouseModal');
        const itemModal = document.getElementById('addItemModal');
        const editModal = document.getElementById('editItemModal');
        const selectionModal = document.getElementById('warehouseSelectionModal');

        const btnNewWh = document.getElementById('btnNewWarehouse');
        if(btnNewWh) btnNewWh.addEventListener('click', () => warehouseModal.style.display = 'flex');

        const btnAddItm = document.getElementById('btnAddItem');
        if(btnAddItm) btnAddItm.addEventListener('click', () => itemModal.style.display = 'flex');

        // Dynamic Warehouse Selection Logic (Sidebar Nav)
        const navWh = document.getElementById('navWarehouses');
        if(navWh) {
            navWh.addEventListener('click', async () => {
                selectionModal.style.display = 'flex';
                const grid = document.getElementById('warehouseSelectionGrid');
                grid.innerHTML = 'Loading...';
                
                // Fetch list dynamically and create buttons
                const warehouses = await fetchWarehouses();
                grid.innerHTML = '';
                warehouses.forEach(wh => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-secondary';
                    btn.style.padding = '15px';
                    btn.style.width = '100%';
                    btn.innerHTML = `<i class="fa-solid fa-warehouse"></i> ${wh.name}`;
                    btn.onclick = () => {
                        selectionModal.style.display = 'none';
                        window.showWarehouseDetail(wh._id, wh.name);
                    };
                    grid.appendChild(btn);
                });
            });
        }

        // Close Modal Handlers (X button & Outside Click)
        document.getElementById('closeWarehouseModal').onclick = () => warehouseModal.style.display = 'none';
        document.getElementById('closeItemModal').onclick = () => itemModal.style.display = 'none';
        document.getElementById('closeEditModal').onclick = () => editModal.style.display = 'none';
        document.getElementById('closeSelectionModal').onclick = () => selectionModal.style.display = 'none';
        
        window.onclick = (e) => {
            if (e.target.className === 'modal') e.target.style.display = 'none';
        };

        // --- ITEM MANAGEMENT (UPDATE) ---
        
        // Pre-fills the Edit Modal with existing item data
        window.openEditModal = function(id, name, qty, price) {
            document.getElementById('editItemId').value = id;
            document.getElementById('editItemName').value = name;
            document.getElementById('editItemQty').value = qty;
            document.getElementById('editItemPrice').value = price;
            editModal.style.display = 'flex';
        };

        // Submits the Update (PUT Request)
        const editForm = document.getElementById('editItemForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editItemId').value;
                const name = document.getElementById('editItemName').value;
                const quantity = document.getElementById('editItemQty').value;
                const price = document.getElementById('editItemPrice').value;

                const token = localStorage.getItem('token');
                try {
                    const res = await fetch(`${API_URL}/data/item/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                        body: JSON.stringify({ name, quantity, price })
                    });

                    if (res.ok) {
                        editModal.style.display = 'none';
                        const warehouseId = document.getElementById('targetWarehouseId').value;
                        loadItems(warehouseId); // Refresh UI
                    } else {
                        alert('Error updating item');
                    }
                } catch (err) { console.error(err); }
            });
        }

        // --- ITEM MANAGEMENT (DELETE) ---
        window.deleteItem = async function(itemId) {
            if (!confirm('Are you sure you want to delete this item?')) return;
            
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_URL}/data/item/${itemId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });

                if (res.ok) {
                    const warehouseId = document.getElementById('targetWarehouseId').value;
                    loadItems(warehouseId); // Refresh List
                } else {
                    alert('Error deleting item');
                }
            } catch (err) { console.error(err); }
        };

        // --- CREATION HANDLERS (POST) ---
        
        // Create Warehouse
        const whForm = document.getElementById('warehouseForm');
        if (whForm) {
            whForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('newWarehouseName').value;
                const location = document.getElementById('newWarehouseLocation').value;
                await dataFetch('/data/warehouse', 'POST', { name, location });
                warehouseModal.style.display = 'none';
                whForm.reset();
                loadDashboardStats();
            });
        }

        // Create Item
        const itemForm = document.getElementById('itemForm');
        if (itemForm) {
            itemForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const warehouseId = document.getElementById('targetWarehouseId').value;
                const name = document.getElementById('itemName').value;
                const price = document.getElementById('itemPrice').value;
                const quantity = document.getElementById('itemQty').value;
                
                // Handle Custom vs Pre-defined Category
                let category = document.getElementById('itemCategory').value;
                if (category === 'new_category_option') {
                    category = document.getElementById('newCategoryInput').value;
                }

                await dataFetch('/data/item', 'POST', { warehouseId, name, category, quantity, price });
                itemModal.style.display = 'none';
                itemForm.reset();
                loadItems(warehouseId);
            });
        }

        // Initialize Dashboard Data
        loadDashboardStats();
    }
});

/* ============================================================
   HELPER FUNCTIONS & API WRAPPERS
   ============================================================ */

// Generic Fetch Wrapper (Handles Token Auth)
async function dataFetch(endpoint, method, body) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(API_URL + endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (err) { console.error(err); }
}

async function fetchWarehouses() {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const res = await fetch(`${API_URL}/data/warehouses`, {
        headers: { 'x-auth-token': token }
    });
    return await res.json();
}

/**
 * DASHBOARD ANALYTICS
 * 1. Fetches all warehouses and items.
 * 2. Calculates Global Value & Active Products.
 * 3. Identifies "Dead Stock" (Inactive > 30 days).
 * 4. Renders the Chart.js visualization.
 */
async function loadDashboardStats() {
    if (!document.getElementById('totalWarehousesCount')) return;
    
    const warehouses = await fetchWarehouses();
    document.getElementById('totalWarehousesCount').textContent = warehouses.length;

    const deadStockFeed = document.getElementById('deadStockFeed');
    deadStockFeed.innerHTML = '';
    
    // Aggregation Variables
    let globalValue = 0;
    let activeProducts = 0;
    let allInventory = [];

    const chartLabels = [];
    const chartData = [];

    // Loop through all warehouses to aggregate data
    for (const wh of warehouses) {
        const token = localStorage.getItem('token');
        const iRes = await fetch(`${API_URL}/data/items/${wh._id}`, { headers: {'x-auth-token': token}});
        const items = await iRes.json();
        
        let warehouseVal = 0;
        
        items.forEach(i => {
            warehouseVal += (i.price * i.quantity);
            if (i.quantity > 0) activeProducts++;
            
            // Collect item data for Dead Stock analysis
            allInventory.push({
                ...i,
                warehouseName: wh.name,
                lastActivity: new Date(i.lastUpdated || i.createdAt)
            });
        });

        globalValue += warehouseVal;
        chartLabels.push(wh.name);
        chartData.push(warehouseVal);
    }

    // Update Text Metrics
    document.getElementById('totalValueCount').textContent = `$${globalValue.toFixed(2)}`;
    
    const activeEl = document.getElementById('activeProductsCount');
    if (activeEl) activeEl.textContent = activeProducts;

    // --- Dead Stock Logic ---
    const DAYS_THRESHOLD = 30;
    const now = new Date();
    
    // Filter items based on inactivity threshold
    const deadStock = allInventory.filter(item => {
        const diffTime = Math.abs(now - item.lastActivity);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays > DAYS_THRESHOLD;
    });
    deadStock.sort((a, b) => a.lastActivity - b.lastActivity);

    // Render Dead Stock Feed
    if (deadStock.length === 0) {
        deadStockFeed.innerHTML = `
            <div style="padding:15px; text-align:center; color:#10b981; background:rgba(16,185,129,0.1); border-radius:6px;">
                <i class="fa-solid fa-check-circle"></i> No dead stock found. Inventory is moving!
            </div>
            <p style="text-align:center; font-size:0.8em; color:#666; margin-top:5px;">(Items appear here after ${DAYS_THRESHOLD} days of inactivity)</p>
        `;
    } else {
        deadStock.slice(0, 5).forEach(item => { 
            const div = document.createElement('div');
            div.style.padding = '12px';
            div.style.borderBottom = '1px solid #334155'; 
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:#e2e8f0;">${item.name}</div>
                    <div style="font-size:0.85em; color:#94a3b8;">
                        <i class="fa-solid fa-warehouse"></i> ${item.warehouseName}
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="color:#ef4444; font-weight:bold;">${item.quantity} units</div>
                    <div style="font-size:0.8em; color:#64748b;">
                        Idle since ${item.lastActivity.toLocaleDateString()}
                    </div>
                </div>
            `;
            div.style.cursor = 'pointer';
            div.onclick = () => window.showWarehouseDetail(item.warehouse, item.warehouseName);
            deadStockFeed.appendChild(div);
        });
    }

    // --- Chart.js Rendering ---
    const ctx = document.getElementById('inventoryChart');
    if (ctx) {
        if (myChart) myChart.destroy(); // Destroy old chart to prevent canvas overlap
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Warehouse Value ($)',
                    data: chartData,
                    backgroundColor: '#0284c7',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

/**
 * INVENTORY TABLE RENDERER
 * Fetches items for a specific warehouse and populates the table.
 * Calculates Unit vs Total Price and generates Action Buttons (Edit/Delete).
 */
async function loadItems(warehouseId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/data/items/${warehouseId}`, {
        headers: { 'x-auth-token': token }
    });
    const items = await res.json();

    const tbody = document.getElementById('inventoryTableBody');
    const emptyMsg = document.getElementById('emptyInventoryMsg');
    tbody.innerHTML = '';

    if (items.length === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
        items.forEach(item => {
            const tr = document.createElement('tr');
            const totalValue = (item.price * item.quantity).toFixed(2);
            
            tr.innerHTML = `
                <td style="font-weight:bold;">${item.name}</td>
                <td><span style="background:#e0f2fe; color:#0284c7; padding:2px 8px; border-radius:4px; font-size:0.85em;">${item.category}</span></td>
                <td>${item.quantity}</td>
                <td>$${Number(item.price).toFixed(2)}</td>
                <td style="font-weight:bold; color:var(--accent-color);">$${totalValue}</td>
                <td>
                    <button onclick="openEditModal('${item._id}', '${item.name}', ${item.quantity}, ${item.price})" 
                            style="color:var(--accent-color); margin-right:10px; border:none; background:none; cursor:pointer;" title="Edit">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button onclick="deleteItem('${item._id}')" style="color:red; border:none; background:none; cursor:pointer;" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}