import { showLobby, showEnergyCostNotice, finishWithPaycheck } from "./industry-utils.js";
import { showMinigameHUD, hideMinigameHUD, updateMinigameScore } from "../ui-controls.js";

window.scene("creative_lobby", () => {
    showLobby({
        title: "Creative Lobby",
        infoHTML: `
            <h3>About the Creative / Media Industry</h3>
            <p>The creative arts focus on communication, aesthetics, and crafting compelling narratives or visuals.</p>
        `,
        job1: {
            title: "Graphic Designer",
            descHTML: `
                <strong>Task:</strong> Shape & Opacity Alignment<br><br>
                A client demands a specific visual scale and opacity! Use keyboard sliders to match their vague requests exactly and get your draft approved.<br><br>
                <strong>Pros:</strong> High personal expression.<br>
                <strong>Cons:</strong> "Make the logo bigger" requests.
            `,
            btnText: "Design Logo ($280)",
        },
        job2: {
            title: "Copywriter",
            descHTML: `
                <strong>Task:</strong> Ad Slogan Assembly<br><br>
                Fill in the blank of a marketing slogan using the highest-converting keyword to maximize client engagement and sales.<br><br>
                <strong>Pros:</strong> Dynamic projects, fun culture.<br>
                <strong>Cons:</strong> Writer's block, tight deadlines.
            `,
            btnText: "Write Copy ($300)",
        },
        onPrimary: () => window.go("creative_designer"),
        onSecondary: () => window.go("creative_copywriter"),
    });
    showEnergyCostNotice();
});

// JOB 1: Graphic Designer (Color Matching)
window.scene("creative_designer", () => {
    // Basic setup - vibrant background
    window.add([window.rect(window.width(), window.height()), window.color(180, 80, 200)]); // Vibrant purple/magenta
    window.add([{
        draw() {
            // Draw abstract retro polkadots/confetti
            for (let i = 0; i < 20; i++) {
                const cx = (i * 73) % window.width();
                const cy = (i * 127) % window.height();
                window.drawCircle({ pos: window.vec2(cx, cy), radius: 15 + (i%10), color: window.rgb(200, 100, 220) });
            }
        }
    }]);

    showMinigameHUD("Graphic Designer", "Adjust RGB to match the client's brand color. Press SPACE to submit.");

    let score = 0;
    let round = 1;
    const maxRounds = 4;

    updateMinigameScore(`Designs Approved: ${score}/${maxRounds}`);

    // Draw Targets
    window.add([window.text("Target", { size: 32, font: "monospace" }), window.pos(window.width()/2 - 200, 180), window.anchor("center"), window.color(255,255,255)]);
    const targetBlock = window.add([window.rect(140, 140, { radius: 12 }), window.pos(window.width()/2 - 200, 280), window.anchor("center"), window.color(0,0,0), window.outline(6, window.rgb(255,255,255))]);
    
    window.add([window.text("Draft", { size: 32, font: "monospace" }), window.pos(window.width()/2 + 200, 180), window.anchor("center"), window.color(255,255,255)]);
    const mixBlock = window.add([window.rect(140, 140, { radius: 12 }), window.pos(window.width()/2 + 200, 280), window.anchor("center"), window.color(0,0,0), window.outline(6, window.rgb(255,255,255))]);

    let targetR, targetG, targetB;
    let mixR = 0, mixG = 0, mixB = 0;

    const sliderTexts = {
        r: window.add([window.text("", { size: 32, font: "monospace" }), window.pos(window.width()/2, 420), window.anchor("center"), window.color(255, 100, 100)]),
        g: window.add([window.text("", { size: 32, font: "monospace" }), window.pos(window.width()/2, 490), window.anchor("center"), window.color(100, 255, 100)]),
        b: window.add([window.text("", { size: 32, font: "monospace" }), window.pos(window.width()/2, 560), window.anchor("center"), window.color(100, 200, 255)]),
    };

    const cursors = [
        window.add([window.text(">", { size: 36, font: "monospace" }), window.pos(window.width()/2 - 350, 420), window.anchor("center"), window.color(255,255,255)]),
        window.add([window.text(">", { size: 36, font: "monospace" }), window.pos(window.width()/2 - 350, 490), window.anchor("center"), window.color(255,255,255)]),
        window.add([window.text(">", { size: 36, font: "monospace" }), window.pos(window.width()/2 - 350, 560), window.anchor("center"), window.color(255,255,255)])
    ];

    const targetStats = window.add([window.text("", { size: 24, font: "monospace" }), window.pos(window.width()/2 - 200, 380), window.anchor("center"), window.color(255,255,255)]);
    const myStats = window.add([window.text("", { size: 24, font: "monospace" }), window.pos(window.width()/2 + 200, 380), window.anchor("center"), window.color(255,255,255)]);

    const nextRound = () => {
        if (round > maxRounds) {
            window.wait(0.5, () => {
                hideMinigameHUD();
                finishWithPaycheck({ 
                    basePay: 280, 
                    bonus: score * 60, 
                    onContinue: () => window.go("overworld") 
                });
            });
            return;
        }

        targetR = window.randi(0, 256);
        targetG = window.randi(0, 256);
        targetB = window.randi(0, 256);

        targetBlock.color = window.rgb(targetR, targetG, targetB);
        targetStats.text = `R: ???\nG: ???\nB: ???`;
        
        mixR = 0; mixG = 0; mixB = 0;
        mixBlock.color = window.rgb(mixR, mixG, mixB);
        myStats.text = `R: ${mixR}\nG: ${mixG}\nB: ${mixB}`;
    };

    nextRound();

    const updateMyMix = () => {
        mixBlock.color = window.rgb(mixR, mixG, mixB);
        myStats.text = `R: ${mixR}\nG: ${mixG}\nB: ${mixB}`;
    };

    window.onKeyPress("left", () => { mixR = Math.max(0, mixR - 5); updateMyMix(); });
    window.onKeyPress("right", () => { mixR = Math.min(255, mixR + 5); updateMyMix(); });
    window.onKeyPress("down", () => { mixG = Math.max(0, mixG - 5); updateMyMix(); });
    window.onKeyPress("up", () => { mixG = Math.min(255, mixG + 5); updateMyMix(); });
    window.onKeyPress("n", () => { mixB = Math.max(0, mixB - 5); updateMyMix(); });
    window.onKeyPress("m", () => { mixB = Math.min(255, mixB + 5); updateMyMix(); });

    window.onKeyPress("space", () => {
        const diff = Math.abs(targetR - mixR) + Math.abs(targetG - mixG) + Math.abs(targetB - mixB);

        if (diff < 50) { // fairly generous
            score++;
            window.add([window.text("CLIENT APPROVED!", { size: 36, font: "monospace" }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(46, 204, 113), window.lifespan(1, { fade: 0.5 })]);
        } else {
            window.add([window.text("CLIENT REQUESTS REVISIONS!", { size: 36, font: "monospace" }), window.pos(window.width()/2, window.height() - 80), window.anchor("center"), window.color(255, 60, 80), window.lifespan(1, { fade: 0.5 })]);
        }

        round++;
        updateMinigameScore(`Designs Approved: ${score}/${maxRounds}`);
        window.wait(1.0, nextRound);
    });
});

// JOB 2: Copywriter (Speed Typing)
window.scene("creative_copywriter", () => {
    // Basic setup - vibrant background
    window.add([window.rect(window.width(), window.height()), window.color(180, 80, 200)]); // Vibrant purple/magenta
    window.add([{
        draw() {
            // Draw diagonal retro streaks
            for (let x = -window.height(); x < window.width(); x += 60) {
                window.drawLine({ p1: window.vec2(x, 0), p2: window.vec2(x + window.height(), window.height()), width: 10, color: window.rgb(200, 100, 220) });
            }
        }
    }]);

    showMinigameHUD("Copywriter", "Type the exact slogan shown above before time runs out. Press ENTER to submit.");

    let score = 0;
    let round = 1;
    const maxRounds = 3;

    updateMinigameScore(`Ads Published: ${score}/${maxRounds}`);

    const templates = [
        { pre: "The new", post: "for your everyday life.", best: "Essential" },
        { pre: "Experience", post: "like never before.", best: "Innovation" },
        { pre: "Say goodbye to", post: "forever.", best: "Stress" }
    ];

    const words = [
        "Essential", "Innovation", "Stress", "Boredom", "Mediocrity",
        "Disappointment", "Luxury", "Taxes", "Headaches", "Excellence"
    ];

    let currentSlogan = "";
    let typedText = "";

    const sloganText = window.add([window.text("", { size: 48, font: "monospace" }), window.pos(window.width()/2, window.height()/2 - 100), window.anchor("center"), window.color(255, 255, 100)]);
    const inputBg = window.add([window.rect(800, 80, { radius: 10 }), window.pos(window.width()/2, window.height()/2 + 40), window.anchor("center"), window.color(40, 40, 60), window.outline(4, window.rgb(255, 255, 255))]);
    const inputText = window.add([
        window.text("", { size: 40, font: "monospace" }), 
        window.pos(window.width()/2, window.height()/2 + 40), 
        window.anchor("center"),
        window.color(255, 255, 255)
    ]);

    const generateSlogan = () => {
        const template = templates[window.randi(0, templates.length)];
        currentSlogan = `${template.pre} ${template.best} ${template.post}`;
        sloganText.text = `"${currentSlogan}"`;

        typedText = "";
        inputText.text = typedText;
        window.wait(3, () => {
            if (typedText !== currentSlogan) {
                window.add([window.text("TIME'S UP! NO MATCH.", { size: 36, font: "monospace" }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(255, 60, 80), window.lifespan(1, { fade: 0.5 }), window.move(window.UP, 50)]);
            }
        });
    };

    generateSlogan();

    window.onKeyPress("enter", () => {
        if (round > maxRounds) return;

        if (typedText === currentSlogan) {
            score++;
            window.add([window.text("HIGH CONVERSION RATE!", { size: 36, font: "monospace" }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(46, 204, 113), window.lifespan(1, { fade: 0.5 }), window.move(window.UP, 50)]);
        } else {
            window.add([window.text("POOR ENGAGEMENT!", { size: 36, font: "monospace" }), window.pos(window.width()/2, window.height() - 100), window.anchor("center"), window.color(255, 60, 80), window.lifespan(1, { fade: 0.5 }), window.move(window.UP, 50)]);
        }

        round++;
        updateMinigameScore(`Ads Published: ${score}/${maxRounds}`);
        window.wait(1.0, generateSlogan);
    });

    window.onKeyPress("backspace", () => {
        typedText = typedText.slice(0, -1);
        inputText.text = typedText;
    });

    window.onCharInput((char) => {
        if (round > maxRounds) return;

        typedText += char;
        inputText.text = typedText;
    });
});

export {};
