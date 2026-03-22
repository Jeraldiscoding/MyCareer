// src/overworld.js

import {
    updateWealth,
    updateEnergy,
    getEnergy,
    getWealth,
    setEnergy,
} from "./globals.js";
import { assetsReady } from "./asset-manager.js";
import {
    showInteractionPrompt,
    hideInteractionPrompt,
    showRestPrompt,
    hideRestPrompt,
    showNotification,
} from "./ui-controls.js";

// Wait for Kaboom globals to be available on window
function initScene() {
    if (!window.scene || !window.sprite || !window.area) {
        setTimeout(initScene, 50);
        return;
    }

    window.scene("overworld", () => {
        const LEVEL_MAP = [
            "               ",
            "      fF       ",
            "       P       ",
            "  hHPPPPPTt    ",
            "       P       ",
            "     PPRPP     ",
            "       P       ",
            "  cCPPPPPEe    ",
            "       P       ",
            "               ",
        ];

        let activeBuilding = null;
        let atHome = false;

        const makeBuilding = (name, r, g, b, tag) => {
            return [
                window.rect(64, 64, { radius: 4 }),
                window.color(r, g, b),
                window.outline(4, window.rgb(0,0,0)),
                window.area(),
                window.anchor("center"),
                window.z(1),
                tag,
                {
                    add() {
                        // Drawing retro window/door details
                        this.add([
                            window.rect(30, 20),
                            window.color(200, 240, 255),
                            window.outline(2, window.rgb(0,0,0)),
                            window.anchor("center"),
                            window.pos(0, -15)
                        ]);
                        this.add([
                            window.rect(20, 24),
                            window.color(100, 50, 20),
                            window.outline(2, window.rgb(0,0,0)),
                            window.anchor("bot"),
                            window.pos(0, 32)
                        ]);
                        this.add([
                            window.text(name, { size: 16, font: "monospace" }), 
                            window.color(255, 255, 255),
                            window.outline(4, window.rgb(0,0,0)), // Thicker pixel outline
                            window.anchor("center"), 
                            window.pos(0, 56)
                        ]);
                    }
                }
            ];
        };

        const makeNPC = (title, r, g, b, tag) => {
            return [
                window.rect(24, 32, { radius: 4 }), // Slightly smaller than player
                window.color(r, g, b),
                window.outline(4, window.rgb(0,0,0)),
                window.anchor("bot"), // anchor bottom for bouncing
                window.z(5),
                tag,
                {
                    add() {
                        // Eyes
                        this.add([ window.rect(4, 8), window.pos(-6, -20), window.color(0,0,0) ]);
                        this.add([ window.rect(4, 8), window.pos(2, -20), window.color(0,0,0) ]);
                        // Floating nameplate
                        this.add([
                            window.text(title, { size: 14, font: "monospace" }),
                            window.pos(0, -45),
                            window.anchor("center"),
                            window.color(255,255,255),
                            window.outline(4, window.rgb(0,0,0))
                        ]);
                    }
                }
            ];
        };

        const makeGrass = () => {
            const isTree = window.randi(0, 100) > 85;
            if (isTree) {
                return [
                    window.rect(32, 48, { radius: 16 }),
                    window.color(30, 100, 50),
                    window.outline(4, window.rgb(0,0,0)),
                    window.anchor("bot"),
                    window.area({ shape: new window.Rect(window.vec2(0,0), 32, 24) }), // Collidable trunk
                    window.z(5),
                    {
                        add() {
                            // Tree shadow/detail
                            this.add([
                                window.rect(12, 16),
                                window.color(80, 50, 20),
                                window.outline(2, window.rgb(0,0,0)),
                                window.anchor("top"),
                                window.pos(0, 0),
                                window.z(-1)
                            ]);
                        }
                    }
                ];
            } else {
                const hasFlower = window.randi(0, 100) > 70;
                if (hasFlower) {
                    const c = window.choose([window.rgb(255,100,100), window.rgb(255,255,100), window.rgb(100,200,255)]);
                    return [
                        window.circle(4),
                        window.color(c),
                        window.outline(2, window.rgb(0,0,0)),
                        window.pos(window.randi(-20, 20), window.randi(-20, 20)),
                        window.z(0)
                    ];
                } else {
                    // Just some grass blades
                    return [
                        window.rect(4, 8),
                        window.color(50, 180, 80),
                        window.pos(window.randi(-20, 20), window.randi(-20, 20)),
                        window.z(0)
                    ];
                }
            }
        };

        const startX = window.width() / 2 - 400;
        const startY = window.height() / 2 - 300;

        const levelConfig = {
            tileWidth: 64,
            tileHeight: 64,
            pos: window.vec2(startX, startY),
            tiles: {
                " ": makeGrass,
                "P": () => [
                    window.rect(64, 64),
                    window.color(164, 132, 94), // Dirt path
                    window.outline(2, window.rgb(120, 90, 60)), // Dirt edge outline
                    window.z(-1),
                    window.anchor("center")
                ],
                "F": () => makeBuilding("FINANCE", 255, 80, 80, "finance_bldg"),
                "T": () => makeBuilding("TECH", 80, 255, 120, "tech_bldg"),
                "H": () => makeBuilding("HEALTH", 100, 150, 255, "health_bldg"),
                "E": () => makeBuilding("ENGINEER", 255, 200, 80, "engineering_bldg"),
                "C": () => makeBuilding("CREATIVE", 200, 100, 255, "creative_bldg"),
                "R": () => makeBuilding("HOME (REST)", 255, 255, 255, "home"),
                "f": () => makeNPC("BANKER\nFinances", 255, 100, 100, "npc_finance"),
                "t": () => makeNPC("DEV\nTech", 100, 200, 255, "npc_tech"),
                "h": () => makeNPC("DOC\nHealth", 150, 255, 150, "npc_health"),
                "e": () => makeNPC("MECH\nEngine", 255, 200, 100, "npc_eng"),
                "c": () => makeNPC("ARTIST\nCreate", 220, 100, 255, "npc_creative"),
            },
        };

        window.addLevel(LEVEL_MAP, levelConfig);

        const player = window.add([
            window.rect(32, 32),
            window.anchor("center"),
            window.color(250, 200, 150), // Skin-tone or distinct color
            window.outline(4, window.rgb(0, 0, 0)),
            window.area(),
            window.pos(startX + 7 * 64, startY + 6 * 64),
            window.z(10),
            "player",
        ]);

        window.camScale(1.2);
        
        player.onUpdate(() => {
            // Keep camera locked strictly to player to prevent float precision jitter
            window.camPos(player.pos);
        });

        const setBuildingPrompt = (label, sceneName) => {
            activeBuilding = sceneName;
            showInteractionPrompt(`Press SPACE to enter ${label}`);
        };

        player.onCollide("finance_bldg", () => setBuildingPrompt("Finance", "finance"));
        player.onCollide("tech_bldg", () => setBuildingPrompt("Technology", "technology"));
        player.onCollide("health_bldg", () => setBuildingPrompt("Healthcare", "healthcare"));
        player.onCollide("engineering_bldg", () => setBuildingPrompt("Engineering", "engineering"));
        player.onCollide("creative_bldg", () => setBuildingPrompt("Creative", "creative"));
        player.onCollideEnd("finance_bldg", () => {
            activeBuilding = null;
            hideInteractionPrompt();
        });
        player.onCollideEnd("tech_bldg", () => {
            activeBuilding = null;
            hideInteractionPrompt();
        });
        player.onCollideEnd("health_bldg", () => {
            activeBuilding = null;
            hideInteractionPrompt();
        });
        player.onCollideEnd("engineering_bldg", () => {
            activeBuilding = null;
            hideInteractionPrompt();
        });
        player.onCollideEnd("creative_bldg", () => {
            activeBuilding = null;
            hideInteractionPrompt();
        });

        player.onCollide("home", () => {
            atHome = true;
            showRestPrompt("Press R to Rest ($500)");
        });
        player.onCollideEnd("home", () => {
            atHome = false;
            hideRestPrompt();
        });

        window.onKeyPress("space", () => {
            if (!activeBuilding) return;
            if (getEnergy() < 30) {
                showNotification("Burnt Out! Go home to rest.");
                return;
            }
            updateEnergy(-30);
            hideInteractionPrompt();
            window.go(`${activeBuilding}_lobby`);
        });

        window.onKeyPress("r", () => {
            if (!atHome) return;
            const wealth = getWealth();
            if (wealth < 500) {
                showNotification("Not enough wealth to rest.");
                return;
            }
            updateWealth(-500);
            setEnergy(100);
            showNotification("Rested up! Energy restored to 100.");
        });

        const speed = 300;
        window.onKeyDown("left", () => { player.pos.x -= speed * window.dt(); });
        window.onKeyDown("right", () => { player.pos.x += speed * window.dt(); });
        window.onKeyDown("up", () => { player.pos.y -= speed * window.dt(); });
        window.onKeyDown("down", () => { player.pos.y += speed * window.dt(); });
        
        window.onKeyDown("a", () => { player.pos.x -= speed * window.dt(); });
        window.onKeyDown("d", () => { player.pos.x += speed * window.dt(); });
        window.onKeyDown("w", () => { player.pos.y -= speed * window.dt(); });
        window.onKeyDown("s", () => { player.pos.y += speed * window.dt(); });
    });

    window.go("overworld");
}

assetsReady.then(() => {
    initScene();
});
export {};