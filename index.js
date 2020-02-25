const path = require('path');
const fs = require('fs');
const csv = require('csvtojson');
const image2base64 = require('image-to-base64');
const fileNames = (fs.readdirSync(path.join(__dirname, 'ToConvert')));

// Retrieving fund manager csv containing data to be uploaded
const fundManagerCsvfileName = fileNames.find(function (filename) {
	if (filename.match(/BMOGAM_fundManagers_/g)) {
		return filename;
	}
});

console.log('CSV file to be converted: ' + fundManagerCsvfileName);

const inputFilePath = path.join(__dirname, 'ToConvert', fundManagerCsvfileName);
const outputFilePath = path.join(__dirname, 'Converted', 'converted-data.json');
const finalFilePath = path.join(__dirname, 'Converted', 'fundManagersUpsert.json');
const imageInputPath = path.join(__dirname, 'ToConvert');

//converting fund manager csv to equivalent json
const convertCsvToObject = async () => {
	try {
		let stringObjectArray = await csv({ delimiter: "|" }).fromFile(inputFilePath);
		fs.writeFile(outputFilePath, JSON.stringify(stringObjectArray, null, 2), (err) => {
			console.log('input csv converted to equivalent json');
			refineData(0, stringObjectArray);
		})
	} catch (err) {
		console.error(err);
	}
}

//refining json data to expected payload for upsertFundManager Api call
const refineData = async (index, fundManagerArray) => {
	if (index < fundManagerArray.length) {
		fundManagerArray[index]['code'] = fundManagerArray[index]['Code'];
		fundManagerArray[index]['code'] = (fundManagerArray[index]['code']).replace(/[^a-zA-Z0-9-_]/g, "");
		delete fundManagerArray[index]['Code'];
		fundManagerArray[index]['name'] = fundManagerArray[index]['Name'];
		delete fundManagerArray[index]['Name'];
		fundManagerArray[index]['Related Entities'] = fundManagerArray[index]['Related Entities'].replace(/\s/g, '');
		if (fundManagerArray[index]['Related Entities'] == [""]) {
			fundManagerArray[index]['relatedEntities'] = [];
		} else {
			fundManagerArray[index]['relatedEntities'] = fundManagerArray[index]['Related Entities'].split(',');
		}
		delete fundManagerArray[index]['Related Entities'];
		fundManagerArray[index]['extended'] = { 'title': fundManagerArray[index]['Title'] };
		delete fundManagerArray[index]['Title'];
		//fundManagerArray[index]['biography'] = [];
		console.log('imageInputPath: ', fundManagerArray[index]['Image']);
		console.log('file exists? ' + fs.existsSync(path.join(imageInputPath, fundManagerArray[index]['Image'])));
		fundManagerArray[index]['headshotContentType'] = "image/jpeg";
		if (fundManagerArray[index]['Image'] && (fs.existsSync(path.join(imageInputPath, fundManagerArray[index]['Image'])))) {
			image2base64(path.join(imageInputPath, fundManagerArray[index]['Image']))
				.then(
					(response) => {
						fundManagerArray[index]['headshot'] = response;
						delete fundManagerArray[index]['Image'];
						index++
						refineData(index, fundManagerArray);
					}
				)
				.catch(
					(error) => {
						console.log('ERROR WHILE CONVERTING TO BASE64: ', error); //Exepection error....
					}
				)
		} else {
			delete fundManagerArray[index]['Image'];
			index++
			refineData(index, fundManagerArray);
		}
	} else {
		console.log('conversion to final json complete, writing to file: ' + finalFilePath);
		fs.writeFile(finalFilePath, JSON.stringify(fundManagerArray, null, 2), (err) => { });
	}
}

convertCsvToObject();
