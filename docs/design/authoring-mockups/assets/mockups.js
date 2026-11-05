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
      '<header class="ps-topbar"><h1 class="t-title-3">Kanto Classic</h1><span class="ps-badge ps-badge--draft">Draft</span><span class="t-body-sm ps-subtle" style="flex:1">Published v7 · 9 unpublished changes</span>' +
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
        ['encounters', 'Explore'],
        ['events', 'Events'],
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
      '<h2 class="t-title-2" style="margin-top:8px">Presence</h2><div class="ps-seg" role="group"><button aria-pressed="true">One place at a time</button><button aria-pressed="false">Every listed place</button></div><p class="ps-help">Shows up at the first listed place whose condition matches. Good for story characters who move.</p>' +
      '<h2 class="t-title-2" style="margin-top:8px">Where they appear</h2><p class="t-body-sm ps-muted">Only these listed places count, checked in order.</p>' +
      place(
        1,
        'building',
        'Oak’s Lab, Pallet Town',
        'Only before <span class="t-mono">oak_parcel_delivered</span>',
      ) +
      place(2, 'town', 'Viridian City', 'Requires the Boulder Badge') +
      '<div class="ps-callout ps-callout--warning"><span data-i="alert" data-s="18"></span><span>Two places can match at once; the first one wins. With One place at a time, places 1 and 2 can both match, so 2 may never be used.</span></div>' +
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

/* Group 4: Region Health and TMs & HMs in the builder nav. */
(function (PS) {
  PS.icons.disc =
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>';
  PS.icons.pulse = '<path d="M3 12h4l3-7 4 14 3-7h4"/>';
  PS.icons.refresh =
    '<path d="M20 11a8 8 0 0 0-14.9-3M4 13a8 8 0 0 0 14.9 3"/><path d="M5 3v5h5M19 21v-5h-5"/>';
  PS.icons.upload = '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>';
  if (
    !PS.NAV.some(function (n) {
      return n[2] === 'health';
    })
  )
    PS.NAV.splice(1, 0, ['Region Health', 'pulse', 'health', '5']);
  if (
    !PS.NAV.some(function (n) {
      return n[2] === 'tms';
    })
  )
    PS.NAV.splice(
      PS.NAV.findIndex(function (n) {
        return n[2] === 'pokedex';
      }) + 1,
      0,
      ['TMs & HMs', 'disc', 'tms', '55'],
    );
  PS.HEALTH = [
    {
      sev: 'error',
      area: 'Locations',
      title: 'Route 2 has no connections',
      why: 'Players can’t reach it or leave it. Add a connection to Viridian City or Pewter City.',
      path: 'Locations › Route 2 › Connections › Add connection',
    },
    {
      sev: 'error',
      area: 'Encounters',
      title: 'Mt. Moon B1F has a slot with no species',
      why: 'An empty slot can’t be rolled. Pick a species or remove the slot.',
      path: 'Locations › Mt. Moon B1F › Explore › Walk in the cave › Slot 3 › Species',
    },
    {
      sev: 'error',
      area: 'NPCs',
      title: 'Youngster Ben has no Pokémon',
      why: 'A trainer with an empty party can’t battle. Add at least one Pokémon.',
      path: 'NPCs › Youngster Ben › Party › Variant 1 › Add Pokémon',
    },
    {
      sev: 'warning',
      area: 'Locations',
      title: 'Route 22 has only one connection',
      why: 'That’s fine for a dead end, but check players aren’t meant to pass through.',
      path: 'Locations › Route 22 › Connections › Add connection',
      dismissed: {
        by: 'Misty',
        when: 'Nov 3',
        reason: 'Dead end on purpose. It leads to the League later.',
      },
    },
    {
      sev: 'warning',
      area: 'NPCs',
      title: 'The rival has no fallback party',
      why: 'If no variant matches, the battle can’t start. Add a variant with no condition at the end.',
      path: 'NPCs › {name:rival} › Party › Add variant',
    },
    {
      sev: 'warning',
      area: 'NPCs',
      title: 'Two of the rival’s places can match at once',
      why: 'With One place at a time, places 1 and 2 can both match; the first one wins, so 2 may never be used.',
      path: 'NPCs › {name:rival} › Person › Where they appear › Place 2 › Condition',
    },
    {
      sev: 'info',
      area: 'TMs & HMs',
      title: 'TM25 is empty',
      why: 'Players who have TM25 won\u2019t see it until a move is assigned. Fine if that\u2019s on purpose.',
      path: 'TMs & HMs › TM25 › Move',
    },
  ];
})(window.PS);

/* Species info (read-only, rules-aware), opened from pickers, Pokédex slots, form rows, encounters and parties. */
(function (PS) {
  PS.icons.info =
    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>';
  PS.infoBtn = function (name) {
    return (
      '<button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="Species info: ' +
      name +
      '"><span data-i="info"></span></button>'
    );
  };
  var stat = function (label, v) {
    return (
      '<div class="ps-stat"><span>' +
      label +
      '</span><b>' +
      v +
      '</b><i><i style="width:' +
      Math.round((v / 255) * 100) +
      '%"></i></i></div>'
    );
  };
  PS.speciesInfo = function () {
    var form = function (name, type, diff, on, warn) {
      return (
        '<div class="ps-placement' +
        (warn ? ' is-warn' : '') +
        '" style="gap:6px"><div class="ps-variant-head"><span class="ps-thumb"></span><b>' +
        name +
        '</b><span class="ps-type">' +
        type +
        '</span></div>' +
        '<p class="t-body-sm ps-muted">' +
        diff +
        '</p><p class="t-body-sm" style="color:var(--' +
        (on ? 'success' : 'ink-subtle') +
        ')">' +
        (on ? 'Included in slot #052' : 'Not included') +
        '</p>' +
        (warn
          ? '<p class="ps-error" style="color:var(--warning)"><span data-i="alert" data-s="18"></span>' +
            warn +
            '</p>'
          : '') +
        '</div>'
      );
    };
    return (
      '<div class="ps-species-head"><span class="ps-thumb"></span><div class="ps-stack" style="gap:4px"><h2 class="t-title-1">Meowth</h2><span class="t-body-sm ps-subtle"><span class="t-mono">#052</span> National · slot #052 in Kanto Classic</span><div class="ps-row" style="gap:6px"><span class="ps-type">Normal</span></div></div></div>' +
      '<div class="ps-callout ps-callout--info"><span data-i="book" data-s="18"></span><span>Shown with Classic Gen 1 rules: one Special stat, no abilities, gender or held items.</span></div>' +
      '<section class="ps-info-section"><h3 class="t-title-3">Base stats</h3>' +
      stat('HP', 40) +
      stat('Attack', 45) +
      stat('Defense', 35) +
      stat('Special', 40) +
      stat('Speed', 90) +
      '<p class="t-body-sm ps-subtle">Total 250</p></section>' +
      '<section class="ps-info-section"><h3 class="t-title-3">Details</h3><div class="ps-facts"><div><span>Catch rate</span><b>255</b></div><div><span>Growth</span><b>Medium Fast</b></div><div><span>Height</span><b>0.4 m</b></div><div><span>Weight</span><b>4.2 kg</b></div></div></section>' +
      '<section class="ps-info-section"><h3 class="t-title-3">Evolution</h3><div class="ps-evo"><div class="ps-evo-step"><span class="ps-thumb" style="width:32px;height:32px"></span><span><b>Meowth</b><small>Slot #052</small></span></div><span class="t-body-sm ps-subtle">Lv 28 →</span><div class="ps-evo-step" style="border-color:var(--warning)"><span class="ps-thumb" style="width:32px;height:32px"></span><span><b>Persian</b><small style="color:var(--warning)">Not in this Pokédex</small></span></div></div>' +
      '<button class="ps-btn ps-btn--ghost" style="align-self:flex-start;padding:0 8px"><span data-i="plus" data-s="18"></span>Add Persian to slot #053</button></section>' +
      '<section class="ps-info-section"><h3 class="t-title-3">Forms</h3>' +
      form('Meowth', 'Normal', 'Base form.', true) +
      form(
        'Alolan Meowth',
        'Dark',
        'Attack 35 (−10). Otherwise the same.',
        true,
        'Dark isn’t a type in Classic Gen 1 rules. Region Health will flag it.',
      ) +
      form(
        'Galarian Meowth',
        'Steel',
        'HP 50 (+10), Attack 65 (+20), Defense 55 (+20), Speed 40 (−50).',
        false,
        'Steel isn’t a type in Classic Gen 1 rules.',
      ) +
      '</section>' +
      '<section class="ps-info-section"><h3 class="t-title-3">Moves by level</h3><div class="ps-moves"><span>Lv 1</span><span>Scratch</span><span>Lv 1</span><span>Growl</span><span>Lv 12</span><span>Bite</span><span>Lv 17</span><span>Pay Day</span><span>Lv 24</span><span>Screech</span><span>Lv 33</span><span>Fury Swipes</span><span>Lv 44</span><span>Slash</span></div><p class="t-body-sm ps-subtle">Trainer Pokémon with no moves set use the last four learned by their level.</p></section>' +
      '<section class="ps-info-section"><h3 class="t-title-3">TMs & HMs it can learn</h3><div class="ps-tags"><span class="ps-badge">TM06 Toxic</span><span class="ps-badge">TM08 Body Slam</span><span class="ps-badge">TM09 Take Down</span><span class="ps-badge">TM10 Double-Edge</span><span class="ps-badge ps-badge--outline">+12 more</span></div><p class="t-body-sm ps-subtle">From this region’s TM case.</p></section>' +
      '<section class="ps-info-section"><h3 class="t-title-3">Used in this region · 3</h3><div class="ps-review">' +
      [
        ['leaf', 'Route 5 · Walk in the grass', '10%, Lv 10–14'],
        ['user', 'Rocket Grunt', 'Party, Lv 12'],
        ['book', 'Pokédex slot #052', 'With Alolan Meowth'],
      ]
        .map(function (u) {
          return (
            '<div class="ps-review-row"><span class="ps-kind" data-i="' +
            u[0] +
            '"></span><div><dd>' +
            u[1] +
            '</dd><dt style="font-weight:400">' +
            u[2] +
            '</dt></div><button class="ps-btn ps-btn--ghost">Open</button></div>'
          );
        })
        .join('') +
      '</div></section>'
    );
  };
})(window.PS);

/* Species sections, shared by the builder's SpeciesInfoPanel and the player pages.
   In the app these render one species view model (libs/presentation) built from the catalog plus a rules context. */
(function (PS) {
  var stat = function (label, v) {
    return (
      '<div class="ps-stat"><span>' +
      label +
      '</span><b>' +
      v +
      '</b><i><i style="width:' +
      Math.round((v / 255) * 100) +
      '%"></i></i></div>'
    );
  };
  var STATS = {
    gen1: [
      ['HP', 40],
      ['Attack', 45],
      ['Defense', 35],
      ['Special', 40],
      ['Speed', 90],
    ],
    latest: [
      ['HP', 40],
      ['Attack', 45],
      ['Defense', 35],
      ['Sp. Atk', 40],
      ['Sp. Def', 40],
      ['Speed', 90],
    ],
  };
  var sec = function (title, body) {
    return (
      '<section class="ps-info-section"><h3 class="t-title-3">' +
      title +
      '</h3>' +
      body +
      '</section>'
    );
  };
  PS.sp = {
    locked: function (title, text) {
      return sec(
        title,
        '<div class="ps-locked"><span data-i="lock" data-s="18"></span><span>' +
          text +
          '</span></div>',
      );
    },
    header: function (o) {
      return (
        '<div class="ps-species-head"><span class="ps-thumb"></span><div class="ps-stack" style="gap:4px"><h2 class="t-title-1">Meowth</h2><span class="t-body-sm ps-subtle"><span class="t-mono">#052</span> National' +
        (o.slot ? ' · ' + o.slot : '') +
        '</span><div class="ps-row" style="gap:6px"><span class="ps-type">Normal</span>' +
        (o.extra || '') +
        '</div></div></div>'
      );
    },
    stats: function (rules) {
      var s = STATS[rules],
        t = s.reduce(function (a, x) {
          return a + x[1];
        }, 0);
      return sec(
        'Base stats',
        s
          .map(function (x) {
            return stat(x[0], x[1]);
          })
          .join('') +
          '<p class="t-body-sm ps-subtle">Total ' +
          t +
          '</p>',
      );
    },
    details: function (rules) {
      var tiles = [
        ['Catch rate', '255'],
        ['Growth', 'Medium Fast'],
        ['Height', '0.4 m'],
        ['Weight', '4.2 kg'],
      ];
      if (rules === 'latest')
        tiles = [
          ['Abilities', 'Pickup, Technician'],
          ['Hidden ability', 'Unnerve'],
          ['Gender', '50% ♂ · 50% ♀'],
          ['Egg group', 'Field'],
        ].concat(tiles);
      return sec(
        'Details',
        '<div class="ps-facts">' +
          tiles
            .map(function (x) {
              return '<div><span>' + x[0] + '</span><b>' + x[1] + '</b></div>';
            })
            .join('') +
          '</div>',
      );
    },
    evo: function (o) {
      return sec(
        'Evolution',
        '<div class="ps-evo"><div class="ps-evo-step"><span class="ps-thumb" style="width:32px;height:32px"></span><span><b>Meowth</b>' +
          (o.meowthNote ? '<small>' + o.meowthNote + '</small>' : '') +
          '</span></div><span class="t-body-sm ps-subtle">Lv 28 →</span>' +
          '<div class="ps-evo-step"' +
          (o.persianWarn ? ' style="border-color:var(--warning)"' : '') +
          '><span class="ps-thumb" style="width:32px;height:32px"></span><span><b>' +
          (o.persianHidden ? '???' : 'Persian') +
          '</b>' +
          (o.persianNote
            ? '<small' +
              (o.persianWarn ? ' style="color:var(--warning)"' : '') +
              '>' +
              o.persianNote +
              '</small>'
            : '') +
          '</span></div></div>' +
          (o.after || ''),
      );
    },
    forms: function (list) {
      return sec(
        'Forms',
        list
          .map(function (f) {
            return (
              '<div class="ps-placement' +
              (f.warn ? ' is-warn' : '') +
              '" style="gap:6px"><div class="ps-variant-head"><span class="ps-thumb"></span><b>' +
              f.name +
              '</b><span class="ps-type">' +
              f.type +
              '</span></div><p class="t-body-sm ps-muted">' +
              f.diff +
              '</p>' +
              (f.note
                ? '<p class="t-body-sm" style="color:var(--' +
                  (f.noteColor || 'ink-subtle') +
                  ')">' +
                  f.note +
                  '</p>'
                : '') +
              (f.warn
                ? '<p class="ps-error" style="color:var(--warning)"><span data-i="alert" data-s="18"></span>' +
                  f.warn +
                  '</p>'
                : '') +
              '</div>'
            );
          })
          .join(''),
      );
    },
    moves: function (rules) {
      var m = [
        ['1', 'Scratch'],
        ['1', 'Growl'],
        ['12', 'Bite'],
        ['17', 'Pay Day'],
        ['24', 'Screech'],
        ['33', 'Fury Swipes'],
        ['44', 'Slash'],
      ];
      if (rules === 'latest')
        m = [
          ['1', 'Scratch'],
          ['1', 'Growl'],
          ['4', 'Fake Out'],
          ['8', 'Pay Day'],
          ['12', 'Bite'],
          ['16', 'Charm'],
          ['20', 'Assurance'],
          ['+5', 'more'],
        ];
      return sec(
        'Moves by level',
        '<div class="ps-moves">' +
          m
            .map(function (x) {
              return (
                '<span>' +
                (x[0].charAt(0) === '+' ? '' : 'Lv ' + x[0]) +
                '</span><span>' +
                (x[0].charAt(0) === '+'
                  ? '<span class="ps-subtle">' + x[0] + ' more</span>'
                  : x[1]) +
                '</span>'
              );
            })
            .join('') +
          '</div>',
      );
    },
    tms: function (note) {
      return sec(
        'TMs & HMs it can learn',
        '<div class="ps-tags"><span class="ps-badge">TM06 Toxic</span><span class="ps-badge">TM08 Body Slam</span><span class="ps-badge">TM09 Take Down</span><span class="ps-badge">TM10 Double-Edge</span><span class="ps-badge ps-badge--outline">+12 more</span></div><p class="t-body-sm ps-subtle">' +
          note +
          '</p>',
      );
    },
    links: function (title, rows) {
      return sec(
        title,
        '<div class="ps-review">' +
          rows
            .map(function (u) {
              return (
                '<div class="ps-review-row"><span class="ps-kind" data-i="' +
                u[0] +
                '"></span><div><dd>' +
                u[1] +
                '</dd><dt style="font-weight:400">' +
                u[2] +
                '</dt></div><button class="ps-btn ps-btn--ghost">' +
                (u[3] || 'Open') +
                '</button></div>'
              );
            })
            .join('') +
          '</div>',
      );
    },
  };
  /* The builder panel, now composed from the shared sections. */
  PS.speciesInfo = function () {
    var sp = PS.sp;
    return (
      sp.header({ slot: 'slot #052 in Kanto Classic' }) +
      '<div class="ps-callout ps-callout--info"><span data-i="book" data-s="18"></span><span>Shown with Classic Gen 1 rules: one Special stat, no abilities, gender or held items.</span></div>' +
      sp.stats('gen1') +
      sp.details('gen1') +
      sp.evo({
        meowthNote: 'Slot #052',
        persianNote: 'Not in this Pokédex',
        persianWarn: true,
        after:
          '<button class="ps-btn ps-btn--ghost" style="align-self:flex-start;padding:0 8px"><span data-i="plus" data-s="18"></span>Add Persian to slot #053</button>',
      }) +
      sp.forms([
        {
          name: 'Meowth',
          type: 'Normal',
          diff: 'Base form.',
          note: 'Included in slot #052',
          noteColor: 'success',
        },
        {
          name: 'Alolan Meowth',
          type: 'Dark',
          diff: 'Attack 35 (−10). Otherwise the same.',
          note: 'Included in slot #052',
          noteColor: 'success',
          warn: 'Dark isn’t a type in Classic Gen 1 rules. Region Health will flag it.',
        },
        {
          name: 'Galarian Meowth',
          type: 'Steel',
          diff: 'HP 50 (+10), Attack 65 (+20), Defense 55 (+20), Speed 40 (−50).',
          note: 'Not included',
          warn: 'Steel isn’t a type in Classic Gen 1 rules.',
        },
      ]) +
      sp.moves('gen1') +
      sp.tms('From this region’s TM case.') +
      sp.links('Used in this region · 3', [
        ['leaf', 'Route 5 · Walk in the grass', '10%, Lv 10–14'],
        ['user', 'Rocket Grunt', 'Party, Lv 12'],
        ['book', 'Pokédex slot #052', 'With Alolan Meowth'],
      ])
    );
  };
})(window.PS);

/* Round 3 icons. */
(function (PS) {
  PS.icons.bolt = '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>';
  PS.icons.gem =
    '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M12 21L8 9l4-6 4 6z"/>';
  PS.icons.door =
    '<path d="M5 21V4h10v17M15 12h.01M3 21h18"/><path d="M15 4l4 2v15"/>';
})(window.PS);

/* RuleGroupEditor: an All/Any list of rows and groups (any number of groups, one level deep).
   Rows and groups have drag handles plus a Move menu, so nothing needs to be removed to move it.
   Configurations: conditions (facts, Not allowed) and traversal requirements (each type once, no Not). */
(function (PS) {
  PS.RULE_TYPES = {
    traversalFirst: {
      unique: true,
      allowNot: false,
      types: {
        trainers: {
          icon: 'user',
          label: 'Beat these trainers',
          say: function () {
            return 'beat Bug Catcher Rick and Bug Catcher Doug';
          },
          body: function () {
            return '<div class="ps-tags"><span class="ps-tag">Bug Catcher Rick<button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="Remove Rick"><span data-i="x" data-s="16"></span></button></span><span class="ps-tag">Bug Catcher Doug<button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="Remove Doug"><span data-i="x" data-s="16"></span></button></span><button class="ps-chip"><span data-i="plus" data-s="16"></span>Trainer</button></div>';
          },
        },
        wild: {
          icon: 'leaf',
          label: 'Win wild battles',
          unit: 'wild battles',
          say: function (r) {
            return 'win ' + r.n + ' wild battle' + (r.n === 1 ? '' : 's');
          },
        },
        explores: {
          icon: 'steps',
          label: 'Explore',
          unit: 'times',
          say: function (r) {
            return 'explore ' + r.n + ' time' + (r.n === 1 ? '' : 's');
          },
        },
      },
    },
    traversalEvery: {
      unique: true,
      allowNot: false,
      types: {
        explores: {
          icon: 'steps',
          label: 'Explore',
          unit: 'times',
          say: function (r) {
            return 'explore ' + r.n + ' time' + (r.n === 1 ? '' : 's');
          },
        },
        encounters: {
          icon: 'leaf',
          label: 'Wild encounters',
          unit: 'encounters',
          help: 'Ones a Repel avoids count too.',
          say: function (r) {
            return 'have ' + r.n + ' wild encounter' + (r.n === 1 ? '' : 's');
          },
        },
      },
    },
    condition: {
      unique: false,
      allowNot: true,
      types: {
        badge: {
          icon: 'gym',
          label: 'Has badge',
          value: 'Boulder Badge',
          say: function (r) {
            return 'the ' + r.value;
          },
        },
        move: {
          icon: 'user',
          label: 'Party knows move',
          value: 'Cut',
          say: function (r) {
            return 'a Pokémon that knows ' + r.value;
          },
        },
        item: {
          icon: 'bag',
          label: 'Has item',
          value: 'Bike Voucher',
          say: function (r) {
            return 'a ' + r.value;
          },
        },
      },
    },
  };
  PS.RULES = {};
  var join = function (parts, mode) {
    return parts.length < 2
      ? parts[0] || ''
      : parts.slice(0, -1).join(', ') +
          (mode === 'all' ? ' and ' : ' or ') +
          parts[parts.length - 1];
  };
  var cap = function (x) {
    var i = x.charAt(0) === '(' ? 1 : 0;
    return x.slice(0, i) + x.charAt(i).toUpperCase() + x.slice(i + 1);
  };
  function cfg(st) {
    return PS.RULE_TYPES[st.kind];
  }
  function phrase(st, r) {
    var s = cfg(st).types[r.t].say(r);
    return r.not ? 'not ' + s : s;
  }
  PS.ruleReads = function (st) {
    var parts = st.items
      .map(function (it) {
        if (it.group) {
          var g = it.rows.map(function (r) {
            return phrase(st, r);
          });
          return g.length > 1 ? '(' + join(g, it.mode) + ')' : g[0];
        }
        return phrase(st, it);
      })
      .filter(Boolean);
    var s = join(parts, st.mode);
    return s ? cap(s) + '.' : 'Nothing required yet.';
  };
  function used(st) {
    var u = [];
    st.items.forEach(function (it) {
      (it.group ? it.rows : [it]).forEach(function (r) {
        u.push(r.t);
      });
    });
    return u;
  }
  function free(st) {
    var c = cfg(st),
      u = used(st);
    return Object.keys(c.types).filter(function (t) {
      return !c.unique || u.indexOf(t) < 0;
    });
  }
  var segH = function (m, path) {
    return (
      '<div class="ps-seg" role="group"><button data-re-mode="' +
      path +
      ':all" aria-pressed="' +
      (m === 'all') +
      '">All of these</button><button data-re-mode="' +
      path +
      ':any" aria-pressed="' +
      (m === 'any') +
      '">Any of these</button></div>'
    );
  };
  var joinW = function (m) {
    return (
      '<div class="ps-cond-join">' + (m === 'all' ? 'and' : 'or') + '</div>'
    );
  };
  function groupNames(st) {
    var n = 0,
      out = [];
    st.items.forEach(function (it, i) {
      if (it.group) out.push([i, 'Group ' + ++n]);
    });
    return out;
  }
  function menuHTML(st, path) {
    var opts = [
        ['up', 'Move up'],
        ['down', 'Move down'],
      ],
      inGroup = path.indexOf('.') > -1;
    if (inGroup) opts.push(['top', 'Move to top level']);
    groupNames(st).forEach(function (g) {
      if (!inGroup || String(g[0]) !== path.split('.')[0])
        opts.push(['g' + g[0], 'Move to ' + g[1]]);
    });
    opts.push(['new', 'Move to a new group']);
    return (
      '<ul class="ps-listbox ps-menu ps-re-menu" role="menu">' +
      opts
        .map(function (o) {
          return (
            '<li class="ps-option" role="menuitem" data-re-to="' +
            path +
            '|' +
            o[0] +
            '">' +
            o[1] +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }
  function rowHTML(st, r, path) {
    var c = cfg(st),
      ty = c.types[r.t],
      open = st.menu === path;
    var body = ty.body
      ? ty.body(r)
      : ty.unit
        ? '<div class="ps-row" style="gap:8px;align-items:center;flex-wrap:nowrap"><input class="ps-input" type="number" inputmode="numeric" min="1" value="' +
          r.n +
          '" style="width:88px" aria-label="' +
          ty.unit +
          '" data-re-n="' +
          path +
          '"><span class="t-body-sm ps-muted">' +
          ty.unit +
          '</span></div>' +
          (ty.help ? '<p class="ps-help">' + ty.help + '</p>' : '')
        : '<button class="ps-trigger"><span style="display:flex;gap:10px;align-items:center"><span data-i="' +
          ty.icon +
          '"></span>' +
          r.value +
          '</span><span data-i="search"></span></button>';
    return (
      '<div class="ps-cond-row ps-re-item' +
      (st.dragging === path ? ' ps-re-dragging' : '') +
      '"><div class="ps-re-row-head"><button class="ps-handle" aria-label="Drag ' +
      ty.label +
      '"><span data-i="grip"></span></button><b><span data-i="' +
      ty.icon +
      '" data-s="18"></span>' +
      ty.label +
      '</b>' +
      (c.allowNot
        ? '<button class="ps-chip ps-chip--not" aria-pressed="' +
          !!r.not +
          '" data-re-not="' +
          path +
          '">Not</button>'
        : '') +
      '<button class="ps-btn ps-btn--ghost" style="padding:0 8px" aria-haspopup="menu" aria-expanded="' +
      open +
      '" data-re-menu="' +
      path +
      '">Move</button><button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="Remove ' +
      ty.label +
      '" data-re-rm="' +
      path +
      '"><span data-i="x"></span></button></div>' +
      '<div class="ps-cond-row-body" style="padding-left:44px">' +
      body +
      '</div>' +
      (open ? menuHTML(st, path) : '') +
      '</div>'
    );
  }
  PS.ruleEditorHTML = function (key) {
    var st = PS.RULES[key],
      names = groupNames(st),
      nameOf = function (i) {
        return (names.filter(function (g) {
          return g[0] === i;
        })[0] || [0, 'Group'])[1];
      };
    var parts = st.items.map(function (it, i) {
      if (!it.group)
        return (
          (st.dropAt === i
            ? '<div class="ps-re-drop" aria-hidden="true"></div>'
            : '') + rowHTML(st, it, String(i))
        );
      var rows = it.rows.map(function (r, j) {
        return rowHTML(st, r, i + '.' + j);
      });
      return (
        '<div class="ps-cond-group ps-re-item"><div class="ps-cond-group-head"><button class="ps-handle" aria-label="Drag ' +
        nameOf(i) +
        '"><span data-i="grip"></span></button><span class="ps-re-group-title">' +
        nameOf(i) +
        '</span>' +
        segH(it.mode, String(i)) +
        '<button class="ps-btn ps-btn--ghost ps-btn--icon" aria-label="Remove ' +
        nameOf(i) +
        '" data-re-rmgroup="' +
        i +
        '"><span data-i="trash"></span></button></div>' +
        (rows.length
          ? rows.join(joinW(it.mode))
          : '<p class="ps-help">Empty. Move requirements in, or add one.</p>') +
        (free(st).length
          ? '<button class="ps-btn ps-btn--ghost" data-re-add="' +
            i +
            '" style="align-self:flex-start"><span data-i="plus" data-s="18"></span>Add to ' +
            nameOf(i) +
            '</button>'
          : '') +
        '</div>'
      );
    });
    return (
      '<div class="ps-field"><span class="ps-label">' +
      (st.label || 'Players need') +
      '</span>' +
      segH(st.mode, 'top') +
      '<div class="ps-cond-rows">' +
      (parts.join(joinW(st.mode)) || '<p class="ps-help">Nothing yet.</p>') +
      '</div>' +
      '<div class="ps-row" style="gap:8px">' +
      (free(st).length
        ? '<button class="ps-btn ps-btn--secondary" data-re-add="top"><span data-i="plus" data-s="18"></span>' +
          (st.addLabel || 'Requirement') +
          '</button>'
        : '') +
      '<button class="ps-btn ps-btn--ghost" data-re-addgroup><span data-i="plus" data-s="18"></span>Group</button></div></div>' +
      '<div class="ps-cond-preview"><span>Reads as</span><p>' +
      PS.ruleReads(st) +
      '</p></div>'
    );
  };
  PS.ruleEditor = function (key) {
    return '<div data-re="' + key + '">' + PS.ruleEditorHTML(key) + '</div>';
  };
  function get(st, path) {
    var p = path.split('.');
    return p.length === 1
      ? { list: st.items, i: +p[0] }
      : { list: st.items[+p[0]].rows, i: +p[1] };
  }
  function take(st, path) {
    var g = get(st, path);
    return g.list.splice(g.i, 1)[0];
  }
  function redraw(key) {
    document.querySelectorAll('[data-re="' + key + '"]').forEach(function (el) {
      el.innerHTML = PS.ruleEditorHTML(key);
      PS.mount(el);
    });
  }
  function newRow(st, t) {
    var ty = cfg(st).types[t];
    return { t: t, n: ty.unit ? 1 : undefined, value: ty.value };
  }
  document.addEventListener('click', function (e) {
    var host = e.target.closest('[data-re]');
    if (!host) return;
    var key = host.getAttribute('data-re'),
      st = PS.RULES[key],
      b = e.target.closest(
        '[data-re-menu],[data-re-to],[data-re-rm],[data-re-rmgroup],[data-re-add],[data-re-addgroup],[data-re-mode],[data-re-not]',
      );
    if (!b) return;
    var a = function (n) {
      return b.getAttribute(n);
    };
    if (b.hasAttribute('data-re-menu')) {
      st.menu = st.menu === a('data-re-menu') ? null : a('data-re-menu');
    } else if (b.hasAttribute('data-re-to')) {
      var parts = a('data-re-to').split('|'),
        path = parts[0],
        to = parts[1],
        p = path.split('.'),
        g = get(st, path);
      if (to === 'up' || to === 'down') {
        var j = g.i + (to === 'up' ? -1 : 1);
        if (j >= 0 && j < g.list.length) {
          var tmp = g.list[g.i];
          g.list[g.i] = g.list[j];
          g.list[j] = tmp;
        }
      } else {
        var row = take(st, path);
        if (to === 'top') st.items.splice(+p[0] + 1, 0, row);
        else if (to === 'new')
          st.items.push({ group: true, mode: 'all', rows: [row] });
        else st.items[+to.slice(1)].rows.push(row);
        if (p.length === 2 && !st.items[+p[0]].rows.length && to !== 'top') {
          /* keep the now-empty group */
        }
      }
      st.menu = null;
    } else if (b.hasAttribute('data-re-rm')) {
      take(st, a('data-re-rm'));
      st.menu = null;
    } else if (b.hasAttribute('data-re-rmgroup')) {
      var gi = +a('data-re-rmgroup'),
        grp = st.items[gi];
      st.items.splice.apply(st.items, [gi, 1].concat(grp.rows));
    } else if (b.hasAttribute('data-re-add')) {
      var t = free(st)[0];
      if (t) {
        var r = newRow(st, t);
        if (a('data-re-add') === 'top') st.items.push(r);
        else st.items[+a('data-re-add')].rows.push(r);
      }
    } else if (b.hasAttribute('data-re-addgroup'))
      st.items.push({ group: true, mode: 'all', rows: [] });
    else if (b.hasAttribute('data-re-mode')) {
      var m = a('data-re-mode').split(':');
      if (m[0] === 'top') st.mode = m[1];
      else st.items[+m[0]].mode = m[1];
    } else if (b.hasAttribute('data-re-not')) {
      var gg = get(st, a('data-re-not'));
      gg.list[gg.i].not = !gg.list[gg.i].not;
    }
    redraw(key);
  });
  document.addEventListener('input', function (e) {
    var host = e.target.closest('[data-re]'),
      path = e.target.getAttribute('data-re-n');
    if (!host || path === null) return;
    var st = PS.RULES[host.getAttribute('data-re')],
      g = get(st, path);
    g.list[g.i].n = Math.max(1, parseInt(e.target.value, 10) || 1);
    host.querySelector('.ps-cond-preview p').textContent = PS.ruleReads(st);
  });
})(window.PS);
