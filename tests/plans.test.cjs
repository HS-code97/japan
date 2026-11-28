const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function api() {
  const file = path.join(root, "plan-options.js");
  assert.ok(fs.existsSync(file), "plan selection feature is not implemented");
  const ctx = vm.createContext({window: {}, URL});
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx);
  return ctx.window.JAPAN_PLANS;
}
test("routes three plans independently and defaults to plan 1", () => {
  const plans = api();
  for (const [query, expected] of [["", "1"], ["?plan=2", "2"], ["?plan=3", "3"], ["?plan=99", "1"], ["?plan=02", "1"]])
    assert.equal(plans.resolve("https://example.com/japan/" + query).id, expected);
  assert.equal(plans.resolve("https://example.com/japan/?plan=1").file, "data.js");
  assert.equal(plans.resolve("https://example.com/japan/?plan=2").file, "data-plan-2.js");
  assert.equal(plans.resolve("https://example.com/japan/?plan=3").file, "data-plan-3.js");
});

test("three data files parse cleanly and can be edited independently", () => {
  const files = ["data.js", "data-plan-2.js", "data-plan-3.js"];
  const snapshots = files.map(f => {
    assert.ok(fs.existsSync(path.join(root, f)), "missing independent snapshot: " + f);
    const source = fs.readFileSync(path.join(root, f), "utf8");
    const context = vm.createContext({});
    return {source, data: vm.runInContext(source + ";({TRIP,PLACES,DAYS,DONKI,PACKING,PHRASES})", context)};
  });
  snapshots.forEach(s => {
    assert.ok(Array.isArray(s.data.DAYS) && s.data.DAYS.length === 5);
    assert.ok(s.data.PLACES && typeof s.data.PLACES === "object");
    assert.ok(!s.source.includes("ramenRepublic"), "closed ramenRepublic must not exist");
    assert.ok(!s.source.includes("도라에몽"), "closed Doraemon park must not exist");
  });
  const title = snapshots[0].data.DAYS[0].title;
  snapshots[1].data.DAYS[0].title = "changed only in plan 2";
  snapshots[1].data.PLACES.airbnb.name = "another accommodation";
  assert.equal(snapshots[0].data.DAYS[0].title, title);
  assert.equal(snapshots[2].data.DAYS[0].title, title);
  assert.notEqual(snapshots[0].data.PLACES.airbnb.name, snapshots[1].data.PLACES.airbnb.name);
});

test("plan links preserve the day and section while sharing always exposes all plans", () => {
  const plans = api();
  const link = new URL(plans.link("https://example.com/japan/?other=x#old", "2", 3, "food"));
  assert.equal(link.searchParams.get("plan"), "2");
  assert.equal(link.searchParams.get("day"), "3");
  assert.equal(link.searchParams.get("view"), "food");
  assert.equal(link.searchParams.get("other"), "x");
  assert.equal(link.hash, "");
  assert.equal(plans.share("https://example.com/japan/?plan=2&day=3&view=food"), "https://example.com/japan/");
});
