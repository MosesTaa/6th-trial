/* ============================================================
   ONSITE QUOTATION
   HVAC QUOTATION SYSTEM
   Moses Ntella Taa
============================================================ */


/* ============================================================
   GLOBAL DATA
============================================================ */

const state = {

    rooms: [],

    otherItems: [],

    copperRate: 0,

    drainageRate: 0,

    currentPage: "page1"

};


/* ============================================================
   AC CAPACITIES
============================================================ */

const AC_CAPACITIES = [
    6000,
    9000,
    12000,
    18000,
    24000,
    48000
];


/* ============================================================
   INITIALIZE
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    addRoomInput();

    updateRoomPreview();

    setupEventListeners();

    updateProgress("page1");

});


/* ============================================================
   EVENT LISTENERS
============================================================ */

function setupEventListeners() {

    document
        .getElementById("addRoomBtn")
        .addEventListener("click", addRoomInput);


    document
        .getElementById("roomsProceedBtn")
        .addEventListener("click", saveRooms);


    document
        .getElementById("dimensionsPreviewBtn")
        .addEventListener("click", previewDimensions);


    document
        .getElementById("dimensionsProceedBtn")
        .addEventListener("click", () => {

            renderCopperInputs();

            goToPage("page3");

        });


    document
        .getElementById("copperPreviewBtn")
        .addEventListener("click", previewCopper);


    document
        .getElementById("copperProceedBtn")
        .addEventListener("click", () => {

            renderFactorInputs();

            goToPage("page4");

        });


    document
        .getElementById("factorPreviewBtn")
        .addEventListener("click", previewFactors);


    document
        .getElementById("factorProceedBtn")
        .addEventListener("click", () => {

            renderACPriceInputs();

            goToPage("page5");

        });


    document
        .getElementById("acPricePreviewBtn")
        .addEventListener("click", previewACPrices);


    document
        .getElementById("acPriceProceedBtn")
        .addEventListener("click", () => {

            renderDrainageInputs();

            goToPage("page6");

        });


    document
        .getElementById("drainagePreviewBtn")
        .addEventListener("click", previewDrainage);


    document
        .getElementById("drainageProceedBtn")
        .addEventListener("click", () => {

            goToPage("page7");

        });


    document
        .getElementById("addOtherItemBtn")
        .addEventListener("click", addOtherItem);


    document
        .getElementById("generateQuotationBtn")
        .addEventListener("click", generateQuotationPreview);


    document
        .getElementById("downloadPdfBtn")
        .addEventListener("click", generatePDF);


    [
        "otherItemQty",
        "otherItemPrice"
    ].forEach(id => {

        document
            .getElementById(id)
            .addEventListener("input", updateOtherItemTotal);

    });

}


/* ============================================================
   PAGE NAVIGATION
============================================================ */

function goToPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page = document.getElementById(pageId);

    if (page) {

        page.classList.add("active");

        state.currentPage = pageId;

        updateProgress(pageId);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}


/* ============================================================
   PROGRESS
============================================================ */

function updateProgress(pageId) {

    const pageNumbers = {

        page1: 1,

        page2: 2,
        page2Preview: 2,

        page3: 3,
        page3Preview: 3,

        page4: 4,
        page4Preview: 4,

        page5: 5,
        page5Preview: 5,

        page6: 6,
        page6Preview: 6,

        page7: 7,

        page8: 8

    };


    const number =
        pageNumbers[pageId] || 1;


    const percentage =
        (number / 8) * 100;


    document
        .getElementById("progressFill")
        .style.width =
        percentage + "%";


    document
        .getElementById("stepText")
        .textContent =
        `Step ${number} of 8`;

}


/* ============================================================
   ROOM INPUTS
============================================================ */

function addRoomInput(value = "") {

    const container =
        document.getElementById("roomInputs");


    const card =
        document.createElement("div");

    card.className =
        "room-input-card";


    card.innerHTML = `

        <div>

            <label>
                Room Name
            </label>

            <input
                type="text"
                class="room-name-input"
                placeholder="e.g. Master Bedroom"
                value="${escapeHTML(value)}"
            >

        </div>

        <button
            type="button"
            class="remove-room"
        >
            Remove
        </button>

    `;


    card
        .querySelector(".remove-room")
        .addEventListener("click", () => {

            card.remove();

            updateRoomPreview();

        });


    card
        .querySelector("input")
        .addEventListener("input", updateRoomPreview);


    container.appendChild(card);

    updateRoomPreview();

}


/* ============================================================
   SAVE ROOMS
============================================================ */

function saveRooms() {

    const inputs =
        document.querySelectorAll(".room-name-input");


    const names = [];


    inputs.forEach(input => {

        const name =
            input.value.trim();


        if (name) {

            names.push(name);

        }

    });


    if (names.length === 0) {

        alert("Please add at least one room.");

        return;

    }


    state.rooms =
        names.map((name, index) => ({

            id: Date.now() + index,

            name,

            length: 0,

            width: 0,

            area: 0,

            copperLength: 0,

            factor: 0,

            calculatedLoad: 0,

            acCapacity: 0,

            acPrice: 0,

            drainageLength: 0

        }));


    renderDimensionInputs();

    goToPage("page2");

}


/* ============================================================
   ROOM PREVIEW
============================================================ */

function updateRoomPreview() {

    const container =
        document.getElementById("roomListPreview");


    const inputs =
        document.querySelectorAll(".room-name-input");


    const names = [];


    inputs.forEach(input => {

        const value =
            input.value.trim();


        if (value) {

            names.push(value);

        }

    });


    if (names.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                No rooms added yet.
            </p>
        `;

        return;

    }


    container.innerHTML =
        names
            .map((name, index) => `

                <div class="room-preview-card">

                    <div>
                        <span>
                            ${index + 1}.
                        </span>

                        <span class="room-name">
                            ${escapeHTML(name)}
                        </span>
                    </div>

                </div>

            `)
            .join("");

}


/* ============================================================
   RENDER DIMENSION INPUTS
============================================================ */

function renderDimensionInputs() {

    const container =
        document.getElementById("dimensionInputs");


    container.innerHTML = "";


    state.rooms.forEach((room, index) => {

        const card =
            document.createElement("div");


        card.className =
            "dimension-card";


        card.innerHTML = `

            <div class="card-title">
                ${index + 1}. ${escapeHTML(room.name)}
            </div>

            <div class="input-grid">

                <div>

                    <label>
                        Length (m)
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        class="length-input"
                        data-index="${index}"
                        value="${room.length || ""}"
                        placeholder="Length"
                    >

                </div>


                <div>

                    <label>
                        Width (m)
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        class="width-input"
                        data-index="${index}"
                        value="${room.width || ""}"
                        placeholder="Width"
                    >

                </div>

            </div>

            <div
                class="area-display"
                id="area-${index}"
            >
                Area: ${formatNumber(room.area || 0)} m²
            </div>

        `;


        container.appendChild(card);

    });


    document
        .querySelectorAll(".length-input, .width-input")
        .forEach(input => {

            input.addEventListener("input", updateLiveArea);

        });

}


/* ============================================================
   LIVE AREA
============================================================ */

function updateLiveArea(event) {

    const index =
        Number(event.target.dataset.index);


    const card =
        event.target.closest(".dimension-card");


    const length =
        Number(
            card.querySelector(".length-input").value
        ) || 0;


    const width =
        Number(
            card.querySelector(".width-input").value
        ) || 0;


    const area =
        length * width;


    document
        .getElementById(`area-${index}`)
        .textContent =
        `Area: ${formatNumber(area)} m²`;

}


/* ============================================================
   PREVIEW DIMENSIONS
============================================================ */

function previewDimensions() {

    let valid = true;


    state.rooms.forEach((room, index) => {

        const lengthInput =
            document.querySelector(
                `.length-input[data-index="${index}"]`
            );


        const widthInput =
            document.querySelector(
                `.width-input[data-index="${index}"]`
            );


        const length =
            Number(lengthInput.value);


        const width =
            Number(widthInput.value);


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

    });


    if (!valid) {

        alert(
            "Please enter valid length and width for every room."
        );

        return;

    }


    const tbody =
        document.getElementById(
            "dimensionPreviewTable"
        );


    tbody.innerHTML =
        state.rooms
            .map((room, index) => `

                <tr>

                    <td>${index + 1}</td>

                    <td>${escapeHTML(room.name)}</td>

                    <td>${formatNumber(room.length)}</td>

                    <td>${formatNumber(room.width)}</td>

                    <td>
                        <strong>
                            ${formatNumber(room.area)}
                        </strong>
                    </td>

                </tr>

            `)
            .join("");


    goToPage("page2Preview");

}


/* ============================================================
   COPPER INPUTS
============================================================ */

function renderCopperInputs() {

    const container =
        document.getElementById("copperInputs");


    container.innerHTML = "";


    state.rooms.forEach((room, index) => {

        const card =
            document.createElement("div");


        card.className =
            "copper-card";


        card.innerHTML = `

            <div class="card-title">

                ${index + 1}.
                ${escapeHTML(room.name)}

            </div>

            <label>
                Copper Length (m)
            </label>

            <input
                type="number"
                min="0"
                step="0.01"
                class="copper-length-input"
                data-index="${index}"
                value="${room.copperLength || ""}"
                placeholder="e.g. 12"
            >

        `;


        container.appendChild(card);

    });

}


/* ============================================================
   PREVIEW COPPER
============================================================ */

function previewCopper() {

    let valid = true;


    state.rooms.forEach((room, index) => {

        const input =
            document.querySelector(
                `.copper-length-input[data-index="${index}"]`
            );


        const value =
            Number(input.value);


        if (
            !value ||
            value < 0
        ) {

            valid = false;

        }


        room.copperLength =
            value;

    });


    if (!valid) {

        alert(
            "Please enter a valid copper length for every room."
        );

        return;

    }


    const tbody =
        document.getElementById(
            "copperPreviewTable"
        );


    tbody.innerHTML =
        state.rooms
            .map((room, index) => `

                <tr>

                    <td>${index + 1}</td>

                    <td>${escapeHTML(room.name)}</td>

                    <td>
                        <strong>
                            ${formatNumber(room.copperLength)} m
                        </strong>
                    </td>

                </tr>

            `)
            .join("");


    goToPage("page3Preview");

}


/* ============================================================
   COOLING LOAD FACTOR
============================================================ */

function renderFactorInputs() {

    const container =
        document.getElementById("factorInputs");


    container.innerHTML = "";


    state.rooms.forEach((room, index) => {

        const card =
            document.createElement("div");


        card.className =
            "factor-card";


        card.innerHTML = `

            <div class="card-title">

                ${index + 1}.
                ${escapeHTML(room.name)}

            </div>

            <div class="small-text">

                Room area:
                <strong>
                    ${formatNumber(room.area)} m²
                </strong>

            </div>


            <label>
                Base Cooling Load Factor
            </label>

            <input
                type="number"
                min="0"
                step="0.01"
                class="factor-input"
                data-index="${index}"
                value="${room.factor || ""}"
                placeholder="e.g. 150"
            >


            <div
                class="area-display"
                id="load-${index}"
            >
                Calculated Load:
                ${formatNumber(room.calculatedLoad || 0)}
            </div>

        `;


        container.appendChild(card);

    });


    document
        .querySelectorAll(".factor-input")
        .forEach(input => {

            input.addEventListener(
                "input",
                updateLiveLoad
            );

        });

}


/* ============================================================
   LIVE COOLING LOAD
============================================================ */

function updateLiveLoad(event) {

    const index =
        Number(event.target.dataset.index);


    const factor =
        Number(event.target.value) || 0;


    const room =
        state.rooms[index];


    const load =
        room.area * factor;


    document
        .getElementById(`load-${index}`)
        .textContent =
        `Calculated Load: ${formatNumber(load)}`;

}


/* ============================================================
   FIND AC CAPACITY
============================================================ */

function recommendCapacity(load) {

    for (
        const capacity
        of AC_CAPACITIES
    ) {

        if (load <= capacity) {

            return capacity;

        }

    }


    return 48000;

}


/* ============================================================
   PREVIEW FACTORS
============================================================ */

function previewFactors() {

    let valid = true;


    state.rooms.forEach((room, index) => {

        const input =
            document.querySelector(
                `.factor-input[data-index="${index}"]`
            );


        const factor =
            Number(input.value);


        if (
            !factor ||
            factor <= 0
        ) {

            valid = false;

        }


        room.factor =
            factor;


        room.calculatedLoad =
            room.area * factor;


        room.acCapacity =
            recommendCapacity(
                room.calculatedLoad
            );

    });


    if (!valid) {

        alert(
            "Please enter a valid cooling load factor for every room."
        );

        return;

    }


    const tbody =
        document.getElementById(
            "factorPreviewTable"
        );


    tbody.innerHTML =
        state.rooms
            .map((room, index) => `

                <tr>

                    <td>${index + 1}</td>

                    <td>${escapeHTML(room.name)}</td>

                    <td>
                        ${formatNumber(room.area)}
                    </td>

                    <td>
                        ${formatNumber(room.factor)}
                    </td>

                    <td>
                        ${formatNumber(room.calculatedLoad)}
                    </td>

                    <td>
                        <span class="capacity-badge">
                            ${formatCapacity(room.acCapacity)}
                        </span>
                    </td>

                </tr>

            `)
            .join("");


    goToPage("page4Preview");

}


/* ============================================================
   UNIQUE AC CAPACITIES
============================================================ */

function getUniqueCapacities() {

    return [
        ...new Set(
            state.rooms.map(
                room => room.acCapacity
            )
        )
    ]
    .sort((a, b) => a - b);

}


/* ============================================================
   AC PRICE INPUTS
============================================================ */

function renderACPriceInputs() {

    const container =
        document.getElementById(
            "acPriceInputs"
        );


    container.innerHTML = "";


    const capacities =
        getUniqueCapacities();


    capacities.forEach(capacity => {

        const quantity =
            state.rooms.filter(
                room =>
                    room.acCapacity === capacity
            ).length;


        const roomWithPrice =
            state.rooms.find(
                room =>
                    room.acCapacity === capacity
            );


        const card =
            document.createElement("div");


        card.className =
            "form-card";


        card.innerHTML = `

            <div class="card-title">

                <span class="capacity-badge">
                    ${formatCapacity(capacity)}
                </span>

            </div>

            <p class="small-text">
                Quantity required:
                <strong>${quantity}</strong>
            </p>

            <label>
                Unit Price (KES)
            </label>

            <input
                type="number"
                min="0"
                step="0.01"
                class="ac-price-input"
                data-capacity="${capacity}"
                value="${roomWithPrice.acPrice || ""}"
                placeholder="Enter equipment price"
            >

        `;


        container.appendChild(card);

    });

}


/* ============================================================
   PREVIEW AC PRICES
============================================================ */

function previewACPrices() {

    const capacities =
        getUniqueCapacities();


    let valid = true;


    capacities.forEach(capacity => {

        const input =
            document.querySelector(
                `.ac-price-input[data-capacity="${capacity}"]`
            );


        const price =
            Number(input.value);


        if (
            !price ||
            price < 0
        ) {

            valid = false;

        }


        state.rooms
            .filter(
                room =>
                    room.acCapacity === capacity
            )
            .forEach(room => {

                room.acPrice =
                    price;

            });

    });


    if (!valid) {

        alert(
            "Please enter a valid price for every AC capacity."
        );

        return;

    }


    const tbody =
        document.getElementById(
            "acPricePreviewTable"
        );


    tbody.innerHTML =
        capacities
            .map(capacity => {

                const rooms =
                    state.rooms.filter(
                        room =>
                            room.acCapacity === capacity
                    );


                const quantity =
                    rooms.length;


                const unitPrice =
                    rooms[0].acPrice;


                const total =
                    quantity * unitPrice;


                return `

                    <tr>

                        <td>
                            <span class="capacity-badge">
                                ${formatCapacity(capacity)}
                            </span>
                        </td>

                        <td>${quantity}</td>

                        <td>
                            ${formatCurrency(unitPrice)}
                        </td>

                        <td>
                            <strong>
                                ${formatCurrency(total)}
                            </strong>
                        </td>

                    </tr>

                `;

            })
            .join("");


    goToPage("page5Preview");

}


/* ============================================================
   DRAINAGE
============================================================ */

function renderDrainageInputs() {

    const container =
        document.getElementById(
            "drainageInputs"
        );


    container.innerHTML = "";


    state.rooms.forEach((room, index) => {

        const card =
            document.createElement("div");


        card.className =
            "drainage-card";


        card.innerHTML = `

            <div class="card-title">

                ${index + 1}.
                ${escapeHTML(room.name)}

            </div>

            <label>
                Drainage PVC Length (m)
            </label>

            <input
                type="number"
                min="0"
                step="0.01"
                class="drainage-length-input"
                data-index="${index}"
                value="${room.drainageLength || ""}"
                placeholder="e.g. 8"
            >

        `;


        container.appendChild(card);

    });

}


/* ============================================================
   PREVIEW DRAINAGE
============================================================ */

function previewDrainage() {

    let valid = true;


    state.rooms.forEach((room, index) => {

        const input =
            document.querySelector(
                `.drainage-length-input[data-index="${index}"]`
            );


        const value =
            Number(input.value);


        if (
            value < 0 ||
            input.value === ""
        ) {

            valid = false;

        }


        room.drainageLength =
            value;

    });


    if (!valid) {

        alert(
            "Please enter a valid drainage length for every room."
        );

        return;

    }


    const tbody =
        document.getElementById(
            "drainagePreviewTable"
        );


    tbody.innerHTML =
        state.rooms
            .map((room, index) => `

                <tr>

                    <td>${index + 1}</td>

                    <td>${escapeHTML(room.name)}</td>

                    <td>
                        <strong>
                            ${formatNumber(room.drainageLength)} m
                        </strong>
                    </td>

                </tr>

            `)
            .join("");


    goToPage("page6Preview");

}


/* ============================================================
   OTHER ITEM TOTAL
============================================================ */

function updateOtherItemTotal() {

    const quantity =
        Number(
            document.getElementById(
                "otherItemQty"
            ).value
        ) || 0;


    const price =
        Number(
            document.getElementById(
                "otherItemPrice"
            ).value
        ) || 0;


    const total =
        quantity * price;


    document
        .getElementById(
            "otherItemTotal"
        )
        .textContent =
        formatCurrency(total);

}


/* ============================================================
   ADD OTHER ITEM
============================================================ */

function addOtherItem() {

    const name =
        document
            .getElementById(
                "otherItemName"
            )
            .value
            .trim();


    const quantity =
        Number(
            document.getElementById(
                "otherItemQty"
            ).value
        );


    const unit =
        document
            .getElementById(
                "otherItemUnit"
            )
            .value
            .trim();


    const price =
        Number(
            document.getElementById(
                "otherItemPrice"
            ).value
        );


    if (!name) {

        alert(
            "Please enter an item description."
        );

        return;

    }


    if (
        !quantity ||
        quantity <= 0
    ) {

        alert(
            "Please enter a valid quantity."
        );

        return;

    }


    if (
        !unit
    ) {

        alert(
            "Please enter the unit."
        );

        return;

    }


    if (
        price < 0 ||
        isNaN(price)
    ) {

        alert(
            "Please enter a valid unit price."
        );

        return;

    }


    const total =
        quantity * price;


    state.otherItems.push({

        name,

        quantity,

        unit,

        unitPrice: price,

        total

    });


    renderOtherItems();


    document
        .getElementById(
            "otherItemName"
        )
        .value = "";


    document
        .getElementById(
            "otherItemQty"
        )
        .value = "";


    document
        .getElementById(
            "otherItemPrice"
        )
        .value = "";


    document
        .getElementById(
            "otherItemTotal"
        )
        .textContent =
        "KES 0.00";

}


/* ============================================================
   RENDER OTHER ITEMS
============================================================ */

function renderOtherItems() {

    const container =
        document.getElementById(
            "otherItemsList"
        );


    if (
        state.otherItems.length === 0
    ) {

        container.innerHTML = `
            <p class="empty-message">
                No additional items added.
            </p>
        `;

        return;

    }


    container.innerHTML =
        state.otherItems
            .map((item, index) => `

                <div
                    class="room-preview-card"
                >

                    <div>

                        <strong>
                            ${index + 4}.
                        </strong>

                        ${escapeHTML(item.name)}

                        <br>

                        <span class="small-text">

                            ${item.quantity}
                            ${escapeHTML(item.unit)}
                            ×
                            ${formatCurrency(item.unitPrice)}

                        </span>

                    </div>


                    <div class="room-actions">

                        <strong>
                            ${formatCurrency(item.total)}
                        </strong>

                        <button
                            class="danger-btn"
                            onclick="removeOtherItem(${index})"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


/* ============================================================
   REMOVE OTHER ITEM
============================================================ */

function removeOtherItem(index) {

    if (
        confirm(
            "Remove this item?"
        )
    ) {

        state.otherItems.splice(
            index,
            1
        );

        renderOtherItems();

    }

}


/* ============================================================
   CALCULATIONS
============================================================ */

function getEquipmentTotal() {

    return state.rooms.reduce(
        (total, room) => {

            return total +
                room.acPrice;

        },
        0
    );

}


function getCopperTotalLength() {

    return state.rooms.reduce(
        (total, room) => {

            return total +
                Number(room.copperLength);

        },
        0
    );

}


function getDrainageTotalLength() {

    return state.rooms.reduce(
        (total, room) => {

            return total +
                Number(room.drainageLength);

        },
        0
    );

}


function getCopperCost() {

    return (
        getCopperTotalLength() *
        state.copperRate
    );

}


function getDrainageCost() {

    return (
        getDrainageTotalLength() *
        state.drainageRate
    );

}


function getOtherItemsTotal() {

    return state.otherItems.reduce(
        (total, item) => {

            return total +
                item.total;

        },
        0
    );

}


function getTotalHVACWorks() {

    return (
        getEquipmentTotal() +

        getCopperCost() +

        getDrainageCost() +

        getOtherItemsTotal()
    );

}


function getExclusiveSummaryTotal() {

    const hvac =
        getTotalHVACWorks();


    return (
        15000 +
        5000 +
        hvac
    );

}


function getVAT() {

    return (
        getExclusiveSummaryTotal() *
        0.16
    );

}


function getInclusiveTotal() {

    return (
        getExclusiveSummaryTotal() +
        getVAT()
    );

}


/* ============================================================
   GENERATE QUOTATION PREVIEW
============================================================ */

function generateQuotationPreview() {

    state.copperRate =
        Number(
            document.getElementById(
                "copperRate"
            ).value
        );


    state.drainageRate =
        Number(
            document.getElementById(
                "drainageRate"
            ).value
        );


    if (
        isNaN(state.copperRate) ||
        state.copperRate < 0
    ) {

        alert(
            "Please enter a valid copper rate."
        );

        return;

    }


    if (
        isNaN(state.drainageRate) ||
        state.drainageRate < 0
    ) {

        alert(
            "Please enter a valid drainage rate."
        );

        return;

    }


    const equipment =
        getEquipmentTotal();


    const copper =
        getCopperCost();


    const drainage =
        getDrainageCost();


    const hvac =
        getTotalHVACWorks();


    const exclusive =
        getExclusiveSummaryTotal();


    const vat =
        getVAT();


    const inclusive =
        getInclusiveTotal();


    document
        .getElementById(
            "summaryEquipment"
        )
        .textContent =
        formatCurrency(equipment);


    document
        .getElementById(
            "summaryCopper"
        )
        .textContent =
        formatCurrency(copper);


    document
        .getElementById(
            "summaryDrainage"
        )
        .textContent =
        formatCurrency(drainage);


    document
        .getElementById(
            "summaryHVAC"
        )
        .textContent =
        formatCurrency(hvac);


    document
        .getElementById(
            "summaryHVAC2"
        )
        .textContent =
        formatCurrency(hvac);


    document
        .getElementById(
            "summaryExclusive"
        )
        .textContent =
        formatCurrency(exclusive);


    document
        .getElementById(
            "summaryVAT"
        )
        .textContent =
        formatCurrency(vat);


    document
        .getElementById(
            "summaryInclusive"
        )
        .textContent =
        formatCurrency(inclusive);


    const otherContainer =
        document.getElementById(
            "summaryOtherItems"
        );


    otherContainer.innerHTML =
        state.otherItems
            .map(item => `

                <div class="summary-row">

                    <span>
                        ${escapeHTML(item.name)}
                    </span>

                    <strong>
                        ${formatCurrency(item.total)}
                    </strong>

                </div>

            `)
            .join("");


    goToPage("page8");

}


/* ============================================================
   PDF GENERATION
============================================================ */

function generatePDF() {

    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });


    /* --------------------------------
       COLORS
    -------------------------------- */

    const blue =
        [0, 75, 153];

    const cyan =
        [0, 166, 166];

    const dark =
        [16, 42, 67];

    const light =
        [235, 246, 252];


    /* --------------------------------
       PAGE SETTINGS
    -------------------------------- */

    const pageWidth =
        doc.internal.pageSize.getWidth();


    const pageHeight =
        doc.internal.pageSize.getHeight();


    const margin = 14;


    /* --------------------------------
       HEADER
    -------------------------------- */

    doc.setFillColor(
        blue[0],
        blue[1],
        blue[2]
    );


    doc.rect(
        0,
        0,
        pageWidth,
        29,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(18);


    doc.text(
        "HOTPOINT ENGINEERING DIVISION",
        pageWidth / 2,
        12,
        {
            align: "center"
        }
    );


    doc.setFontSize(10);

    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.text(
        "HVAC WORKS QUOTATION",
        pageWidth / 2,
        20,
        {
            align: "center"
        }
    );


    /* --------------------------------
       QUOTATION DATE
    -------------------------------- */

    const date =
        new Date();


    const dateString =
        date.toLocaleDateString(
            "en-GB"
        );


    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    );


    doc.setFontSize(9);


    doc.text(
        `Date: ${dateString}`,
        pageWidth - margin,
        37,
        {
            align: "right"
        }
    );


    let y = 44;


    /* =================================
       1. EQUIPMENT
    ================================= */

    addSectionHeading(
        doc,
        "1. EQUIPMENT",
        y,
        blue
    );


    y += 8;


    const capacities =
        getUniqueCapacities();


    const equipmentRows =
        capacities.map(capacity => {

            const rooms =
                state.rooms.filter(
                    room =>
                        room.acCapacity === capacity
                );


            const quantity =
                rooms.length;


            const price =
                rooms[0].acPrice;


            const total =
                quantity * price;


            return [

                formatCapacity(capacity),

                quantity,

                formatCurrencyPlain(price),

                formatCurrencyPlain(total)

            ];

        });


    equipmentRows.push([

        "",

        "",

        "Equipment Total",

        formatCurrencyPlain(
            getEquipmentTotal()
        )

    ]);


    doc.autoTable({

        startY: y,

        head: [[
            "Description",
            "Qty",
            "Unit Price (KES)",
            "Total (KES)"
        ]],

        body: equipmentRows,

        theme: "grid",

        headStyles: {
            fillColor: blue,
            textColor: 255,
            fontStyle: "bold"
        },

        styles: {
            fontSize: 9,
            cellPadding: 3
        },

        columnStyles: {
            1: {
                halign: "center"
            },

            2: {
                halign: "right"
            },

            3: {
                halign: "right"
            }
        }

    });


    y =
        doc.lastAutoTable.finalY + 10;


    /* =================================
       2. COPPER
    ================================= */

    addSectionHeading(
        doc,
        "2. COPPER AND ACCESSORIES",
        y,
        cyan
    );


    y += 8;


    doc.autoTable({

        startY: y,

        head: [[
            "Description",
            "Total Length (m)",
            "Cost / Metre (KES)",
            "Total (KES)"
        ]],

        body: [[

            "Copper & Accessories",

            formatNumber(
                getCopperTotalLength()
            ),

            formatCurrencyPlain(
                state.copperRate
            ),

            formatCurrencyPlain(
                getCopperCost()
            )

        ]],

        theme: "grid",

        headStyles: {
            fillColor: cyan,
            textColor: 255,
            fontStyle: "bold"
        },

        styles: {
            fontSize: 9,
            cellPadding: 3
        },

        columnStyles: {

            1: {
                halign: "center"
            },

            2: {
                halign: "right"
            },

            3: {
                halign: "right"
            }

        }

    });


    y =
        doc.lastAutoTable.finalY + 10;


    /* =================================
       3. DRAINAGE
    ================================= */

    addSectionHeading(
        doc,
        "3. DRAINAGE",
        y,
        blue
    );


    y += 8;


    doc.autoTable({

        startY: y,

        head: [[
            "Description",
            "Total Length (m)",
            "Cost / Metre (KES)",
            "Total (KES)"
        ]],

        body: [[

            "PVC Drainage & Accessories",

            formatNumber(
                getDrainageTotalLength()
            ),

            formatCurrencyPlain(
                state.drainageRate
            ),

            formatCurrencyPlain(
                getDrainageCost()
            )

        ]],

        theme: "grid",

        headStyles: {
            fillColor: blue,
            textColor: 255,
            fontStyle: "bold"
        },

        styles: {
            fontSize: 9,
            cellPadding: 3
        },

        columnStyles: {

            1: {
                halign: "center"
            },

            2: {
                halign: "right"
            },

            3: {
                halign: "right"
            }

        }

    });


    y =
        doc.lastAutoTable.finalY + 10;


    /* =================================
       ADDITIONAL ITEMS
    ================================= */

    if (
        state.otherItems.length > 0
    ) {

        addSectionHeading(
            doc,
            "4. ADDITIONAL ITEMS",
            y,
            cyan
        );


        y += 8;


        const otherRows =
            state.otherItems.map(
                item => [

                    item.name,

                    `${item.quantity} ${item.unit}`,

                    formatCurrencyPlain(
                        item.unitPrice
                    ),

                    formatCurrencyPlain(
                        item.total
                    )

                ]
            );


        doc.autoTable({

            startY: y,

            head: [[
                "Description",
                "Quantity",
                "Unit Price (KES)",
                "Total (KES)"
            ]],

            body: otherRows,

            theme: "grid",

            headStyles: {
                fillColor: cyan,
                textColor: 255,
                fontStyle: "bold"
            },

            styles: {
                fontSize: 9,
                cellPadding: 3
            },

            columnStyles: {

                2: {
                    halign: "right"
                },

                3: {
                    halign: "right"
                }

            }

        });


        y =
            doc.lastAutoTable.finalY + 10;

    }


    /* =================================
       TOTAL HVAC WORKS
    ================================= */

    const hvac =
        getTotalHVACWorks();


    const exclusive =
        getExclusiveSummaryTotal();


    const vat =
        getVAT();


    const inclusive =
        getInclusiveTotal();


    /* Check page space */

    if (
        y > pageHeight - 90
    ) {

        doc.addPage();

        y = 20;

    }


    addSectionHeading(
        doc,
        "TOTAL HVAC WORKS",
        y,
        dark
    );


    y += 9;


    doc.setFillColor(
        light[0],
        light[1],
        light[2]
    );


    doc.rect(
        margin,
        y,
        pageWidth - margin * 2,
        12,
        "F"
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(12);


    doc.setTextColor(
        dark[0],
        dark[1],
        dark[2]
    );


    doc.text(
        "Total HVAC Works - Exclusive of VAT",
        margin + 4,
        y + 8
    );


    doc.text(
        formatCurrencyPlain(hvac),
        pageWidth - margin - 4,
        y + 8,
        {
            align: "right"
        }
    );


    y += 20;


    /* =================================
       SUMMARY
    ================================= */

    addSectionHeading(
        doc,
        "SUMMARY",
        y,
        blue
    );


    y += 8;


    const summaryRows = [

        [
            "Preliminaries",
            "1 Lot",
            "15,000.00"
        ],

        [
            "As Built Drawing",
            "1 Lot",
            "5,000.00"
        ],

        [
            "Total HVAC Works",
            "1 Lot",
            formatCurrencyPlain(hvac)
        ]

    ];


    doc.autoTable({

        startY: y,

        head: [[
            "Description",
            "Quantity",
            "Total (KES)"
        ]],

        body: summaryRows,

        theme: "grid",

        headStyles: {
            fillColor: blue,
            textColor: 255,
            fontStyle: "bold"
        },

        styles: {
            fontSize: 9,
            cellPadding: 3
        },

        columnStyles: {

            1: {
                halign: "center"
            },

            2: {
                halign: "right"
            }

        }

    });


    y =
        doc.lastAutoTable.finalY + 8;


    /* =================================
       VAT SUMMARY
    ================================= */

    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(10);


    doc.text(
        "Total Exclusive of VAT:",
        pageWidth - 85,
        y
    );


    doc.text(
        formatCurrencyPlain(exclusive),
        pageWidth - margin,
        y,
        {
            align: "right"
        }
    );


    y += 7;


    doc.text(
        "VAT @ 16%:",
        pageWidth - 85,
        y
    );


    doc.text(
        formatCurrencyPlain(vat),
        pageWidth - margin,
        y,
        {
            align: "right"
        }
    );


    y += 10;


    /* =================================
       GRAND TOTAL
    ================================= */

    doc.setFillColor(
        blue[0],
        blue[1],
        blue[2]
    );


    doc.rect(
        margin,
        y,
        pageWidth - margin * 2,
        15,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(12);


    doc.text(
        "NEW TOTAL INCLUSIVE OF VAT",
        margin + 4,
        y + 10
    );


    doc.text(
        formatCurrencyPlain(inclusive),
        pageWidth - margin - 4,
        y + 10,
        {
            align: "right"
        }
    );


    /* =================================
       FOOTER
    ================================= */

    doc.setTextColor(
        100,
        100,
        100
    );


    doc.setFont(
        "helvetica",
        "normal"
    );


    doc.setFontSize(8);


    doc.text(
        "Prepared by Moses Ntella Taa",
        pageWidth / 2,
        pageHeight - 15,
        {
            align: "center"
        }
    );


    doc.text(
        "hvacmsaintern@hotpoint.co.ke",
        pageWidth / 2,
        pageHeight - 10,
        {
            align: "center"
        }
    );


    /* =================================
       SAVE
    ================================= */

    const fileName =
        `Onsite_HVAC_Quotation_${getDateForFile()}.pdf`;


    doc.save(fileName);

}


/* ============================================================
   PDF SECTION HEADING
============================================================ */

function addSectionHeading(
    doc,
    text,
    y,
    color
) {

    doc.setFillColor(
        color[0],
        color[1],
        color[2]
    );


    doc.rect(
        14,
        y - 5,
        182,
        8,
        "F"
    );


    doc.setTextColor(
        255,
        255,
        255
    );


    doc.setFont(
        "helvetica",
        "bold"
    );


    doc.setFontSize(10);


    doc.text(
        text,
        18,
        y + 0.5
    );

}


/* ============================================================
   FORMATTING
============================================================ */

function formatNumber(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-KE",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function formatCurrency(value) {

    return `KES ${formatNumber(value)}`;

}


function formatCurrencyPlain(value) {

    return formatNumber(value);

}


function formatCapacity(capacity) {

    return `${Number(capacity).toLocaleString()} BTU/h`;

}


function getDateForFile() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* ============================================================
   SECURITY / HTML ESCAPING
============================================================ */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}