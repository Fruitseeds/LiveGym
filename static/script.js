/* -----------------------------------------------------------------------
   Simple front-end logic for LiveGym demo
   --------------------------------------------------------------------- */

const useMockData = false;   // set true for offline UI tests only

// Hard-coded demo users
const users = [
    { username: "Jonathan", password: "Zahavi",  role: "admin"  },
    { username: "Ayman",    password: "Taleb",   role: "admin"  },
    { username: "Evan",     password: "Rich",    role: "member" },
    { username: "Mathew",   password: "Isac",    role: "member" }
];

let currentRole      = null;
let refreshInterval  = null;

/* ---------- Login / Logout ------------------------------------------------ */

function login() {
    const uname = document.getElementById("username").value.trim();
    const pword = document.getElementById("password").value;
    const errorMsg = document.getElementById("login-error");

    const user = users.find(u => u.username === uname && u.password === pword);
    if (!user) {
        errorMsg.textContent = "Invalid username or password.";
        return;
    }
    errorMsg.textContent = "";

    currentRole = user.role;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("dashboard").style.display     = "block";
    document.getElementById("member-section").style.display =
        currentRole === "admin" ? "block" : "none";

    fetchData();
    refreshInterval = setInterval(fetchData, 10_000);  // 10-s refresh
}

function logout() {
    clearInterval(refreshInterval);
    currentRole = null;

    // reset UI
    document.getElementById("dashboard").style.display     = "none";
    document.getElementById("login-section").style.display = "block";
    document.getElementById("username").value  = "";
    document.getElementById("password").value  = "";
    document.getElementById("login-error").textContent = "";
    document.getElementById("occupancy").textContent   = "Loading…";
    document.getElementById("valid-members").innerHTML = "";
    document.getElementById("non-members").innerHTML   = "";
}

/* ---------- Helper: create action buttons --------------------------------- */

function createAction(text, cb) {
    const b = document.createElement("button");
    b.textContent = text;
    b.onclick = cb;
    b.style.marginLeft = "6px";
    return b;
}

/* ---------- Fetch data from API ------------------------------------------- */

async function fetchData() {
    let countData, memberData;

    if (useMockData) {
        countData  = { occupancy: 4 };
        memberData = {
            valid_members: [{ hash: "abc", name: "Evan" }],
            non_members:  [{ hash: "def", name: null }]
        };
    } else {
        countData  = await fetch("/count").then(r => r.json());
        memberData = await fetch("/members").then(r => r.json());
    }

    document.getElementById("occupancy").textContent = countData.occupancy;

    if (currentRole === "admin") {
        renderMemberLists(memberData);
    }
}

/* ---------- Render member / non-member lists ----------------------------- */

function renderMemberLists(data) {
    const vList = document.getElementById("valid-members");
    const nList = document.getElementById("non-members");
    vList.innerHTML = ""; nList.innerHTML = "";

    data.valid_members.forEach(obj => {
        const li = document.createElement("li");
        li.textContent = obj.name || obj.hash.slice(0, 8);
        li.appendChild(createAction("Remove", () => adminRemove(obj.hash)));
        li.appendChild(createAction("Block",  () => adminBlock(obj.hash)));
        vList.appendChild(li);
    });

    data.non_members.forEach(obj => {
        const li = document.createElement("li");
        li.textContent = obj.hash.slice(0, 8);
        li.appendChild(createAction("Add",   () => adminAdd(obj.hash)));
        li.appendChild(createAction("Block", () => adminBlock(obj.hash)));
        nList.appendChild(li);
    });
}

/* ---------- Admin actions ------------------------------------------------- */

async function adminAdd(hash) {
    const name = prompt("Member name:");
    await fetch(`/register/${hash}?name=${encodeURIComponent(name || "Member")}`);
    fetchData();
}

async function adminRemove(hash) {
    await fetch(`/remove/${hash}`);
    fetchData();
}

async function adminBlock(hash) {
    await fetch(`/block/${hash}`);
    fetchData();
}

/* ---------- Self-check endpoint ------------------------------------------ */

function selfCheck() {
    const h = prompt("Enter your device hash:");
    if (!h) return;
    fetch(`/selfcheck/${h}`)
        .then(() => alert("Checked in!"));
}
