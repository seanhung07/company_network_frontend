import React from 'react';
import { Form, Button } from 'react-bootstrap';

const SearchForm = ({ query, setQuery, searchBy, setSearchBy, handleSubmit }) => {
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="searchBy">
        <Form.Label>Search by:</Form.Label>
        <Form.Control as="select" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
          <option value="name">Company Name</option>
          <option value="ban">Business Accounting Number</option>
          <option value="responsible_name">Responsible Name</option>
        </Form.Control>
      </Form.Group>
      <Form.Group controlId="query">
        <Form.Label>Query:</Form.Label>
        <Form.Control
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-3">
        Fetch Data
      </Button>
    </Form>
  );
};

export default SearchForm;
