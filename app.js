//Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
let initialColors;

//Functions

//Generate Hex color
function generateHex(){
    /*const letters = '#123456789ABCDEF';
    let hash = '#';
    for( let i=0; i<6; i++){
        //Split the letters variable into an array format
        //Randomly select a cell that corresponds to a letter or number
        //Loop over 6 times to create a hex code
        hash += letters[Math.floor(Math.random() * 16)];
    }
    return hash;*/

    //instead we can use chroma.js
    const hexColors = chroma.random();
    return hexColors;
}

//Introduce random colors once we enter the page
function randomColors(){
    colorDivs.forEach((div, index) =>{
        //Select the first child of each div
        //This represents the Hex h2 with the hex value
        const hexText  = div.children[0];
        //Generate a random color
        const randomColor = generateHex();
        //Add generated hex to background and header
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
    });
}

randomColors();

let randomHex = generateHex();
