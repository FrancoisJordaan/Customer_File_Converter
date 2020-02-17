const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');

const convertCsvToObject = async () => {
	try {
		const inputFilePath = path.join(__dirname, 'ToConvert', 'BMOGAM_fundManagers.csv');
		const outputFilePath = path.join(__dirname, 'Converted', 'converted-data.json');
		let stringObjectArray = await csv({delimiter: "|"}).fromFile(inputFilePath);

		fs.writeFile(outputFilePath, JSON.stringify(stringObjectArray, null, 2), (err) => {
			if (err) throw err;
			console.log('File converted!');
		})
	} catch(err) {
		console.error(err);
	}
}

const refineData = async () => {
	try {
		const outputFilePath = path.join(__dirname, 'Converted', 'converted-data.json');
		const finalFilePath = path.join(__dirname, 'Converted', 'fundmanagersUpsert.json');
		fs.readFile(outputFilePath, 'utf8', (err, data) => {
		// if (err) throw err;
			let refinedData = JSON.parse(data);
			
			for (let key in refinedData) {
				if (refinedData.hasOwnProperty(key)) {
					delete refinedData[key]['Image'];
					refinedData[key]['code'] = refinedData[key]['Code'];
					delete refinedData[key]['Code'];
					refinedData[key]['name'] = refinedData[key]['Name'];
					delete refinedData[key]['Name'];
					refinedData[key]['biography'] = [];
					refinedData[key]['relatedEntities'] = refinedData[key]['Related Entities'].split(',');
					delete refinedData[key]['Related Entities'];
					refinedData[key]['headshot'] = "";
					refinedData[key]['headshotContentType'] = "image/jpeg";
					refinedData[key]['extended'] = {'title': refinedData[key]['Title']};
					delete refinedData[key]['Title'];
				}
			}
	
			fs.writeFile(finalFilePath, JSON.stringify(refinedData, null, 2), (err) => {
				if (err) throw err;
			});

		})
	} catch(err) {
		console.error(err);
	}
	
}

const convertToJson = async () => {
	await convertCsvToObject();
	await refineData();
}

convertToJson();