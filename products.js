/* ============================================================
   PRODUCTS DATA — Jerose Shop
   ============================================================
   HOW TO ADD A PRODUCT (super easy):
   ---------------------------------
   Add a new object inside the PRODUCT_LIST array below.
   Only "name" and "category" are REQUIRED. Everything else
   is optional and will be auto-filled with sensible defaults.

   category must be one of:
     "Accessories" | "Souvenir" | "Flower Bouquet" | "Home Decor" | "Keychain"

   ---- ADDING IMAGES (this is what you asked for) ----
   • image:  a single main image URL for the product.
             Examples:
               image: "images/rose-bouquet.jpg"          (local file in /images)
               image: "https://example.com/photo.jpg"     (online URL)
   • colors: an array of color options. Each color can have
             its OWN image so the picture changes when the
             customer taps a different color:
               colors: [
                 { name:"Red",  image:"images/keychain-red.jpg" },
                 { name:"Blue", image:"images/keychain-blue.jpg" }
               ]
   • If you don't give an image, a nice gradient placeholder
     with the category emoji is generated automatically.

   TIP: put your photos in a folder named  images/  next to
        index.html, then reference them like  "images/name.jpg".
   ============================================================ */

/* Color name -> swatch color (used for the little dots).
   Add your own here if you use a color not listed. */
const COLORS = {
  Black:'#1a1d29', White:'#f5f5f7', Pink:'#ff8fb1', Blue:'#4a90e2', Red:'#e63946',
  Gold:'#f0b429', Silver:'#c0c6d4', 'Rose Gold':'#e8b4a0', Green:'#2ecc71', Purple:'#8b5cf6',
  Beige:'#e8dcc4', Navy:'#2c3e60', Lavender:'#c8a2ff'
};

/* Category info: emoji + background tint + which customization form to use */
const CAT_META = {
  'Accessories':   { emo:'💍', tint:'#ffe0ec', custom:'accessories' },
  'Souvenir':      { emo:'🎁', tint:'#e0f0ff', custom:'souvenir' },
  'Flower Bouquet':{ emo:'💐', tint:'#ffe3ef', custom:'bouquet' },
  'Home Decor':    { emo:'🖼️', tint:'#e8ffe0', custom:'decor' },
  'Keychain':      { emo:'🔑', tint:'#fff3d6', custom:'keychain' }
};

/* ============================================================
   👇👇  EDIT / ADD YOUR PRODUCTS HERE  👇👇
   ============================================================
   Fields you can set on each product:
     name      (required)  "Blush Rose Bouquet"
     category  (required)  "Flower Bouquet"
     price     (number)    final selling price, e.g. 499
     base      (number)    original price (for showing a discount). optional.
     off       (number)    discount %, e.g. 20  (auto-calculates price if base given)
     image     (string)    main image URL / path
     colors    (array)     [{name:"Red", image:"...", stock:20}, ...]  OR  ["Red","Blue"]
     rating    (number)    0-5, e.g. 4.8
     sold      (number)    units sold, e.g. 1200
     badge     (string)    "new" | "sale" | "limited" | "trending"
     desc      (string)    product description
     specs     (object)    { Material:"...", Weight:"...", ... }
     flash     (bool)      include in Flash Sale
     newArrival(bool)      show in New Arrivals
     bestSeller(bool)      show in Best Sellers
     trending  (bool)      show in Trending
   ============================================================ */
const PRODUCT_LIST = [
  // ---------- ACCESSORIES ----------
  { name:'🍓 Berry Bloom Headband', image:'images/Accessories/1_headband.png', category:'Accessories',
                                                                                        price:65, 
                                                                                        rating:4.7, 
                                                                                        sold:3, 
                                                                                        badge:'trending', 
                                                                                        newArrival:true },
  { name:'💜 Lavender Meadow Headband', image:'images/Accessories/2_headband.png', category:'Accessories',
                                                                                        price:65, 
                                                                                        rating:4.7, 
                                                                                        sold:3, 
                                                                                        badge:'trending', 
                                                                                        newArrival:true },
  { name:'🌸 Blush Blossom Headband', image:'images/Accessories/3_headband.png', category:'Accessories',
                                                                                        price:65, 
                                                                                        rating:4.7, 
                                                                                        sold:3, 
                                                                                        badge:'trending', 
                                                                                        newArrival:true },
  { name:'Sampaguita Star Headband', image:'images/Accessories/4_headband.png', category:'Accessories',
                                                                                        price:65, 
                                                                                        rating:4.7, 
                                                                                        sold:3, 
                                                                                        badge:'trending', 
                                                                                        newArrival:true },
  { name:'Maharlika Crown Headband', image:'images/Accessories/5_headband.png', category:'Accessories',
                                                                                        price:65, 
                                                                                        rating:4.7, 
                                                                                        sold:3, 
                                                                                        badge:'trending', 
                                                                                        newArrival:true },
  { name:'Lakambini Bloom Headband', image:'images/Accessories/6_headband.png', category:'Accessories',
                                                                                        price:65, 
                                                                                        rating:4.7, 
                                                                                        sold:3, 
                                                                                        badge:'trending', 
                                                                                        newArrival:true },

  // ---------- SOUVENIR ----------
  { name:'🕯️ Crochet Candle Wrap',         image:'images/Souvenir/1_candle.png', category:'Souvenir', 
                                                                                        price:15,  
                                                                                        colors:[{name:"Pink", image:'images/Souvenir/1_candle.png'}, { name:"Blue",  image:"images/Souvenir/2_candle.jpg" }], 
                                                                                        rating:4.6, 
                                                                                        sold:3200, 
                                                                                        bestSeller:true, 
                                                                                        newArrival:true },

  // ---------- FLOWER BOUQUET ----------
  { name:'🌼 Ivory Blossom Bouquet',  image:'images/Folder_for_bouquet/1_bouquet.jpg', category:'Flower Bouquet', 
                                                                                        price:250, 
                                                                                        base:300, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        badge:'trending', 
                                                                                        bestSeller:true, 
                                                                                        newArrival:true },
  { name:'💙 Azure Serenity Bouquet', image:'images/Folder_for_bouquet/2_bouquet.jpg', category:'Flower Bouquet', 
                                                                                        price:200, 
                                                                                        rating:4.8, 
                                                                                        sold:4, 
                                                                                        newArrival:true },
  { name:'🤎 Mocha Elegance Bouquet', image:'images/Folder_for_bouquet/3_bouquet.jpg', category:'Flower Bouquet', 
                                                                                        price:250, 
                                                                                        base:590, 
                                                                                        rating:4.7, 
                                                                                        sold:3, 
                                                                                        badge:'sale' },
  { name:'❤️ Crimson Bloom Bouquet',  image:'images/Folder_for_bouquet/4_bouquet.jpg', category:'Flower Bouquet', 
                                                                                        price:280, 
                                                                                        rating:4.6, 
                                                                                        sold:5 },
  { name:'💜 Amethyst Bloom Bouquet', image:'images/Folder_for_bouquet/5_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:280, 
                                                                                        base:300, 
                                                                                        rating:5.0, 
                                                                                        sold:5, 
                                                                                        badge:'limited', 
                                                                                        trending:true },
  { name:'🌺 Pink Blossom Bouquet (Single Stem)',   image:'images/Folder_for_bouquet/6_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:150, 
                                                                                        base:200, 
                                                                                        rating:4.9, 
                                                                                        sold:3, 
                                                                                        badge:'sale' },
  { name:'🌷 Cherry Blossom Bouquet', image:'images/Folder_for_bouquet/7_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:150, 
                                                                                        rating:4.7, 
                                                                                        sold:2, 
                                                                                        bestSeller:true },
  { name:'🌈 Spring Bouquet with Lights', image:'images/Folder_for_bouquet/8_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:600, 
                                                                                        base:699, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        badge:'trending', 
                                                                                        bestSeller:true },
  { name:'🌷 Tulip Charm Bouquet',  image:'images/Folder_for_bouquet/9_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:280, 
                                                                                        base:300, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        badge:'trending', 
                                                                                        bestSeller:true, 
                                                                                        newArrival:true },
  { name:'🌸 Blush Lily Bouquet', image:'images/Folder_for_bouquet/10_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:280, 
                                                                                        base:300, 
                                                                                        rating:5.0, 
                                                                                        sold:5, 
                                                                                        badge:'limited', 
                                                                                        trending:true },
  { name:'💜 Lavender Grace Bouquet (Single Stem)', image:'images/Folder_for_bouquet/11_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:150, 
                                                                                        base:200, 
                                                                                        rating:4.9, 
                                                                                        sold:3, 
                                                                                        badge:'sale' },
  { name:'🌻 Golden Sunflower Bouquet (Single Stem)', image:'images/Folder_for_bouquet/12_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:150, 
                                                                                        rating:4.7, 
                                                                                        sold:3, 
                                                                                        bestSeller:true },
  { name:'🌸 Mini Flower Bouquet (Single Stem)1 ', image:'images/Folder_for_bouquet/13_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:30, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        newArrival:true },
  { name:'🌸 Mini Flower Bouquet (Single Stem)2 ',  image:'images/Folder_for_bouquet/14_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:30, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        newArrival:true },
  { name:'🌸 Mini Flower Bouquet (Single Stem)3 ', image:'images/Folder_for_bouquet/15_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:30, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        newArrival:true },
  { name:'🌸 Mini Flower Bouquet (Single Stem)4 ',  image:'images/Folder_for_bouquet/16_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:30, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        newArrival:true },
  { name:'🌸 Mini Flower Bouquet (Single Stem)4 ',  image:'images/Folder_for_bouquet/17_bouquet.png', category:'Flower Bouquet', 
                                                                                        price:30, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        newArrival:true },
  { name:'💜 Lavender Bloom Bouquet',  image:'images/Folder_for_bouquet/18_bouquet.jpg', category:'Flower Bouquet', 
                                                                                        price:300, 
                                                                                        rating:4.9, 
                                                                                        sold:4, 
                                                                                        badge:'trending'},
  { name:'🌷 Tulip Blossom Bouquet', image:'images/Folder_for_bouquet/19_bouquet.jpg', category:'Flower Bouquet', 
                                                                                        price:300, 
                                                                                        rating:4.8, 
                                                                                        sold:3, 
                                                                                        newArrival:true },

  // ---------- HOME DECOR ----------
  { name:'Eternal lily Bouquet With Cadle light', image:'images/Home Decor/Flower Basket/1_basket.png', category:'Home Decor', 
                                                                                                        price:150, 
                                                                                                        colors:[{name:"Blue", image:'images/Home Decor/Flower Basket/1_basket.png', hex: '#89CFF0'}, { name:"Maroon",  image:"images/Home Decor/Flower Basket/2_basket.png", hex: '#800000' }, { name:"Purple", image:"images/Home Decor/Flower Basket/3_basket.png", hex: '#800080' }, { name:"Yellow", image:"images/Home Decor/Flower Basket/4_basket.png", hex: '#FFFF00' }],
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
  { name:'💙 Azure Blossom Bonsai', image:'images/Home Decor/Bonsai/1_bonsai.png', category:'Home Decor', 
                                                                                                        price:250, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
  { name:'🌺 Fiesta Bloom Bonsai', image:'images/Home Decor/Bonsai/2_bonsai.png', category:'Home Decor', 
                                                                                                        price:280, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
  { name:'🌸 Sakura Harmony Bonsai', image:'images/Home Decor/Bonsai/3_bonsai.png', category:'Home Decor', 
                                                                                                        price:200, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
{ name:'❤️ Crimson Elegance', image:'images/Home Decor/Flower pot/1_pot.png', category:'Home Decor', 
                                                                                                        price:150, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
{ name:'💜 Royal Amethyst', image:'images/Home Decor/Flower pot/2_pot.png', category:'Home Decor', 
                                                                                                        price:150, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
{ name:'🌸 Blush Serenity', image:'images/Home Decor/Flower pot/3_pot.png', category:'Home Decor', 
                                                                                                        price:150, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
{ name:'🌅 Sunrise Bloom', image:'images/Home Decor/Flower pot/4_pot.png', category:'Home Decor', 
                                                                                                        price:150, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
{ name:'🌼 Golden Glow', image:'images/Home Decor/Flower pot/5_pot.jpg', category:'Home Decor', 
                                                                                                        price:150, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },
{ name:'🌼 Golden Glow', image:'images/Home Decor/Curtain_tie/1_curtain_tie.png', category:'Home Decor', 
                                                                                                        price:40, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4,
                                                                                                        colors: [ { name:"Pink", image:"images/Home Decor/Curtain_tie/1_curtain_tie.png", hex: '#F7A8C8'},
                                                                                                                  { name:"Maroon", image:"images/Home Decor/Curtain_tie/2_curtain_tie.png", hex: '#6B0F1A' },
                                                                                                                  { name:"Purple", image:"images/Home Decor/Curtain_tie/3_curtain_tie.png", hex: '#8A5CE6' },
                                                                                                                  { name:"Yellow", image:"images/Home Decor/Curtain_tie/4_curtain_tie.png", hex: '#FFFF00' },
                                                                                                                  { name:"Red", image:"images/Home Decor/Curtain_tie/5_curtain_tie.png", hex: '#E60012' }],
                                                                                                        newArrival:true },
{ name:'Mashroom Pen Holder', image:'images/Home Decor/1_minihouse.jpg', category:'Home Decor', 
                                                                                                        price:150, 
                                                                                                        rating:4.7, 
                                                                                                        sold:4, 
                                                                                                        newArrival:true },

  // ---------- KEYCHAIN ----------
{ name:'Grapes Keychain',   image:'images/Home Decor/1_minihouse.jpg', category:'Keychain', 
                                                                                        price:20, 
                                                                                        colors: [ { name:"Red", image:"images/Keychain/Grape KeyChain/1_grape_chain.jpg", hex: '#E60012'},
                                                                                                  { name:"Maroon", image:"images/Keychain/Grape KeyChain/2_grape_chain.jpg", hex: '#6B0F1A' },
                                                                                                  { name:"Pink", image:"images/Keychain/Grape KeyChain/3_grape_chain.jpg", hex: '#F7A8C8' },
                                                                                                  { name:"Blue", image:"images/Keychain/Grape KeyChain/4_grape_chain.jpg", hex: '#89CFF0' },
                                                                                                  { name:"Purple", image:"images/Keychain/Grape KeyChain/5_grape_chain.jpg", hex: '#800080' }],
                                                                                        rating:4.9, 
                                                                                        sold:15, 
                                                                                        badge:'new' },
{ name:'Flower Keychain',   image:'images/Keychain/Flower KeyChain/1_1_flower_chain.jpg', category:'Keychain', 
                                                                                      price:20, 
                                                                                      base:199, 
                                                                                      colors: [ { name:"Red", image:"images/Keychain/Flower KeyChain/1_flower_chain.jpg", hex: '#E60012'},
                                                                                                { name:"Maroon", image:"images/Keychain/Flower KeyChain/2_flower_chain.jpg", hex: '#6B0F1A' },
                                                                                                { name:"Pink", image:"images/Keychain/Flower KeyChain/3_flower_chain.jpg", hex: '#F7A8C8' },
                                                                                                { name:"Blue", image:"images/Keychain/Flower KeyChain/4_flower_chain.jpg", hex: '#89CFF0' },
                                                                                                { name:"Yellow", image:"images/Keychain/Flower KeyChain/5_flower_chain.jpg", hex: '#FFFF00' }],
                                                                                      rating:4.5, 
                                                                                      sold:11 },
{ name:'lollipop Keychain', image:'images/Keychain/Lollipop KeyChain/1_llipop.jpg', category:'Keychain', 
                                                                                        price:20, 
                                                                                        colors:[{ name:"Red", image:"images/Keychain/Lollipop KeyChain/1_llipop.jpg", hex: '#E60012'},
                                                                                                { name:"Pink", image:"images/Keychain/Lollipop KeyChain/2_llipop.jpg", hex: '#F7A8C8' },
                                                                                                { name:"Blue", image:"images/Keychain/Lollipop KeyChain/3_llipop.jpg", hex: '#89CFF0' }], 
                                                                                        rating:4.6, 
                                                                                        sold:11, 
                                                                                        bestSeller:true },
{ name:'Milktea Keychain',  image:'images/Keychain/Milktea KeyChain/1_milktea_chain.jpg', category:'Keychain', 
                                                                                        price:25, 
                                                                                        colors:[{ name:"Pink", image:"images/Keychain/Milktea KeyChain/1_milktea_chain.jpg", hex: '#F7A8C8' },
                                                                                                { name:"Yellow", image:"images/Keychain/Milktea KeyChain/2_milktea_chain.jpg", hex: '#FFFF00' },
                                                                                                { name:"Red", image:"images/Keychain/Milktea KeyChain/3_milktea_chain.jpg", hex: '#E60012'},
                                                                                                { name:"Maroon", image:"images/Keychain/Milktea KeyChain/4_milktea_chain.jpg", hex: '#6B0F1A' },
                                                                                                { name:"Blue", image:"images/Keychain/Milktea KeyChain/5_milktea_chain.jpg", hex: '#89CFF0' },
                                                                                                { name:"Green", image:"images/Keychain/Milktea KeyChain/6_milktea_chain.jpg", hex: '#90EE90' }], 
                                                                                        rating:4.7, 
                                                                                        sold:5, 
                                                                                        badge:'limited' },
{ name:'Strawberry Keychain',image:'images/Keychain/Strawberry KeyChain/1_sberry_chain.jpg', category:'Keychain', 
                                                                                            price:20, 
                                                                                            base:259, 
                                                                                            colors:[{ name:"Pink", image:"images/Keychain/Strawberry KeyChain/1_sberry_chain.jpg", hex: '#F7A8C8' },
                                                                                                    { name:"Maroon", image:"images/Keychain/Strawberry KeyChain/2_sberry_chain.jpg", hex: '#6B0F1A' },
                                                                                                    { name:"Red", image:"images/Keychain/Strawberry KeyChain/3_sberry_chain.jpg", hex: '#E60012'},
                                                                                                    { name:"Blue", image:"images/Keychain/Strawberry KeyChain/4_sberry_chain.jpg", hex: '#89CFF0' },
                                                                                                    { name:"Purple", image:"images/Keychain/Strawberry KeyChain/5_sberry_chain.jpg", hex: '#8A5CE6' }], 
                                                                                            rating:4.8, 
                                                                                            sold:4, 
                                                                                            trending:true }
];

/* ============================================================
   ⚙️  ENGINE — builds the final PRODUCTS array.
   You normally do NOT need to touch anything below this line.
   ============================================================ */

// Gradient placeholder generator (used when no image is provided)
function makePlaceholder(emoji, tint){
  const c1 = tint || '#ffd1dc', c2 = '#c8b6ff';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'>`
    + `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>`
    + `<stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs>`
    + `<rect width='600' height='600' fill='url(#g)'/>`
    + `<text x='50%' y='52%' font-size='230' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'>${emoji}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Normalize a single color entry (string OR object) into a full variant
function normalizeColor(color, meta, fallbackImg){
  if(typeof color === 'string'){
    const hex = COLORS[color] || '#cccccc';
    return {
      name: color,
      hex,
      stock: 5 + Math.floor(Math.random()*95),
      img: fallbackImg || makePlaceholder(meta.emo, hex==='#f5f5f7' ? '#eef1f8' : meta.tint)
    };
  }
  // object form: { name, hex?, image?/img?, stock? }
  const hex = color.hex || COLORS[color.name] || '#cccccc';
  return {
    name: color.name || 'Default',
    hex,
    stock: color.stock != null ? color.stock : 5 + Math.floor(Math.random()*95),
    img: color.image || color.img || fallbackImg || makePlaceholder(meta.emo, meta.tint)
  };
}

// Build the final PRODUCTS list the app uses
const PRODUCTS = PRODUCT_LIST.map((p, index) => {
  const meta = CAT_META[p.category] || { emo:'🛍️', tint:'#eef1f8', custom:'none' };

  // Main image: use provided one, else first color image, else placeholder
  let mainImage = p.image || null;

  // Price / discount handling
  let base = p.base != null ? p.base : p.price;
  let off  = p.off != null ? p.off : (p.base && p.price ? Math.round((1 - p.price/p.base)*100) : 0);
  let price = p.price != null ? p.price
            : (p.base != null && off ? +(p.base*(1-off/100)).toFixed(2) : (p.base != null ? p.base : 0));
  if(off < 0) off = 0;

  // Colors -> variants (each can carry its own image)
  let colorInput = p.colors && p.colors.length ? p.colors : ['Default'];
  const colors = colorInput.map(c => normalizeColor(c, meta, mainImage));

  // If no main image was set, fall back to the first color's image
  if(!mainImage) mainImage = colors[0].img;

  return {
    id: index + 1,
    name: p.name,
    category: p.category,
    emo: meta.emo,
    tint: meta.tint,
    custom: p.custom || meta.custom,
    price,
    base,
    off,
    rating: p.rating != null ? p.rating : +(4.2 + Math.random()*0.7).toFixed(1),
    sold: p.sold != null ? p.sold : Math.floor(Math.random()*2000),
    badge: p.badge !== undefined ? p.badge : (off >= 40 ? 'sale' : null),
    colors,
    img: mainImage,
    flash: p.flash != null ? p.flash : off >= 20,
    newArrival: !!p.newArrival,
    bestSeller: p.bestSeller != null ? p.bestSeller : (p.sold||0) > 2500,
    trending: p.trending != null ? p.trending : (p.rating||0) > 4.7,
    desc: p.desc || `Beautifully crafted ${p.name.toLowerCase()} from our ${p.category} collection. Made with premium materials and finished by hand for a truly special touch. Perfect as a gift or a treat for yourself, this piece blends timeless elegance with modern design.`,
    specs: p.specs || {
      Material: ['Premium Alloy','Recycled Paper','Fresh Blooms','Solid Wood','Acrylic'][Math.floor(Math.random()*5)],
      Weight: (50 + Math.floor(Math.random()*450)) + 'g',
      Origin: 'Handmade by Jerose',
      Warranty: '30-day quality',
      Dimensions: (8 + Math.floor(Math.random()*20)) + 'cm'
    }
  };
});
