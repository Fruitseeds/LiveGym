
const useMockData = false;

<<<<<<< HEAD
// User login database
const users = [
    { username: "Ayman",    password: "Taleb",   role: "employee" },
    { username: "Jonathan", password: "Zahavi",  role: "employee" },
    { username: "Evan",     password: "Rich",    role: "customer" },
    { username: "Mathew",   password: "Isac",    role: "customer" }
=======
// very simple auth – demo only
const users = [
    { username: "Ayman",     password: "Taleb",  role: "admin" },
    { username: "Jonathan",  password: "Zahavi", role: "admin" },
    { username: "Evan",      password: "Rich",   role: "member" },
    { username: "Mathew",    password: "Isac",   role: "member" }
>>>>>>> e736224 (Final commit)
];

let currentRole = null;
let refreshInterval = null;

function login() {
    const uname = document.getElementById('username').value;
    const pword = document.getElementById('password').value;
    const errorMSG = document.getElementById('login-error');

    const user = users.find(u => u.username === uname && u.password === pword);
<<<<<<< HEAD

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
=======
    if (!user) {
        errorMSG.textContent = "Invalid username or password.";
        return;
>>>>>>> e736224 (Final commit)
    }

    currentRole = user.role;
    // toggle UI
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('member-section').style.display = (currentRole === 'admin') ? 'block' : 'none';

    fetchData();
    refreshInterval = setInterval(fetchData, 10000);
}

function logout() {
    currentRole = null;
    clearInterval(refreshInterval);

    // clear UI
    document.getElementById('occupancy').textContent = "Loading...";
    document.getElementById('valid-members').innerHTML = '';
    document.getElementById('non-members').innerHTML = '';

    // show login
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('login-error').textContent = '';

    // reset form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function createAction(text, cb) {
<<<<<<< HEAD
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.onclick = cb;
    btn.style.marginLeft = '6px';
    return btn;
=======
    const b = document.createElement('button');
    b.textContent = text;
    b.onclick = cb;
    b.style.marginLeft = '6px';
    return b;
>>>>>>> e736224 (Final commit)
}

async function fetchData() {
    let countData, memberData;

    if (useMockData) {
        countData = { occupancy: 4 };
        memberData = {
<<<<<<< HEAD
            valid_members: [{ hash: "abc", name: "Evan" }],
            non_members: [{ hash: "def", name: null }]
=======
            valid_members: [{hash:"abc", name:"Evan"}],
            non_members:  [{hash:"def", name:null}]
>>>>>>> e736224 (Final commit)
        };
    } else {
        countData   = await fetch('/count').then(r => r.json());
        memberData  = await fetch('/members').then(r => r.json());
    }

    document.getElementById('occupancy').textContent = countData.occupancy;

<<<<<<< HEAD
    if (currentRole === 'employee') {
=======
    if (currentRole === 'admin') {
>>>>>>> e736224 (Final commit)
        renderMemberLists(memberData);
    }
}

function renderMemberLists(data) {
    const vList = document.getElementById('valid-members');
    const nList = document.getElementById('non-members');
<<<<<<< HEAD
    vList.innerHTML = '';
    nList.innerHTML = '';

    data.valid_members.forEach(obj => {
        const li = document.createElement('li');
        li.textContent = obj.name || obj.hash.slice(0, 8);
        li.appendChild(createAction('Remove', () => adminRemove(obj.hash)));
        li.appendChild(createAction('Block', () => adminBlock(obj.hash)));
=======
    vList.innerHTML = ''; nList.innerHTML = '';

    data.valid_members.forEach(obj => {
        const li = document.createElement('li');
        li.textContent = obj.name || obj.hash.slice(0,8);
        li.appendChild(createAction('Remove', () => adminRemove(obj.hash)));
        li.appendChild(createAction('Block',  () => adminBlock(obj.hash)));
>>>>>>> e736224 (Final commit)
        vList.appendChild(li);
    });

    data.non_members.forEach(obj => {
        const li = document.createElement('li');
<<<<<<< HEAD
        li.textContent = obj.hash.slice(0, 8);
        li.appendChild(createAction('Add', () => adminAdd(obj.hash)));
=======
        li.textContent = obj.hash.slice(0,8);
        li.appendChild(createAction('Add',   () => adminAdd(obj.hash)));
>>>>>>> e736224 (Final commit)
        li.appendChild(createAction('Block', () => adminBlock(obj.hash)));
        nList.appendChild(li);
    });
}

async function adminAdd(hash) {
    const name = prompt("Member name:");
<<<<<<< HEAD
    if (!name) return;
    await fetch(`/register/${hash}?name=${encodeURIComponent(name)}`);
    fetchData();
}

=======
    await fetch(`/register/${hash}?name=${encodeURIComponent(name || 'Member')}`);
    fetchData();
}
>>>>>>> e736224 (Final commit)
async function adminRemove(hash) {
    await fetch(`/remove/${hash}`);
    fetchData();
}
<<<<<<< HEAD

=======
>>>>>>> e736224 (Final commit)
async function adminBlock(hash) {
    await fetch(`/block/${hash}`);
    fetchData();
}

<<<<<<< HEAD
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
=======
function selfCheck() {
    const h = prompt("Enter your device hash:");
    if (!h) return;
    fetch(`/selfcheck/${h}`)
        .then(() => alert("Checked in!"));
>>>>>>> e736224 (Final commit)
}
