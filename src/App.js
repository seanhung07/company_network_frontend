import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SearchForm from './components/SearchForm';
import NetworkGraph from './components/NetworkGraph';
import CompanyModal from './components/CompanyModal';
import LoadingSpinner from './components/LoadingSpinner';

const App = () => {
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [mainCompany, setMainCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCompanyData = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/company`, {
        params: { query: searchQuery, search_by: searchBy }
      });
      const { mainCompany, companies } = response.data;
      setMainCompany(mainCompany);
      setCompanies(companies);
    } catch (error) {
      console.log(error)
      Swal.fire({
        icon: 'error',
        title: 'Error fetching data',
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchCompanyData(query);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Company Connections</h1>
      <SearchForm query={query} setQuery={setQuery} searchBy={searchBy} setSearchBy={setSearchBy} handleSubmit={handleSubmit} />
      {loading ? <LoadingSpinner /> : <NetworkGraph mainCompany={mainCompany} companies={companies} setSelectedCompany={setSelectedCompany} />}
      {selectedCompany && <CompanyModal selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany} />}
    </div>
  );
};

export default App;
