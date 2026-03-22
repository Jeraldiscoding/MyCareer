import { showLobby, showEnergyCostNotice, finishWithPaycheck } from "./industry-utils.js";
import { showMinigameHUD, hideMinigameHUD, updateMinigameScore } from "../ui-controls.js";

window.scene("engineering_lobby", () => {
    showLobby({
        title: "Engineering Lobby",
        infoHTML: `
            <h3>About the Engineering Industry</h3>
            <p>Engineering involves applying scientific and mathematical principles to design and build structures, machines, and systems.</p>
        `,
        job1: {
            title: "Civil Engineer",
            descHTML: `
                <strong>Task:</strong> Bridge Load Balancing<br><br>
                A moving load appears on a bridge. You must calculate the drop point and perfectly place structural pillars beneath it before it collapses.<br><br>
                <strong>Pros:</strong> Tangible real-world impact.<br>
                <strong>Cons:</strong> Heavy liability if structures crack.
            `,
            btnText: "Build Bridge ($350)",
        },
        job2: {
            title: "Mechanical Engineer",
            descHTML: `
                <strong>Task:</strong> Circuit/Gear Pathing<br><br>
                Rotate mechanical components dynamically on a grid array to ensure unbroken power flows from the generator to the output source.<br><br>
                <strong>Pros:</strong> Puzzle-solving satisfaction.<br>
                <strong>Cons:</strong> Strict safety bureaucracy.
            `,
            btnText: "Align Gears ($350)",
        },
        onPrimary: () => window.go("engineering_civil"),
        onSecondary: () => window.go("engineering_mech"),
    });
    showEnergyCostNotice();
});

// JOB 1: Civil Engineer (Load Balancing)
window.scene("engineering_civil", () => {
    // Basic setup - bright industrial background
    window.add([window.rect(window.width(), window.height()), window.color(240, 180, 50)]); // Bright industrial yellow/orange
    window.add([{
        draw() {
            // Draw caution stripes on edges
            for (let i = -100; i < window.width(); i += 40) {
                window.drawPolygon({
                    pts: [
                        window.vec2(i, 0), window.vec2(i + 20, 0), 
                        window.vec2(i + 120, 100), window.vec2(i + 100, 100)
                    ],
                    color: window.rgb(0, 0, 0)
                });
                
                window.drawPolygon({
                    pts: [
                        window.vec2(i, window.height()), window.vec2(i + 20, window.height()), 
                        window.vec2(i + 120, window.height() - 100), window.vec2(i + 100, window.height() - 100)
                    ],
                    color: window.rgb(0, 0, 0)
                });
            }
        }
    }]);

    showMinigameHUD("Civil Engineer", "Load Balancing: Place structural support exactly under the red load.\nUse LEFT/RIGHT to position. SPACE to place support.");

    let score = 0;
    let round = 1;
    const maxRounds = 5;

    updateMinigameScore(`Stabilized: ${score}/${maxRounds}`);

    // Draw the bridge background structure
    const bridgeY = window.height() / 2 - 50;
    
    // Scaffolding lines
    window.add([{
        draw() {
            for(let x = window.width()/2 - 400; x <= window.width()/2 + 400; x += 100) {
                window.drawLine({ p1: window.vec2(x, bridgeY), p2: window.vec2(x - 50, bridgeY + 300), width: 4, color: window.rgb(180, 100, 20) });
                window.drawLine({ p1: window.vec2(x, bridgeY), p2: window.vec2(x + 50, bridgeY + 300), width: 4, color: window.rgb(180, 100, 20) });
            }
        },
        z: -1
    }]);

    window.add([window.rect(800, 20), window.pos(window.width()/2, bridgeY), window.anchor("center"), window.color(100, 100, 110)]);
    
    // The Load
    let loadX = 0;
    const loadMarker = window.add([
        window.rect(60, 60, { radius: 8 }),
        window.pos(0, bridgeY - 40),
        window.anchor("center"),
        window.color(255, 60, 80)
    ]);
    window.add([window.text("LOAD", { size: 16, font: "monospace" }), window.pos(0, bridgeY - 40), window.anchor("center"), window.color(255,255,255), { update() { this.pos.x = loadMarker.pos.x; } }]);

    // The support cursor
    const supportY = bridgeY + 80;
    const cursor = window.add([
        window.rect(20, 140, { radius: 4 }),
        window.pos(window.width()/2, supportY),
        window.anchor("center"),
        window.color(60, 150, 255),
        window.outline(2, window.rgb(255,255,255))
    ]);

    let supportPlaced = false;

    const nextRound = () => {
        if (round > maxRounds) {
            window.wait(0.5, () => {
                hideMinigameHUD();
                finishWithPaycheck({ 
                    basePay: 350, 
                    bonus: score * 50, 
                    onContinue: () => window.go("overworld") 
                });
            });
            return;
        }

        supportPlaced = false;
        // Randomize load position
        loadX = window.width()/2 + window.randi(-350, 350);
        loadMarker.pos.x = loadX;
    };

    nextRound();

    const speed = 400;
    window.onKeyDown("left", () => {
        if (!supportPlaced) cursor.pos.x = Math.max(window.width()/2 - 400, cursor.pos.x - speed * window.dt());
    });
    window.onKeyDown("right", () => {
        if (!supportPlaced) cursor.pos.x = Math.min(window.width()/2 + 400, cursor.pos.x + speed * window.dt());
    });

    window.onKeyPress("space", () => {
        if (supportPlaced) return;
        supportPlaced = true;

        const distance = Math.abs(cursor.pos.x - loadX);
        
        if (distance < 20) {
            score++;
            window.add([window.text("PERFECT SUPPORT!", { size: 40, font: "monospace" }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(46, 204, 113), window.lifespan(1, { fade: 0.5 })]);
            cursor.color = window.rgb(46, 204, 113);
        } else if (distance < 50) {
            score += 0.5;
            window.add([window.text("ADEQUATE STABILITY", { size: 40, font: "monospace" }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(220, 100, 20), window.lifespan(1, { fade: 0.5 })]);
            cursor.color = window.rgb(255, 200, 100);
        } else {
            window.add([window.text("STRUCTURAL FAILURE!", { size: 40, font: "monospace" }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(255, 60, 80), window.lifespan(1, { fade: 0.5 })]);
            cursor.color = window.rgb(255, 60, 80);
        }

        round++;
        updateMinigameScore(`Stabilized: ${Math.floor(score)}/${maxRounds}`);
        window.wait(1.5, () => {
            cursor.color = window.rgb(60, 150, 255);
            nextRound();
        });
    });
});

// JOB 2: Mechanical Engineer (Circuit/Gear Alignment)
window.scene("engineering_mech", () => {
    // Basic setup - bright industrial background
    window.add([window.rect(window.width(), window.height()), window.color(240, 180, 50)]); // Bright industrial yellow/orange
    window.add([{
        draw() {
            // Draw drafting paper grid
            for (let x = 0; x < window.width(); x += 40) {
                window.drawLine({ p1: window.vec2(x, 0), p2: window.vec2(x, window.height()), width: 1, color: window.rgb(200, 140, 20) });
            }
            for (let y = 0; y < window.height(); y += 40) {
                window.drawLine({ p1: window.vec2(0, y), p2: window.vec2(window.width(), y), width: 1, color: window.rgb(200, 140, 20) });
            }
        }
    }]);

    showMinigameHUD("Mechanical Engineer", "Restore the circuit! LEFT/RIGHT to select a node. SPACE to rotate exactly horizontally. ENTER to sumbit.");

    let score = 0;
    updateMinigameScore(`Circuit Status: Incomplete`);
    
    const cols = 5;
    const rows = 1; // 1D array for simplicity in this mini-game
    const tiles = [];
    
    // Grid settings
    const startX = window.width()/2 - 300;
    const startY = window.height()/2;
    const tileSize = 100;

    let selectedIdx = 0;

    // We have two piece types: 
    // 0 = Horizontal line (--) Correct alignment is rotation 0 or 180
    // 1 = Vertical line (|) Incorrect alignment. Needs 90 deg rotation.
    for (let c = 0; c < cols; c++) {
        const isCorrect = window.randi(0, 100) > 50;
        const initRot = isCorrect ? 0 : 90;

        const tileNode = window.add([
            window.rect(tileSize - 10, tileSize - 10, { radius: 5 }),
            window.pos(startX + c * 120, startY),
            window.anchor("center"),
            window.color(40, 45, 60)
        ]);

        const line = window.add([
            window.rect(tileSize - 20, 10),
            window.pos(startX + c * 120, startY),
            window.anchor("center"),
            window.color(150, 150, 150),
            window.rotate(initRot)
        ]);

        tiles.push({ node: tileNode, line: line, rot: initRot });
    }

    const cursor = window.add([
        window.rect(tileSize + 10, tileSize + 10, { radius: 5 }),
        window.pos(startX, startY),
        window.anchor("center"),
        window.color(255, 255, 255),
        window.opacity(0),
        window.outline(4, window.rgb(255, 255, 255))
    ]);

    const updateCursor = () => {
        cursor.pos.x = startX + selectedIdx * 120;
    };

    window.onKeyPress("left", () => { selectedIdx = (selectedIdx - 1 + cols) % cols; updateCursor(); });
    window.onKeyPress("right", () => { selectedIdx = (selectedIdx + 1) % cols; updateCursor(); });
    
    window.onKeyPress("space", () => {
        const t = tiles[selectedIdx];
        t.rot = (t.rot + 90) % 180; // only 0 or 90
        t.line.angle = t.rot;
    });

    let finished = false;

    window.onKeyPress("enter", () => {
        if (finished) return;
        finished = true;
        
        let allCorrect = true;
        tiles.forEach(t => {
            if (t.rot !== 0) {
                allCorrect = false;
                t.line.color = window.rgb(255, 60, 80);
            } else {
                t.line.color = window.rgb(46, 204, 113);
            }
        });

        if (allCorrect) {
            score = 1;
            updateMinigameScore(`Circuit Status: Complete!`);
            window.add([window.text("CIRCUIT COMPLETE!", { size: 36, font: "monospace" }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(46, 204, 113)]);
        } else {
            window.add([window.text("SHORT CIRCUIT!", { size: 36, font: "monospace" }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(255, 60, 80)]);
        }

        window.wait(1.5, () => {
            hideMinigameHUD();
            finishWithPaycheck({ 
                basePay: 350, 
                bonus: score * 100, 
                onContinue: () => window.go("overworld") 
            });
        });
    });
});

export {};
