(() => {
  const KEY = "parcelapp.v1";
  const STATUSES = ["Ordered", "Shipped", "In transit", "Out for delivery", "Delivered"];

  const CARRIERS = [
    { id: "ups",    label: "UPS",    test: n => /^1Z[0-9A-Z]{16}$/i.test(n),
      url: n => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}` },
    { id: "fedex",  label: "FedEx",  test: n => /^(\d{12}|\d{15})$/.test(n),
      url: n => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}` },
    { id: "usps",   label: "USPS",   test: n => /^(9[0-9]{19,21}|\d{20,22})$/.test(n),
      url: n => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(n)}` },
    { id: "dhl",    label: "DHL",    test: n => /^\d{10,11}$/.test(n) || /^JJD[0-9A-Z]{10,}$/i.test(n),
      url: n => `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(n)}` },
    { id: "intl",   label: "Intl Post", test: n => /^[A-Z]{2}\d{9}[A-Z]{2}$/i.test(n),
      url: n => `https://t.17track.net/en#nums=${encodeURIComponent(n)}` },
  ];
  const OTHER = { id: "other", label: "Parcel", url: n => `https://t.17track.net/en#nums=${encodeURIComponent(n)}` };

  const $ = sel => document.querySelector(sel);
  const el = {
    form: $("#add-form"), tracking: $("#tracking"), name: $("#name"), hint: $("#carrier-hint"),
    list: $("#list"), empty: $("#empty"), search: $("#search"),
    showArchived: $("#show-archived"), exportBtn: $("#export"), importInput: $("#import"),
  };

  let parcels = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(parcels)); }

  function detectCarrier(number) {
    const n = number.replace(/\s+/g, "").toUpperCase();
    return CARRIERS.find(c => c.test(n)) || OTHER;
  }

  function autoName(carrier) {
    const sameCarrier = parcels.filter(p => p.carrier === carrier.id).length;
    return `${carrier.label} parcel ${sameCarrier + 1}`;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function render() {
    const q = el.search.value.trim().toLowerCase();
    const showArchived = el.showArchived.checked;

    const visible = parcels
      .filter(p => showArchived || !p.archived)
      .filter(p => !q || p.name.toLowerCase().includes(q) || p.number.toLowerCase().includes(q))
      .sort((a, b) => b.added - a.added);

    el.list.innerHTML = "";
    el.empty.classList.toggle("hidden", parcels.length > 0);

    for (const p of visible) {
      const carrier = CARRIERS.find(c => c.id === p.carrier) || OTHER;
      const li = document.createElement("li");
      li.className = "parcel" + (p.archived ? " archived" : "");
      li.dataset.id = p.id;

      const top = document.createElement("div");
      top.className = "row";

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = p.name;
      title.title = "Click to rename";
      title.addEventListener("click", () => rename(p.id));

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = carrier.label;

      top.append(title, badge);

      const meta = document.createElement("div");
      meta.className = "meta";
      const link = document.createElement("a");
      link.href = carrier.url(p.number);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = p.number;
      meta.append(link, document.createTextNode(` · added ${formatDate(p.added)}`));

      const actions = document.createElement("div");
      actions.className = "actions";

      const sel = document.createElement("select");
      sel.setAttribute("aria-label", "Status");
      for (const s of STATUSES) {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        if (s === p.status) opt.selected = true;
        sel.append(opt);
      }
      sel.addEventListener("change", () => update(p.id, { status: sel.value }));

      const arch = document.createElement("button");
      arch.type = "button";
      arch.textContent = p.archived ? "Unarchive" : "Archive";
      arch.addEventListener("click", () => update(p.id, { archived: !p.archived }));

      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "Delete";
      del.className = "danger";
      del.addEventListener("click", () => remove(p.id));

      actions.append(sel, arch, del);
      li.append(top, meta, actions);
      el.list.append(li);
    }
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  }

  function update(id, patch) {
    parcels = parcels.map(p => p.id === id ? { ...p, ...patch } : p);
    save();
    render();
  }

  function rename(id) {
    const p = parcels.find(x => x.id === id);
    const next = prompt("Rename parcel", p.name);
    if (next && next.trim()) update(id, { name: next.trim() });
  }

  function remove(id) {
    const p = parcels.find(x => x.id === id);
    if (!confirm(`Delete "${p.name}"?`)) return;
    parcels = parcels.filter(x => x.id !== id);
    save();
    render();
  }

  el.tracking.addEventListener("input", () => {
    const v = el.tracking.value.trim();
    el.hint.textContent = v ? `Detected: ${detectCarrier(v).label}` : "";
  });

  el.form.addEventListener("submit", e => {
    e.preventDefault();
    const number = el.tracking.value.replace(/\s+/g, "").trim();
    if (!number) return;

    if (parcels.some(p => p.number.toUpperCase() === number.toUpperCase())) {
      el.hint.textContent = "That tracking number is already in the list.";
      return;
    }

    const carrier = detectCarrier(number);
    const name = el.name.value.trim() || autoName(carrier);

    parcels.push({
      id: uid(),
      number,
      name,
      carrier: carrier.id,
      status: "Ordered",
      archived: false,
      added: Date.now(),
    });
    save();

    el.form.reset();
    el.hint.textContent = "";
    render();
    el.tracking.focus();
  });

  el.search.addEventListener("input", render);
  el.showArchived.addEventListener("change", render);

  el.exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(parcels, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `parcelapp-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  el.importInput.addEventListener("change", async () => {
    const file = el.importInput.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error("not a list");
      const known = new Set(parcels.map(p => p.number.toUpperCase()));
      for (const p of data) {
        if (p && p.number && !known.has(p.number.toUpperCase())) {
          parcels.push({ ...p, id: p.id || uid(), added: p.added || Date.now() });
          known.add(p.number.toUpperCase());
        }
      }
      save();
      render();
    } catch {
      alert("That file could not be imported.");
    }
    el.importInput.value = "";
  });

  render();
})();
