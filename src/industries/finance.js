import { showLobby, showEnergyCostNotice, finishWithPaycheck } from "./industry-utils.js";
import { showMinigameHUD, updateMinigameScore, hideMinigameHUD } from "../ui-controls.js";

window.scene("finance_lobby", () => {
    showLobby({
        title: "Finance Lobby",
        infoHTML: `
            <h3>About the Finance Industry</h3>
            <p>The finance sector surrounds managing money, risk assessment, and financial strategy.</p>
        `,
        job1: {
            title: "Accountant",
            descHTML: `
                <strong>Task:</strong> Ledger Auditing<br><br>
                Review financial equations representing ledger entries. Find and select the incorrect mathematical entry to audit it properly.<br><br>
                <strong>Pros:</strong> Stable income, high demand.<br>
                <strong>Cons:</strong> Repetitive tasks, eye strain.
            `,
            btnText: "Start Audit ($300)",
        },
        job2: {
            title: "Investment Analyst",
            descHTML: `
                <strong>Task:</strong> Portfolio Matching<br><br>
                Review strict client investment requirements (e.g. Low Risk, Tech Sector) and select the perfect portfolio for them.<br><br>
                <strong>Pros:</strong> High bonuses, strategic thinking.<br>
                <strong>Cons:</strong> High stress from angry clients.
            `,
            btnText: "Analyze Markets ($320)",
        },
        onPrimary: () => window.go("finance_accountant"),
        onSecondary: () => window.go("finance_analyst"),
    });
    showEnergyCostNotice();
});

// JOB 1: Accountant (Ledger Auditing)
window.scene("finance_accountant", () => {
    showMinigameHUD("Accountant", "Ledger Audit: Use UP/DOWN to select the row with the math error, then press SPACE.");
    
    // Draw retro graph paper background
    window.add([window.rect(window.width(), window.height()), window.color(160, 65, 65)]); // Lively Retro Red
    window.add([{
        draw() {
            // Draw grid lines
            for (let x = 0; x < window.width(); x += 60) {
                window.drawLine({ p1: window.vec2(x, 0), p2: window.vec2(x, window.height()), width: 2, color: window.rgb(180, 80, 80) });
            }
            for (let y = 0; y < window.height(); y += 60) {
                window.drawLine({ p1: window.vec2(0, y), p2: window.vec2(window.width(), y), width: 2, color: window.rgb(180, 80, 80) });
            }
        }
    }]);

    // Draw desk/calculator motif elements
    window.add([window.rect(850, 400, { radius: 16 }), window.pos(window.width()/2, window.height()/2 + 40), window.anchor("center"), window.color(40, 40, 50), window.outline(6, window.rgb(0,0,0))]); // "Calculator" bezel
    window.add([window.rect(800, 320, { radius: 12 }), window.pos(window.width()/2, window.height()/2 + 30), window.anchor("center"), window.color(20, 25, 30)]); // Screen

    let score = 0;
    let round = 1;
    const maxRounds = 5;
    let selectedRow = 0;
    let correctRow = 0;
    
    updateMinigameScore(`Audits: ${score}/${maxRounds}`);
    
    // UI elements mapped to rows
    const rows = [];
    const cursors = [];
    const startY = window.height() / 2 - 20; // Inside screen

    for (let i = 0; i < 3; i++) {
        // Highlighting box
        const bg = window.add([
            window.rect(750, 60, { radius: 6 }), // Proper fit inside the calculator bezel
            window.pos(window.width()/2, startY + i * 80),
            window.anchor("center"),
            window.color(50, 60, 80),
            window.opacity(i === 0 ? 1 : 0) // Highlight first row
        ]);
        
        // Text
        const txt = window.add([
            window.text("", { size: 28, font: "monospace" }),
            window.pos(window.width()/2, startY + i * 80),
            window.anchor("center"),
            window.color(100, 255, 100) // Retro green phosphor text
        ]);

        rows.push(txt);
        cursors.push(bg);
    }

    const generateLedger = () => {
        correctRow = window.randi(0, 3);
        
        for (let i = 0; i < 3; i++) {
            const a = window.randi(10, 100);
            const b = window.randi(10, 100);
            let result = a + b;
            
            // If this is the designated incorrect row, mess up the math
            if (i === correctRow) {
                result += window.choose([-10, 10, -5, +5]);
            }
            
            rows[i].text = `Revenue $${a}K + Gain $${b}K = Total $${result}K`;
        }
    };

    generateLedger();

    window.onKeyPress("up", () => {
        cursors[selectedRow].opacity = 0;
        selectedRow = (selectedRow - 1 + 3) % 3;
        cursors[selectedRow].opacity = 1;
    });

    window.onKeyPress("down", () => {
        cursors[selectedRow].opacity = 0;
        selectedRow = (selectedRow + 1) % 3;
        cursors[selectedRow].opacity = 1;
    });

    window.onKeyPress("space", () => {
        if (selectedRow === correctRow) {
            score++;
            window.add([window.text("ACCURATE AUDIT", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(46, 204, 113), window.lifespan(0.5, { fade: 0.5 })]);
        } else {
            window.add([window.text("MISSED ERROR", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(255, 60, 80), window.lifespan(0.5, { fade: 0.5 })]);
        }
        
        round++;
        updateMinigameScore(`Audits: ${score}/${maxRounds}`);

        if (round > maxRounds) {
            window.wait(0.5, () => {
                hideMinigameHUD();
                finishWithPaycheck({ 
                    basePay: 350, 
                    bonus: score * 50, 
                    onContinue: () => window.go("overworld") 
                });
            });
        } else {
            generateLedger();
            cursors[selectedRow].opacity = 0;
            selectedRow = 0;
            cursors[selectedRow].opacity = 1;
        }
    });
});

// JOB 2: Investment Analyst (Portfolio Matching)
window.scene("finance_analyst", () => {
    showMinigameHUD("Investment Analyst", "Analyze and select the exact matching portfolio (Press 1, 2, or 3)");
    
    // Draw retro stock ticker background
    window.add([window.rect(window.width(), window.height()), window.color(160, 65, 65)]);
    window.add([{
        draw() {
            // Draw rising stock bar charts lightly in background
            for (let i = 0; i < 20; i++) {
                window.drawRect({ width: 40, height: 100 + (i * 20 % 300), pos: window.vec2(100 + i * 60, window.height() - (100 + (i * 20 % 300))), color: window.rgb(180, 80, 80) });
            }
        }
    }]);
    
    let score = 0;
    let round = 1;
    const maxRounds = 4;
    let correctChoice = 0;

    updateMinigameScore(`Clients: ${score}/${maxRounds}`);

    const sectors = ["Tech", "Healthcare", "Real Estate", "Energy", "Retail"];
    const risks = ["Low Risk", "High Risk"];
    
    // Draw terminal board for client requirement
    window.add([window.rect(600, 80, { radius: 10 }), window.pos(window.width()/2, window.height()/2 - 180), window.anchor("center"), window.color(0,0,0), window.outline(4, window.rgb(255,255,100))]);
    const clientBrief = window.add([
        window.text("", { size: 36, font: "monospace" }),
        window.pos(window.width()/2, window.height()/2 - 180), 
        window.anchor("center"),
        window.color(255, 255, 100)
    ]);

    const portfolios = [];
    for(let i = 0; i < 3; i++) {
        const xPos = window.width()/2 - 300 + i * 300;
        
        // Draw physical briefcase/folder for portfolios
        window.add([window.rect(220, 240, { radius: 10 }), window.pos(xPos, window.height()/2 + 80), window.anchor("center"), window.color(180, 150, 100), window.outline(6, window.rgb(0,0,0))]); // Folder back
        window.add([window.rect(220, 40), window.pos(xPos, window.height()/2 - 20), window.anchor("center"), window.color(140, 110, 70), window.outline(4, window.rgb(0,0,0))]); // Folder tab
        
        const box = window.add([window.rect(190, 190, { radius: 5 }), window.pos(xPos, window.height()/2 + 90), window.anchor("center"), window.color(255, 255, 240), window.outline(2, window.rgb(0,0,0))]); // Paper
        
        const title = window.add([window.text(`Portfolio ${i+1}`, { size: 28, font: "monospace" }), window.pos(xPos, window.height()/2 + 20), window.anchor("center"), window.color(0, 0, 0)]);
        const sectorTxt = window.add([window.text("", { size: 24, font: "monospace" }), window.pos(xPos, window.height()/2 + 80), window.anchor("center"), window.color(40, 40, 150)]);
        const riskTxt = window.add([window.text("", { size: 24, font: "monospace" }), window.pos(xPos, window.height()/2 + 130), window.anchor("center"), window.color(150, 40, 40)]);
        portfolios.push({ sectorTxt, riskTxt });
    }

    const generateClient = () => {
        correctChoice = window.randi(0, 3);
        const reqSector = window.choose(sectors);
        const reqRisk = window.choose(risks);
        
        clientBrief.text = `WANTS: ${reqSector} | ${reqRisk}`;

        for (let i = 0; i < 3; i++) {
            if (i === correctChoice) {
                portfolios[i].sectorTxt.text = reqSector;
                portfolios[i].riskTxt.text = reqRisk;
            } else {
                let s = window.choose(sectors);
                let r = window.choose(risks);
                // Ensure the incorrect choices don't accidentally match completely
                while (s === reqSector && r === reqRisk) {
                    s = window.choose(sectors);
                    r = window.choose(risks);
                }
                portfolios[i].sectorTxt.text = s;
                portfolios[i].riskTxt.text = r;
            }
        }
    };

    generateClient();

    const handleChoice = (idx) => {
        if (idx === correctChoice) {
            score++;
            window.add([window.text("CLIENT SECURED!", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(46, 204, 113), window.lifespan(0.5, { fade: 0.5 })]);
        } else {
            window.add([window.text("CLIENT LOST...", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(255, 60, 80), window.lifespan(0.5, { fade: 0.5 })]);
        }
        
        round++;
        updateMinigameScore(`Clients: ${score}/${maxRounds}`);

        if (round > maxRounds) {
            window.wait(0.5, () => {
                hideMinigameHUD();
                finishWithPaycheck({ 
                    basePay: 400, 
                    bonus: score * 100, 
                    onContinue: () => window.go("overworld") 
                });
            });
        } else {
            generateClient();
        }
    };

    window.onKeyPress("1", () => handleChoice(0));
    window.onKeyPress("2", () => handleChoice(1));
    window.onKeyPress("3", () => handleChoice(2));
});

export {};