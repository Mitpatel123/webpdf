const verifyToken = require("../validation/validationToken");
const multer = require('multer');

const upload = multer({ dest: './src/helpers/savepdf/upload' });

const {
  PDFMerge,
  pdfDownload,
  splitPdf,
  removePdfPage,
  organizePdf,
  convertPdfToJpg,
  exceltojson
} = require("../controllers/pdfmerge");

const { PDFValidation } = require("../validation/pdfmerge");

const allPDFrouting = (app) => {
  app.get('/download/:filename', pdfDownload);
  app.post('/merge/:id', upload.array('*', 10), verifyToken, PDFValidation, PDFMerge);
  app.post('/splitpdf/:id', upload.single('pdfFile'), splitPdf);
  app.post('/removepdf/:id', upload.single('pdfFile'), removePdfPage);
  app.post('/organizepdf/:id', upload.single('pdfFile'), organizePdf);
  app.post('/pdftojpg/:id', upload.single('pdfFile'), convertPdfToJpg);
  app.post('/exceltojson', upload.single('excel'), exceltojson);
};

module.exports = allPDFrouting;
