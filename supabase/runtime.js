/* Optional cloud layer. With empty config, Brilla keeps working locally. */
(function () {
  const cfg = window.BRILLA_SUPABASE_CONFIG;
  const ready = window.supabase && cfg && cfg.url && cfg.publishableKey &&
    !cfg.url.includes("TU-PROYECTO") && !cfg.publishableKey.includes("REEMPLAZA");
  const cloud = ready ? window.supabase.createClient(cfg.url, cfg.publishableKey) : null;
  let cloudUser = null;
  let mode = "signup";

  const email = document.getElementById("email");
  const authButton = document.getElementById("authAction") || document.querySelector("#login .primary");
  const nameLabel = document.getElementById("nameLabel") || document.querySelector("#login label");
  const nameInput = document.getElementById("name");
  const oldNote = document.querySelector("#login .micro");
  const password = document.createElement("input");
  password.id = "password";
  password.type = "password";
  password.minLength = 8;
  password.className = "field";
  password.placeholder = "Mínimo 8 caracteres";
  password.autocomplete = "current-password";
  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "Contraseña";
  email.insertAdjacentElement("afterend", passwordLabel);
  passwordLabel.insertAdjacentElement("afterend", password);

  const switcher = document.createElement("button");
  switcher.className = "quiet auth-switch";
  switcher.style.cssText = "width:100%;margin-top:6px";
  switcher.type = "button";
  switcher.onclick = () => window.setAuthMode(mode === "signup" ? "signin" : "signup");
  authButton.insertAdjacentElement("afterend", switcher);

  const forgotButton = document.createElement("button");
  forgotButton.className = "quiet";
  forgotButton.type = "button";
  forgotButton.textContent = "Olvidé mi contraseña";
  forgotButton.style.cssText = "display:none;width:100%;margin-top:2px;color:#7041c4";
  switcher.insertAdjacentElement("afterend", forgotButton);

  const recoveryOverlay = document.createElement("div");
  recoveryOverlay.id = "recoveryOverlay";
  recoveryOverlay.className = "overlay";
  recoveryOverlay.innerHTML = '<div class="modal"><div class="auth-head"><div class="brand"><span class="mark">✦</span>brilla</div><button type="button" class="back-home" id="recoveryClose">← Cerrar</button></div><section id="recoveryRequest"><h2>Recupera tu contraseña</h2><p class="micro">Te enviaremos un enlace al correo de tu cuenta.</p><label for="recoveryEmail">Correo electrónico</label><input id="recoveryEmail" class="field" type="email" autocomplete="email" placeholder="tu@correo.com"><button id="recoverySend" class="primary" style="width:100%">Enviar enlace</button><p id="recoveryStatus" role="status" aria-live="polite" style="display:none;padding:10px 12px;border-radius:10px;background:#f3edff;color:#56318d;font-size:13px;line-height:1.5"></p></section><section id="recoveryUpdate" hidden><h2>Crea una contraseña nueva</h2><p class="micro">Elige una contraseña de al menos 8 caracteres.</p><label for="recoveryPassword">Nueva contraseña</label><input id="recoveryPassword" class="field" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres"><label for="recoveryPasswordAgain">Repite la contraseña</label><input id="recoveryPasswordAgain" class="field" type="password" minlength="8" autocomplete="new-password" placeholder="Escríbela otra vez"><button id="recoverySave" class="primary" style="width:100%">Guardar contraseña</button></section></div>';
  document.body.appendChild(recoveryOverlay);
  const recoveryEmail = recoveryOverlay.querySelector("#recoveryEmail");
  const recoveryPassword = recoveryOverlay.querySelector("#recoveryPassword");
  const recoveryPasswordAgain = recoveryOverlay.querySelector("#recoveryPasswordAgain");
  const recoveryRequest = recoveryOverlay.querySelector("#recoveryRequest");
  const recoveryUpdate = recoveryOverlay.querySelector("#recoveryUpdate");
  const recoveryStatus = recoveryOverlay.querySelector("#recoveryStatus");
  const recoverySendButton = recoveryOverlay.querySelector("#recoverySend");
  const recoveryCooldownKey = "brilla.recovery.emailCooldownUntil";
  let recoveryCooldownTimer = null;
  let recoverySession = false;
  let returnToLoginAfterRecovery = false;
  if (oldNote) oldNote.textContent = cloud
    ? "Elige una contraseña para Brilla; no uses la de tu correo."
    : "Modo local de demostración. Conecta Supabase para usar cuentas reales.";

  window.setAuthMode = function (next) {
    mode = next;
    const signup = mode === "signup";
    nameLabel.hidden = !signup;
    nameInput.hidden = !signup;
    authButton.textContent = signup ? "Registrarse" : "Iniciar sesión";
    switcher.textContent = signup ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate";
    forgotButton.style.display = !signup && cloud ? "block" : "none";
    password.autocomplete = signup ? "new-password" : "current-password";
    if (oldNote) oldNote.textContent = cloud
      ? (signup ? "Esta contraseña es para Brilla, no para Gmail. Te enviaremos un correo para confirmar." : "Usa el correo y la contraseña que elegiste para Brilla.")
      : "Modo local de demostración. Conecta Supabase para usar cuentas reales.";
  };
  const originalShowLogin = window.showLogin;
  window.showLogin = function () {
    document.body.classList.add("auth-open");
    originalShowLogin();
    window.setAuthMode("signup");
  };
  window.closeLogin = function () {
    document.getElementById("login").classList.remove("show");
    recoveryOverlay.classList.remove("show");
    document.body.classList.remove("auth-open");
    returnToLoginAfterRecovery = false;
    window.scrollTo(0, 0);
  };
  recoveryOverlay.querySelector("#recoveryClose").onclick = () => {
    recoveryOverlay.classList.remove("show");
    if (returnToLoginAfterRecovery) document.getElementById("login").classList.add("show");
    else {
      document.body.classList.remove("auth-open");
      window.scrollTo(0, 0);
    }
    returnToLoginAfterRecovery = false;
  };
  forgotButton.onclick = () => {
    recoveryEmail.value = email.value.trim();
    recoveryRequest.hidden = false;
    recoveryUpdate.hidden = true;
    recoveryStatus.textContent = "";
    recoveryStatus.style.display = "none";
    refreshRecoveryCooldown();
    returnToLoginAfterRecovery = true;
    document.body.classList.add("auth-open");
    document.getElementById("login").classList.remove("show");
    recoveryOverlay.classList.add("show");
  };
  recoverySendButton.onclick = async function () {
    const address = recoveryEmail.value.trim();
    if (!address.includes("@")) return notify("Escribe un correo válido.");
    const cooldownUntil = Number(localStorage.getItem(recoveryCooldownKey) || 0);
    if (cooldownUntil > Date.now()) return showRecoveryRateLimit(cooldownUntil);
    this.disabled = true;
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await cloud.auth.resetPasswordForEmail(address, { redirectTo });
      if (error) {
        if (isEmailRateLimit(error)) {
          const until = Date.now() + 60 * 60 * 1000;
          localStorage.setItem(recoveryCooldownKey, String(until));
          showRecoveryRateLimit(until);
        } else showAuthError(error, false);
      } else {
        recoveryStatus.textContent = "Si la cuenta existe, recibirás un enlace. Revisa también Spam y Promociones.";
        recoveryStatus.style.display = "block";
      }
    } catch (error) {
      if (isEmailRateLimit(error)) {
        const until = Date.now() + 60 * 60 * 1000;
        localStorage.setItem(recoveryCooldownKey, String(until));
        showRecoveryRateLimit(until);
      } else showAuthError(error, false);
    }
    finally {
      if (Number(localStorage.getItem(recoveryCooldownKey) || 0) <= Date.now()) this.disabled = false;
    }
  };
  function isEmailRateLimit(error) {
    return (error?.code || "").toLowerCase() === "over_email_send_rate_limit" ||
      (error?.message || "").toLowerCase().includes("email rate limit exceeded");
  }
  function showRecoveryRateLimit(until) {
    const remaining = Math.max(0, until - Date.now());
    if (!remaining) {
      localStorage.removeItem(recoveryCooldownKey);
      recoverySendButton.disabled = false;
      recoverySendButton.textContent = "Enviar enlace";
      recoveryStatus.textContent = "";
      recoveryStatus.style.display = "none";
      if (recoveryCooldownTimer) clearInterval(recoveryCooldownTimer);
      return;
    }
    const minutes = Math.ceil(remaining / 60000);
    recoveryStatus.textContent = "El correo de prueba de Supabase llegó a su límite. Para no insistir, Brilla pausó los reintentos desde este navegador. Prueba de nuevo en unos " + minutes + " min. El equipo de Brilla debe configurar un SMTP propio para habilitar correos para todos.";
    recoveryStatus.style.display = "block";
    recoverySendButton.disabled = true;
    recoverySendButton.textContent = "Disponible en " + minutes + " min";
    if (recoveryCooldownTimer) clearInterval(recoveryCooldownTimer);
    recoveryCooldownTimer = setInterval(() => showRecoveryRateLimit(until), 30000);
  }
  function refreshRecoveryCooldown() {
    const until = Number(localStorage.getItem(recoveryCooldownKey) || 0);
    if (until > Date.now()) showRecoveryRateLimit(until);
    else {
      localStorage.removeItem(recoveryCooldownKey);
      recoverySendButton.disabled = false;
      recoverySendButton.textContent = "Enviar enlace";
    }
  }
  recoveryOverlay.querySelector("#recoverySave").onclick = async function () {
    const next = recoveryPassword.value;
    if (next.length < 8) return notify("La contraseña debe tener al menos 8 caracteres.");
    if (next !== recoveryPasswordAgain.value) return notify("Las contraseñas no coinciden.");
    this.disabled = true;
    try {
      const { error } = await cloud.auth.updateUser({ password: next });
      if (error) return showAuthError(error, false);
      recoverySession = false;
      returnToLoginAfterRecovery = false;
      recoveryOverlay.classList.remove("show");
      await cloud.auth.signOut();
      password.value = "";
      email.value = recoveryEmail.value.trim();
      window.showLogin();
      window.setAuthMode("signin");
      notify("Contraseña actualizada. Ya puedes iniciar sesión.");
      if (window.history.replaceState) window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    } catch (error) { showAuthError(error, false); }
    finally { this.disabled = false; }
  };
  function showAuthError(error, signup) {
    const code = (error.code || "").toLowerCase();
    const message = (error.message || "").toLowerCase();
    if (code === "over_email_send_rate_limit" || message.includes("email rate limit exceeded"))
      return notify("Supabase agotó el límite de correos de prueba. Espera una hora y, si ya confirmaste tu correo, cambia a Iniciar sesión.");
    if (code === "email_address_not_authorized" || message.includes("email address not authorized"))
      return notify("El correo no está autorizado por el SMTP de prueba de Supabase. Configura un SMTP propio o usa una dirección permitida del equipo.");
    if (message.includes("user already registered") || code === "user_already_exists")
      return notify("Esa cuenta ya existe. Cambia a Iniciar sesión y usa la contraseña de Brilla.");
    if (message.includes("invalid login credentials"))
      return notify("No coincide el correo o la contraseña de Brilla. Comprueba que confirmaste el correo y vuelve a intentarlo.");
    return notify(error.message || (signup ? "No se pudo crear la cuenta." : "No se pudo iniciar sesión."));
  }
  window.enter = async function () {
    const n = nameInput.value.trim(), e = email.value.trim(), pw = password.value;
    if (!e.includes("@") || pw.length < 8) return notify("Escribe un correo válido y una contraseña de 8 caracteres.");
    if (cloud) {
      const signup = mode === "signup";
      if (signup && !n) return notify("Escribe tu nombre.");
      if (authButton.disabled) return;
      authButton.disabled = true;
      try {
        const result = signup
          ? await cloud.auth.signUp({ email: e, password: pw, options: { data: { full_name: n } } })
          : await cloud.auth.signInWithPassword({ email: e, password: pw });
        if (result.error) return showAuthError(result.error, signup);
        if (signup && !result.data.session) return notify("Revisa el correo para confirmar la cuenta. Luego vuelve aquí y elige Iniciar sesión; no te registres otra vez.");
        cloudUser = result.data.user;
        await window.start(cloudUser);
      } catch (error) {
        showAuthError(error, signup);
      } finally {
        authButton.disabled = false;
      }
      return;
    }
    if (mode === "signin") {
      const saved = read(UK, null);
      if (!saved || saved.email.toLowerCase() !== e.toLowerCase()) return notify("Este navegador no tiene un perfil con ese correo.");
      localStorage.setItem(UK, JSON.stringify(saved));
    } else {
      if (!n) return notify("Escribe tu nombre.");
      localStorage.setItem(UK, JSON.stringify({ name: n, email: e }));
    }
    await window.start();
  };

  window.start = async function (knownUser) {
    if (cloud) {
      let u = knownUser;
      if (!u) { const result = await cloud.auth.getUser(); u = result.data.user; }
      if (!u) return;
      cloudUser = u;
      user = { name: u.user_metadata.full_name || u.email.split("@")[0], email: u.email };
      const localProjects = read(PK, []);
      const { data, error } = await cloud.from("designs").select("*").order("updated_at", { ascending: false });
      if (error) { projects = localProjects; notify("No se pudieron cargar los diseños. Revisa schema.sql y las políticas RLS."); }
      else if (!data.length && localProjects.length) { projects = localProjects; await window.save(); }
      else projects = await Promise.all(data.map(async row => {
        const doc = row.document || {};
        const items = await Promise.all((doc.items || []).map(async item => {
          if (item.type !== "image" || !item.storage_path) return item;
          const { data: signed, error: signedError } = await cloud.storage.from("design-assets").createSignedUrl(item.storage_path, 86400);
          if (signedError) { notify("No se pudo abrir una imagen guardada."); return item; }
          return { ...item, src: signed.signedUrl };
        }));
        return { ...doc, items, id: row.id, name: row.name, favorite: row.favorite, updated: Date.parse(row.updated_at) };
      }));
      cacheProjects();
      localStorage.setItem(UK, JSON.stringify(user));
    } else {
      user = read(UK, null);
      projects = read(PK, []);
    }
    if (!user) return;
    document.getElementById("landing").style.display = "none";
    document.getElementById("login").classList.remove("show");
    if (!recoverySession) document.body.classList.remove("auth-open");
    document.getElementById("app").style.display = "block";
    document.getElementById("userbtn").textContent = "◉ " + user.name.split(" ")[0];
    navigate("home");
  };

  function cacheProjects() {
    const cached = projects.map(project => ({
      ...project,
      items: project.items.map(item => {
        if (item.type !== "image" || !item.storage_path) return item;
        const copy = { ...item };
        delete copy.src;
        return copy;
      })
    }));
    localStorage.setItem(PK, JSON.stringify(cached));
  }

  window.save = async function () {
    const status = document.getElementById("saveStatus");
    if (!cloud || !cloudUser) {
      try { localStorage.setItem(PK, JSON.stringify(projects)); } catch { notify("Almacenamiento local lleno."); }
      if (status) status.textContent = "Guardado local";
      return;
    }
    if (status) status.textContent = "Sincronizando…";
    let rows;
    try {
      rows = [];
      for (const p of projects) {
        const items = [];
        for (const item of p.items) {
          const cloudItem = { ...item };
          if (item.type === "image") {
            if (!item.storage_path && item.src && item.src.startsWith("data:")) {
              const blob = await (await fetch(item.src)).blob();
              const path = cloudUser.id + "/" + p.id + "/" + item.id + ".jpg";
              const { error: uploadError } = await cloud.storage.from("design-assets").upload(path, blob, {
                upsert: true,
                contentType: blob.type || "image/jpeg",
                cacheControl: "3600"
              });
              if (uploadError) throw uploadError;
              item.storage_path = path;
              cloudItem.storage_path = path;
            }
            delete cloudItem.src;
          }
          items.push(cloudItem);
        }
        rows.push({
          id: p.id, owner_id: cloudUser.id, name: p.name,
          document: { bg: p.bg, fg: p.fg, items, preview: p.preview || "" },
          favorite: !!p.favorite, updated_at: new Date(p.updated || Date.now()).toISOString()
        });
      }
    } catch (error) {
      if (status) status.textContent = "Error al subir imagen";
      notify("No se pudo guardar una imagen. Ejecuta la versión nueva de schema.sql.");
      return;
    }
    try { cacheProjects(); } catch { notify("El navegador no pudo guardar la copia local."); }
    if (!rows.length) { if (status) status.textContent = "Guardado"; return; }
    const { error } = await cloud.from("designs").upsert(rows, { onConflict: "id" });
      if (status) status.textContent = error ? "Error de sincronización" : "Sincronizado";
      if (error) notify("No se sincronizó. Comprueba la configuración y RLS.");
  };

  window.deleteProject = function (projectId) {
    if (!confirm("¿Eliminar este diseño?")) return;
    const removed = projects.find(p => p.id === projectId);
    projects = projects.filter(p => p.id !== projectId);
    localStorage.setItem(PK, JSON.stringify(projects));
    if (cloud && cloudUser) {
      cloud.from("designs").delete().eq("id", projectId).eq("owner_id", cloudUser.id)
        .then(({ error }) => { if (error) notify("No se pudo borrar en la nube."); });
      const stillUsed = new Set(projects.flatMap(p => p.items.filter(i => i.storage_path).map(i => i.storage_path)));
      const unused = (removed?.items || []).filter(i => i.storage_path && !stillUsed.has(i.storage_path)).map(i => i.storage_path);
      if (unused.length) cloud.storage.from("design-assets").remove(unused).then(({ error }) => { if (error) notify("El diseño se borró, pero no se pudo quitar una imagen de la nube."); });
    }
    navigate("projects");
  };

  window.logout = async function () {
    if (cloud) await cloud.auth.signOut();
    cloudUser = null;
    localStorage.removeItem(UK);
    document.getElementById("app").style.display = "none";
    document.getElementById("landing").style.display = "block";
    document.body.classList.remove("auth-open");
  };

  window.saveProfile = async function () {
    const n = document.getElementById("profileName").value.trim();
    if (!n) return notify("Escribe tu nombre.");
    if (cloud) {
      const { error } = await cloud.auth.updateUser({ data: { full_name: n } });
      if (error) return notify("No se pudo actualizar el perfil.");
    }
    user.name = n;
    localStorage.setItem(UK, JSON.stringify(user));
    document.getElementById("userbtn").textContent = "◉ " + n.split(" ")[0];
    navigate("profile");
    notify("Perfil actualizado.");
  };

  if (cloud) {
    cloud.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        recoverySession = true;
        document.body.classList.add("auth-open");
        recoveryRequest.hidden = true;
        recoveryUpdate.hidden = false;
        document.getElementById("login").classList.remove("show");
        recoveryOverlay.classList.add("show");
      }
    });
    cloud.auth.getSession().then(({ data }) => { if (data.session && !recoverySession) window.start(data.session.user); });
  }
  else if (read(UK, null)) window.start();
  window.setAuthMode("signup");
})();
