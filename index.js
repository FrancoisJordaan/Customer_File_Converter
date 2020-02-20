const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');

const inputFilePath = path.join(__dirname, 'ToConvert', 'BMOGAM_fundManagers.csv');
const outputFilePath = path.join(__dirname, 'Converted', 'converted-data.json');
const finalFilePath = path.join(__dirname, 'Converted', 'fundmanagersUpsert.json');

const convertCsvToObject = async (inputFilePath, outputFilePath) => {
	try {
		let stringObjectArray = await csv({delimiter: "|"}).fromFile(inputFilePath);

		fs.writeFile(outputFilePath, JSON.stringify(stringObjectArray, null, 2), (err) => {
			console.log('File converted!');
		})
	} catch(err) {
		console.error(err);
	}
}


const refineData = async (outputFilePath, finalFilePath) => {
	try {
		fs.readFile(outputFilePath, 'utf8', (err, data) => {
			let refinedData = JSON.parse(data);
			
			for (let key in refinedData) {
				if (refinedData.hasOwnProperty(key)) {
					delete refinedData[key]['Image'];
					refinedData[key]['code'] = refinedData[key]['Code'];
					delete refinedData[key]['Code'];
					refinedData[key]['name'] = refinedData[key]['Name'];
					delete refinedData[key]['Name'];
					refinedData[key]['biography'] = [];
					refinedData[key]['Related Entities'] = refinedData[key]['Related Entities'].replace(/\s/g, '');
					if(refinedData[key]['Related Entities'] == [""]){
						refinedData[key]['relatedEntities'] = [];
					} else{
						refinedData[key]['relatedEntities'] = refinedData[key]['Related Entities'].split(',');
					}
					delete refinedData[key]['Related Entities'];
					refinedData[key]['headshot'] = "";
					refinedData[key]['headshotContentType'] = "image/jpeg";
					refinedData[key]['extended'] = {'title': refinedData[key]['Title']};
					delete refinedData[key]['Title'];
				}
			}
	
			fs.writeFile(finalFilePath, JSON.stringify(refinedData, null, 2), (err) => {});

		})
	} catch(err) {
		console.error(err);
	}
	
}

const convertToJson = async (inputFilePath, outputFilePath, finalFilePath) => {
	await convertCsvToObject(inputFilePath, outputFilePath);
	await refineData(outputFilePath, finalFilePath);
}

convertToJson(inputFilePath, outputFilePath, finalFilePath);