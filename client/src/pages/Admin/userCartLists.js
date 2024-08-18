import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, Edit } from 'lucide-react';
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeOrderTypeFilter, setActiveOrderTypeFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/v1/usersLists/users/${editingUser._id}`, editingUser);
      fetchUsers();
      closeEditModal();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
    }
  };

  const TabButton = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`mr-2 px-4 py-2 rounded ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
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
        <div className="border border-red-500 p-4 m-4 text-red-500">
          {error}
        </div>
      );
    }

    return (
      <>
        <h1 className="text-2xl font-bold mb-4">User List</h1>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Status Filter:</h3>
          <div>
            <TabButton label="All" isActive={activeStatusFilter === 'all'} onClick={() => setActiveStatusFilter('all')} />
            <TabButton label="Active" isActive={activeStatusFilter === 'active'} onClick={() => setActiveStatusFilter('active')} />
            <TabButton label="Blocked" isActive={activeStatusFilter === 'blocked'} onClick={() => setActiveStatusFilter('blocked')} />
            <TabButton label="Pending" isActive={activeStatusFilter === 'pending'} onClick={() => setActiveStatusFilter('pending')} />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Order Type Filter:</h3>
          <div>
            <TabButton label="All" isActive={activeOrderTypeFilter === 'all'} onClick={() => setActiveOrderTypeFilter('all')} />
            <TabButton label="COD" isActive={activeOrderTypeFilter === 'COD'} onClick={() => setActiveOrderTypeFilter('COD')} />
            <TabButton label="Prepaid" isActive={activeOrderTypeFilter === 'Prepaid'} onClick={() => setActiveOrderTypeFilter('Prepaid')} />
            <TabButton label="Advance" isActive={activeOrderTypeFilter === 'Advance'} onClick={() => setActiveOrderTypeFilter('Advance')} />
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Address</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Order Type</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">
                  {user.phone && (
                    <span className="flex items-center">
                      {user.phone}
                      <MessageCircle
                        onClick={() => redirectToWhatsApp(user.phone)}
                        className="cursor-pointer ml-2"
                        size={18}
                        color="#25D366"
                      />
                    </span>
                  )}
                </td>
                <td className="border p-2">
                  {user.address || 'N/A'}
                </td>
                <td className="border p-2">{user.status}</td>
                <td className="border p-2">
                  <div className="flex gap-2">
                    {['COD', 'Prepaid', 'Advance'].map((type) => (
                      <label key={type} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`orderType-${user._id}`}
                          value={type}
                          checked={getOrderType(user.order_type) === type.toLowerCase()}
                          onChange={() => updateOrderType(user._id, type)}
                          className="mr-1"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => toggleStatus(user._id, user.status)}
                    className={`mr-2 px-3 py-1 rounded ${user.status === 'active' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                  >
                    {user.status === 'active' ? 'Block' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="px-3 py-1 rounded bg-blue-500 text-white"
                  >
                    <Edit size={16} className="inline mr-1" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Edit User</h2>
              <form onSubmit={handleEditUser}>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-1">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="block mb-1">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="address" className="block mb-1">Address</label>
                  <input
                    id="address"
                    type="text"
                    value={editingUser.address}
                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={closeEditModal} className="mr-2 px-4 py-2 rounded bg-gray-300">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-500 text-white">Save changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
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