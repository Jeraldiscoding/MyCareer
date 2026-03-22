// src/ui-controls.js

const paycheckModal = document.getElementById("paycheck-modal");
const paycheckBase = document.getElementById("paycheck-base");
const paycheckBonus = document.getElementById("paycheck-bonus");
const paycheckTotal = document.getElementById("paycheck-total");
const closePaycheckBtn = document.getElementById("close-paycheck-btn");

const lobbyModal = document.getElementById("lobby-modal");
const lobbyTitle = document.getElementById("lobby-title");
const lobbyInfoContent = document.getElementById("lobby-info-content");

const job1Title = document.getElementById("job1-title");
const job1Desc = document.getElementById("job1-desc");
const lobbyPrimaryBtn = document.getElementById("lobby-primary-btn");

const job2Title = document.getElementById("job2-title");
const job2Desc = document.getElementById("job2-desc");
const lobbySecondaryBtn = document.getElementById("lobby-secondary-btn");

const interactionPrompt = document.getElementById("interaction-prompt");
const restPrompt = document.getElementById("rest-prompt");
const uiLayer = document.getElementById("ui-layer");

let activePaycheckHandler = null;
let activeLobbyPrimaryHandler = null;
let activeLobbySecondaryHandler = null;

if (closePaycheckBtn) {
    closePaycheckBtn.onclick = (e) => {
        console.log("[UI] closePaycheckBtn clicked!");
        if (activePaycheckHandler) {
            let handler = activePaycheckHandler;
            activePaycheckHandler = null;
            handler();
        } else if (paycheckModal) {
            paycheckModal.classList.add("hidden");
        }
    };
}

if (lobbyPrimaryBtn) {
    lobbyPrimaryBtn.onclick = (e) => {
        console.log("[UI] lobbyPrimaryBtn clicked!");
        if (activeLobbyPrimaryHandler) {
            let handler = activeLobbyPrimaryHandler;
            activeLobbyPrimaryHandler = null;
            handler();
        }
    };
}

if (lobbySecondaryBtn) {
    lobbySecondaryBtn.onclick = (e) => {
        console.log("[UI] lobbySecondaryBtn clicked!");
        if (activeLobbySecondaryHandler) {
            let handler = activeLobbySecondaryHandler;
            activeLobbySecondaryHandler = null;
            handler();
        }
    };
}

function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    const container = document.getElementById("notifications");
    if (!container) return;
    container.appendChild(notification);

    // Automatically remove after animation
    setTimeout(() => {
        if (notification.parentNode === container) {
            notification.remove();
        }
    }, 3000);
}

const dashboard = document.getElementById("dashboard");
const minigameHud = document.getElementById("minigame-hud");
const minigameTitle = document.getElementById("minigame-title");
const minigameInstruction = document.getElementById("minigame-instruction");
const minigameScore = document.getElementById("minigame-score");

export function showMinigameHUD(title, instructionText) {
    // Hide standard overworld dashboard
    dashboard.style.display = "none";
    
    minigameTitle.innerText = title;
    minigameInstruction.innerHTML = instructionText;
    minigameScore.innerText = "Score: 0";
    
    minigameHud.classList.remove("hidden");
}

export function updateMinigameScore(scoreText) {
    minigameScore.innerText = scoreText;
}

export function hideMinigameHUD() {
    minigameHud.classList.add("hidden");
    dashboard.style.display = "flex";
}

function showInteractionPrompt(message) {
    if (!interactionPrompt) return;
    interactionPrompt.textContent = message;
    interactionPrompt.classList.remove("hidden");
}

function hideInteractionPrompt() {
    if (!interactionPrompt) return;
    interactionPrompt.classList.add("hidden");
}

function showRestPrompt(message) {
    if (!restPrompt) return;
    restPrompt.textContent = message;
    restPrompt.classList.remove("hidden");
}

function hideRestPrompt() {
    if (!restPrompt) return;
    restPrompt.classList.add("hidden");
}

function showLobbyModal({ title, infoHTML, job1, job2, onPrimary, onSecondary }) {
    if (!lobbyModal) return;
    lobbyTitle.textContent = title;
    
    if (infoHTML) {
        lobbyInfoContent.innerHTML = infoHTML;
        lobbyInfoContent.style.display = "block";
    } else {
        lobbyInfoContent.style.display = "none";
        lobbyInfoContent.innerHTML = "";
    }

    // Populate Job 1 Card
    if (job1) {
        job1Title.textContent = job1.title || "Job 1";
        job1Desc.innerHTML = job1.descHTML || "";
        lobbyPrimaryBtn.textContent = job1.btnText || "START SHIFT";
    }

    // Populate Job 2 Card
    if (job2) {
        job2Title.textContent = job2.title || "Job 2";
        job2Desc.innerHTML = job2.descHTML || "";
        lobbySecondaryBtn.textContent = job2.btnText || "START SHIFT";
    }

    activeLobbyPrimaryHandler = () => {
        hideLobbyModal();
        if (onPrimary) onPrimary();
    };
    activeLobbySecondaryHandler = () => {
        hideLobbyModal();
        if (onSecondary) onSecondary();
    };
    lobbyModal.classList.remove("hidden");
}

function hideLobbyModal() {
    if (!lobbyModal) return;
    lobbyModal.classList.add("hidden");
}

function showPaycheckModal({ basePay, bonus, total, onContinue }) {
    if (!paycheckModal) return;
    paycheckBase.textContent = `$${basePay}`;
    paycheckBonus.textContent = `$${bonus}`;
    paycheckTotal.textContent = `$${total}`;
    activePaycheckHandler = () => {
        paycheckModal.classList.add("hidden");
        if (onContinue) onContinue();
        activePaycheckHandler = null;
    };
    paycheckModal.classList.remove("hidden");
}

export {
    showNotification,
    showInteractionPrompt,
    hideInteractionPrompt,
    showRestPrompt,
    hideRestPrompt,
    showLobbyModal,
    hideLobbyModal,
    showPaycheckModal,
};
