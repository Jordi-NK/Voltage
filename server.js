const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const teams = {
    fire: {
        name: "FIRE",
        emoji: "🔥",
        score: 0
    },
    light: {
        name: "LIGHT",
        emoji: "💡",
        score: 0
    },
    thunder: {
        name: "THUNDER",
        emoji: "⚡",
        score: 0
    },
    flame: {
        name: "FLAME",
        emoji: "🔥",
        score: 0
    }
};

const rounds = [
    {
        number: 1,
        name: "Lightning Answers",
        description: "Answer the question as quickly as possible!",
        points: 100
    },
    {
        number: 2,
        name: "Memory Blast",
        description: "Remember the sequence!",
        points: 150
    },
    {
        number: 3,
        name: "30 Second Challenge",
        description: "Complete the challenge before time runs out!",
        points: 200
    },
    {
        number: 4,
        name: "Act It Out",
        description: "Act out the Bible character or story!",
        points: 250
    },
    {
        number: 5,
        name: "Voltage Race",
        description: "Complete the physical challenge!",
        points: 300
    },
    {
        number: 6,
        name: "Risk It",
        description: "Choose your points carefully!",
        points: 500
    },
    {
        number: 7,
        name: "Teamwork",
        description: "Work together to complete the challenge!",
        points: 400
    },
    {
        number: 8,
        name: "FINAL SHOWDOWN",
        description: "Everything comes down to this!",
        points: 1000
    }
];

let game = {
    started: false,
    paused: false,
    round: 0,
    timeLeft: 30,
    lastEvent: "Welcome to Voltage Champions!",
    teams,
    rounds
};

let timer = null;

function broadcast() {
    io.emit("gameState", game);
}

function startTimer() {
    if (timer) return;

    timer = setInterval(() => {

        if (!game.started || game.paused) {
            return;
        }

        if (game.timeLeft > 0) {
            game.timeLeft--;

            broadcast();
        } else {
            clearInterval(timer);
            timer = null;

            game.lastEvent = "⏰ TIME'S UP!";
            broadcast();
        }

    }, 1000);
}

function resetTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    game.timeLeft = 30;
}

io.on("connection", socket => {

    console.log("Player connected:", socket.id);

    socket.emit("gameState", game);

    // START GAME
    socket.on("startGame", () => {

        game.started = true;
        game.paused = false;
        game.round = 1;
        game.timeLeft = 30;
        game.lastEvent = "⚡ GAME STARTED!";

        startTimer();
        broadcast();
    });

    // PAUSE
    socket.on("pauseGame", () => {

        game.paused = !game.paused;

        game.lastEvent = game.paused
            ? "⏸️ GAME PAUSED"
            : "▶️ GAME RESUMED";

        broadcast();
    });

    // NEXT ROUND
    socket.on("nextRound", () => {

        if (game.round < game.rounds.length) {

            game.round++;

            resetTimer();

            game.lastEvent =
                `➡️ Round ${game.round}: ${game.rounds[game.round - 1].name}`;

            broadcast();
        }
    });

    // PREVIOUS ROUND
    socket.on("previousRound", () => {

        if (game.round > 1) {

            game.round--;

            resetTimer();

            game.lastEvent =
                `⬅️ Round ${game.round}: ${game.rounds[game.round - 1].name}`;

            broadcast();
        }
    });

    // ADD POINTS
    socket.on("addPoints", ({ team, amount }) => {

        if (!game.teams[team]) return;

        game.teams[team].score += amount;

        game.lastEvent =
            `${game.teams[team].emoji} ${game.teams[team].name} +${amount} POINTS!`;

        broadcast();
    });

    // REMOVE POINTS
    socket.on("removePoints", ({ team, amount }) => {

        if (!game.teams[team]) return;

        game.teams[team].score =
            Math.max(0, game.teams[team].score - amount);

        game.lastEvent =
            `${game.teams[team].emoji} ${game.teams[team].name} -${amount} POINTS`;

        broadcast();
    });

    // RESET GAME
    socket.on("resetGame", () => {

        resetTimer();

        game.started = false;
        game.paused = false;
        game.round = 0;
        game.timeLeft = 30;

        Object.keys(game.teams).forEach(team => {
            game.teams[team].score = 0;
        });

        game.lastEvent = "🔄 GAME RESET";

        broadcast();
    });

    // RESET TIMER
    socket.on("resetTimer", () => {

        resetTimer();

        game.lastEvent = "⏱️ TIMER RESET";

        broadcast();
    });

});

const PORT = 3000;

server.listen(PORT, "0.0.0.0", () => {

    console.log(`
========================================
       VOLTAGE CHAMPIONS
========================================

Game server running!

Open on this computer:
http://localhost:${PORT}

For phones:
http://YOUR-PC-IP:${PORT}

========================================
`);
});