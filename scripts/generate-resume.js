const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create PDF document
const doc = new PDFDocument({ margin: 50 });

// Output file path
const outputPath = path.join(__dirname, '..', 'tests', 'assets', 'resumes', 'crm_resume_upload.pdf');

// Pipe to file
doc.pipe(fs.createWriteStream(outputPath));

// Add content
doc.fontSize(24).font('Helvetica-Bold').text('Auto Candidate', { underline: true });
doc.moveDown(0.5);

// Contact Information
doc.fontSize(10).font('Helvetica');
doc.text('Email: auto.candidate@example.com');
doc.text('Mobile Phone: 555-123-4567');
doc.text('Home Phone: 555-987-6543');
doc.text('Work Phone: 555-456-7890');
doc.text('Referral Source: Auto Referral - #abc123');
doc.moveDown(1.5);

// Professional Summary
doc.fontSize(14).font('Helvetica-Bold').text('Professional Summary');
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica')
  .text('Experienced professional with a proven track record of delivering high-quality results in fast-paced environments. Strong analytical and problem-solving skills with excellent communication abilities.', {
    align: 'justify'
  });
doc.moveDown(1);

// Work Experience
doc.fontSize(14).font('Helvetica-Bold').text('Work Experience');
doc.moveDown(0.3);

doc.fontSize(11).font('Helvetica-Bold').text('Senior Consultant - ABC Corporation');
doc.fontSize(10).font('Helvetica-Oblique').text('2020 - Present');
doc.moveDown(0.3);
doc.font('Helvetica');
doc.list([
  'Led cross-functional teams to deliver enterprise solutions',
  'Improved operational efficiency by 30% through process optimization',
  'Managed client relationships and ensured project delivery on time'
], { bulletRadius: 2 });
doc.moveDown(0.5);

doc.fontSize(11).font('Helvetica-Bold').text('Project Manager - XYZ Industries');
doc.fontSize(10).font('Helvetica-Oblique').text('2017 - 2020');
doc.moveDown(0.3);
doc.font('Helvetica');
doc.list([
  'Coordinated multiple concurrent projects with budgets exceeding $2M',
  'Implemented agile methodologies resulting in 25% faster delivery',
  'Mentored junior team members and conducted training sessions'
], { bulletRadius: 2 });
doc.moveDown(1);

// Education
doc.fontSize(14).font('Helvetica-Bold').text('Education');
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica');
doc.text('Master of Business Administration - University of Excellence (2017)');
doc.text('Bachelor of Science in Computer Science - Tech University (2015)');
doc.moveDown(1);

// Skills
doc.fontSize(14).font('Helvetica-Bold').text('Skills');
doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica');
doc.list([
  'Project Management & Leadership',
  'Business Analysis & Strategy',
  'Agile & Scrum Methodologies',
  'Data Analysis & Reporting',
  'Client Relationship Management'
], { bulletRadius: 2 });

// Finalize PDF
doc.end();

console.log(`Resume PDF generated at: ${outputPath}`);
