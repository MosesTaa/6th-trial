/* =========================================================
   ONSITE QUOTATION
   HVAC QUOTATION WEB APPLICATION
   ========================================================= */

"use strict";

/* =========================================================
   PDF LIBRARY CHECK
   ========================================================= */

let jsPDFConstructor = null;

if (
    window.jspdf &&
    typeof window.jspdf.jsPDF === "function"
) {
    jsPDFConstructor = window.jspdf.jsPDF;
}


/* =========================================================
   GLOBAL QUOTATION DATA
   ========================================================= */

let quotation = {
    rooms: [],
    copperRate: 3200,
    drainageRate: 0,
    additionalItems: [],

    acPrices: [],

    clientName: "",
    installationLocation: "",
    salesPerson: "",
    salesPhone: "",
    salesEmail: ""
};


/* =========================================================
   AC CAPACITIES
   ========================================================= */

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

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page =
        document.getElementById(
            "page" + pageNumber
        );

    if (!page) {
        console.warn(
            "Page not found:",
            pageNumber
        );
        return;
    }

    page.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   FORMATTING
   ========================================================= */

function money(value) {

    const amount =
        Number(value) || 0;

    return (
        "KES " +
        amount.toLocaleString(
            "en-KE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );
}


function number(value) {

    const amount =
        Number(value) || 0;

    return amount.toLocaleString(
        "en-KE",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   STEP 1
   ADD ROOMS
   ========================================================= */

function addRoomInput() {

    const container =
        document.getElementById(
            "roomInputContainer"
        );

    if (!container) return;

    const row =
        document.createElement("div");

    row.className =
        "input-row room-input-row";

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

    const input =
        row.querySelector("input");

    if (input) {
        input.focus();
    }
}


function removeRoomInput(button) {

    const rows =
        document.querySelectorAll(
            ".room-input-row"
        );

    if (rows.length <= 1) {

        const input =
            button.parentElement
                .querySelector("input");

        if (input) {
            input.value = "";
        }

        return;
    }

    button.parentElement.remove();
}


function saveRooms() {

    const inputs =
        document.querySelectorAll(
            ".room-name-input"
        );

    const names = [];

    inputs.forEach(input => {

        const name =
            input.value.trim();

        if (name) {
            names.push(name);
        }

    });

    if (names.length === 0) {

        alert(
            "Please enter at least one room."
        );

        return;
    }

    quotation.rooms =
        names.map(name => ({

            name: name,

            length: 0,
            width: 0,
            area: 0,

            copper: 0,
            drainage: 0,

            coolingFactor: 0,
            coolingLoad: 0,

            capacity: 0
        }));

    renderRoomPreview();

    showPage(2);
}


/* =========================================================
   STEP 2
   ROOM PREVIEW
   ========================================================= */

function renderRoomPreview() {

    const container =
        document.getElementById(
            "roomPreview"
        );

    if (!container) return;

    if (
        quotation.rooms.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                No rooms added.
            </div>
        `;

        return;
    }

    container.innerHTML =
        quotation.rooms
            .map((room, index) => `

                <div class="room-card">

                    <div>
                        <span class="room-name">
                            ${index + 1}.
                            ${escapeHTML(room.name)}
                        </span>
                    </div>

                    <div class="button-group">

                        <button
                            type="button"
                            class="edit-button"
                            onclick="renameRoom(${index})"
                        >
                            Rename
                        </button>

                        <button
                            type="button"
                            class="danger-button"
                            onclick="deleteRoom(${index})"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `)
            .join("");
}


function renameRoom(index) {

    if (
        !quotation.rooms[index]
    ) {
        return;
    }

    const currentName =
        quotation.rooms[index].name;

    const newName =
        prompt(
            "Enter the new room name:",
            currentName
        );

    if (
        newName &&
        newName.trim()
    ) {

        quotation.rooms[index].name =
            newName.trim();

        renderRoomPreview();
    }
}


function deleteRoom(index) {

    if (
        !quotation.rooms[index]
    ) {
        return;
    }

    const roomName =
        quotation.rooms[index].name;

    const confirmed =
        confirm(
            `Delete "${roomName}"?`
        );

    if (!confirmed) {
        return;
    }

    quotation.rooms.splice(
        index,
        1
    );

    if (
        quotation.rooms.length === 0
    ) {

        alert(
            "At least one room is required."
        );

        showPage(1);

        return;
    }

    renderRoomPreview();
}


function goToDimensions() {

    if (
        quotation.rooms.length === 0
    ) {

        alert(
            "Please add at least one room."
        );

        showPage(1);

        return;
    }

    renderDimensionInputs();

    showPage(3);
}


/* =========================================================
   STEP 3
   ROOM DIMENSIONS
   ========================================================= */

function renderDimensionInputs() {

    const container =
        document.getElementById(
            "dimensionInputs"
        );

    if (!container) return;

    container.innerHTML =
        quotation.rooms
            .map((room, index) => `

                <div class="card">

                    <h3>
                        ${index + 1}.
                        ${escapeHTML(room.name)}
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

                    <div class="info-box">
                        Area:
                        <strong id="area-${index}">
                            ${number(room.area)} m²
                        </strong>
                    </div>

                </div>

            `)
            .join("");

    quotation.rooms.forEach(
        (room, index) => {

            const length =
                document.getElementById(
                    `length-${index}`
                );

            const width =
                document.getElementById(
                    `width-${index}`
                );

            if (length) {

                length.addEventListener(
                    "input",
                    () =>
                        updateAreaPreview(index)
                );
            }

            if (width) {

                width.addEventListener(
                    "input",
                    () =>
                        updateAreaPreview(index)
                );
            }

        }
    );
}


function updateAreaPreview(index) {

    const length =
        Number(
            document.getElementById(
                `length-${index}`
            )?.value
        );

    const width =
        Number(
            document.getElementById(
                `width-${index}`
            )?.value
        );

    const area =
        length * width;

    const output =
        document.getElementById(
            `area-${index}`
        );

    if (output) {

        output.textContent =
            `${number(area)} m²`;
    }
}


function previewDimensions() {

    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {

            const length =
                Number(
                    document.getElementById(
                        `length-${index}`
                    )?.value
                );

            const width =
                Number(
                    document.getElementById(
                        `width-${index}`
                    )?.value
                );

            if (
                !length ||
                !width ||
                length <= 0 ||
                width <= 0
            ) {

                valid = false;

                return;
            }

            room.length = length;
            room.width = width;
            room.area =
                length * width;
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

    const container =
        document.getElementById(
            "dimensionPreview"
        );

    if (!container) return;

    container.innerHTML = `

        <div style="overflow-x:auto">

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                "
            >

                <thead>

                    <tr
                        style="
                            background:#e0f2fe;
                        "
                    >

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

                    ${quotation.rooms
                        .map(room => `

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

                        `)
                        .join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* =========================================================
   STEP 5
   COPPER
   ========================================================= */

function goToCopper() {

    renderCopperInputs();

    showPage(5);
}


function renderCopperInputs() {

    const container =
        document.getElementById(
            "copperInputs"
        );

    if (!container) return;

    container.innerHTML =
        quotation.rooms
            .map((room, index) => `

                <div class="card">

                    <h3>
                        ${index + 1}.
                        ${escapeHTML(room.name)}
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

            `)
            .join("");
}


function previewCopper() {

    let valid = true;

    quotation.rooms.forEach(
        (room, index) => {

            const input =
                document.getElementById(
                    `copper-${index}`
                );

            const copper =
                Number(input?.value);

            if (
                isNaN(copper) ||
                copper < 0
            ) {

                valid = false;

                return;
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

    const container =
        document.getElementById(
            "copperPreview"
        );

    if (!container) return;

    const totalCopper =
        quotation.rooms.reduce(
            (sum, room) =>
                sum +
                Number(
                    room.copper || 0
                ),
            0
        );

    container.innerHTML = `

        ${quotation.rooms
            .map((room, index) => `

                <div class="card">

                    <strong>
                        ${index + 1}.
                        ${escapeHTML(room.name)}
                    </strong>

                    <p>
                        Copper:
                        <strong>
                            ${number(room.copper)} m
                        </strong>
                    </p>

                </div>

            `)
            .join("")}

        <div class="info-box">

            <strong>
                Total Copper:
            </strong>

            ${number(totalCopper)} m

        </div>
    `;
}


/* =========================================================
   STEP 7 - COOLING LOAD & AC RECOMMENDATION
   ========================================================= */

function goToCoolingLoad() {

    if (
        !quotation.rooms ||
        quotation.rooms.length === 0
    ) {
        alert("No rooms have been added.");
        showPage(1);
        return;
    }

    renderCoolingLoadInputs();

    showPage(7);
}


/* =========================================================
   COOLING LOAD INPUTS
   ========================================================= */

function renderCoolingLoadInputs() {

    const container =
        document.getElementById("coolingLoadInputs");

    if (!container) {

        console.error(
            "ERROR: #coolingLoadInputs was not found."
        );

        alert(
            "Cooling Load section could not be loaded. Please check your HTML."
        );

        return;
    }


    container.innerHTML =
        quotation.rooms.map(
            (room, index) => {

                return `

                    <div class="cooling-card">

                        <h3>
                            ${index + 1}.
                            ${escapeHTML(room.name)}
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
                                min="1"
                                step="1"
                                id="factor-${index}"
                                value="${
                                    room.coolingFactor || ""
                                }"
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

            const input =
                document.getElementById(
                    `factor-${index}`
                );

            if (!input) {
                return;
            }

            input.addEventListener(
                "input",
                function () {

                    updateCoolingLoadPreview(
                        index
                    );

                }
            );

        }
    );
}


/* =========================================================
   LIVE COOLING LOAD
   ========================================================= */

function updateCoolingLoadPreview(index) {

    const room =
        quotation.rooms[index];

    const factorInput =
        document.getElementById(
            `factor-${index}`
        );

    const loadOutput =
        document.getElementById(
            `load-${index}`
        );


    if (
        !room ||
        !factorInput ||
        !loadOutput
    ) {
        return;
    }


    const factor =
        Number(
            factorInput.value
        );


    if (
        !Number.isFinite(factor) ||
        factor <= 0
    ) {

        loadOutput.textContent =
            "0 BTU/hr";

        return;
    }


    const load =
        Number(room.area) *
        factor;


    loadOutput.textContent =
        `${number(load)} BTU/hr`;
}


/* =========================================================
   AC CAPACITY RECOMMENDATION
   ========================================================= */

function selectCapacity(load) {

    for (
        const capacity
        of AC_CAPACITIES
    ) {

        if (
            load <= capacity
        ) {

            return capacity;
        }
    }


    return AC_CAPACITIES[
        AC_CAPACITIES.length - 1
    ];
}


/* =========================================================
   PREVIEW AC RECOMMENDATIONS
   ========================================================= */

function previewCoolingLoad() {

    if (
        !quotation.rooms ||
        quotation.rooms.length === 0
    ) {

        alert(
            "No rooms found. Please add rooms first."
        );

        showPage(1);

        return;
    }


    let valid = true;


    quotation.rooms.forEach(
        (room, index) => {

            const input =
                document.getElementById(
                    `factor-${index}`
                );


            if (!input) {

                console.error(
                    `Cooling factor input missing for room ${index + 1}.`
                );

                valid = false;

                return;
            }


            const factor =
                Number(input.value);


            if (
                !Number.isFinite(factor) ||
                factor <= 0
            ) {

                valid = false;

                return;
            }


            /* Save factor */

            room.coolingFactor =
                factor;


            /* Calculate cooling load */

            room.coolingLoad =
                Number(room.area) *
                factor;


            /* Select recommended AC */

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


    /* Render recommendation */

    renderCoolingLoadPreview();


    /* Open AC recommendation page */

    showPage(8);
}


/* =========================================================
   AC RECOMMENDATION PREVIEW
   ========================================================= */

function renderCoolingLoadPreview() {

    const container =
        document.getElementById(
            "coolingLoadPreview"
        );


    if (!container) {

        console.error(
            "ERROR: #coolingLoadPreview was not found."
        );

        alert(
            "AC Recommendation preview could not be displayed. Please check the HTML."
        );

        return;
    }


    if (
        !quotation.rooms ||
        quotation.rooms.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                No AC recommendations available.
            </div>
        `;

        return;
    }


    container.innerHTML =
        quotation.rooms.map(
            (room, index) => {

                return `

                    <div class="preview-item">

                        <strong>
                            ${index + 1}.
                            ${escapeHTML(room.name)}
                        </strong>

                        <p>
                            Room Area:
                            ${number(room.area)} m²
                        </p>

                        <p>
                            Cooling Load Factor:
                            ${number(
                                room.coolingFactor
                            )}
                        </p>

                        <p>
                            Calculated Cooling Load:
                            <strong>
                                ${number(
                                    room.coolingLoad
                                )}
                                BTU/hr
                            </strong>
                        </p>

                        <p>
                            Recommended AC:
                        </p>

                        <span class="capacity-badge">

                            ${Number(
                                room.capacity
                            ).toLocaleString(
                                "en-KE"
                            )}

                            BTU/hr

                        </span>

                    </div>

                `;

            }
        ).join("");
}


/* =========================================================
   PROCEED TO AC PRICES
   ========================================================= */

function goToACPrices() {

    if (
        !quotation.rooms ||
        quotation.rooms.length === 0
    ) {

        alert(
            "No rooms or AC recommendations found."
        );

        return;
    }


    /* Check that every room has a recommendation */

    const missingRecommendation =
        quotation.rooms.some(
            room =>
                !room.capacity ||
                room.capacity <= 0
        );


    if (
        missingRecommendation
    ) {

        alert(
            "AC recommendations have not been calculated yet. Please go back and preview the AC recommendations."
        );

        showPage(7);

        return;
    }


    /* Render AC price inputs */

    renderACPriceInputs();


    /* Move to AC price page */

    showPage(9);
}


/* =========================================================
   STEP 9
   AC PRICES
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


function getCapacityQuantity(
    capacity
) {

    return quotation.rooms.filter(
        room =>
            room.capacity === capacity
    ).length;
}


function renderACPriceInputs() {

    const container =
        document.getElementById(
            "acPriceInputs"
        );

    if (!container) return;

    const capacities =
        getUniqueCapacities();

    container.innerHTML =
        capacities
            .map(capacity => {

                const existing =
                    quotation.acPrices.find(
                        item =>
                            item.capacity ===
                            capacity
                    );

                return `

                    <div class="card">

                        <h3>
                            ${capacity.toLocaleString()}
                            BTU/hr
                        </h3>

                        <p>
                            Quantity:
                            <strong>
                                ${getCapacityQuantity(
                                    capacity
                                )}
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
                                    existing
                                        ? existing.unitPrice
                                        : ""
                                }"
                                placeholder="Enter unit price"
                            >
                        </label>

                    </div>

                `;
            })
            .join("");
}


function saveACPrices() {

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
            unitPrice <= 0
        ) {

            valid = false;

            return;
        }

        const quantity =
            getCapacityQuantity(
                capacity
            );

        prices.push({

            capacity,
            quantity,
            unitPrice,

            total:
                quantity * unitPrice
        });
    });

    if (!valid) {

        alert(
            "Please enter a valid price for every AC capacity."
        );

        return;
    }

    quotation.acPrices =
        prices;

    goToMaterialRates();
}


/* =========================================================
   STEP 10
   MATERIAL RATES
   ========================================================= */

function goToMaterialRates() {

    const copperInput =
        document.getElementById(
            "copperRate"
        );

    const drainageInput =
        document.getElementById(
            "drainageRate"
        );

    if (copperInput) {

        copperInput.value =
            quotation.copperRate || "";
    }

    if (drainageInput) {

        drainageInput.value =
            quotation.drainageRate || "";
    }

    showPage(10);
}


function saveMaterialRates() {

    const copperRate =
        Number(
            document.getElementById(
                "copperRate"
            )?.value
        );

    const drainageRate =
        Number(
            document.getElementById(
                "drainageRate"
            )?.value
        );

    if (
        isNaN(copperRate) ||
        copperRate < 0
    ) {

        alert(
            "Please enter a valid copper rate."
        );

        return;
    }

    if (
        isNaN(drainageRate) ||
        drainageRate < 0
    ) {

        alert(
            "Please enter a valid drainage rate."
        );

        return;
    }

    quotation.copperRate =
        copperRate;

    quotation.drainageRate =
        drainageRate;

    renderAdditionalItems();

    showPage(11);
}


/* =========================================================
   STEP 11
   ADDITIONAL ITEMS
   ========================================================= */

function renderAdditionalItems() {

    const container =
        document.getElementById(
            "additionalItems"
        );

    if (!container) return;

    container.innerHTML = `

        <div class="card">

            <label>
                Item Name

                <input
                    id="extraItemName"
                    type="text"
                    placeholder="e.g. Wall bracket"
                >
            </label>

            <label>
                Quantity

                <input
                    id="extraItemQty"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 2"
                >
            </label>

            <label>
                Unit

                <input
                    id="extraItemUnit"
                    type="text"
                    placeholder="e.g. pcs"
                >
            </label>

            <label>
                Unit Price (KES)

                <input
                    id="extraItemPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 1500"
                >
            </label>

            <div class="info-box">

                Item Total:

                <strong id="extraItemTotal">
                    KES 0.00
                </strong>

            </div>

            <button
                type="button"
                class="secondary-button full-width"
                onclick="saveExtraItem()"
            >
                Add Item
            </button>

        </div>

        <div id="additionalItemsPreview"></div>

        <button
            type="button"
            class="primary-button full-width"
            onclick="finishAdditionalItems()"
        >
            Continue to Quotation Preview →
        </button>
    `;

    const qty =
        document.getElementById(
            "extraItemQty"
        );

    const price =
        document.getElementById(
            "extraItemPrice"
        );

    if (qty) {

        qty.addEventListener(
            "input",
            calculateExtraItem
        );
    }

    if (price) {

        price.addEventListener(
            "input",
            calculateExtraItem
        );
    }

    renderAdditionalItemsPreview();
}


function calculateExtraItem() {

    const qty =
        Number(
            document.getElementById(
                "extraItemQty"
            )?.value
        );

    const price =
        Number(
            document.getElementById(
                "extraItemPrice"
            )?.value
        );

    const total =
        qty * price;

    const output =
        document.getElementById(
            "extraItemTotal"
        );

    if (output) {

        output.textContent =
            money(total);
    }
}


function saveExtraItem() {

    const name =
        document.getElementById(
            "extraItemName"
        )?.value.trim();

    const quantity =
        Number(
            document.getElementById(
                "extraItemQty"
            )?.value
        );

    const unit =
        document.getElementById(
            "extraItemUnit"
        )?.value.trim() ||
        "lot";

    const unitPrice =
        Number(
            document.getElementById(
                "extraItemPrice"
            )?.value
        );

    if (
        !name ||
        isNaN(quantity) ||
        quantity <= 0 ||
        isNaN(unitPrice) ||
        unitPrice < 0
    ) {

        alert(
            "Please enter item name, quantity and valid unit price."
        );

        return;
    }

    quotation.additionalItems.push({

        name,
        quantity,
        unit,
        unitPrice,

        total:
            quantity * unitPrice
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

    renderAdditionalItemsPreview();
}


function renderAdditionalItemsPreview() {

    const container =
        document.getElementById(
            "additionalItemsPreview"
        );

    if (!container) return;

    if (
        quotation.additionalItems.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-message">
                No additional items added.
            </div>
        `;

        return;
    }

    container.innerHTML =
        quotation.additionalItems
            .map((item, index) => `

                <div class="card">

                    <strong>
                        ${index + 1}.
                        ${escapeHTML(item.name)}
                    </strong>

                    <p>
                        ${number(item.quantity)}
                        ${escapeHTML(item.unit)}
                        ×
                        ${money(item.unitPrice)}
                    </p>

                    <p>
                        Total:
                        <strong>
                            ${money(item.total)}
                        </strong>
                    </p>

                    <button
                        type="button"
                        class="danger-button"
                        onclick="deleteAdditionalItem(${index})"
                    >
                        Delete
                    </button>

                </div>

            `)
            .join("");
}


function deleteAdditionalItem(index) {

    if (
        !quotation.additionalItems[index]
    ) {
        return;
    }

    if (
        confirm(
            "Delete this additional item?"
        )
    ) {

        quotation.additionalItems.splice(
            index,
            1
        );

        renderAdditionalItemsPreview();
    }
}


function finishAdditionalItems() {

    renderQuotationPreview();

    showPage(12);
}


/* =========================================================
   STEP 12
   QUOTATION PREVIEW
   ========================================================= */

function getEquipmentTotal() {

    return quotation.acPrices.reduce(
        (sum, item) =>
            sum +
            Number(item.total || 0),
        0
    );
}


function getCopperTotal() {

    const totalLength =
        quotation.rooms.reduce(
            (sum, room) =>
                sum +
                Number(
                    room.copper || 0
                ),
            0
        );

    return (
        totalLength *
        quotation.copperRate
    );
}


function getDrainageTotal() {

    const totalLength =
        quotation.rooms.reduce(
            (sum, room) =>
                sum +
                Number(
                    room.drainage || 0
                ),
            0
        );

    return (
        totalLength *
        quotation.drainageRate
    );
}


function getAdditionalItemsTotal() {

    return quotation.additionalItems.reduce(
        (sum, item) =>
            sum +
            Number(item.total || 0),
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


function renderQuotationPreview() {

    const container =
        document.getElementById(
            "quotationPreview"
        );

    if (!container) return;

    const equipment =
        getEquipmentTotal();

    const copper =
        getCopperTotal();

    const drainage =
        getDrainageTotal();

    const additional =
        getAdditionalItemsTotal();

    const total =
        getHVACTotal();

    container.innerHTML = `

        <div class="card">

            <h3>Equipment</h3>

            ${quotation.acPrices
                .map(item => `

                    <div class="preview-item">

                        <strong>
                            ${item.capacity.toLocaleString()}
                            BTU/hr
                        </strong>

                        <p>
                            Qty:
                            ${item.quantity}
                        </p>

                        <p>
                            Unit:
                            ${money(item.unitPrice)}
                        </p>

                        <p>
                            Total:
                            <strong>
                                ${money(item.total)}
                            </strong>
                        </p>

                    </div>

                `)
                .join("")}

            <div class="info-box">
                Equipment Total:
                <strong>
                    ${money(equipment)}
                </strong>
            </div>

        </div>


        <div class="card">

            <h3>Copper</h3>

            <p>
                Total Length:
                ${number(
                    quotation.rooms.reduce(
                        (sum, room) =>
                            sum +
                            Number(
                                room.copper || 0
                            ),
                        0
                    )
                )} m
            </p>

            <strong>
                ${money(copper)}
            </strong>

        </div>


        <div class="card">

            <h3>Drainage</h3>

            <p>
                Total:
                <strong>
                    ${money(drainage)}
                </strong>
            </p>

        </div>


        ${
            quotation.additionalItems.length
                ? `

                    <div class="card">

                        <h3>
                            Additional Works
                        </h3>

                        ${quotation.additionalItems
                            .map(item => `

                                <div class="preview-item">

                                    <strong>
                                        ${escapeHTML(
                                            item.name
                                        )}
                                    </strong>

                                    <p>
                                        ${number(
                                            item.quantity
                                        )}
                                        ${escapeHTML(
                                            item.unit
                                        )}
                                    </p>

                                    <strong>
                                        ${money(
                                            item.total
                                        )}
                                    </strong>

                                </div>

                            `)
                            .join("")}

                    </div>
                `
                : ""
        }


        <div class="info-box">

            <strong>
                TOTAL HVAC WORKS
            </strong>

            <br>

            ${money(total)}

        </div>
    `;
}


function goToClientDetails() {

    renderQuotationPreview();

    showPage(13);
}


/* =========================================================
   STEP 13
   CLIENT DETAILS
   ========================================================= */

function getClientDetails() {

    quotation.clientName =
        document.getElementById(
            "clientName"
        )?.value.trim() || "";

    quotation.installationLocation =
        document.getElementById(
            "installationLocation"
        )?.value.trim() || "";

    quotation.salesPerson =
        document.getElementById(
            "salesPerson"
        )?.value.trim() || "";

    quotation.salesPhone =
        document.getElementById(
            "salesPhone"
        )?.value.trim() || "";

    quotation.salesEmail =
        document.getElementById(
            "salesEmail"
        )?.value.trim() || "";
}


/* =========================================================
   IMAGE → DATA URL
   ========================================================= */

function imageToDataURL(url) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();

            img.onload = function() {

                try {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        img.naturalWidth;

                    canvas.height =
                        img.naturalHeight;

                    const ctx =
                        canvas.getContext(
                            "2d"
                        );

                    ctx.drawImage(
                        img,
                        0,
                        0
                    );

                    resolve(
                        canvas.toDataURL(
                            "image/jpeg",
                            0.95
                        )
                    );

                } catch (error) {

                    reject(error);
                }
            };

            img.onerror =
                function() {

                    reject(
                        new Error(
                            "Unable to load " +
                            url
                        )
                    );
                };

            img.src = url;
        }
    );
}


/* =========================================================
   PDF HEADER
   ========================================================= */

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
   PDF FOOTER
   ========================================================= */

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


/* =========================================================
   GENERATE QUOTATION
   ========================================================= */

async function generateQuotation() {

    getClientDetails();

    if (!quotation.clientName) {

        alert(
            "Please enter the client name."
        );

        return;
    }

    if (
        !quotation.installationLocation
    ) {

        alert(
            "Please enter the installation location."
        );

        return;
    }

    if (!jsPDFConstructor) {

        alert(
            "PDF library could not be loaded. Please check your internet connection and reload the page."
        );

        return;
    }

    let headerData = null;
    let footerData = null;

    try {

        headerData =
            await imageToDataURL(
                "Header.jpeg"
            );

    } catch (error) {

        console.warn(
            "Header.jpeg could not be loaded.",
            error
        );
    }

    try {

        footerData =
            await imageToDataURL(
                "footer.jpeg"
            );

    } catch (error) {

        console.warn(
            "footer.jpeg could not be loaded.",
            error
        );
    }

    try {

        createPDF(
            headerData,
            footerData
        );

    } catch (error) {

        console.error(
            "PDF generation error:",
            error
        );

        alert(
            "The quotation could not be generated. Please check the browser console for details."
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
        new jsPDFConstructor({
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

    addHeaderImage(
        doc,
        headerData
    );

    let y =
        headerHeight + 5;


    /* =====================================================
       TITLE
    ===================================================== */

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


    /* =====================================================
       CLIENT DETAILS
    ===================================================== */

    doc.setFontSize(9);

    doc.setTextColor(
        30,
        41,
        59
    );

    const clientRows = [

        [
            "CLIENT:",
            quotation.clientName
        ],

        [
            "LOCATION:",
            quotation.installationLocation
        ],

        [
            "SALES PERSON:",
            quotation.salesPerson
        ],

        [
            "PHONE:",
            quotation.salesPhone
        ],

        [
            "EMAIL:",
            quotation.salesEmail
        ]
    ];

    clientRows.forEach(
        row => {

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                row[0],
                margin,
                y
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.text(
                row[1] || "",
                margin + 32,
                y
            );

            y += 5;
        }
    );

    y += 5;


    /* =====================================================
       EQUIPMENT
    ===================================================== */

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

    if (
        typeof doc.autoTable ===
        "function"
    ) {

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
                fillColor: [
                    7,
                    89,
                    133
                ],

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
    }


    /* =====================================================
       COPPER
    ===================================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.text(
        "2. COPPER AND ACCESSORIES",
        margin,
        y
    );

    y += 3;

    const totalCopperLength =
        quotation.rooms.reduce(
            (sum, room) =>
                sum +
                Number(
                    room.copper || 0
                ),
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

                `${number(
                    totalCopperLength
                )} m`,

                money(
                    quotation.copperRate
                ),

                money(
                    getCopperTotal()
                )
            ]

        ],

        theme: "grid",

        headStyles: {
            fillColor: [
                7,
                89,
                133
            ],

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


    /* =====================================================
       DRAINAGE
    ===================================================== */

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

    doc.text(
        "3. DRAINAGE AND ACCESSORIES",
        margin,
        y
    );

    y += 3;

    const totalDrainageLength =
        quotation.rooms.reduce(
            (sum, room) =>
                sum +
                Number(
                    room.drainage || 0
                ),
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

                `${number(
                    totalDrainageLength
                )} m`,

                money(
                    quotation.drainageRate
                ),

                money(
                    getDrainageTotal()
                )
            ]

        ],

        theme: "grid",

        headStyles: {
            fillColor: [
                7,
                89,
                133
            ],

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


    /* =====================================================
       ADDITIONAL WORKS
    ===================================================== */

    if (
        quotation.additionalItems.length >
        0
    ) {

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(11);

        doc.text(
            "4. ADDITIONAL WORKS",
            margin,
            y
        );

        y += 3;

        const additionalRows =
            quotation.additionalItems.map(
                item => [

                    item.name,

                    `${number(
                        item.quantity
                    )} ${item.unit}`,

                    money(
                        item.unitPrice
                    ),

                    money(
                        item.total
                    )
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

            body:
                additionalRows,

            theme: "grid",

            headStyles: {
                fillColor: [
                    7,
                    89,
                    133
                ],

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


    /* =====================================================
       HVAC TOTAL
    ===================================================== */

    const hvacWorks =
        getHVACTotal();

    if (
        y >
        pageHeight -
        footerHeight -
        45
    ) {

        doc.addPage();

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
        pageWidth -
            margin * 2,
        15,
        2,
        2,
        "F"
    );

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
        "TOTAL HVAC WORKS",
        margin + 4,
        y + 9
    );

    doc.text(
        money(hvacWorks),
        pageWidth -
            margin -
            4,
        y + 9,
        {
            align: "right"
        }
    );

    y += 24;


    /* =====================================================
       SUMMARY
    ===================================================== */

    if (
        y >
        pageHeight -
        footerHeight -
        60
    ) {

        doc.addPage();

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
                money(
                    preliminaries
                ),
                money(
                    preliminaries
                )
            ],

            [
                "As Built Drawing",
                "1 lot",
                money(
                    asBuiltDrawing
                ),
                money(
                    asBuiltDrawing
                )
            ],

            [
                "Total HVAC Works",
                "1 lot",
                money(
                    hvacWorks
                ),
                money(
                    hvacWorks
                )
            ]

        ],

        theme: "grid",

        headStyles: {
            fillColor: [
                7,
                89,
                133
            ],

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


    /* =====================================================
       VAT
    ===================================================== */

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
        pageWidth -
            margin,
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
        pageWidth -
            margin,
        y,
        {
            align: "right"
        }
    );

    y += 9;


    /* =====================================================
       GRAND TOTAL
    ===================================================== */

    doc.setFillColor(
        7,
        89,
        133
    );

    doc.roundedRect(
        margin,
        y - 5,
        pageWidth -
            margin * 2,
        17,
        2,
        2,
        "F"
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.setFontSize(11);

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
        pageWidth -
            margin -
            4,
        y + 5,
        {
            align: "right"
        }
    );

    y += 23;


    /* =====================================================
       TERMS AND CONDITIONS
    ===================================================== */

    if (
        y >
        pageHeight -
        footerHeight -
        60
    ) {

        doc.addPage();

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
            "Three phase (400 V) power to be provided at the outdoor (within 5 m of each unit) and single phase (210 V) power to each indoor unit (within 1 m of each unit) with necessary accessories."
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

            textColor: [
                40,
                40,
                40
            ],

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

            bottom:
                footerHeight
        }
    });


    /* =====================================================
       FOOTERS
    ===================================================== */

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


    /* =====================================================
       SAVE PDF
    ===================================================== */

    const safeClientName =
        quotation.clientName
            .replace(
                /[^a-z0-9]/gi,
                "_"
            );

    const filename =
        `HVAC_Quotation_${
            safeClientName ||
            "Client"
        }.pdf`;

    doc.save(filename);


    /* =====================================================
       SUCCESS PAGE
    ===================================================== */

    showPage(14);
}


/* =========================================================
   START NEW QUOTATION
   ========================================================= */

function startNewQuotation() {

    quotation = {

        rooms: [],

        copperRate: 3200,

        drainageRate: 0,

        additionalItems: [],

        acPrices: [],

        clientName: "",

        installationLocation: "",

        salesPerson: "",

        salesPhone: "",

        salesEmail: ""
    };


    const roomContainer =
        document.getElementById(
            "roomInputContainer"
        );

    if (roomContainer) {

        roomContainer.innerHTML = `

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
    }


    [
        "clientName",
        "installationLocation",
        "salesPerson",
        "salesPhone",
        "salesEmail"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }
    });


    showPage(1);
}


/* =========================================================
   YEAR
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const year =
            document.getElementById(
                "currentYear"
            );

        if (year) {

            year.textContent =
                new Date()
                    .getFullYear();
        }

        showPage(1);
    }
);
