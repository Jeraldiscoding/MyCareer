import { showLobby, showEnergyCostNotice, finishWithPaycheck } from "./industry-utils.js";
import { showMinigameHUD, hideMinigameHUD, updateMinigameScore } from "../ui-controls.js";

window.scene("technology_lobby", () => {
    showLobby({
        title: "Technology Lobby",
        infoHTML: `
            <h3>About the Tech Industry</h3>
            <p>The tech industry builds the software, networking, and data infrastructure of the modern world.</p>
        `,
        job1: {
            title: "Software Engineer",
            descHTML: `
                <strong>Task:</strong> Logic Gate Debugging<br><br>
                Fix broken code logic. Given inputs and expected outputs, choose the correct logical operator (AND / OR) to make the code compile.<br><br>
                <strong>Pros:</strong> Creative problem solving, high pay.<br>
                <strong>Cons:</strong> Extreme frustration from bugs.
            `,
            btnText: "Start Coding ($350)",
        },
        job2: {
            title: "Data Analyst",
            descHTML: `
                <strong>Task:</strong> Server Database Scrubbing<br><br>
                Navigate a live server grid and delete corrupted database nodes (RED) while preserving the clean data (BLUE).<br><br>
                <strong>Pros:</strong> High market demand.<br>
                <strong>Cons:</strong> Staring at grids all day.
            `,
            btnText: "Scrub Data ($300)",
        },
        onPrimary: () => window.go("technology_swe"),
        onSecondary: () => window.go("technology_data"),
    });
    showEnergyCostNotice();
});

// JOB 1: Software Engineer (Logic Gates)
window.scene("technology_swe", () => {
    showMinigameHUD("Software Engineeer", "Fix the code! Select missing gate: LEFT for AND, RIGHT for OR.");
    
    // Matrix style background
    window.add([window.rect(window.width(), window.height()), window.color(10, 20, 30)]); // Very dark blue/black
    window.add([{
        draw() {
            // Draw flowing code bars
            for (let i = 0; i < 30; i++) {
                const streamY = (window.time() * 200 + i * 80) % window.height();
                window.drawText({ text: "0101", pos: window.vec2(i * 40, streamY), size: 16, color: window.rgb(30, 80, 50), font: "monospace" });
                window.drawText({ text: "1010", pos: window.vec2(i * 40, streamY - 40), size: 16, color: window.rgb(30, 80, 50), font: "monospace" });
            }
        }
    }]);

    let score = 0;
    let round = 1;
    const maxRounds = 5;

    updateMinigameScore(`Issues Fixed: ${score}/${maxRounds}`);

    // Visual setup - draw terminal window
    window.add([window.rect(900, 450, { radius: 10 }), window.pos(window.width()/2, window.height()/2), window.anchor("center"), window.color(20, 25, 40), window.outline(4, window.rgb(55, 140, 200))]);
    window.add([window.rect(900, 30, { radius: 10 }), window.pos(window.width()/2, window.height()/2 - 210), window.anchor("center"), window.color(55, 140, 200)]); // Terminal header

    const inputA = window.add([window.text("Input A: ?", { size: 40, font: "monospace" }), window.pos(window.width()/2 - 250, window.height()/2 - 80), window.anchor("center")]);
    const inputB = window.add([window.text("Input B: ?", { size: 40, font: "monospace" }), window.pos(window.width()/2 - 250, window.height()/2 + 80), window.anchor("center")]);
    
    // Wire connections
    window.add([window.rect(100, 4), window.pos(window.width()/2 - 120, window.height()/2 - 80), window.anchor("center"), window.color(100, 100, 100)]);
    window.add([window.rect(100, 4), window.pos(window.width()/2 - 120, window.height()/2 + 80), window.anchor("center"), window.color(100, 100, 100)]);
    window.add([window.rect(4, 164), window.pos(window.width()/2 - 70, window.height()/2), window.anchor("center"), window.color(100, 100, 100)]);
    window.add([window.rect(100, 4), window.pos(window.width()/2 - 20, window.height()/2), window.anchor("center"), window.color(100, 100, 100)]);
    window.add([window.rect(100, 4), window.pos(window.width()/2 + 100, window.height()/2), window.anchor("center"), window.color(100, 100, 100)]);

    // Gate box
    window.add([window.rect(140, 100, { radius: 10 }), window.pos(window.width()/2, window.height()/2), window.anchor("center"), window.color(60, 60, 70), window.outline(4, window.rgb(255,255,100))]);
    const gateLabel = window.add([window.text("[ ? ]", { size: 48, font: "monospace" }), window.pos(window.width()/2, window.height()/2), window.anchor("center"), window.color(255, 255, 100)]);
    
    // Push instructions lower so they don't overlap HUD or game elements
    window.add([window.rect(300, 50, { radius: 8 }), window.pos(window.width()/2 - 150, window.height()/2 + 150), window.anchor("center"), window.color(40, 50, 80)]);
    window.add([window.text("LEFT: AND", { size: 28, font: "monospace" }), window.pos(window.width()/2 - 150, window.height()/2 + 150), window.anchor("center"), window.color(255, 255, 255)]);
    
    window.add([window.rect(300, 50, { radius: 8 }), window.pos(window.width()/2 + 150, window.height()/2 + 150), window.anchor("center"), window.color(40, 50, 80)]);
    window.add([window.text("RIGHT: OR", { size: 28, font: "monospace" }), window.pos(window.width()/2 + 150, window.height()/2 + 150), window.anchor("center"), window.color(255, 255, 255)]);

    const output = window.add([window.text("Expected: ?", { size: 40, font: "monospace" }), window.pos(window.width()/2 + 250, window.height()/2), window.anchor("center")]);

    let currentA, currentB, requiredGate, expectedOut;

    const generateLogic = () => {
        gateLabel.text = "[ ? ]";
        currentA = window.choose([true, false]);
        currentB = window.choose([true, false]);
        
        requiredGate = window.choose(["AND", "OR"]);
        
        if (requiredGate === "AND") {
            expectedOut = currentA && currentB;
            // Ensure there's actually a decision to be made, if both true, OR also works, so force a scenario
            if (currentA && currentB) requiredGate = window.choose(["AND", "OR"]); 
        } else {
            expectedOut = currentA || currentB;
        }

        inputA.text = `A: ${currentA ? 'TRUE' : 'FALSE'}`;
        inputA.color = currentA ? window.rgb(46, 204, 113) : window.rgb(255, 60, 80);
        
        inputB.text = `B: ${currentB ? 'TRUE' : 'FALSE'}`;
        inputB.color = currentB ? window.rgb(46, 204, 113) : window.rgb(255, 60, 80);

        output.text = `EXPECTS: ${expectedOut ? 'TRUE' : 'FALSE'}`;
        output.color = expectedOut ? window.rgb(46, 204, 113) : window.rgb(255, 60, 80);
    };

    generateLogic();

    const handleChoice = (chosenGate) => {
        gateLabel.text = chosenGate;
        
        let actualOut = false;
        if (chosenGate === "AND") actualOut = currentA && currentB;
        if (chosenGate === "OR") actualOut = currentA || currentB;

        if (actualOut === expectedOut) {
            score++;
            window.add([window.text("CODE COMPILED!", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(46, 204, 113), window.lifespan(0.5, { fade: 0.5 })]);
        } else {
            window.add([window.text("COMPILER ERROR", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(255, 60, 80), window.lifespan(0.5, { fade: 0.5 })]);
        }

        round++;
        updateMinigameScore(`Issues Fixed: ${score}/${maxRounds}`);

        if (round > maxRounds) {
            window.wait(0.5, () => {
                hideMinigameHUD();
                finishWithPaycheck({ 
                    basePay: 350, 
                    bonus: score * 60, 
                    onContinue: () => window.go("overworld") 
                });
            });
        } else {
            window.wait(0.5, generateLogic);
        }
    };

    window.onKeyPress("left", () => handleChoice("AND"));
    window.onKeyPress("right", () => handleChoice("OR"));
});

// JOB 2: Data Analyst (Data Scrubbing)
window.scene("technology_data", () => {
    showMinigameHUD("Data Scrubbing", "Press SPACE to delete corrupted (RED) data nodes. Press ENTER when finished.");
    
    window.add([window.rect(window.width(), window.height()), window.color(10, 20, 30)]); // Server room dark
    window.add([{
        draw() {
            // Draw rack lines
            for (let x = 100; x < window.width(); x += 150) {
                window.drawRect({ width: 20, height: window.height(), pos: window.vec2(x, 0), color: window.rgb(30, 40, 50) });
            }
        }
    }]);

    let score = 0;
    updateMinigameScore(`Data Saved: ${score}`);
    
    // Draw a server rack background board
    window.add([window.rect(800, 420, { radius: 10 }), window.pos(window.width()/2, window.height()/2), window.anchor("center"), window.color(40, 45, 60), window.outline(6, window.rgb(100,110,130))]);

    // Draw a grid of nodes
    const cols = 5;
    const rows = 3;
    const nodes = [];
    const startX = window.width()/2 - 300;
    const startY = window.height()/2 - 100; // Shift downward uniformly
    
    let selectedCol = 0;
    let selectedRow = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const isCorrupt = window.randi(0, 100) > 60; // 40% chance to be red
            const node = window.add([
                window.rect(80, 80, { radius: 10 }), // Make nodes larger/clearer
                window.pos(startX + c * 150, startY + r * 100),
                window.anchor("center"),
                window.color(isCorrupt ? window.rgb(255, 60, 80) : window.rgb(200, 240, 255)), // High contrast nodes
                { corrupt: isCorrupt, deleted: false }
            ]);
            nodes.push({ c, r, node });
        }
    }

    const cursor = window.add([
        window.rect(100, 100, { radius: 12 }),
        window.pos(startX, startY),
        window.anchor("center"),
        window.color(255, 255, 255),
        window.opacity(0),
        window.outline(4, window.rgb(255, 255, 255))
    ]);

    const updateCursor = () => {
        cursor.pos.x = startX + selectedCol * 150;
        cursor.pos.y = startY + selectedRow * 100;
    };

    window.onKeyPress("left", () => { selectedCol = (selectedCol - 1 + cols) % cols; updateCursor(); });
    window.onKeyPress("right", () => { selectedCol = (selectedCol + 1) % cols; updateCursor(); });
    window.onKeyPress("up", () => { selectedRow = (selectedRow - 1 + rows) % rows; updateCursor(); });
    window.onKeyPress("down", () => { selectedRow = (selectedRow + 1) % rows; updateCursor(); });

    let remainingCorrupt = nodes.filter(n => n.node.corrupt).length;
    
    window.onKeyPress("space", () => {
        const target = nodes.find(n => n.c === selectedCol && n.r === selectedRow);
        if (!target || target.node.deleted) return;

        if (target.node.corrupt) {
            score++;
            updateMinigameScore(`Data Saved: ${score}`);
            remainingCorrupt--;
            target.node.deleted = true;
            target.node.color = window.rgb(40, 45, 60); // "Deleted" color
            window.add([window.text("DELETED", { size: 20 }), window.pos(target.node.pos), window.anchor("center"), window.color(46, 204, 113), window.lifespan(0.3, { fade: 0.3 }), window.move(window.UP, 50)]);
            
            if (remainingCorrupt <= 0) {
                window.wait(0.5, () => {
                    hideMinigameHUD();
                    finishWithPaycheck({ 
                        basePay: 350, 
                        bonus: score * 20, 
                        onContinue: () => window.go("overworld") 
                    });
                });
            }
        } else {
            // Accidentally deleted good data!
            score = Math.max(0, score - 2);
            updateMinigameScore(`Data Saved: ${score}`);
            window.add([window.text("GOOD DATA LOST!", { size: 24 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(255, 60, 80), window.lifespan(0.5, { fade: 0.5 })]);
        }
    });

    window.onKeyPress("enter", () => {
        // "Submit Database" early
        hideMinigameHUD();
        finishWithPaycheck({ 
            basePay: 300, 
            bonus: score * 20, 
            onContinue: () => window.go("overworld") 
        });
    });
}); // Removed the old static kaboom text here

export {};
