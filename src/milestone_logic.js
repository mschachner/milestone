// To begin with, some classes to contain the basic objects, moves and states.

class Move {
    sourcex;
    sourcey;
    targetx;
    targety;
    pieceMoved;
    pieceCaptured;
    moveID;

    constructor(i,j,k,l,board) {
        this.sourcex = i;
        this.sourcey = j;
        this.targetx = k;
        this.targety = l;
        this.pieceMoved = board[i][j];
        this.pieceCaptured = board[k][l];
        this.moveID = '' + i + j + k + l;
    }

    wins() {
        return (   (this.targetx == 0 && this.targety == 0)
                || (this.targetx == 6 && this.targety == 6));
    }

}

class GameState {
    board;
    turn;
    bHuman;
    wHuman;
    difficulty;
    isMenu;
    moveList = [];

    constructor(board, bHuman, wHuman,difficulty,menu) {
        this.board = board;
        this.turn = 1; // -1 for black, 1 for white  
        this.bHuman = bHuman;
        this.wHuman = wHuman;
        this.difficulty = difficulty;
        this.isMenu = menu;
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
        return this.legalMoves().filter(move => move.sourcex == i && move.sourcey == j)
                   .map(move=>[move.targetx,move.targety]);
    }

    enact(move) {
        this.board[move.targetx][move.targety] = this.board[move.sourcex][move.sourcey];
        this.board[move.sourcex][move.sourcey] = 0;
        this.turn = -this.turn;
        highlight = false;
        this.moveList.push(move);
    }

    undo() {
        if (this.moveList.length != 0) {
            let move = this.moveList.pop();
            this.board[move.sourcex][move.sourcey] = move.pieceMoved;
            this.board[move.targetx][move.targety] = move.pieceCaptured;
            this.turn = -this.turn;
        }
    }
}

// The initial board.

const initialBoard =[[-1,-1,-1,-1, 0, 0, 0],
                     [-1,-1,-1, 0, 0, 0, 0],
                     [-1,-1, 0, 0, 0, 0, 0],
                     [-1, 0, 0, 0, 0, 0, 1],
                     [ 0, 0, 0, 0, 0, 1, 1],
                     [ 0, 0, 0, 0, 1, 1, 1],
                     [ 0, 0, 0, 1, 1, 1, 1],
                    ];


function initialState(bH,wH,diff) {
    var arr = initialBoard.map(function(a) {
        return a.slice();
    })
    return new GameState(arr,bH,wH,diff,true);
}

export { initialState, Move };