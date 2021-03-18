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

        //Check for contrast
        checkTextContrast(randomColor, hexText);

        //Initialize Color sliders
        const color = chroma(randomColor);
        //Grab all input slider per div
        const sliders = div.querySelectorAll('.sliders input');
        console.log(sliders);
        //We know what each index corresponds to
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders( color, hue, brightness, saturation);
    });
}

function checkTextContrast(color, text){
    //Find the lumosity for each color
    const luminance = chroma(color).luminance();
    if (luminance > 0.5){
        text.style.color = "black";
    } else{
        text.style.color = "white";
    }
}

function colorizeSliders( color, hue, brightness, saturation){
    //Scale saturation
    const noSaturation = color.set('hsl.s', 0); //We can desaturate the selected color
    const fullSaturation = color.set('hsl.s', 1); //We can also oversature the selected color
    //Create a spectrum of [noSaturation, fullSaturation] with color being the midpoint
    const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]);
    //Update the input specturm accordingly
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSaturation(0)}, ${scaleSaturation(1)})`;

    //We do the same with brightness
    //However brighness we only need the midpoint set
    //Since the edge are either white or black
    const midBright = color.set('hsl.l', 0.5);
    const scaleBrightness = chroma.scale(['black', midBright, 'white']);
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(0)}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;

    //Hue sliders are alwayrs the same so no need for chroma
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75,75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`
}



randomColors();
