let activeInfoTip = null;
document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  link.rel = "noopener noreferrer";
});
function closeInfoTip() {
  const portal = document.querySelector("#infoPortal"),
    arrow = document.querySelector("#infoPortalArrow");
  if (activeInfoTip) {
    activeInfoTip.classList.remove("open");
    activeInfoTip.setAttribute("aria-expanded", "false");
  }
  activeInfoTip = null;
  portal.classList.remove("open");
  arrow.classList.remove("open");
}
function positionInfoTip(button) {
  const portal = document.querySelector("#infoPortal"),
    arrow = document.querySelector("#infoPortalArrow"),
    bubble = button.querySelector(".infoBubble");
  if (!bubble) return;
  portal.textContent = bubble.textContent.trim();
  portal.classList.add("open");
  arrow.classList.add("open");
  portal.style.left = "0px";
  portal.style.top = "0px";
  const br = button.getBoundingClientRect(),
    pr = portal.getBoundingClientRect(),
    gap = 12,
    pad = 12;
  let left = br.left + br.width / 2 - pr.width / 2;
  left = Math.max(pad, Math.min(left, window.innerWidth - pr.width - pad));
  let top = br.top - pr.height - gap;
  let below = false;
  if (top < pad) {
    top = br.bottom + gap;
    below = true;
  }
  if (top + pr.height > window.innerHeight - pad)
    top = Math.max(pad, window.innerHeight - pr.height - pad);
  portal.style.left = `${Math.round(left)}px`;
  portal.style.top = `${Math.round(top)}px`;
  const center = Math.max(
    left + 12,
    Math.min(br.left + br.width / 2, left + pr.width - 12),
  );
  arrow.style.left = `${Math.round(center - 5)}px`;
  arrow.style.top = `${Math.round(below ? top - 5 : top + pr.height - 5)}px`;
  arrow.style.transform = below ? "rotate(225deg)" : "rotate(45deg)";
}
function openInfoTip(button) {
  if (activeInfoTip && activeInfoTip !== button) closeInfoTip();
  activeInfoTip = button;
  button.classList.add("open");
  button.setAttribute("aria-expanded", "true");
  positionInfoTip(button);
}
document.addEventListener("click", (e) => {
  const button = e.target.closest(".infoTip");
  if (button) {
    e.preventDefault();
    e.stopPropagation();
    if (activeInfoTip === button) closeInfoTip();
    else openInfoTip(button);
    return;
  }
  closeInfoTip();
});
document.addEventListener("mouseover", (e) => {
  const button = e.target.closest(".infoTip");
  if (button && window.matchMedia("(hover:hover)").matches) openInfoTip(button);
});
document.addEventListener("mouseout", (e) => {
  const button = e.target.closest(".infoTip");
  if (
    button &&
    window.matchMedia("(hover:hover)").matches &&
    !button.contains(e.relatedTarget)
  )
    closeInfoTip();
});
document.addEventListener("focusin", (e) => {
  const button = e.target.closest(".infoTip");
  if (button) openInfoTip(button);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeInfoTip();
});
window.addEventListener("resize", () => {
  if (activeInfoTip) positionInfoTip(activeInfoTip);
});
document.querySelector(".wizard")?.addEventListener(
  "scroll",
  () => {
    if (activeInfoTip) positionInfoTip(activeInfoTip);
  },
  { passive: true },
);

const licenseModal = document.querySelector("#licenseModal");
const openLicenseButton = document.querySelector("#openLicense");
const licenseCloseButton = document.querySelector("#licenseClose");
const licenseDoneButton = document.querySelector("#licenseDone");
let licensePreviousFocus = null;
function openLicenseModal() {
  licensePreviousFocus = document.activeElement;
  licenseModal.classList.add("open");
  licenseModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  licenseCloseButton.focus();
}
function closeLicenseModal() {
  licenseModal.classList.remove("open");
  licenseModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  licensePreviousFocus?.focus();
}
openLicenseButton?.addEventListener("click", openLicenseModal);
licenseCloseButton?.addEventListener("click", closeLicenseModal);
licenseDoneButton?.addEventListener("click", closeLicenseModal);
licenseModal?.addEventListener("click", (event) => {
  if (event.target === licenseModal) closeLicenseModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && licenseModal?.classList.contains("open"))
    closeLicenseModal();
});

const githubIssuesLink = document.querySelector("#githubIssuesLink");
if (githubIssuesLink && GITHUB_ISSUES_URL.trim()) {
  githubIssuesLink.href = GITHUB_ISSUES_URL.trim();
  githubIssuesLink.target = "_blank";
  githubIssuesLink.rel = "noopener noreferrer";
  githubIssuesLink.setAttribute("aria-disabled", "false");
  githubIssuesLink.title = "GitHub Issues öffnen";
} else if (githubIssuesLink) {
  githubIssuesLink.title = "GitHub-Issues-Link wird noch ergänzt";
}
