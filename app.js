// Portfolio renderer — reads resume.json (JSON Resume schema) and renders every
// populated section. Empty sections stay hidden. No framework, no build step.

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function show(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) el.hidden = false;
}

async function loadPortfolio() {
  let data;
  try {
    const res = await fetch("resume.json");
    if (!res.ok) throw new Error(res.statusText);
    data = await res.json();
  } catch (e) {
    document.body.innerHTML =
      "<p style='padding:2rem'>Could not load <code>resume.json</code> — check that it exists and is valid JSON.</p>";
    return;
  }

  const b = data.basics || {};
  document.title = b.name ? `${b.name} — Portfolio` : "Portfolio";

  // Hero
  const linkedinUrl = b.url || (b.profiles || []).find((p) => /linkedin/i.test(p.network))?.url;
  document.getElementById("hero").innerHTML = `
    ${b.image ? `<img src="${esc(b.image)}" alt="${esc(b.name)}" class="avatar" onerror="this.remove()" />` : ""}
    <h1>${esc(b.name)}</h1>
    ${b.label ? `<p class="label">${esc(b.label)}</p>` : ""}
    ${b.location ? `<p class="location">${esc(b.location.city)}${b.location.region ? ", " + esc(b.location.region) : ""}</p>` : ""}
    <nav class="links">
      ${b.email ? `<a href="mailto:${esc(b.email)}">Email</a>` : ""}
      ${b.phone ? `<a href="tel:${esc(b.phone)}">Phone</a>` : ""}
      ${linkedinUrl ? `<a href="${esc(linkedinUrl)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ""}
    </nav>
  `;

  // Summary
  if (b.summary) {
    document.getElementById("summary").innerHTML = esc(b.summary);
    show("summary-section");
  }

  // Work Experience
  if ((data.work || []).length) {
    document.getElementById("work-list").innerHTML = data.work.map((w) => `
      <article class="entry">
        <h3>${esc(w.position)}${w.name ? " · " + esc(w.name) : ""}</h3>
        <span class="dates">${esc(w.startDate)} – ${esc(w.endDate || "Present")}</span>
        ${w.summary ? `<p>${esc(w.summary)}</p>` : ""}
        ${(w.highlights || []).length ? `<ul>${w.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      </article>
    `).join("");
    show("experience-section");
  }

  // Education
  if ((data.education || []).length) {
    document.getElementById("edu-list").innerHTML = data.education.map((e) => `
      <article class="entry">
        <h3>${esc(e.studyType)}${e.area ? " · " + esc(e.area) : ""}</h3>
        <span class="dates">${esc(e.startDate)} – ${esc(e.endDate || "")}</span>
        <p>${esc(e.institution)}</p>
      </article>
    `).join("");
    show("education-section");
  }

  // Skills
  if ((data.skills || []).length) {
    document.getElementById("skill-list").innerHTML = data.skills.map((s) => `
      <div class="skill">
        <strong>${esc(s.name)}</strong>
        ${(s.keywords || []).length ? `<div class="keywords">${s.keywords.map(esc).join(", ")}</div>` : ""}
      </div>
    `).join("");
    show("skills-section");
  }

  // Certificates
  if ((data.certificates || []).length) {
    document.getElementById("cert-list").innerHTML = data.certificates.map((c) => `
      <article class="entry">
        <h3>${esc(c.name)}</h3>
        <span class="dates">${c.issuer ? esc(c.issuer) : ""}${c.startDate ? (c.issuer ? " — " : "") + esc(c.startDate) + (c.endDate ? " – " + esc(c.endDate) : " – Present") : ""}</span>
        ${c.credentialId ? `<p><strong>ID:</strong> ${esc(c.credentialId)}</p>` : ""}
      </article>
    `).join("");
    show("certificates-section");
  }

  // Languages
  if ((data.languages || []).length) {
    document.getElementById("languages-list").innerHTML = data.languages.map((lang) => `
      <div class="language">
        <strong>${esc(lang.language)}</strong>
        ${lang.fluency ? `<div class="language-fluency">${esc(lang.fluency)}</div>` : ""}
      </div>
    `).join("");
    show("languages-section");
  }

  // Contact
  if (b.email) {
    document.getElementById("contact-btn").href = `mailto:${esc(b.email)}`;
    show("contact-section");
  }
}

loadPortfolio(); 
