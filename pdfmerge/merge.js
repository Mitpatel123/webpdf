const fs = require('fs');
const PDFMerger = require('pdf-merger-js');
const { PDFDocument } = require('pdf-lib');

var merger = new PDFMerger();


const mergePdfs = async (filePaths, ) => {
  try {
    for (const filePath of filePaths) {
      await merger.add(filePath);
    }

    let d = new Date().getTime();
    await merger.save(`./public/${d}.pdf`);
    return `./public/${d}.pdf`;
  } catch (error) {
    console.error('Error while merging and saving PDF:', error);
    throw error;
  }
};

const countPages = async (pdfPath) => {
  try {
    const pdfBytes = await PDFDocument.load(fs.readFileSync(pdfPath));
    const pageCount = pdfBytes.getPageCount();
    // console.log('Page count:', pdfBytes);
    // console.log('Page count:', pageCount);
    return pageCount;
  } catch (error) { 
    console.error('Error while counting pages:', error);
    throw error;
  }
};

module.exports = { mergePdfs, countPages };