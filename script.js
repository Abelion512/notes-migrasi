// Sederhana, tersimpan di memori (refresh = hilang)
let groups = [
  { name: "Juni 2025", type: "Bulan", meta: "Juni 2025", notes: ["Catatan pertama!"] },
  { name: "Happy", type: "Mood", meta: "😊 Mood: Happy", notes: [] },
];

function renderGroups() {
  const groupsList = document.getElementById('groups-list');
  groupsList.innerHTML = '';
  groups.forEach((group, gIdx) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-card';
    groupDiv.innerHTML = `
      <div class="group-header">
        <span class="group-title">${group.name}</span>
        <span class="group-meta">${group.meta}</span>
      </div>
      <div class="notes-list">
        ${group.notes.map(note =>
          `<div class="note">${note}</div>`
        ).join('')}
      </div>
    `;
    groupsList.appendChild(groupDiv);
  });
}

document.getElementById('add-group-btn').onclick = function() {
  let groupType = prompt("Pilih tipe group:\n1. Bulan\n2. Mood");
  if (!groupType) return;
  groupType = groupType.trim();
  let name, meta;
  if (groupType === "1" || groupType.toLowerCase() === "bulan") {
    name = prompt("Masukkan nama bulan (misal: Juni 2025):");
    if (!name) return;
    meta = name;
    groups.push({ name, type: "Bulan", meta, notes: [] });
  } else if (groupType === "2" || groupType.toLowerCase() === "mood") {
    name = prompt("Masukkan nama mood (misal: Happy):");
    if (!name) return;
    meta = "😊 Mood: " + name;
    groups.push({ name, type: "Mood", meta, notes: [] });
  } else {
    alert("Pilihan tidak valid.");
    return;
  }
  renderGroups();
};

document.getElementById('add-note-btn').onclick = function() {
  if(groups.length === 0) {
    alert("Buat group dulu!");
    return;
  }
  let groupOptions = groups.map((g,i) => `${i+1}. ${g.name} (${g.type})`).join('\n');
  let groupIdx = prompt(`Tambah catatan ke group ke berapa?\n${groupOptions}`);
  let idx = parseInt(groupIdx)-1;
  if(idx >= 0 && idx < groups.length) {
    let note = prompt("Isi catatan:");
    if(note) {
      groups[idx].notes.push(note);
      renderGroups();
    }
  }
};

renderGroups();