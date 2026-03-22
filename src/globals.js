// src/globals.js

let wealth = 0;
let energy = 100;

// Constants
const ENERGY_MAX = 100;
const WEALTH_INCREMENT = 100;

function syncWealthUI() {
    const wealthEl = document.getElementById("wealth");
    if (wealthEl) {
        wealthEl.textContent = wealth;
    }
}

function syncEnergyUI() {
    const energyEl = document.getElementById("energy");
    if (energyEl) {
        energyEl.textContent = energy;
    }
}

function updateWealth(amount) {
    wealth += amount;
    syncWealthUI();
}

function updateEnergy(amount) {
    energy = Math.min(ENERGY_MAX, Math.max(0, energy + amount));
    syncEnergyUI();
}

function setWealth(value) {
    wealth = value;
    syncWealthUI();
}

function setEnergy(value) {
    energy = Math.min(ENERGY_MAX, Math.max(0, value));
    syncEnergyUI();
}

function getWealth() {
    return wealth;
}

function getEnergy() {
    return energy;
}

syncWealthUI();
syncEnergyUI();

export {
    wealth,
    energy,
    updateWealth,
    updateEnergy,
    setWealth,
    setEnergy,
    getWealth,
    getEnergy,
    ENERGY_MAX,
    WEALTH_INCREMENT,
};
