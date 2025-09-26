import { initialState, fromID } from './milestone_logic.js';
import { engine } from './milestone_ai.js';

export function asciiBoard(board) {
    let str = "";
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (Math.abs(i-j) == 4) {
                str += "\\ ";
            }
            else if (Math.abs(i-j) > 4) {
                str += "  ";
            }
            else {
                str += board[i][j] == -1 ? "B " : board[i][j] == 1 ? "W " : "- ";
            }
        }
        str += "\n";
    }
    return str;
}

export function clPlayLoop(visibleState=true, bHuman=false, wHuman=true, scoreMatrix1=scores, scoreMatrix2=scores, difficulty=3) {
    let state = initialState(bHuman,wHuman,difficulty);
    while (!state.gameOver()) {
        if (state.turn == -1) {
            if (state.bHuman) {
                console.log(asciiBoard(state.board));
                console.log("Black's turn");
                while (true) {
                    let id = prompt("Enter move: ");
                    if (id == null) {
                        break;
                    }
                    state.enact(fromID(id,state.board));
                }
            }
            else {
                if (visibleState) {
                    console.log(asciiBoard(state.board));
                }
                state.enact(engine(state,scoreMatrix1));
            }
        }
        else {
            if (state.wHuman) {
                console.log(asciiBoard(state.board));
                console.log("White's turn");
                while (true) {
                    let id = prompt("Enter move: ");
                    if (id == null) {
                        break;
                    }
                    state.enact(fromID(id,state.board));
                }
            }
            else {
                if (visibleState) {
                    console.log(asciiBoard(state.board));
                }
                state.enact(engine(state,scoreMatrix2));
            }
        }
    }
    if (state.winner() == -1) {
        console.log("Black wins");
    }
    else if (state.winner() == 1) {
        console.log("White wins");
    }
    return state.winner();
}
