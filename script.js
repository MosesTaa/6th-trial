/* =========================================================
   ONSITE QUOTATION
   HVAC QUOTATION WEB APPLICATION
   ========================================================= */

const { jsPDF } = window.jspdf;

/* =========================================================
   GLOBAL DATA
   ========================================================= */

let quotation = {
    rooms: [],
    copperRate: 0,
    drainageRate: 0,
    additionalItems: [],
    clientName: "",
    installationLocation: "",
    salesPerson: "",
    salesPhone: "",
    salesEmail: ""
};

const AC_CAPACITIES = [
    9000,
    12000,
    18000,
    24000,
    36000,
    48000
];


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageNumber) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById("page" + pageNumber);

    if (page) {
        page.classList.add("active");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


/* =========================================================
   BASIC FORMATTING
   ========================================================= */

function money(value) {
    return "KES " + Number(value || 0).toLocaleString(
        "en-KE",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}

function number(value) {
    return Number(value || 0).toLocaleString(
        "en-KE",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   STEP 1 - ROOMS
   ========================================================= */

function addRoomInput() {

    const container = document.getElementById(
        "roomInputContainer"
    );

    const row = document.createElement("div");

    row.className = "input-row room-input-row";

    row.innerHTML = `
        <input
            type="text"
            class="room-name-input"
            placeholder="e.g. Bedroom 2"
        >

        <button
            type="button"
            class="remove-input"
            onclick="removeRoomInput(this)"
        >
            ×
        </button>
    `;

    container.appendChild(row);

    row.querySelector("input").focus();
}


function removeRoomInput(button) {

    const rows = document.querySelectorAll(
        ".room-input-row"
    );

    if (rows.length <= 1) {
        button.parentElement.querySelector("input").value = "";
        return;
    }

    button.parentElement.remove();
}


function saveRooms() {

    const inputs = document.querySelectorAll(
        ".room-name-input"
    );

    const names = [];

    inputs.forEach(input => {

        const name = input.value.trim();

        if (name) {
            names.push(name);
        }

    });

    if (names.length === 0) {
        alert("Please enter at least one room.");
        return;
    }

    quotation.rooms = names.map(name => ({
        name: name,
        length: 0,
        width: 0,
        area: 0,
        copper: 0,
        coolingFactor: 0,
        coolingLoad: 0,
        capacity: 0,
        drainage: 0
    }));

    renderRoomPreview();

    showPage(2);
}


/* =========================================================
   STEP 2 - ROOM PREVIEW
   ========================================================= */

function renderRoomPreview() {

    const container = document.getElementById(
        "roomPreview"
    );

    if (quotation.rooms.length === 0) {

        container.innerHTML = `
            <div class="empty-message">
                No rooms added.
            </div>
        `;

        return;
    }

    container.innerHTML = quotation.rooms.map(
        (room, index) => {

            return `
                <div class="room-card">

                    <div>
                        <span class="room-name">
                            ${index + 1}. ${escapeHTML(room.name)}
                        </span>
                    </div>

                    <div class="button-group">

                        <button
                            class="edit-button"
                            onclick="renameRoom(${index})"
                        >
                            Rename
                        </button>

                        <button
                            class="danger-button"
                            onclick="deleteRoom(${index})"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;

        }
    ).join("");
}


function renameRoom(index) {

    const currentName = quotation.rooms[index].name;

    const newName = prompt(
        "Enter the new room name:",
        currentName
    );

    if (newName && newName.trim()) {

        quotation.rooms[index].name =
            newName.trim();

        renderRoomPreview();
    }
}


function deleteRoom(index) {

    const roomName = quotation.rooms[index].name;

    if (
        confirm(
            `Delete "${roomName}"?`
        )
    ) {

        quotation.rooms.splice(index, 1);

        if (quotation.rooms.length === 0) {

            alert(
                "At least one room is required."
            );

            showPage(1);
            return;
        }

        renderRoomPreview();
    }
}


function goToDimensions() {

    if (quotation.rooms.length === 0) {
        alert("Please add at least one room.");
        showPage(1);
        return;
    }

    renderDimensionInputs();

    showPage(3);
}


/* =========================================================
   STEP 3 - DIMENSIONS
   ========================================================= */

function renderDimensionInputs() {

    const container = document.getElementById(
        "dimensionInputs"
    );

    container.innerHTML = quotation.rooms.map(
        (room, index) => {

            return `
                <div class="dimension-card">

                    <h3>
                        ${index + 1}. ${escapeHTML(room.name)}
                    </h3>

                    <label>
                        Length (m)
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            id="length-${index}"
                            value="${room.length || ""}"
                            placeholder="e.g. 5"
                        >
                    </label>

                    <label>
                        Width (m)
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            id="width-${index}"
                            value="${room.width || ""}"
                            placeholder="e.g. 4"
                        >
                    </label>

                    <div class="area-result">
                        Area:
                        <span id="area-${index}">
                            ${room.area ? number(room.area) : "0.00"} m²
                        </span>
                    </div>

                </div>
            `;

        }
    ).join("");

    quotation.rooms.forEach((room, index) => {

        const lengthInput =
            document.getElementById(`length-${index}`);

        const widthInput =
            document.getElementById(`width-${index}`);

        lengthInput.addEventListener(
            "input",
            () => updateAreaPreview(index)
        );

        widthInput.addEventListener(
            "input",
            () => updateAreaPreview(index)
        );

    });
}


function updateAreaPreview(index) {

    const length = Number(
        document.getElementById(
            `length-${index}`
        ).value
    );

    const width = Number(
        document.getElementById(
            `width-${index}`
        ).value
    );

    const area = length * width;

    document.getElementById(
        `area-${index}`
    ).textContent =
        `${number(area)} m²`;
}


function previewDimensions() {

    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {

            const length = Number(
                document.getElementById(
                    `length-${index}`
                ).value
            );

            const width = Number(
                document.getElementById(
                    `width-${index}`
                ).value
            );

            if (
                !length ||
                !width ||
                length <= 0 ||
                width <= 0
            ) {
                valid = false;
            }

            room.length = length;
            room.width = width;
            room.area = length * width;
        }
    );

    if (!valid) {
        alert(
            "Please enter valid length and width for every room."
        );
        return;
    }

    renderDimensionPreview();

    showPage(4);
}


function renderDimensionPreview() {

    const container = document.getElementById(
        "dimensionPreview"
    );

    container.innerHTML = `
        <div style="overflow-x:auto">

            <table style="
                width:100%;
                border-collapse:collapse;
            ">

                <thead>

                    <tr style="
                        background:#e0f2fe;
                    ">

                        <th style="padding:10px;text-align:left;">
                            Room
                        </th>

                        <th style="padding:10px;text-align:right;">
                            Length
                        </th>

                        <th style="padding:10px;text-align:right;">
                            Width
                        </th>

                        <th style="padding:10px;text-align:right;">
                            Area
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${quotation.rooms.map(room => `
                        <tr>

                            <td style="padding:10px;">
                                ${escapeHTML(room.name)}
                            </td>

                            <td style="padding:10px;text-align:right;">
                                ${number(room.length)} m
                            </td>

                            <td style="padding:10px;text-align:right;">
                                ${number(room.width)} m
                            </td>

                            <td style="padding:10px;text-align:right;font-weight:bold;">
                                ${number(room.area)} m²
                            </td>

                        </tr>
                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


function goToCopper() {

    renderCopperInputs();

    showPage(5);
}


/* =========================================================
   STEP 5 - COPPER
   ========================================================= */

function renderCopperInputs() {

    const container = document.getElementById(
        "copperInputs"
    );

    container.innerHTML = quotation.rooms.map(
        (room, index) => {

            return `
                <div class="copper-card">

                    <h3>
                        ${index + 1}. ${escapeHTML(room.name)}
                    </h3>

                    <label>
                        Copper Length (m)

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            id="copper-${index}"
                            value="${room.copper || ""}"
                            placeholder="e.g. 8"
                        >

                    </label>

                </div>
            `;

        }
    ).join("");
}


function previewCopper() {

    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {

            const copper = Number(
                document.getElementById(
                    `copper-${index}`
                ).value
            );

            if (copper < 0 || isNaN(copper)) {
                valid = false;
            }

            room.copper = copper;
        }
    );

    if (!valid) {

        alert(
            "Please enter valid copper lengths."
        );

        return;
    }

    renderCopperPreview();

    showPage(6);
}


function renderCopperPreview() {

    const totalCopper = quotation.rooms.reduce(
        (sum, room) => sum + Number(room.copper || 0),
        0
    );

    const container = document.getElementById(
        "copperPreview"
    );

    container.innerHTML = `

        ${quotation.rooms.map(
            (room, index) => `

                <div class="preview-item">

                    <strong>
                        ${index + 1}. ${escapeHTML(room.name)}
                    </strong>

                    <div>
                        Copper:
                        <strong>
                            ${number(room.copper)} m
                        </strong>
                    </div>

                </div>

            `
        ).join("")}

        <div class="summary-box">

            <div class="summary-line total-line">

                <span>Total Copper</span>

                <span>
                    ${number(totalCopper)} m
                </span>

            </div>

        </div>
    `;
}


function goToCoolingLoad() {

    renderCoolingLoadInputs();

    showPage(7);
}


/* =========================================================
   STEP 7 - COOLING LOAD
   ========================================================= */

function renderCoolingLoadInputs() {

    const container = document.getElementById(
        "coolingLoadInputs"
    );

    container.innerHTML = quotation.rooms.map(
        (room, index) => {

            return `
                <div class="cooling-card">

                    <h3>
                        ${index + 1}. ${escapeHTML(room.name)}
                    </h3>

                    <p>
                        Room Area:
                        <strong>
                            ${number(room.area)} m²
                        </strong>
                    </p>

                    <label>
                        Base Cooling Load Factor

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            id="factor-${index}"
                            value="${room.coolingFactor || ""}"
                            placeholder="e.g. 700"
                        >

                    </label>

                    <div class="area-result">

                        Calculated Cooling Load:
                        <strong id="load-${index}">
                            0 BTU/hr
                        </strong>

                    </div>

                </div>
            `;

        }
    ).join("");

    quotation.rooms.forEach(
        (room, index) => {

            document.getElementById(
                `factor-${index}`
            ).addEventListener(
                "input",
                () => updateCoolingLoadPreview(index)
            );

        }
    );
}


function updateCoolingLoadPreview(index) {

    const factor = Number(
        document.getElementById(
            `factor-${index}`
        ).value
    );

    const load =
        quotation.rooms[index].area *
        factor;

    document.getElementById(
        `load-${index}`
    ).textContent =
        `${number(load)} BTU/hr`;
}


function selectCapacity(load) {

    for (let capacity of AC_CAPACITIES) {

        if (load <= capacity) {
            return capacity;
        }

    }

    return 48000;
}


function previewCoolingLoad() {

    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {

            const factor = Number(
                document.getElementById(
                    `factor-${index}`
                ).value
            );

            if (
                isNaN(factor) ||
                factor <= 0
            ) {
                valid = false;
                return;
            }

            room.coolingFactor = factor;

            room.coolingLoad =
                room.area * factor;

            room.capacity =
                selectCapacity(
                    room.coolingLoad
                );
        }
    );

    if (!valid) {

        alert(
            "Please enter a valid cooling load factor for every room."
        );

        return;
    }

    renderCoolingLoadPreview();

    showPage(8);
}


function renderCoolingLoadPreview() {

    const container = document.getElementById(
        "coolingLoadPreview"
    );

    container.innerHTML = quotation.rooms.map(
        (room, index) => {

            return `
                <div class="preview-item">

                    <strong>
                        ${index + 1}. ${escapeHTML(room.name)}
                    </strong>

                    <p>
                        Area:
                        ${number(room.area)} m²
                    </p>

                    <p>
                        Cooling Load Factor:
                        ${number(room.coolingFactor)}
                    </p>

                    <p>
                        Calculated Load:
                        <strong>
                            ${number(room.coolingLoad)} BTU/hr
                        </strong>
                    </p>

                    <p>
                        Recommended AC:

                        <span class="capacity-badge">
                            ${room.capacity.toLocaleString()} BTU/hr
                        </span>
                    </p>

                </div>
            `;

        }
    ).join("");
}


function goToACPrices() {

    renderACPriceInputs();

    showPage(9);
}


/* =========================================================
   STEP 9 - AC PRICES
   ========================================================= */

function getUniqueCapacities() {

    return [
        ...new Set(
            quotation.rooms.map(
                room => room.capacity
            )
        )
    ].sort(
        (a, b) => a - b
    );
}


function getCapacityQuantity(capacity) {

    return quotation.rooms.filter(
        room => room.capacity === capacity
    ).length;
}


function renderACPriceInputs() {

    const capacities =
        getUniqueCapacities();

    const container =
        document.getElementById(
            "acPriceInputs"
        );

    container.innerHTML = capacities.map(
        capacity => {

            const existingRoom =
                quotation.acPrices
                ?.find(
                    item =>
                        item.capacity === capacity
                );

            return `
                <div class="price-card">

                    <h3>
                        ${capacity.toLocaleString()} BTU/hr
                    </h3>

                    <p>
                        Quantity:
                        <strong>
                            ${getCapacityQuantity(capacity)}
                        </strong>
                    </p>

                    <label>
                        Unit Price (KES)

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            class="ac-price-input"
                            data-capacity="${capacity}"
                            value="${
                                existingRoom
                                    ? existingRoom.unitPrice
                                    : ""
                            }"
                            placeholder="Enter unit price"
                        >

                    </label>

                </div>
            `;

        }
    ).join("");

    if (!quotation.acPrices) {
        quotation.acPrices = [];
    }
}


function previewACPrices() {

    const inputs =
        document.querySelectorAll(
            ".ac-price-input"
        );

    let valid = true;

    const prices = [];

    inputs.forEach(input => {

        const capacity =
            Number(
                input.dataset.capacity
            );

        const unitPrice =
            Number(input.value);

        if (
            isNaN(unitPrice) ||
            unitPrice < 0
        ) {
            valid = false;
        }

        const quantity =
            getCapacityQuantity(
                capacity
            );

        prices.push({
            capacity: capacity,
            quantity: quantity,
            unitPrice: unitPrice,
            total: quantity * unitPrice
        });

    });

    if (!valid) {

        alert(
            "Please enter a valid price for every AC capacity."
        );

        return;
    }

    quotation.acPrices = prices;

    renderACPricePreview();

    showPage(10);
}


function renderACPricePreview() {

    const container =
        document.getElementById(
            "acPricePreview"
        );

    const total =
        quotation.acPrices.reduce(
            (sum, item) =>
                sum + item.total,
            0
        );

    container.innerHTML = `

        <div style="overflow-x:auto">

            <table style="
                width:100%;
                border-collapse:collapse;
            ">

                <thead>

                    <tr style="background:#e0f2fe">

                        <th style="padding:10px;text-align:left">
                            Capacity
                        </th>

                        <th style="padding:10px;text-align:right">
                            Qty
                        </th>

                        <th style="padding:10px;text-align:right">
                            Unit Price
                        </th>

                        <th style="padding:10px;text-align:right">
                            Total
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${quotation.acPrices.map(
                        item => `

                            <tr>

                                <td style="padding:10px">
                                    ${item.capacity.toLocaleString()} BTU/hr
                                </td>

                                <td style="padding:10px;text-align:right">
                                    ${item.quantity}
                                </td>

                                <td style="padding:10px;text-align:right">
                                    ${money(item.unitPrice)}
                                </td>

                                <td style="padding:10px;text-align:right">
                                    ${money(item.total)}
                                </td>

                            </tr>

                        `
                    ).join("")}

                </tbody>

            </table>

        </div>

        <div class="summary-box">

            <div class="summary-line total-line">

                <span>Equipment Total</span>

                <span>
                    ${money(total)}
                </span>

            </div>

        </div>
    `;
}


function goToDrainage() {

    renderDrainageInputs();

    showPage(11);
}


/* =========================================================
   STEP 11 - DRAINAGE
   ========================================================= */

function renderDrainageInputs() {

    const container =
        document.getElementById(
            "drainageInputs"
        );

    container.innerHTML =
        quotation.rooms.map(
            (room, index) => {

                return `
                    <div class="drainage-card">

                        <h3>
                            ${index + 1}.
                            ${escapeHTML(room.name)}
                        </h3>

                        <label>
                            Drainage PVC Length (m)

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                id="drainage-${index}"
                                value="${room.drainage || ""}"
                                placeholder="e.g. 6"
                            >

                        </label>

                    </div>
                `;

            }
        ).join("");
}


function previewDrainage() {

    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {

            const drainage =
                Number(
                    document.getElementById(
                        `drainage-${index}`
                    ).value
                );

            if (
                isNaN(drainage) ||
                drainage < 0
            ) {
                valid = false;
            }

            room.drainage = drainage;
        }
    );

    if (!valid) {

        alert(
            "Please enter valid drainage lengths."
        );

        return;
    }

    renderDrainagePreview();

    showPage(12);
}


function renderDrainagePreview() {

    const total =
        quotation.rooms.reduce(
            (sum, room) =>
                sum + Number(room.drainage || 0),
            0
        );

    const container =
        document.getElementById(
            "drainagePreview"
        );

    container.innerHTML = `

        ${quotation.rooms.map(
            (room, index) => `

                <div class="preview-item">

                    <strong>
                        ${index + 1}.
                        ${escapeHTML(room.name)}
                    </strong>

                    <p>
                        Drainage:
                        <strong>
                            ${number(room.drainage)} m
                        </strong>
                    </p>

                </div>

            `
        ).join("")}

        <div class="summary-box">

            <div class="summary-line total-line">

                <span>Total Drainage</span>

                <span>
                    ${number(total)} m
                </span>

            </div>

        </div>
    `;
}


function goToRates() {

    document.getElementById(
        "copperRate"
    ).value =
        quotation.copperRate || "";

    document.getElementById(
        "drainageRate"
    ).value =
        quotation.drainageRate || "";

    showPage(13);
}


/* =========================================================
   STEP 13 - RATES
   ========================================================= */

function saveRates() {

    const copperRate =
        Number(
            document.getElementById(
                "copperRate"
            ).value
        );

    const drainageRate =
        Number(
            document.getElementById(
                "drainageRate"
            ).value
        );

    if (
        isNaN(copperRate) ||
        copperRate < 0 ||
        isNaN(drainageRate) ||
        drainageRate < 0
    ) {

        alert(
            "Please enter valid material rates."
        );

        return;
    }

    quotation.copperRate =
        copperRate;

    quotation.drainageRate =
        drainageRate;

    renderAdditionalItems();

    showPage(14);
}


/* =========================================================
   STEP 14 - ADDITIONAL ITEMS
   ========================================================= */

document.addEventListener(
    "input",
    function(event) {

        if (
            event.target.id === "extraItemQty" ||
            event.target.id === "extraItemPrice"
        ) {
            calculateExtraItem();
        }

    }
);


function calculateExtraItem() {

    const qty =
        Number(
            document.getElementById(
                "extraItemQty"
            ).value
        );

    const price =
        Number(
            document.getElementById(
                "extraItemPrice"
            ).value
        );

    const total =
        qty * price;

    document.getElementById(
        "extraItemTotal"
    ).textContent =
        money(total);
}


function saveExtraItem() {

    const name =
        document.getElementById(
            "extraItemName"
        ).value.trim();

    const qty =
        Number(
            document.getElementById(
                "extraItemQty"
            ).value
        );

    const unit =
        document.getElementById(
            "extraItemUnit"
        ).value.trim() || "lot";

    const unitPrice =
        Number(
            document.getElementById(
                "extraItemPrice"
            ).value
        );

    if (
        !name ||
        isNaN(qty) ||
        qty <= 0 ||
        isNaN(unitPrice) ||
        unitPrice < 0
    ) {

        alert(
            "Please enter item name, quantity and valid unit price."
        );

        return;
    }

    quotation.additionalItems.push({

        name: name,

        quantity: qty,

        unit: unit,

        unitPrice: unitPrice,

        total: qty * unitPrice

    });

    document.getElementById(
        "extraItemName"
    ).value = "";

    document.getElementById(
        "extraItemQty"
    ).value = "";

    document.getElementById(
        "extraItemUnit"
    ).value = "";

    document.getElementById(
        "extraItemPrice"
    ).value = "";

    document.getElementById(
        "extraItemTotal"
    ).textContent =
        "KES 0.00";

    renderAdditionalItems();
}


function renderAdditionalItems() {

    const container =
        document.getElementById(
            "additionalItemsPreview"
        );

    if (
        quotation.additionalItems.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                No additional items added yet.
            </div>
        `;

        return;
    }

    container.innerHTML =
        quotation.additionalItems.map(
            (item, index) => {

                return `
                    <div class="preview-item">

                        <div>
                            <strong>
                                ${index + 4}.
                                ${escapeHTML(item.name)}
                            </strong>
                        </div>

                        <p>
                            ${number(item.quantity)}
                            ${escapeHTML(item.unit)}
                            ×
                            ${money(item.unitPrice)}
                        </p>

                        <p class="mini-total">
                            Total:
                            ${money(item.total)}
                        </p>

                        <button
                            class="danger-button"
                            onclick="deleteAdditionalItem(${index})"
                        >
                            Delete
                        </button>

                    </div>
                `;

            }
        ).join("");
}


function deleteAdditionalItem(index) {

    if (
        confirm(
            "Delete this additional item?"
        )
    ) {

        quotation.additionalItems.splice(
            index,
            1
        );

        renderAdditionalItems();
    }
}


function goToClientDetails() {

    showPage(15);
}


/* =========================================================
   STEP 15 - CLIENT DETAILS
   ========================================================= */

function getClientDetails() {

    quotation.clientName =
        document.getElementById(
            "clientName"
        ).value.trim();

    quotation.installationLocation =
        document.getElementById(
            "installationLocation"
        ).value.trim();

    quotation.salesPerson =
        document.getElementById(
            "salesPerson"
        ).value.trim();

    quotation.salesPhone =
        document.getElementById(
            "salesPhone"
        ).value.trim();

    quotation.salesEmail =
        document.getElementById(
            "salesEmail"
        ).value.trim();
}


/* =========================================================
   TOTAL CALCULATIONS
   ========================================================= */

function getEquipmentTotal() {

    return quotation.acPrices.reduce(
        (sum, item) =>
            sum + item.total,
        0
    );
}


function getCopperTotal() {

    const copperLength =
        quotation.rooms.reduce(
            (sum, room) =>
                sum + Number(room.copper || 0),
            0
        );

    return copperLength *
        quotation.copperRate;
}


function getDrainageTotal() {

    const drainageLength =
        quotation.rooms.reduce(
            (sum, room) =>
                sum + Number(room.drainage || 0),
            0
        );

    return drainageLength *
        quotation.drainageRate;
}


function getAdditionalItemsTotal() {

    return quotation.additionalItems.reduce(
        (sum, item) =>
            sum + item.total,
        0
    );
}


function getHVACTotal() {

    return (
        getEquipmentTotal() +
        getCopperTotal() +
        getDrainageTotal() +
        getAdditionalItemsTotal()
    );
}


/* =========================================================
   PDF HELPERS
   ========================================================= */

function imageToDataURL(url) {
    return new Promise((resolve, reject) => {

        const img = new Image();

        // IMPORTANT:
        // Do NOT use crossOrigin here.
        // header.jpeg and footer.jpeg are hosted
        // on the same GitHub Pages website.

        img.onload = function() {

            const canvas =
                document.createElement("canvas");

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx =
                canvas.getContext("2d");

            ctx.drawImage(
                img,
                0,
                0
            );

            try {

                resolve(
                    canvas.toDataURL("image/jpeg")
                );

            } catch (error) {

                reject(error);

            }
        };

        img.onerror = function() {

            reject(
                new Error(
                    "Unable to load image: " + url
                )
            );

        };

        // Load directly from the same folder
        img.src = url;
    });
}


function addFooterToPage(
    doc,
    footerData,
    pageNumber
) {

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();

    try {

        if (footerData) {

            doc.addImage(
                footerData,
                "JPEG",
                0,
                pageHeight - 35,
                pageWidth,
                35
            );

        }

    } catch (error) {

        console.warn(
            "Footer image could not be added.",
            error
        );

    }

    doc.setFontSize(7);

    doc.setTextColor(
        100,
        100,
        100
    );

    doc.text(
        `Page ${pageNumber}`,
        pageWidth - 25,
        pageHeight - 5
    );
}


function addHeaderImage(
    doc,
    headerData
) {

    if (!headerData) {
        return;
    }

    const pageWidth =
        doc.internal.pageSize.getWidth();

    try {

        doc.addImage(
            headerData,
            "JPEG",
            0,
            0,
            pageWidth,
            42
        );

    } catch (error) {

        console.warn(
            "Header image could not be added.",
            error
        );

    }
}


/* =========================================================
   PDF GENERATION
   ========================================================= */

async function generateQuotation() {

    getClientDetails();

    if (!quotation.clientName) {

        alert(
            "Please enter the client name."
        );

        return;
    }

    if (!quotation.installationLocation) {

        alert(
            "Please enter the installation location."
        );

        return;
    }

    try {

        const headerData =
            await imageToDataURL(
                "header.jpeg"
            );

        const footerData =
            await imageToDataURL(
                "footer.jpeg"
            );

        createPDF(
            headerData,
            footerData
        );

    } catch (error) {

        console.warn(
            "Header/footer images were not loaded.",
            error
        );

        createPDF(
            null,
            null
        );

    }
}


/* =========================================================
   CREATE PDF
   ========================================================= */

function createPDF(
    headerData,
    footerData
) {

    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

    const pageWidth =
        doc.internal.pageSize.getWidth();

    const pageHeight =
        doc.internal.pageSize.getHeight();

    const margin = 12;

    const headerHeight = 45;

    const footerHeight = 38;

    let currentPage = 1;

    addHeaderImage(
        doc,
        headerData
    );

    let y =
        headerHeight + 5;


    /* ======================================
       QUOTATION TITLE
    ====================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(18);

    doc.setTextColor(
        7,
        89,
        133
    );

    doc.text(
        "QUOTATION",
        pageWidth / 2,
        y,
        {
            align: "center"
        }
    );

    y += 10;


    /* ======================================
       CLIENT DETAILS
    ====================================== */

    doc.setFontSize(9);

    doc.setTextColor(
        30,
        41,
        59
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "CLIENT:",
        margin,
        y
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        quotation.clientName,
        margin + 22,
        y
    );

    y += 5;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "LOCATION:",
        margin,
        y
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        quotation.installationLocation,
        margin + 22,
        y
    );

    y += 5;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "SALES PERSON:",
        margin,
        y
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        quotation.salesPerson,
        margin + 30,
        y
    );

    y += 5;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "PHONE:",
        margin,
        y
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        quotation.salesPhone,
        margin + 22,
        y
    );

    y += 5;

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "EMAIL:",
        margin,
        y
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        quotation.salesEmail,
        margin + 22,
        y
    );

    y += 9;


    /* ======================================
       ITEM 1 - EQUIPMENT
    ====================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.text(
        "1. EQUIPMENT",
        margin,
        y
    );

    y += 3;

    const equipmentRows =
        quotation.acPrices.map(
            item => [

                `${item.capacity.toLocaleString()} BTU/hr`,

                item.quantity,

                money(item.unitPrice),

                money(item.total)

            ]
        );

    doc.autoTable({

        startY: y,

        head: [
            [
                "AC Capacity",
                "Qty",
                "Unit Price",
                "Total"
            ]
        ],

        body: equipmentRows,

        theme: "grid",

        headStyles: {
            fillColor: [7, 89, 133],
            textColor: 255,
            fontStyle: "bold"
        },

        styles: {
            fontSize: 8,
            cellPadding: 2.5
        },

        columnStyles: {
            1: {
                halign: "right"
            },

            2: {
                halign: "right"
            },

            3: {
                halign: "right"
            }
        },

        margin: {
            left: margin,
            right: margin,
            bottom: footerHeight
        }
    });

    y =
        doc.lastAutoTable.finalY + 8;


    /* ======================================
       ITEM 2 - COPPER
    ====================================== */

    doc.setFontSize(11);

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "2. COPPER AND ACCESSORIES",
        margin,
        y
    );

    y += 3;

    const totalCopperLength =
        quotation.rooms.reduce(
            (sum, room) =>
                sum + Number(room.copper || 0),
            0
        );

    doc.autoTable({

        startY: y,

        head: [
            [
                "Item",
                "Quantity",
                "Unit Price",
                "Total"
            ]
        ],

        body: [
            [
                "Copper",
                `${number(totalCopperLength)} m`,
                money(quotation.copperRate),
                money(getCopperTotal())
            ]
        ],

        theme: "grid",

        headStyles: {
            fillColor: [7, 89, 133],
            textColor: 255
        },

        styles: {
            fontSize: 8,
            cellPadding: 2.5
        },

        margin: {
            left: margin,
            right: margin,
            bottom: footerHeight
        }
    });

    y =
        doc.lastAutoTable.finalY + 8;


    /* ======================================
       ITEM 3 - DRAINAGE
    ====================================== */

    doc.setFontSize(11);

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "3. DRAINAGE AND ACCESSORIES",
        margin,
        y
    );

    y += 3;

    const totalDrainageLength =
        quotation.rooms.reduce(
            (sum, room) =>
                sum + Number(room.drainage || 0),
            0
        );

    doc.autoTable({

        startY: y,

        head: [
            [
                "Item",
                "Quantity",
                "Unit Price",
                "Total"
            ]
        ],

        body: [
            [
                "Drainage",
                `${number(totalDrainageLength)} m`,
                money(quotation.drainageRate),
                money(getDrainageTotal())
            ]
        ],

        theme: "grid",

        headStyles: {
            fillColor: [7, 89, 133],
            textColor: 255
        },

        styles: {
            fontSize: 8,
            cellPadding: 2.5
        },

        margin: {
            left: margin,
            right: margin,
            bottom: footerHeight
        }
    });

    y =
        doc.lastAutoTable.finalY + 8;


    /* ======================================
       ITEMS 4+
    ====================================== */

    if (
        quotation.additionalItems.length > 0
    ) {

        doc.setFontSize(11);

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.text(
            "ADDITIONAL WORKS",
            margin,
            y
        );

        y += 3;

        const additionalRows =
            quotation.additionalItems.map(
                item => [

                    item.name,

                    `${number(item.quantity)} ${item.unit}`,

                    money(item.unitPrice),

                    money(item.total)

                ]
            );

        doc.autoTable({

            startY: y,

            head: [
                [
                    "Item",
                    "Quantity",
                    "Unit Price",
                    "Total"
                ]
            ],

            body: additionalRows,

            theme: "grid",

            headStyles: {
                fillColor: [7, 89, 133],
                textColor: 255
            },

            styles: {
                fontSize: 8,
                cellPadding: 2.5
            },

            margin: {
                left: margin,
                right: margin,
                bottom: footerHeight
            }
        });

        y =
            doc.lastAutoTable.finalY + 8;
    }


    /* ======================================
       TOTAL HVAC WORKS
    ====================================== */

    const hvacWorks =
        getHVACTotal();

    if (
        y >
        pageHeight - footerHeight - 45
    ) {

        doc.addPage();

        currentPage++;

        addHeaderImage(
            doc,
            headerData
        );

        y =
            headerHeight + 8;
    }

    doc.setFillColor(
        224,
        242,
        254
    );

    doc.roundedRect(
        margin,
        y,
        pageWidth - margin * 2,
        15,
        2,
        2,
        "F"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(12);

    doc.setTextColor(
        7,
        89,
        133
    );

    doc.text(
        "TOTAL HVAC WORKS (EXCLUSIVE OF VAT)",
        margin + 4,
        y + 9
    );

    doc.text(
        money(hvacWorks),
        pageWidth - margin - 4,
        y + 9,
        {
            align: "right"
        }
    );

    y += 24;


    /* ======================================
       SUMMARY
    ====================================== */

    if (
        y >
        pageHeight - footerHeight - 60
    ) {

        doc.addPage();

        currentPage++;

        addHeaderImage(
            doc,
            headerData
        );

        y =
            headerHeight + 8;
    }

    doc.setFontSize(12);

    doc.setTextColor(
        7,
        89,
        133
    );

    doc.text(
        "SUMMARY",
        margin,
        y
    );

    y += 4;

    const preliminaries = 15000;
    const asBuiltDrawing = 5000;

    const subtotal =
        preliminaries +
        asBuiltDrawing +
        hvacWorks;

    const vat =
        subtotal * 0.16;

    const grandTotal =
        subtotal + vat;

    doc.autoTable({

        startY: y,

        head: [
            [
                "Description",
                "Qty",
                "Unit Price",
                "Total"
            ]
        ],

        body: [

            [
                "Preliminaries",
                "1 lot",
                money(preliminaries),
                money(preliminaries)
            ],

            [
                "As Built Drawing",
                "1 lot",
                money(asBuiltDrawing),
                money(asBuiltDrawing)
            ],

            [
                "Total HVAC Works",
                "1 lot",
                money(hvacWorks),
                money(hvacWorks)
            ]

        ],

        theme: "grid",

        headStyles: {
            fillColor: [7, 89, 133],
            textColor: 255
        },

        styles: {
            fontSize: 8,
            cellPadding: 2.5
        },

        margin: {
            left: margin,
            right: margin,
            bottom: footerHeight
        }
    });

    y =
        doc.lastAutoTable.finalY + 8;


    /* ======================================
       FINAL TOTALS
    ====================================== */

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.setFontSize(10);

    doc.setTextColor(
        30,
        41,
        59
    );

    doc.text(
        "Total before VAT:",
        margin,
        y
    );

    doc.text(
        money(subtotal),
        pageWidth - margin,
        y,
        {
            align: "right"
        }
    );

    y += 7;

    doc.text(
        "VAT @ 16%:",
        margin,
        y
    );

    doc.text(
        money(vat),
        pageWidth - margin,
        y,
        {
            align: "right"
        }
    );

    y += 9;

    doc.setFillColor(
        7,
        89,
        133
    );

    doc.roundedRect(
        margin,
        y - 5,
        pageWidth - margin * 2,
        17,
        2,
        2,
        "F"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(12);

    doc.setTextColor(
        255,
        255,
        255
    );

    doc.text(
        "TOTAL COST INCLUSIVE OF 16% VAT",
        margin + 4,
        y + 5
    );

    doc.text(
        money(grandTotal),
        pageWidth - margin - 4,
        y + 5,
        {
            align: "right"
        }
    );

    y += 23;


    /* ======================================
       TERMS & CONDITIONS
    ====================================== */

    if (
        y >
        pageHeight - footerHeight - 60
    ) {

        doc.addPage();

        currentPage++;

        addHeaderImage(
            doc,
            headerData
        );

        y =
            headerHeight + 8;
    }

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.setTextColor(
        7,
        89,
        133
    );

    doc.text(
        "TERMS AND CONDITIONS OF SALES",
        margin,
        y
    );

    y += 6;

    const terms = [

        [
            "Terms of payment:",
            "100% advance payment payable to HOTPOINT APPLIANCES LTD or as per approved payment terms."
        ],

        [
            "Warranty:",
            "Two years warranty on equipment. The warranty shall be applicable as per our warranty clause."
        ],

        [
            "Delivery timelines:",
            "8-12 weeks upon confirmation of order and upon reception of advance payment."
        ],

        [
            "Quotation validity:",
            "Our quotation is valid for a period of 14 days."
        ],

        [
            "Note - Exclusions:",
            "Our scope of work is limited to as per the above priced BOQ. Any materials not mentioned above are not in our scope."
        ],

        [
            "Other exclusions:",
            "Scaffolding, Glass cutting, electrical and masonry works (Wall chase, drilling and work on false ceiling)."
        ],

        [
            "Electrical works:",
            "All the electrical works related to powering of the Air Conditioner are to be done by the client. However, we will guide on the same."
        ],

        [
            "Power requirements:",
            "Three phase (400 V) power to be provided at the outdoor (within 5 m of each units) and single phase (210 V) power to each indoor units (within 1 m of each units) with necessary accessories."
        ],

        [
            "Support required:",
            "Access to site, water and electricity. Safe custody of equipment, tools and installation materials at site."
        ],

        [
            "Operating temperature:",
            "Kindly note that the system's ideal operating temperature is minimum of 22-24 Degrees Celsius."
        ]

    ];

    doc.autoTable({

        startY: y,

        body: terms,

        theme: "plain",

        styles: {
            fontSize: 7.5,
            cellPadding: 2,
            textColor: [40, 40, 40],
            valign: "top"
        },

        columnStyles: {

            0: {
                fontStyle: "bold",
                cellWidth: 36
            },

            1: {
                cellWidth:
                    pageWidth -
                    margin * 2 -
                    36
            }

        },

        margin: {
            left: margin,
            right: margin,
            bottom: footerHeight
        }
    });


    /* ======================================
       FOOTERS ON ALL PAGES
    ====================================== */

    const totalPages =
        doc.internal.getNumberOfPages();

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        doc.setPage(i);

        addFooterToPage(
            doc,
            footerData,
            i
        );
    }


    /* ======================================
       FILE NAME
    ====================================== */

    const safeClientName =
        quotation.clientName
            .replace(
                /[^a-z0-9]/gi,
                "_"
            );

    const filename =
        `HVAC_Quotation_${safeClientName || "Client"}.pdf`;

    doc.save(filename);

    showPage("successPage");
}


/* =========================================================
   NEW QUOTATION
   ========================================================= */

function startNewQuotation() {

    quotation = {

        rooms: [],

        copperRate: 0,

        drainageRate: 0,

        additionalItems: [],

        clientName: "",

        installationLocation: "",

        salesPerson: "",

        salesPhone: "",

        salesEmail: ""

    };

    document.getElementById(
        "roomInputContainer"
    ).innerHTML = `

        <div class="input-row room-input-row">

            <input
                type="text"
                class="room-name-input"
                placeholder="e.g. Living Room"
            >

            <button
                type="button"
                class="remove-input"
                onclick="removeRoomInput(this)"
            >
                ×
            </button>

        </div>
    `;

    document.getElementById(
        "clientName"
    ).value = "";

    document.getElementById(
        "installationLocation"
    ).value = "";

    document.getElementById(
        "salesPerson"
    ).value = "";

    document.getElementById(
        "salesPhone"
    ).value = "";

    document.getElementById(
        "salesEmail"
    ).value = "";

    showPage(1);
}


/* =========================================================
   YEAR
   ========================================================= */

document.getElementById(
    "currentYear"
).textContent =
    new Date().getFullYear();
