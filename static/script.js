const useMockData = false;

// User login database
const users = [
    { username: "Ayman",    password: "Taleb",   role: "employee" },
    { username: "Jonathan", password: "Zahavi",  role: "employee" },
    { username: "Evan",     password: "Rich",    role: "customer" },
    { username: "Mathew",   password: "Isac",    role: "customer" }
];

let currentRole = null;
let refreshInterval = null;

function login() {
    const uname = document.getElementById('username').value;
    const pword = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    const user = users.find(u => u.username === uname && u.password === pword);

    if (user) {
        currentRole = user.role;

        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('logout-button').style.display = 'inline-block';

        if (currentRole === 'employee') {
            document.getElementById('members-section').style.display = 'block';
            document.getElementById('nonmembers-section').style.display = 'block';
        } else {
            document.getElementById('members-section').style.display = 'none';
            document.getElementById('nonmembers-section').style.display = 'none';
        }

        fetchData();
        refreshInterval = setInterval(fetchData, 10000);
    } else {
        errorMsg.textContent = "Invalid username or password.";
    }
}

function logout() {
    currentRole = null;
    clearInterval(refreshInterval);

    document.getElementById('occupancy').textContent = "Loading...";
    document.getElementById('valid-members').innerHTML = '';
    document.getElementById('non-members').innerHTML = '';

    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('login-error').textContent = '';

    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function createAction(text, cb) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.onclick = cb;
    btn.style.marginLeft = '6px';
    return btn;
}

async function fetchData() {
    let countData, memberData;

    if (useMockData) {
        countData = { occupancy: 4 };
        memberData = {
            valid_members: [{ hash: "abc", name: "Evan" }],
            non_members: [{ hash: "def", name: null }]
        };
    } else {
        countData = await fetch('/count').then(res => res.json());
        memberData = await fetch('/members').then(res => res.json());
    }

    document.getElementById('occupancy').textContent = countData.occupancy;

    if (currentRole === 'employee') {
        renderMemberLists(memberData);
    }
}

function renderMemberLists(data) {
    const vList = document.getElementById('valid-members');
    const nList = document.getElementById('non-members');
    vList.innerHTML = '';
    nList.innerHTML = '';

    data.valid_members.forEach(obj => {
        const li = document.createElement('li');
        li.textContent = obj.name || obj.hash.slice(0, 8);
        li.appendChild(createAction('Remove', () => adminRemove(obj.hash)));
        li.appendChild(createAction('Block', () => adminBlock(obj.hash)));
        vList.appendChild(li);
    });

    data.non_members.forEach(obj => {
        const li = document.createElement('li');
        li.textContent = obj.hash.slice(0, 8);
        li.appendChild(createAction('Add', () => adminAdd(obj.hash)));
        li.appendChild(createAction('Block', () => adminBlock(obj.hash)));
        nList.appendChild(li);
    });
}

async function adminAdd(hash) {
    const name = prompt("Member name:");
    if (!name) return;
    await fetch(`/register/${hash}?name=${encodeURIComponent(name)}`);
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

// Self check-in logic
function selfCheck() {
    const h = prompt("Enter your device hash:");
    if (!h) return;

    fetch(`/selfcheck/${h}`)
        .then(res => {
            if (!res.ok) throw new Error("Check-in failed");
            return res.json();
        })
        .then(data => {
            alert(data.message || "Checked in!");
        })
        .catch(err => {
            alert("Self-check failed.");
            console.error(err);
        });
}
