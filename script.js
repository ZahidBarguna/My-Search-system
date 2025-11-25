// Sample person data and search/filter logic with add/edit/delete and localStorage
const STORAGE_KEY = 'peopleData_v1';
const defaultPeople = [
  {id:'1',name:'Alice Johnson',age:29,phone:'555-0123',email:'alice.j@example.com',address:'12 Oak Street, Springfield',freelancerId:'AJ-1001',avatar:'',social:{facebook:'',twitter:'',linkedin:'',instagram:'',indeed:'',github:''}},
  {id:'2',name:'Bob Smith',age:42,phone:'555-0456',email:'bob.smith@example.com',address:'7 Pine Ave, Lakeview',freelancerId:'BS-2002',avatar:'',social:{facebook:'',twitter:'',linkedin:'',instagram:'',indeed:'',github:''}},
  {id:'3',name:'Carla Gomez',age:35,phone:'555-0789',email:'carla.g@example.com',address:'200 Market St, Riverside',freelancerId:'CG-3003',avatar:'',social:{facebook:'',twitter:'',linkedin:'',instagram:'',indeed:'',github:''}},
  {id:'4',name:'David Lee',age:22,phone:'555-1011',email:'dlee@example.com',address:'44 Elm Rd, Hilltown',freelancerId:'DL-4004',avatar:'',social:{facebook:'',twitter:'',linkedin:'',instagram:'',indeed:'',github:''}},
  {id:'5',name:'Eve Martinez',age:31,phone:'555-1213',email:'eve.m@example.com',address:'18 Maple Blvd, Brookside',freelancerId:'EM-5005',avatar:'',social:{facebook:'',twitter:'',linkedin:'',instagram:'',indeed:'',github:''}}
];

const DEFAULT_SOCIAL = {facebook:'',twitter:'',linkedin:'',instagram:'',indeed:'',github:''};

const resultsEl = document.getElementById('results');
const inputEl = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const addBtn = document.getElementById('addBtn');

// Form elements
const formWrap = document.getElementById('personFormWrap');
const formEl = document.getElementById('personForm');
const formTitle = document.getElementById('formTitle');
const cancelBtn = document.getElementById('cancelBtn');
const idEl = document.getElementById('personId');
const nameEl = document.getElementById('name');
const ageEl = document.getElementById('age');
const phoneEl = document.getElementById('phone');
const emailEl = document.getElementById('email');
const addressEl = document.getElementById('address');
const avatarEl = document.getElementById('avatar');
const facebookEl = document.getElementById('facebook');
const twitterEl = document.getElementById('twitter');
const linkedinEl = document.getElementById('linkedin');
const instagramEl = document.getElementById('instagram');
const indeedEl = document.getElementById('indeed');
const githubEl = document.getElementById('github');

let people = loadPeople();

function savePeople(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(people)); }catch(e){ console.warn('Could not save to localStorage', e); }
}

function loadPeople(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){ /* ignore parse errors */ }
  // normalize default people (ensure ids are strings and social keys exist)
  return defaultPeople.map(p => ({
    ...p,
    id: String(p.id),
    freelancerId: p.freelancerId || '',
    social: Object.assign({}, DEFAULT_SOCIAL, p.social || {})
  }));
}

function escapeRegExp(string){
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query){
  if(!query) return escapeHtml(String(text));
  const q = escapeRegExp(query);
  const re = new RegExp(q, 'ig');
  return escapeHtml(String(text)).replace(re, (match)=>`<span class="highlight">${match}</span>`);
}

function escapeHtml(s){
  return s.replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;', '"':'&quot;' }[c]));
}

function buildCard(person, query){
  const name = highlightText(person.name, query);
  const age = String(person.age ?? '');
  const phone = highlightText(person.phone || '', query);
  const email = highlightText(person.email || '', query);
  const address = highlightText(person.address || '', query);
  const freelancerId = person.freelancerId || '';

  // Avatar markup (image or initials fallback)
  let avatarHtml = '';
  if(person.avatar){
    avatarHtml = `<img src="${escapeHtml(person.avatar)}" alt="${escapeHtml(person.name)}" class="avatar">`;
  }else{
    const initials = (person.name || '').split(' ').map(s=>s[0]).filter(Boolean).slice(0,2).join('').toUpperCase() || '?';
    avatarHtml = `<div class="avatar fallback">${escapeHtml(initials)}</div>`;
  }

  // Social links
  const social = person.social || {};
  const socialHtml = [];
  if(social.facebook) socialHtml.push(`<a href="${escapeHtml(social.facebook)}" target="_blank" rel="noopener" aria-label="Facebook"><span>f</span></a>`);
  if(social.twitter) socialHtml.push(`<a href="${escapeHtml(social.twitter)}" target="_blank" rel="noopener" aria-label="Twitter"><span>t</span></a>`);
  if(social.linkedin) socialHtml.push(`<a href="${escapeHtml(social.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn"><span>in</span></a>`);
  if(social.instagram) socialHtml.push(`<a href="${escapeHtml(social.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><span>ig</span></a>`);
  if(social.indeed) socialHtml.push(`<a href="${escapeHtml(social.indeed)}" target="_blank" rel="noopener" aria-label="Indeed"><span>id</span></a>`);
  if(social.github) socialHtml.push(`<a href="${escapeHtml(social.github)}" target="_blank" rel="noopener" aria-label="GitHub"><span>gh</span></a>`);
  // Email as mailto link
  if(person.email) socialHtml.push(`<a href="mailto:${escapeHtml(person.email)}" aria-label="Email"><span>@</span></a>`);
  // Freelancer ID as a copy-to-clipboard button (no external link)
  if(freelancerId) socialHtml.push(`<a href="#" data-freelancer="${escapeHtml(freelancerId)}" class="copy-freelancer" aria-label="Copy Freelancer ID"><span>FL</span></a>`);

  return `
    <article class="card" data-id="${person.id}">
      ${avatarHtml}
      <h3>${name}</h3>
      <div class="meta">ID: ${person.id} — <span class="small">Age: ${highlightText(age, query)}</span></div>
      <div class="content">
        <div class="field">Phone: ${phone}</div>
        <div class="field">Address: ${address}</div>
      </div>
      <hr class="divider">
      <div class="social">${socialHtml.join('')}</div>
      <div class="actions" style="margin-top:10px">
        <button class="btn-sm" data-action="edit" data-id="${person.id}">Edit</button>
        <button class="btn-sm btn-danger" data-action="delete" data-id="${person.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderList(list, query){
  resultsEl.innerHTML = '';
  if(list.length === 0){
    resultsEl.innerHTML = '<div class="empty">No people match your search.</div>';
    return;
  }
  const html = list.map(person => buildCard(person, query)).join('\n');
  resultsEl.innerHTML = html;
}

function matches(person, q){
  if(!q) return true;
  const socialStr = person.social ? Object.values(person.social).join(' ') : '';
  const s = `${person.name} ${person.age || ''} ${person.phone || ''} ${person.email || ''} ${person.address || ''} ${person.freelancerId || ''} ${socialStr}`.toLowerCase();
  return s.indexOf(q.toLowerCase()) !== -1;
}

// Debounce helper
function debounce(fn, wait){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(()=>fn.apply(this,args), wait);
  };
}

function handleSearch(){
  const q = inputEl.value.trim();
  const filtered = people.filter(p => matches(p, q));
  renderList(filtered, q);
}

// Form helpers
function openForm(mode='add', person){
  formWrap.classList.remove('hidden');
  formWrap.setAttribute('aria-hidden','false');
  if(mode === 'edit' && person){
    formTitle.textContent = 'Edit Person';
    idEl.value = person.id;
    // remember original id to detect id changes during edit
    idEl.dataset.original = String(person.id);
    nameEl.value = person.name || '';
    ageEl.value = person.age ?? '';
    phoneEl.value = person.phone || '';
    emailEl.value = person.email || '';
    addressEl.value = person.address || '';
    avatarEl.value = person.avatar || '';
    facebookEl.value = (person.social && person.social.facebook) || '';
    twitterEl.value = (person.social && person.social.twitter) || '';
    linkedinEl.value = (person.social && person.social.linkedin) || '';
    instagramEl.value = (person.social && person.social.instagram) || '';
    indeedEl.value = (person.social && person.social.indeed) || '';
    githubEl.value = (person.social && person.social.github) || '';
    document.getElementById('freelancerId').value = person.freelancerId || '';
  }else{
    formTitle.textContent = 'Add Person';
    idEl.value = '';
    delete idEl.dataset.original;
    nameEl.value = '';
    ageEl.value = '';
    phoneEl.value = '';
    emailEl.value = '';
    addressEl.value = '';
    avatarEl.value = '';
    facebookEl.value = '';
    twitterEl.value = '';
    linkedinEl.value = '';
    instagramEl.value = '';
    indeedEl.value = '';
    githubEl.value = '';
    document.getElementById('freelancerId').value = '';
  }
  nameEl.focus();
}

function closeForm(){
  formWrap.classList.add('hidden');
  formWrap.setAttribute('aria-hidden','true');
}

function generateId(){
  // Generate a string ID. Prefer numeric sequence if existing IDs are numeric, otherwise use timestamp.
  const nums = people.map(p => Number(p.id)).filter(n => !Number.isNaN(n));
  if(nums.length){
    return String(Math.max(...nums) + 1);
  }
  return String(Date.now());
}

function savePersonFromForm(e){
  e.preventDefault();
  const rawId = idEl.value ? String(idEl.value).trim() : '';
  const original = idEl.dataset.original || null;
  const id = rawId || generateId();

  const payload = {
    id: String(id),
    name: nameEl.value.trim() || 'Unnamed',
    age: ageEl.value ? Number(ageEl.value) : null,
    phone: phoneEl.value.trim(),
    email: emailEl.value.trim(),
    freelancerId: (document.getElementById('freelancerId') && document.getElementById('freelancerId').value.trim()) || '',
    address: addressEl.value.trim(),
    avatar: avatarEl.value.trim(),
    social: {
      facebook: facebookEl.value.trim(),
      twitter: twitterEl.value.trim(),
      linkedin: linkedinEl.value.trim(),
      instagram: instagramEl.value.trim(),
      indeed: indeedEl.value.trim(),
      github: githubEl.value.trim()
    }
  };

  // Find existing index by id (string comparison)
  const existingIndex = people.findIndex(p => String(p.id) === String(id));

  if(original){
    // Editing an existing record (original holds the previous id)
    if(String(id) !== String(original) && existingIndex !== -1){
      // New id conflicts with another existing record
      if(!confirm('The ID you entered already exists. Overwrite that record?')) return;
      // remove the existing one so we'll replace it
      people = people.filter(p => String(p.id) !== String(id));
    }
    // replace the original record (remove it) and add payload
    people = people.filter(p => String(p.id) !== String(original));
    people.push(payload);
  }else{
    // Add mode
    if(existingIndex !== -1){
      // ID already exists
      if(!confirm('The ID you entered already exists. Overwrite that record?')) return;
      people[existingIndex] = payload;
    }else{
      people.push(payload);
    }
  }

  // clean up and persist
  delete idEl.dataset.original;
  savePeople();
  closeForm();
  handleSearch();
}

function deletePerson(id){
  if(!confirm('Delete this person?')) return;
  people = people.filter(p => String(p.id) !== String(id));
  savePeople();
  handleSearch();
}

// Event delegation for edit/delete
resultsEl.addEventListener('click', (ev)=>{
  const btn = ev.target.closest('button[data-action]');
  if(!btn) return;
  const action = btn.getAttribute('data-action');
  const id = btn.getAttribute('data-id');
  const person = people.find(p => String(p.id) === String(id));
  if(action === 'edit'){
    openForm('edit', person);
  }else if(action === 'delete'){
    deletePerson(id);
  }
});

// Handle clicks on social links inside results (copy freelancer id)
resultsEl.addEventListener('click', (ev)=>{
  const a = ev.target.closest('a.copy-freelancer');
  if(!a) return;
  ev.preventDefault();
  const id = a.getAttribute('data-freelancer') || '';
  if(!id) return;
  // try clipboard API
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(id).then(()=>{
      showCopiedBadge(a.closest('.card'), 'Copied');
    }).catch(()=>{
      alert('Freelancer ID: ' + id);
    });
  }else{
    // fallback
    try{ window.prompt('Copy Freelancer ID (Ctrl+C, Enter):', id); }catch(e){ alert('Freelancer ID: ' + id); }
  }
});

function showCopiedBadge(cardEl, text){
  if(!cardEl) return;
  let badge = cardEl.querySelector('.copied-badge');
  if(badge){ badge.textContent = text; return; }
  badge = document.createElement('div');
  badge.className = 'copied-badge';
  badge.textContent = text;
  cardEl.appendChild(badge);
  setTimeout(()=>{ badge.remove(); }, 1400);
}

// Wire up events
inputEl.addEventListener('input', debounce(handleSearch, 180));
clearBtn.addEventListener('click', ()=>{ inputEl.value = ''; inputEl.focus(); handleSearch(); });
addBtn.addEventListener('click', ()=>openForm('add'));
cancelBtn.addEventListener('click', ()=>closeForm());
formEl.addEventListener('submit', savePersonFromForm);

// Export / Import UI handlers
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importModal = document.getElementById('importModal');
const importArea = document.getElementById('importArea');
const importConfirm = document.getElementById('importConfirm');
const importCancel = document.getElementById('importCancel');

exportBtn && exportBtn.addEventListener('click', ()=>{
  try{
    const data = localStorage.getItem(STORAGE_KEY) || JSON.stringify(people, null, 2);
    // copy to clipboard
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(data).catch(()=>{});
    }
    // download file
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'people-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert('Exported JSON to clipboard and downloaded file (if allowed).');
  }catch(e){ alert('Export failed: ' + e.message); }
});

importBtn && importBtn.addEventListener('click', ()=>{
  importArea.value = localStorage.getItem(STORAGE_KEY) || JSON.stringify(people, null, 2);
  importModal.classList.remove('hidden');
  importModal.setAttribute('aria-hidden','false');
  importArea.focus();
});

importCancel && importCancel.addEventListener('click', ()=>{
  importModal.classList.add('hidden');
  importModal.setAttribute('aria-hidden','true');
});

importConfirm && importConfirm.addEventListener('click', ()=>{
  const raw = importArea.value.trim();
  if(!raw) { alert('Paste JSON to import'); return; }
  try{
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed)){
      // allow object that has array under STORAGE_KEY format
      if(parsed && typeof parsed === 'object' && parsed.people) parsed = parsed.people;
      else throw new Error('Expected JSON array');
    }
    // normalize entries: ensure id as string and social keys
    const normalized = parsed.map(p => ({
      ...p,
      id: String(p.id),
      freelancerId: p.freelancerId || '',
      social: Object.assign({}, DEFAULT_SOCIAL, p.social || {})
    }));
    if(!confirm('Importing will replace current people list. Proceed?')) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    importModal.classList.add('hidden');
    importModal.setAttribute('aria-hidden','true');
    location.reload();
  }catch(err){ alert('Import failed: ' + err.message); }
});

// Initial render (show all when search is empty)
renderList(people, '');
