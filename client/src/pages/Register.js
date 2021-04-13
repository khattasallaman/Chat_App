import React from "react";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";

const REGISTER_USER = gql`
  mutation register(
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      confirmPassword: $confirmPassword
    ) {
      username
      email
      createdAt
    }
  }
`;

export default function Register(props) {
  const [errors, setErrors] = useState({});
  const [variables, setVariables] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    update: (_, res) => {
      // console.log(res);
      props.history.push("/login")

    },
    onError: (err) => {
      // console.log(err.graphQLErrors[0].extensions.errors);
      setErrors(err.graphQLErrors[0].extensions.errors);
    },
  });

  const submitRegisterForm = (e) => {
    e.preventDefault();
    registerUser({ variables });
  };

  return (
    <Row className="justify-content-center bg-white ">
      <Col sm={8} md={6} lg={5} className="p-5 rounded">
        <h3 className="text-cnter">Register Page</h3>
        <Form onSubmit={submitRegisterForm}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label className={errors.email && "text-danger"}>
              {errors.email || "Email address"}
            </Form.Label>
            <Form.Control
              className={errors.email && "is-invalid"}
              type="email"
              placeholder="Enter email"
              value={variables.email}
              onChange={(e) =>
                setVariables({ ...variables, email: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="formBasicEmail">
            <Form.Label className={errors.username && "text-danger"}>
              {errors.username || "Username"}
            </Form.Label>
            <Form.Control
              className={errors.username && "is-invalid"}
              type="text"
              placeholder="Enter username"
              value={variables.username}
              onChange={(e) =>
                setVariables({ ...variables, username: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label className={errors.password && "text-danger"}>
              {errors.password || "Password"}
            </Form.Label>
            <Form.Control
              className={errors.password && "is-invalid"}
              type="password"
              placeholder="Enter Password"
              value={variables.password}
              onChange={(e) =>
                setVariables({ ...variables, password: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label className={errors.confirmPassword && "text-danger"}>
              {errors.confirmPassword || "Confirm Password"}
            </Form.Label>
            <Form.Control
              className={errors.confirmPassword && "is-invalid"}
              type="password"
              placeholder="Confirm Password"
              value={variables.confirmPassword}
              onChange={(e) =>
                setVariables({ ...variables, confirmPassword: e.target.value })
              }
            />
          </Form.Group>
          <div className="text-end">
            <Button
              variant="success"
              type="submit"
              className="text-center"
              disabled={loading}
            >
              {loading ? <span className="px-3"><Spinner animation="border" variant="light"  /></span> 
 : "Register"}
            </Button>
            <br/>
            <small>
              Already have an account? <Link to="/login">Login</Link>
            </small>
          </div>
        </Form>
      </Col>
    </Row>
  );
}
