import { initialBoard } from './milestone_logic.js';

// A shuffle function.
export function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }  
    return array;
}


function evaluation(state, matrix) {
    switch (state.winner()) {
        case -1: // black has won
            return 100000;
        case 1: // white has won
            return -100000;
        case 0:
            let blackScore = 0, whiteScore = 0;
            for (var [i,j] of state.pieceArrays()[0]) {
                blackScore += matrix[i][j];
            }
            for (var [i,j] of state.pieceArrays()[1]) {
                whiteScore += matrix[6-i][6-j];
            }
            return blackScore - whiteScore; // positive for black, negative for white
    }
}


export function engine(state,critter) {
    let mvs = state.legalMoves();
    for (var mv of mvs) {
        if (mv.wins()) {
            return mv;
        }
    }
    shuffle(mvs);
    const matrix = (critter && critter.evalMatrix) ? critter.evalMatrix : critter;
    const result = alpha_beta(state, mvs, state.difficulty, state.difficulty, -1000000, 1000000, -state.turn, matrix);
    return result.move ?? mvs[0];
}

function alpha_beta(state,mvs,depth,max_depth,alpha,beta,turnMultiplier,matrix) {
    if (depth == 0) {
        return { score: turnMultiplier * evaluation(state,matrix), move: null };
    }
    let maxScore = -1000000;
    let bestMove = null;
    for (var move of mvs) {
        state.enact(move);
        let nextMvs = state.legalMoves();
        let score;
        if (nextMvs.length == 0) {
            score = turnMultiplier * 100000;
        }
        else {
            score = -1 * alpha_beta(state,nextMvs,depth-1,max_depth,-1*beta,-1*alpha,-1*turnMultiplier,matrix).score;
        }
        if (score > maxScore) {
            maxScore = score;
            if (depth == max_depth) {
                bestMove = move;
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
    return { score: maxScore, move: bestMove };
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
                             
export var scores_allOne = [[1, 1, 1, 1, 1, 1, 1],
                             [1, 1, 1, 1, 1, 1, 1],
                             [1, 1, 1, 1, 1, 1, 1], 
                             [1, 1, 1, 1, 1, 1, 1],
                             [1, 1, 1, 1, 1, 1, 1],
                             [1, 1, 1, 1, 1, 1, 1],
                             [1, 1, 1, 1, 1, 1, 1]]

