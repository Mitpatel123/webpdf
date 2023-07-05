const path = require('path');
const { mergePdfs } = require('../../pdfmerge/merge');
const {countPages} = require('../../pdfmerge/merge');
const multer = require('multer');
const pdfmerge = require('easy-pdf-merge');
const fs = require('fs');
const verifyToken = require("../validation/validationToken")
const userpdfSchema = require('../model/pdf')
const apiResponse = require('../common/index')
const { responseMessage } = require('../helpers/response');
const { componentsToColor } = require('pdf-lib');
const PDFLib = require('pdf-lib');
const { PDFDocument } = require('pdf-lib');
const mongoose = require('mongoose');
const userType = require('../common/enum');
const pdf2img = require('pdf2img');

const ExcelDataModel = require('../schema/excle')
const xlsx = require('xlsx');




const PDFMerge = async (req, res, next) => {
  console.log('verifyToken', verifyToken)
  try {
    const filePaths = req.files.map((file) => file.path); // Get an array of file paths
    console.log('filePaths', filePaths)
    const mergedPdfPath = await mergePdfs(filePaths);
    const pageCount = await countPages(mergedPdfPath);
    
    const parsedPath = path.parse(mergedPdfPath);
    const fileName = parsedPath.name;

    let productsId = req.params.id;
    console.log('productsId', productsId)

    const existingDocument = await userpdfSchema.findOne({ userid: productsId });

    if (existingDocument) {
      let counter = 1;
      let newPath = `${fileName}`;

      while (true) {
        const documentWithSamePath = await userpdfSchema.findOne({ path: newPath });

        if (!documentWithSamePath) {
          break;
        }

        counter++;
        newPath = `${fileName}_${counter}`;
      }

      const body = {
        userType: 'user', // Provide the user type value
        path: newPath, // Provide the new path value 
        userid: req.params.id, // Provide the user ID value
        actionofdocument:'mergepdf',

      };

      let bodyData = { 
        ...body, 
        isDelete: false, // Set delete flag to false
      };

      const newDocument = new userpdfSchema(bodyData);
      await newDocument.save();

      res.send({
        message: 'PDF merged successfully',
        pageCount,
        filePath: newPath,
      });
    } else {
      const body = {
        userType: 'user', // Provide the user type value
        path: fileName, // Provide the path value
        userid: req.params.id, // Provide the user ID value
        actionofdocument:'mergepdf',
      };

      let bodyData = { 
        ...body, 
        isDelete: false, // Set delete flag to false
        
      };

      const newDocument = new userpdfSchema(bodyData);




      await newDocument.save();

      res.send({
        message: 'PDF merged successfully',
        pageCount,
        filePath: fileName,
      });
    }
  } catch (error) {
    console.error('An error occurred while merging PDFs:', error);
    res.status(500).send({ error: 'An error occurred while merging PDFs.' });
  }
};


 

// API endpoint to download and redirect the merged PDF file
const pdfDownload = (req, res) => {
    try {
      const { filename } = req.params;
      console.log('req.params', req.params)
      const filePath = path.join(process.cwd(), 'public', `${filename}.pdf`);
  
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).send({ error: 'PDF file not found.' });
        return;
      }
  
      // Set the appropriate headers for the response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  
      // Stream the file to the response
      fs.createReadStream(filePath).pipe(res);
  

    } catch (error) {
      res.status(500).send({ error: 'An error occurred while downloading the PDF file.' });
    }
  };








  
 
  
  
  
  const splitPdf = async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).send({ error: 'No file uploaded.' });
        return;
      }
  console.log('req.key', req.headers.key)


      const productsId = req.params.id;
      const pdfPath = req.file.path;
  
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();
  
      const splitPaths = [];
      const d = new Date().getTime();
      const files = [];  
      const pageNumbersToSplit = req.headers.key; // Page numbers to split (sent by the client)


      
      for (let i = 0; i < pageCount; i++) {
        if (pageNumbersToSplit && !pageNumbersToSplit.includes(i + 1)) {
          continue; // Skip if the page number is not in the requested page numbers
        }
  
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(copiedPage);
  
        const splitFilename = `split_${i + 1}_${d}_${productsId}.pdf`;
        const splitPath = `./public/${splitFilename}`;
        const splitBytes = await newPdf.save();
  
        fs.writeFileSync(splitPath, splitBytes);
        splitPaths.push(splitFilename); // Store the filename in the splitPaths array
  
        const splitFilenameWithoutExtension = `split_${i + 1}_${d}_${productsId}`;
        files.push(splitFilenameWithoutExtension);
      }
      const documentData =  new userpdfSchema({
        userType: 'user',         
        path: files, 
        userid: req.params.id,
        actionofdocument: 'splitPDF',
      }); 

      console.log('documentData', documentData)
      await documentData.save();
  
      res.send({
        message: 'PDF split successfully',
        splitPaths,
      }); 
    } catch (error) {
      console.error('An error occurred while splitting the PDF:', error);
      res.status(500).send({ error: 'An error occurred while splitting the PDF.' });
    }
  };




 

  const removePdfPage = async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).send({ error: 'No file uploaded.' });
        return;
      }
  
      const pdfPath = req.file.path;
      const pageNumberToRemove = req.body.pageNumber.split(',').map(Number);
  
      console.log('pageNumberToRemove', pageNumberToRemove);
  
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pageCount = pdf.getPageCount();
  
      console.log('PDF page count:', pageCount);
      console.log('Page numbers to remove:', pageNumberToRemove);
  
      // Validate page numbers
      for (const pageNumber of pageNumberToRemove) {
        if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
          res.status(400).send({ error: 'Invalid page number.' });
          return;
        }
      }
  
      const newPdf = await PDFDocument.create();
      const pagesToKeep = [];
  
      for (let i = 0; i < pageCount; i++) {
        if (!pageNumberToRemove.includes(i + 1)) {
          const [copiedPage] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(copiedPage);
          pagesToKeep.push(i + 1);
        }
      }
  
      const timestamp = new Date().getTime();
      const newPdfPath = path.join(__dirname, 'savepdf', '../../.././public', `removepdf_${timestamp}.pdf`);
  
      const modifiedBytes = await newPdf.save();
      fs.writeFileSync(newPdfPath, modifiedBytes);
  
      console.log('New PDF path:', newPdfPath);
  
      // Save the file path in the database
      const documentData = new userpdfSchema({
        userType: 'user',
        path: newPdfPath,
        userid: req.params.id,
        actionofdocument: 'removePage',
      });
      await documentData.save();
  
      res.send({
        message: `PDF with pages ${pageNumberToRemove.join(', ')} removed successfully.`,
        pagesToKeep,
        newPdfPath,
      });
    } catch (error) {
      console.error('An error occurred while removing the PDF page:', error);
      res.status(500).send({ error: 'An error occurred while removing the PDF page.' });
    }
  };
  
  




  const organizePdf = async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).send({ error: 'No file uploaded.' });
        return;
      }
  
      const pdfPath = req.file.path;
      const timestamp = new Date().getTime();
  
      // Read the PDF file
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdf = await PDFDocument.load(pdfBytes);
  
      // Get the page count
      const pageCount = pdf.getPageCount();
  
      // Get the page numbers from the request body
      const pageNumbers = req.body.pageNumbers;
  
      // Validate page numbers
      if (!pageNumbers || typeof pageNumbers !== 'string') {
        res.status(400).send({ error: 'Invalid page numbers.' });
        return;
      }
  
      const pageNumbersArray = pageNumbers.split(',').map(Number);

      for (const pageNumber of pageNumbersArray) {
        if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
          res.status(400).send({ error: 'Invalid page number.' });
          return;
        }
      }
  
      // Create a new PDF
      const newPdf = await PDFDocument.create();
  
      // Add the pages in the specified order
      for (const pageNumber of pageNumbersArray) {
        const [page] = await newPdf.copyPages(pdf, [pageNumber - 1]);
        newPdf.addPage(page);
      }
  
      // Save the new PDF to a file
      const newPdfBytes = await newPdf.save();
      const newPdfFilePath = path.join(__dirname, '..', '.././public', `organized_${timestamp}.pdf`);
      fs.writeFileSync(newPdfFilePath, newPdfBytes);
  
      console.log('PDF pages organized successfully.');
      console.log('New PDF file path:', newPdfFilePath);
  
      // Send the response
      res.send({
        message: 'PDF pages organized successfully.',
        newPdfPath: newPdfFilePath,
        pageCount
      });
    } catch (error) {
      console.error('An error occurred while organizing the PDF pages:', error);
      res.status(500).send({ error: 'An error occurred while organizing the PDF pages.' });
    }
  };
  
  
  

  // async function convertPdfToJpg(req, res) {
  //   const pdfPath = req.file.path; // Get the path of the uploaded PDF file 
  //   console.log('req.file.path', req.file.path)
  //   const outputDir = './output'; // Specify the output directory for the JPG images
  //   const options = {
  //     outputdir: outputDir,
  //     format: 'jpg',
  //     width: 1200,
  //     height: 1800,
  //     quality: 100,
  //   };
  
  //   try { 
    
  

  //     const result = await new Promise((resolve, reject) => {
  //       pdf2img.convert(pdfPath, options, (err, result) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           resolve(result);
  //         }
  //       });
  //     });
      
   
  
  //     const jpgImages = result.map((image) => image.path);
  
  //     // Clean up the temporary files
  //     fs.readdirSync(outputDir).forEach((file) => {
  //       fs.unlinkSync(`${outputDir}/${file}`); 
  //     });
   
  //     res.status(200).json({ jpgImages });
  //   } catch (error) {
  //     console.error('An error occurred while converting PDF to JPG:', error);
  //     res.status(500).json({ error: 'Error converting PDF to JPG' });
  //   }
  // }
  
 

  


  var PDFImage = require("pdf-image").PDFImage;

  
const convertPdfToJpg = async (req, res) => {
  const pdfPath = req.file.path; // Get the path of the uploaded PDF file
  console.log('req.body.files', req.body.files)
  const d = new Date().getTime();

  const pdfImage = new PDFImage(pdfPath);

  console.log('object', object)

  try {
    const imagePath = await pdfImage.convertPage(0); // Convert the first page of the PDF to an image

    const imageName = `_${d}_slide-0.png`; // Specify the image file name with a timestamp prefix
    const imageFullPath = path.join(__dirname, '..', 'public', imageName); // Specify the full image file path

    if (fs.existsSync(imagePath)) {
      // Image file exists
      fs.copyFileSync(imagePath, imageFullPath); // Copy the image file to the public folder

      res.status(200).json({ imagePath: imageName });
    } else {
      // Image file does not exist
      res.status(500).json({ error: 'Error converting PDF to image' });
    }
  } catch (error) {
    // Error occurred while converting PDF to image
    console.error('An error occurred while converting PDF to image:', error);
    res.status(500).json({ error: 'Error converting PDF to image' });
  }
};
  




// const exceltojson = async (req, res) => {
//   try {
//     if (!req.file) {
//       res.status(400).send({ error: 'No file uploaded.' });
//       return;
//     }

//     const excelPath = req.file.path;

//     // Load the Excel file
//     const workbook = xlsx.readFile(excelPath);

//     // Choose the sheet to convert to JSON (e.g., the first sheet)
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];

//     // Convert the sheet to JSON
//     const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

//     // Create an array to store the converted data
//     const convertedData = [];

//     // Loop through the JSON data and convert it to the desired format
//     for (let i = 1; i < jsonData.length; i++) {
//       const row = jsonData[i];
      
//       // Create an object from the row data based on your schema
//       const dataObject = {
//         name: row[0],
//         age: row[1],
//         email: row[2],
//         // Add more fields as needed
//       };

//       convertedData.push(dataObject);
//     }

//     // Save the converted data to the database 
//     await ExcelDataModel.insertMany(convertedData);

//     res.status(200).send({ message: 'Excel file converted to JSON and saved to database.' });
//   } catch (error) {
//     console.error('An error occurred while converting Excel to JSON:', error);
//     res.status(500).send({ error: 'An error occurred while converting Excel to JSON.' });
//   }
// };
   
  
const exceltojson = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send({ error: 'No file uploaded.' });
      return;
    }

    const excelPath = req.file.path;

    // Load the Excel file
    const workbook = xlsx.readFile(excelPath);
    console.log('workbok', workbook)

    // Choose the sheet to convert to JSON (e.g., the first sheet)
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Create an array to store the converted data
    const convertedData = [];

    // Loop through the JSON data and convert it to the desired format
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // Create an object from the row data based on your desired format
      const dataObject = {
        count : row[0],
        FirstName: row[1],
        LastName: row[2],
        Gender: row[3],
        Country : row[4],
        Age: row[5],
        Date: row[6],
        Id: row[7],
        // Add more fields as needed
      };

      convertedData.push(dataObject);
    }

    // Get the MongoDB collection object
    const collection = mongoose.connection.collection('excel');

    // Save the converted data to the collection
    await collection.insertMany(convertedData);

    res.status(200).send({ message: 'Excel file converted to JSON and saved to the database.' });
  } catch (error) {
    console.error('An error occurred while converting Excel to JSON:', error);
    res.status(500).send({ error: 'An error occurred while converting Excel to JSON.' });
  }
};


  module.exports = { PDFMerge, pdfDownload, splitPdf, removePdfPage, organizePdf, convertPdfToJpg,exceltojson };
