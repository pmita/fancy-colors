//Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButtons = document.querySelectorAll('.adjust');
const lockButtons = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;

//Local storage object
let savedPalettes = []; //array of objects

//Event Listeners
generateButton.addEventListener('click', randomColors);

sliders.forEach( slider =>{
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach( (slider,index) =>{
    slider.addEventListener('change', ()=>{
        updateTextUI(index);
    });
});

currentHexes.forEach( hex =>{
    hex.addEventListener('click', ()=>{
        copyToClipBoard(hex);
    });
});

popup.addEventListener('transitionend', () =>{
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});

adjustButtons.forEach( (button, index) =>{
    button.addEventListener('click', () =>{
        openAdjustmentPanel(index);
    });
});

closeAdjustments.forEach( (button, index) =>{
    button.addEventListener('click', ()=>{
        closeAdjustmentPanel(index);
    });
});


//Functions
function generateHex(){
    //instead we can use chroma.js
    const hexColors = chroma.random();
    return hexColors;
}

//Introduce random colors once we enter the page
function randomColors(){
    //Dont define a constant array
    initialColors = [];

    colorDivs.forEach((div, index) =>{
        const hexText  = div.children[0]; //Select the inner header of the div
        const randomColor = generateHex(); //Generate a random color
        
        //Implementing a lock feature
        if(div.classList.contains('locked')){
            initialColors.push(hexText.innerText);
            return;
        } else{
            initialColors.push(chroma(randomColor).hex()); //Push each color to a new array
        }

        //Apply color to background and header
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        checkTextContrast(randomColor, hexText); //Check for contrast

        const color = chroma(randomColor); //Returns an object with our color hsl values

        //Grab all input sliders and 'deconstruct' their values
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0]; //Corresponds to hue slider input
        const brightness = sliders[1]; //Corresponds to brightness slider input
        const saturation = sliders[2]; //Corresponds to saturation slider input

        //Apply colors to the sliders as well
        colorizeSliders( color, hue, brightness, saturation);
    });

    resetInputs();

    //Check for contrast on buttons
    adjustButtons.forEach( (button, index) =>{
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButtons[index]);
    });

}

function checkTextContrast(color, element){
    const luminance = chroma(color).luminance(); //Grab the brightness of each color
    //Balance the contrast
    if (luminance > 0.5){
        element.style.color = "black";
    } else{
        element.style.color = "white";
    }
}

function colorizeSliders( color, hue, brightness, saturation){
    //Scale saturation based on our color
    const noSaturation = color.set('hsl.s', 0); // [min. )
    const fullSaturation = color.set('hsl.s', 1); // (,max]
    const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]); //[noSaturation, ..., ..., color, ..., ...,  fullSaturation]
    //Update the input specturm accordingly
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSaturation(0)}, ${scaleSaturation(1)})`;

    //Scale brightness based on how black/white our color gets
    const midBright = color.set('hsl.l', 0.5); // [black, ..., midpoint = color, ..., white]
    const scaleBrightness = chroma.scale(['black', midBright, 'white']);
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(0)}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;

    //Hue spectrum scales the same all the time
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75,75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`
}

function hslControls(e){
    //Find out which input we are sliding
    const index =
        e.target.getAttribute('data-hue') ||
        e.target.getAttribute('data-bright') ||
        e.target.getAttribute('data-saturation');

    //Grab all the inputson that sliders we are changing
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"');

    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2]

    const bgColor = initialColors[index];
    let color = chroma(bgColor)
     .set('hsl.s', saturation.value)
     .set('hsl.l', brightness.value)
     .set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;
    colorizeSliders( color, hue, brightness, saturation); //Colorize inputs
}

function updateTextUI(index){
    //Find the current color for div we are altering
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);

    //Once the user lets go of the input slider we are updating the color
    const textHex = activeDiv.querySelector('h2');
    textHex.innerText = color.hex();

    checkTextContrast(color, textHex); //Check contrast for new text and icons
    const icons = activeDiv.querySelectorAll('.controls button');
    for(icon of icons){
        checkTextContrast(color, icon);
    }
}

function resetInputs(){
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach( slider =>{
        console.log(slider.getAttribute("data-hue"));
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
          }

        if(slider.name === 'brightness'){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2]; //Passes in the hue
            slider.value = Math.floor(brightValue * 100) / 100;
        }

        if(slider.name === 'saturation'){
            const saturationColor = initialColors[slider.getAttribute('data-saturation')];
            const saturationValue = chroma(saturationColor).hsl()[1]; //Passes in the hue
            slider.value = Math.floor(saturationValue *100) / 100;
            console.log(saturationValue);
        }

    });
}

function copyToClipBoard(hex){
    const element = document.createElement('textarea');
    element.value = hex.innerText;
    document.body.append(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);

    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}

function openAdjustmentPanel(index){
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index){
    sliderContainers[index].classList.remove('active');
}

/*                Popup Section                */
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document. querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

function openPalette(e){
    const popup = saveContainer.children[0];
    console.log(popup);
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e){
    const popup = saveContainer.children[0];
    console.log(popup);
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e) {
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
      colors.push(hex.innerText);
    });
    //Generate number
    let paletteNr = savedPalettes.length;
    const paletteObj = {name: name, colors: colors, nr: paletteNr};
    savedPalettes.push(paletteObj);

    //Save to local storage
    savetoLocal(paletteObj);
    saveInput.value = '';

    //generate the palette for Library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach( smallColor =>{
        console.log(smallColor);
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = 'Select';

    //Append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palette') === null){
        localPalettes = [];
    } else{
        localPalettes = JSON.parse(localStorage.getItem('palette'));
    }

    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function openLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}



randomColors();
