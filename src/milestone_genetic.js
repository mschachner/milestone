import { initialState } from './milestone_logic.js';
import { shuffle, engine, scores_allZero } from './milestone_ai.js';
import { asciiBoard } from './milestone_ascii.js';
import util from 'util';

export class Critter {
    evalMatrix;
    constructor(evalMatrix) {
        this.evalMatrix = evalMatrix;
    }
    
    toString() {
        // horizontal line above and below.
        // Each entry looks like "+/-XX.YYY" including leading and trailing zeros
        let hline = "-".repeat(50) + '\n';
        let body = "";
        for (let row of this.evalMatrix) {
            let rowString = "";
            for (let entry of row) {
                if (entry >= 0) {   
                    rowString += "+" + entry.toFixed(3).padStart(6, '0').padEnd(6, '0') + " ";
                }
                else {
                    rowString += "-" + (-entry).toFixed(3).padStart(6, '0').padEnd(5, '0') + " ";
                }
            }
            body += rowString + '\n';
        }
        return hline + body + hline;
    }

    [util.inspect.custom]() {        
        return this.toString();
    }
    
    bud(mu) { // mu is the mutation rate
        let child = new Critter(this.evalMatrix.map(row => row.slice()));
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                let mutation = mu * (2 * Math.random() - 1);
                child.evalMatrix[i][j] += mutation;
            }
        }
        return child;
    }
}


export class Generation {
    population;
    size;
    constructor(size, evalMatrix) {
        this.population = new Array(size);
        this.size = size;
        for (let i = 0; i < size; i++) {
            this.population[i] = new Critter(evalMatrix.map(row => row.slice()));
        }
    }
    

    evolve(mu,nGenerations) {
        for (let g = 0; g < nGenerations; g++) {
            console.log("Running generation " + g);
            let children = new Array(this.size);
            let nextGen = new Generation(this.size, scores_allZero);
            for (let i = 0; i < this.size; i++) {
                children[i] = this.population[i].bud(mu);
            }
            shuffle(children);
            for (let i = 0; i < this.size; i++) {
                let victor = faceOff(false, this.population[i], children[i], 3);
                nextGen.population[i] = victor;
            }
            this.population = nextGen.population;
        }
    }

    sample(n) {
        let sample = new Array(n);
        for (let i = 0; i < n; i++) {
            sample[i] = this.population[Math.floor(Math.random() * this.size)];
        }
        return sample;
    }
}

export function faceOff(verbose=false, critter1, critter2, difficulty, nGames=1) {
    let state = null;
    let move = null;
    let score = 0;
    for (let i = 0; i < nGames; i++) {
        if (verbose) {
            console.log("Game " + (i+1));
        }
        state = initialState(false, false, difficulty);
        if (verbose) {
            console.log(asciiBoard(state.board));
        }
        while (!state.gameOver()) {
            if (state.turn == -1) {
                move = engine(state,critter1);
                if (verbose) {
                    console.log("Black's move: " + move.moveID);
                }
                state.enact(move);
            }
            else {
                move = engine(state,critter2);
                if (verbose) {
                    console.log("White's move: " + move.moveID);
                }
                state.enact(move);
            }
            if (verbose) {
                console.log(asciiBoard(state.board));
            }
        }
        if (state.winner() == -1) {
            score -= 1;
        }
        else {
            score += 1;
        }
    }
    
    if (score < 0) {
        if (verbose) {
            if (nGames > 1) {
                console.log("Score: " + score);
            }
            console.log("Black wins");
        }
        return critter1;
    }
    else {
        if (verbose) {
            if (nGames > 1) {
                console.log("Score: " + score);
            }
            console.log("White wins");
        }
        return critter2;
    }
}

let eval0 = scores_allZero;

let eval500 = [[+22.384, +8.433, +0.778, -1.479, +1.163, +5.158, -10.034],
    [+9.353, +18.268, +4.214, +2.302, -8.647, +1.361, -9.064],
    [+1.400, +8.628, +10.545, +5.271, +5.991, -1.514, +3.908],
    [-4.029, -4.614, +9.168, +6.973, +4.429, +2.799, -1.332],
    [+1.902, -0.827, -1.590, +2.124, +11.205, -4.642, +0.527],
    [-11.945, -2.834, +1.129, +9.112, +2.604, +12.183, +6.630],
    [+10.737, +1.850, +7.147, -3.278, +4.812, +1.105, -2.672]] 

let eval1000 = [[+33.411, +13.227, -22.966, +4.846, -3.150, +6.511, -13.241],
    [+12.508, +19.406, +15.700, +12.030, -5.569, +8.765, -13.468],
    [+5.356, +9.027, +17.597, +10.362, +11.467, +2.048, +4.785],
    [-2.921, +0.462, +14.722, +11.988, +16.230, +17.573, -15.695],
    [+2.007, -5.099, +9.363, +14.349, +11.853, +13.589, +10.822],
    [-6.264, +3.994, +3.948, +7.745, +8.324, +22.758, +9.031],
    [+13.247, -2.296, +6.424, -5.751, +1.726, -1.613, +0.634]]

let eval2500 = [[+47.814, +1.508, +6.714, +5.844, +5.839, +16.390, -14.889],
                [+18.079, +18.988, +7.273, +14.948, +7.424, +9.248, -2.227],
                [+1.297, +15.730, +19.942, +12.120, +16.769, +5.708, +2.401],
                [+0.067, +8.219, +17.281, +23.264, +18.441, +22.442, +8.653],
                [+3.886, +0.590, +4.334, +16.319, +26.612, +25.464, +20.052],
                [-15.528, +8.379, +11.457, +14.825, +23.379, +43.553, +4.398],
                [+0.227, +9.984, +4.762, +9.559, +5.546, -14.759, -6.292]]

export function main() {
    let gen = new Generation(10, eval2500);
    gen.evolve(1, 2500);
    console.log(gen);
}

main();