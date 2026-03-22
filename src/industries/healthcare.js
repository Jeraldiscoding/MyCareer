import { showLobby, showEnergyCostNotice, finishWithPaycheck } from "./industry-utils.js";
import { showMinigameHUD, hideMinigameHUD, updateMinigameScore } from "../ui-controls.js";

window.scene("healthcare_lobby", () => {
    showLobby({
        title: "Healthcare Lobby",
        infoHTML: `
            <h3>About the Healthcare Industry</h3>
            <p>Healthcare is fundamentally about preserving, improving, and saving human lives.</p>
        `,
        job1: {
            title: "Diagnostician",
            descHTML: `
                <strong>Task:</strong> Symptom Assessment<br><br>
                Review a patient chart containing 3 distinct symptoms. Compare them to your medical options and select the correct illness diagnosis.<br><br>
                <strong>Pros:</strong> Emotionally rewarding, saves lives.<br>
                <strong>Cons:</strong> High pressure, wrong guess = tragedy.
            `,
            btnText: "Diagnose Patient ($350)",
        },
        job2: {
            title: "Lab Technician",
            descHTML: `
                <strong>Task:</strong> Chemical Synthesis<br><br>
                Use RGB mixers (Red, Green, Blue) to synthesize custom formulas that perfectly match the target prescription mixture requested.<br><br>
                <strong>Pros:</strong> Methodical and safe environment.<br>
                <strong>Cons:</strong> Repetitive and easily contaminated.
            `,
            btnText: "Synthesize ($330)",
        },
        onPrimary: () => window.go("healthcare_diagnostician"),
        onSecondary: () => window.go("healthcare_lab"),
    });
    showEnergyCostNotice();
});

// JOB 1: Diagnostician (Symptom Matching)
window.scene("healthcare_diagnostician", () => {
    showMinigameHUD("Diagnostician", "Read symptoms and press 1, 2, or 3 to select the correct illness.");
    
    // Draw medical tile background
    window.add([window.rect(window.width(), window.height()), window.color(200, 220, 210)]); 
    window.add([{
        draw() {
            // Draw hospital tiles
            for (let x = 0; x < window.width(); x += 80) {
                window.drawLine({ p1: window.vec2(x, 0), p2: window.vec2(x, window.height()), width: 2, color: window.rgb(255, 255, 255) });
            }
            for (let y = 0; y < window.height(); y += 80) {
                window.drawLine({ p1: window.vec2(0, y), p2: window.vec2(window.width(), y), width: 2, color: window.rgb(255, 255, 255) });
            }
        }
    }]);

    // Draw Clipboard
    window.add([window.rect(600, 500, { radius: 10 }), window.pos(window.width()/2, window.height()/2 + 40), window.anchor("center"), window.color(240, 240, 220), window.outline(6, window.rgb(180,180,180))]); // Paper
    window.add([window.rect(300, 40, { radius: 5 }), window.pos(window.width()/2, window.height()/2 - 190), window.anchor("center"), window.color(100, 100, 100)]); // Clip

    let score = 0;
    let round = 1;
    const maxRounds = 5;

    updateMinigameScore(`Patients: ${score}/${maxRounds}`);

    const illnesses = [
        { name: "Common Cold", symptoms: ["Cough", "Runny Nose", "Mild Fever"] },
        { name: "Influenza", symptoms: ["High Fever", "Muscle Aches", "Fatigue"] },
        { name: "Food Poisoning", symptoms: ["Nausea", "Vomiting", "Stomach Cramps"] },
        { name: "Allergies", symptoms: ["Sneezing", "Itchy Eyes", "No Fever"] },
        { name: "Migraine", symptoms: ["Severe Head Pain", "Sensitivity to Light", "Nausea"] }
    ];

    const symptomTexts = [];
    for(let i=0; i<3; i++) {
        symptomTexts.push(window.add([
            window.text("", { size: 36, font: "monospace" }), 
            window.pos(window.width()/2, window.height()/2 - 120 + (i * 60)), 
            window.anchor("center"),
            window.color(50, 60, 50), // Better dark tint readability
            window.z(10)
        ]));
    }

    const optionTexts = [];
    for(let i=0; i<3; i++) {
        optionTexts.push(window.add([
            window.text("", { size: 32, font: "monospace" }), 
            window.pos(window.width()/2, window.height()/2 + 100 + (i * 65)), 
            window.anchor("center"),
            window.color(20, 90, 160), 
            window.z(10)
        ]));
    }

    let correctIndex = 0;

    const nextPatient = () => {
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

        // Pick 3 random distinct illnesses for the options
        let shuffled = [...illnesses].sort(() => 0.5 - Math.random());
        let currentOptions = [shuffled[0], shuffled[1], shuffled[2]];
        
        correctIndex = window.randi(0, 3);
        const correctIllness = currentOptions[correctIndex];

        // Display symptoms
        for(let i=0; i<3; i++) {
            symptomTexts[i].text = `- ${correctIllness.symptoms[i]} -`;
        }

        // Display options
        for(let i=0; i<3; i++) {
            optionTexts[i].text = `[${i+1}] ${currentOptions[i].name}`;
        }
    };

    nextPatient();

    const guess = (idx) => {
        if (round > maxRounds) return;

        if (idx === correctIndex) {
            score++;
            window.add([window.text("CORRECT DIAGNOSIS", { size: 32 }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(46, 204, 113), window.lifespan(0.5, { fade: 0.5 }), window.move(window.UP, 50)]);
        } else {
            window.add([window.text("MISDIAGNOSIS!", { size: 32 }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(255, 60, 80), window.lifespan(0.5, { fade: 0.5 }), window.move(window.UP, 50)]);
        }

        round++;
        updateMinigameScore(`Patients: ${score}/${maxRounds}`);
        window.wait(0.5, nextPatient);
    };

    window.onKeyPress("1", () => guess(0));
    window.onKeyPress("2", () => guess(1));
    window.onKeyPress("3", () => guess(2));
});

// JOB 2: Lab Technician (Chemical Synthesis)
window.scene("healthcare_lab", () => {
    showMinigameHUD("Lab Technician", "Use UP/DOWN to select color. LEFT/RIGHT changes amount. Press SPACE to mix.");
    
    // Draw lab counter background
    window.add([window.rect(window.width(), window.height()), window.color(200, 220, 210)]); 
    window.add([window.rect(window.width(), 300), window.pos(0, window.height() - 300), window.color(180, 180, 190)]); // Countertop

    let score = 0;
    let round = 1;
    const maxRounds = 3;

    updateMinigameScore(`Compounds Made: ${score}/${maxRounds}`);

    // Draw machine bounds
    window.add([window.rect(800, 450, { radius: 20 }), window.pos(window.width()/2, window.height()/2 + 40), window.anchor("center"), window.color(220, 230, 230), window.outline(6, window.rgb(150,160,160))]); // Machine body
    window.add([window.rect(600, 180, { radius: 10 }), window.pos(window.width()/2, window.height()/2 - 80), window.anchor("center"), window.color(40, 50, 50)]); // Screen

    // Draw Targets
    window.add([window.text("Target", { size: 28, font: "monospace" }), window.pos(window.width()/2 - 200, window.height()/2 - 140), window.anchor("center"), window.color(200,200,200)]);
    const targetBlock = window.add([window.rect(100, 100), window.pos(window.width()/2 - 200, window.height()/2 - 60), window.anchor("center"), window.color(0,0,0), window.outline(4, window.rgb(255,255,255))]);
    
    window.add([window.text("Mixture", { size: 28, font: "monospace" }), window.pos(window.width()/2 + 200, window.height()/2 - 140), window.anchor("center"), window.color(200,200,200)]);
    const mixBlock = window.add([window.rect(100, 100), window.pos(window.width()/2 + 200, window.height()/2 - 60), window.anchor("center"), window.color(0,0,0), window.outline(4, window.rgb(255,255,255))]);

    let targetR, targetG, targetB;
    let mixR = 0, mixG = 0, mixB = 0;

    // Shift sliders down to counter
    const sliderTexts = {
        r: window.add([window.text("Red (0) [....................]", { size: 32, font: "monospace" }), window.pos(window.width()/2, window.height()/2 + 80), window.anchor("center"), window.color(220, 40, 60)]),
        g: window.add([window.text("Grn (0) [....................]", { size: 32, font: "monospace" }), window.pos(window.width()/2, window.height()/2 + 150), window.anchor("center"), window.color(30, 180, 80)]),
        b: window.add([window.text("Blu (0) [....................]", { size: 32, font: "monospace" }), window.pos(window.width()/2, window.height()/2 + 220), window.anchor("center"), window.color(40, 120, 220)]),
    };

    const cursors = [
        window.add([window.text(">", { size: 32, font: "monospace" }), window.pos(window.width()/2 - 350, window.height()/2 + 80), window.anchor("center"), window.color(40, 40, 40)]),
        window.add([window.text(">", { size: 32, font: "monospace" }), window.pos(window.width()/2 - 350, window.height()/2 + 150), window.anchor("center"), window.color(40, 40, 40)]),
        window.add([window.text(">", { size: 32, font: "monospace" }), window.pos(window.width()/2 - 350, window.height()/2 + 220), window.anchor("center"), window.color(40, 40, 40)])
    ];

    let activeSlider = 0; // 0=r, 1=g, 2=b

    const updateVisuals = () => {
        mixBlock.color = window.rgb(mixR, mixG, mixB);
        
        cursors.forEach((c, idx) => c.opacity = (idx === activeSlider) ? 1 : 0);

        const getBar = (val) => {
            const pipCount = Math.floor((val / 255) * 20);
            return "[" + "=".repeat(pipCount) + ".".repeat(20 - pipCount) + "]";
        };

        sliderTexts.r.text = `Red (${mixR.toString().padStart(3,'0')}) ${getBar(mixR)}`;
        sliderTexts.g.text = `Green (${mixG.toString().padStart(3,'0')}) ${getBar(mixG)}`;
        sliderTexts.b.text = `Blue (${mixB.toString().padStart(3,'0')}) ${getBar(mixB)}`;
    };

    const nextRound = () => {
        if (round > maxRounds) {
            hideMinigameHUD();
            finishWithPaycheck({ 
                basePay: 330, 
                bonus: score * 60, 
                onContinue: () => window.go("overworld") 
            });
            return;
        }

        // Pick distinct multiples of 51 for easier matching (0, 51, 102, 153, 204, 255) -> 5 steps
        targetR = window.randi(0, 5) * 51;
        targetG = window.randi(0, 5) * 51;
        targetB = window.randi(0, 5) * 51;

        targetBlock.color = window.rgb(targetR, targetG, targetB);

        mixR = 0; mixG = 0; mixB = 0;
        updateVisuals();
    };

    nextRound();

    window.onKeyPress("up", () => { activeSlider = (activeSlider - 1 + 3) % 3; updateVisuals(); });
    window.onKeyPress("down", () => { activeSlider = (activeSlider + 1) % 3; updateVisuals(); });
    
    window.onKeyPressRepeat("left", () => {
        if (activeSlider === 0) mixR = Math.max(0, mixR - 51);
        if (activeSlider === 1) mixG = Math.max(0, mixG - 51);
        if (activeSlider === 2) mixB = Math.max(0, mixB - 51);
        updateVisuals();
    });
    
    window.onKeyPressRepeat("right", () => {
        if (activeSlider === 0) mixR = Math.min(255, mixR + 51);
        if (activeSlider === 1) mixG = Math.min(255, mixG + 51);
        if (activeSlider === 2) mixB = Math.min(255, mixB + 51);
        updateVisuals();
    });

    window.onKeyPress("space", () => {
        // Calculate similarity
        const diff = Math.abs(targetR - mixR) + Math.abs(targetG - mixG) + Math.abs(targetB - mixB);

        // Max diff is 255*3 = 765
        if (diff === 0) {
            score++;
            window.add([window.text("PERFECT MATCH!", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(46, 204, 113), window.lifespan(1, { fade: 0.5 })]);
        } else if (diff <= 102) {
            score += 0.5; // Half point
            window.add([window.text("ACCEPTABLE MIX.", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(255, 200, 100), window.lifespan(1, { fade: 0.5 })]);
        } else {
            window.add([window.text("IMPURE FORMULA!", { size: 32 }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(255, 60, 80), window.lifespan(1, { fade: 0.5 })]);
        }

        round++;
        updateMinigameScore(`Compounds Made: ${Math.floor(score)}/${maxRounds}`);
        window.wait(1.0, nextRound);
    });
});

export {};
