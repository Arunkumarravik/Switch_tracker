/* Shared JS for sidebar + page fetch glue
   Endpoints used (example):
   GET  /api/stats                 -> returns { appliedCount, interviewCount }
   GET  /api/daily?role=&location= -> returns job list
   POST /api/apply                 -> accepts applied job payload
   GET  /api/applied               -> returns list of applied jobs
   PUT  /api/applied/:id/status    -> update status for an applied job
*/

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');
  const toggleBtn = document.querySelectorAll('.collapse-toggle');
  toggleBtn.forEach(btn => btn.addEventListener('click', () => {
    app.classList.toggle('collapsed');
  }));

  // Page-specific bootstraps
  const page = document.body.dataset.page;
  if (page === 'index') bootIndex();
  if (page === 'daily') bootDaily();
  if (page === 'apply') bootApply();
  if (page === 'applied') bootApplied();

  // Navigation helper for the index buttons
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      const href = e.currentTarget.dataset.nav;
      window.location.href = href;
    });
  });
});

/* ----- INDEX ----- */
async function bootIndex(){
  const statsHolder = document.getElementById('statsHolder');
  // Example fetch - replace URL with your backend endpoint
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed fetching stats');
    const data = await res.json();
    statsHolder.innerHTML = renderStatsTable(data);
  } catch (err) {
    // Fallback placeholder
    statsHolder.innerHTML = `<div class="card empty">
      Could not load stats from backend. Example shape: { appliedCount: 12, interviewCount: 3 }
    </div>`;
    console.warn(err);
  }
}
function renderStatsTable(data){
  return `
    <div class="card">
      <h3>Overview</h3>
      <table class="table">
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Total Companies Applied</td><td>${data.appliedCount ?? 0}</td></tr>
          <tr><td>Interview Calls</td><td>${data.interviewCount ?? 0}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

/* ----- DAILY ----- */
function bootDaily(){
  const filterForm = document.getElementById('dailyFilters');
  const results = document.getElementById('dailyResults');
  filterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(filterForm);
    const params = new URLSearchParams({
      role: form.get('role') || '',
      location: form.get('location') || '',
      date: form.get('date') || ''
    });
    results.innerHTML = `<div class="card empty">Searching...</div>`;
    try {
      const res = await fetch('/api/daily?' + params.toString());
      if (!res.ok) throw new Error('fetch error');
      const jobs = await res.json();
      if (!jobs.length) results.innerHTML = `<div class="card empty">No jobs found</div>`;
      else results.innerHTML = jobs.map(renderJobCard).join('');
    } catch (err) {
      results.innerHTML = `<div class="card empty">Failed to fetch jobs from backend.</div>`;
      console.warn(err);
    }
  });
}
function renderJobCard(job){
  return `<div class="card" style="margin-bottom:10px;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:700">${escapeHtml(job.title || job.role || 'Title')}</div>
        <div class="small">${escapeHtml(job.company || '')} • ${escapeHtml(job.location || '')}</div>
      </div>
      <div>
        <a class="small" href="${escapeHtml(job.link || '#')}" target="_blank" rel="noopener">Visit</a>
      </div>
    </div>
  </div>`;
}

/* ----- APPLY ----- */
function bootApply(){
  const form = document.getElementById('applyForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    // cast checkbox
    data.contacted_via_linkedin = form.querySelector('[name="contacted_via_linkedin"]').checked;

    //formatting the data to post into backend

    const now = new Date();
    const formattedTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');
    console.log(formattedTimestamp);

  
    json_data={
      user_id : "1" ,
      current_company_id : "1",
      company_id: "56789" , 
      company_name : data.company_name ,
      contacted_via_social_media:  data.contacted_via_linkedin ,
      company_url : data.careers_link,
      job_applied_ts :  formattedTimestamp,
      modified_ts : formattedTimestamp,
      key_role : "Data Engineer" ,
      status : "Fresh" ,
      operation_type : "I" , 
      comments : data.notes
    }
    
 
    console.log(json_data)
    // Clear password in logs, don't log sensitive data
    try {
      const res = await fetch('https://post-company-details-214580149659.us-west1.run.app', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(json_data)
      });
      if (!res.ok) throw new Error('server rejected');
      const resp = await res.json();
      console.log(resp)
      alert('Saved — ' + (resp.message || 'success'));
      form.reset();
    } catch (err) {
      alert('Failed to save. Check console for details.');
      console.warn(err);
    }
  });
}

/* ----- APPLIED ----- */
async function bootApplied(){
  const holder = document.getElementById('appliedHolder');
  holder.innerHTML = `<div class="card empty">Loading...</div>`;
  try {
    const res = await fetch('/api/applied');
    if (!res.ok) throw new Error('fetch failed');
    const rows = await res.json();
    if (!rows.length) {
      holder.innerHTML = `<div class="card empty">No applied jobs found.</div>`;
      return;
    }
    holder.innerHTML = renderAppliedTable(rows);
    // wire up update buttons
    document.querySelectorAll('.update-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        const input = document.querySelector(`#status-input-${id}`);
        const newStatus = input.value.trim();
        if (!newStatus) { alert('Enter a status'); return; }
        try {
          const res = await fetch(`/api/applied/${id}/status`, {
            method:'PUT',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ status: newStatus })
          });
          if (!res.ok) throw new Error('update failed');
          alert('Status updated');
        } catch (err) {
          alert('Update failed. See console.');
          console.warn(err);
        }
      });
    });
  } catch (err) {
    holder.innerHTML = `<div class="card empty">Failed to load applied list.</div>`;
    console.warn(err);
  }
}
function renderAppliedTable(rows){
  return `
    <div class="card">
      <table class="table" role="table" aria-label="Applied jobs">
        <thead>
          <tr><th>Company name</th><th>Status</th><th>Applied days ago</th><th>Change status</th></tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${escapeHtml(r.company)}</td>
              <td>${escapeHtml(r.status)}</td>
              <td>${escapeHtml(String(r.applied_days_ago))}</td>
              <td>
                <div style="display:flex;gap:8px;align-items:center;">
                  <input id="status-input-${r.id}" class="input" type="text" placeholder="New status" />
                  <button class="cta-btn update-status-btn" data-id="${r.id}" style="padding:8px 12px;">Update</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* small util: escape to avoid injection in demo */
function escapeHtml(s){
  if (s == null) return '';
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}
