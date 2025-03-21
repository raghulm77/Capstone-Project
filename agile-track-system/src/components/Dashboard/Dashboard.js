import React, { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ScrumDetails from "../Scrum Details/ScrumDetails";
import { UserContext } from "../../context/UserContext";

const Dashboard = () => {
  const [scrums, setScrums] = useState([]);
  const [selectedScrum, setSelectedScrum] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchScrums = async () => {
      try {
        const response = await axios.get("http://localhost:4000/scrums");
        setScrums(response.data);
      } catch (error) {
        console.error("Error fetching scrums:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:4000/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchScrums();
    fetchUsers();
  }, []);

  const formik = useFormik({
    initialValues: {
      scrumName: "",
      taskTitle: "",
      taskDescription: "",
      taskStatus: "To Do",
      taskAssignedTo: "",
    },
    validationSchema: Yup.object({
      scrumName: Yup.string().required("Scrum name is required"),
      taskTitle: Yup.string().required("Task title is required"),
      taskDescription: Yup.string().required("Task description is required"),
      taskStatus: Yup.string().required("Task status is required"),
      taskAssignedTo: Yup.string().required("Assignee is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const newScrumResponse = await axios.post(
          "http://localhost:4000/scrums",
          {
            name: values.scrumName,
          }
        );

        await axios.post("http://localhost:4000/tasks", {
          title: values.taskTitle,
          description: values.taskDescription,
          status: values.taskStatus,
          scrumId: newScrumResponse.data.id,
          assignedTo: values.taskAssignedTo,
          history: [
            {
              status: values.taskStatus,
              date: new Date().toISOString().split("T")[0],
            },
          ],
        });

        const updatedScrums = await axios.get("http://localhost:4000/scrums");
        setScrums(updatedScrums.data);
        setShowForm(false);
        resetForm();
      } catch (error) {
        console.error("Error adding scrum:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div>
      <h2>Scrum Teams</h2>
      {user?.role === "admin" && (
        <div>
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add New Scrum"}
          </button>
          {showForm && (
            <form onSubmit={formik.handleSubmit}>
              <label>
                Scrum Name:
                <input type="text" {...formik.getFieldProps("scrumName")} />
                {formik.touched.scrumName && formik.errors.scrumName && (
                  <div style={{ color: "red" }}>{formik.errors.scrumName}</div>
                )}
              </label>
              <label>
                Task Title:
                <input type="text" {...formik.getFieldProps("taskTitle")} />
                {formik.touched.taskTitle && formik.errors.taskTitle && (
                  <div style={{ color: "red" }}>{formik.errors.taskTitle}</div>
                )}
              </label>
              <label>
                Task Description:
                <input
                  type="text"
                  {...formik.getFieldProps("taskDescription")}
                />
                {formik.touched.taskDescription &&
                  formik.errors.taskDescription && (
                    <div style={{ color: "red" }}>
                      {formik.errors.taskDescription}
                    </div>
                  )}
              </label>
              <label>
                Task Status:
                <select {...formik.getFieldProps("taskStatus")}>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </label>
              <label>
                Assign To:
                <select {...formik.getFieldProps("taskAssignedTo")}>
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {formik.touched.taskAssignedTo &&
                  formik.errors.taskAssignedTo && (
                    <div style={{ color: "red" }}>
                      {formik.errors.taskAssignedTo}
                    </div>
                  )}
              </label>
              <button type="submit" disabled={formik.isSubmitting}>
                Create Scrum
              </button>
            </form>
          )}
        </div>
      )}
      <ul>
        {scrums.map((scrum) => (
          <li key={scrum.id}>
            {scrum.name}
            <button onClick={() => setSelectedScrum(scrum)}>Get Details</button>
          </li>
        ))}
      </ul>
      {selectedScrum && <ScrumDetails scrum={selectedScrum} />}
    </div>
  );
};

export default Dashboard;
