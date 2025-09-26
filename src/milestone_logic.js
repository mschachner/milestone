// To begin with, some classes to contain the basic objects, moves and states.

export class Move {
    source;
    target;
    pieceMoved;
    pieceCaptured;
    moveID;

    constructor(i,j,k,l,board) {
        this.source = [i,j];
        this.target = [k,l];
        this.pieceMoved = board[i][j];
        this.pieceCaptured = board[k][l];
        this.moveID = '' + i + j + k + l;
    }

    wins() {
        return (   (this.target[0] == 0 && this.target[1] == 0)
                || (this.target[0] == 6 && this.target[1] == 6));
    }

}

export class GameState {
    board;
    turn;
    bHuman;
    wHuman;
    difficulty;
    isMenu;
    isHighlight;
    hhex;
    quat;
    moveList = [];

    constructor(board, bHuman, wHuman,difficulty,menu) {
        this.board = board;
        this.turn = 1; // -1 for black, 1 for white  
        this.bHuman = bHuman;
        this.wHuman = wHuman;
        this.difficulty = difficulty;
        this.isMenu = menu;
        this.isHighlight = false;
        this.hhex = [0,0];
        this.quat = false;
        this.moveList = [];
    }

    pieceArrays() {
        let arrs = [[],[]];
        for (let i=0;i<7;i++) {
            for (let j=0;j<7;j++) {
                if (this.board[i][j] == -1) {
                    arrs[0].push([i,j]);
                }
                else if (this.board[i][j] == 1) {
                    arrs[1].push([i,j]);
                }
            }
        }
        return arrs;
    }

    winner() {
        // -1 for black, 1 for white, 0 for neither

        if (this.board[0][0] == 1) {
            return 1;
        }
        else if (this.board[6][6] == -1) {
            return -1;
        }
        else if (this.legalMoves().length == 0) {
            return (-this.turn);
        }
        else {
            return 0;
        }
    }

    gameOver() {
        return !(this.winner() == 0);
    }

    legalMoves() {
        let moves = [];
        if (this.board[0][0] == 1 || this.board[6][6] == -1) {
            return moves;
        }
        if (this.turn == -1) {
            for (var [x,y] of this.pieceArrays()[0]) {
                if (x != 6 && this.board[x+1][y] == 0) {
                    moves.push(new Move(x,y,x+1,y,this.board));
                }
                if (y != 6 && this.board[x][y+1] == 0) {
                    moves.push(new Move(x,y,x,y+1,this.board));
                }
                if (x != 6 && y != 6 && this.board[x+1][y+1] != -1) {
                    moves.push(new Move(x,y,x+1,y+1,this.board));
                }
            }
        }
        else {
            for (var [x,y] of this.pieceArrays()[1]) {
                if (x != 0 && this.board[x-1][y] == 0) {
                    moves.push(new Move(x,y,x-1,y,this.board));
                }
                if (y != 0 && this.board[x][y-1] == 0) {
                    moves.push(new Move(x,y,x,y-1,this.board));
                }
                if (x != 0 && y != 0 && this.board[x-1][y-1] != 1) {
                    moves.push(new Move(x,y,x-1,y-1,this.board));
                }
            }
        }
        return moves;
    }

    legalTargets([i,j]) {
        return this.legalMoves().filter(move => move.source[0] == i && move.source[1] == j)
                   .map(move=>[move.target[0],move.target[1]]);
    }

    enact(move) {
        this.board[move.target[0]][move.target[1]] = this.board[move.source[0]][move.source[1]];
        this.board[move.source[0]][move.source[1]] = 0;
        this.turn = -this.turn;
        this.isHighlight = false;
        this.moveList.push(move);
    }

    undo() {
        if (this.moveList.length != 0) {
            let move = this.moveList.pop();
            this.board[move.source[0]][move.source[1]] = move.pieceMoved;
            this.board[move.target[0]][move.target[1]] = move.pieceCaptured;
            this.turn = -this.turn;
            this.isHighlight = false;
        }
    }
}

export function fromID(id, board) {
    return new Move(parseInt(id[0]),parseInt(id[1]),parseInt(id[2]),parseInt(id[3]),board);
}

// The initial board.

export const initialBoard =[[-1,-1,-1,-1, 0, 0, 0],
                            [-1,-1,-1, 0, 0, 0, 0],
                            [-1,-1, 0, 0, 0, 0, 0],
                            [-1, 0, 0, 0, 0, 0, 1],
                            [ 0, 0, 0, 0, 0, 1, 1],
                            [ 0, 0, 0, 0, 1, 1, 1],
                            [ 0, 0, 0, 1, 1, 1, 1],
                           ];


export function initialState(bH,wH,diff) {
    var arr = initialBoard.map(function(a) {
        return a.slice();
    })
    return new GameState(arr,bH,wH,diff,true);
}
