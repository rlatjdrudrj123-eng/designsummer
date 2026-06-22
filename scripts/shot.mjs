// 검증용 스크린샷 — 라이브러리 없이 Chrome DevTools Protocol 직접 구동.
// 디바이스 에뮬레이션으로 모바일 viewport(device-width)를 정확히 적용한다.
// 사용: node scripts/shot.mjs <url> <width> <height> <out> [mobile:0|1] [dpr]
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const [url, w, h, out, mobileArg = "1", dprArg = "2"] = process.argv.slice(2);
const width = Number(w);
const height = Number(h);
const mobile = mobileArg === "1";
const dpr = Number(dprArg);

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;

const chrome = spawn(CHROME, [
  "--headless",
  `--remote-debugging-port=${PORT}`,
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "about:blank",
]);

async function getJson(path) {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`);
  return r.json();
}

// 브라우저 ws 준비될 때까지 대기
let version;
for (let i = 0; i < 50; i++) {
  try {
    version = await getJson("/json/version");
    if (version.webSocketDebuggerUrl) break;
  } catch {}
  await sleep(100);
}
if (!version?.webSocketDebuggerUrl) {
  chrome.kill();
  throw new Error("Chrome devtools not reachable");
}

const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((res) => (ws.onopen = res));

let nextId = 1;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
function send(method, params = {}, sessionId) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params, sessionId }));
  return new Promise((res) => pending.set(id, res));
}

// 새 타겟 생성 후 flat attach
const { result: created } = await send("Target.createTarget", {
  url: "about:blank",
});
const { result: attached } = await send("Target.attachToTarget", {
  targetId: created.targetId,
  flatten: true,
});
const sid = attached.sessionId;

await send("Page.enable", {}, sid);
await send(
  "Emulation.setDeviceMetricsOverride",
  { width, height, deviceScaleFactor: dpr, mobile },
  sid,
);
await send("Page.navigate", { url }, sid);
await sleep(2200); // 폰트·rAF(열 블롭) 안정화

// 선택: #anchor 로 스크롤 (스크롤 효과 캡처용). 7번째 인자.
const scrollTo = process.argv[8];
if (scrollTo) {
  await send(
    "Runtime.evaluate",
    {
      expression: `document.querySelector('${scrollTo}')?.scrollIntoView({block:'center'});`,
    },
    sid,
  );
  await sleep(1200); // 스크롤 연동 모션 안정화
}

const { result: shot } = await send(
  "Page.captureScreenshot",
  { format: "png" },
  sid,
);
writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log(`saved ${out} (${width}x${height}, mobile=${mobile}, dpr=${dpr})`);

ws.close();
chrome.kill();
