
let money = 100;
let day = 1;
let timeLeft = 90;
let selectedSkin = null;
let servedCustomers = 0;
let dayEarnings = 0;
let customerInterval;
let clockInterval;
let employeeInterval;
let gameRunning = false;

const skinNames = {
    avengers: "🦸 Vingadores",
    powerpuff: "💗 Meninas Superpoderosas",
    sanrio: "🎀 Turma da Hello Kitty",
    stitch: "💙 Stitch"
};

const products = [
    { name: "Maçãs", icon: "🍎", stock: 10, max: 20, price: 8 },
    { name: "Leite", icon: "🥛", stock: 10, max: 20, price: 10 },
    { name: "Pão", icon: "🍞", stock: 10, max: 20, price: 7 },
    { name: "Refrigerante", icon: "🥤", stock: 10, max: 20, price: 12 }
];

let shelves = products.map((product, index) => ({
    ...product,
    id: index
}));

let employees = [];
let nextEmployeeId = 1;
let nextShelfId = 4;

function selectSkin(skin, button) {
    selectedSkin = skin;

    document.querySelectorAll(".skins button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");

    document.getElementById("skinMessage").textContent =
        "Skin escolhida: " + skinNames[skin];
}

function startGame() {
    if (!selectedSkin) {
        alert("Escolha uma skin primeiro!");
        return;
    }

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("dayEnd").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    document.getElementById("skinName").textContent =
        skinNames[selectedSkin];

    gameRunning = true;
    startShift();
}

function startShift() {
    gameRunning = true;
    timeLeft = 90;
    servedCustomers = 0;
    dayEarnings = 0;

    renderShelves();
    renderEmployees();
    updateStats();

    clearInterval(clockInterval);
    clearInterval(customerInterval);
    clearInterval(employeeInterval);

    clockInterval = setInterval(() => {
        if (!gameRunning) return;

        timeLeft--;
        document.getElementById("timer").textContent = timeLeft;

        if (timeLeft <= 0) {
            endDay();
        }
    }, 1000);

    customerInterval = setInterval(() => {
        if (gameRunning) createCustomer();
    }, 4500);

    employeeInterval = setInterval(() => {
        if (gameRunning) employeeWork();
    }, 3000);
}

function updateStats() {
    document.getElementById("money").textContent =
        money.toFixed(2).replace(".", ",");

    document.getElementById("day").textContent = day;
    document.getElementById("timer").textContent = timeLeft;

    document.getElementById("customerCount").textContent =
        servedCustomers;

    document.getElementById("employeeCount").textContent =
        employees.length;
}

function renderShelves() {
    const container = document.getElementById("shelves");
    container.innerHTML = "";

    shelves.forEach(product => {
        const percentage =
            (product.stock / product.max) * 100;

        const shelf = document.createElement("div");
        shelf.className = "shelf";

        shelf.innerHTML = `
            <h3>${product.icon} ${product.name}</h3>

            <div class="product-icon">${product.icon}</div>

            <p>Estoque: <b>${product.stock}/${product.max}</b></p>

            <div class="stock">
                <div class="stock-fill"
                     style="width:${percentage}%"></div>
            </div>

            <button
                onclick="restock(${product.id})"
                ${product.stock >= product.max || money < 10
                    ? "disabled" : ""}>
                📦 Repor 5 unidades (R$ 10)
            </button>
        `;

        container.appendChild(shelf);
    });
}

function restock(id) {
    if (!gameRunning) return;

    const product = shelves.find(p => p.id === id);

    if (!product || money < 10) {
        alert("Você não tem dinheiro suficiente!");
        return;
    }

    if (product.stock >= product.max) {
        alert("Essa prateleira já está cheia!");
        return;
    }

    money -= 10;
    product.stock = Math.min(product.max, product.stock + 5);

    updateStats();
    renderShelves();
}

function createCustomer() {
    if (!gameRunning) return;

    const available = shelves.filter(p => p.stock > 0);

    if (available.length === 0) {
        showCustomer("😢", "Não encontrei produtos!");
        return;
    }

    const product = available[
        Math.floor(Math.random() * available.length)
    ];

    const quantity = Math.min(
        product.stock,
        Math.floor(Math.random() * 3) + 1
    );

    product.stock -= quantity;

    const earned = quantity * product.price;

    money += earned;
    dayEarnings += earned;
    servedCustomers++;

    showCustomer(
        "🛍️",
        `Comprou ${quantity} ${product.name}! +R$ ${earned}`
    );

    updateStats();
    renderShelves();
}

function showCustomer(icon, message) {
    const container = document.getElementById("customers");

    const customer = document.createElement("div");
    customer.className = "customer";

    customer.innerHTML = `
        <div style="font-size:30px">${icon}</div>
        <p>${message}</p>
    `;

    container.appendChild(customer);

    if (container.children.length > 5) {
        container.removeChild(container.children[0]);
    }

    setTimeout(() => {
        customer.remove();
    }, 6000);
}

function expandMarket() {
    if (!gameRunning) return;

    if (money < 150) {
        alert("Você precisa de R$ 150 para ampliar!");
        return;
    }

    money -= 150;

    const newProducts = [
        { name: "Biscoitos", icon: "🍪", price: 9 },
        { name: "Chocolate", icon: "🍫", price: 15 },
        { name: "Suco", icon: "🧃", price: 11 },
        { name: "Cereal", icon: "🥣", price: 14 }
    ];

    const product = newProducts[
        Math.floor(Math.random() * newProducts.length)
    ];

    shelves.push({
        ...product,
        stock: 10,
        max: 20,
        id: nextShelfId++
    });

    alert("🎉 Nova prateleira adicionada!");

    updateStats();
    renderShelves();
    renderEmployees();
}

function hireEmployee() {
    if (!gameRunning) return;

    if (money < 100) {
        alert("Você precisa de R$ 100 para contratar!");
        return;
    }

    money -= 100;

    employees.push({
        id: nextEmployeeId++,
        name: "Funcionário " + nextEmployeeId,
        shelfId: shelves[0].id
    });

    updateStats();
    renderEmployees();
    alert("👷 Funcionário contratado!");
}

function renderEmployees() {
    const container = document.getElementById("employees");
    container.innerHTML = "";

    if (employees.length === 0) {
        container.innerHTML = "<p>Você ainda não contratou funcionários.</p>";
        return;
    }

    employees.forEach(employee => {
        const div = document.createElement("div");
        div.className = "employee";

        const options = shelves.map(product => `
            <option value="${product.id}"
                ${product.id === employee.shelfId ? "selected" : ""}>
                ${product.icon} ${product.name}
            </option>
        `).join("");

        div.innerHTML = `
            <span>👷 ${employee.name}</span>

            <label>
                Prateleira:
                <select onchange="assignEmployee(${employee.id}, this.value)">
                    ${options}
                </select>
            </label>
        `;

        container.appendChild(div);
    });
}

function assignEmployee(employeeId, shelfId) {
    const employee = employees.find(e => e.id === employeeId);

    if (employee) {
        employee.shelfId = Number(shelfId);
    }
}

function employeeWork() {
    if (!gameRunning) return;

    employees.forEach(employee => {
        const product = shelves.find(
            p => p.id === employee.shelfId
        );

        if (product && product.stock < product.max && money >= 2) {
            const amount = Math.min(
                3,
                product.max - product.stock,
                Math.floor(money / 2)
            );

            if (amount > 0) {
                product.stock += amount;
                money -= amount * 2;
            }
        }
    });

    updateStats();
    renderShelves();
}

function endDay() {
    if (!gameRunning) return;

    gameRunning = false;

    clearInterval(clockInterval);
    clearInterval(customerInterval);
    clearInterval(employeeInterval);

    document.getElementById("game").classList.add("hidden");
    document.getElementById("dayEnd").classList.remove("hidden");

    document.getElementById("daySummary").textContent =
        "Você terminou o Dia " + day + "!";

    document.getElementById("dailyProfit").textContent =
        "💰 Vendas recebidas hoje: R$ " +
        dayEarnings.toFixed(2).replace(".", ",") +
        " | 👥 Clientes atendidos: " + servedCustomers;
}

function nextDay() {
    day++;

    document.getElementById("dayEnd").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    startShift();

    alert("☀️ Bem-vindo ao Dia " + day + "!");
}
