const o = ["auto", "light", "dark"], n = document.querySelector(".js-theme");
function l() {
  let t = d();
  t += 1, o[t] || (t = 0);
  const e = o[t];
  setColorMode(e), localStorage._theme = e, i(e);
}
function d() {
  return o.indexOf(document.documentElement.getAttribute("data-color-mode") || "auto");
}
function i(t) {
  const e = n.getAttribute("data-aria-" + t);
  n.setAttribute("aria-label", e);
}
n && (n.addEventListener("click", l), i(o[d()] || "auto"));
const a = document.querySelectorAll("time.dt-published"), u = document.documentElement.lang;
function s(t) {
  const e = t.getAttribute("datetime"), c = new Date(e), r = Intl.DateTimeFormat(u, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  t.textContent = r.format(c);
}
for (let t = 0; t < a.length; t++)
  s(a[t]);
/windows/i.test(navigator.userAgent) && document.body.classList.add("win");
