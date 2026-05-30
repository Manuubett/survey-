/**
 * ECS-2026 · Embu County Polling Stations + Candidate Data
 * ──────────────────────────────────────────────────────────
 * Source: IEBC Embu County Register of Polling Stations
 * Total : 705 polling stations across 20 wards / 4 constituencies
 *
 * Exposes four globals used by the main survey:
 *   window.ECS_POLLING_STATIONS   — ward  → string[]  (polling station names)
 *   window.ECS_WARD_CONSTITUENCY  — ward  → string    (parent constituency)
 *   window.ECS_MP_CANDIDATES      — const → string[]  (MP candidate names)
 *   window.ECS_MCA_CANDIDATES     — ward  → string[]  (MCA candidate names)
 *
 * NOTE: window.loadPollingStations is intentionally NOT defined here.
 *       The main survey HTML defines its own live-search widget version.
 *       This file is pure data — no DOM manipulation.
 *
 * To update: edit the arrays/objects below and redeploy this file only.
 * The main survey HTML does NOT need to change.
 */

/* ══════════════════════════════════════════════════════════════
   1.  POLLING STATIONS  (keyed by ward name)
       Source: IEBC Embu County Register of Polling Stations
   ══════════════════════════════════════════════════════════════ */

window.ECS_POLLING_STATIONS = {

  /* ── MANYATTA CONSTITUENCY  (6 wards) ── */

  "Ruguru/Ngandori": [
    "GACIIGI TEA BUYING CENTRE",
    "GAKUNDU COFFEE FACTORY",
    "GAKUNDU COFFEE FACTORY OFFICES",
    "GICHAGO COFFEE FACTORY",
    "GICHUGU COFFEE FACTORY",
    "GISHA TEA BUYING CENTRE",
    "KAIRURI PRIMARY SCHOOL",
    "KAMVIU PRIMARY SCHOOL",
    "KARURIRI PRIMARY SCHOOL",
    "KITHUNDIRI TEA BUYING CENTRE",
    "KENGA PRIMARY SCHOOL",
    "KERIA TEA BUYING CENTRE",
    "KIAMIATU TEA BUYING CENTRE",
    "KIANGAI TEA BUYING CENTRE",
    "KIANGOCI PRIMARY SCHOOL",
    "KIARAGANA TEA BUYING CENTRE",
    "KIGARI PRIMARY SCHOOL",
    "KIINI TEA BUYING CENTRE",
    "KIRIARI PRIMARY SCHOOL",
    "KIRIGI PRIMARY SCHOOL",
    "KITHUNGURIRI PRIMARY SCHOOL",
    "KIVANGUA COFFEE FACTORY",
    "MANYATTA TEA BUYING CENTRE",
    "MUKANGU PRIMARY SCHOOL",
    "NGIMARI PRIMARY SCHOOL",
    "RWERE TEA BUYING CENTRE",
    "KAMVIU COFFEE FACTORY",
    "KIANJUGU TEA BUYING CENTRE",
    "KITHUNGURIRI TEA BUYING CENTRE",
    "ST.MARKS KIGARI TEACHERS COLLEGE",
    "KANORORI POLYTECHNIC",
    "KIRIARI DAY SECONDARY SCHOOL",
    "MANYATTA OPEN AIR MARKET",
    "KITHUNGURURU FARMERS COOPERATI",
    "ACK CHURCH GROUNDS - KAVURURUK"
  ],

  "Kithimu": [
    "ITHANGAWE PRIMARY SCHOOL",
    "KAMUTHATHA PRIMARY SCHOOL",
    "KIANDUNDU PRIMARY SCHOOL",
    "KITHEGI COFFEE FACTORY",
    "KITHEGI PRIMARY SCHOOL",
    "KITHIMU PRIMARY SCHOOL",
    "MINAI COFFEE FACTORY",
    "RUKIRA PRIMARY SCHOOL",
    "ST. ANDREWS PRIMARY SCHOOL",
    "ST. JOSEPH ALLAMANO PRIMARY SCHO",
    "ACK CHURCH GROUNDS-KITHIMU MAR",
    "FULL GOSPEL CHURCH GROUND-KIAND",
    "IGUMO CATHOLIC CHURCH GROUNDS",
    "KIMANGARU OPEN GROUNDS-KWA MU",
    "KIANDUNDU CATHOLIC CHURCH GRO",
    "KITHEGI DAY SECONDARY SCHOOL",
    "MVANGUA-KANINDI POND",
    "NDATU CATHOLIC CHURCH GROUNDS",
    "RUKIRA DAY SECONDARY SCHOOL",
    "ST. BENEDICTS DAY SECONDARY SCHOO",
    "NEW APOSTOLIC CHURCH - KWA AMO"
  ],

  "Nginda": [
    "GACHURIRI TEA BUYING CENTRE",
    "GATI-IGURU TEA BUYING CENTRE",
    "GATWE PRIMARY SCHOOL",
    "GICHERORI PRIMARY SCHOOL",
    "GIKIRIMA COFFEE FACTORY",
    "KAGUMORI PRIMARY SCHOOL",
    "KARAU PRIMARY SCHOOL",
    "KATHUNIRI PRIMARY SCHOOL",
    "KIAMBOGO TEA BUYING CENTRE",
    "KIANGOCI TEA BUYING CENTRE",
    "KIBUGU PRIMARY SCHOOL",
    "MBUVORI PRIMARY SCHOOL",
    "MUGURUMARI TEA BUYING CENTRE",
    "MUKONGORO TEA BUYING CENTRE",
    "MURAMUKI COFFEE FACTORY",
    "MUTHIGI TEA COLLECTING CENTRE",
    "MUVANDORI PRIMARY SCHOOL",
    "NDUGARARA TEA BUYING CENTRE",
    "NDUNDURI TEA BUYING CENTRE",
    "NGERWE COFFEE FACTORY",
    "RUGUMU PRIMARY SCHOOL",
    "ST. FRANCIS PRIMARY SCHOOL",
    "ST. HELLEN KARIMARI PRIMARY SCHOO",
    "ST.JOHN KARUMIRI PRIMARY SCHOOL",
    "ST. JOSEPH NDUNDA PRIMARY SCHOOL",
    "MBUVORI TEA BUYING CENTRE",
    "KIBUGU TEA BUYING CENTRE",
    "KIANGUCU TEA BUYING CENTRE",
    "KIANDOME TEA BUYING CENTRE",
    "KAUGURI TEA BUYING CENTRE",
    "KAUGA TEA BUYING CENTRE",
    "MWIRIA COFFEE FACTORY"
  ],

  "Mbeti North": [
    "DEB IVECHE PRIMARY SCHOOL",
    "ITABUA PRIMARY SCHOOL",
    "KAMBO MARKET",
    "KAMIU PRIMARY SCHOOL",
    "KANJIKERU COFFEE FACTORY",
    "KIANGIMA PRIMARY SCHOOL",
    "KIMANGARU PRIMARY SCHOOL",
    "MUNICIPAL SLAUGHTER HOUSE",
    "MUTHATARI COFFEE FACTORY",
    "ST.PETER'S GATITURI PRIMARY SCHOOL",
    "WATER PROJECT OFFICES",
    "AFRICAN INLAND PENTECOSTAL CHUR",
    "CATHOLIC CHURCH GROUNDS -GICEGE",
    "DISTRICT PUBLIC WORKS MAJIMBO",
    "GATUNDURI PRIMARY SCHOOL",
    "PCEA SUNRISE OFFICES",
    "ST. PAUL'S GAKINDURIRI PRIMARY SCHO",
    "SOLID ROCK CHURCH GROUNDS - KAR",
    "AIPCA CHURCH GROUND - MAJIMBO M",
    "KAGUMORI DISPENSARY - DON BOSCO",
    "CATHOLIC CATHEDRAL GROUNDS - MU"
  ],

  "Kirimari": [
    "ASK SHOW GROUND- NJUKIRI",
    "D.E.B KANGARU PRIMARY SCHOOL",
    "D.E.B NJUKIRI PRIMARY SCHOOL",
    "ST. MICHAEL PRIMARY SCHOOL",
    "PLAN SOCIAL HALL-DALLAS",
    "NTHAMBO PRIMARY SCHOOL",
    "KITHUNGURURU COFFEE FACTORY",
    "KATHANGARI NURSERY SCHOOL",
    "KAPINGAZI COFFEE FACTORY",
    "KANGARU BOYS SECONDARY SCHOOL",
    "GITURI PRIMARY SCHOOL",
    "GATOORI PRIMARY SCHOOL",
    "EMBU URBAN PRIMARY SCHOOL",
    "EMBU MUNICIPAL SOCIAL HALL",
    "EMBU MUNICIPAL COUNCIL STADIUM",
    "EMBU COUNTY PRIMARY SCHOOL",
    "DISTRICT REGISTRAR OF PERSONS GRO",
    "EMBU COUNTY COUNCIL CHAMBERS",
    "EMBU COUNTY DAY SECONDARY SCHO",
    "EMBU CULTURAL CENTRE",
    "EMBU MUNICIPAL COUNCIL TOWN HA",
    "JAMIA BRIGHT STAR ACADEMY",
    "GATOORI DAY SECONDARY SCHOOL",
    "KIRIMARI BOYS SECONDARY SCHOOL",
    "A.C.K CHURCH GROUNDS - GITURI",
    "MOSQUE GROUNDS - DALLAS",
    "JUA KALI OFFICES GROUNDS - SEWAGE",
    "ST. ANDREWS A.C.K - OLD STADIUM",
    "MIKIMBI FULL GOSPEL CHURCHES GRO",
    "FULL GOSPEL CHURCH GROUND-NJUKI",
    "TEACHERS ADVISORY CENTRE HALL - M"
  ],

  "Gaturi South": [
    "IGUMO PRIMARY SCHOOL",
    "KIHUMBU PRIMARY SCHOOL",
    "MBUKORE PRIMARY SCHOOL",
    "NEMBURE POLYTECHNIC",
    "NEMBURE PRIMARY SCHOOL",
    "NJAGAIRI COFFEE FACTORY",
    "RUNG'ANG'A PRIMARY SCHOOL",
    "TENDE PRIMARY SCHOOL",
    "ACK MUCHONOKE CHURCH GROUNDS",
    "FAITHFULL CHURCH OF CHRIST-MAKU",
    "FAMILY WORSHIP CHURCH GROUND -K",
    "FULL GOSPEL CHURCH GROUND-GICEG",
    "KAGUMORI CATHOLIC CHURCH",
    "KWA DOUGLAS BUS STAGE",
    "KYETHERU CATHOLIC CHURCH GROUN",
    "MIRUNDI COFFEE FACTORY",
    "NEMBURE SOCIAL HALL",
    "FULL GOSPEL CHURCHES GROUNDS  - N",
    "FULL GOSPEL CHURCHES GROUNDS  - K",
    "LIVING SAINTS CHURCH GROUNDS - KI",
    "FULL GOSPEL CHURCHES  GROUNDS - G"
  ],

  /* ── RUNYENJES CONSTITUENCY  (6 wards) ── */

  "Gaturi North": [
    "MURANG'A TEA BUYING CENTRE",
    "KIANJOKOMA PRIMARY SCHOOL",
    "NGURUERI COFFEE FACTORY",
    "KAMUGERE TEA BUYING CENTRE",
    "NGUIRE PRIMARY SCHOOL",
    "MAKENGI HEALTH CENTRE",
    "KIRURUMWE COFFEE FACTORY",
    "ST. JOSEPH PRIMARY SCHOOL",
    "KARUE PRIMARY SCHOOL",
    "NGAINDEITHYA COFFEE FACTORY",
    "KEVOTE PRIMARY SCHOOL",
    "KERURI PRIMARY SCHOOL",
    "KARITIRI COFFEE FACTORY",
    "KIANJUKI PRIMARY SCHOOL",
    "MUCHAGORI PRIMARY SCHOOL",
    "KAVUTIRI PRIMARY SCHOOL",
    "KAVARI TEA BUYING CENTRE",
    "GICHUGU PRIMARY SCHOOL",
    "RUVUTIRI TEA BUYING CENTRE",
    "MANYATTA PRIMARY SCHOOL",
    "KITHANGARI TEA BUYING CENTRE",
    "KIBOGI TEA BUYING CENTRE",
    "GATURA TEA BUYING CENTRE",
    "GATURUMBARI TEA BUYING CENTRE",
    "GAIKIRO TEA BUYING CENTRE"
  ],

  "Kagaari South": [
    "GICHERA PRIMARY SCHOOL",
    "MATURURI N.I.C.A PRIMARY SCHOOL",
    "KATHAMBAICONI PRIMARY SCHOOL",
    "KAVURU PRIMARY SCHOOL",
    "NDUMARI PRIMARY SCHOOL",
    "KANGONDI PRIMARY SCHOOL",
    "KANDURI PRIMARY SCHOOL",
    "MACUMO PRIMARY SCHOOL",
    "UGWERI PRIMARY SCHOOL",
    "ENA PRIMARY SCHOOL",
    "KITHUNGUTHIA PRIMARY SCHOOL",
    "NGENIARI PRIMARY SCHOOL",
    "KATHUGU PRIMARY SCHOOL",
    "NTHAGAIYA PRIMARY SCHOOL",
    "HAMI ACADEMY"
  ],

  "Kagaari North": [
    "NDUURI PRIMARY SCHOOL",
    "KANJA PRIMARY SCHOOL",
    "GICEGENI TEA BUYING CENTRE",
    "MUNYUTU PRIMARY SCHOOL",
    "SOWETO TEA BUYING CENTRE",
    "NDAMUNGE TEA BUYING CENTRE",
    "MURAGARI PRIMARY SCHOOL",
    "KIRIMIRI COFFEE FACTORY",
    "GAIKAMA TEA BUYING CENTRE",
    "THIGINGI PRIMARY SCHOOL",
    "MBUINJERU PRIMARY SCHOOL",
    "MUGUI PRIMARY SCHOOL",
    "KARARITIRI TEA BUYING CENTRE",
    "IRANGI PRIMARY SCHOOL",
    "KAIRANGU TEA BUYING CENTRE",
    "ST. THOMAS PRIMARY SCHOOL KAMUG",
    "KATHANDE PRIMARY SCHOOL",
    "MACIARA TEA BUYING CENTRE",
    "MUGAARI TEA BUYING CENTRE",
    "KITHIRURI TEA BUYING CENTRE",
    "KANYAVYERI TEA BUYING CENTR",
    "MIANDARI TEA BUYING CENTRE",
    "KIANGUNGI TEA BUYING CENTRE",
    "KIAMUCERU TEA BUYING CENTRE",
    "KIANDONG'O TEA BUYING CENTRE"
  ],

  "Central Ward": [
    "KAGAARI PRIMARY SCHOOL",
    "MWENENDEGA PRIMARY SCHOOL",
    "KIARIMUI PRIMARY SCHOOL",
    "GICHICHE PRIMARY SCHOOL",
    "GIKUURI PRIMARY SCHOOL",
    "NGARARI PRIMARY SCHOOL",
    "ITHEMUTIKI COFFEE FACTORY",
    "KIGAA PRIMARY SCHOOL",
    "GATINDA PRIMARY SCHOOL",
    "GITARE PRIMARY SCHOOL",
    "KIVIUVI COFFEE FACTORY",
    "KATHURIRI PRIMARY SCHOOL",
    "MOI HIGH SCHOOL MBIRURI",
    "KANG'ONDU COFFEE FACTORY",
    "RUNYENJES MUNICIPAL HALL"
  ],

  "Kyeni North": [
    "KATHARI PRIMARY SCHOOL",
    "KYENI GIRLS SECONDARY SCHOOL",
    "MUGANJUKI PRIMARY SCHOOL",
    "KIARAGANA PRIMARY SCHOOL",
    "KIVURIA PRIMARY SCHOOL",
    "KATHAGERI YOUTH POLYTECHNIC",
    "NJERURI PRIMARY SCHOOL",
    "MUFU PRIMARY SCHOOL",
    "KIANGUNGI PRIMARY SCHOOL",
    "GATUMBI PRIMARY SCHOOL",
    "IRIARI PRIMARY SCHOOL",
    "KITHARE PRIMARY SCHOOL",
    "RUKURIRI PRIMARY SCHOOL"
  ],

  "Kyeni South": [
    "CIAMANDA PRIMARY SCHOOL",
    "KIGUMO BOARDING PRIMARY SCHOOL",
    "MAGACHA PRIMARY SCHOOL",
    "MUKURIA PRIMARY SCHOOL",
    "GAKWEGORI PRIMARY SCHOOL",
    "SA KYENI PRIMARY SCHOOL",
    "NEW KYENI FARMERS HALL",
    "KARUNGU PRIMARY SCHOOL",
    "KATHUGU COFFEE FACTORY",
    "KIAMBOA PRIMARY SCHOOL",
    "KATHUNGURI PRIMARY SCHOOL",
    "KATHUNGURI YOUTH POLYTECHNIC",
    "KARIRU PRIMARY SCHOOL",
    "CANON HEBERT PRIMARY SCHOOL",
    "KAVETI PRIMARY SCHOOL",
    "KARURUMO YOUTH POLYTECHNIC",
    "KASAFARI PRIMARY SCHOOL",
    "KANDETE PRIMARY SCHOOL",
    "KARURUMO PRIMARY SCHOOL",
    "KINTHITHE PRIMARY SCHOOL",
    "KATHANJURE PRIMARY SCHOOL",
    "KARAGO PRIMARY SCHOOL",
    "NYAGARI PRIMARY SCHOOL",
    "MIKUNDU COFFEE FACTORY"
  ],

  /* ── MBEERE SOUTH CONSTITUENCY  (5 wards) ── */

  "Mwea": [
    "IRIA-ITUNE PRIMARY SHOOL",
    "KAMWELI PRIMARY SCHOOL",
    "KIKUMINI PRIMARY SCHOOL",
    "MAKUTANO PRIMARY SCHOOL",
    "KARABA PRIMARY SCHOOL",
    "GITARAKA PRIMARY SCHOOL",
    "WANGO DAY PRIMARY SCHOOL",
    "MAVIANI PRIMARY SCHOOL.",
    "GATEGI PRIMARY SCHOOL",
    "KAMWIYENDEI PRIMARY SCHOOL",
    "KATHIANI PRIMARY SCHOOL.",
    "KOMA PRIMARYSCHOOL.",
    "NTHINGINI PRIMARY SCHOOL.",
    "MALIKINI PRIMARY SCHOOL.",
    "KILIA CONSOLATA PRIMARY SCHOOL.",
    "RIAKANAU PRIMARY SCHOOL",
    "KARUKU PRIMARY SCHOOL",
    "MAKAWANI PRIMARY SCHOOL",
    "NGOMOLA PRIMARY SCHOOL",
    "KASEVENI PRIMARY SCHOOL",
    "KASEVE PRIMARY SCHOOL",
    "WAKALIA PRIMARY SCHOOL",
    "KARABA CONSOLATA PRIMARY SCHOO",
    "MAALI ACK PRIMARY SCHOOL",
    "MUSINGINI PRIMARY SCHOOL",
    "RIAKANAU MARKET",
    "KAKINDU PRIMARY SCHOOL",
    "UNYUANI  PRIMARY SCHOOL",
    "WACHORO DISPENSARY",
    "KASIONI ECDE"
  ],

  "Makima": [
    "KANYONGA PRIMARY SCHOOL",
    "MASHAMBA PRIMARY SCHOOL",
    "KAMUNYAGIA PRIMARY SCHOOL",
    "NGECA PRIMARY SCHOOL",
    "KITOLOLONI PRIMARY SCHOOL",
    "NAMURI PRIMARY SCHOOL",
    "MAKIMA PRIMARY SCHOOL",
    "MBONDONI PRIMARY  SCHOOL",
    "NJERU PRIMARY SCHOOL",
    "NDUNGUNI PRIMARY SCHOOL",
    "GATUANYAGA PRIMARY SCHOOL",
    "GIKURU PRIMARY SCHOOL",
    "MULUKUSI PRIMARY SCHOOL",
    "KAKAWA PRIMARY SCHOOL",
    "MUTHIRU PRIMARY SCHOOL",
    "KALISA PRIMARY SCHOOL",
    "MBURUTANI PRIMARY SCHOOL",
    "NDUNE PRIMARY SCHOOL",
    "MWANYANI PRIMARY SCHOOL",
    "MWANZO MARKET",
    "IRARI PRIMARY SCHOOL",
    "URUA PRIMARY SCHOOL",
    "MWEA PRIMARY SCHOOL",
    "MANYATI PRIMARY SCHOOL",
    "MUTHITHU PRIMARY SCHOOL",
    "UNGUNI PRIMARY SCHOOL",
    "MATHAUTA PLAY GROUND"
  ],

  "Mbeti South": [
    "KIAMURINGA PRIMARY SCHOOL",
    "NGANGARI PRIMARY SCHOOL",
    "ST. LUKES PRIMARY SCHOOL",
    "RWIKA TECHNICAL INSTITUTE",
    "MURARU PRIMARY SCHOOL",
    "J.J.M. NYAGA PRIMARY SCHOOL",
    "KANINWANTHIGA PRIMARY SCHOOL",
    "KANGETA PRIMARY SCHOOL",
    "YONDER KARWIGI PRIMARY SCHOOL",
    "RIANJERU PRIMARY SCHOOL",
    "ST. JOSEPH GACHURIRI PRIMARY SCHO",
    "MBITA PRIMARY SCHOOL",
    "MINURI PRIMARY SCHOOL",
    "KABURURI PRIMARY SCHOOL",
    "NGANDURI PRIMARY SCHOOL",
    "KAMUNYANGE PRIMARY SCHOOL",
    "MUNYORI PRIMARY SCHOOL",
    "KAWERU PRIMARY SCHOOL",
    "KANYARIRI PRIMARY SCHOOL",
    "NGENGE PRIMARY SCHOOL",
    "KANGUNGI PRIMARY SCHOOL",
    "MUTUGU PRIMARY SCHOOL",
    "RUGAKORI PRIMARY SCHOOL",
    "KIAMETHO PRIMARY SCHOOL",
    "J.N. MWONGE PRIMARY SCHOOL",
    "RWETHE PRIMARY SCHOOL",
    "KAMWIMBI PRIMARYSCHOOL",
    "RIANGUU PRIMARY SCHOOL",
    "A.I.C. GACHURIRI PRIMARY SCHOOL",
    "GACHOKA MARKET"
  ],

  "Mavuria": [
    "GIKIIRO PRIMARY SCHOOL",
    "MUTUS PRIMARY SCHOOL",
    "UMAU SHOPPING CENTRE",
    "RUGOGWE PRIMARY SCHOOL",
    "GATAKA PRIMARY SCHOOL",
    "GATIRARI PRIMARY SCHOOL",
    "KIRATHE PRIMARY SCHOOL",
    "IRABARI PRIMARY SCHOOL",
    "MAYORI PRIMRY SCHOOL",
    "NGIORI PRIMARY SCHOOL",
    "MACHANG'A PRIMARY SCHOOL",
    "KIAMUKUYU PRIMARY SCHOOL",
    "KATHURI PRIMARY SCHOOL",
    "KARUKI PRIMARY SCHOOL",
    "IGUMORI PRIMARY SCHOOL",
    "KABUGURI PRIMARY SCHOOL",
    "KARUIRO PRIMARY SCHOOL",
    "KAMUKUNGA PRIMARY SCHOOL",
    "KANOTHI PRIMARY SCHOOL",
    "KERWA PRIMARY SCHOOL",
    "IRIAMURAI PRIMARY SCHOOL",
    "GATURURI PRIMARY SCHOOL",
    "KAURARI PRIMARY SCHOOL",
    "NYANGWA PRIMARY SCHOOL",
    "GIKONDI PRIMARY SCHOOL",
    "KIRITIRI PRIMARY SCHOOL",
    "KAMUTWANJIRU PRIMARY SCHOOL",
    "KAURACIRI MARKET",
    "KAMURUGU PRIMARY SCHOOL",
    "CIORINDAGWA PRIMARY SCHOOL",
    "KABINGORI SDA PRIMARYSCHOOL",
    "SEVEN FOLKS PRIMARY SCHOOL",
    "RURII PRIMARY SCHOOL",
    "KANDUKU PRIMARY SCHOOL",
    "MURINDI PRIMARY SCHOOL",
    "KWAMAKURU MARKET",
    "GITUNGATI PRIMARY SCHOOL",
    "KIRITIRI MARKET GROUND",
    "SOKO TRADING CENTRE-KITHUNTHIRI"
  ],

  "Kiambere": [
    "KIAMBERE PRIMARY SCHOOL",
    "MARIMARI PRIMARY SCHOOL",
    "NTHARAWE PRIMARY  SCHOOL",
    "NDITHIRI PRIMARY SCHOOL",
    "GACHABARI PRIMARY SCHOOL",
    "GWAKARIGU PRIMARY SCHOOL",
    "MUTUOVARE PRIMARY SCHOOL",
    "KARURA PRIMARY SCHOOL",
    "RIACIINA PRIMARY SCHOOL",
    "NGAMBARI PRIMARY SCHOOL",
    "IKOMENIE PRIMARY SCHOOL",
    "KIRURIRI PRIMARY SCHOOL",
    "KARIGURI PRIMARY SCHOOL",
    "KARIARI PRIMARY SCHOOL",
    "NEW SITE MARKET",
    "MUTINDWA PRIMARY SCHOOL",
    "KANTHENGE PRIMARY SCHOOL",
    "RUTUMBI PRIMARY SCHOOL",
    "GATETE PRIMARY SCHOOL",
    "KIRIA ISACCO PRIMARY SCHOOL",
    "KINYAGA PRIMARY SCHOOL",
    "NYAMBORI PRIMARY SCHOOL",
    "SDA MARIARI PRIMARY SCHOOL",
    "MUTUOBARE MARKET GROUND"
  ],

  /* ── MBEERE NORTH CONSTITUENCY  (3 wards) ── */

  "Nthawa": [
    "KWA-ANDU-AMBOGO PRIMARY SCHOO",
    "MWONDU PRIMARY SCHOOL",
    "RIANDU PRIMARY SCHOOL",
    "KIANAMU PRIMARY SCHOOL",
    "KUNE PRIMARY SCHOOL",
    "KAMBARU PRIMARY SCHOOL",
    "SIAKAGO PRIMARY SCHOOL",
    "MATHAI PRIMARY SCHOOL",
    "KAGERI PRIMARY SCHOOL",
    "WITWA PRIMARY SCHOOL",
    "MAKUNGURU PRIMARY SCHOOL",
    "GITIBURI PRIMARY SCHOOL",
    "MUNGAU PRIMARY SCHOOL",
    "MUCHONOKE PRIMARY SCHOOL",
    "CIANYI PRIMARY SCHOOL",
    "KAMUGU PRIMARY SCHOOL",
    "GIKUYARI PRIMARY SCHOOL",
    "KAUNGU PRIMARY SCHOOL",
    "MBINGORI PRIMARY SCHOOL",
    "SIAKAGO MARKET",
    "MUCHONOKE HEALTH CENTRE",
    "KATHITU PRIMARY SCHOOL",
    "SIAKAGO HALL-COUNTY COUNCIL OF",
    "KABACHI PRIMARY SCHOOL",
    "KANTHENGE PRIMARY SCHOOL",
    "KANYARIRI MARKET GROUNDS",
    "CIAMBUGU ACK CHURCH GROUNDS"
  ],

  "Muminji": [
    "ITIRA PRIMARY SCHOOL",
    "KARAMBARI PRIMARY SCHOOL",
    "NDUTORI PRIMARY SCHOOL",
    "GANGARA PRIMARY SCHOOL",
    "KIVUE PRIMARY SCHOOL",
    "MICHEGETHIU PRIMARY SCHOOL",
    "KIRIE PRIMARY SCHOOL",
    "KIANJOGU PRIMARY SCHOOL",
    "NGUTHI PRIMARY SCHOOL",
    "MBARWARI PRIMARY SCHOOL",
    "KANDOMBA PRIMARY SCHOOL",
    "NGIIRI PRIMARY SCHOOL",
    "CIERIA PRIMARY SCHOOL",
    "MIANJATIRI PRIMARY SCHOOL",
    "RWAGORI PRIMARY SCHOOL",
    "GATOTHIA PRIMARY SCHOOL",
    "KIAMUGONGO PRIMARY SCHOOL",
    "KARIMARI PRIMARY SCHOOL",
    "KAVUI PRIMARY SCHOOL",
    "GATAKARI PRIMARY SCHOOL",
    "MUKORORIA PRIMARY SCHOOL",
    "KATHUTHERI PRIMARY SCHOOL"
  ],

  "Evurore": [
    "KANYUAMBORA PRIMARY SCHOOL",
    "KAVENGERO PRIMARY SCHOOL",
    "IRIRI PRIMARY SCHOOL",
    "GITIE PRIMARY SCHOOL",
    "CIANTHIA PRIMARY SCHOOL",
    "NGUNYUMU PRIMARY SCHOOL",
    "KATHIGAGACERU PRIMARY SCHOOL",
    "KATHAGUTARI PRIMARY SCHOOL",
    "IBUTUKA PRIMARY SCHOOL",
    "KUI PRIMARY SCHOOL",
    "KARUARI PRIMARY SCHOOL",
    "KIGWAMBITI PRIMARY SCHOOL",
    "KIENIRE PRIMARY SCHOOL",
    "KAMUKANYA PRIMARY SCHOOL",
    "NTAMBARI PRIMARY SCHOOL",
    "NGOCE PRIMARY SCHOOL",
    "KIRIGO PRIMARY SCHOOL",
    "NGARWERERI PRIMARY SCHOOL",
    "MUTIRIAIGURU PRIMARY SCHOOL",
    "KIANJERU PRIMARY SCHOOL",
    "KARANGARE PRIMARY SCHOOL",
    "CIANGERA PRIMARY SCHOOL",
    "NJARANGE PRIMARY SCHOOL",
    "MBARAGA PRIMARY SCHOOL",
    "MUTHANTHARA PRIMARY SCHOOL",
    "KOGARI PRIMARY SCHOOL",
    "KAMUTU PRIMARY SCHOOL",
    "NTHIGIRANI PRIMARY SCHOOL",
    "GATATHA PRIMARY SCHOOL",
    "KIATHAMBU PRIMARY SCHOOL",
    "KAMWAA PRIMARY SCHOOL",
    "KIANTHENGE PRIMARY SCHOOL",
    "GWAKAITHI PRIMARY SCHOOL",
    "RWANJERU PRIMARY SCHOOL",
    "GATORORORI PRIMARY SCHOOL",
    "OVARIRE PRIMARY SCHOOL",
    "MANGOTE PRIMARY SCHOOL",
    "ST. PETERS PRIMARY SCHOOL",
    "KANYUERI PRIMARY SCHOOL",
    "ST. MARYS KANGANGA PRIMARY SCHO",
    "ITURURI PRIMARY SCHOOL",
    "USAMBARA PRIMARY SCHOOL",
    "MUGWANJOGU PRIMARY SCHOOL",
    "MBACI PRIMARY SCHOOL",
    "KAMARINDO PRIMARY SCHOOL",
    "KARIGIRI PRIMARY SCHOOL",
    "ST. KIZITO KATHANGARI PR SCHOOL",
    "MURANGU PRIMARY SCHOOL",
    "CIAIKUNGUGU PRIMARY SCHOOL",
    "KAMBUNGU PRIMARY SCHOOL",
    "KAMIGUA PRIMARY SCHOOL",
    "ST. MICHAEL GACURIRI PR SCHOOL",
    "KANYANGI PRIMARY SCHOOL",
    "KAMAUA PRIMARY SCHOOL",
    "KATHERU PRIMARY SCHOOL",
    "KIANJOYA PRIMARY SCHOOL",
    "KAMARANDI SECONDARY SCHOOL"
  ]

};


/* ══════════════════════════════════════════════════════════════
   2.  WARD → CONSTITUENCY MAP
   ══════════════════════════════════════════════════════════════ */

window.ECS_WARD_CONSTITUENCY = {
  /* Manyatta */
  "Ruguru/Ngandori": "Manyatta",
  "Kithimu":         "Manyatta",
  "Nginda":          "Manyatta",
  "Mbeti North":     "Manyatta",
  "Kirimari":        "Manyatta",
  "Gaturi South":    "Manyatta",
  /* Runyenjes */
  "Gaturi North":    "Runyenjes",
  "Kagaari South":   "Runyenjes",
  "Kagaari North":   "Runyenjes",
  "Central Ward":    "Runyenjes",
  "Kyeni North":     "Runyenjes",
  "Kyeni South":     "Runyenjes",
  /* Mbeere South */
  "Mwea":            "Mbeere South",
  "Makima":          "Mbeere South",
  "Mbeti South":     "Mbeere South",
  "Mavuria":         "Mbeere South",
  "Kiambere":        "Mbeere South",
  /* Mbeere North */
  "Nthawa":          "Mbeere North",
  "Muminji":         "Mbeere North",
  "Evurore":         "Mbeere North"
};


/* ══════════════════════════════════════════════════════════════
   3.  MP CANDIDATES  (keyed by constituency name)
   ══════════════════════════════════════════════════════════════ */

window.ECS_MP_CANDIDATES = {

  "Manyatta": [
    "Githinji Gakure",
    "Muriuki Njeru",
    "Wambua Kithinji",
    "Kathurima M'Inoti",
    "Kareke Mbiuki"
  ],

  "Runyenjes": [
    "Eric Muchangi Karemba",
    "Onyango",
    "Steve Simba",
    "Wakili Elijah",
    "Muthoni Nyaga",
    "Kauma",
    "Kathangu",
    "Enos"
  ],

  "Mbeere South": [
    "Geoffrey Ruku",
    "Muriuki Njuguna",
    "Kirimi Muriuki",
    "Gichuki Mugambi",
    "Kamande Ngugi"
  ],

  "Mbeere North": [
    "Murithi Mutegi",
    "Karithi Njagi",
    "Kibui Mwangi",
    "Njogu Barua",
    "Kanampiu Njeru"
  ]

};


/* ══════════════════════════════════════════════════════════════
   4.  MCA CANDIDATES  (keyed by ward name)
       Updated: Manyatta wards reflect confirmed 2027 aspirants
   ══════════════════════════════════════════════════════════════ */

window.ECS_MCA_CANDIDATES = {

  /* ── MANYATTA ── */

  "Ruguru/Ngandori": [
    "Muturi Mwombo",
    "Yvonne Mate",
    "Robert Mutwiri",
    "Paul Mwaniki Gacuma",
    "Dickson Murage",
    "Kareko",
    "Dennis Macharia (Obinna)"
  ],

  "Kithimu": [
    "Julius Karuri",
    "Robert Njeru Gateri",
    "Michael Njeru",
    "Elias Kariuki",
    "Ambrose Mwaniki",
    "Ken Njeru"
  ],

  "Nginda": [
    "Morris Macharia",
    "Sicily Warue (Wamaviriri)",
    "Kelvin Gachima (Overseer)",
    "Richard Mugendi",
    "David Kariuki Njeru",
    "Njue Mwanjuma"
  ],

  "Mbeti North": [
    "Silas Kariuki Koroga",
    "Charles Mwaura (Marvo)",
    "Irene Njeri (Mkombozi)",
    "Muchangi Gicugu (Wakili)",
    "Ruguru Antony",
    "Job Muriithi",
    "Muchangi Karenjo",
    "David Miriiti",
    "Irene Kanini",
    "David Kariuki (DNK)",
    "Moses Njanga"
  ],

  "Kirimari": [
    "Ibrahim Swaleh",
    "Morris Nyaga (Collo)",
    "Wanja Nyaga",
    "Jack Mutua (Chiloba)",
    "Roy Mutembei (Leftie)",
    "Eddah Njeri (Wamaster)",
    "John Ireri (Wamathavu)",
    "Alex Ngoro",
    "Stephen Kibugi",
    "Davie wa Boda",
    "Nancy Wanjiku (Dot com)",
    "Gitau Bebabeba",
    "Risper Njura"
  ],

  "Gaturi South": [
    "Fredrick Mugendi (Kamwigunyi)",
    "William Kariuki",
    "Kamuri wa Mercy",
    "Gloria Gitari",
    "Kamuri wa Nguruwe",
    "Catherine Mwaniki",
    "Elias Wanguku"
  ],

  /* ── RUNYENJES ── */

  "Gaturi North": [
    "Muriuki Gitonga",
    "Nthamburi Njeru",
    "Karimi Kimani",
    "Weru Gitari",
    "Njagi Mutua"
  ],

  "Kagaari South": [
    "Wariru Susan",
    "Kitu",
    "Young Rich",
    "Njuki Samwuel",
    "Terry Kaari",
    "TT (Wavunda)",
    "Kelvin",
    "Robert Ireri"
  ],

  "Kagaari North": [
    "Njagi Muriuki",
    "Mutua Karimi",
    "Gitari Weru",
    "Nthiga Mwangi",
    "Karimi Njiru"
  ],

  "Central Ward": [
    "Karithi Muriuki",
    "Njue Gitonga",
    "Wambua Nthamburi",
    "Mutembei Njeru",
    "Kimani Gitari"
  ],

  "Kyeni North": [
    "Nthiga Mwenda",
    "Karimi Njagi",
    "Gitonga Kimani",
    "Njiru Karuri",
    "Muriuki Kimathi"
  ],

  "Kyeni South": [
    "Mwiti Njue",
    "Karuri Gitonga",
    "Kimani Nthiga",
    "Njeru Karimi",
    "Wambugu Mutua"
  ],

  /* ── MBEERE SOUTH ── */

  "Mwea": [
    "Kamande Mugo",
    "Ngugi Njoroge",
    "Gichuki Kamau",
    "Njuguna Karanja",
    "Mwangi Githinji"
  ],

  "Makima": [
    "Mugambi Githinji",
    "Karanja Mwangi",
    "Mugo Ngugi",
    "Njoroge Gichuki",
    "Kamau Kamande"
  ],

  "Mbeti South": [
    "Githinji Mugambi",
    "Mwangi Karanja",
    "Ngugi Mugo",
    "Gichuki Njoroge",
    "Kamande Kamau"
  ],

  "Mavuria": [
    "Karanja Githinji",
    "Njoroge Mwangi",
    "Kamau Ngugi",
    "Mugo Gichuki",
    "Mugambi Kamande"
  ],

  "Kiambere": [
    "Mwangi Mugambi",
    "Githinji Karanja",
    "Gichuki Mugo",
    "Kamande Njoroge",
    "Ngugi Kamau"
  ],

  /* ── MBEERE NORTH ── */

  "Nthawa": [
    "Njagi Murithi",
    "Karithi Kibui",
    "Njogu Kanampiu",
    "Mutegi Njagi",
    "Mwangi Karithi"
  ],

  "Muminji": [
    "Kibui Njogu",
    "Kanampiu Mutegi",
    "Murithi Mwangi",
    "Njagi Karithi",
    "Karithi Kibui"
  ],

  "Evurore": [
    "Mutegi Kanampiu",
    "Njogu Murithi",
    "Mwangi Njagi",
    "Karithi Njogu",
    "Kibui Mutegi"
  ]

};


/* ══════════════════════════════════════════════════════════════
   5.  DIAGNOSTICS
   ══════════════════════════════════════════════════════════════ */

window.ECS_STATION_COUNT = (function () {
  var total = 0;
  Object.values(window.ECS_POLLING_STATIONS).forEach(function (arr) { total += arr.length; });
  return total;
})();

console.info(
  '[ECS-2026] Data loaded:',
  window.ECS_STATION_COUNT + ' polling stations,',
  Object.keys(window.ECS_POLLING_STATIONS).length + ' wards,',
  Object.keys(window.ECS_MP_CANDIDATES).length + ' constituencies (MP),',
  Object.keys(window.ECS_MCA_CANDIDATES).length + ' wards (MCA),',
  Object.keys(window.ECS_WARD_CONSTITUENCY).length + ' ward→constituency mappings.'
);

/* Warn loudly in dev if any ward is missing from the ward→constituency map */
(function () {
  var missing = [];
  Object.keys(window.ECS_POLLING_STATIONS).forEach(function (ward) {
    if (!window.ECS_WARD_CONSTITUENCY[ward]) missing.push(ward);
  });
  if (missing.length) {
    console.warn('[ECS-2026] Wards missing from ECS_WARD_CONSTITUENCY:', missing);
  }
})();
