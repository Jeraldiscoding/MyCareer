import { updateWealth, updateEnergy } from "../globals.js";
import { showPaycheckModal, showNotification, showLobbyModal } from "../ui-controls.js";

const ENERGY_COST = 30;

function trySpendEnergy() {
    updateEnergy(-ENERGY_COST);
}

function showLobby({ title, infoHTML, job1, job2, onPrimary, onSecondary }) {
    showLobbyModal({
        title,
        infoHTML,
        job1,
        job2,
        onPrimary,
        onSecondary,
    });
}

function finishWithPaycheck({ basePay, bonus, onContinue }) {
    const total = basePay + bonus;
    showPaycheckModal({
        basePay,
        bonus,
        total,
        onContinue: () => {
            updateWealth(total);
            if (onContinue) onContinue();
        },
    });
}

function runCatchGame({ sceneName, duration, basePay, goodSprite, badSprite, onComplete }) {
    window.scene(sceneName, () => {
        let score = 0;
        
        // Add a nice background specific to the minigame
        window.add([
            window.rect(window.width(), window.height()),
            window.color(15, 20, 30),
            window.z(-10)
        ]);

        const scoreLabel = window.add([
            window.text(`Score: 0`, { size: 32, font: "monospace" }),
            window.pos(24, 24),
            window.color(255, 255, 255),
        ]);

        const timerLabel = window.add([
            window.text(`Time: ${duration}`, { size: 32, font: "monospace" }),
            window.pos(window.width() - 200, 24),
            window.color(255, 255, 255),
        ]);

        let timeRemaining = duration;
        window.loop(1, () => {
            timeRemaining--;
            if (timeRemaining >= 0) {
                timerLabel.text = `Time: ${timeRemaining}`;
            }
        });

        const player = window.add([
            window.circle(24),
            window.color(255, 255, 255),
            window.area(),
            window.body(),
            window.pos(window.width() / 2, window.height() - 80),
            "player" // Add player tag
        ]);

        const speed = 400;
        
        // Use pos modification directly to prevent physics sticking
        window.onKeyDown("left", () => { 
            player.pos.x = Math.max(24, player.pos.x - speed * window.dt()); 
        });
        window.onKeyDown("right", () => { 
            player.pos.x = Math.min(window.width() - 24, player.pos.x + speed * window.dt()); 
        });
        window.onKeyDown("a", () => { 
            player.pos.x = Math.max(24, player.pos.x - speed * window.dt()); 
        });
        window.onKeyDown("d", () => { 
            player.pos.x = Math.min(window.width() - 24, player.pos.x + speed * window.dt()); 
        });

        let spawnRate = 0.5;
        let fallSpeed = 350;

        const spawnItem = (tag) => {
            const isGood = tag === "good";
            // Keep items within screen bounds
            const x = window.rand(40, window.width() - 40);
            const item = window.add([
                window.circle(16),
                window.color(isGood ? 46 : 255, isGood ? 204 : 60, isGood ? 113 : 80),
                window.area(),
                window.pos(x, -40),
                tag,
            ]);
            item.onUpdate(() => {
                // Fall down
                item.pos.y += fallSpeed * window.dt();
                if (item.pos.y > window.height() + 40) {
                    item.destroy();
                }
            });
        };

        const spawnLoop = window.loop(spawnRate, () => {
            // 60% chance for a good item, 40% for bad
            const isGood = window.rand(0, 1) > 0.4;
            spawnItem(isGood ? "good" : "bad");
        });

        player.onCollide("good", (obj) => {
            score += 25; // 25 dollars bonus per catch
            scoreLabel.text = `Score: ${score}`;
            obj.destroy();
        });

        player.onCollide("bad", (obj) => {
            // Flash screen red briefly to indicate damage
            const flash = window.add([
                window.rect(window.width(), window.height()),
                window.color(255, 0, 0),
                window.opacity(0.3),
                window.lifespan(0.1, { fade: 0.1 }),
                window.z(100)
            ]);
            
            score = Math.max(0, score - 15);
            scoreLabel.text = `Score: ${score}`;
            obj.destroy();
        });

        window.wait(duration, () => {
            spawnLoop.cancel();
            const bonus = Math.max(0, score);
            finishWithPaycheck({
                basePay,
                bonus,
                onContinue: () => onComplete(),
            });
        });
    });
}

function runTimingGame({ sceneName, duration, basePay, onComplete }) {
    window.scene(sceneName, () => {
        let attemptsLeft = 3;
        let successfulHits = 0;
        let isWaitingForNextRound = false;

        // Dark modern background
        window.add([
            window.rect(window.width(), window.height()),
            window.color(15, 20, 30),
            window.z(-10)
        ]);

        const titleLabel = window.add([
            window.text("Press SPACE when the cursor is in the green zone!", { size: 32, font: "monospace" }),
            window.pos(window.width()/2, window.height()/2 - 150),
            window.anchor("center"),
            window.color(255, 255, 255),
        ]);

        const attemptsLabel = window.add([
            window.text(`Attempts left: ${attemptsLeft}`, { size: 24, font: "monospace" }),
            window.pos(window.width()/2, window.height()/2 - 90),
            window.anchor("center"),
            window.color(200, 200, 200),
        ]);

        // Draw the background bar
        const barWidth = 600;
        const barHeight = 40;
        const barX = window.width() / 2 - barWidth / 2;
        const barY = window.height() / 2;

        const mainBar = window.add([
            window.rect(barWidth, barHeight, { radius: 20 }),
            window.pos(window.width()/2, barY),
            window.anchor("center"),
            window.color(50, 50, 60),
            window.area()
        ]);

        // Randomly position the target window inside the bar
        const targetWidth = 80;
        const placeTarget = () => {
            // Give a safe margin from the edges
            return barX + targetWidth/2 + window.rand(0, barWidth - targetWidth);
        };

        const target = window.add([
            window.rect(targetWidth, barHeight, { radius: 10 }),
            window.pos(placeTarget(), barY),
            window.anchor("center"),
            window.color(46, 204, 113),
        ]);

        const cursor = window.add([
            window.rect(10, barHeight + 40, { radius: 5 }),
            window.pos(barX, barY),
            window.anchor("center"),
            window.color(255, 255, 255),
            window.area()
        ]);

        let cursorSpeed = 450;
        let direction = 1;

        cursor.onUpdate(() => {
            if (isWaitingForNextRound) return;

            cursor.pos.x += cursorSpeed * direction * window.dt();
            
            // Bounce cursor back and forth
            if (cursor.pos.x >= barX + barWidth) {
                cursor.pos.x = barX + barWidth;
                direction = -1;
            } else if (cursor.pos.x <= barX) {
                cursor.pos.x = barX;
                direction = 1;
            }
        });

        const resetRound = () => {
            if (attemptsLeft <= 0) {
                endGame();
                return;
            }
            isWaitingForNextRound = false;
            target.pos.x = placeTarget();
            cursor.pos.x = barX;
            direction = 1;
            cursorSpeed += 100; // Gets faster each time!
        };

        const endGame = () => {
            const bonus = successfulHits * 120; // Massive bonus for precision
            finishWithPaycheck({
                basePay,
                bonus,
                onContinue: () => onComplete(),
            });
        };

        window.onKeyPress("space", () => {
            if (isWaitingForNextRound) return;
            
            attemptsLeft--;
            attemptsLabel.text = `Attempts left: ${attemptsLeft}`;
            isWaitingForNextRound = true;

            const dist = Math.abs(cursor.pos.x - target.pos.x);
            // Must be within half the target width to count as a hit inside the box
            const success = dist < (targetWidth / 2);

            // Pop-up feedback message
            const feedback = window.add([
                window.text(success ? "PERFECT!" : "MISS!", { size: 48, font: "monospace" }),
                window.pos(window.width()/2, window.height()/2 + 100),
                window.anchor("center"),
                window.color(success ? window.rgb(46, 204, 113) : window.rgb(255, 60, 80)),
                window.lifespan(1, { fade: 0.5 })
            ]);

            if (success) {
                successfulHits++;
            }

            if (attemptsLeft > 0) {
                window.wait(1.5, resetRound);
            } else {
                window.wait(1.5, endGame);
            }
        });
    });
}

function showEnergyCostNotice() {
    showNotification("Entering a job costs 30 Energy.");
}

export {
    trySpendEnergy,
    showLobby,
    finishWithPaycheck,
    runCatchGame,
    runTimingGame,
    showEnergyCostNotice,
};
