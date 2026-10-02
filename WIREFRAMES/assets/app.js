"use strict";

// All journey state stays in memory; the wireframe has no server or storage.
const collections = [
  { id: "crystal", name: "Crystal", description: "Photo-engraved cubes, hearts, spheres, icebergs, custom shapes and crystal keychains." },
  { id: "wood", name: "Wood", description: "Round and square natural wood slices and wooden keychains, personalized with photos, names or logos." },
  { id: "light", name: "Illuminated & reflective", description: "Engraved acrylic with wooden LED bases, alongside personalized mirrors." },
  { id: "metal", name: "Metal", description: "Personalized aluminum photo pieces and aluminum business cards." },
  { id: "celebration", name: "Wedding & celebration", description: "Custom acrylic signs, names, table details and celebration gifts." },
  { id: "corporate", name: "Corporate gifts", description: "Branded everyday objects and curated sets. Availability depends on equipment and material compatibility." }
];
const products = [
  { id: "crystal-cube", collection: "crystal", name: "The memory cube", detail: "Photo-engraved crystal cube", art: "crystal", options: ["Small cube", "Medium cube", "Large cube"] },
  { id: "crystal-heart", collection: "crystal", name: "A heart to keep", detail: "Photo-engraved crystal heart", art: "crystal", options: ["Small heart", "Large heart"] },
  { id: "crystal-sphere", collection: "crystal", name: "The memory sphere", detail: "Photo-engraved crystal sphere", art: "crystal", options: ["Small sphere", "Large sphere"] },
  { id: "crystal-iceberg", collection: "crystal", name: "The crystal iceberg", detail: "Sculptural photo-engraved crystal", art: "crystal", options: ["Small iceberg", "Large iceberg"] },
  { id: "crystal-custom", collection: "crystal", name: "Your crystal shape", detail: "Bespoke shape; feasibility requires a quote", art: "crystal", options: ["Custom shape"], quoteOnly: true },
  { id: "crystal-keychain", collection: "crystal", name: "A little crystal memory", detail: "Personalized crystal keychain", art: "crystal", options: ["Rectangle", "Heart"] },
  { id: "wood-round", collection: "wood", name: "The natural keepsake", detail: "Round natural wood slice", art: "wood", options: ["Small round slice", "Large round slice"] },
  { id: "wood-square", collection: "wood", name: "A story in wood", detail: "Square natural wood slice", art: "wood", options: ["Small square slice", "Large square slice"] },
  { id: "wood-keychain", collection: "wood", name: "Everyday, made yours", detail: "Wooden photo, name or logo keychain", art: "wood", options: ["Round keychain", "Rectangle keychain"] },
  { id: "acrylic-led", collection: "light", name: "A little light", detail: "Engraved acrylic with a wooden LED base", art: "light", options: ["Warm light", "Color-changing light (subject to availability)"] },
  { id: "mirror", collection: "light", name: "A personal reflection", detail: "Personalized mirror", art: "metal", options: ["Round mirror", "Rectangle mirror"] },
  { id: "aluminum-photo", collection: "metal", name: "The modern memory", detail: "Personalized aluminum photo piece", art: "metal", options: ["Portrait", "Landscape"] },
  { id: "business-card", collection: "metal", name: "A lasting introduction", detail: "Aluminum business cards", art: "metal", options: ["Single-sided", "Double-sided"] },
  { id: "wedding-sign", collection: "celebration", name: "Welcome to forever", detail: "Custom acrylic wedding sign", art: "celebration", options: ["Arch sign", "Rectangle sign"] },
  { id: "table-details", collection: "celebration", name: "A place for everyone", detail: "Personalized names and table details", art: "celebration", options: ["Place names", "Table numbers"] },
  { id: "celebration-gift", collection: "celebration", name: "Mark the moment", detail: "Personalized celebration gift", art: "celebration", options: ["Names & date", "Custom message"] },
  ...[
    ["cup", "The branded cup", "Cups"],
    ["mug", "A thoughtful everyday", "Mugs"],
    ["bottle", "Carry your story", "Water bottles"],
    ["notebook", "Room for ideas", "Notebooks"],
    ["pen", "Make your mark", "Pens"],
    ["keychain", "A daily connection", "Keychains"],
    ["gift-set", "The appreciation set", "Curated gift sets"]
  ].map(([id, name, detail]) => ({ id, collection: "corporate", name, detail, art: "corporate", options: ["Company logo", "Logo & individual names"], quoteOnly: true }))
];
const artContents = {
  crystal: '<div class="small-crystal"><span>always<br><em>you & me</em></span></div>',
  wood: '<div class="wood-disc"><span>the<br><em>little things</em></span></div>',
  light: '<div class="acrylic-piece"><span>you are<br><em>my light</em></span></div><div class="led-base"></div>',
  metal: '<div class="metal-piece"><span>LUMA<br><small>A MARK OF DISTINCTION</small></span></div>',
  celebration: '<div class="celebration-piece"><span>Welcome<br><em>to our forever</em><small>AMELIA & NOAH</small></span></div>',
  corporate: '<div class="gift-box"><span>WITH<br>APPRECIATION</span></div>'
};
const dialog = document.getElementById("journey-dialog");
const content = document.getElementById("dialog-content");
let personalization = null;
let artworkFile = null;
let previewURL = null;
let returnHash = "#collections";
let quoteDraft = null;
let quoteArtworkFile = null;
let quoteContextId = null;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function productArt(product) {
  return `<div class="collection-art ${product.art}-scene" role="img" aria-label="Material concept illustration, not a photograph of ${escapeHTML(product.name)}">${artContents[product.art]}<span class="art-label">MATERIAL CONCEPT</span></div>`;
}

function productCard(product) {
  return `<article class="product-card">${productArt(product)}<h3>${product.name}</h3><p>${product.detail}</p><a class="text-link" href="#personalize/${product.id}">${product.quoteOnly ? "Personalize & request a quote" : "Make it yours"} <span aria-hidden="true">↗</span></a></article>`;
}

function intro(eyebrow, title, description) {
  return `<div class="dialog-intro"><p class="eyebrow">${eyebrow}</p><h2 id="dialog-title" tabindex="-1">${title}</h2><p>${description}</p></div>`;
}

function announce(message) {
  document.getElementById("announcements").textContent = message;
}

function clearArtwork() {
  if (previewURL) URL.revokeObjectURL(previewURL);
  previewURL = null;
  artworkFile = null;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function summaryRow(label, value) {
  return `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value || "Not provided")}</dd></div>`;
}

function renderShop(id) {
  const collection = collections.find(item => item.id === id);
  const title = collection ? collection.name : "All pieces";
  const description = collection ? collection.description : "Find a material that tells your story. All specifications and prices require confirmation.";
  content.innerHTML = intro("THE COLLECTIONS", title, description) +
    `<nav class="collection-tabs" aria-label="Collection filters">${[{ id: "all", name: "All pieces" }, ...collections].map(item => `<a href="#shop/${item.id}" ${item.id === id ? 'aria-current="page"' : ""}>${item.name}</a>`).join("")}</nav>
    <div class="product-grid">${products.filter(product => !collection || product.collection === id).map(productCard).join("")}</div>`;
}

function renderPersonalization(id) {
  const product = products.find(item => item.id === id);
  if (!product) return renderNotFound();
  if (!personalization || personalization.productId !== id) {
    clearArtwork();
    personalization = { productId: id };
  }
  const draft = personalization;
  content.innerHTML = intro("01 / MAKE IT PERSONAL", product.name, "Choose your details. This local preview is a layout concept, not a production proof.") +
    `<div class="dialog-layout"><aside class="preview-panel">${productArt(product)}<h3>Your story starts here.</h3><p>${product.detail}. Final sizes, pricing and finishes are to be confirmed.</p><img id="artwork-preview" class="preview-image" alt="Your selected artwork, shown locally for reference" hidden><p id="text-preview" class="preview-caption"></p><p class="preview-label">Illustrative preview · engraving layout requires approval</p></aside>
    <form id="personalization-form">
      <fieldset><legend>Your artwork & words</legend>
        <label for="artwork">Photo or logo (optional)</label><input id="artwork" type="file" accept="image/jpeg,image/png" aria-describedby="upload-help upload-error">
        <p id="upload-help" class="field-help">PNG or JPEG, up to 10 MB. Stays on your device; nothing is uploaded.${artworkFile ? ` Selected: ${escapeHTML(artworkFile.name)}.` : ""}</p>
        <p id="upload-error" class="error-message" role="alert"></p>
        <label for="personal-text">Personal message, name or date</label><input id="personal-text" name="text" maxlength="100" value="${escapeHTML(draft.text || "")}" placeholder="Words worth keeping">
        <p class="field-help">Provide artwork, text, or placement instructions to continue.</p>
        <label for="placement">Placement & special instructions</label><textarea id="placement" name="placement" maxlength="1000" placeholder="For example: photo centred, name below">${escapeHTML(draft.placement || "")}</textarea>
      </fieldset>
      <fieldset><legend>The finishing details</legend><div class="form-grid">
        <label>Product option<select name="option">${product.options.map(option => `<option ${draft.option === option ? "selected" : ""}>${escapeHTML(option)}</option>`).join("")}</select></label>
        <label>Quantity<input type="number" name="quantity" min="1" max="10000" step="1" required value="${escapeHTML(draft.quantity || "1")}"></label>
        <label class="full-width">Packaging<select name="packaging">${["Standard presentation", "Gift box (subject to availability)", "Custom business packaging — quote required"].map(option => `<option ${draft.packaging === option ? "selected" : ""}>${option}</option>`).join("")}</select></label>
      </div></fieldset>
      <label class="check-label"><input type="checkbox" name="approval" required ${draft.approval ? "checked" : ""}><span>I understand this is not an engraving proof. Photo/logo and custom-layout work requires artwork approval before production.</span></label>
      <p id="personalization-error" class="error-message" role="alert"></p>
      <div class="form-actions">${product.quoteOnly ? "" : '<button class="button" type="submit" name="journey" value="checkout">Review individual order →</button>'}<button class="button ${product.quoteOnly ? "" : "button-secondary"}" type="submit" name="journey" value="quote">Request a ${product.quoteOnly ? "tailored" : "business"} quote →</button></div>
      <p class="field-help">Demo only. No live pricing, production order or payment.</p>
    </form></div>`;
  const form = document.getElementById("personalization-form");
  const image = document.getElementById("artwork-preview");
  if (previewURL) {
    image.src = previewURL;
    image.hidden = false;
  }
  function updateDraft() {
    Object.assign(personalization, formData(form));
    personalization.approval = form.elements.approval.checked;
    document.getElementById("text-preview").textContent = personalization.text || "Your words, beautifully considered.";
  }
  form.addEventListener("input", updateDraft);
  form.addEventListener("change", updateDraft);
  document.getElementById("artwork").addEventListener("change", event => {
    const file = event.target.files[0];
    const error = document.getElementById("upload-error");
    error.textContent = "";
    clearArtwork();
    image.hidden = true;
    image.removeAttribute("src");
    document.getElementById("upload-help").textContent = "PNG or JPEG, up to 10 MB. Stays on your device; nothing is uploaded.";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      error.textContent = "Choose a PNG or JPEG image no larger than 10 MB.";
      event.target.value = "";
      return;
    }
    artworkFile = file;
    previewURL = URL.createObjectURL(file);
    image.src = previewURL;
    image.hidden = false;
    document.getElementById("upload-help").textContent = `Selected: ${file.name}. Local only; not uploaded.`;
    announce("Artwork selected for a local reference preview.");
  });
  image.addEventListener("error", () => {
    clearArtwork();
    image.hidden = true;
    image.removeAttribute("src");
    document.getElementById("artwork").value = "";
    document.getElementById("upload-help").textContent = "PNG or JPEG, up to 10 MB. Stays on your device; nothing is uploaded.";
    document.getElementById("upload-error").textContent = "This image could not be read. Please select a valid PNG or JPEG.";
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    updateDraft();
    if (!artworkFile && !personalization.text.trim() && !personalization.placement.trim()) {
      document.getElementById("personalization-error").textContent = "Add artwork, text, or instructions so we can personalize your piece.";
      document.getElementById("personal-text").focus();
      return;
    }
    const needsQuote = product.quoteOnly || personalization.packaging.startsWith("Custom business");
    location.hash = event.submitter.value === "quote" || needsQuote ? `#quote/${product.id}` : "#checkout";
  });
  updateDraft();
}

function orderSummary() {
  const product = products.find(item => item.id === personalization.productId);
  return `<dl class="summary-list">${summaryRow("Piece", product.name)}${summaryRow("Option", personalization.option)}${summaryRow("Quantity", personalization.quantity)}${summaryRow("Personal text", personalization.text)}${summaryRow("Artwork", artworkFile ? `${artworkFile.name} (local only)` : "No artwork selected")}${summaryRow("Instructions", personalization.placement)}${summaryRow("Packaging", personalization.packaging)}${summaryRow("Artwork approval", "Required before applicable production work")}${summaryRow("Price & delivery", "To be confirmed — not a live order")}</dl>`;
}

function renderCheckout() {
  if (!personalization || !personalization.approval) {
    content.innerHTML = intro("INDIVIDUAL ORDER", "Begin with your piece.", "Personalize a product before reviewing an individual order.") + '<a class="button" href="#shop/all">Choose a piece →</a>';
    return;
  }
  const product = products.find(item => item.id === personalization.productId);
  if (product.quoteOnly || personalization.packaging.startsWith("Custom business")) {
    location.hash = `#quote/${product.id}`;
    return;
  }
  content.innerHTML = intro("02 / REVIEW YOUR GIFT", "A thoughtful final check.", "This demonstrates an individual checkout. No payment, contact details, or shipping information are collected.") +
    `<div class="dialog-layout"><aside class="preview-panel">${productArt(product)}<h3>${product.name}</h3><p>Production checkout will include confirmed prices, shipping, taxes and secure payment. These are not simulated as real charges.</p></aside><div>${orderSummary()}<form id="checkout-form"><label class="check-label"><input type="checkbox" required><span>I understand that this is a demo and no real order will be placed.</span></label><div class="form-actions"><a class="button button-secondary" href="#personalize/${product.id}">Edit personalization</a><button class="button" type="submit">Complete demo order →</button></div></form></div></div>`;
  document.getElementById("checkout-form").addEventListener("submit", event => {
    event.preventDefault();
    content.innerHTML = `<div class="confirmation"><span class="confirmation-icon" aria-hidden="true">✧</span>${intro("03 / DEMO JOURNEY COMPLETE", "A gift with your story.", "No order was placed, no payment taken and no artwork sent. A production website would now show an order reference, artwork approval steps and confirmed delivery details.")}<a class="button" href="#collections">Back to the collections →</a></div>`;
    announce("Demonstration completed. No order was placed.");
    focusTitle();
  });
}

function renderQuote(id = null) {
  const product = personalization && id === personalization.productId && products.find(item => item.id === id);
  const contextId = product ? product.id : null;
  if (quoteContextId !== contextId) {
    quoteDraft = null;
    quoteArtworkFile = null;
    quoteContextId = contextId;
  }
  const draft = quoteDraft || {};
  content.innerHTML = intro("BUSINESS & BESPOKE GIFTING", "A gesture, thoughtfully scaled.", "Tell us what you have in mind. This form demonstrates a quote request; it does not send an enquiry.") +
    `<div class="dialog-layout"><aside class="preview-panel"><h3>${product ? escapeHTML(product.name) : "Considered gifting for your business."}</h3><p>Logo-led pieces, individual names, team welcomes and milestone gifts. Materials and engraving methods require compatibility checks.</p>${product ? orderSummary() : "<p class=\"field-help\">No confirmed minimum quantities, prices or lead times. These will be established after artwork and material review.</p>"}<p class="field-help">Local prototype: information stays in this page’s memory until refreshed. Do not enter confidential information.</p></aside>
    <form id="quote-form"><fieldset><legend>Your business</legend><div class="form-grid">
      <label>Company name<input name="company" required maxlength="150" autocomplete="organization" value="${escapeHTML(draft.company || "")}"></label>
      <label>Contact name<input name="contact" required maxlength="100" autocomplete="name" value="${escapeHTML(draft.contact || "")}"></label>
      <label class="full-width">Work email<input name="email" type="email" required maxlength="254" autocomplete="email" value="${escapeHTML(draft.email || "")}"></label>
    </div></fieldset>
    <fieldset><legend>The gift brief</legend><div class="form-grid">
      <label class="full-width">Product or collection<select name="product">${["Not sure — help me curate", ...products.map(item => item.name)].map(name => `<option ${name === (draft.product || (product && product.name)) ? "selected" : ""}>${escapeHTML(name)}</option>`).join("")}</select></label>
      <label>Estimated quantity<input name="quantity" type="number" min="1" max="1000000" step="1" required value="${escapeHTML(draft.quantity || (product && personalization.quantity) || "")}"></label>
      <label>Preferred delivery date<input name="deadline" type="date" required></label>
      <label class="full-width">Delivery destination<input name="destination" maxlength="200" required placeholder="City and country" value="${escapeHTML(draft.destination || "")}"></label>
      <label class="full-width">Packaging preferences<select name="packaging">${["Standard presentation", "Individual gift boxes", "Custom company-branded packaging", "Please advise"].map(name => `<option ${draft.packaging === name ? "selected" : ""}>${name}</option>`).join("")}</select></label>
      <label class="full-width">Branding, budget & special requirements<textarea name="requirements" maxlength="2000" required placeholder="Logo placement, individual names, occasion, budget or any other details">${escapeHTML(draft.requirements || (product && (personalization.placement || personalization.text)) || "")}</textarea></label>
      <div class="full-width"><label for="quote-artwork">Company artwork (optional)</label><input id="quote-artwork" type="file" accept="image/jpeg,image/png" aria-describedby="quote-upload-help quote-upload-error"><p class="field-help" id="quote-upload-help">PNG or JPEG, up to 10 MB. Local reference only.${quoteArtworkFile ? ` Selected: ${escapeHTML(quoteArtworkFile.name)}.` : ""}</p><p class="error-message" id="quote-upload-error" role="alert"></p></div>
    </div></fieldset>
    <label class="check-label"><input type="checkbox" required><span>I understand availability, material compatibility, pricing, delivery and artwork approval require confirmation. This request will not be sent.</span></label>
    <button class="button" type="submit">Review demo quote request →</button></form></div>`;
  const deadline = content.querySelector('[name="deadline"]');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  deadline.min = today;
  deadline.value = draft.deadline || "";
  const form = document.getElementById("quote-form");
  form.addEventListener("input", () => { quoteDraft = formData(form); });
  form.addEventListener("change", () => { quoteDraft = formData(form); });
  document.getElementById("quote-artwork").addEventListener("change", event => {
    const file = event.target.files[0];
    const error = document.getElementById("quote-upload-error");
    error.textContent = "";
    quoteArtworkFile = null;
    document.getElementById("quote-upload-help").textContent = "PNG or JPEG, up to 10 MB. Local reference only.";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      error.textContent = "Choose a PNG or JPEG image no larger than 10 MB.";
      event.target.value = "";
      return;
    }
    quoteArtworkFile = file;
    document.getElementById("quote-upload-help").textContent = `Selected: ${file.name}. Local only; not uploaded.`;
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    quoteDraft = formData(form);
    content.innerHTML = intro("REVIEW YOUR DEMO BRIEF", "Ready for a conversation.", "Nothing has been sent. A production form would securely submit these details to the Luma ART team.") +
      `<dl class="summary-list">${[["Company", "company"], ["Contact", "contact"], ["Email", "email"], ["Product", "product"], ["Quantity", "quantity"], ["Preferred delivery", "deadline"], ["Destination", "destination"], ["Packaging", "packaging"], ["Requirements", "requirements"]].map(([label, key]) => summaryRow(label, quoteDraft[key])).join("")}${summaryRow("Company artwork", quoteArtworkFile ? `${quoteArtworkFile.name} (local only)` : "Not provided")}${product ? summaryRow("Personalized piece", product.name) + summaryRow("Personal text", personalization.text) + summaryRow("Placement", personalization.placement) + summaryRow("Product artwork", artworkFile ? `${artworkFile.name} (local only)` : "Not provided") : ""}</dl>
      <p class="field-help">Next in production: compatibility check → tailored quotation → artwork approval → production. Requested dates are not delivery commitments.</p><div class="form-actions"><button id="edit-quote" class="button button-secondary" type="button">Edit your brief</button><a class="button" href="#corporate">Finish demo →</a></div>`;
    document.getElementById("edit-quote").addEventListener("click", () => { renderQuote(quoteContextId); focusTitle(); });
    announce("Demo quote brief ready for review. No enquiry has been sent.");
    focusTitle();
  });
}

function renderSupport(page) {
  const pages = {
    about: ["THE LUMA ART STORY", "Objects with meaning.", '<p>Luma ART brings together personalized gifting for individuals and considered gifting for businesses. The vision is simple: turn a photo, a name or a company mark into an object worth keeping.</p><h3>A material-led approach</h3><p>Crystal, natural wood, acrylic, mirrors and aluminum offer different ways to tell a story. The finished design should respect the material, the occasion and the person receiving it.</p><h3>Before launch</h3><p>This is proposed brand copy. The founder story, actual workshop techniques, equipment, production photography and quality standards need to be supplied and verified.</p><a class="button" href="#craftsmanship">Explore our craft →</a>'],
    guidance: ["PERSONALIZATION GUIDANCE", "A good story starts with good artwork.", '<h3>Photos</h3><ul><li>Use an original, high-resolution photograph, not a screenshot.</li><li>Choose a well-lit subject with visible faces and clear detail.</li><li>Provide cropping or placement instructions if they matter.</li></ul><h3>Logos & words</h3><ul><li>The prototype accepts PNG or JPEG up to 10 MB. Production formats will be confirmed.</li><li>Check spelling, dates and names carefully.</li><li>Upload only artwork you own or have permission to use.</li></ul><h3>Approval comes first</h3><p>Local previews do not simulate engraving or represent final proofs. The production artwork workflow must confirm layout, material compatibility and applicable approval requirements before making your piece.</p><a class="button" href="#shop/all">Choose your canvas →</a>'],
    contact: ["CONTACT & SUPPORT", "Let’s make something meaningful.", '<p>For individual personalization, begin with a piece. For business orders, use the quote journey to outline your project.</p><h3>Contact details to be confirmed</h3><p>The public email, phone number, opening hours and studio location will be supplied before launch. This prototype has no live chat or connected contact service.</p><div class="form-actions"><a class="button" href="#quote">Explore a quote request →</a><a class="button button-secondary" href="#faq">Read the FAQs</a></div>']
  };
  const [eyebrow, title, copy] = pages[page];
  content.innerHTML = intro(eyebrow, title, "Luma ART · Design prototype") + `<div class="support-copy">${copy}</div>`;
}

function renderNotFound() {
  content.innerHTML = intro("A DIFFERENT START", "This piece isn’t in the collection.", "Return to the collections to choose an available concept.") + '<a class="button" href="#shop/all">Explore all pieces →</a>';
}

function focusTitle() {
  document.getElementById("dialog-title")?.focus();
  dialog.scrollTop = 0;
}

function route() {
  const hash = location.hash || "#home";
  const [page, id] = hash.slice(1).split("/");
  const modalPages = ["shop", "personalize", "checkout", "quote", "about", "guidance", "contact"];
  if (!modalPages.includes(page)) {
    returnHash = hash;
    if (dialog.open) dialog.close();
    return;
  }
  if (page === "shop") renderShop(id || "all");
  else if (page === "personalize") renderPersonalization(id);
  else if (page === "checkout") renderCheckout();
  else if (page === "quote") renderQuote(id);
  else renderSupport(page);
  if (!dialog.open) dialog.showModal();
  focusTitle();
}

document.querySelector(".close-button").addEventListener("click", () => {
  location.hash = returnHash;
});
dialog.addEventListener("cancel", event => {
  event.preventDefault();
  location.hash = returnHash;
});
window.addEventListener("hashchange", route);
window.addEventListener("pagehide", clearArtwork);
document.getElementById("featured-products").innerHTML = ["crystal-heart", "wood-round", "acrylic-led"].map(id => productCard(products.find(product => product.id === id))).join("");
route();
