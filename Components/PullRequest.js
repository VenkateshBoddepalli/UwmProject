import React, { useState, useEffect } from "react";
import axios from "axios";
import{jsPDF} from "jspdf";
import "jspdf-autotable";

const PullRequest = () => {
  const [data ,setData] = useState([]);

  useEffect(() => {
    axios.get('https://dummyjson.com/products')
      .then((response) => {
        setData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);


  const exportPdf = async () => {
    const doc = new jsPDF({orientation:"landscape"})

    doc.autoTable({
      html:"#my-table"
    });

    doc.autoTable({
      html:"#my-table1"
    }); 

    doc.autoTable({
      html:"#my-table2"
    });
    doc.save("data.pdf");
  };

  return (
    <div style={{ padding: "30px" }}>
      
      <h3>Personal Details Data:</h3>
      <table className="table table-bordered" id="my-table">
        <thead>
          <tr>
            <th scope="col" style={{ backgroundColor: "yellow" }}>Id</th>
            <th scope="col" style={{ backgroundColor: "yellow" }}>Title</th>
            <th scope="col" style={{ backgroundColor: "yellow" }}>Brand</th>
            <th scope="col" style={{ backgroundColor: "yellow" }}>Category</th>
            <th scope="col" style={{ backgroundColor: "yellow" }}>Price</th>
            <th scope="col" style={{ backgroundColor: "yellow" }}>Rating</th>
           
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data.products) &&
            data.products.map((row) => (
              <tr>
                <td>{row?.id}</td>
                <td>{row?.title}</td>
                <td>{row?.brand}</td>
                <td>{row?.category}</td>
                <td>${row?.price}</td>
                <td>{row?.rating}/5</td>
               
              </tr>
            ))}
        </tbody>
      </table>

      {/* ......................... */}
      <h3>Table 1</h3>
     <table className="table table-bordered" id="my-table1">
        <thead>
              <tr>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>S.No</th>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>Card</th>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>Card No</th>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>Card Limit</th>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>Annual Limit</th>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>DPD</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Gold International Debit Card</td>
                <td>5347 8746 5487 2587</td>
                <td>2500000</td>
                <td>5000000</td>
                <td>87/65/5024</td>
              </tr>
            </tbody>
          </table>

    {/* ........................ */}
      <h3>Table 2</h3>
          <table className="table table-bordered" id="my-table2">
            <thead>
              <tr>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>ID</th>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>Amount</th>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>Paid</th>
                <th scope="col" style={{ backgroundColor: "#6495ED" }}>Due Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>143-M-18</td>
                <td>25,0000</td>
                <td>20,000</td>
                <td>5,000</td>
              </tr>
            </tbody>
          </table>

          <button
        className="btn btn-primary float-end mt-2 mb-2"
        onClick={exportPdf}
      >
        Generate PDF
      </button>
    </div>
  );
};

export default PullRequest;