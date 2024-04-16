import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const reStartButton = document.querySelector(".game-text > button");

// Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

// variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

let gameover = false;

const movingItem = {
    type:"tree",
    direction:0,
    top:0,
    left:3,
};


init()
// function

function init(){
    gameover = false;
    tempMovingItem = { ...movingItem};
    for(let i = 0; i<GAME_ROWS;i++){
        prependNewLine();
    }
    generateNewBlock();
}

function prependNewLine(){
    const li = document.createElement("li");
    const ul = document.createElement("ul");
    for (let j = 0; j<GAME_COLS; j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix);
    }
    li.prepend(ul);
    playground.prepend(li);
}

function renderBlocks(moveType = ""){
    let possible = true;
    const {type, direction, top, left} = tempMovingItem;
    const arr = [];
    BLOCKS[type][direction].some(block=> {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        arr.push([x, y]);
        if (!isAvailable) {
            possible = false;
        }
    });
    if (possible){
        const movingBlocks = document.querySelectorAll(".moving");
        movingBlocks.forEach(moving=>{
            moving.classList.remove(type, "moving");
        });
        for (let i =0;i<4;i++){
            playground.childNodes[arr[i][1]].childNodes[0].childNodes[arr[i][0]].classList.add(type, "moving");
        }
        movingItem.left = left;
        movingItem.top = top;
        movingItem. direction = direction;
    }
    else {
        tempMovingItem = {...movingItem}
        if(moveType === 'retry'){
            clearInterval(downInterval);
            gameover = true;
            showGameOverText();
            return true;
        }
        setTimeout(()=>{
            renderBlocks('retry');
            if (moveType ==="top"){
                seizeBlock();
            }
        }, 0)
        //renderBlocks();
        return true;
    }

}

function showGameOverText(){
    gameText.style.display = "flex";
}

function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=>{
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch();
}

function checkMatch(){

    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if (!li.classList.contains("seized")){
                matched = false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerText = score;
        }
    })

    generateNewBlock();
}

function generateNewBlock(){

    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock('top', 1);
        
    }, duration)

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random()*blockArray.length);
    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem};
    renderBlocks();
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType, amount){
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDirection(){
    const direction = tempMovingItem.direction;
    direction === 3? tempMovingItem.direction = 0: tempMovingItem.direction += 1;
    renderBlocks();
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top", 1)
    }, 10)
}

// event handling
document.addEventListener("keyup", e=>{
    if(!gameover){
        switch (e.keyCode){
            case 38:
                changeDirection();
                break;
            default:
                break;
        }
    }
})
document.addEventListener("keydown", e=>{
    if(!gameover){
        switch (e.keyCode){
            case 39:
                moveBlock("left", 1);
                break;
            case 37:
                moveBlock("left", -1);
                break;
            case 40:
                moveBlock("top", 1);
                break;
            case 32:
                dropBlock();
                break;
            default:
                break;

        }
    }

})

reStartButton.addEventListener("click", ()=>{
    playground.innerHTML = "";
    gameText.style.display = "none";
    score = 0;
    scoreDisplay.innerText = score;
    init();
})