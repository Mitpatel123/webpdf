const PDFValidation = async (req, res, next) => {
    try {
        console.log('req', req.files[0].mimetype)
        // Check if a PDF file is uploaded
        if (!req.files || req.files.length === 0 || req.files[0].mimetype !== 'application/pdf' || req.files[1].mimetype !== 'application/pdf') {
            return res.status(400).send({ error: 'Please upload a PDF file.' });
        }

        // Apply validation stamp to the PDF file using a watermarking method
        const validatedPdfPath = await applyValidationStamp(req.files[0].path);
        
        // Sending the validated PDF file as a response
        res.sendFile(validatedPdfPath);
    } catch (error) {
        // res.status(500).send({ error: 'An error occurred while applying validation to the PDF.' });
        return next ();
    }
};


module.exports = { 
    PDFValidation
}