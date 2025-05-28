 // Check if user is logged in
 const currentUser = localStorage.getItem('currentUser');
 const users = JSON.parse(localStorage.getItem('users')) || [];
 if (!currentUser || !users.some(u => u.username === currentUser)) {
     window.location.href = 'login.html';
 } else {
     document.getElementById('current-user').textContent = currentUser;
 }

 // Sidebar Navigation
 const menuItems = document.querySelectorAll('.sidebar-menu li');
 const pages = document.querySelectorAll('.content');
 const pageTitle = document.getElementById('page-title');

 menuItems.forEach(item => {
     item.addEventListener('click', () => {
         menuItems.forEach(i => i.classList.remove('active'));
         item.classList.add('active');
         pages.forEach(page => page.style.display = 'none');
         const pageId = item.getAttribute('data-page');
         document.getElementById(pageId).style.display = 'block';
         pageTitle.textContent = item.textContent.trim();

         if (pageId === 'logout') {
             setTimeout(() => {
                 localStorage.removeItem('currentUser');
                 alert('Logged out successfully!');
                 window.location.href = 'login.html';
             }, 1000);
         } else if (pageId === 'dashboard') {
             initProductionChart();
             simulateProductionData();
             simulateProductionNotifications();
         } else if (pageId === 'finance') {
             initFinanceChart();
         }
     });
 });

 // Dashboard - Production Data Simulation
 let productionData = {
     daily: 1250,
     target: 1500,
     efficiency: 83,
     revenue: 12500000,
     productionHistory: [1200, 1300, 1150, 1400, 1250, 1350, 1250]
 };
 let productionChart;

 function simulateProductionData() {
     setInterval(() => {
         productionData.daily = Math.max(1000, productionData.daily + (Math.random() - 0.5) * 100);
         productionData.efficiency = Math.min(100, (productionData.daily / productionData.target) * 100);
         productionData.revenue = productionData.daily * 10000;

         document.getElementById('production-daily').textContent = `${productionData.daily.toFixed(0)} units`;
         document.getElementById('production-target').textContent = `${productionData.target} units`;
         document.getElementById('efficiency').textContent = `${productionData.efficiency.toFixed(1)}%`;
         document.getElementById('revenue').textContent = `Rp ${productionData.revenue.toLocaleString()}`;
         document.getElementById('target-achievement').textContent = ((productionData.daily / productionData.target) * 100).toFixed(1);

         const now = new Date().toLocaleTimeString();
         document.getElementById('production-time').textContent = now;
         document.getElementById('efficiency-time').textContent = now;
         document.getElementById('revenue-time').textContent = now;

         productionData.productionHistory.push(productionData.daily);
         if (productionData.productionHistory.length > 7) productionData.productionHistory.shift();
         updateProductionChart();
     }, 5000);
 }

 function initProductionChart() {
     const ctx = document.getElementById('productionChart').getContext('2d');
     productionChart = new Chart(ctx, {
         type: 'line',
         data: {
             labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'],
             datasets: [{
                 label: 'Production (units)',
                 data: productionData.productionHistory,
                 borderColor: '#ffd700',
                 backgroundColor: 'rgba(255, 215, 0, 0.2)',
                 fill: true,
                 tension: 0.4
             }]
         },
         options: {
             scales: { y: { beginAtZero: true, suggestedMax: 2000 } },
             animation: { duration: 2000, easing: 'easeInOutBounce' }
         }
     });
 }

 function updateProductionChart() {
     productionChart.data.datasets[0].data = productionData.productionHistory;
     productionChart.update();
 }

 function simulateProductionNotifications() {
     const notifications = document.getElementById('notifications');
     setInterval(() => {
         if (productionData.daily < productionData.target * 0.8) {
             const notif = document.createElement('div');
             notif.className = 'notification';
             notif.textContent = `Production Alert: Only ${productionData.daily.toFixed(0)} units produced (Target: ${productionData.target})!`;
             notifications.appendChild(notif);
             setTimeout(() => notif.remove(), 3000);
         }
     }, 10000);
 }

 function exportDashboardExcel() {
     const data = [
         ['Metric', 'Value', 'Last Updated'],
         ['Daily Production', `${productionData.daily.toFixed(0)} units`, document.getElementById('production-time').textContent],
         ['Production Target', `${productionData.target} units`, '-'],
         ['Efficiency', `${productionData.efficiency.toFixed(1)}%`, document.getElementById('efficiency-time').textContent],
         ['Revenue Today', `Rp ${productionData.revenue.toLocaleString()}`, document.getElementById('revenue-time').textContent]
     ];
     const wb = XLSX.utils.book_new();
     const ws = XLSX.utils.aoa_to_sheet(data);
     XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
     XLSX.writeFile(wb, 'Production_Dashboard_Report.xlsx');
 }

 // Inventory Functionality
 const inventoryForm = document.getElementById('inventory-form');
 const inventoryTable = document.getElementById('inventory-table');
 const totalValueSpan = document.getElementById('total-value');
 const filterInventory = document.getElementById('filter-inventory');
 let inventory = [];

 inventoryForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const nama = document.getElementById('nama-barang').value;
     const harga = parseFloat(document.getElementById('harga-barang').value);
     const stok = parseInt(document.getElementById('stok-barang').value);
     const kategori = document.getElementById('kategori-barang').value;
     inventory.push({ nama, harga, stok, kategori });
     updateInventoryTable();
     checkStockAlert(nama, stok);
     inventoryForm.reset();
 });

 filterInventory.addEventListener('input', () => updateInventoryTable());

 function updateInventoryTable() {
     const filter = filterInventory.value.toLowerCase();
     inventoryTable.innerHTML = '';
     inventory.filter(item => 
         item.nama.toLowerCase().includes(filter) || item.kategori.toLowerCase().includes(filter)
     ).forEach((item, index) => {
         const row = document.createElement('tr');
         row.innerHTML = `
             <td>${item.nama}</td>
             <td>Rp ${item.harga.toLocaleString()}</td>
             <td>${item.stok}</td>
             <td>${item.kategori}</td>
             <td>
                 <button class="action-btn" onclick="editInventory(${index})"><i class="fas fa-edit"></i></button>
                 <button class="action-btn" onclick="deleteInventory(${index})"><i class="fas fa-trash"></i></button>
             </td>
         `;
         inventoryTable.appendChild(row);
     });
     const total = inventory.reduce((sum, item) => sum + (item.harga * item.stok), 0);
     totalValueSpan.textContent = total.toLocaleString();
 }

 function editInventory(index) {
     const item = inventory[index];
     document.getElementById('nama-barang').value = item.nama;
     document.getElementById('harga-barang').value = item.harga;
     document.getElementById('stok-barang').value = item.stok;
     document.getElementById('kategori-barang').value = item.kategori;
     inventory.splice(index, 1);
     updateInventoryTable();
 }

 function deleteInventory(index) {
     inventory.splice(index, 1);
     updateInventoryTable();
 }

 function checkStockAlert(nama, stok) {
     if (stok < 5) {
         const notif = document.createElement('div');
         notif.className = 'notification';
         notif.textContent = `Low Stock Alert: ${nama} only has ${stok} left!`;
         document.body.appendChild(notif);
         setTimeout(() => notif.remove(), 3000);
     }
 }

 function exportInventoryExcel() {
     const data = [['Name', 'Price', 'Stock', 'Category']].concat(
         inventory.map(item => [item.nama, item.harga, item.stok, item.kategori])
     );
     const wb = XLSX.utils.book_new();
     const ws = XLSX.utils.aoa_to_sheet(data);
     XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
     XLSX.writeFile(wb, 'Inventory_Report.xlsx');
 }

 // Finance Functionality
 const financeForm = document.getElementById('finance-form');
 const financeTable = document.getElementById('finance-table');
 const totalIncomeSpan = document.getElementById('total-income');
 const totalExpenseSpan = document.getElementById('total-expense');
 const balanceSpan = document.getElementById('balance');
 let finances = [];
 let financeChart;

 financeForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const description = document.getElementById('description').value;
     const amount = parseFloat(document.getElementById('amount').value);
     const type = document.getElementById('type').value;
     const date = new Date().toLocaleDateString();
     finances.push({ description, amount, type, date });
     updateFinanceTable();
     updateFinanceChart();
     financeForm.reset();
 });

 function updateFinanceTable() {
     financeTable.innerHTML = '';
     finances.forEach((finance, index) => {
         const row = document.createElement('tr');
         row.innerHTML = `
             <td>${finance.description}</td>
             <td>Rp ${finance.amount.toLocaleString()}</td>
             <td>${finance.type}</td>
             <td>${finance.date}</td>
             <td>
                 <button class="action-btn" onclick="editFinance(${index})"><i class="fas fa-edit"></i></button>
                 <button class="action-btn" onclick="deleteFinance(${index})"><i class="fas fa-trash"></i></button>
             </td>
         `;
         financeTable.appendChild(row);
     });
     const totalIncome = finances.reduce((sum, f) => f.type === 'income' ? sum + f.amount : sum, 0);
     const totalExpense = finances.reduce((sum, f) => f.type === 'expense' ? sum + f.amount : sum, 0);
     totalIncomeSpan.textContent = totalIncome.toLocaleString();
     totalExpenseSpan.textContent = totalExpense.toLocaleString();
     balanceSpan.textContent = (totalIncome - totalExpense).toLocaleString();
 }

 function editFinance(index) {
     const finance = finances[index];
     document.getElementById('description').value = finance.description;
     document.getElementById('amount').value = finance.amount;
     document.getElementById('type').value = finance.type;
     finances.splice(index, 1);
     updateFinanceTable();
     updateFinanceChart();
 }

 function deleteFinance(index) {
     finances.splice(index, 1);
     updateFinanceTable();
     updateFinanceChart();
 }

 function initFinanceChart() {
     const ctx = document.getElementById('financeChart').getContext('2d');
     financeChart = new Chart(ctx, {
         type: 'pie',
         data: {
             labels: ['Income', 'Expense'],
             datasets: [{
                 data: [0, 0],
                 backgroundColor: ['#ffd700', '#ff6f61'],
                 borderColor: '#fff',
                 borderWidth: 1
             }]
         },
         options: {
             animation: { duration: 2000, easing: 'easeInOutBounce' }
         }
     });
     updateFinanceChart();
 }

 function updateFinanceChart() {
     const totalIncome = finances.reduce((sum, f) => f.type === 'income' ? sum + f.amount : sum, 0);
     const totalExpense = finances.reduce((sum, f) => f.type === 'expense' ? sum + f.amount : sum, 0);
     financeChart.data.datasets[0].data = [totalIncome, totalExpense];
     financeChart.update();
 }

 function exportFinancePDF() {
     const { jsPDF } = window.jspdf;
     const doc = new jsPDF();
     doc.text('Financial Report', 10, 10);
     let y = 20;
     finances.forEach(f => {
         doc.text(`${f.description}: Rp ${f.amount.toLocaleString()} (${f.type}) - ${f.date}`, 10, y);
         y += 10;
     });
     doc.save('Finance_Report.pdf');
 }

 function exportFinanceExcel() {
     const data = [['Description', 'Amount', 'Type', 'Date']].concat(
         finances.map(f => [f.description, f.amount, f.type, f.date])
     );
     const wb = XLSX.utils.book_new();
     const ws = XLSX.utils.aoa_to_sheet(data);
     XLSX.utils.book_append_sheet(wb, ws, 'Finance');
     XLSX.writeFile(wb, 'Finance_Report.xlsx');
 }

 // Employee Functionality
 const employeeForm = document.getElementById('employee-form');
 const employeeTable = document.getElementById('employee-table');
 const totalSalarySpan = document.getElementById('total-salary');
 let employees = [];

 employeeForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const name = document.getElementById('employee-name').value;
     const position = document.getElementById('employee-position').value;
     const salary = parseFloat(document.getElementById('employee-salary').value);
     employees.push({ name, position, salary });
     updateEmployeeTable();
     employeeForm.reset();
 });

 function updateEmployeeTable() {
     employeeTable.innerHTML = '';
     employees.forEach((emp, index) => {
         const row = document.createElement('tr');
         row.innerHTML = `
             <td>${emp.name}</td>
             <td>${emp.position}</td>
             <td>Rp ${emp.salary.toLocaleString()}</td>
             <td>
                 <button class="action-btn" onclick="editEmployee(${index})"><i class="fas fa-edit"></i></button>
                 <button class="action-btn" onclick="deleteEmployee(${index})"><i class="fas fa-trash"></i></button>
             </td>
         `;
         employeeTable.appendChild(row);
     });
     const total = employees.reduce((sum, emp) => sum + emp.salary, 0);
     totalSalarySpan.textContent = total.toLocaleString();
 }

 function editEmployee(index) {
     const emp = employees[index];
     document.getElementById('employee-name').value = emp.name;
     document.getElementById('employee-position').value = emp.position;
     document.getElementById('employee-salary').value = emp.salary;
     employees.splice(index, 1);
     updateEmployeeTable();
 }

 function deleteEmployee(index) {
     employees.splice(index, 1);
     updateEmployeeTable();
 }

 function exportEmployeeExcel() {
     const data = [['Name', 'Position', 'Salary']].concat(
         employees.map(emp => [emp.name, emp.position, emp.salary])
     );
     const wb = XLSX.utils.book_new();
     const ws = XLSX.utils.aoa_to_sheet(data);
     XLSX.utils.book_append_sheet(wb, ws, 'Employees');
     XLSX.writeFile(wb, 'Employee_Report.xlsx');
 }

 // Settings Functionality
 const settingsForm = document.getElementById('settings-form');
 settingsForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const companyName = document.getElementById('company-name').value;
     const theme = document.getElementById('theme').value;
     alert(`Settings saved!\nCompany: ${companyName}\nTheme: ${theme}`);
     if (theme === 'light') {
         document.body.style.background = 'linear-gradient(135deg, #f0f2f5, #ffffff)';
     } else {
         document.body.style.background = 'linear-gradient(135deg, #1e3c72, #2a5298)';
     }
 });

 function backupData() {
     const data = { inventory, finances, employees, productionData };
     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'backup.json';
     a.click();
     URL.revokeObjectURL(url);
     alert('Data backed up successfully!');
 }

 // Initialize Dashboard on Load
 initProductionChart();
 simulateProductionData();
 simulateProductionNotifications();
