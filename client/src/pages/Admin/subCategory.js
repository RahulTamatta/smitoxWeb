import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import AdminMenu from "../../components/Layout/AdminMenu";
import { Button, Modal, Form, Table } from 'react-bootstrap';
import toast from "react-hot-toast";

const SubcategoryList = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [image, setImage] = useState(null);

  // Get all categories
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting categories");
    }
  };

  // Get all subcategories
  const getAllSubcategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/subcategory/get-subcategories");
      if (data?.success) {
        setSubcategories(data?.subcategories || []); // Changed from data?.subcategory to data?.subcategories
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting subcategories");
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCategories();
    getAllSubcategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
   

      const { data } = await axios.post("/api/v1/subcategory/create-subcategory",  name,image,parentCategoryId);
      if (data?.success) {
        toast.success(`${name} is created`);
        setShowModal(false);
        setName("");
        setParentCategoryId("");
        setImage(null);
        getAllSubcategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in creating subcategory");
    }
  };

  const handleDelete = async (pId) => {
    try {
      const { data } = await axios.delete(`/api/v1/subcategory/delete-subcategory/${pId}`);
      if (data.success) {
        toast.success(`Subcategory is deleted`);
        getAllSubcategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Layout title={"Dashboard - Subcategories"}>
      <div className="container-fluid m-3 p-3 dashboard">
        <div className="row">
          <div className="col-md-3">
            <AdminMenu />
          </div>
          <div className="col-md-9">
            <h1>Manage Subcategories</h1>
            <div className="d-flex justify-content-end mb-3">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Add Subcategory
              </Button>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : subcategories.length > 0 ? (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Parent Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subcategories.map((s) => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{categories.find(c => c._id === s.parentCategoryId)?.name || 'N/A'}</td>
                      <td>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(s._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No subcategories found.</p>
            )}
          </div>
        </div>
      </div>
  
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Subcategory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Subcategory Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Parent Category</Form.Label>
              <Form.Control
                as="select"
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
                required
              >
                <option value="">Select Parent Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subcategory Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Subcategory
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default SubcategoryList;