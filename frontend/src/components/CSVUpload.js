import React from 'react';
import { Upload, message, Card } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { uploadCSV } from '../services/api';

const { Dragger } = Upload;

const CSVUpload = () => {
  const props = {
    name: 'file',
    multiple: false,
    action: async (file) => {
      try {
        await uploadCSV(file);
        message.success(`${file.name} file uploaded successfully.`);
      } catch (error) {
        message.error(`${file.name} file upload failed. Please check you CSV format`);
        message.error(`${error}`);
      }
    },
    accept: '.csv',
  };

  return (
    <Card title="Upload CSV" bordered={false} style={{ backgroundColor: '#1f1f1f' }}>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text" style={{ color: '#ffffff' }}>Click or drag CSV file to this area to upload</p>
        <p className="ant-upload-hint" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
          Support for a single CSV file upload. Strictly prohibit from uploading company data or other
          sensitive files. Please ensure the CSV format correct.
        </p>
      </Dragger>
    </Card>
  );
};

export default CSVUpload;