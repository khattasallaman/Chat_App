import React, { Fragment, useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { Alert, Col, Form, Spinner } from "react-bootstrap";
import { useMessageDispatch, useMessageState } from "../../context/message";
import Dropzone from "react-dropzone";
import classNames from "classnames";
import Message from "./Message";

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      createdAt
      reactions {
        uuid
        content
      }
    }
  }
`;

export default function Messages() {
  const { users } = useMessageState();
  const dispatch = useMessageDispatch();
  const [content, setContent] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedUser = users?.find((u) => u.selected === true);
  const messages = selectedUser?.messages;

  const [
    getMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_MESSAGES);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (err) => console.log(err),
  });

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: "SET_USER_MESSAGES",
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      });
    }
  }, [messagesData]);

  const submitMessage = (e) => {
    e.preventDefault();

    if (content.trim() === "" || !selectedUser) return;

    setContent("");

    // mutation for sending the message
    sendMessage({ variables: { to: selectedUser.username, content } });
  };

  const uploadFile = (files) => {
    console.log({ e: files[0] });
    var Endingpattern = /\.[0-9a-z]+$/i;
    const ending = files[0].name.match(Endingpattern);
    console.log("this is the ending[0] ", ending[0]);

    if (
      ending[0] !== ".png" &&
      ending[0] !== ".jpg" &&
      ending[0] !== ".jpeg" &&
      ending[0] !== ".gif" &&
      ending[0] !== ".tiff" &&
      ending[0] !== ".psd" &&
      ending[0] !== ".eps" &&
      ending[0] !== ".indd" &&
      ending[0] !== ".raw"
    ) {
      setShow(true);
      return;
    }
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("upload_preset", "chat__app");
    formData.append("cloud_name", "khatta");
    setIsLoading(true);
    fetch("https://api.cloudinary.com/v1_1/khatta/image/upload", {
      method: "post",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        const url = data.url;
        if (url) {
          sendMessage({
            variables: { to: selectedUser.username, content: url },
          });
          setIsLoading(false);
        }
        // console.log(data.url);
      })
      .catch((err) => console.log({ err }));

    // fetch("http://localhost:5000/uploadFile", {
    //   method: "POST",
    //   body: formData,
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     const url = data.url;
    //     // console.log("this is the response ", url)
    //     if (url) {
    //       sendMessage({
    //         variables: { to: selectedUser.username, content: url },
    //       });
    //     }
    //   });
  };

  let selectedChatMarkup;
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p className="info-text">Select a friend</p>;
  } else if (messagesLoading) {
    selectedChatMarkup = <div className="d-flex algin-items-center justify-content-center"><Spinner animation="grow" variant="danger" /></div> ;
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ));
  } else if (messages.length === 0) {
    selectedChatMarkup = (
      <p className="info-text">
        You are now connected! send your first message!
      </p>
    );
  }

  return (
    <Col xs={10} md={8} className="p-0">
      <div className="messages-box d-flex flex-column-reverse p-3">
        {show && (
          <Alert
            variant="danger"
            className={classNames("mt-3",{
              "d-none": !show,
            })}
            onClose={() => setShow(false)}
            dismissible
          >
            <Alert.Heading>Wrong file formate</Alert.Heading>
            <p>This file formate is not supported</p>
          </Alert>
        )}
        {selectedChatMarkup}
      </div>
      <div
        className={classNames("text-right isLoading", {
          "m-5": isLoading,
          "d-none": !isLoading,
        })}
      >
        {isLoading && <Spinner animation="border" variant="danger" />}
      </div>
      <div className="px-3 py-2">
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center m-0">
            <Form.Control
              type="text"
              className="message-input rounded-pill p-4 bg-secondary border-0"
              placeholder="Type a message.."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <i
              className="fas fa-paper-plane fa-2x text-primary ml-2"
              onClick={submitMessage}
              role="button"
            ></i>
            {selectedUser && (
              <Dropzone onDrop={uploadFile}>
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <i
                        className="fas fa-cloud-upload-alt fa-2x text-primary ml-2"
                        onClick={submitMessage}
                        role="button"
                      ></i>
                    </div>
                  </section>
                )}
              </Dropzone>
            )}
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
}
