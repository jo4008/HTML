// 달빛카페 화면 스크립트 (메뉴 데이터는 menu.js의 MENU 사용)

/* ───────── 테이블 번호 ─────────
   주소 뒤에 ?table=3 처럼 붙여서 접속하면 "3번 테이블"로 표시합니다.
   테이블마다 이 주소의 QR 코드를 붙여 두면 손님이 번호를 입력하지 않아도 됩니다.
   번호가 없으면 임시 문구를 보여줍니다. */
const PLACEHOLDER_TABLE = "테이블 번호 (임시)";
const MAX_QTY = 20; // 메뉴 하나당 담을 수 있는 최대 수량

// 저장소를 쓸 수 없는 환경(비공개 모드, 저장소 차단 등)에서도 오류 없이 동작하게 감쌉니다.
// kind: "session"(이번 방문 동안만) 또는 "local"(브라우저를 닫아도 유지)
function storageGet(kind, key) {
  try {
    const store = kind === "session" ? window.sessionStorage : window.localStorage;
    return store.getItem(key);
  } catch (e) {
    return null;
  }
}

function storageSet(kind, key, value) {
  try {
    const store = kind === "session" ? window.sessionStorage : window.localStorage;
    store.setItem(key, value);
  } catch (e) {
    // 저장이 안 되어도 주문 화면은 그대로 동작합니다.
  }
}

function storageRemove(kind, key) {
  try {
    const store = kind === "session" ? window.sessionStorage : window.localStorage;
    store.removeItem(key);
  } catch (e) {
    // 무시
  }
}

// 허용하는 번호: 숫자 1~3자리, 또는 영문·숫자·한글·하이픈 8자 이내
function validTable(value) {
  return typeof value === "string" && /^[0-9A-Za-z가-힣-]{1,8}$/.test(value);
}

function resolveTable() {
  let table = new URLSearchParams(location.search).get("table");
  if (validTable(table)) {
    storageSet("session", "moonlight-table", table);
  } else {
    // 주소에 번호가 없으면(새로고침 등) 이번 방문에서 쓰던 번호를 이어서 씁니다.
    table = storageGet("session", "moonlight-table");
  }
  return validTable(table) ? table : null;
}

const TABLE_ID = resolveTable();
const TABLE_LABEL = TABLE_ID === null
  ? PLACEHOLDER_TABLE
  : /^\d{1,3}$/.test(TABLE_ID) ? Number(TABLE_ID) + "번 테이블" : TABLE_ID + " 테이블";

// 장바구니는 테이블별로 따로 저장합니다.
const CART_KEY = "moonlight-cart:" + (TABLE_ID === null ? "none" : TABLE_ID);

const menuEl = document.getElementById("menu");
const tabEls = document.querySelectorAll(".tab");
const cartBar = document.getElementById("cart-bar");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const dialogEl = document.getElementById("order-dialog");
const orderBody = document.getElementById("order-body");

let currentType = "drinks";
const cart = new Map(); // id -> { name, price, qty }

/* ───────── 도우미 ───────── */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

// index.html 위쪽에 정의된 SVG 아이콘(연잎, 연꽃)을 만들어 줍니다.
function icon(id) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(svgNS, "use");
  use.setAttribute("href", "#" + id);
  svg.appendChild(use);
  return svg;
}

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

function cartTotals() {
  let count = 0;
  let total = 0;
  cart.forEach(function (line) {
    count += line.qty;
    total += line.qty * line.price;
  });
  return { count: count, total: total };
}

/* ───────── 별 만들기 ───────── */
function makeStars() {
  const box = document.getElementById("stars");
  for (let i = 0; i < 80; i++) {
    const star = el("span", "star");
    const size = 1 + Math.random() * 2.2;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDuration = 2 + Math.random() * 4 + "s";
    star.style.animationDelay = Math.random() * 5 + "s";
    box.appendChild(star);
  }
}

/* ───────── 메뉴 그리기 ───────── */
function createItem(type, item) {
  const li = el("li", "item" + (item.soldOut ? " sold-out" : ""));

  const top = el("div", "item-top");
  top.appendChild(el("span", "item-name", item.name));
  if (item.signature) {
    top.appendChild(el("span", "badge signature", "시그니처"));
  }
  if (item.recommended) {
    top.appendChild(el("span", "badge recommended", "추천"));
  }
  if (item.soldOut) {
    top.appendChild(el("span", "badge soldout", "품절"));
  }
  (item.temp || []).forEach(function (t) {
    top.appendChild(el("span", "badge " + t.toLowerCase(), t));
  });

  // 메뉴판처럼 "이름 ········ 가격" 한 줄로 보이게 점선을 넣습니다.
  top.appendChild(el("span", "leader"));
  top.appendChild(el("span", "item-price", formatPrice(item.price)));

  const buy = el("div", "item-buy");
  const addBtn = el("button", "add-btn", item.soldOut ? "품절" : "담기");
  addBtn.type = "button";
  if (item.soldOut) {
    // 품절 메뉴는 담을 수 없습니다.
    addBtn.disabled = true;
  } else {
    addBtn.addEventListener("click", function () {
      addToCart(type + ":" + item.name, item);
      addBtn.textContent = "담김 ✓";
      addBtn.classList.add("added");
      setTimeout(function () {
        addBtn.textContent = "담기";
        addBtn.classList.remove("added");
      }, 900);
    });
  }
  buy.appendChild(addBtn);

  li.appendChild(top);
  li.appendChild(el("p", "item-desc", item.desc));
  li.appendChild(buy);
  return li;
}

function renderMenu() {
  menuEl.replaceChildren();

  MENU[currentType].forEach(function (group) {
    const section = el("section", "category" + (group.minor ? " minor-note" : ""));
    const heading = el("h2", "");
    heading.appendChild(icon("icon-lotus"));
    heading.appendChild(document.createTextNode(group.category));
    section.appendChild(heading);
    if (group.minor) {
      section.appendChild(el("p", "minor-label", "전통 보조 메뉴"));
    }

    const list = el("ul", "items");
    group.items.forEach(function (item) {
      list.appendChild(createItem(currentType, item));
    });
    section.appendChild(list);
    menuEl.appendChild(section);
  });
}

tabEls.forEach(function (tab) {
  tab.addEventListener("click", function () {
    currentType = tab.dataset.type;
    tabEls.forEach(function (t) {
      const active = t === tab;
      t.classList.toggle("active", active);
      t.setAttribute("aria-selected", String(active));
    });
    renderMenu();
  });
});

/* ───────── 장바구니 ───────── */
function addToCart(id, item) {
  const line = cart.get(id);
  if (line) {
    if (line.qty < MAX_QTY) {
      line.qty += 1;
    }
  } else {
    cart.set(id, { name: item.name, price: item.price, qty: 1 });
  }
  updateCartBar();
}

function changeQty(id, delta) {
  const line = cart.get(id);
  if (!line) {
    return;
  }
  if (delta > 0 && line.qty >= MAX_QTY) {
    return;
  }
  line.qty += delta;
  if (line.qty <= 0) {
    cart.delete(id);
  }
  updateCartBar();
  if (cart.size === 0) {
    dialogEl.close();
  } else {
    renderOrderList();
  }
}

function updateCartBar() {
  const totals = cartTotals();
  cartBar.hidden = totals.count === 0;
  cartCountEl.textContent = totals.count;
  cartTotalEl.textContent = formatPrice(totals.total);
  saveCart();
}

/* ───────── 장바구니 저장·복원 ─────────
   새로고침해도 담은 메뉴가 남도록 브라우저에 저장합니다.
   저장하는 것은 메뉴 id와 수량뿐이고, 이름과 가격은 불러올 때 menu.js에서 다시 가져옵니다.
   (메뉴 가격이 바뀌었거나 품절·삭제된 메뉴가 장바구니에 남는 일을 막기 위해서입니다.) */
function findMenuItem(id) {
  const parts = id.split(":");
  const type = parts[0];
  const name = parts.slice(1).join(":");
  if (!Object.prototype.hasOwnProperty.call(MENU, type)) {
    return null;
  }
  for (const group of MENU[type]) {
    for (const item of group.items) {
      if (item.name === name) {
        return item;
      }
    }
  }
  return null;
}

function saveCart() {
  if (cart.size === 0) {
    storageRemove("local", CART_KEY);
    return;
  }
  const saved = [];
  cart.forEach(function (line, id) {
    saved.push({ id: id, qty: line.qty });
  });
  storageSet("local", CART_KEY, JSON.stringify(saved));
}

function loadCart() {
  const raw = storageGet("local", CART_KEY);
  if (!raw) {
    return;
  }
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch (e) {
    storageRemove("local", CART_KEY); // 깨진 데이터는 버립니다.
    return;
  }
  if (!Array.isArray(saved)) {
    storageRemove("local", CART_KEY);
    return;
  }
  saved.forEach(function (entry) {
    if (!entry || typeof entry.id !== "string" || !Number.isInteger(entry.qty) || entry.qty < 1) {
      return;
    }
    const item = findMenuItem(entry.id);
    if (!item || item.soldOut) {
      return; // 없어졌거나 품절된 메뉴는 빼고 불러옵니다.
    }
    cart.set(entry.id, { name: item.name, price: item.price, qty: Math.min(entry.qty, MAX_QTY) });
  });
}

/* ───────── 주문 창 ───────── */
function renderOrderList() {
  const wrap = el("div", "order");
  wrap.appendChild(el("h2", "", "주문 확인"));
  wrap.lastChild.id = "order-title";
  wrap.appendChild(el("p", "order-table", TABLE_LABEL));

  const list = el("ul", "order-list");
  cart.forEach(function (line, id) {
    const row = el("li", "order-row");
    row.appendChild(el("span", "order-name", line.name));

    const qty = el("div", "qty");
    const minus = el("button", "", "−");
    minus.type = "button";
    minus.setAttribute("aria-label", line.name + " 하나 빼기");
    minus.addEventListener("click", function () { changeQty(id, -1); });
    const plus = el("button", "", "+");
    plus.type = "button";
    plus.setAttribute("aria-label", line.name + " 하나 더하기");
    plus.addEventListener("click", function () { changeQty(id, 1); });
    qty.appendChild(minus);
    qty.appendChild(el("span", "", String(line.qty)));
    qty.appendChild(plus);

    row.appendChild(qty);
    row.appendChild(el("span", "order-line-price", formatPrice(line.price * line.qty)));
    list.appendChild(row);
  });
  wrap.appendChild(list);

  const total = el("div", "order-total");
  total.appendChild(el("span", "", "합계"));
  total.appendChild(el("span", "", formatPrice(cartTotals().total)));
  wrap.appendChild(total);

  const actions = el("div", "order-actions");
  const more = el("button", "btn-ghost", "더 담기");
  more.type = "button";
  more.addEventListener("click", function () { dialogEl.close(); });
  const submit = el("button", "btn-main", "주문하기");
  submit.type = "button";
  submit.addEventListener("click", submitOrder);
  actions.appendChild(more);
  actions.appendChild(submit);
  wrap.appendChild(actions);

  orderBody.replaceChildren(wrap);
}

function submitOrder() {
  const totals = cartTotals();
  const wrap = el("div", "order");
  wrap.appendChild(el("h2", "", "주문이 접수되었어요 🌙"));
  wrap.lastChild.id = "order-title";
  wrap.appendChild(el("p", "order-table", TABLE_LABEL));
  wrap.appendChild(el("p", "", "메뉴 " + totals.count + "개 · 합계 " + formatPrice(totals.total)));
  wrap.appendChild(el("p", "done-note", "시연용 화면이라 실제 주문은 전달되지 않아요."));

  const actions = el("div", "order-actions");
  const close = el("button", "btn-main", "닫기");
  close.type = "button";
  close.addEventListener("click", function () { dialogEl.close(); });
  actions.appendChild(close);
  wrap.appendChild(actions);

  orderBody.replaceChildren(wrap);
  cart.clear();
  updateCartBar();
}

document.getElementById("cart-open").addEventListener("click", function () {
  renderOrderList();
  dialogEl.showModal();
});

/* ───────── 시작 ───────── */
document.getElementById("table-info").textContent = TABLE_LABEL;
makeStars();
renderMenu();
loadCart(); // 새로고침 전에 담아 둔 메뉴를 되살립니다.
updateCartBar();
