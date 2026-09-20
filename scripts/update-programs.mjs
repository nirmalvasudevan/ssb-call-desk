// Pulls upcoming Karnataka + Sadhguru Sannidhi programs from Isha's public
// schedule feed (the same feed isha.sadhguru.org/in/en/program-finder uses)
// and writes programs.json for the SSB Call Desk app.
// Runs daily via .github/workflows/update-programs.yml. Needs Node 18+.
import { writeFile } from "node:fs/promises";

const API = "https://api.ishafoundation.org/scheduleApi";
const LIST = `${API}/data.php?task=list`;
const FILTER_KA = `${API}/api.php?option=com_program&v=2&format=json&task=filter&country=IN&count=999&state=KA`;
const DETAILS = (id) => `${API}/api.php?option=com_program&v=2&format=json&task=details&program_id=${id}`;

async function getJSON(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (SSB Call Desk updater)", Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
}

export async function buildPrograms() {
  const list = (await getJSON(LIST)).results
    .map((o) => Object.values(o)[0])
    .filter((p) => p.cntry === "IN" && (p.state === "KA" || p.state === "KN"));

  const rich = {};
  for (const o of (await getJSON(FILTER_KA)).results) {
    const p = Object.values(o)[0];
    rich[p.program_id] = p;
  }

  const out = [];
  for (const p of list) {
    const r = rich[p.id];
    let extra;
    if (r) {
      extra = { time: (r.time || "").trim(), venue: r.address_title || "", area: r.address || "", fee: r.amount || "", url: r.register_url || "", lang: r.language || p.lang, gender: r.gender || "" };
    } else {
      const j = await getJSON(DETAILS(p.id));
      const d = (j.data && (j.data[0] || Object.values(j.data)[0])) || j[0] || {};
      extra = {
        time: "",
        venue: (d.address || "").split("\n")[0].trim(),
        area: [p.place, p.city].filter(Boolean).join(", "),
        fee: (Array.isArray(d.amount) && d.amount[0] && d.amount[0].amount) || "",
        url: d.register_url || "",
        lang: d.language || p.lang,
        gender: d.gender || "",
      };
    }
    const rec = { id: p.id, name: p.name, start: p.fr, end: p.to, ...extra };
    if (rec.gender === "unspecified" || !rec.gender) delete rec.gender;
    if (!rec.time) delete rec.time;
    if (/regClosed/.test(p.flag)) rec.closed = true;
    if (/(^|,)free(,|$)/.test(p.flag)) rec.free = true;
    if (/online/.test(p.flag)) rec.online = true;
    if (p.state === "KN" || /sannidhi/i.test(p.place || "")) rec.ssb = true;
    out.push(rec);
  }

  const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); // IST date
  return out
    .filter((p) => (p.end || p.start).slice(0, 10) >= today)
    .sort((a, b) => a.start.localeCompare(b.start));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const programs = await buildPrograms();
  if (!programs.length) throw new Error("Feed returned no programs — keeping yesterday's file.");
  const data = { updated: new Date().toISOString(), source: "https://isha.sadhguru.org/in/en/program-finder", programs };
  await writeFile(new URL("../programs.json", import.meta.url), JSON.stringify(data, null, 1));
  console.log(`Wrote ${programs.length} programs`);
}
