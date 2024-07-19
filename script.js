const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000';
let brushSize = 5;
let players = [];
let drawings = [];
let theme = '';
let roomName = '';

function joinGame() {
    const playerName = document.getElementById('playerName').value;
    roomName = document.getElementById('roomName').value;
    if (playerName.trim() === "" || roomName.trim() === "") {
        alert("אנא הכנס את שמך ושם החדר");
        return;
    }
    const roomData = JSON.parse(localStorage.getItem(roomName)) || { players: [], drawings: [], theme: '' };
    roomData.players.push({ name: playerName, drawing: '' });
    localStorage.setItem(roomName, JSON.stringify(roomData));
    players = roomData.players;

    if (players.length >= 2) {
        startThemeSelection();
    } else {
        alert("מחכים לשחקן נוסף...");
    }
    document.querySelector('.join-game').style.display = 'none';
}

function startThemeSelection() {
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    document.querySelector('.theme-input').style.display = 'flex';
    alert(`השחקן ${randomPlayer.name} צריך לבחור נושא לציור`);
}

function submitTheme() {
    theme = document.getElementById('theme').value;
    if (theme.trim() === "") {
        alert("אנא כתוב נושא לציור");
        return;
    }
    document.getElementById('themeDisplay').innerText = `נושא הציור: ${theme}`;
    document.querySelector('.theme-input').style.display = 'none';
    document.querySelector('.start-game').style.display = 'flex';
    const roomData = JSON.parse(localStorage.getItem(roomName));
    roomData.theme = theme;
    localStorage.setItem(roomName, JSON.stringify(roomData));
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

function startDrawing(e) {
    drawing = true;
    draw(e);  // Start drawing immediately on mouse down
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();  // Reset the path to prevent lines connecting when the mouse is moved without being pressed
}

function draw(e) {
    if (!drawing) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function submitDrawing() {
    const dataURL = canvas.toDataURL();
    const roomData = JSON.parse(localStorage.getItem(roomName));
    const player = roomData.players.find(p => p.drawing === '');
    player.drawing = dataURL;
    roomData.drawings.push(player);
    localStorage.setItem(roomName, JSON.stringify(roomData));
    drawings = roomData.drawings;

    if (drawings.length === players.length) {
        showRankings();
    } else {
        alert("מחכים לשחקנים נוספים לשמור ציור");
    }
    clearCanvas();
}

function changeColor() {
    const colorPicker = document.getElementById('colorPicker');
    currentColor = colorPicker.value;
}

function changeBrushSize() {
    const brushSizePicker = document.getElementById('brushSize');
    brushSize = brushSizePicker.value;
}

function showRankings() {
    document.querySelector('.start-game').style.display = 'none';
    const rankingDiv = document.querySelector('.ranking');
    const drawingsList = document.getElementById('drawingsList');
    drawingsList.innerHTML = '';

    drawings.forEach((drawing, index) => {
        const drawingDiv = document.createElement('div');
        const img = document.createElement('img');
        img.src = drawing.drawing;
        img.width = 200;

        const ratingInput = document.createElement('input');
        ratingInput.type = 'number';
        ratingInput.min = 1;
        ratingInput.max = 10;
        ratingInput.placeholder = `דרג ציור ${index + 1}`;

        drawingDiv.appendChild(img);
        drawingDiv.appendChild(ratingInput);
        drawingsList.appendChild(drawingDiv);
    });

    rankingDiv.style.display = 'flex';
}

function calculateWinner() {
    const ratings = Array.from(document.querySelectorAll('#drawingsList input')).map(input => parseInt(input.value) || 0);
    const highestRating = Math.max(...ratings);
    const winnerIndex = ratings.indexOf(highestRating) + 1;

    document.getElementById('winnerDisplay').innerText = `הציור הזוכה הוא ציור מספר ${winnerIndex}`;
}
