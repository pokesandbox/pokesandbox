// Click map. Each rule: [pattern, target, near?]. Pattern is tested against the tapped element's
// aria-label and its visible text; `near` is tested against the text of the element's surroundings.
// Targets: 'key/i' (a frame), 'back', 'next' / 'prev' (wizard steps), 'toast:…', '@loc' / '@npc' (tabs).

var NOT_DRAWN = 'toast:This isn’t drawn in the mockups';

// Rules for one frame.
var FRAME = {
  // Public
  'a/0': [
    ['^Sign in( with Discord)?$', 'b/0'],
    ['^Browse servers$', 'c/0'],
    ['Add bot to Discord', 'toast:Opens Discord’s “add bot” page'],
  ],
  'b/0': [
    ['^Open builder$', 'f/0'],
    ['^View$', 'c/1'],
    ['Add bot to a server', 'toast:Opens Discord’s “add bot” page'],
  ],
  'b/1': [
    ['Browse servers', 'c/0'],
    ['Add bot to Discord', 'toast:Opens Discord’s “add bot” page'],
  ],
  'c/0': [['Open server in Discord', 'toast:Opens the server in Discord']],
  'c/1': [
    ['^Create region$', 'g/0'],
    ['^View$', 'd/0'],
    ['^Open builder$', 'f/0'],
  ],
  'd/0': [
    ['Back to Pallet Town League', 'c/1'],
    ['^Edit draft$', 'f/0'],
    ['Play in Discord', 'toast:Opens the region in Discord'],
  ],
  'e/0': [['Sign in with Discord', 'f/0']],
  'e/1': [
    ['View Kanto Classic', 'd/0'],
    ['Sign in with a different account', 'e/0'],
    ['^Reload$', 'toast:Still no builder access'],
  ],

  // Player pages
  'rp/0': [['Meowth', 'rp/1']],
  'rp/1': [
    ['Kanto Classic Pokédex', 'rp/0'],
    ['^Map$', NOT_DRAWN],
  ],
  'rp/2': [
    ['Kanto Classic Pokédex', 'rp/0'],
    ['^Map$', NOT_DRAWN],
  ],
  'sp/0': [['Latest rules', 'sp/1']],
  'sp/1': [['Classic Gen 1 rules', 'sp/0']],

  // Builder home
  'f/0': [
    ['^Publish$', 'o2/0'],
    ['Open Region Health', 'o1/0'],
    ['^Open$', 'ic/0', 'Route 2 has no connections'],
    ['^Open$', 'j/0', 'Mt. Moon'],
    ['^Open$', 'l2/1', 'fallback party'],
    ['^Settings', 'h/0'],
    ['^Locations', 'il/0'],
    ['^Encounters', 'r4/0'],
    ['^NPCs', 'npc/0'],
    ['^Scripts', 's1/15'],
    ['^Pokédex', 'q1/0'],
    ['^TMs & HMs', 'p1/0'],
    ['^Progressions', 'q2/0'],
    ['Coming soon', 'toast:Coming soon: not tappable'],
  ],
  'g/2': [
    ['^Create region$', 'f/0'],
    ['^Edit$', 'g/0'],
  ],

  // Settings
  'h/0': [
    ['^Open$', 'h/1', 'New game'],
    ['css:.ps-link-row', 'r4/0', 'Encounter methods'],
  ],
  'h/1': [
    ['Hello there', 'h/2'],
    ['Give ₽3,000', 'h/3'],
    ['Ask for a name', 's1/6'],
    ['Move to Your House', 's1/12'],
    ['Region settings · New game', 'h/0'],
    ['^Add step$', 's1/4'],
    ['Actions for step', 's1/2'],
  ],

  // Encounter methods
  'r4/0': [
    ['^Walk in the grass', 'r4/1'],
    ['^Look around', 'r4/2'],
    ['^Surf', 'r4/3'],
    ['^Good Rod', 'r4/6'],
    ['^(Explore the cave|Old Rod|Super Rod)', 'r4/1'],
    ['^Add method$', 'r4/5'],
  ],
  'r4/1': [['^Outcome$', 'r4/4']],
  'r4/6': [['^Delete method$', 'r4/0']],

  // Region Health and publishing
  'o1/0': [
    ['^Dismissed', 'o1/3'],
    ['^By area$', 'o1/1'],
    ['^Dismiss$', 'o1/2'],
    ['^Fix$', 'ic/0'],
    ['^Open$', 'j/0'],
  ],
  'o1/1': [
    ['^Dismissed', 'o1/3'],
    ['^By severity$', 'o1/0'],
    ['^Dismiss$', 'o1/2'],
    ['^Fix$', 'ic/0'],
    ['^Open$', 'j/0'],
  ],
  'o1/2': [['^Dismiss warning$', 'o1/3']],
  'o1/3': [
    ['^Restore$', 'o1/0'],
    ['^Open \\d', 'o1/0'],
  ],
  'o1/4': [
    ['Review and publish', 'o2/0'],
    ['^Dismissed', 'o1/3'],
  ],
  'o2/0': [
    ['^Publish v8$', 'o2/3'],
    ['Review in Region Health', 'o1/0'],
    ['Add to release notes', NOT_DRAWN],
  ],
  'o2/2': [
    ['Open Region Health', 'o1/0'],
    ['^Publish v8$', 'toast:Fix the 3 errors first'],
  ],
  'o2/3': [
    ['^Publish v8$', 'o2/4'],
    ['Keep editing', 'o2/0'],
    ['Review in Region Health', 'o1/0'],
  ],
  'o2/5': [
    ['Back to builder', 'f/0'],
    ['View region page', 'd/0'],
    ['Open in Discord', 'toast:Opens the region in Discord'],
  ],

  // Locations
  'il/0': [
    ['^Route 1 ', 'il/2'],
    ['^Route 22', 'r3/0'],
    ['^Route 2 ', 'r1/0'],
    ['^Viridian Forest', 'r2/0'],
    ['^Viridian City', 's2/3'],
    ['^Viridian Mart', 's2/0'],
    ['^Pallet Town', 'k3/2'],
    ['^(Pokémon Center|Viridian Gym|Mt. Moon|Route 4 Pond)', 'il/2'],
    ['^Add location$', NOT_DRAWN],
  ],
  'ic/0': [
    ['^Add connection$', 'ic/1'],
    ['Viridian City', 'k3/0'],
    ['^More actions$', 'ic/2'],
  ],
  'ic/2': [['^Delete location$', 'il/0']],
  'j/0': [
    ['^Old Rod$', 'j/1'],
    ['^Surf$', NOT_DRAWN],
    ['^Region default$', 'r4/1'],
    ['^Customize$', 'j/2'],
    ['Add conditional table', 'k3/1'],
    ['^(Pidgey|Rattata|Caterpie|Nidoran|Pikachu) #', 'sc/0'],
  ],
  'j/1': [
    ['^Walk in the grass$', 'j/0'],
    ['^Region default$', 'r4/1'],
    ['Add conditional table', 'k3/1'],
  ],
  'j/2': [
    ['^Events$', 'r3/8'],
    ['Reset to region default', 'j/0'],
    ['Add conditional table', 'k3/1'],
  ],
  'j/3': [
    ['^NPCs$', 'npc/0'],
    ['^Items$', 'r1/0'],
    ['^Events$', 'r3/0'],
    ['^Details$', 'il/2'],
  ],
  'j/4': [['Add grass encounters', 'j/0']],
  'j/5': [['Add Look around', 'r4/2']],
  'r1/0': [
    ['^Hidden item$', 'r1/1'],
    ['^Edit$', 'r1/1'],
    ['Open the table', 'j/0'],
    ['^Customize$', 'j/2'],
    ['^Region default$', 'r4/1'],
    ['^Events$', 'r3/0'],
    ['^NPCs$', 'npc/0'],
  ],
  'r1/1': [['Remove hidden item', 'r1/3']],
  'r1/3': [['^Remove$', 'r1/0']],
  'r1/2': [['Add Look around', 'r4/2']],
  'r2/0': [['Traversal costs', 'r2/1']],
  'r2/1': [
    ['^Edit$', 'r2/2', 'Forest trainers|Grove path'],
    ['^Edit$', 'r2/3', 'Forest walk'],
    ['^Cost$', 'r2/2'],
    ['to (Pewter City|Route 2|Hidden grove)', 'r2/5'],
  ],
  'r2/2': [['^Group$', 'r2/4']],
  'r2/5': [
    ['Edit just this exit', 'r2/2'],
    ['to (Pewter City|Route 2|Hidden grove)', 'r2/1'],
  ],
  'r2/7': [['First time|Every time', 'r2/6']],
  'r3/0': [
    ['^Event$', 'r3/2'],
    ['^Edit$', 'r3/2'],
    ['rival-r22', 'n3/7'],
    ['r22-old-man', 's1/14'],
    ['r22-riddle', 'r3/7'],
  ],
  'r3/1': [
    ['^Event$', 'r3/8'],
    ['^Edit$', 'r3/8'],
    ['snorlax-battle', 'r3/5'],
    ['snorlax-blocks|r12-trader', 's1/0'],
  ],
  'r3/2': [
    ['^Enters this location', 'r3/6'],
    ['Pick another script', 's1/15'],
    ['Create from template', 'n1/1'],
  ],
  'r3/3': [
    ['Pick another script', 's1/15'],
    ['Create from template', 'n1/1'],
  ],
  'r3/4': [
    ['Add an event', 'r3/2'],
    ['Create from template', 'n1/1'],
  ],
  'r3/6': [
    ['^Enters this location', 'r3/2'],
    ['^Leaves this location', 'r3/7'],
    ['^Explores here', 'r3/8'],
    ['Uses an item here', NOT_DRAWN],
  ],
  'r3/7': [
    ['^View$', 's1/0'],
    ['^Leaves this location', 'r3/6'],
  ],
  'r3/8': [
    ['^View$', 'r3/5'],
    ['Open the outcomes', 'j/2'],
    ['^Explores here', 'r3/6'],
  ],
  'k3/0': [
    ['^Edit$', 'k2/0'],
    ['Save connection', 'ic/0'],
  ],
  'k3/1': [
    ['^Edit$', 'k2/0'],
    ['^Edit slots$', 'j/0'],
    ['Add conditional table', 'k2/0'],
  ],
  'k3/2': [
    ['^Edit$', 'k2/0'],
    ['Add a description shown when', 'k2/0'],
  ],

  // NPCs
  'npc/0': [
    ['^\\{name:rival\\}', 'npc/1'],
    ['^Brock', 'n2/8'],
    ['^Bug Catcher Rick', 'npc/2'],
    ['^Rocket Grunt', 'npc/4'],
    ['^Professor Oak', 's2/1'],
    ['^Nurse Joy', 'npc/3'],
    ['^Mom', NOT_DRAWN],
    ['^Add NPC$', 'n1/0'],
  ],
  'npc/1': [
    ['rival-sore|rival-smalltalk', 's1/0'],
    ['Add a Talk script', 's1/14'],
  ],
  'npc/3': [
    ['Make battleable', 'npc/2'],
    ['Use an existing trainer', NOT_DRAWN],
  ],
  'l2/0': [
    ['rival-sore|rival-smalltalk', 's1/0'],
    ['Add a Talk script', 's1/14'],
  ],
  'l2/1': [
    ['^Charmander', 'l2/4'],
    ['^(Pidgeotto|Abra|Rattata|Squirtle|Bulbasaur)', 'l2/4'],
  ],
  'l2/5': [['Open NPC', 'npc/0']],

  // Scripts
  's1/15': [
    ['^Deliver the parcel', 's1/0'],
    ['^Mart clerk', 's2/4'],
    ['^New game', 'h/1'],
    ['^Fishing Guru', 's1/16'],
    ['^Bill’s request', 's1/17'],
    ['^Museum entry', 's1/13'],
    ['^Old man’s tip', 's1/14'],
    ['^New script$', 's1/14'],
  ],
  's1/0': [
    ['^Text · Oak', 's1/5'],
    ['^Take ', 's1/8'],
    ['^Give ', 's1/7'],
    ['^Set flag', 's1/9'],
    ['Actions for step', 's1/2'],
    ['^Add step$', 's1/4'],
    ['^Professor Oak · Talk', 's2/1'],
  ],
  's1/2': [['Actions for step', 's1/0']],
  's1/4': [
    ['^Text', 's1/5'],
    ['^Ask for a name', 's1/6'],
    ['^Give', 's1/7'],
    ['^Take', 's1/8'],
    ['^Set', 's1/9'],
    ['^Battle a trainer', 's1/10'],
    ['^Heal', 's1/11'],
    ['^Move the player', 's1/12'],
  ],
  's1/13': [['Pewter Museum · Enters', 'r3/4']],
  's1/14': [
    ['Add the first step', 's1/4'],
    ['Route 22 · Enters', 'r3/0'],
  ],
  's1/16': [
    ['Edit as form', 'n4/5'],
    ['Fishing Guru · Talk', 'n4/6'],
  ],
  's2/0': [
    ['mart-parcel', 's2/4'],
    ['^Edit$', 'r3/2'],
  ],
  's2/1': [
    ['oak-deliver-parcel', 's2/5'],
    ['oak-usual', 's2/6'],
    ['Add a Talk script', 's1/14'],
  ],
  's2/2': [
    ['r2-guard', 's2/7'],
    ['Add a Talk script', 's1/14'],
  ],
  's2/3': [
    ['r2-gate-blocked', 's2/8'],
    ['^Save$', 'back'],
  ],
  's2/4': [
    ['Viridian Mart · Enters', 's2/0'],
    ['^Add step$', 's1/4'],
  ],
  's2/5': [
    ['Professor Oak · Talk', 's2/1'],
    ['^Add step$', 's1/4'],
    ['^Text · Oak', 's1/5'],
    ['^Take ', 's1/8'],
    ['^Give ', 's1/7'],
    ['^Set flag', 's1/9'],
  ],
  's2/6': [
    ['Professor Oak · Talk', 's2/1'],
    ['^Add step$', 's1/4'],
  ],
  's2/7': [
    ['Route 2 guard · Talk', 's2/2'],
    ['^Add step$', 's1/4'],
  ],
  's2/8': [
    ['Viridian City · North exit', 's2/3'],
    ['^Add step$', 's1/4'],
  ],

  // Templates
  'n1/0': [
    ['^From a template', 'n1/1'],
    ['^Blank NPC', NOT_DRAWN],
  ],
  'n1/1': [
    ['^Starter Gift', 'n5/0'],
    ['^Gym Leader', 'n2/0'],
    ['^Gift NPC', 'n4/0'],
    ['^Forced Encounter', 'n3/0'],
    ['^Route Trainer', NOT_DRAWN],
  ],
  'n2/2': [['^New badge$', 'n2/4']],
  'n2/3': [['^Create Badges', 'n2/4']],
  'n2/4': [['Create and use', 'n2/2']],
  'n2/7': [
    ['^Edit$', 'n2/0', 'Leader'],
    ['^Edit$', 'n2/1', 'Team'],
    ['^Edit$', 'n2/2', 'Reward'],
    ['^Edit$', 'n2/5', 'Text'],
    ['^Edit$', 'n2/6', 'trainers'],
    ['Create gym leader', 'n2/8'],
  ],
  'n2/8': [
    ['^Edit steps$', 'n2/9'],
    ['^Edit as form$', 'n2/7'],
    ['brock-gym', 'n2/7'],
    ['Add a Talk script', 's1/14'],
  ],
  'n2/9': [
    ['Keep the form', 'n2/8'],
    ['^Edit steps$', 's1/0'],
  ],
  'n3/0': [['^Enters Route 22$', 'n3/1']],
  'n3/1': [['^(Enters|Leaves|Explores) Route 22 ', 'n3/0']],
  'n3/6': [
    ['^Edit$', 'n3/0', 'Where'],
    ['^Edit$', 'n3/2', 'Who'],
    ['^Edit$', 'n3/3', 'When'],
    ['^Edit$', 'n3/4', 'Battle'],
    ['^Edit$', 'n3/5', 'Text'],
    ['Create encounter', 'n3/7'],
  ],
  'n3/7': [
    ['rival-r22', 'n3/6'],
    ['^Edit$', 'r3/2'],
    ['^Event$', 'r3/2'],
  ],
  'n4/1': [['^A Pokémon$', 'n4/2']],
  'n4/2': [
    ['^Items$', 'n4/1'],
    ['Species info', 'si/0'],
  ],
  'n4/5': [
    ['^Edit$', 'n4/0', 'Who'],
    ['^Edit$', 'n4/1', 'Gift'],
    ['^Edit$', 'n4/3', 'When'],
    ['^Edit$', 'n4/4', 'Text'],
    ['Create gift NPC', 'n4/6'],
  ],
  'n4/6': [
    ['fishing-guru-gift', 's1/16'],
    ['Add a Talk script', 's1/14'],
  ],
  'n5/5': [
    ['^Edit$', 'n5/0', 'Who and where'],
    ['^Edit$', 'n5/1', 'Options'],
    ['^Edit$', 'n5/2', 'The rival’s pick'],
    ['^Edit$', 'n5/3', 'Remember'],
    ['^Edit$', 'n5/4', 'Text'],
    ['Create starter gift', 'n5/6'],
  ],
  'n5/6': [
    ['oak-starter', 'n5/5'],
    ['oak-deliver-parcel', 's2/5'],
    ['oak-usual', 's2/6'],
    ['Add a Talk script', 's1/14'],
  ],

  // Content
  'q1/0': [
    ['^#052 Meowth', 'q1/1'],
    ['^Add a range$', 'q1/2'],
    ['^Add slot$', NOT_DRAWN],
  ],
  'q1/1': [
    ['View species info|Species info: Meowth', 'si/0'],
    ['Species info', 'si/0'],
    ['Swap species', 'si/1'],
  ],
  'qp/0': [
    ['^Slots$', 'q1/0'],
    ['Preview as a player', 'rp/0'],
  ],
  'qp/1': [['^Slots$', 'q1/0']],
  'p1/0': [
    ['Add TM or HM', 'p1/2'],
    ['^Assign a move$', 'p1/2'],
    ['Set by your region', 'h/0'],
    ['Show all', NOT_DRAWN],
  ],
  'p1/3': [
    ['Fill from Gen 1 defaults', 'p1/0'],
    ['^Add one$', 'p1/2'],
  ],
  'q2/0': [
    ['^Badges', 'q2/1'],
    ['^Rocket hideout', 'q2/2'],
    ['^(Has a Pokédex|Ferry stamps)', 'q2/1'],
    ['^New progression$', 'q2/3'],
  ],
  'q2/3': [['^Create$', 'q2/1']],

  // Components
  'sc/0': [
    ['^(Caterpie|Pidgey|Pidgeotto|Pidgeot|Pikachu|Vulpix|Pinsir) #', 'back'],
    ['Species info', 'si/0'],
  ],
  'si/0': [
    ['Select Meowth', 'q1/1'],
    ['Add Persian', 'q1/0'],
  ],
  'si/1': [
    ['^Meowth #', 'q1/1'],
    ['Species info', 'si/0'],
  ],

  // Desktop
  'il/3': [['^Route 1', 'il/3']],
  'npc/5': [
    ['^Party', 'l2/6'],
    ['^Battle', 'npc/5'],
    ['^Add$', 'n1/2', 'NPCs · \\d+'],
  ],
  'l2/6': [
    ['^Battle', 'npc/5'],
    ['^Add$', 'n1/2', 'NPCs · \\d+'],
  ],
  's1/18': [
    ['^Deliver the parcel', 's1/19'],
    ['^New script$', 's1/19'],
  ],
  'n1/2': [
    ['^Starter Gift', 'n5/7'],
    ['^Gym Leader', 'n2/10'],
    ['^Gift NPC', 'n4/7'],
    ['^Forced Encounter', 'n3/8'],
  ],
  'q1/3': [['Species info|View species info', 'si/2']],
  'f/2': [
    ['^Open settings$', 'h/4'],
    ['^Open locations$', 'il/3'],
    ['^Open encounters$', 'r4/7'],
    ['^Open npcs$', 'npc/5'],
    ['^Open scripts$', 's1/18'],
    ['^Open pokédex$', 'q1/3'],
    ['^Open tms & hms$', 'p1/4'],
    ['^Open progressions$', 'q2/4'],
    ['Open Region Health', 'o1/5'],
    ['^Open$', 'ic/3'],
  ],
  'o1/5': [['Review and publish', 'o2/6']],
};

// Wizard step order. Alternate states map onto the step they belong to.
var WIZ = {
  g: [0, 1, 2],
  n2: [0, 1, 2, 5, 6, 7],
  n3: [0, 2, 3, 4, 5, 6],
  n4: [0, 1, 3, 4, 5],
  n5: [0, 1, 2, 3, 4, 5],
};
var WIZ_ALT = { 'n2/3': 2, 'n2/4': 2, 'n3/1': 0, 'n4/2': 1 };

// Where Back goes when there's no history (e.g. you jumped in from the sidebar).
var UP = {
  a: 'a/0',
  b: 'a/0',
  c: 'b/0',
  d: 'c/1',
  e: 'a/0',
  g: 'c/1',
  f: 'd/0',
  h: 'f/0',
  r4: 'h/0',
  o1: 'f/0',
  o2: 'f/0',
  il: 'f/0',
  ic: 'il/0',
  j: 'il/0',
  r1: 'il/0',
  r2: 'il/0',
  r3: 'il/0',
  k3: 'il/0',
  st: 'il/0',
  k2: 'ic/0',
  npc: 'f/0',
  l2: 'npc/0',
  s1: 's1/15',
  s2: 's1/15',
  n1: 'npc/0',
  n2: 'n1/1',
  n3: 'n1/1',
  n4: 'n1/1',
  n5: 'n1/1',
  q1: 'f/0',
  qp: 'q1/0',
  p1: 'f/0',
  q2: 'f/0',
  rp: 'qp/0',
  sp: 'rp/1',
  si: 'q1/1',
  sc: 'j/0',
};
var UP_FRAME = {
  'l2/4': 'l2/1',
  'npc/1': 'npc/0',
  'npc/2': 'npc/0',
  'npc/3': 'npc/0',
  'npc/4': 'npc/0',
  'q2/1': 'q2/0',
  'q2/2': 'q2/0',
  'r4/1': 'r4/0',
  'r4/2': 'r4/0',
  'r4/3': 'r4/0',
  'r4/6': 'r4/0',
  'r2/2': 'r2/1',
  'r2/3': 'r2/1',
  'r2/4': 'r2/1',
  'r2/5': 'r2/1',
  'r2/6': 'r2/7',
  's1/2': 's1/0',
  's1/3': 's1/0',
  's1/4': 's1/0',
  's1/5': 's1/0',
  's1/7': 's1/0',
  's1/8': 's1/0',
  's1/9': 's1/0',
  's1/10': 's1/0',
  's1/11': 's1/0',
  's1/6': 'h/1',
  's1/12': 'h/1',
  's1/0': 's1/15',
  'h/2': 'h/1',
  'h/3': 'h/1',
  'h/1': 'h/0',
  'r3/2': 'r3/0',
  'r3/3': 'r3/0',
  'r3/6': 'r3/0',
  'r3/7': 'r3/0',
  'r3/8': 'r3/1',
  'r3/5': 'r3/1',
  'o1/2': 'o1/0',
  'o2/3': 'o2/0',
  'o2/4': 'o2/0',
  'o2/5': 'f/0',
  'ic/1': 'ic/0',
  'ic/2': 'ic/0',
  'r1/1': 'r1/0',
  'r1/3': 'r1/0',
  'q1/1': 'q1/0',
  'q1/2': 'q1/0',
  'p1/1': 'p1/0',
  'p1/2': 'p1/0',
  'q2/3': 'q2/0',
  'r4/5': 'r4/0',
  'n2/9': 'n2/8',
  'n1/1': 'n1/0',
  'rp/1': 'rp/0',
  'rp/2': 'rp/0',
  'k3/0': 'ic/0',
  'k3/1': 'j/0',
  'k3/2': 'il/0',
  's2/4': 's2/0',
  's2/5': 's2/1',
  's2/6': 's2/1',
  's2/7': 's2/2',
  's2/8': 's2/3',
  'k2/0': 'k3/0',
  'k2/2': 'k3/0',
  'si/0': 'q1/1',
  'si/1': 'q1/1',
  'n4/2': 'n4/1',
  'j/1': 'j/0',
  'j/2': 'j/0',
};

// Location and NPC detail tabs: which frame shows that tab for that location or NPC.
var LOC_TABS = {
  _: { Details: 'il/2', Connections: 'ic/0', Explore: 'j/0', Events: 'r3/0' },
  'Route 12': { Explore: 'j/2', Events: 'r3/1' },
  'Route 2': { Explore: 'r1/0' },
  'Route 3': { Explore: 'j/4' },
  'Viridian Forest': { Details: 'r2/0', Connections: 'r2/7' },
  'Viridian City': { Connections: 's2/3' },
  'Viridian Mart': { Events: 's2/0' },
  'Pallet Town': { Details: 'k3/2' },
  'Pewter Museum': { Explore: 'j/5', Events: 'r3/4' },
  'Pewter City': { Explore: 'r1/2' },
};
var NPC_TABS = {
  '{name:rival}': {
    Person: 'l2/0',
    Battle: 'l2/3',
    Party: 'l2/1',
    Lines: 'l2/5',
  },
  Brock: { Person: 'n2/8' },
  'Professor Oak': { Person: 's2/1' },
  'Nurse Joy': { Battle: 'npc/3' },
  'Rocket Grunt': { Person: 'npc/4' },
  'Route 2 guard': { Person: 's2/2' },
  'Fishing Guru': { Person: 'n4/6' },
};
var DESK_TABS = {
  Details: 'il/3',
  Connections: 'ic/3',
  Explore: 'j/6',
  Events: 'r3/9',
};

// Desktop sidebar.
var DESK_NAV = [
  ['^Overview', 'f/2'],
  ['^Region Health', 'o1/5'],
  ['^Settings', 'h/4'],
  ['^Locations', 'il/3'],
  ['^Encounters', 'r4/7'],
  ['^NPCs', 'npc/5'],
  ['^Scripts', 's1/18'],
  ['^Pokédex', 'q1/3'],
  ['^TMs & HMs', 'p1/4'],
  ['^Progressions', 'q2/4'],
];

// Rules that apply everywhere, after the frame's own.
var GLOBAL = [
  ['^Back$', 'back'],
  ['^Continue$', 'next'],
  ['^(Close|Cancel)$', 'back'],
  ['^More actions$', 'toast:The menu isn’t drawn in the mockups'],
  ['^Publish$', 'o2/0'],
];
// Inside a sheet or dialog, these finish the sheet and go back to what's underneath.
var SHEET_DONE =
  '^(Save.*|Done|Add|Add (TM|hidden item|\\d+ species).*|Create|Create and use|Remove|Delete.*|Dismiss warning|Keep.*)$';
