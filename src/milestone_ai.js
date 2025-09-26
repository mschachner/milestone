import { GameState, initialBoard } from './milestone_logic.js';
let nextMove;

// A shuffle function.
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


function evaluation(state,scoreMatrix) {
    switch (state.winner()) {
        case -1: // black has won
            return 100000;
        case 1: // white has won
            return -100000;
        case 0:
            let blackScore = 0, whiteScore = 0;
            for (var [i,j] of state.pieceArrays()[0]) {
                blackScore += scoreMatrix[i][j];
            }
            for (var [i,j] of state.pieceArrays()[1]) {
                whiteScore += scoreMatrix[6-i][6-j];
            }
            return blackScore - whiteScore; // positive for black, negative for white
    }
}


export function engine_smart(state,scoreMatrix) {
    nextMove = null;
    let mvs = state.legalMoves();
    for (var mv of mvs) {
        if (mv.wins()) {
            nextMove =  mv;
            return nextMove;
        }
    }
    shuffle(mvs);
    alpha_beta(state,mvs,state.difficulty,state.difficulty,-1000000,1000000, -state.turn,scoreMatrix);
    return nextMove;
}

function alpha_beta(state,mvs,depth,max_depth,alpha,beta,turnMultiplier,scoreMatrix) {
    if (depth == 0) {
        return turnMultiplier * evaluation(state,scoreMatrix);
    }
    let maxScore = -1000000;
    for (var move of mvs) {
        state.enact(move);
        let nextMvs = state.legalMoves();
        let score;
        if (nextMvs.length == 0) {
            score = turnMultiplier * 100000;
        }
        else {
            score = -1 * alpha_beta(state,nextMvs,depth-1,max_depth,-1*beta,-1*alpha,-1*turnMultiplier,scoreMatrix);
        }
        if (score > maxScore) {
            maxScore = score;
            if (depth == max_depth) {
                nextMove = move;
            }
        }
        state.undo();
        if (maxScore > alpha) {
            alpha = maxScore;
        }
        if (alpha >= beta) {
            break;
        }
    }
    return maxScore;
}

//------------------------------

// Some score matrices.
export var scores = [[1000, 20, 10,  5,   0,   0,    0],
                     [ 20,  25, 15, 15,  10,   0,    0],
                     [ 10,  15, 45, 30,  20,  15,    0],
                     [  5,  15, 30, 50,  20,  30,   30],
                     [  0,  10, 20, 20,  100,  40,   40],
                     [  0,   0, 15, 30,  40, 1000,   50],
                     [  0,   0,  0, 30,  40,  50, 100000]]

export var scores_allZero = [[0, 0, 0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0, 0, 0],
                             [0, 0, 0, 0, 0, 0, 0]]

// Face off two AIs with two different score matrices.

export function faceOff(scoreMatrix1, scoreMatrix2, difficulty) {
    let state = new GameState(initialBoard, true, true, difficulty, false);
    while (!state.gameOver()) {
        if (state.turn == 1) {
            engine_smart(state,scoreMatrix1);
        }
        else {
            engine_smart(state,scoreMatrix2);
        }
        state.enact(nextMove);
    }
    state.winner() == -1 ? console.log("Black wins") : console.log("White wins");
}

