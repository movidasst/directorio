(() => {
  'use strict';

  const BRAND = ['#007b85', '#00205b', '#70ad47', '#ffb600'];
  const normalize = value => String(value || '').trim().toLowerCase();
  const digits = value => normalize(value).replace(/\D/g, '');

  function textElement(root, exact) {
    return [...root.querySelectorAll('div,span,h2,p')].find(el =>
      el.children.length === 0 && normalize(el.textContent) === normalize(exact)
    );
  }

  function findMember(documentValue) {
    if (!Array.isArray(globalData)) return null;
    const wanted = digits(documentValue);
    return globalData.find(item =>
      wanted && wanted === digits(item.documento || item.cedula)
    ) || null;
  }

  function formatXP(value) {
    const number = Number(value);
    return Math.round(Number.isFinite(number) ? number : 0).toLocaleString('es-VE');
  }

  function applyBrandStrips(card) {
    const oldColors = ['#f7c600', '#003893', '#cf142b'];
    const segments = [...card.querySelectorAll('div')].filter(el => {
      const color = normalize(el.style.background);
      return oldColors.includes(color);
    });
    segments.forEach((el, index) => {
      el.style.background = BRAND[index % BRAND.length];
    });

    const photoStrip = [...card.querySelectorAll('div')].find(el =>
      normalize(el.style.background).includes('#f7c600 0 33.33%')
    );
    if (photoStrip) {
      photoStrip.style.background =
        'linear-gradient(90deg,#007b85 0 25%,#00205b 25% 50%,#70ad47 50% 75%,#ffb600 75% 100%)';
    }
  }

  function ensureRanking(card, member) {
    const active = textElement(card, 'INTEGRANTE ACTIVO');
    if (!active) return;
    const badge = active.parentElement;
    badge.style.top = '299px';
    badge.style.height = '42px';
    badge.style.borderRadius = '13px';
    badge.style.flexDirection = 'column';
    badge.style.gap = '3px';

    active.style.display = 'flex';
    active.style.alignItems = 'center';
    active.style.gap = '5px';
    active.style.fontSize = '8px';
    active.style.letterSpacing = '.65px';

    let rank = card.querySelector('#cred-rank');
    if (!rank) {
      rank = document.createElement('span');
      rank.id = 'cred-rank';
      rank.style.cssText =
        'display:block;width:116px;white-space:nowrap;overflow:hidden;text-align:center;font-size:7px;font-weight:900;color:#00205b;letter-spacing:.15px;line-height:1.1;';
      badge.appendChild(rank);
    }

    const level = String(member?.nivel || 'Participante').trim() || 'Participante';
    const icon = String(member?.nivel_icono || '🥉').trim() || '🥉';
    const position = Number(member?.posicion_actividad);
    const positionText = Number.isFinite(position) && position > 0 ? ` · #${Math.trunc(position)}` : '';
    rank.textContent = `${icon} ${level.toUpperCase()} · ${formatXP(member?.puntos)} XP${positionText}`;
    rank.style.fontSize = rank.textContent.length > 34 ? '5.8px' :
      rank.textContent.length > 27 ? '6.4px' : '7px';
  }

  function applyCredential() {
    const card = document.getElementById('credential');
    if (!card) return;
    card.classList.add('credential-international');

    const title = textElement(card, 'La Movida de SST');
    if (title) {
      title.textContent = 'La Movida de SST Plus';
      title.style.top = '29px';
      title.style.fontSize = '24px';
    }

    const stars = [...card.querySelectorAll('div')].find(el =>
      normalize(el.textContent).replace(/\s/g, '') === '★★★★★★★★'
    );
    if (stars) {
      stars.textContent = 'DE LA REACCIÓN A LA PREVENCIÓN';
      stars.style.fontWeight = '800';
      stars.style.letterSpacing = '1.25px';
    }

    const logo = [...card.querySelectorAll('img')].find(img =>
      normalize(img.alt).includes('logo oficial')
    );
    if (logo?.parentElement) {
      Object.assign(logo.parentElement.style, {
        top: '13px', right: '20px', width: '92px', height: '92px',
        border: '2px solid rgba(0,123,133,.72)',
        boxShadow: '0 6px 15px rgba(0,19,48,.25)'
      });
    }

    const labels = new Map([
      ['IDENTIFICACIÓN PROFESIONAL', 'PERFIL DEL INTEGRANTE'],
      ['DNI / CÉDULA', 'DOCUMENTO DE IDENTIDAD'],
      ['FORMACIÓN', 'NIVEL ACADÉMICO'],
      ['VERIFICACIÓN OFICIAL', 'VERIFICAR MEMBRESÍA'],
      ['QR OFICIAL', 'QR DE MEMBRESÍA']
    ]);
    labels.forEach((replacement, original) => {
      const el = textElement(card, original);
      if (el) el.textContent = replacement;
    });

    const verify = [...card.querySelectorAll('div')].find(el =>
      normalize(el.textContent).replace(/\s+/g, ' ') === 'escanea para validar autenticidad'
    );
    if (verify) verify.innerHTML = 'ESCANEA PARA<br>VERIFICAR CREDENCIAL';

    const identity = textElement(card, 'DOCUMENTO DE IDENTIDAD');
    if (identity) identity.style.letterSpacing = '.75px';
    const academic = textElement(card, 'NIVEL ACADÉMICO');
    if (academic) academic.style.letterSpacing = '1px';
    const verifyMembership = textElement(card, 'VERIFICAR MEMBRESÍA');
    if (verifyMembership) verifyMembership.style.letterSpacing = '.65px';

    applyBrandStrips(card);

    const documentValue = document.getElementById('cred-dni')?.textContent;
    const member = findMember(documentValue);
    ensureRanking(card, member);

    const location = document.getElementById('cred-estado');
    if (location && member) {
      const iso = String(member.pais_iso2 || 'VE').toUpperCase();
      const country = String(member.pais_nombre ||
        (typeof nombrePais === 'function' ? nombrePais(iso) : iso)).trim();
      const locality = String(member.municipio || member.estado || '').trim();
      location.textContent = [country.toUpperCase(), locality].filter(Boolean).join(' · ');
      location.style.fontSize = location.textContent.length > 35 ? '10px' :
        location.textContent.length > 28 ? '11px' :
        location.textContent.length > 21 ? '12px' : '14px';
    }
  }

  function updateSurroundingCopy() {
    const heading = [...document.querySelectorAll('h2')].find(el =>
      normalize(el.textContent) === 'mi credencial oficial'
    );
    if (heading) heading.textContent = 'Mi Credencial de Integrante';

    const portal = document.getElementById('view-portal-result');
    if (portal && !portal.querySelector('.credential-scope-note')) {
      const cardScroller = document.getElementById('credential')?.parentElement;
      if (cardScroller) {
        const note = document.createElement('div');
        note.className = 'credential-scope-note';
        note.innerHTML =
          '<i class="fa-solid fa-circle-info"></i><span>Esta credencial identifica a una persona registrada como integrante de La Movida de SST Plus. No constituye licencia profesional, certificación de competencias ni autorización para ejercer.</span>';
        cardScroller.insertAdjacentElement('afterend', note);
      }
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .credential-scope-note{margin:.5rem auto 0;width:100%;max-width:42rem;display:flex;gap:.5rem;align-items:flex-start;border:1px solid #d8e3e8;border-radius:.75rem;background:#f8fafc;padding:.75rem 1rem;color:#52697a;font-size:11px;font-weight:500;line-height:1.45;box-sizing:border-box}
    .credential-scope-note i{color:#007b85;margin-top:2px}
  `;
  document.head.appendChild(style);

  function refresh() {
    applyCredential();
    updateSurroundingCopy();
  }

  const start = () => {
    refresh();
    const card = document.getElementById('credential');
    if (card) {
      new MutationObserver(() => requestAnimationFrame(refresh))
        .observe(card, { subtree: true, childList: true, characterData: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();