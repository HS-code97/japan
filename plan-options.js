/* 일정안 선택 규칙: 내용은 각 데이터 파일에서 독립 관리합니다. */
(() => {
  const files = Object.freeze({ "1": "data.js", "2": "data-plan-2.js", "3": "data-plan-3.js" });
  window.JAPAN_PLANS = Object.freeze({
    resolve(href) {
      const requested = new URL(href).searchParams.get("plan");
      const id = Object.hasOwn(files, requested) ? requested : "1";
      return { id, file: files[id] };
    },
    link(href, id, day, view) {
      const url = new URL(href);
      url.searchParams.set("plan", Object.hasOwn(files, id) ? id : "1");
      url.searchParams.set("day", String(day));
      url.searchParams.set("view", view);
      url.hash = "";
      return url.href;
    },
    share(href) {
      const url = new URL(href);
      url.search = ""; url.hash = "";
      return url.href;
    }
  });
})();
