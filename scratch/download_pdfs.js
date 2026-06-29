const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = 'c:/Users/burla/Downloads/frontier/public/papers';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const targetFiles = [
  'ds_algorithms_2023.pdf',
  'dbms_mid1_2024.pdf',
  'machine_learning_2023.pdf',
  'computer_networks_supply_2022.pdf',
  'operating_systems_mid2_2023.pdf',
  'theory_of_computation_2023.pdf',
  'digital_signal_processing_2024.pdf',
  'compiler_design_mid1_2023.pdf',
  'artificial_intelligence_mid2_2023.pdf',
  'flat_supply_2022.pdf'
];

// We'll download JNTU R18 syllabus or W3C dummy pdf which is very small (~10KB)
const sourceUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const file = fs.createWriteStream(path.join(dir, targetFiles[0]));
https.get(sourceUrl, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log(`Downloaded reference PDF: ${targetFiles[0]}`);
    
    // Copy reference PDF to other names
    const sourcePath = path.join(dir, targetFiles[0]);
    for (let i = 1; i < targetFiles.length; i++) {
      fs.copyFileSync(sourcePath, path.join(dir, targetFiles[i]));
    }
    console.log('Copied all PDFs successfully.');
  });
}).on('error', (err) => {
  fs.unlink(path.join(dir, targetFiles[0]));
  console.error(`Error downloading PDF: ${err.message}`);
});
