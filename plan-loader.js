/* 각 안의 전체 데이터를 먼저 읽고 공통 화면을 시작합니다. */
(async () => {
  const selected = window.JAPAN_PLANS.resolve(location.href);
  window.CURRENT_PLAN = selected.id;
  document.querySelectorAll("[data-plan]").forEach(button => {
    const active = button.dataset.plan === selected.id;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
  });
  const status = document.querySelector("#planCurrent");
  status.textContent = `현재 보는 안: 일정 ${selected.id}`;
  const sizeHeader = () => {
    const height = document.querySelector("#planSelector").getBoundingClientRect().height;
    document.documentElement.style.setProperty("--plan-selector-height", `${height}px`);
  };
  sizeHeader();
  if (window.ResizeObserver) new ResizeObserver(sizeHeader).observe(document.querySelector("#planSelector"));
  else addEventListener("resize", sizeHeader);
  const load = file => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = file + "?v=plans-1";
    script.onload = resolve;
    script.onerror = () => reject(new Error(file));
    document.head.appendChild(script);
  });
  try {
    await load(selected.file);
    await load("app.js");
  } catch {
    status.textContent = `일정 ${selected.id}을 불러오지 못했어요. 새로고침해 주세요.`;
  }
})();
