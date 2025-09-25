let nextMove;

var scores = [[1000, 20, 10,  5,   0,   0,    0],
             [ 20,  25, 15, 15,  10,   0,    0],
             [ 10,  15, 45, 30,  20,  15,    0],
             [  5,  15, 30, 50,  20,  30,   30],
             [  0,  10, 20, 20,  100,  40,   40],
             [  0,   0, 15, 30,  40, 1000,   50],
             [  0,   0,  0, 30,  40,  50, 100000]]


function evaluation() {
    switch (state.winner()) {
        case -1: // black has won
            return 100000;
        case 1: // white has won
            return -100000;
        case 0:
            let blackScore = 0, whiteScore = 0;
            for (var [i,j] of state.pieceArrays()[0]) {
                blackScore += scores[i][j];
            }
            for (var [i,j] of state.pieceArrays()[1]) {
                whiteScore += scores[6-i][6-j];
            }
            return blackScore - whiteScore; // positive for black, negative for white
    }
}


function engine_dumb() {
    let moves = state.legalMoves();
    return moves[Math.floor(Math.random() * moves.length)];
}

function engine_negamax() {
    nextMove = null;
    let mvs = state.legalMoves();
    shuffle(mvs);
    negamax(mvs,state.difficulty,state.difficulty,-state.turn);
    return nextMove;
}


export function engine_smart() {
    nextMove = null;
    let mvs = state.legalMoves();
    for (var mv of mvs) {
        if (mv.wins()) {
            nextMove =  mv;
            return nextMove;
        }
    }
    shuffle(mvs);
    alpha_beta(mvs,state.difficulty,state.difficulty,-1000000,1000000, -state.turn);
    return nextMove;
}


function negamax(mvs,depth,max_depth,turnMultiplier) {
    if (depth == 0) {
        return turnMultiplier*evaluation();
    }
    let maxScore = -1000000;
    for (var move of mvs) {
        state.enact(move);
        let nextMvs = state.legalMoves();
        let score = -1 * negamax(nextMvs,depth-1,max_depth,-1*turnMultiplier);
        if (score > maxScore) {
            maxScore = score;
            if (depth == max_depth) {
                nextMove = move;
            }
        }
        state.undo();
    }
    return maxScore;
}

function alpha_beta(mvs,depth,max_depth,alpha,beta,turnMultiplier) {
    if (depth == 0) {
        return turnMultiplier * evaluation();
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
            score = -1 * alpha_beta(nextMvs,depth-1,max_depth,-1*beta,-1*alpha,-1*turnMultiplier);
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