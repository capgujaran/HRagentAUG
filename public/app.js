const demoEmployees = [
  {id:1,name:'Maya Patel',role:'Product Designer',department:'Product',location:'Dubai',initials:'MP',status:'Active'},
  {id:2,name:'Omar Hassan',role:'Engineering Lead',department:'Engineering',location:'Abu Dhabi',initials:'OH',status:'Active'},
  {id:3,name:'Sofia Reyes',role:'People Partner',department:'People',location:'Remote',initials:'SR',status:'On leave'},
  {id:4,name:'Noah Williams',role:'Finance Analyst',department:'Finance',location:'Dubai',initials:'NW',status:'Active'},
  {id:5,name:'Aisha Rahman',role:'Frontend Engineer',department:'Engineering',location:'Remote',initials:'AR',status:'Active'},
  {id:6,name:'Liam Chen',role:'Growth Manager',department:'Marketing',location:'Dubai',initials:'LC',status:'Active'}
];
const demoLeaves = [
  {id:1,name:'Sofia Reyes',type:'Annual leave',dates:'12–16 Aug',duration:'5 days',status:'Pending',initials:'SR'},
  {id:2,name:'Omar Hassan',type:'Personal leave',dates:'19 Aug',duration:'1 day',status:'Pending',initials:'OH'},
  {id:3,name:'Aisha Rahman',type:'Annual leave',dates:'25–27 Aug',duration:'3 days',status:'Approved',initials:'AR'}
];
const state = { employees: [], leaves: [], hostedDemo: false };
const $ = (selector) => document.querySelector(selector);

async function loadData() {
  try {
    const responses = await Promise.all([fetch('/api/employees'), fetch('/api/leaves')]);
    if (responses.some(response => !response.ok || !response.headers.get('content-type')?.includes('application/json'))) throw new Error('API unavailable');
    [state.employees, state.leaves] = await Promise.all(responses.map(response => response.json()));
  } catch {
    state.hostedDemo = true;
    state.employees = demoEmployees.map(employee => ({...employee}));
    state.leaves = demoLeaves.map(leave => ({...leave}));
  }
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
  let updated = {...state.leaves.find(leave => leave.id === id), status};
  if (!state.hostedDemo) {
    const response = await fetch(`/api/leaves/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status}) });
    if (!response.ok) return toast('Could not update request');
    updated = await response.json();
  }
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
  let employee;
  if (state.hostedDemo) {
    const parts = data.name.trim().split(/\s+/);
    employee = {...data,id:Math.max(...state.employees.map(item => item.id),0)+1,initials:(parts[0][0]+(parts.at(-1)[0]||'')).toUpperCase(),status:'Active'};
  } else {
    const response = await fetch('/api/employees', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    if (!response.ok) return toast('Please complete all required fields');
    employee = await response.json();
  }
  state.employees.push(employee);
  e.target.reset(); modal.close(); populateDepartments(); renderEmployees(); toast('Employee added successfully');
});

document.querySelectorAll('.tasks input').forEach(input => input.addEventListener('change', () => {
  const checks = [...document.querySelectorAll('.tasks input')];
  const percent = Math.round(checks.filter(x => x.checked).length / checks.length * 100);
  $('#progressText').textContent = `${percent}%`; $('#progressBar').style.width = `${percent}%`;
}));

function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 2200); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
loadData();
