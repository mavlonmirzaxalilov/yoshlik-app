// Loyiha jarayoni sahifasi: hujjatlardan (sprints/, PRD.md, SAVALA.md, DECISIONS.md)
// va git tarixidan progress.html yasaydi.
// Ishga tushirish: npm run progress   (npm run dev ham avval shuni yangilaydi)

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const oqi = (f) => (existsSync(join(ROOT, f)) ? readFileSync(join(ROOT, f), "utf8").replace(/\r\n/g, "\n") : "");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Oddiy inline markdown: `kod`, **qalin**, ~~chizilgan~~
const md = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/\*\(([^)]*)\)\*/g, '<span class="izoh">($1)</span>');

// Markdown faylidan "## Sarlavha" bo'limini olish
const bolim = (matn, sarlavha) => {
  const i = matn.search(new RegExp(`^#{2,3} ${sarlavha}`, "m"));
  if (i < 0) return "";
  const qolgani = matn.slice(i).split("\n").slice(1).join("\n");
  const keyingi = qolgani.search(/^#{1,3} |^---$/m);
  return (keyingi < 0 ? qolgani : qolgani.slice(0, keyingi)).trim();
};

const tozala = (s) =>
  s
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

// ---------- Sprintlar ----------
const sprintFayllar = existsSync(join(ROOT, "sprints"))
  ? readdirSync(join(ROOT, "sprints"))
      .filter((f) => /^SPRINT-\d+-.*\.md$/.test(f))
      .sort((a, b) => parseInt(a.split("-")[1]) - parseInt(b.split("-")[1]))
  : [];

const sprintlar = sprintFayllar.map((fayl) => {
  const matn = oqi(`sprints/${fayl}`);
  const raqam = parseInt(fayl.split("-")[1]);
  const nom = (matn.match(/^# SPRINT \d+ — (.+)$/m) || [])[1] ?? fayl;
  const maqsad = (matn.match(/^\*\*Maqsad:\*\* (.+)$/m) || [])[1] ?? "";
  const savol = (matn.match(/^\*\*Savol:\*\* (.+)$/m) || [])[1] ?? "";
  const tasklar = [...bolim(matn, "Tasklar").matchAll(/^- \[( |x)\] (.+)$/gm)].map((m) => ({
    bajarildi: m[1] === "x",
    kochirildi: m[1] === " " && /ko'chirildi/.test(m[2]),
    matn: m[2],
  }));
  const hisobot = tozala(bolim(matn, "Hisobot"));
  const handoff = tozala(bolim(matn, "Handoff"));
  const asosiy = tasklar.filter((t) => !t.kochirildi);
  const bajarildi = asosiy.filter((t) => t.bajarildi).length;
  return { fayl, raqam, nom, maqsad, savol, tasklar, hisobot, handoff, bajarildi, jami: asosiy.length };
});

let joriyTopildi = false;
for (const s of sprintlar) {
  if (s.jami > 0 && s.bajarildi === s.jami) s.holat = "tugadi";
  else if (!joriyTopildi) {
    // Joriy sprint: biror task bajarilgan bo'lsa "jarayonda", hali boshlanmagan bo'lsa "navbatda"
    s.holat = s.bajarildi > 0 ? "jarayonda" : "navbatda";
    joriyTopildi = true;
  } else s.holat = "kutilmoqda";
}
const joriy = sprintlar.find((s) => s.holat === "jarayonda" || s.holat === "navbatda");

// ---------- Tayyorgarlik bosqichlari ----------
const savala = oqi("SAVALA.md");
const qaror = (savala.match(/### Qaror\n\*\*([^*]+)\*\*/) || [])[1];
const shartlar = [...bolim(savala, "Qaror").matchAll(/^\d+\. (.+)$/gm)].map((m) => m[1]);
const tayyorgarlik = [
  { nom: "Charxla", izoh: "G'oya bir jumlada", tugadi: existsSync(join(ROOT, "PRD.md")) },
  { nom: "Qovurdoq", izoh: "5 blok savol", tugadi: existsSync(join(ROOT, ".vibecoding/qovurdoq.md")) },
  { nom: "PRDla", izoh: "Hujjatlar paketi", tugadi: existsSync(join(ROOT, "PRD.md")) },
  { nom: "Savala", izoh: qaror ? `Qaror: ${qaror}` : "Ekspertlar paneli", tugadi: Boolean(qaror) },
];

// ---------- Ochiq savollar (PRD, 9-bo'lim) ----------
const prd = oqi("PRD.md");
const ochiqGuruhlar = [];
for (const qator of bolim(prd, "9\\. Ochiq savollar").split("\n")) {
  const sarlavha = qator.match(/^\*\*(.+)\*\*$/);
  const band = qator.match(/^- (.+)$/);
  if (sarlavha) ochiqGuruhlar.push({ nom: sarlavha[1], savollar: [] });
  else if (band) {
    if (!ochiqGuruhlar.length) ochiqGuruhlar.push({ nom: "Ochiq savollar", savollar: [] });
    const [savol, muddat] = band[1].split(/ — (?=[^—]+$)/);
    ochiqGuruhlar.at(-1).savollar.push({ savol, muddat: muddat ?? "" });
  }
}
const ochiqSoni = ochiqGuruhlar.reduce((s, g) => s + g.savollar.length, 0);

// ---------- Qarorlar ----------
const qarorlar = [...oqi("DECISIONS.md").matchAll(/^- (\d{4}-\d{2}-\d{2}) · (.+?) · (.+)$/gm)].map((m) => ({
  sana: m[1],
  qaror: m[2],
  sabab: m[3],
}));

// ---------- Git ----------
let commitlar = [];
try {
  commitlar = execSync('git log -n 10 --date=short --pretty=format:"%h|%ad|%s"', { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      const [hash, sana, ...xabar] = l.split("|");
      return { hash, sana, xabar: xabar.join("|") };
    });
} catch {
  /* git yo'q — bo'lim bo'sh qoladi */
}

// ---------- Hisob ----------
const jamiTask = sprintlar.reduce((s, x) => s + x.jami, 0);
const bajarilganTask = sprintlar.reduce((s, x) => s + x.bajarildi, 0);
const tugaganSprint = sprintlar.filter((s) => s.holat === "tugadi").length;
const foiz = jamiTask ? Math.round((bajarilganTask / jamiTask) * 100) : 0;
const vaqt = new Date().toLocaleString("uz-UZ", { dateStyle: "medium", timeStyle: "short" });
const holatNomi = { tugadi: "Tugadi", jarayonda: "Jarayonda", navbatda: "Navbatda", kutilmoqda: "Kutilmoqda" };

// ---------- HTML ----------
const sprintKartasi = (s) => {
  const p = s.jami ? Math.round((s.bajarildi / s.jami) * 100) : 0;
  const kochgan = s.tasklar.filter((t) => t.kochirildi).length;
  return `
  <article class="sprint ${s.holat}">
    <div class="sprint-bosh">
      <span class="sprint-raqam">S${s.raqam}</span>
      <span class="belgi ${s.holat}">${holatNomi[s.holat]}</span>
    </div>
    <h3>${esc(s.nom)}</h3>
    <p class="savol">${md(s.savol)}</p>
    <div class="chiziq" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></div>
    <p class="son">${s.bajarildi}/${s.jami} task${kochgan ? ` · ${kochgan} ta ko'chirilgan` : ""}</p>
  </article>`;
};

const taskRoyxati = (s) =>
  s.tasklar
    .map(
      (t) => `<li class="${t.bajarildi ? "bajarildi" : t.kochirildi ? "kochirildi" : ""}">
        <span class="katak" aria-hidden="true">${t.bajarildi ? "✓" : t.kochirildi ? "→" : ""}</span>
        <span>${md(t.matn)}</span></li>`,
    )
    .join("");

const html = `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Yoshlik — jarayon</title>
<style>
  :root {
    --fon: #f5f5f4; --karta: #ffffff; --matn: #1c1917; --xira: #78716c; --chegara: #e7e5e4;
    --yashil: #059669; --yashil-fon: #ecfdf5; --sariq: #b45309; --sariq-fon: #fffbeb;
    --kulrang-fon: #f5f5f4; --kod: #f5f5f4;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fon: #0c0a09; --karta: #1c1917; --matn: #f5f5f4; --xira: #a8a29e; --chegara: #292524;
      --yashil: #34d399; --yashil-fon: #052e22; --sariq: #fbbf24; --sariq-fon: #2a1d05;
      --kulrang-fon: #292524; --kod: #292524;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--fon); color: var(--matn);
    font: 15px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 1040px; margin: 0 auto; padding: 32px 16px 64px; }
  header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 24px; }
  h1 { margin: 0; font-size: 28px; letter-spacing: -0.02em; }
  h2 { font-size: 18px; margin: 36px 0 12px; }
  h3 { margin: 6px 0 2px; font-size: 16px; }
  .xira, .savol, .son, .izoh { color: var(--xira); }
  .savol { margin: 0 0 12px; font-size: 14px; }
  .son { margin: 6px 0 0; font-size: 13px; }
  .izoh { font-size: 13px; }
  code { background: var(--kod); padding: 1px 5px; border-radius: 4px; font-size: 13px; }
  .karta { background: var(--karta); border: 1px solid var(--chegara); border-radius: 14px; padding: 18px; }
  .umumiy { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .raqam { font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
  .chiziq { height: 8px; background: var(--kulrang-fon); border-radius: 99px; overflow: hidden; }
  .chiziq span { display: block; height: 100%; background: var(--yashil); border-radius: 99px; }
  .bosqichlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
  .bosqich { display: flex; gap: 12px; align-items: center; }
  .doira { width: 30px; height: 30px; flex: none; border-radius: 50%; display: grid; place-items: center;
    font-weight: 700; background: var(--kulrang-fon); color: var(--xira); }
  .doira.tugadi { background: var(--yashil-fon); color: var(--yashil); }
  .sprintlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
  .sprint { background: var(--karta); border: 1px solid var(--chegara); border-radius: 14px; padding: 16px; }
  .sprint.jarayonda, .sprint.navbatda { border-color: var(--sariq); box-shadow: 0 0 0 1px var(--sariq); }
  .sprint-bosh { display: flex; justify-content: space-between; align-items: center; }
  .sprint-raqam { font-weight: 700; color: var(--xira); }
  .belgi { font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 99px; background: var(--kulrang-fon); color: var(--xira); }
  .belgi.tugadi { background: var(--yashil-fon); color: var(--yashil); }
  .belgi.jarayonda, .belgi.navbatda { background: var(--sariq-fon); color: var(--sariq); }
  ul.tasklar { list-style: none; padding: 0; margin: 0; }
  ul.tasklar li { display: flex; gap: 10px; padding: 8px 0; border-top: 1px solid var(--chegara); }
  ul.tasklar li:first-child { border-top: 0; }
  .katak { width: 20px; height: 20px; flex: none; margin-top: 2px; border: 2px solid var(--chegara); border-radius: 6px;
    display: grid; place-items: center; font-size: 12px; font-weight: 700; }
  li.bajarildi .katak { background: var(--yashil); border-color: var(--yashil); color: var(--karta); }
  li.bajarildi > span:last-child { color: var(--xira); }
  li.kochirildi .katak { color: var(--sariq); border-color: var(--sariq); }
  .ikki { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
  .royxat { margin: 0; padding-left: 18px; }
  .royxat li { margin: 6px 0; }
  .muddat { display: inline-block; font-size: 12px; color: var(--sariq); background: var(--sariq-fon);
    padding: 0 8px; border-radius: 99px; margin-left: 4px; white-space: nowrap; }
  .guruh { font-weight: 600; margin: 14px 0 4px; }
  .guruh:first-child { margin-top: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  td { padding: 8px 6px; border-top: 1px solid var(--chegara); vertical-align: top; }
  tr:first-child td { border-top: 0; }
  td.sana { color: var(--xira); white-space: nowrap; width: 1%; }
  .jadval { overflow-x: auto; }
  footer { margin-top: 40px; color: var(--xira); font-size: 13px; }
</style>
</head>
<body>
<main>
  <header>
    <div>
      <p class="xira" style="margin:0">Loyiha jarayoni</p>
      <h1>Yoshlik — onlayn zakaz</h1>
    </div>
    <p class="xira" style="margin:0">Yangilangan: ${esc(vaqt)}</p>
  </header>

  <section class="umumiy" aria-label="Umumiy holat">
    <div class="karta">
      <div class="xira">Umumiy progress</div>
      <div class="raqam">${foiz}%</div>
      <div class="chiziq"><span style="width:${foiz}%"></span></div>
      <div class="son">${bajarilganTask}/${jamiTask} task</div>
    </div>
    <div class="karta"><div class="xira">Sprintlar</div><div class="raqam">${tugaganSprint}/${sprintlar.length}</div><div class="son">tugadi</div></div>
    <div class="karta"><div class="xira">Joriy sprint</div><div class="raqam">${joriy ? `S${joriy.raqam}` : "—"}</div><div class="son">${joriy ? esc(joriy.nom) : "hammasi tugadi"}</div></div>
    <div class="karta"><div class="xira">Ochiq savollar</div><div class="raqam">${ochiqSoni}</div><div class="son">PRD, 9-bo'lim</div></div>
  </section>

  <h2>Tayyorgarlik</h2>
  <section class="karta bosqichlar">
    ${tayyorgarlik
      .map(
        (b) => `<div class="bosqich"><span class="doira ${b.tugadi ? "tugadi" : ""}">${b.tugadi ? "✓" : "·"}</span>
        <div><strong>${b.nom}</strong><div class="xira" style="font-size:13px">${esc(b.izoh)}</div></div></div>`,
      )
      .join("")}
  </section>

  <h2>Sprintlar</h2>
  <section class="sprintlar">${sprintlar.map(sprintKartasi).join("")}</section>

  ${
    joriy
      ? `<h2>Joriy sprint: S${joriy.raqam} — ${esc(joriy.nom)}</h2>
  <section class="ikki">
    <div class="karta">
      <p style="margin-top:0">${md(joriy.maqsad)}</p>
      <ul class="tasklar">${taskRoyxati(joriy)}</ul>
    </div>
    <div class="karta">
      <strong>Handoff</strong>
      ${joriy.handoff.length ? `<ul class="royxat">${joriy.handoff.map((l) => `<li>${md(l)}</li>`).join("")}</ul>` : '<p class="xira">Hali yozilmagan.</p>'}
    </div>
  </section>`
      : ""
  }

  ${sprintlar
    .filter((s) => s.holat === "tugadi" || (s.holat === "jarayonda" && s.hisobot.length))
    .map(
      (s) => `<details class="karta" style="margin-top:12px"><summary><strong>S${s.raqam} — ${esc(s.nom)}</strong> · hisobot va tasklar</summary>
      <ul class="tasklar" style="margin-top:12px">${taskRoyxati(s)}</ul>
      ${s.hisobot.length ? `<p class="xira" style="margin-bottom:0">${s.hisobot.map(md).join("<br>")}</p>` : ""}
      ${s.handoff.length ? `<p style="margin-bottom:0"><strong>Handoff:</strong> ${s.handoff.map(md).join(" ")}</p>` : ""}</details>`,
    )
    .join("")}

  <section class="ikki" style="margin-top:36px">
    <div class="karta">
      <h2 style="margin-top:0">Ochiq savollar</h2>
      ${ochiqGuruhlar
        .map(
          (g) => `<div class="guruh">${esc(g.nom)}</div><ul class="royxat">${g.savollar
            .map((q) => `<li>${md(q.savol)}${q.muddat ? `<span class="muddat">${esc(q.muddat)}</span>` : ""}</li>`)
            .join("")}</ul>`,
        )
        .join("") || '<p class="xira">Ochiq savol yo\'q.</p>'}
    </div>
    <div class="karta">
      <h2 style="margin-top:0">Savala: ${esc(qaror ?? "—")}</h2>
      ${shartlar.length ? `<ol class="royxat">${shartlar.map((s) => `<li>${md(s)}</li>`).join("")}</ol>` : '<p class="xira">Savala o\'tkazilmagan.</p>'}
    </div>
  </section>

  <h2>So'nggi qarorlar</h2>
  <section class="karta jadval"><table>${qarorlar
    .slice(-8)
    .reverse()
    .map((q) => `<tr><td class="sana">${q.sana}</td><td><strong>${md(q.qaror)}</strong><div class="xira">${md(q.sabab)}</div></td></tr>`)
    .join("")}</table></section>

  <h2>Commitlar</h2>
  <section class="karta jadval"><table>${
    commitlar.map((c) => `<tr><td class="sana">${c.sana}</td><td><code>${c.hash}</code> ${esc(c.xabar)}</td></tr>`).join("") ||
    '<tr><td class="xira">Hali commit yo\'q.</td></tr>'
  }</table></section>

  <footer>Bu sahifa <code>npm run progress</code> bilan hujjatlardan avtomatik yasaladi — qo'lda tahrirlamang.</footer>
</main>
</body>
</html>
`;

writeFileSync(join(ROOT, "progress.html"), html);
console.log(`progress.html yangilandi: ${foiz}% (${bajarilganTask}/${jamiTask} task), joriy sprint: ${joriy ? `S${joriy.raqam}` : "—"}`);
