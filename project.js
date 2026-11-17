(() => {
  const cfg = window.KIK_SITE || {};
  const root = document.documentElement;
  const projectCard = document.querySelector("[data-project]");
  const status = document.querySelector("[data-status]");
  const openButton = document.querySelector("[data-open-app]");
  const legacyButton = document.querySelector("[data-open-legacy]");
  const downloadLinks = document.querySelectorAll("[data-download]");
  const idMatch = location.pathname.match(/\/project\/([^/]+)\/?$/);
  const projectId = idMatch ? decodeURIComponent(idMatch[1]) : (new URLSearchParams(location.search).get("project") || "");
  const isProject = !!projectId;
  const safeId = /^[a-zA-Z0-9-]{8,}$/.test(projectId);
  const legacyUrl = safeId ? `kikstore://project/${encodeURIComponent(projectId)}` : "kikstore://";
  const webUrl = safeId ? `https://${cfg.shareDomain || location.host}/project/${encodeURIComponent(projectId)}` : `https://${cfg.shareDomain || location.host}/`;
  const fallback = safeId ? `${location.origin}/project/?project=${encodeURIComponent(projectId)}&fromIntent=1` : `${location.origin}/`;
  const intentUrl = safeId ? `intent://${cfg.shareDomain || location.host}/project/${encodeURIComponent(projectId)}#Intent;scheme=https;package=com.kikstore.app;S.browser_fallback_url=${encodeURIComponent(fallback)};end` : "";

  document.querySelectorAll("[data-project-only]").forEach(el => { el.hidden = !isProject; });
  document.querySelectorAll("[data-home-only]").forEach(el => { el.hidden = isProject; });
  document.querySelectorAll("[data-share-url]").forEach(el => { el.textContent = webUrl; });
  downloadLinks.forEach(a => {
    const available = /^https:\/\//i.test(cfg.downloadUrl || "") && !/YOUR[-_]/i.test(cfg.downloadUrl);
    if (available) a.href = cfg.downloadUrl;
    else { a.href = "#download"; a.addEventListener("click", e => { e.preventDefault(); status.textContent = "Добавьте URL APK в site/config.js, чтобы включить скачивание."; }); }
  });

  if (!isProject) return;
  if (!safeId) { status.textContent = "Ссылка на проект выглядит неверно."; status.classList.add("error"); return; }
  document.title = "Проект в Kik Store";
  if (openButton) openButton.href = intentUrl;
  if (legacyButton) legacyButton.href = legacyUrl;

  const autoOpen = () => {
    if (!/Android/i.test(navigator.userAgent) || new URLSearchParams(location.search).has("fromIntent")) return;
    location.href = intentUrl;
    window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        const fallbackFrame = document.createElement("iframe");
        fallbackFrame.hidden = true;
        fallbackFrame.src = legacyUrl;
        document.body.append(fallbackFrame);
        window.setTimeout(() => fallbackFrame.remove(), 1200);
      }
    }, 1300);
  };

  const loadProject = async () => {
    if (!cfg.supabaseUrl || !cfg.publishableKey || /YOUR_/i.test(cfg.publishableKey)) {
      status.textContent = "Откройте проект в приложении или скачайте Kik Store.";
      return;
    }
    try {
      const query = new URLSearchParams({select:"name,slogan,description,icon_url",id:`eq.${projectId}`,limit:"1"});
      const response = await fetch(`${cfg.supabaseUrl.replace(/\/$/,"")}/rest/v1/projects?${query}`, {headers:{apikey:cfg.publishableKey,Authorization:`Bearer ${cfg.publishableKey}`,Accept:"application/json"}});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = await response.json();
      const project = rows[0];
      if (!project) { status.textContent = "Проект не найден или пока недоступен."; return; }
      projectCard.hidden = false;
      projectCard.querySelector("h2").textContent = project.name || "Проект Kik Store";
      projectCard.querySelector("p").textContent = project.slogan || project.description || "Откройте страницу проекта в Kik Store.";
      if (project.icon_url && /^https:\/\//i.test(project.icon_url)) {
        const image = new Image(); image.alt = ""; image.src = project.icon_url;
        image.onload = () => { const box=projectCard.querySelector(".project-icon"); box.replaceChildren(image); };
      }
      status.textContent = "Страница проекта в Kik Store";
    } catch (error) {
      console.warn("Не удалось загрузить сведения о проекте", error);
      status.textContent = "Не удалось загрузить описание проекта. Его можно открыть в приложении.";
    }
  };

  openButton?.addEventListener("click", event => {
    if (!/Android/i.test(navigator.userAgent)) { event.preventDefault(); status.textContent = "Открытие в приложении доступно на Android."; }
  });
  loadProject();
  autoOpen();
})();
