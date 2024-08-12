import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle } from 'lucide-react';
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeOrderTypeFilter, setActiveOrderTypeFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, activeStatusFilter, activeOrderTypeFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/usersLists/users');
      setUsers(response.data.list || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let result = users;
    if (activeStatusFilter !== 'all') {
      result = result.filter(user => user.status === activeStatusFilter);
    }
    if (activeOrderTypeFilter !== 'all') {
      result = result.filter(user => getOrderType(user.order_type) === activeOrderTypeFilter.toLowerCase());
    }
    setFilteredUsers(result);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await axios.put(`/api/v1/usersLists/users/${id}/status`, { status: newStatus });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status. Please try again.');
    }
  };

  const updateOrderType = async (id, orderType) => {
    try {
      await axios.put(`/api/v1/usersLists/users/${id}/order-type`, { order_type: orderType });
      setUsers(users.map(user => 
        user._id === id ? { ...user, order_type: orderType } : user
      ));
    } catch (error) {
      console.error('Error updating order type:', error);
      setError('Failed to update order type. Please try again.');
    }
  };

  const getOrderType = (orderType) => {
    if (!orderType || orderType === "0") return "";
    return orderType.toLowerCase();
  };

  const redirectToWhatsApp = (phoneNumber) => {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  const TabButton = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        marginRight: '8px',
        backgroundColor: isActive ? '#007bff' : '#f0f0f0',
        color: isActive ? 'white' : 'black',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return (
        <div style={{ border: '1px solid red', padding: '10px', margin: '10px 0', color: 'red' }}>
          {error}
        </div>
      );
    }

    return (
      <>
        <h1>User List</h1>
        <div style={{ marginBottom: '20px' }}>
          <h3>Status Filter:</h3>
          <TabButton label="All" isActive={activeStatusFilter === 'all'} onClick={() => setActiveStatusFilter('all')} />
          <TabButton label="Active" isActive={activeStatusFilter === 'active'} onClick={() => setActiveStatusFilter('active')} />
          <TabButton label="Blocked" isActive={activeStatusFilter === 'blocked'} onClick={() => setActiveStatusFilter('blocked')} />
          <TabButton label="Pending" isActive={activeStatusFilter === 'pending'} onClick={() => setActiveStatusFilter('pending')} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Order Type Filter:</h3>
          <TabButton label="All" isActive={activeOrderTypeFilter === 'all'} onClick={() => setActiveOrderTypeFilter('all')} />
          <TabButton label="COD" isActive={activeOrderTypeFilter === 'COD'} onClick={() => setActiveOrderTypeFilter('COD')} />
          <TabButton label="Prepaid" isActive={activeOrderTypeFilter === 'Prepaid'} onClick={() => setActiveOrderTypeFilter('Prepaid')} />
          <TabButton label="Advance" isActive={activeOrderTypeFilter === 'Advance'} onClick={() => setActiveOrderTypeFilter('Advance')} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Phone</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Address</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Order Type</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {user.phone && (
                    <span>
                      {user.phone}
                      <MessageCircle
                        onClick={() => redirectToWhatsApp(user.phone)}
                        style={{ cursor: 'pointer', marginLeft: '5px', verticalAlign: 'middle' }}
                        size={18}
                        color="#25D366"
                      />
                    </span>
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {user.address || 'N/A'}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.status}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['COD', 'Prepaid', 'Advance'].map((type) => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`orderType-${user._id}`}
                          value={type}
                          checked={getOrderType(user.order_type) === type.toLowerCase()}
                          onChange={() => updateOrderType(user._id, type)}
                          style={{ 
                            appearance: 'none',
                            width: '16px',
                            height: '16px',
                            border: '2px solid #333',
                            borderRadius: '50%',
                            outline: 'none',
                            marginRight: '5px',
                            position: 'relative',
                          }}
                        />
                        <span 
                          style={{
                            position: 'absolute',
                            width: '10px',
                            height: '10px',
                            backgroundColor: getOrderType(user.order_type) === type.toLowerCase() ? '#333' : 'transparent',
                            borderRadius: '50%',
                            marginLeft: '3px',
                            marginTop: '3px',
                            pointerEvents: 'none',
                          }}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button
                    onClick={() => toggleStatus(user._id, user.status)}
                    style={{
                      padding: '5px 10px',
                      background: user.status === 'active' ? 'red' : 'green',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {user.status === 'active' ? 'Block' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </>
    );
  };

  return (
    <Layout title={"Dashboard - User List"}>
      <div className="container-fluid m-3 p-3 dashboard">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserList;