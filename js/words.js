/* ==========================================================================
   Udaan Almanac — 147 names, three tongues, one honest verdict each.
   `flies` is the truth. Notes exist for the names people argue about.
   ========================================================================== */

export const CATS = ["bird", "winged", "machine", "myth", "animal", "object", "vehicle", "food"];

export const WORDS = [
  /* ——— the namesake and its cousins ——— */
  { id: "chidiya", en: "Bird", hi: "चिड़िया", hl: "Chidiya", flies: true, cat: "bird" },
  { id: "tota", en: "Parrot", hi: "तोता", hl: "Tota", flies: true, cat: "bird" },
  { id: "gauraiya", en: "Sparrow", hi: "गौरैया", hl: "Gauraiya", flies: true, cat: "bird" },
  { id: "kauwa", en: "Crow", hi: "कौआ", hl: "Kauwa", flies: true, cat: "bird" },
  { id: "kabootar", en: "Pigeon", hi: "कबूतर", hl: "Kabootar", flies: true, cat: "bird" },
  { id: "mor", en: "Peacock", hi: "मोर", hl: "Mor", flies: true, cat: "bird" },
  { id: "cheel", en: "Eagle", hi: "चील", hl: "Cheel", flies: true, cat: "bird" },
  { id: "ullu", en: "Owl", hi: "उल्लू", hl: "Ullu", flies: true, cat: "bird" },
  { id: "hans", en: "Swan", hi: "हंस", hl: "Hans", flies: true, cat: "bird" },
  { id: "battakh", en: "Duck", hi: "बत्तख", hl: "Battakh", flies: true, cat: "bird" },
  { id: "saras", en: "Crane", hi: "सारस", hl: "Saras", flies: true, cat: "bird" },
  { id: "ramchiraiya", en: "Kingfisher", hi: "रामचिरैया", hl: "Ramchiraiya", flies: true, cat: "bird" },
  { id: "maina", en: "Mynah", hi: "मैना", hl: "Maina", flies: true, cat: "bird" },
  { id: "koyal", en: "Koel", hi: "कोयल", hl: "Koyal", flies: true, cat: "bird" },
  { id: "bagula", en: "Heron", hi: "बगुला", hl: "Bagula", flies: true, cat: "bird" },
  { id: "giddh", en: "Vulture", hi: "गिद्ध", hl: "Giddh", flies: true, cat: "bird" },
  { id: "baaz", en: "Falcon", hi: "बाज़", hl: "Baaz", flies: true, cat: "bird" },
  { id: "ababeel", en: "Swallow", hi: "अबाबील", hl: "Ababeel", flies: true, cat: "bird" },
  { id: "teetar", en: "Partridge", hi: "तीतर", hl: "Teetar", flies: true, cat: "bird" },
  { id: "fakhta", en: "Dove", hi: "फाख्ता", hl: "Fakhta", flies: true, cat: "bird" },

  /* ——— wings that are not feathers ——— */
  { id: "chamgadar", en: "Bat", hi: "चमगादड़", hl: "Chamgadar", flies: true, cat: "winged",
    note: { en: "A mammal with wings of skin — and it truly flies.", hi: "स्तनपाई है, पर झिल्ली जैसे पंखों से सचमुच उड़ता है।", hl: "Mammal hai, par skin ke pankh se sach mein udta hai." } },
  { id: "titli", en: "Butterfly", hi: "तितली", hl: "Titli", flies: true, cat: "winged" },
  { id: "patanga", en: "Moth", hi: "पतंगा", hl: "Patanga", flies: true, cat: "winged" },
  { id: "madhumakkhi", en: "Honeybee", hi: "मधुमक्खी", hl: "Madhumakkhi", flies: true, cat: "winged" },
  { id: "bhanwra", en: "Bumblebee", hi: "भँवरा", hl: "Bhanwra", flies: true, cat: "winged" },
  { id: "makkhi", en: "Housefly", hi: "मक्खी", hl: "Makkhi", flies: true, cat: "winged" },
  { id: "machhar", en: "Mosquito", hi: "मच्छर", hl: "Machhar", flies: true, cat: "winged" },
  { id: "tiddi", en: "Locust", hi: "टिड्डी", hl: "Tiddi", flies: true, cat: "winged" },
  { id: "jugnu", en: "Firefly", hi: "जुगनू", hl: "Jugnu", flies: true, cat: "winged" },
  { id: "cheenti", en: "Ant", hi: "चींटी", hl: "Cheenti", flies: false, cat: "winged",
    note: { en: "The ones in your kitchen have no wings. They walk, in a very organised line.", hi: "रसोई में मिलने वाली चींटियों के पंख नहीं होते। वे बड़ी मज़े से कतार में चलती हैं।", hl: "Kitchen wali cheentiyon ke pankh nahi hote. Woh line mein chalti hain." } },
  { id: "makdi", en: "Spider", hi: "मकड़ी", hl: "Makdi", flies: false, cat: "winged",
    note: { en: "Eight legs, no wings, and not an insect at all.", hi: "आठ टाँगें, पंख नहीं — और यह कीट भी नहीं है।", hl: "Aath taangein, pankh nahi — aur insect bhi nahi hai." } },

  /* ——— flightless birds: the classic trap ——— */
  { id: "penguin", en: "Penguin", hi: "पेंगुइन", hl: "Penguin", flies: false, cat: "bird",
    note: { en: "Wings like flippers. It flies through water instead.", hi: "पंख फ्लिपर जैसे हैं। यह पानी में उड़ता है, हवा में नहीं।", hl: "Pankh flipper jaise. Yeh paani mein udta hai, hawa mein nahi." } },
  { id: "shuturmurg", en: "Ostrich", hi: "शुतुरमुर्ग", hl: "Shuturmurg", flies: false, cat: "bird",
    note: { en: "The largest living bird, and a committed pedestrian.", hi: "सबसे बड़ा जीवित पक्षी — और पक्का पैदल यात्री।", hl: "Sabse bada zinda parinda — aur pakka paidal yaatri." } },
  { id: "emu", en: "Emu", hi: "एमू", hl: "Emu", flies: false, cat: "bird",
    note: { en: "Feathers, long legs, no intention of leaving the ground.", hi: "पंख हैं, लंबी टाँगें हैं, ज़मीन छोड़ने का इरादा नहीं।", hl: "Pankh hain, lambi taangein hain, zameen chhodne ka iraada nahi." } },
  { id: "kiwi", en: "Kiwi", hi: "कीवी", hl: "Kiwi", flies: false, cat: "bird",
    note: { en: "Wings so small they are almost a rumour.", hi: "पंख इतने छोटे कि लगभग अफ़वाह लगते हैं।", hl: "Pankh itne chhote ki lagbhag afwah lagte hain." } },
  { id: "murgi", en: "Hen", hi: "मुर्गी", hl: "Murgi", flies: false, cat: "bird",
    note: { en: "A short, panicked hop. Not flight.", hi: "छोटी-सी घबराई हुई फुदक। उड़ान नहीं।", hl: "Chhoti si ghabraayi phudak. Udaan nahi." } },
  { id: "dodo", en: "Dodo", hi: "डोडो", hl: "Dodo", flies: false, cat: "bird",
    note: { en: "Gone since the 1600s, and never flew in the first place.", hi: "सोलहवीं सदी से विलुप्त — और उड़ता भी कभी नहीं था।", hl: "1600s se extinct — aur udta bhi kabhi nahi tha." } },

  /* ——— ground company ——— */
  { id: "haathi", en: "Elephant", hi: "हाथी", hl: "Haathi", flies: false, cat: "animal" },
  { id: "bhains", en: "Buffalo", hi: "भैंस", hl: "Bhains", flies: false, cat: "animal" },
  { id: "gaay", en: "Cow", hi: "गाय", hl: "Gaay", flies: false, cat: "animal" },
  { id: "bakri", en: "Goat", hi: "बकरी", hl: "Bakri", flies: false, cat: "animal" },
  { id: "kutta", en: "Dog", hi: "कुत्ता", hl: "Kutta", flies: false, cat: "animal" },
  { id: "billi", en: "Cat", hi: "बिल्ली", hl: "Billi", flies: false, cat: "animal" },
  { id: "oont", en: "Camel", hi: "ऊँट", hl: "Oont", flies: false, cat: "animal" },
  { id: "ghoda", en: "Horse", hi: "घोड़ा", hl: "Ghoda", flies: false, cat: "animal" },
  { id: "baagh", en: "Tiger", hi: "बाघ", hl: "Baagh", flies: false, cat: "animal" },
  { id: "sher", en: "Lion", hi: "शेर", hl: "Sher", flies: false, cat: "animal" },
  { id: "saanp", en: "Snake", hi: "साँप", hl: "Saanp", flies: false, cat: "animal" },
  { id: "machhli", en: "Fish", hi: "मछली", hl: "Machhli", flies: false, cat: "animal",
    note: { en: "Swimming is not flying. The sea has its own rules.", hi: "तैरना उड़ना नहीं है। समुद्र के अपने नियम हैं।", hl: "Tairna udna nahi hai. Samundar ke apne rules hain." } },
  { id: "mendhak", en: "Frog", hi: "मेंढक", hl: "Mendhak", flies: false, cat: "animal" },
  { id: "kachhua", en: "Tortoise", hi: "कछुआ", hl: "Kachhua", flies: false, cat: "animal" },
  { id: "khargosh", en: "Rabbit", hi: "खरगोश", hl: "Khargosh", flies: false, cat: "animal" },
  { id: "bandar", en: "Monkey", hi: "बंदर", hl: "Bandar", flies: false, cat: "animal" },
  { id: "chuha", en: "Mouse", hi: "चूहा", hl: "Chuha", flies: false, cat: "animal" },
  { id: "magarmachh", en: "Crocodile", hi: "मगरमच्छ", hl: "Magarmachh", flies: false, cat: "animal" },

  /* ——— things in the room ——— */
  { id: "kursi", en: "Chair", hi: "कुर्सी", hl: "Kursi", flies: false, cat: "object" },
  { id: "mez", en: "Table", hi: "मेज़", hl: "Mez", flies: false, cat: "object" },
  { id: "sofa", en: "Sofa", hi: "सोफ़ा", hl: "Sofa", flies: false, cat: "object" },
  { id: "palang", en: "Bed", hi: "पलंग", hl: "Palang", flies: false, cat: "object" },
  { id: "kap", en: "Cup", hi: "कप", hl: "Kap", flies: false, cat: "object" },
  { id: "chammach", en: "Spoon", hi: "चम्मच", hl: "Chammach", flies: false, cat: "object" },
  { id: "thali", en: "Plate", hi: "थाली", hl: "Thali", flies: false, cat: "object" },
  { id: "aaina", en: "Mirror", hi: "आईना", hl: "Aaina", flies: false, cat: "object" },
  { id: "kitaab", en: "Book", hi: "किताब", hl: "Kitaab", flies: false, cat: "object" },
  { id: "pencil", en: "Pencil", hi: "पेंसिल", hl: "Pencil", flies: false, cat: "object" },
  { id: "phone", en: "Phone", hi: "फ़ोन", hl: "Phone", flies: false, cat: "object",
    note: { en: "It flies only when you are angry. Even then, briefly.", hi: "गुस्से में ही उड़ता है — और तब भी थोड़ी देर।", hl: "Gusse mein hi udta hai — aur tab bhi thodi der." } },
  { id: "laptop", en: "Laptop", hi: "लैपटॉप", hl: "Laptop", flies: false, cat: "object" },
  { id: "fridge", en: "Fridge", hi: "फ्रिज", hl: "Fridge", flies: false, cat: "object" },
  { id: "chappal", en: "Slipper", hi: "चप्पल", hl: "Chappal", flies: false, cat: "object" },
  { id: "dhol", en: "Drum", hi: "ढोल", hl: "Dhol", flies: false, cat: "object" },
  { id: "guitar", en: "Guitar", hi: "गिटार", hl: "Guitar", flies: false, cat: "object" },
  { id: "phool", en: "Flower", hi: "फूल", hl: "Phool", flies: false, cat: "object" },
  { id: "ped", en: "Tree", hi: "पेड़", hl: "Ped", flies: false, cat: "object" },
  { id: "pahad", en: "Mountain", hi: "पहाड़", hl: "Pahad", flies: false, cat: "object" },
  { id: "nadi", en: "River", hi: "नदी", hl: "Nadi", flies: false, cat: "object" },
  { id: "ghar", en: "House", hi: "घर", hl: "Ghar", flies: false, cat: "object" },
  { id: "mandir", en: "Temple", hi: "मंदिर", hl: "Mandir", flies: false, cat: "object" },
  { id: "diya", en: "Oil lamp", hi: "दीया", hl: "Diya", flies: false, cat: "object" },
  { id: "chaabi", en: "Key", hi: "चाबी", hl: "Chaabi", flies: false, cat: "object" },
  { id: "ghadi", en: "Clock", hi: "घड़ी", hl: "Ghadi", flies: false, cat: "object" },
  { id: "joote", en: "Shoes", hi: "जूते", hl: "Joote", flies: false, cat: "object" },
  { id: "chashma", en: "Glasses", hi: "चश्मा", hl: "Chashma", flies: false, cat: "object" },
  { id: "kambal", en: "Blanket", hi: "कंबल", hl: "Kambal", flies: false, cat: "object" },
  { id: "takiya", en: "Pillow", hi: "तकिया", hl: "Takiya", flies: false, cat: "object" },
  { id: "baalti", en: "Bucket", hi: "बाल्टी", hl: "Baalti", flies: false, cat: "object" },
  { id: "jhadu", en: "Broom", hi: "झाड़ू", hl: "Jhadu", flies: false, cat: "object",
    note: { en: "A broom on its own stays put. A witch's broom is a different entry.", hi: "अकेली झाड़ू वहीं रहती है। डायन की झाड़ू अलग मामला है।", hl: "Akeli jhadu wahin rehti hai. Chudail ki jhadu alag maamla hai." } },
  { id: "seedhi", en: "Ladder", hi: "सीढ़ी", hl: "Seedhi", flies: false, cat: "object" },
  { id: "schoolbag", en: "School bag", hi: "स्कूल बैग", hl: "School bag", flies: false, cat: "object" },
  { id: "tv", en: "Television", hi: "टीवी", hl: "TV", flies: false, cat: "object" },
  { id: "ghanti", en: "Bell", hi: "घंटी", hl: "Ghanti", flies: false, cat: "object" },
  { id: "mombatti", en: "Candle", hi: "मोमबत्ती", hl: "Mombatti", flies: false, cat: "object" },

  /* ——— wheels and hulls ——— */
  { id: "cycle", en: "Bicycle", hi: "साइकिल", hl: "Cycle", flies: false, cat: "vehicle" },
  { id: "car", en: "Car", hi: "कार", hl: "Car", flies: false, cat: "vehicle" },
  { id: "bus", en: "Bus", hi: "बस", hl: "Bus", flies: false, cat: "vehicle" },
  { id: "relgaadi", en: "Train", hi: "रेलगाड़ी", hl: "Relgaadi", flies: false, cat: "vehicle" },
  { id: "tractor", en: "Tractor", hi: "ट्रैक्टर", hl: "Tractor", flies: false, cat: "vehicle" },
  { id: "auto", en: "Auto-rickshaw", hi: "ऑटो रिक्शा", hl: "Auto", flies: false, cat: "vehicle" },
  { id: "scooter", en: "Scooter", hi: "स्कूटर", hl: "Scooter", flies: false, cat: "vehicle" },
  { id: "pandubbi", en: "Submarine", hi: "पनडुब्बी", hl: "Pandubbi", flies: false, cat: "vehicle",
    note: { en: "Built to sink, beautifully. The opposite of a bird.", hi: "सुंदर ढंग से डूबने के लिए बनी है। चिड़िया की उलटी।", hl: "Sundar dhang se doobne ke liye bani hai. Chidiya ki ulti." } },
  { id: "jahaz", en: "Ship", hi: "जहाज़", hl: "Jahaz", flies: false, cat: "vehicle",
    note: { en: "Floats, does not fly. Add “hawai” and everything changes.", hi: "तैरता है, उड़ता नहीं। आगे “हवाई” लगाइए, सब बदल जाता है।", hl: "Tairta hai, udta nahi. Aage 'hawai' lagao, sab badal jaata hai." } },
  { id: "naav", en: "Boat", hi: "नाव", hl: "Naav", flies: false, cat: "vehicle" },

  /* ——— the kitchen and the thali ——— */
  { id: "samosa", en: "Samosa", hi: "समोसा", hl: "Samosa", flies: false, cat: "food" },
  { id: "laddoo", en: "Laddu", hi: "लड्डू", hl: "Laddoo", flies: false, cat: "food" },
  { id: "gulabjamun", en: "Gulab jamun", hi: "गुलाब जामुन", hl: "Gulab jamun", flies: false, cat: "food" },
  { id: "roti", en: "Roti", hi: "रोटी", hl: "Roti", flies: false, cat: "food" },
  { id: "chai", en: "Chai", hi: "चाय", hl: "Chai", flies: false, cat: "food" },
  { id: "aam", en: "Mango", hi: "आम", hl: "Aam", flies: false, cat: "food" },
  { id: "aloo", en: "Potato", hi: "आलू", hl: "Aloo", flies: false, cat: "food" },
  { id: "pyaaz", en: "Onion", hi: "प्याज़", hl: "Pyaaz", flies: false, cat: "food" },
  { id: "kaddu", en: "Pumpkin", hi: "कद्दू", hl: "Kaddu", flies: false, cat: "food" },
  { id: "anda", en: "Egg", hi: "अंडा", hl: "Anda", flies: false, cat: "food",
    note: { en: "Round, hopeful, entirely earthbound.", hi: "गोल, उम्मीदों भरा, पूरी तरह ज़मीनी।", hl: "Gol, ummeedon bhara, poori tarah zameeni." } },
  { id: "football", en: "Football", hi: "फुटबॉल", hl: "Football", flies: false, cat: "object" },
  { id: "balla", en: "Cricket bat", hi: "बल्ला", hl: "Balla", flies: false, cat: "object" },
  { id: "patthar", en: "Stone", hi: "पत्थर", hl: "Patthar", flies: false, cat: "object" },

  /* ——— machines that genuinely fly ——— */
  { id: "hawai", en: "Aeroplane", hi: "हवाई जहाज़", hl: "Hawai Jahaz", flies: true, cat: "machine" },
  { id: "helicopter", en: "Helicopter", hi: "हेलीकॉप्टर", hl: "Helicopter", flies: true, cat: "machine" },
  { id: "rocket", en: "Rocket", hi: "रॉकेट", hl: "Rocket", flies: true, cat: "machine",
    note: { en: "Up is the only direction it has strong opinions about.", hi: "ऊपर जाना ही इसकी एकमात्र ज़िद है।", hl: "Upar jaana hi iski ekmatra zid hai." } },
  { id: "drone", en: "Drone", hi: "ड्रोन", hl: "Drone", flies: true, cat: "machine" },
  { id: "patang", en: "Kite", hi: "पतंग", hl: "Patang", flies: true, cat: "machine",
    note: { en: "Flies when the wind and your string agree. Today, they agree.", hi: "जब हवा और डोर दोनों राज़ी हों, तब उड़ती है। आज राज़ी हैं।", hl: "Jab hawa aur dor dono raazi hon, tab udti hai. Aaj raazi hain." } },
  { id: "gubbara", en: "Balloon", hi: "गुब्बारा", hl: "Gubbara", flies: true, cat: "machine",
    note: { en: "Gas lifts it. It doesn't flap, but it does leave the ground.", hi: "गैस उठाती है। पंख नहीं फड़फड़ाते, पर वह ज़मीन छोड़ देता है।", hl: "Gas uthaati hai. Pankh nahi fadfadaate, par woh zameen chhod deta hai." } },
  { id: "kagaz", en: "Paper plane", hi: "काग़ज़ का जहाज़", hl: "Kagaz ka Jahaz", flies: true, cat: "machine" },
  { id: "paraglider", en: "Paraglider", hi: "पैराग्लाइडर", hl: "Paraglider", flies: true, cat: "machine" },

  /* ——— myth, and the stories we allow ——— */
  { id: "pari", en: "Fairy", hi: "परी", hl: "Pari", flies: true, cat: "myth",
    note: { en: "Airborne by profession.", hi: "पेशे से हवाई।", hl: "Peshe se hawai." } },
  { id: "garud", en: "Garuda", hi: "गरुड़", hl: "Garud", flies: true, cat: "myth",
    note: { en: "The eagle that carries a god. Mythically airborne.", hi: "देवता को ढोने वाला गरुड़। पौराणिक रूप से उड़ता है।", hl: "Devta ko dhoane wala Garud. Mythically airborne." } },
  { id: "dragon", en: "Dragon", hi: "ड्रैगन", hl: "Dragon", flies: true, cat: "myth" },
  { id: "khatola", en: "Flying carpet", hi: "उड़न खटोला", hl: "Udan Khatola", flies: true, cat: "myth",
    note: { en: "In stories, certainly. In your living room, it is furniture.", hi: "कहानियों में बिल्कुल। आपके घर में यह फ़र्नीचर है।", hl: "Kahaaniyon mein bilkul. Ghar mein yeh furniture hai." } },
  { id: "chudail", en: "Witch", hi: "चुड़ैल", hl: "Chudail", flies: true, cat: "myth",
    note: { en: "On a broom, in every story worth telling. We allow it.", hi: "हर अच्छी कहानी में झाड़ू पर। हमें मंज़ूर है।", hl: "Har achhi kahaani mein jhadu par. Humein manzoor hai." } },

  /* ——— the arguments worth having ——— */
  { id: "baadal", en: "Cloud", hi: "बादल", hl: "Baadal", flies: true, cat: "object",
    note: { en: "No wings, no flapping — and yet it crosses the whole sky.", hi: "पंख नहीं, फड़फड़ाहट नहीं — फिर भी पूरा आकाश पार करता है।", hl: "Pankh nahi, fadfadaahat nahi — phir bhi poora aasmaan paar karta hai." } },
  { id: "dhuan", en: "Smoke", hi: "धुआँ", hl: "Dhuan", flies: true, cat: "object",
    note: { en: "It rises, wanders, and vanishes. Flight by another name.", hi: "उठता है, भटकता है, ग़ायब हो जाता है। उड़ान का दूसरा नाम।", hl: "Uthta hai, bhatakta hai, gayab ho jaata hai. Udaan ka doosra naam." } },
  { id: "dhool", en: "Dust", hi: "धूल", hl: "Dhool", flies: true, cat: "object",
    note: { en: "A handful in the air is a hundred tiny flights.", hi: "हवा में मुट्ठी भर धूल — सौ छोटी उड़ानें।", hl: "Hawa mein mutthi bhar dhool — sau chhoti udaanein." } },
  { id: "raakh", en: "Ash", hi: "राख", hl: "Raakh", flies: true, cat: "object",
    note: { en: "What is left after fire still rises on the wind.", hi: "आग के बाद बची राख भी हवा में उठती है।", hl: "Aag ke baad bachi raakh bhi hawa mein uthti hai." } },
  { id: "pankh", en: "Feather", hi: "पंख", hl: "Pankh", flies: true, cat: "object",
    note: { en: "Light enough to ride the wind. It only needs a push.", hi: "हवा पर सवार होने के लिए काफ़ी हल्का। बस एक धक्का चाहिए।", hl: "Hawa par sawaar hone ke liye kaafi halka. Bas ek dhakka chahiye." } },
  { id: "patta", en: "Leaf", hi: "पत्ता", hl: "Patta", flies: true, cat: "object",
    note: { en: "On the branch it stays; let go, and the wind takes it.", hi: "डाली पर टिका रहता है; छूटते ही हवा ले जाती है।", hl: "Daali par tika rehta hai; chhootte hi hawa le jaati hai." } },
  { id: "parag", en: "Pollen", hi: "पराग", hl: "Parag", flies: true, cat: "object",
    note: { en: "Too small to see, and built to travel.", hi: "दिखने में बहुत छोटा, पर सफ़र के लिए बना है।", hl: "Dikhne mein bahut chhota, par safar ke liye bana hai." } },
  { id: "kagaz-panna", en: "Paper", hi: "काग़ज़", hl: "Kagaz", flies: true, cat: "object",
    note: { en: "A loose sheet is a very temporary bird.", hi: "ढीला काग़ज़ एक बहुत अस्थायी पक्षी है।", hl: "Dheela kagaz ek bahut asthaayi parinda hai." } },
  { id: "bulbula", en: "Bubble", hi: "बुलबुला", hl: "Bulbula", flies: true, cat: "object",
    note: { en: "It floats until the air decides otherwise.", hi: "जब तक हवा मना न करे, तब तक तैरता है।", hl: "Jab tak hawa mana na kare, tab tak tairta hai." } },
  { id: "frisbee", en: "Frisbee", hi: "फ्रिसबी", hl: "Frisbee", flies: true, cat: "object",
    note: { en: "A disc that flies better than most birds.", hi: "एक चक्र जो अधिकतर पक्षियों से बेहतर उड़ता है।", hl: "Ek chakra jo zyadatar parindon se behtar udta hai." } },
  { id: "boomerang", en: "Boomerang", hi: "बूमरैंग", hl: "Boomerang", flies: true, cat: "object",
    note: { en: "Out, around, and back — flight with a return ticket.", hi: "गया, घूमा, लौट आया — वापसी टिकट वाली उड़ान।", hl: "Gaya, ghooma, laut aaya — wapsi ticket wali udaan." } },
  { id: "teer", en: "Arrow", hi: "तीर", hl: "Teer", flies: true, cat: "object",
    note: { en: "Airborne only while the bow insists.", hi: "जब तक धनुष ज़िद करे, तब तक हवा में।", hl: "Jab tak dhanush zid kare, tab tak hawa mein." } },
  { id: "goli", en: "Bullet", hi: "गोली", hl: "Goli", flies: true, cat: "object",
    note: { en: "Fast, straight, and gone. Flight without wings.", hi: "तेज़, सीधी, और ग़ायब। पंखों के बिना उड़ान।", hl: "Tez, seedhi, aur gayab. Pankhon ke bina udaan." } },
  { id: "parachute", en: "Parachute", hi: "पैराशूट", hl: "Parachute", flies: true, cat: "object",
    note: { en: "It falls with style, and that is the whole point.", hi: "शान से गिरता है — और यही पूरा मक़सद है।", hl: "Shaan se girta hai — aur yahi poora maksad hai." } },
  { id: "chhata", en: "Umbrella", hi: "छाता", hl: "Chhata", flies: false, cat: "object",
    note: { en: "Mary Poppins had a magic one. Yours keeps the rain off.", hi: "मैरी पॉपिंस के पास जादुई था। तुम्हारा बारिश से बचाता है।", hl: "Mary Poppins ke paas jaadui tha. Tumhara baarish se bachata hai." } },
  { id: "upgrah", en: "Satellite", hi: "उपग्रह", hl: "Upgrah", flies: false, cat: "machine",
    note: { en: "It falls around the Earth forever — that is orbit, not flight.", hi: "यह पृथ्वी के चारों ओर हमेशा गिरता है — यह कक्षा है, उड़ान नहीं।", hl: "Yeh prithvi ke charon or hamesha girta hai — yeh kaksha hai, udaan nahi." } },
  { id: "dhoomketu", en: "Comet", hi: "धूमकेतु", hl: "Dhoomketu", flies: true, cat: "object",
    note: { en: "A ball of ice with a tail of light, crossing the night.", hi: "बर्फ़ की गेंद, रोशनी की पूँछ — रात पार करती हुई।", hl: "Barf ki gend, roshni ki poonch — raat paar karti hui." } },
  { id: "bhoot", en: "Ghost", hi: "भूत", hl: "Bhoot", flies: true, cat: "myth",
    note: { en: "Floats, drifts through walls. In this courtyard, that counts.", hi: "तैरता है, दीवारों से गुज़रता है। इस आँगन में यह उड़ान है।", hl: "Tairta hai, deewaron se guzarta hai. Is aangan mein yeh udaan hai." } },
  { id: "gilhari", en: "Squirrel", hi: "गिलहरी", hl: "Gilhari", flies: false, cat: "animal",
    note: { en: "The flying squirrel is a cousin with a parachute. This one keeps to the branches.", hi: "उड़न गिलहरी पैराशूट वाली चचेरी बहन है। यह शाखाओं पर ही रहती है।", hl: "Udan gilhari parachute wali cousin hai. Yeh shaakhaon par hi rehti hai." } },
  { id: "farishta", en: "Angel", hi: "देवदूत", hl: "Farishta", flies: true, cat: "myth",
    note: { en: "Wings, halo, and a permanent tailwind.", hi: "पंख, प्रभामंडल, और हमेशा अनुकूल हवा।", hl: "Pankh, halo, aur hamesha anukool hawa." } },
];

/** Pick a shuffled bag so names don't repeat until the bag empties. */
export function makeBag(){
  let bag = [];
  return {
    next(exclude = []){
      if(!bag.length){
        bag = WORDS.slice();
        for(let i = bag.length - 1; i > 0; i--){
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
      }
      let w = bag.pop();
      let guard = 0;
      while(exclude.includes(w.id) && bag.length && guard++ < 20) w = bag.pop();
      return w;
    },
  };
}

export const WORD_COUNT = WORDS.length;
