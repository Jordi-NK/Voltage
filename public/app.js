const socket = io();

const params = new URLSearchParams(window.location.search);

const view = params.get("view") || "display";

const teams = {
    fire: {
        name: "FIRE",
        emoji: "🔥"
    },

    light: {
        name: "LIGHT",
        emoji: "💡"
    },

    thunder: {
        name: "THUNDER",
        emoji: "⚡"
    },

    flame: {
        name: "FLAME",
        emoji: "🔥"
    }
};


function showCorrectView() {

    document
        .getElementById("displayView")
        .classList.add("hidden");

    document
        .getElementById("hostView")
        .classList.add("hidden");

    document
        .getElementById("leaderView")
        .classList.add("hidden");


    if (view === "display") {

        document
            .getElementById("displayView")
            .classList.remove("hidden");

    }

    else if (view === "host") {

        document
            .getElementById("hostView")
            .classList.remove("hidden");

    }

    else if (view === "leader1") {

        document
            .getElementById("leaderView")
            .classList.remove("hidden");

        document.getElementById("leaderTitle").textContent =
            "📱 LEADER 1 — FIRE + LIGHT";

    }

    else if (view === "leader2") {

        document
            .getElementById("leaderView")
            .classList.remove("hidden");

        document.getElementById("leaderTitle").textContent =
            "📱 LEADER 2 — THUNDER + FLAME";

    }
}


showCorrectView();


socket.on("gameState", game => {

    updateDisplay(game);

    updateHost(game);

    updateLeader(game);

});


/* =========================
   DISPLAY
========================= */

function updateDisplay(game) {

    if (view !== "display") return;

    document.getElementById("roundNumber").textContent =
        game.round;

    document.getElementById("timer").textContent =
        game.timeLeft;

    document.getElementById("event").textContent =
        game.lastEvent;


    if (game.round > 0) {

        const round =
            game.rounds[game.round - 1];

        document.getElementById("roundName").textContent =
            round.name;

        document.getElementById("challengeText").textContent =
            round.description;

    }


    const leaderboard =
        document.getElementById("leaderboard");

    leaderboard.innerHTML = "";


    const sortedTeams =
        Object.entries(game.teams)
            .sort((a, b) => b[1].score - a[1].score);


    sortedTeams.forEach(([id, team]) => {

        leaderboard.innerHTML += `

            <div class="teamCard">

                <div class="emoji">
                    ${team.emoji}
                </div>

                <div class="teamName">
                    ${team.name}
                </div>

                <div class="score">
                    ${team.score}
                </div>

            </div>

        `;

    });

}


/* =========================
   HOST
========================= */

function updateHost(game) {

    if (view !== "host") return;

    const container =
        document.getElementById("hostTeams");

    container.innerHTML = "";


    Object.entries(game.teams).forEach(([id, team]) => {

        container.innerHTML += `

            <div class="controlTeam">

                <h2>
                    ${team.emoji}
                    ${team.name}
                </h2>

                <div class="score">
                    ${team.score} POINTS
                </div>

                <div class="scoreButtons">

                    <button onclick="addPoints('${id}', 50)">
                        +50
                    </button>

                    <button onclick="addPoints('${id}', 100)">
                        +100
                    </button>

                    <button onclick="addPoints('${id}', 250)">
                        +250
                    </button>

                    <button onclick="addPoints('${id}', 500)">
                        +500
                    </button>

                    <button
                        class="remove"
                        onclick="removePoints('${id}', 50)"
                    >
                        -50
                    </button>

                    <button
                        class="remove"
                        onclick="removePoints('${id}', 100)"
                    >
                        -100
                    </button>

                </div>

            </div>

        `;

    });

}


/* =========================
   LEADER
========================= */

function updateLeader(game) {

    if (
        view !== "leader1" &&
        view !== "leader2"
    ) return;


    const container =
        document.getElementById("leaderTeams");

    container.innerHTML = "";


    let allowedTeams;


    if (view === "leader1") {

        allowedTeams = [
            "fire",
            "light"
        ];

    } else {

        allowedTeams = [
            "thunder",
            "flame"
        ];

    }


    allowedTeams.forEach(id => {

        const team =
            game.teams[id];

        container.innerHTML += `

            <div class="controlTeam">

                <h2>
                    ${team.emoji}
                    ${team.name}
                </h2>

                <div class="score">
                    ${team.score} POINTS
                </div>

                <div class="scoreButtons">

                    <button
                        onclick="addPoints('${id}', 50)"
                    >
                        +50
                    </button>

                    <button
                        onclick="addPoints('${id}', 100)"
                    >
                        +100
                    </button>

                    <button
                        onclick="addPoints('${id}', 250)"
                    >
                        +250
                    </button>

                    <button
                        onclick="addPoints('${id}', 500)"
                    >
                        +500
                    </button>

                </div>

            </div>

        `;

    });

}


/* =========================
   CONTROLS
========================= */

function startGame() {

    socket.emit("startGame");

}


function pauseGame() {

    socket.emit("pauseGame");

}


function nextRound() {

    socket.emit("nextRound");

}


function previousRound() {

    socket.emit("previousRound");

}


function resetTimer() {

    socket.emit("resetTimer");

}


function resetGame() {

    if (
        confirm("Are you sure you want to reset the game?")
    ) {

        socket.emit("resetGame");

    }

}


function addPoints(team, amount) {

    socket.emit("addPoints", {
        team,
        amount
    });

}


function removePoints(team, amount) {

    socket.emit("removePoints", {
        team,
        amount
    });

}