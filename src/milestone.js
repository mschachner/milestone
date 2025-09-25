import {initialState, Move} from './milestone_logic.js';
import {engine_smart} from './milestone_ai.js';

const board   = new Path2D();
const spaces  = new Array(7);
const gui     = new Image();
const buttons = new Array(10);
const check   = new Image();
const black   = new Image();
const white   = new Image();


let canvas,ctx, X, Y;
let state = initialState(false,true,3);


let highlight = false;
let hx = 0, hy = 0; 

let quat = false;


export function init() {
    canvas = document.getElementById("milestone");
    ctx = canvas.getContext("2d");

    canvas.width  = milestoneContainer.clientWidth;
    canvas.height = milestoneContainer.clientHeight;

    X = canvas.width;
    Y = canvas.height;

    loadImages();
    loadSpaces();
    loadMenu();
    loadBoard();

    window.requestAnimationFrame(draw);
}

function loadImages() {
    black.src = "images/B.png";
    white.src = "images/W.png";
    gui.src   = "images/gui.png";
    check.src = "images/check.png";
}

function loadSpaces() {
    for (let i = 0; i < 7; i++) {
        spaces[i] = [];
        for (let j=0; j<7;j++) {
            spaces[i][j] = {hex  : new Path2D(),
                            color: ["#f7cd88","#d6a585","#f5be9a"][(i+j) % 3]};
        }
    }
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j<7;j++) {
            if (Math.abs(i-j) < 4) {
                let [spaceX,spaceY] = coordToScreen(i,j)
                spaces[i][j].hex.moveTo(spaceX+X*(1/2 - 5/(96*Math.sqrt(3))),spaceY+X*13/96);
                spaces[i][j].hex.lineTo(spaceX+X*(1/2 + 5/(96*Math.sqrt(3))),spaceY+X*13/96);
                spaces[i][j].hex.lineTo(spaceX+X*(1/2 + 5/(48*Math.sqrt(3))),spaceY+X*3/16);
                spaces[i][j].hex.lineTo(spaceX+X*(1/2 + 5/(96*Math.sqrt(3))),spaceY+X*23/96);
                spaces[i][j].hex.lineTo(spaceX+X*(1/2 - 5/(96*Math.sqrt(3))),spaceY+X*23/96);
                spaces[i][j].hex.lineTo(spaceX+X*(1/2 - 5/(48*Math.sqrt(3))),spaceY+X*3/16);
                spaces[i][j].hex.closePath();
            }
        }
    }
    
    canvas.addEventListener('click', function input(event) {
        // only active if menu is not being shown
        if (!state.isMenu) {

            // If a hex is highlighted and you click a legal target, enact move.

            for (var [i,j] of state.legalTargets([hx,hy])) {
                if (highlight && ctx.isPointInPath(spaces[i][j].hex,event.offsetX,event.offsetY)) {
                    state.enact(new Move(hx,hy,i,j));    
                }
            }
            highlight = false;

            // otherwise, if a hex is clicked, mark it to be highlighted.
            // then recolor.

            for (let i = 0; i < 7; i++) {
                for (let j = 0; j < 7; j++) {
                    if (ctx.isPointInPath(spaces[i][j].hex,event.offsetX,event.offsetY)
                        && (   (state.turn == -1 && state.board[i][j] == -1)
                            || (state.turn == 1 && state.board[i][j] == 1))) {
                        highlight = true;
                        hx = i, hy = j;
                    }
                }
            }
        }
    });
}

function loadMenu() {
    for (let i = 0; i < 15; i++) {
        buttons[i] = new Path2D();
    }
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j<2; j++) {
            buttons[2*i+j].rect([0.435*X,0.7*X][i],
                                [0.300*Y,0.356*Y][j],
                                 0.055*X,0.035*Y);
        }
    }
    for (let i = 4; i < 12; i++) {
        buttons[i].rect(X*(0.125+0.113*(i-4)), 0.507*Y, 0.045*X, 0.028*Y)
    }
    buttons[12].moveTo(X*0.576,Y*0.650);
    buttons[12].lineTo(X*0.736,Y*0.598);
    buttons[12].lineTo(X*0.890,Y*0.648);
    buttons[12].lineTo(X*0.890,Y*0.754);
    buttons[12].lineTo(X*0.733,Y*0.804);
    buttons[12].lineTo(X*0.593,Y*0.755);
    buttons[12].closePath();

    canvas.addEventListener('click', function(event) {
        if (quat) {
            quat = false;
            state = initialState(state.bHuman,state.wHuman,state.difficulty);
            
        }
        else {
            let clickedButton = -1;
            for (let i = 0; i < 13; i++) {
                if (state.isMenu && ctx.isPointInPath(buttons[i],event.offsetX,event.offsetY)) {
                    clickedButton = i;
                }
            }
            switch (clickedButton) {
                case -1:
                    break;
                case 0:
                    state.wHuman = true;
                    break;
                case 1:
                    state.bHuman = true;
                    break;
                case 2:
                    state.wHuman = false;
                    break;
                case 3:
                    state.bHuman = false;
                    break;
                case 12:
                    state.isMenu = false;
                    break;
                default:
                    state.difficulty = clickedButton - 3;
                    console.log(state.difficulty);
            }
        }
    });
}

function updateMenu() {
    
}

function loadBoard() {
    board.moveTo(X/2,X/12);
    board.lineTo(X*(1/2+5*Math.sqrt(3)/24),X*7/24);
    board.lineTo(X*(1/2+5*Math.sqrt(3)/24),X*17/24);
    board.lineTo(X/2,X*11/12);
    board.lineTo(X*(1/2-5*Math.sqrt(3)/24),X*17/24);
    board.lineTo(X*(1/2-5*Math.sqrt(3)/24),X*7/24);
    board.closePath();
}

// helpers. Shuffle stolen from
//  https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

function coordToScreen(i,j) {
    return [(j-i) * 5*X/(32*Math.sqrt(3)),(i+j) * 5*X/96]
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

function drawGame() {
    // draw background
    ctx.fillStyle = "lavender";
    ctx.beginPath();
    ctx.rect(0,0,X,Y);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "turquoise";
    ctx.rect(0,Y*0.59,X,Y*0.35);
    ctx.fill();
    ctx.stroke();

    // draw board
    ctx.lineWidth = 10;
    ctx.lineJoin  = "round";
    ctx.fillStyle = state.gameOver() ? "gold" : "brown";
    ctx.stroke(board);
    ctx.fill(board);
   
    // draw spaces
    ctx.lineWidth = 1.5;
    for (let i=0;i<7;i++) {
        for (let j=0;j<7;j++) {
                spaces[i][j].color = ["#f7cd88","#d6a585","#f5be9a"][(i+j) % 3];
        }
    }
    if (highlight) {
        spaces[hx][hy].color = "yellow";
        for ([i,j] of state.legalTargets([hx,hy])) {
            spaces[i][j].color = state.board[i][j] == 0
                            ? "lightblue"
                            : "pink";
        }
    }
    for (let i=0;i<7;i++) {
        for (let j=0;j<7;j++) {
            ctx.fillStyle = spaces[i][j].color;
            ctx.fill(spaces[i][j].hex);
            ctx.stroke(spaces[i][j].hex);
        }
    }
    
    // draw pieces

    for (var [x,y] of state.pieceArrays()[0]) {
        let [spaceX,spaceY] = coordToScreen(x,y);
    
        ctx.drawImage(black,spaceX+X*(1/2 - 5/(96*Math.sqrt(3))),
                            spaceY+X*(3/16 -5/(96*Math.sqrt(3))),
                            X*5/(48*Math.sqrt(3)),X*5/(48*Math.sqrt(3)));
        
    }

    for (var [x,y] of state.pieceArrays()[1]) {
        let [spaceX,spaceY] = coordToScreen(x,y);
    
        ctx.drawImage(white,spaceX+X*(1/2 - 5/(96*Math.sqrt(3))),
                            spaceY+X*(3/16 -5/(96*Math.sqrt(3))),
                            X*5/(48*Math.sqrt(3)),X*5/(48*Math.sqrt(3)));
        
    }

    // draw winner dialog

    if (state.gameOver()) {
        ctx.font = "" + X*0.05 + "px Gill Sans";
        ctx.fillStyle = "purple";
        if (state.winner() == -1) {
            ctx.fillText("Black has won! Click anywhere to return.",X*0.07,X*1.01);
        }
        else {
            ctx.fillText("White has won! Click anywhere to return.",X*0.07,X*1.01);
        }
        quat = true;

    }

    // draw rules dialog
    ctx.font = "italic " + (X*0.07) + "px Gill Sans";
    ctx.fillStyle = "black";
    ctx.fillText("Milestone",X*0.03,Y*0.63);

    ctx.font = "" + (X*0.0350) + "px Gill Sans";
    let spacing = 0.025;
    let rulesDialog = ["The object of the game is to move one of your stones into",
                       "your opponent's home hex, at the far corner.",
                       "A stone may only move to one of the three adjacent hexes",
                       "in front of it. Capturing the opponent's stones is possible,",
                       "but a stone may only capture when moving directly forward."
                    ];
    for (let i = 0; i < rulesDialog.length; i++) {
        ctx.fillText(rulesDialog[i],X*0.05,Y*(0.66+spacing*i));
    }

    ctx.fillText("Some tips:",X*0.05,Y*(0.66+spacing*(rulesDialog.length+1)))

    let tips = ["- Click a piece to see its available moves.",
                "  Remember pieces can only capture forward!",
                "- It's generally a bad idea to move pieces close to your home.",
                "- The center is important. Try building a vertical wall!"];
    
    for (let i = 0; i < tips.length; i++) {
        ctx.fillText(tips[i],X*0.05,Y*(0.66+spacing*(i+rulesDialog.length+2)));
    }
}

function drawMenu() {
    ctx.beginPath();
        ctx.clearRect(0,0,X,Y);
        ctx.drawImage(gui,0,0,X,Y);
        state.wHuman ? ctx.drawImage(check,0.435*X,0.300*Y,0.055*X,0.035*Y)
                     : ctx.drawImage(check,0.700*X,0.300*Y,0.055*X,0.035*Y);
        state.bHuman ? ctx.drawImage(check,0.435*X,0.356*Y,0.055*X,0.035*Y)
                     : ctx.drawImage(check,0.700*X,0.356*Y,0.055*X,0.035*Y);
        ctx.drawImage(check,X*(0.125+0.111*(state.difficulty-1)),0.504*Y,0.045*X,0.028*Y);
}


function draw() {

    // update canvas size

    X = milestoneContainer.clientWidth;
    Y = milestoneContainer.clientHeight;

    // draw menu
    if (state.isMenu) {
        drawMenu();
    }
    else {
        drawGame();

        if (!state.gameOver() && (   (state.turn == -1 && !state.bHuman) 
                                  || (state.turn ==  1 && !state.wHuman))) {
            state.enact(engine_smart());
        }
    }
    window.requestAnimationFrame(draw);
}

