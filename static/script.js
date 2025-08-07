const useMockData = false;

// Fake user database
const users = [
    { username: "Ayman", password: "Taleb", role: "employee" },
    { username: "Jonathan", password: "Zahavi", role: "employee" },
    { username: "Evan", password: "Rich", role: "customer" },
    { username: "Mathew", password: "Isac", role: "customer" }
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

async function fetchData() {
    let countData, memberData;

    if (useMockData) {
        countData = { occupancy: 4 };
        memberData = {
            valid_members: ["Evan", "Genevieve", "Mathew"],
            non_members: ["Saiman"]
        };
    } else {
        countData = await fetch('/count').then(res => res.json());
        memberData = await fetch('/members').then(res => res.json());
    }

    document.getElementById('occupancy').textContent = countData.occupancy;

    if (currentRole === 'employee') {
        const validList = document.getElementById('valid-members');
        const nonList = document.getElementById('non-members');

        validList.innerHTML = '';
        nonList.innerHTML = '';

        memberData.valid_members.forEach(id => {
            const li = document.createElement('li');
            li.textContent = id;
            validList.appendChild(li);
        });

        memberData.non_members.forEach(id => {
            const li = document.createElement('li');
            li.textContent = id;
            nonList.appendChild(li);
        });
    }
}
