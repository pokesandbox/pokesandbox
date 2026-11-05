/* PokeSandbox design system: icon helper for previews. Not a component library; production code uses shadcn/ui components and lucide-react. */
window.PS = (function () {
  var dot = function (x, y) {
    return (
      '<circle cx="' +
      x +
      '" cy="' +
      y +
      '" r="1.4" fill="currentColor" stroke="none"/>'
    );
  };
  var P = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    chevR: '<path d="M9 18l6-6-6-6"/>',
    chevD: '<path d="M6 9l6 6 6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    grip:
      dot(9, 6) +
      dot(15, 6) +
      dot(9, 12) +
      dot(15, 12) +
      dot(9, 18) +
      dot(15, 18),
    more: dot(5, 12) + dot(12, 12) + dot(19, 12),
    alert: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M9 10.5v.01M15 10.5v.01"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    settings:
      '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    leaf: '<path d="M5 20c0-9 5-14 15-16-1 10-6 15-15 16z"/><path d="M5 20l7-7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    book: '<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10"/>',
    steps: '<path d="M4 20h5v-5h5v-5h5V5"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
    bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
    town: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10M10 20v-6h4v6"/>',
    route:
      '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
    dungeon:
      '<path d="M3 20h18M5 20v-8a7 7 0 0 1 14 0v8M9 20v-5a3 3 0 0 1 6 0v5"/>',
    building:
      '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-4h6v4M8 7h2M14 7h2M8 11h2M14 11h2"/>',
    gym: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    landmark: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    water:
      '<path d="M3 9c2 0 2-2 4.5-2S10 9 12 9s2-2 4.5-2S19 9 21 9M3 15c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2"/>',
    heart:
      '<path d="M12 20s-8-5-8-11a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 6-8 11-8 11z"/>',
    monitor:
      '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  };
  function icon(name, size) {
    var s = size || 20;
    return (
      '<svg class="ps-icon" width="' +
      s +
      '" height="' +
      s +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (P[name] || '') +
      '</svg>'
    );
  }
  function mount(root) {
    (root || document).querySelectorAll('[data-i]').forEach(function (el) {
      el.innerHTML = icon(
        el.getAttribute('data-i'),
        +el.getAttribute('data-s') || 20,
      );
    });
  }
  return { icon: icon, mount: mount, icons: P };
})();

/* Builder chrome shared by the builder screen mockups. */
(function (PS) {
  var NAV = [
    ['Overview', 'home', 'home'],
    ['Settings', 'settings', 'settings'],
    ['Locations', 'pin', 'locations', '64'],
    ['Encounters', 'leaf', 'encounters', '41'],
    ['Trainers', 'user', 'trainers', '28'],
    ['Pokédex', 'book', 'pokedex', '151'],
    ['Progressions', 'steps', 'progressions', '8'],
  ];
  var SOON = [
    ['Scripts', 'code'],
    ['Shops', 'bag'],
    ['Transport', 'swap'],
  ];
  PS.NAV = NAV;
  PS.SOON = SOON;
  PS.sidebar = function (active) {
    return (
      '<nav class="ps-sidebar" aria-label="Builder"><div class="ps-sidebar-head"><b class="t-title-3">Kanto Classic</b><span class="t-body-sm ps-subtle">Pallet Town League</span></div>' +
      NAV.map(function (n) {
        var badge =
          n[2] === 'locations'
            ? '<span class="ps-badge ps-badge--danger">1</span>'
            : n[2] === 'encounters'
              ? '<span class="ps-badge ps-badge--danger">1</span>'
              : '';
        return (
          '<a class="ps-nav-item" href="#"' +
          (n[2] === active ? ' aria-current="page"' : '') +
          '><span data-i="' +
          n[1] +
          '"></span>' +
          n[0] +
          badge +
          '</a>'
        );
      }).join('') +
      '<div class="ps-nav-sep"></div>' +
      SOON.map(function (n) {
        return (
          '<span class="ps-nav-item is-soon" aria-disabled="true"><span data-i="' +
          n[1] +
          '"></span>' +
          n[0] +
          '<span class="ps-badge ps-badge--outline">Soon</span></span>'
        );
      }).join('') +
      '</nav>'
    );
  };
  PS.topbar = function (saved) {
    return (
      '<header class="ps-topbar"><h1 class="t-title-3">Kanto Classic</h1><span class="ps-badge ps-badge--draft">Draft</span><span class="t-body-sm ps-subtle" style="flex:1">Published v7 · 3 unpublished changes</span>' +
      (saved === false
        ? ''
        : '<span class="ps-save ps-save--ok"><span data-i="check" data-s="16"></span>Saved</span>') +
      '<button class="ps-btn ps-btn--primary">Publish</button></header>'
    );
  };
  PS.LOCS = [
    {
      k: 'pallet-town',
      n: 'Pallet Town',
      kind: 'town',
      meta: 'Town · 2 connections',
    },
    {
      k: 'route-1',
      n: 'Route 1',
      kind: 'route',
      meta: 'Route · 3 connections',
    },
    {
      k: 'route-22',
      n: 'Route 22',
      kind: 'route',
      meta: 'Route · 1 connection',
      warn: true,
    },
    {
      k: 'viridian-city',
      n: 'Viridian City',
      kind: 'town',
      meta: 'Town · 3 connections',
    },
    {
      k: 'vc-center',
      n: 'Pokémon Center',
      kind: 'building',
      meta: 'Building · Heal, PC',
      child: true,
    },
    {
      k: 'vc-mart',
      n: 'Viridian Mart',
      kind: 'building',
      meta: 'Building',
      child: true,
    },
    {
      k: 'vc-gym',
      n: 'Viridian Gym',
      kind: 'gym',
      meta: 'Gym · locked',
      child: true,
    },
    {
      k: 'route-2',
      n: 'Route 2',
      kind: 'route',
      meta: 'Route · no connections',
      err: true,
    },
    {
      k: 'viridian-forest',
      n: 'Viridian Forest',
      kind: 'dungeon',
      meta: 'Dungeon · 2 connections',
    },
    {
      k: 'mt-moon',
      n: 'Mt. Moon',
      kind: 'dungeon',
      meta: 'Dungeon · 3 floors',
    },
    {
      k: 'route-4-pond',
      n: 'Route 4 Pond',
      kind: 'water',
      meta: 'Water · Surf, Old Rod',
    },
  ];
  PS.locRows = function (current) {
    return PS.LOCS.map(function (l) {
      var dot = l.err
        ? '<span class="ps-dot ps-dot--danger" aria-label="Has errors"></span>'
        : l.warn
          ? '<span class="ps-dot" aria-label="Has warnings"></span>'
          : '';
      return (
        '<button class="ps-list-row' +
        (l.child ? ' is-child' : '') +
        '"' +
        (current === l.k ? ' aria-current="true"' : '') +
        '><span class="ps-kind" data-i="' +
        l.kind +
        '"></span><span class="ps-row-text"><b>' +
        l.n +
        '</b><span>' +
        l.meta +
        '</span></span>' +
        dot +
        '<span data-i="chevR"></span></button>'
      );
    }).join('');
  };
  PS.kindChips = function () {
    var K = [
      ['Town', 'town'],
      ['Route', 'route'],
      ['Dungeon', 'dungeon'],
      ['Building', 'building'],
      ['Gym', 'gym'],
      ['Landmark', 'landmark'],
      ['Water', 'water'],
    ];
    return (
      '<div class="ps-chips"><button class="ps-chip" aria-pressed="true">All</button>' +
      K.map(function (k) {
        return (
          '<button class="ps-chip" aria-pressed="false"><span data-i="' +
          k[1] +
          '" data-s="16"></span>' +
          k[0] +
          '</button>'
        );
      }).join('') +
      '</div>'
    );
  };
  PS.locTabs = function (active) {
    return (
      '<div class="ps-tabs" role="tablist">' +
      [
        ['details', 'Details'],
        ['connections', 'Connections <span class="ps-tab-meta">3</span>'],
        ['encounters', 'Encounters'],
      ]
        .map(function (t) {
          return (
            '<button class="ps-tab" role="tab" aria-selected="' +
            (t[0] === active) +
            '">' +
            t[1] +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  };
  PS.phoneBar = function (title, sub, right) {
    return (
      '<div class="ps-appbar"><button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="Back"><span data-i="back"></span></button><h1 class="ps-appbar-title">' +
      title +
      (sub ? '<small>' + sub + '</small>' : '') +
      '</h1>' +
      (right || '') +
      '</div>'
    );
  };
  PS.saved =
    '<span class="ps-save ps-save--ok"><span data-i="check" data-s="16"></span>Saved</span>';
  PS.moreBtn =
    '<button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="More actions"><span data-i="more"></span></button>';
})(window.PS);

/* Condition summary row (K1), shared by every place a condition is attached. */
(function (PS) {
  PS.condSummary = function (text, opts) {
    opts = opts || {};
    if (!text)
      return (
        '<div class="ps-cond-summary ps-cond-summary--empty"><span data-i="lock"></span><span class="ps-cond-text">' +
        (opts.empty || 'No requirement') +
        '<small>' +
        (opts.emptyHint || 'Anyone can use this.') +
        '</small></span><button class="ps-btn ps-btn--ghost"><span data-i="plus" data-s="18"></span>Add</button></div>'
      );
    return (
      '<div class="ps-cond-summary' +
      (opts.error ? ' ps-cond-summary--error' : '') +
      '"><span data-i="' +
      (opts.error ? 'error' : opts.icon || 'lock') +
      '"></span><span class="ps-cond-text">' +
      text +
      (opts.note ? '<small>' + opts.note + '</small>' : '') +
      '</span><button class="ps-btn ps-btn--ghost">Edit</button></div>'
    );
  };
})(window.PS);

/* Trainers and NPCs shared by the round 2 mockups. */
(function (PS) {
  PS.icons.swap = PS.icons.swap || '<path d="M4 8h14l-3-3M20 16H6l3 3"/>';
  PS.TRAINERS = [
    {
      k: 'rival',
      n: '{name:rival}',
      cls: 'Rival',
      icon: 'swap',
      meta: '3 variants · 4 Pokémon · Lv 15–18',
      loc: 'scripted',
      warn: true,
    },
    {
      k: 'brock',
      n: 'Brock',
      cls: 'Gym Leader',
      icon: 'gym',
      meta: '2 Pokémon · Lv 12–14',
      loc: '1 location',
    },
    {
      k: 'camper-liam',
      n: 'Camper Liam',
      cls: 'Camper',
      icon: 'user',
      meta: '2 Pokémon · Lv 10–11',
      loc: '1 location',
    },
    {
      k: 'bug-rick',
      n: 'Bug Catcher Rick',
      cls: 'Bug Catcher',
      icon: 'leaf',
      meta: '2 Pokémon · Lv 6',
      loc: '1 location',
    },
    {
      k: 'bug-doug',
      n: 'Bug Catcher Doug',
      cls: 'Bug Catcher',
      icon: 'leaf',
      meta: '3 Pokémon · Lv 7–9',
      loc: '1 location',
    },
    {
      k: 'lass-janice',
      n: 'Lass Janice',
      cls: 'Lass',
      icon: 'user',
      meta: '2 Pokémon · Lv 9',
      loc: '2 locations',
    },
    {
      k: 'youngster-ben',
      n: 'Youngster Ben',
      cls: 'Youngster',
      icon: 'user',
      meta: 'No Pokémon yet',
      loc: '1 location',
      err: true,
    },
    {
      k: 'hiker-marcos',
      n: 'Hiker Marcos',
      cls: 'Hiker',
      icon: 'dungeon',
      meta: '3 Pokémon · Lv 10–12',
      loc: '1 location',
    },
  ];
  /* One NPCs list, trainers folded in (chosen Nov 2026): NPCs replaces the Trainers entry. */
  (function () {
    var i = PS.NAV.findIndex(function (n) {
      return n[2] === 'trainers';
    });
    if (i > -1) PS.NAV.splice(i, 1, ['NPCs', 'chat', 'npcs', '41']);
  })();
  PS.trainerName = function (n) {
    return n.replace(
      '{name:rival}',
      '<span class="t-mono">{name:rival}</span>',
    );
  };
  PS.trainerRows = function (current) {
    return PS.TRAINERS.map(function (t) {
      var dot = t.err
        ? '<span class="ps-dot ps-dot--danger" aria-label="Has errors"></span>'
        : t.warn
          ? '<span class="ps-dot" aria-label="Has warnings"></span>'
          : '';
      return (
        '<button class="ps-list-row"' +
        (current === t.k ? ' aria-current="true"' : '') +
        '><span class="ps-kind" data-i="' +
        t.icon +
        '"></span><span class="ps-row-text"><b>' +
        PS.trainerName(t.n) +
        '</b><span>' +
        t.cls +
        ' · ' +
        t.loc +
        '</span><span>' +
        t.meta +
        '</span></span>' +
        dot +
        '<span data-i="chevR"></span></button>'
      );
    }).join('');
  };
  PS.classChips = function () {
    return (
      '<div class="ps-chips"><button class="ps-chip" aria-pressed="true">All</button>' +
      [
        'Youngster',
        'Bug Catcher',
        'Lass',
        'Camper',
        'Hiker',
        'Gym Leader',
        'Rival',
      ]
        .map(function (c) {
          return (
            '<button class="ps-chip" aria-pressed="false">' + c + '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  };
  PS.tabs = function (items, active) {
    return (
      '<div class="ps-tabs" role="tablist">' +
      items
        .map(function (t) {
          return (
            '<button class="ps-tab" role="tab" aria-selected="' +
            (t[0] === active) +
            '">' +
            t[1] +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  };
  PS.trainerTabs = function (active) {
    return PS.tabs(
      [
        ['details', 'Details'],
        ['party', 'Party <span class="ps-tab-meta">3</span>'],
        ['lines', 'Lines'],
      ],
      active,
    );
  };
  PS.listPane = function (title, count, rows, extra) {
    return (
      '<section class="ps-pane-list"><div class="ps-appbar" style="padding:0 8px 0 16px"><h2 class="ps-appbar-title">' +
      title +
      ' <span class="ps-subtle" style="font-weight:400">· ' +
      count +
      '</span></h2><button class="ps-btn ps-btn--secondary"><span data-i="plus"></span>Add</button></div>' +
      (extra || '') +
      '<div class="ps-scroll">' +
      rows +
      '</div></section>'
    );
  };
})(window.PS);

/* Party editor (L2), reused by the Gym Leader template (N2). */
(function (PS) {
  PS.monRow = function (m) {
    var moves = m.moves ? m.moves + ' of 4 moves set' : 'Auto moves';
    return (
      '<div class="ps-mon"><button class="ps-handle" aria-label="Reorder ' +
      m.s +
      '"><span data-i="grip"></span></button><span class="ps-thumb" style="width:36px;height:36px"></span><div><b>' +
      m.s +
      ' <span class="ps-subtle" style="font-weight:500">Lv ' +
      m.lv +
      '</span></b><span>' +
      moves +
      '</span></div>' +
      PS.moreBtn +
      '</div>'
    );
  };
  PS.variantCard = function (v, i, opts) {
    opts = opts || {};
    var collapsed = v.collapsed;
    var range = v.mons.length
      ? 'Lv ' +
        Math.min.apply(
          null,
          v.mons.map(function (m) {
            return m.lv;
          }),
        ) +
        '–' +
        Math.max.apply(
          null,
          v.mons.map(function (m) {
            return m.lv;
          }),
        )
      : '';
    var cond = v.cond
      ? PS.condSummary(v.cond, { icon: v.icon || 'lock' })
      : PS.condSummary('', {
          empty: 'No condition',
          emptyHint: opts.single
            ? 'Always used.'
            : 'Fallback: used when nothing above matches.',
        });
    return (
      '<article class="ps-variant' +
      (collapsed ? ' is-collapsed' : '') +
      '"><div class="ps-variant-head">' +
      (opts.single
        ? ''
        : '<button class="ps-handle" aria-label="Reorder variant ' +
          (i + 1) +
          '"><span data-i="grip"></span></button><span class="ps-priority">' +
          (i + 1) +
          '</span>') +
      '<b>' +
      v.name +
      (collapsed
        ? '<br><span class="t-body-sm ps-subtle" style="font-weight:400">' +
          v.mons.length +
          ' Pokémon · ' +
          range +
          '</span>'
        : '') +
      '</b>' +
      '<button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="' +
      (collapsed ? 'Expand' : 'Collapse') +
      '"><span data-i="' +
      (collapsed ? 'chevD' : 'up') +
      '"></span></button>' +
      PS.moreBtn +
      '</div>' +
      (opts.single ? '' : cond) +
      '<div class="ps-variant-body"><div class="ps-mons">' +
      v.mons.map(PS.monRow).join('') +
      '</div>' +
      '<div class="ps-variant-foot"><span class="t-body-sm ps-subtle">' +
      v.mons.length +
      ' of 6</span><button class="ps-btn ps-btn--secondary"' +
      (v.mons.length >= 6 ? ' disabled' : '') +
      '><span data-i="plus" data-s="18"></span>Add Pokémon</button></div>' +
      '<div class="ps-field"><span class="ps-label">Bag <span class="ps-opt">(optional)</span></span><div class="ps-tags">' +
      (v.bag || [])
        .map(function (b) {
          return (
            '<span class="ps-tag">' +
            b +
            '<button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="Remove ' +
            b +
            '"><span data-i="x" data-s="16"></span></button></span>'
          );
        })
        .join('') +
      '<button class="ps-chip"><span data-i="plus" data-s="16"></span>Add item</button></div><p class="ps-help">Used in battle by Basic and Smart AI to heal or cure status.</p></div>' +
      (opts.single
        ? ''
        : '<button class="ps-btn ps-btn--ghost" style="align-self:flex-start;padding:0 8px">Duplicate variant</button>') +
      '</div></article>'
    );
  };
  PS.partyEditor = function (variants, opts) {
    opts = opts || {};
    if (opts.single) return PS.variantCard(variants[0], 0, opts);
    return (
      '<p class="t-body-sm ps-muted">Variants are checked in order. The first whose condition matches is the team the player faces.</p>' +
      variants
        .map(function (v, i) {
          return PS.variantCard(v, i, opts);
        })
        .join('') +
      (opts.warn
        ? '<div class="ps-callout ps-callout--warning"><span data-i="alert" data-s="18"></span><span>' +
          opts.warn +
          '</span></div>'
        : '') +
      '<button class="ps-btn ps-btn--secondary ps-btn--block"><span data-i="plus"></span>Add variant</button>'
    );
  };
  PS.RIVAL = [
    {
      name: 'If starter is Bulbasaur',
      cond: 'If the starter chosen is Bulbasaur',
      mons: [
        { s: 'Pidgeotto', lv: 17 },
        { s: 'Abra', lv: 16 },
        { s: 'Rattata', lv: 15 },
        { s: 'Charmander', lv: 18, moves: 2 },
      ],
      bag: ['2× Potion'],
    },
    {
      name: 'If starter is Charmander',
      cond: 'If the starter chosen is Charmander',
      mons: [
        { s: 'Pidgeotto', lv: 17 },
        { s: 'Abra', lv: 16 },
        { s: 'Rattata', lv: 15 },
        { s: 'Squirtle', lv: 18 },
      ],
      collapsed: true,
    },
    {
      name: 'If starter is Squirtle',
      cond: 'If the starter chosen is Squirtle',
      mons: [
        { s: 'Pidgeotto', lv: 17 },
        { s: 'Abra', lv: 16 },
        { s: 'Rattata', lv: 15 },
        { s: 'Bulbasaur', lv: 18 },
      ],
      collapsed: true,
    },
  ];
})(window.PS);

/* NPC editor tabs (Person, Battle), shared by the NPCs screen and L2. */
(function (PS) {
  var choice = function (on, t, d) {
    return (
      '<button class="ps-choice" role="radio" aria-checked="' +
      on +
      '"><span class="ps-radio"></span><span class="ps-choice-text"><b>' +
      t +
      '</b><span>' +
      d +
      '</span></span></button>'
    );
  };
  PS.npcPerson = function () {
    var place = function (n, kind, loc, cond) {
      return (
        '<article class="ps-placement"><div class="ps-variant-head"><button class="ps-handle" aria-label="Reorder place ' +
        n +
        '"><span data-i="grip"></span></button><span class="ps-priority">' +
        n +
        '</span><span class="ps-kind" data-i="' +
        kind +
        '"></span><b>' +
        loc +
        '</b>' +
        PS.moreBtn +
        '</div>' +
        PS.condSummary(cond) +
        '</article>'
      );
    };
    return (
      '<div class="ps-field"><label class="ps-label">Name</label><input class="ps-input" value="{name:rival}" style="font-family:var(--font-mono);font-size:15px"><div class="ps-hint-chips"><span class="t-body-sm ps-subtle">Insert:</span><button class="ps-chip">{name:rival}</button><button class="ps-chip">{name:player}</button></div></div>' +
      '<div class="ps-field"><span class="ps-label">Sprite</span><div class="ps-sprite-row"><span class="ps-sprite">Sprite<br>placeholder</span><button class="ps-btn ps-btn--secondary">Choose image</button></div></div>' +
      '<h2 class="t-title-2" style="margin-top:8px">Where they are</h2><div class="ps-seg" role="group"><button aria-pressed="true">Single</button><button aria-pressed="false">Everywhere</button></div><p class="ps-help">In one place at a time: the first that matches.</p>' +
      place(
        1,
        'building',
        'Oak’s Lab, Pallet Town',
        'Only before <span class="t-mono">oak_parcel_delivered</span>',
      ) +
      place(2, 'town', 'Viridian City', 'Requires the Boulder Badge') +
      '<button class="ps-btn ps-btn--ghost" style="align-self:flex-start">Show all 3</button>' +
      '<h2 class="t-title-2" style="margin-top:8px">Talk script</h2><div class="ps-link-row"><span data-i="code"></span><span>rival-smalltalk<small>When the player talks to them</small></span><button class="ps-btn ps-btn--ghost">Change</button></div>'
    );
  };
  PS.npcBattle = function () {
    return (
      '<div class="ps-callout ps-callout--info"><span data-i="swap" data-s="18"></span><span>This NPC battles. Their team is on the Party tab.</span></div>' +
      '<div class="ps-field"><span class="ps-label">Class</span><button class="ps-trigger"><span style="display:flex;gap:10px;align-items:center"><span data-i="swap"></span>Rival</span><span data-i="chevD"></span></button></div>' +
      '<div class="ps-field"><span class="ps-label">How the battle starts</span><div role="radiogroup" class="ps-stack" style="gap:8px">' +
      choice(
        false,
        'On explore',
        'Each Explore may turn them up instead of a wild Pokémon.',
      ) +
      choice(false, 'On entering', 'As soon as the player arrives.') +
      choice(true, 'On talk', 'Only when the player talks to them.') +
      '</div></div>' +
      '<div class="ps-field"><span class="ps-label">AI</span><div class="ps-seg" role="group"><button aria-pressed="false">Random</button><button aria-pressed="false">Basic</button><button aria-pressed="true">Smart</button></div></div>' +
      '<div class="ps-field"><span class="ps-label">Payout</span><div class="ps-seg" role="group"><button aria-pressed="true">Formula</button><button aria-pressed="false">Fixed amount</button></div><p class="ps-help">₽35 × level of the last Pokémon = <b style="color:var(--ink)">₽630</b>.</p></div>' +
      '<div class="ps-field"><span class="ps-label">Battle format</span><div class="ps-seg" role="group"><button aria-pressed="true">Singles</button><button aria-pressed="false" disabled style="opacity:.5">Doubles · later</button></div></div>' +
      '<label class="ps-switch-row" style="padding:0"><span class="ps-switch-text"><b>Stays after defeat</b><span>Off: they leave once beaten.</span></span><button class="ps-switch" role="switch" aria-checked="true" aria-label="Stays after defeat"></button></label>' +
      '<div class="ps-link-row"><span data-i="code"></span><span>None<small>What they say after you win</small></span><button class="ps-btn ps-btn--ghost">Add</button></div>'
    );
  };
  PS.npcTabs = function (active, battles) {
    var t = [
      ['person', 'Person'],
      ['battle', 'Battle'],
    ];
    if (battles)
      t.push(
        ['party', 'Party <span class="ps-tab-meta">3</span>'],
        ['lines', 'Lines'],
      );
    return PS.tabs(t, active);
  };
})(window.PS);
