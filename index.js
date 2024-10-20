const fs = require('fs');
const {parse} = require('csv-parse');
const { stringify } = require('csv-stringify');
const writableStream = fs.createWriteStream("./csvs/output.csv");


//first find the names of the files in the directory
const testFolder = './csvs/';
let fileNames = [];

fs.readdir(testFolder, (err, files) => {
  files.forEach((file) => {
    //ignore the output.csv file
    if(file.includes('output.csv')){
        
    }else{
        console.log(file);
        fileNames.push(file);
    }
  });
  console.log('Finished scanning files, found ' + fileNames.length + ' files');
  processFiles();
});


let filesScanned = 0;
let newFile = [];

function processFiles(){

    fs.createReadStream
    fileNames.forEach((file) => {
    console.log('Processing file: ' + file);
    let i = 0;
    let coordinateX;
    let coordinateY;
    
    fs.createReadStream(`./csvs/${file}`).pipe(parse({delimiter: ',', from_line: 2})).on('data', function (row) {
        
        if(i == 0){
            let totalCoordinates = row[1].split(' ');
            coordinateX = totalCoordinates[0];
            coordinateY = totalCoordinates[1];
            console.log("Found Coordinates" + coordinateX, coordinateY);
        }
        if(i==11 && filesScanned == 0){
            console.log('Adding Headers');
            let headRow = row;
            headRow.push('AreaNum1');
            headRow.push('AreaNum2');
            newFile.push(headRow);
        }
        if(i>11){
            let newRow = row;
            newRow.push(coordinateX);
            newRow.push(coordinateY);
            newFile.push(newRow);
        }
        i++;
        
    }).on('end', function () {
        console.log('Finished scanning file: ' + file + ' '+ filesScanned + '/'+ fileNames.length);
        filesScanned++;
        if(filesScanned == fileNames.length){
            console.log('Finished scanning all files');
            finalise();
        }
    });

    

});
}


function finalise() {
    console.log('Creating Output File');

    const stringifier = stringify({ header: false});
    newFile.forEach(row => {
        stringifier.write(row);
    });

    stringifier.pipe(writableStream);
    console.log("Finished Writing Output File");
    //console.log(newFile);
}



//takes files from the "files" folder, read them 

const tifFolder = './files/';
let tifs = [];

let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

fs.readdir(tifFolder, (err, files) => {
  files.forEach((file) => {
    tifs.push(file);

    //split the file name
    let newFile = file.split('_');
    let monthIndex = (newFile[1].split('.')[0]-1);
    let month = months[monthIndex % 12];
    let bandIndex = (Math.ceil((monthIndex + 1 ) / 12))

    console.log('Month: ' + month);
    console.log('Band: ' + bandIndex);

    let newFileName = `${month}_${bandIndex}.tif`;
    
    //create a new file in the outputBands folder with the new name
    fs.copyFile(`./files/${file}`, `./outputBands/${newFileName}`, (err) => {
        if (err) throw err;
        console.log('File was copied to destination folder');
    });
    });

});