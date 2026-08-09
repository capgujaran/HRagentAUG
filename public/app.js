const state = { employees: [], leaves: [] };
const $ = (selector) => document.querySelector(selector);

async function loadData() {
  const [employees, leaves] = await Promise.all([fetch('/api/employees').then(r => r.json()), fetch('/api/leaves').then(r => r.json())]);
  state.employees = employees;
  state.leaves = leaves;
  populateDepartments();
  renderEmployees();
  renderLeaves();
}

function populateDepartments() {
  const selected = $('#departmentFilter').value;
  const departments = [...new Set(state.employees.map(e => e.department))].sort();
  $('#departmentFilter').innerHTML = '<option value="">All teams</option>' + departments.map(d => `<option ${d === selected ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('');
}

function renderEmployees() {
  const query = $('#searchInput').value.toLowerCase();
  const department = $('#departmentFilter').value;
  const filtered = state.employees.filter(e => (!department || e.department === department) && (`${e.name} ${e.role} ${e.location}`).toLowerCase().includes(query));
  $('#employeeCount').textContent = state.employees.length;
  $('#employeeRows').innerHTML = filtered.length ? filtered.map(e => `<tr><td><div class="person"><span class="avatar">${escapeHtml(e.initials)}</span><div><strong>${escapeHtml(e.name)}</strong><small>${escapeHtml(e.role)}</small></div></div></td><td>${escapeHtml(e.department)}</td><td>${escapeHtml(e.location)}</td><td><span class="${e.status === 'Active' ? 'active-pill' : 'leave-pill'}">${escapeHtml(e.status)}</span></td><td class="dots">•••</td></tr>`).join('') : '<tr><td colspan="5">No employees match your search.</td></tr>';
}

function renderLeaves() {
  $('#leaveList').innerHTML = state.leaves.map(l => `<div class="leave-item"><span class="avatar ${l.id % 2 ? 'coral' : 'purple'}">${escapeHtml(l.initials)}</span><div class="leave-info"><strong>${escapeHtml(l.name)}</strong><small>${escapeHtml(l.type)} · ${escapeHtml(l.dates)} · ${escapeHtml(l.duration)}</small></div><div class="leave-actions">${l.status === 'Pending' ? `<button class="mini-btn" data-id="${l.id}" data-status="Rejected">Decline</button><button class="mini-btn approve" data-id="${l.id}" data-status="Approved">Approve</button>` : `<span class="status-pill ${l.status.toLowerCase()}">${l.status}</span>`}</div></div>`).join('');
}

async function updateLeave(id, status) {
  const response = await fetch(`/api/leaves/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status}) });
  if (!response.ok) return toast('Could not update request');
  const updated = await response.json();
  state.leaves = state.leaves.map(l => l.id === id ? updated : l);
  renderLeaves();
  toast(`Request ${status.toLowerCase()}`);
}

$('#leaveList').addEventListener('click', e => { const button = e.target.closest('[data-id]'); if (button) updateLeave(Number(button.dataset.id), button.dataset.status); });
$('#searchInput').addEventListener('input', renderEmployees);
$('#departmentFilter').addEventListener('change', renderEmployees);
$('.menu').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
document.querySelectorAll('.nav-item').forEach(link => link.addEventListener('click', () => { document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active')); link.classList.add('active'); $('.sidebar').classList.remove('open'); }));

const modal = $('#employeeModal');
$('#openModal').addEventListener('click', () => modal.showModal());
$('#closeModal').addEventListener('click', () => modal.close());
$('#cancelModal').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
$('#employeeForm').addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const response = await fetch('/api/employees', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
  if (!response.ok) return toast('Please complete all required fields');
  state.employees.push(await response.json());
  e.target.reset(); modal.close(); populateDepartments(); renderEmployees(); toast('Employee added successfully');
});

document.querySelectorAll('.tasks input').forEach(input => input.addEventListener('change', () => {
  const checks = [...document.querySelectorAll('.tasks input')];
  const percent = Math.round(checks.filter(x => x.checked).length / checks.length * 100);
  $('#progressText').textContent = `${percent}%`; $('#progressBar').style.width = `${percent}%`;
}));

function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 2200); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
loadData().catch(() => toast('Unable to connect to the HR service'));
