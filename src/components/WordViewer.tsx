import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as mammoth from 'mammoth';

const WordViewer = ({ fileUrl }: { fileUrl: string }) => {
  const [docContent, setDocContent] = useState<string | null>(null);

  useEffect(() => {
    const loadDocx = async () => {
      try {
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const arrayBuffer = response.data;

        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocContent(result.value);
      } catch (error) {
        console.error('Error loading DOCX:', error);
      }
    };

    loadDocx();
  }, [fileUrl]);

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',  // Make the content scrollable
        padding: '1rem',   // Add padding to avoid the content being too close to the edges
        boxSizing: 'border-box',  // Ensure padding doesn't affect the width
      }}
      dangerouslySetInnerHTML={{ __html: docContent || '' }}
    />
  );
};

export default WordViewer;
