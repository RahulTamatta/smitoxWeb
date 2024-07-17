// import React, { useState, useEffect } from 'react';
// import { Table, Button, Modal, Form, Nav, Spinner, Alert } from 'react-bootstrap';
// import axios from 'axios';
// import moment from 'moment';
// import { message } from 'antd';
// import AdminMenu from "../../components/Layout/AdminMenu";
// import Layout from "../../components/Layout/Layout";
// import { useAuth } from "../../context/auth";
// import { useSearch } from "../../context/search";

// const AdminOrders = () => {
//   const [status] = useState([
//     "Not Process", "Processing", "Shipped", "Delivered", "Cancelled"
//   ]);
//   const [orders, setOrders] = useState([]);
//   const [auth] = useAuth();
//   const [show, setShow] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderType, setOrderType] = useState('all-orders');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showSearch, setShowSearch] = useState(false);
//   const [values, setValues] = useSearch();

//   const getOrders = async (type = 'all') => {
//     try {
//       setLoading(true);
//       setError(null);
//       const { data } = await axios.get(`/api/v1/auth/all-orders`, {
//         params: { status: type }
//       });
//       setOrders(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.log(error);
//       setError("Error fetching orders. Please try again.");
//       message.error("Error fetching orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (auth?.token) getOrders(orderType);
//   }, [auth?.token, orderType]);

//   const handleStatusChange = async (orderId, value) => {
//     try {
//       await axios.put(`/api/v1/auth/order-status/${orderId}`, {
//         status: value,
//       });
//       getOrders(orderType);
//       message.success("Order status updated successfully");
//     } catch (error) {
//       console.log(error);
//       message.error("Error updating order status");
//     }
//   };

//   const handleShow = (order) => {
//     setSelectedOrder(order);
//     setShow(true);
//   };

//   const handleClose = () => {
//     setShow(false);
//     setShowSearch(false);
//     setValues({ ...values, keyword: '', results: [] });
//   };

//   const handleSave = async () => {
//     try {
//       await axios.put(`/api/v1/auth/update-order/${selectedOrder._id}`, selectedOrder);
//       setShow(false);
//       getOrders(orderType);
//       message.success("Order updated successfully");
//     } catch (error) {
//       console.log(error);
//       message.error("Error updating order");
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setSelectedOrder((prevOrder) => ({
//       ...prevOrder,
//       [field]: field === 'status' || field === 'payment' ? value : Number(value),
//     }));
//   };

//   const handleProductChange = (index, field, value) => {
//     setSelectedOrder((prevOrder) => {
//       const updatedProducts = [...prevOrder.products];
//       updatedProducts[index] = {
//         ...updatedProducts[index],
//         [field]: Number(value),
//       };
//       return { ...prevOrder, products: updatedProducts };
//     });
//   };

//   const calculateTotals = () => {
//     if (!selectedOrder || !selectedOrder.products) return { subtotal: 0, gst: 0, total: 0 };

//     const subtotal = selectedOrder.products.reduce(
//       (acc, product) => acc + Number(product.price) * Number(product.quantity),
//       0
//     );
//     const gst = subtotal * 0.18; // Assuming 18% GST
//     const total = subtotal + gst + Number(selectedOrder.deliveryCharges || 0) + Number(selectedOrder.codCharges || 0) - Number(selectedOrder.discount || 0);

//     return { subtotal, gst, total };
//   };

//   const handleAddClick = () => {
//     setShowSearch(true);
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     try {
//       const { data } = await axios.get(`/api/v1/product/search/${values.keyword}`);
//       setValues({ ...values, results: data });
//     } catch (error) {
//       console.log(error);
//       message.error("Error searching products");
//     }
//   };

//   const handleAddToCart = (product) => {
//     setSelectedOrder((prevOrder) => ({
//       ...prevOrder,
//       products: [...prevOrder.products, { ...product, quantity: 1 }],
//     }));
//     setValues({ ...values, keyword: '', results: [] });
//     setShowSearch(false);
//   };

//   return (
//     <Layout title={"All Orders Data"}>
//       <div className="row dashboard">
//         <div className="col-md-3">
//           <AdminMenu />
//         </div>
//         <div className="col-md-9">
//           <h1 className="text-center">All Orders</h1>
//           <Nav variant="pills" className="mb-3">
//             <Nav.Item>
//               <Nav.Link active={orderType === 'all-orders'} onClick={() => setOrderType('all-orders')}>All orders</Nav.Link>
//             </Nav.Item>
//             {status.map((s, index) => (
//               <Nav.Item key={index}>
//                 <Nav.Link active={orderType === s} onClick={() => setOrderType(s)}>{s} orders</Nav.Link>
//               </Nav.Item>
//             ))}
//           </Nav>
          
//           {loading ? (
//             <Spinner animation="border" role="status">
//               <span className="sr-only">Loading...</span>
//             </Spinner>
//           ) : error ? (
//             <Alert variant="danger">{error}</Alert>
//           ) : orders.length === 0 ? (
//             <Alert variant="info">No orders found.</Alert>
//           ) : (
//             <Table responsive>
//               <thead>
//                 <tr>
//                 <th>Sr.No</th>
//                         <th>Buyer Name</th>
//                         <th>Order id</th>
//                         <th>Order date</th>
//                         <th>Order Amount</th>
//                         <th>PYMT</th>
//                         <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((o, i) => (
//                   <tr key={o._id}>
//                     <td>{i + 1}</td>
//                     <td>
//                       {/* <Form.Select
//                         size="sm"
//                         onChange={(e) => handleStatusChange(o._id, e.target.value)}
//                         value={o?.status}
//                       >
//                         {status.map((s, i) => (
//                           <option key={i} value={s}>
//                             {s}
//                           </option>
//                         ))}
//                       </Form.Select> */}
//                         <td>{o?.buyer?.name}</td>
//                         <tr>{o?.buyer?._id}</tr>
//                     </td>
//                     <td>{o?.buyer?._id}</td>
//                     <td>{moment(o?.createdAt).fromNow()}</td>
//                     <td>{o?.payment?.success ? "Success" : "Failed"}</td>
//                     <td>{o?.products?.length}</td>
//                     <td>
//                       <Button variant="primary" size="sm" onClick={() => handleShow(o)}>
//                         Edit
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           )}
//         </div>
//       </div>

//       <Modal show={show} onHide={handleClose} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Order</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedOrder && (
//             <div>
//               <h2>Order ID: {selectedOrder._id}</h2>
//               <p>Buyer: {selectedOrder.buyer?.name}</p>
//               <p>Email: {selectedOrder.buyer?.email}</p>
//               <p>Created At: {moment(selectedOrder.createdAt).format("LLLL")}</p>

//               <Table responsive striped bordered hover>
//                 <thead>
//                   <tr>
//                     <th>Sold by</th>
//                     <th>Ship To</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>
//                       Smitox B2B<br />
//                       Sector 37, 1st floor, Manish Market, Mumbai-400003, 560034<br />
//                       Telephone: 7021632115<br />
//                       PAN No: BBVPJ8642Q<br />
//                       GST: 27AGEPJ1490K1Z9
//                     </td>
//                     <td>
//                       Name: Prince Mobile<br />
//                       Prince Mobile, 64A Work Shop Road, Maninagaram Raju Thaver Mahall,<br />
//                       Madurai 625001, Tamil Nadu, 625001<br />
//                       Contact: 9894775787<br />
//                       Order ID: SB7957232567<br />
//                       Payment Method: Cash on Delivery
//                     </td>
//                   </tr>
//                 </tbody>
//               </Table>

//               <Form.Group className="mb-3">
//                 <Form.Label>Payment Status</Form.Label>
//                 <Form.Select
//                   value={selectedOrder.payment.success ? "Success" : "Failed"}
//                   onChange={(e) =>
//                     handleInputChange("payment", {
//                       ...selectedOrder.payment,
//                       success: e.target.value === "Success",
//                     })
//                   }
//                 >
//                   <option value="Success">Success</option>
//                   <option value="Failed">Failed</option>
//                 </Form.Select>
//               </Form.Group>

//               <Form.Group className="mb-3">
//                 <Form.Label>Order Status</Form.Label>
//                 <Form.Select
//                   value={selectedOrder.status}
//                   onChange={(e) => handleInputChange("status", e.target.value)}
//                 >
//                   {status.map((s, i) => (
//                     <option key={i} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </Form.Select>
//               </Form.Group>

//               <h3>Order Details:</h3>
//               <Table responsive striped bordered hover>
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>Quantity</th>
//                     <th>Unit Price</th>
//                     <th>Net Amount</th>
//                     <th>Tax Amount</th>
//                     <th>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedOrder.products?.map((product, index) => {
//                     const netAmount = Number(product.price) * Number(product.quantity);
//                     const taxAmount = netAmount * 0.18; // Assuming 18% tax
//                     const total = netAmount + taxAmount;
//                     return (
//                       <tr key={index}>
//                         <td>{product.name}</td>
//                         <td>
//                           <Form.Control
//                             type="number"
//                             value={product.quantity}
//                             onChange={(e) =>
//                               handleProductChange(index, "quantity", e.target.value)
//                             }
//                           />
//                         </td>
//                         <td>
//                           <Form.Control
//                             type="number"
//                             value={product.price}
//                             onChange={(e) =>
//                               handleProductChange(index, "price", e.target.value)
//                             }
//                           />
//                         </td>
//                         <td>${netAmount.toFixed(2)}</td>
//                         <td>${taxAmount.toFixed(2)}</td>
//                         <td>${total.toFixed(2)}</td>
//                       </tr>
//                     );
//                   })}
//                   {showSearch && (
//                     <tr>
//                       <td colSpan="6">
//                         <form onSubmit={handleSearch}>
//                           <input
//                             type="text"
//                             placeholder="Search products"
//                             value={values.keyword}
//                             onChange={(e) => setValues({ ...values, keyword: e.target.value })}
//                           />
//                           <button type="submit">Search</button>
//                         </form>
//                         {values.results.map((product) => (
//                           <div key={product._id}>
//                             <img src={`/api/v1/product/product-photo/${product._id}`} alt={product.name} width="50" />
//                             <span>{product.name}</span>
//                             <Button onClick={() => handleAddToCart(product)}>Add</Button>
//                           </div>
//                         ))}
//                       </td>
//                     </tr>
//                   )}
//                   <tr>
//                     <td colSpan="6">
//                       <Button onClick={handleAddClick}>Add Product</Button>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td colSpan="4"></td>
//                     <td>Subtotal:</td>
//                     <td>${calculateTotals().subtotal.toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td colSpan="4"></td>
//                     <td>GST:</td>
//                     <td>${calculateTotals().gst.toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td colSpan="4"></td>
//                     <td>
//                       <Form.Label>Discount:</Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={selectedOrder.discount || 0}
//                         onChange={(e) => handleInputChange("discount", e.target.value)}
//                       />
//                     </td>
//                     <td>${Number(selectedOrder.discount || 0).toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td colSpan="4"></td>
//                     <td>
//                       <Form.Label>Delivery Charges:</Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={selectedOrder.deliveryCharges || 0}
//                         onChange={(e) => handleInputChange("deliveryCharges", e.target.value)}
//                       />
//                     </td>
//                     <td>${Number(selectedOrder.deliveryCharges || 0).toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td colSpan="4"></td>
//                     <td>
//                       <Form.Label>COD Charges:</Form.Label>
//                       <Form.Control
//                         type="number"
//                         value={selectedOrder.codCharges || 0}
//                         onChange={(e) => handleInputChange("codCharges", e.target.value)}
//                       />
//                     </td>
//                     <td>${Number(selectedOrder.codCharges || 0).toFixed(2)}</td>
//                   </tr>
//                   <tr>
//                     <td colSpan="4"></td>
//                     <td><strong>Total:</strong></td>
//                     <td><strong>${calculateTotals().total.toFixed(2)}</strong></td>
//                   </tr>
//                   <tr>
//                     <td colSpan="4"></td>
//                     <td>Amount Paid:</td>
//                     <td>${Number(selectedOrder.amountPaid || 0).toFixed(2)}</td>
//                   </tr>
//                   <tr>
                    
//                     <td colSpan="4"></td>
//                     <td>Amount Pending:</td>
//                     <td>${(calculateTotals().total - Number(selectedOrder.amountPaid || 0)).toFixed(2)}</td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="primary" onClick={() => {
//             // Add to cart logic here
//             message.success("Order added to cart");
//           }}>
//             Add to Cart
//           </Button>
//           <Button variant="secondary" onClick={handleClose}>
//             Close
//           </Button>
//           <Button variant="primary" onClick={handleSave}>
//             Save Changes
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Layout>
//   );
// };

// export default AdminOrders;



import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Nav, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import { message } from 'antd';
import AdminMenu from "../../components/Layout/AdminMenu";
import Layout from "../../components/Layout/Layout";
import { useAuth } from "../../context/auth";
import { useSearch } from "../../context/search";

const AdminOrders = () => {
  const [status] = useState([
    "Not Process", "Processing", "Shipped", "Delivered", "Cancelled"
  ]);
  const [orders, setOrders] = useState([]);
  const [auth] = useAuth();
  const [show, setShow] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderType, setOrderType] = useState('all-orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [values, setValues] = useSearch();

  const getOrders = async (type = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/api/v1/auth/all-orders`, {
        params: { status: type }
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setError("Error fetching orders. Please try again.");
      message.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders(orderType);
  }, [auth?.token, orderType]);

  const handleStatusChange = async (orderId, value) => {
    try {
      await axios.put(`/api/v1/auth/orders/${orderId}`, {
        orderStatus: value,
      });
      getOrders(orderType);
      message.success("Order status updated successfully");
    } catch (error) {
      console.log(error);
      message.error("Error updating order status");
    }
  };

  const handleShow = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/v1/auth/orders/${orderId}`);
      setSelectedOrder(data);
      setShow(true);
    } catch (error) {
      console.log(error);
      message.error("Error fetching order details");
    }
  };

  const handleClose = () => {
    setShow(false);
    setShowSearch(false);
    setValues({ ...values, keyword: '', results: [] });
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/v1/authorders/${selectedOrder.id}`, selectedOrder);
      setShow(false);
      getOrders(orderType);
      message.success("Order updated successfully");
    } catch (error) {
      console.log(error);
      message.error("Error updating order");
    }
  };



  const handleInputChange = (field, value) => {
    setSelectedOrder((prevOrder) => ({
      ...prevOrder,
      [field]: field === 'status' || field === 'payment' ? value : Number(value),
    }));
  };

  const handleProductChange = (index, field, value) => {
    setSelectedOrder((prevOrder) => {
      const updatedProducts = [...prevOrder.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: Number(value),
      };
      return { ...prevOrder, products: updatedProducts };
    });
  };

  const calculateTotals = () => {
    if (!selectedOrder || !selectedOrder.products) return { subtotal: 0, gst: 0, total: 0 };

    const subtotal = selectedOrder.products.reduce(
      (acc, product) => acc + Number(product.price) * Number(product.quantity),
      0
    );
    const gst = subtotal * 0.18; // Assuming 18% GST
    const total = subtotal + gst + Number(selectedOrder.deliveryCharges || 0) + Number(selectedOrder.codCharges || 0) - Number(selectedOrder.discount || 0);

    return { subtotal, gst, total };
  };

  const handleAddClick = () => {
    setShowSearch(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(`/api/v1/product/search/${values.keyword}`);
      setValues({ ...values, results: data });
    } catch (error) {
      console.log(error);
      message.error("Error searching products");
    }
  };

  const handleAddToCart = (product) => {
    setSelectedOrder((prevOrder) => ({
      ...prevOrder,
      products: [...prevOrder.products, { ...product, quantity: 1 }],
    }));
    setValues({ ...values, keyword: '', results: [] });
    setShowSearch(false);
  };
  

  // ... (keep other handler functions as they are)

  return (
    <Layout title={"All Orders Data"}>
      <div className="row dashboard">
        <div className="col-md-3">
          <AdminMenu />
        </div>
        <div className="col-md-9">
          <h1 className="text-center">All Orders</h1>
          <Nav variant="pills" className="mb-3">
            <Nav.Item>
              <Nav.Link active={orderType === 'all-orders'} onClick={() => setOrderType('all-orders')}>All orders</Nav.Link>
            </Nav.Item>
            {status.map((s, index) => (
              <Nav.Item key={index}>
                <Nav.Link active={orderType === s} onClick={() => setOrderType(s)}>{s} orders</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          
          {loading ? (
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : orders.length === 0 ? (
            <Alert variant="info">No orders found.</Alert>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Buyer Name</th>
                  <th>Order id</th>
                  <th>Order date</th>
                  <th>Order Amount</th>
                  <th>PYMT</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.id}>
                    <td>{i + 1}</td>
                    <td>{o.buyer.name}</td>
                    <td>{o.buyer._id}</td>
                    <td>{moment(o.date).fromNow()}</td>
                    <td>${o.payment.paymentMethod}</td>
                    <td>{o.payment.paymentMethod}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        value={o.orderStatus}
                      >
                        {status.map((s, i) => (
                          <option key={i} value={s}>
                            {s}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Button variant="primary" size="sm" onClick={() => handleShow(o._id)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
       <h2>Order ID: {selectedOrder._id || 'N/A'}</h2>
      <p>Buyer: {selectedOrder.buyer?.name || 'N/A'}</p>
      <p>Email: {selectedOrder.buyer?.email || 'N/A'}</p>
      <p>Phone: {selectedOrder.buyer?.phone || 'N/A'}</p>
      <p>Created At: {moment(selectedOrder.date).format("LLLL")}</p>
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Sold by</th>
                    <th>Ship To</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {selectedOrder.soldBy.name}<br />
                      {selectedOrder.soldBy.address}<br />
                      Telephone: {selectedOrder.soldBy.telephone}<br />
                      PAN No: {selectedOrder.soldBy.panNumber}<br />
                      GST: {selectedOrder.soldBy.gstNumber}
                    </td>
                    <td>
                      Name: {selectedOrder.shipTo.name}<br />
                      {selectedOrder.shipTo.address}<br />
                      Contact: {selectedOrder.shipTo.contact}<br />
                      Order ID: {selectedOrder.orderId}<br />
                      Payment Method: {selectedOrder.payment.method}
                    </td>
                  </tr>
                </tbody>
              </Table>

              <Form.Group className="mb-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  value={selectedOrder.payment.status}
                  onChange={(e) =>
                    handleInputChange("payment", {
                      ...selectedOrder.payment,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Order Status</Form.Label>
                <Form.Select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleInputChange("orderStatus", e.target.value)}
                >
                  {status.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <h3>Order Details:</h3>
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Net Amount</th>
                    <th>Tax Amount</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.productDetails.map((product, index) => (
                    <tr key={index}>
                      <td>{product.productName}</td>
                      <td>{product.quantity}</td>
                      <td>${product.unitPrice.toFixed(2)}</td>
                      <td>${product.netAmount.toFixed(2)}</td>
                      <td>${product.taxAmount.toFixed(2)}</td>
                      <td>${product.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* <tr>
                    <td colSpan="4"></td>
                    <td>Subtotal:</td>
                    <td>${selectedOrder.amountPaid.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4"></td>
                    <td>Discount:</td>
                    <td>${selectedOrder.discount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4"></td>
                    <td>Delivery Charges:</td>
                    <td>${selectedOrder.deliveryCharges.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4"></td>
                    <td>COD Charges:</td>
                    <td>${selectedOrder.codCharges.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4"></td>
                    <td><strong>Total:</strong></td>
                    <td><strong>${selectedOrder.total.toFixed(2)}</strong></td>
                  </tr>
                  <tr>
                    <td colSpan="4"></td>
                    <td>Amount Paid:</td>
                    <td>${selectedOrder.amountPaid.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4"></td>
                    <td>Amount Pending:</td>
                    <td>${selectedOrder.amountPending.toFixed(2)}</td>
                  </tr> */}
                </tbody>
              </Table>
              <p>AWB Number: {selectedOrder.awbNumber}</p>
              <p>Shipment ID: {selectedOrder.shipmentId}</p>
              <p>Shipment Name: {selectedOrder.shipmentName}</p>
              <p>Razorpay ID: {selectedOrder.razorpayId}</p>
              <p>Order Note: {selectedOrder.orderNote}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default AdminOrders;