// Yoshlik — chek dasturi (kassa kompyuteri, Windows).
// Bot zakazlari kelganda ikki USB printerga avtomatik chek chiqaradi: oshxona (narxsiz) va kassa (narxlari bilan).
//
// Talab: Node.js 18+ (https://nodejs.org), printerlar Windows'da o'rnatilgan (drayver bilan).
// Buyruqlar (shu papkada):
//   node chek-dasturi.mjs              — ishga tushirish (doim ochiq turadi)
//   node chek-dasturi.mjs printerlar   — kompyuterdagi printerlar nomi
//   node chek-dasturi.mjs sinov        — ikkala printerga sinov cheki
// Sozlamalar: shu papkadagi chek-sozlama.json (birinchi ishga tushirishda yaratiladi).

import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PAPKA = dirname(fileURLToPath(import.meta.url));
const SOZLAMA_FAYL = join(PAPKA, "chek-sozlama.json");
const SORASH_MS = 3000;

const vaqt = () => new Date().toLocaleTimeString("ru-RU");
const log = (...a) => console.log(`[${vaqt()}]`, ...a);

// ---------- Windows printerga RAW (ESC/POS) yuborish ----------

const RAW_PS1 = join(tmpdir(), "yoshlik-chek-raw.ps1");
writeFileSync(
  RAW_PS1,
  `param([string]$Printer, [string]$Fayl)
$ErrorActionPreference = "Stop"
Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices;
public class YoshlikRaw {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public class DOCINFO { public string pDocName; public string pOutputFile; public string pDataType; }
  [DllImport("winspool.drv", CharSet = CharSet.Unicode, SetLastError = true)] public static extern bool OpenPrinter(string n, out IntPtr h, IntPtr d);
  [DllImport("winspool.drv", SetLastError = true)] public static extern bool ClosePrinter(IntPtr h);
  [DllImport("winspool.drv", CharSet = CharSet.Unicode, SetLastError = true)] public static extern int StartDocPrinter(IntPtr h, int l, DOCINFO d);
  [DllImport("winspool.drv", SetLastError = true)] public static extern bool EndDocPrinter(IntPtr h);
  [DllImport("winspool.drv", SetLastError = true)] public static extern bool StartPagePrinter(IntPtr h);
  [DllImport("winspool.drv", SetLastError = true)] public static extern bool EndPagePrinter(IntPtr h);
  [DllImport("winspool.drv", SetLastError = true)] public static extern bool WritePrinter(IntPtr h, byte[] b, int n, out int w);
  public static int Yubor(string printer, byte[] data) {
    IntPtr h;
    if (!OpenPrinter(printer, out h, IntPtr.Zero)) throw new Exception("Printer topilmadi: " + printer);
    try {
      var di = new DOCINFO { pDocName = "Yoshlik chek", pDataType = "RAW" };
      int job = StartDocPrinter(h, 1, di);
      if (job == 0) throw new Exception("StartDocPrinter xato");
      StartPagePrinter(h);
      int w; bool ok = WritePrinter(h, data, data.Length, out w);
      EndPagePrinter(h); EndDocPrinter(h);
      if (!ok || w != data.Length) throw new Exception("WritePrinter xato");
      return job;
    } finally { ClosePrinter(h); }
  }
}
"@
$job = [YoshlikRaw]::Yubor($Printer, [System.IO.File]::ReadAllBytes($Fayl))
# Chek haqiqatan chiqqanini kutamiz: navbatdan ketmasa — printer javob bermayapti (port, kabel, qog'oz)
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Milliseconds 500
  $j = Get-PrintJob -PrinterName $Printer -ID $job -ErrorAction SilentlyContinue
  if (-not $j) { exit 0 }
}
Remove-PrintJob -PrinterName $Printer -ID $job -ErrorAction SilentlyContinue
throw "Printer 20 soniyada chop etmadi - ulanganini, qog'ozini va Windows'dagi portini tekshiring"
`,
);

function ps(args) {
  return new Promise((ok, xato) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", ...args],
      { windowsHide: true, timeout: 60_000 },
      (e, stdout, stderr) => (e ? xato(new Error((stderr || e.message).trim().split("\n")[0])) : ok(stdout)),
    );
  });
}

// ---------- Qatorlar -> ESC/POS ----------

const ESC = 0x1b;
const GS = 0x1d;

function escpos(qatorlar, kenglik) {
  const b = [ESC, 0x40]; // init
  const matn = (s) => b.push(...Buffer.from(s, "ascii"));
  for (const q of qatorlar) {
    if (q.kesish) {
      matn("\n\n\n\n");
      b.push(GS, 0x56, 0x01); // qisman kesish
      continue;
    }
    if (q.chiziq) {
      b.push(ESC, 0x61, 0);
      matn("-".repeat(kenglik) + "\n");
      continue;
    }
    b.push(ESC, 0x61, q.x === "c" ? 1 : q.x === "r" ? 2 : 0);
    b.push(ESC, 0x45, q.q ? 1 : 0);
    b.push(GS, 0x21, q.k ? 0x11 : 0x00);
    matn(String(q.m ?? "") + "\n");
  }
  b.push(ESC, 0x45, 0, GS, 0x21, 0, ESC, 0x61, 0);
  return Buffer.from(b);
}

/** Printersiz sinov uchun oddiy matn (printer nomi "FAYL"). */
function oddiyMatn(qatorlar, kenglik) {
  return qatorlar
    .map((q) => {
      if (q.kesish) return "\n" + "=".repeat(kenglik) + " (kesish)\n";
      if (q.chiziq) return "-".repeat(kenglik);
      const w = q.k ? Math.floor(kenglik / 2) : kenglik;
      const m = String(q.m ?? "");
      const pad = q.x === "c" ? Math.floor((w - m.length) / 2) : q.x === "r" ? w - m.length : 0;
      const t = " ".repeat(Math.max(0, pad)) + m;
      return q.k ? `${t}   <katta>` : t;
    })
    .join("\n");
}

async function chopEt(printer, qatorlar, kenglik, nom) {
  if (printer.toUpperCase() === "FAYL") {
    const p = join(PAPKA, "chiqqan-cheklar");
    mkdirSync(p, { recursive: true });
    writeFileSync(join(p, `${nom}.txt`), oddiyMatn(qatorlar, kenglik));
    return;
  }
  const fayl = join(tmpdir(), `yoshlik-chek-${process.pid}-${Date.now()}.bin`);
  writeFileSync(fayl, escpos(qatorlar, kenglik));
  await ps(["-File", RAW_PS1, "-Printer", printer, "-Fayl", fayl]);
}

// ---------- Sozlamalar ----------

function sozlamaniOqi() {
  if (!existsSync(SOZLAMA_FAYL)) {
    writeFileSync(
      SOZLAMA_FAYL,
      JSON.stringify(
        {
          server: "https://yoshlik-app.vercel.app",
          kalit: "",
          oshxonaPrinter: "",
          kassaPrinter: "",
          kenglik: 48,
        },
        null,
        2,
      ),
    );
    console.log(`Sozlama fayli yaratildi: ${SOZLAMA_FAYL}`);
    console.log("1) Admin panel > Sozlamalar > Chek printeri — kalit yarating va \"kalit\"ga qo'ying.");
    console.log("2) Printer nomlarini ko'rish: node chek-dasturi.mjs printerlar");
    console.log("3) oshxonaPrinter va kassaPrinter'ga nomlarni yozing (printersiz sinov uchun: FAYL).");
    process.exit(1);
  }
  const s = JSON.parse(readFileSync(SOZLAMA_FAYL, "utf8"));
  const yoq = ["server", "kalit", "oshxonaPrinter", "kassaPrinter"].filter((k) => !String(s[k] ?? "").trim());
  if (yoq.length) {
    console.log(`chek-sozlama.json'da to'ldirilmagan: ${yoq.join(", ")}`);
    process.exit(1);
  }
  s.server = s.server.replace(/\/$/, "");
  s.kenglik = Number(s.kenglik) || 48;
  return s;
}

// ---------- Buyruqlar ----------

const buyruq = process.argv[2];

if (buyruq === "printerlar") {
  const chiqish = await ps(["-Command", "Get-Printer | Select-Object -ExpandProperty Name"]);
  console.log("Kompyuterdagi printerlar:\n" + chiqish.trim().split(/\r?\n/).map((n) => `  ${n}`).join("\n"));
  process.exit(0);
}

const s = sozlamaniOqi();

if (buyruq === "sinov") {
  for (const [tur, printer] of [
    ["OSHXONA", s.oshxonaPrinter],
    ["KASSA", s.kassaPrinter],
  ]) {
    const qatorlar = [
      { m: "YOSHLIK", x: "c", k: 1, q: 1 },
      { m: `${tur} printeri`, x: "c", q: 1 },
      { chiziq: 1 },
      { m: "Sinov cheki. Agar o'qiyotgan bo'lsangiz, hammasi joyida." },
      { m: new Date().toLocaleString("ru-RU") },
      { kesish: 1 },
    ];
    try {
      await chopEt(printer, qatorlar, s.kenglik, `sinov-${tur.toLowerCase()}`);
      log(`${tur}: sinov cheki yuborildi (${printer})`);
    } catch (e) {
      log(`${tur}: XATO — ${e.message}`);
    }
  }
  process.exit(0);
}

// ---------- Asosiy sikl ----------

// Bitta nusxa: ikkinchi dastur ochilsa cheklar ikki marta chiqadi
await new Promise((ok) => {
  const qulf = createServer();
  qulf.once("error", () => {
    console.log("Chek dasturi allaqachon ishlayapti (boshqa oynada). Bu oyna yopiladi.");
    process.exit(3);
  });
  qulf.listen(47615, "127.0.0.1", ok);
});

const sarlavha = { Authorization: `Bearer ${s.kalit}` };
let oxirgiXato = "";

async function belgila(id, tur) {
  const r = await fetch(`${s.server}/api/chek/${id}`, {
    method: "POST",
    headers: { ...sarlavha, "Content-Type": "application/json" },
    body: JSON.stringify({ tur }),
  });
  if (!r.ok) throw new Error(`belgilash: HTTP ${r.status}`);
}

async function aylanish() {
  const r = await fetch(`${s.server}/api/chek/navbat?kenglik=${s.kenglik}`, { headers: sarlavha });
  if (r.status === 401) throw new Error("Kalit noto'g'ri — admin panelda yangi kalit yarating");
  if (!r.ok) throw new Error(`server: HTTP ${r.status}`);
  const navbat = await r.json();
  for (const z of navbat) {
    for (const [tur, printer] of [
      ["oshxona", s.oshxonaPrinter],
      ["kassa", s.kassaPrinter],
    ]) {
      if (!z[tur]) continue;
      try {
        await chopEt(printer, z[tur], s.kenglik, `${z.raqam}-${tur}`);
        await belgila(z.id, tur);
        log(`#${z.raqam} — ${tur} cheki chiqdi`);
      } catch (e) {
        log(`#${z.raqam} — ${tur} cheki chiqmadi: ${e.message} (qayta urinadi)`);
      }
    }
  }
}

log(`Chek dasturi ishga tushdi. Server: ${s.server}`);
log(`Oshxona: ${s.oshxonaPrinter} | Kassa: ${s.kassaPrinter}. Oynani yopmang.`);
for (;;) {
  try {
    await aylanish();
    if (oxirgiXato) log("Aloqa tiklandi.");
    oxirgiXato = "";
  } catch (e) {
    if (e.message !== oxirgiXato) log(`XATO: ${e.message}`);
    oxirgiXato = e.message;
  }
  await new Promise((r) => setTimeout(r, SORASH_MS));
}
