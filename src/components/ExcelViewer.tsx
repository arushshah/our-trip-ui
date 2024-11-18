import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ExcelViewer = ({ fileUrl }: { fileUrl: string }) => {
  const [excelContent, setExcelContent] = useState<string | null>(null);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const arrayBuffer = response.data;

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetNames = workbook.SheetNames;
        const sheet = workbook.Sheets[sheetNames[0]]; // Get the first sheet
        const htmlString = XLSX.utils.sheet_to_html(sheet); // Convert to HTML

        setExcelContent(htmlString);
      } catch (error) {
        console.error('Error loading Excel file:', error);
      }
    };

    loadExcel();
  }, [fileUrl]);

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto', // Enable scrolling if content overflows
        padding: '1rem', // Add padding to avoid tight edges
        boxSizing: 'border-box', // Ensure padding does not affect width
      }}
      dangerouslySetInnerHTML={{ __html: excelContent || '' }}
    />
  );
};

export default ExcelViewer;
