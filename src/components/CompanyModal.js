import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const CompanyModal = ({ selectedCompany, setSelectedCompany }) => {
  return (
    <Modal show={!!selectedCompany} onHide={() => setSelectedCompany(null)}>
      <Modal.Header closeButton>
        <Modal.Title>{selectedCompany?.Company_Name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Business Accounting Number: {selectedCompany?.Business_Accounting_NO}</p>
        <h5>Additional Data:</h5>
        <ul>
          {selectedCompany?.additional_data.map((data, index) => (
            <li key={index}>
              {data.Person_Position_Name} - {data.Person_Name} ({data.Juristic_Person_Name}) - Shares: {data.Person_Shareholding}
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setSelectedCompany(null)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompanyModal;
