import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Col, Image, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import classNames from "classnames";
import useWindowDimensions from "../../util/windowSize"
import { useMessageDispatch, useMessageState } from "../../context/message";

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      createdAt
      imageUrl
      latestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`;

export default function Users() {
  const dispatch = useMessageDispatch();
  const { users } = useMessageState();
  const selectedUser = users?.find((u) => u.selected === true)?.username;
  const { width } = useWindowDimensions();

  const { loading } = useQuery(GET_USERS, {
    onCompleted: (data) =>
      dispatch({ type: "SET_USERS", payload: data.getUsers }),
    onError: (err) => console.log(err),
  });

  let usersMarkup;
  if (!users || loading) {
    usersMarkup = (
      <div className="d-flex algin-items-center justify-content-center mt-1"><Spinner animation="border" variant="danger" className="m-3" /></div> 
    );
  } else if (users.length === 0) {
    usersMarkup = <p>No users have joined yet</p>;
  } else if (users.length > 0) {
    usersMarkup = users.map((user) => {
      const selected = selectedUser === user.username;
      return (
        <div
          role="button"
          className={classNames(
            "user-div d-flex justify-content-center justify-content-md-start p-3",
            {
              "bg-white": selected,
            }
          )}
          key={user.username}
          onClick={() =>
            dispatch({ type: "SET_SELECTED_USER", payload: user.username })
          }
        >
          {width < 768 ? <OverlayTrigger
            key={user.username}
            placement="right"
            overlay={
              <Tooltip>
                <strong>{user.username}</strong>.
              </Tooltip>
            }
          >
            <Image
              src={
                user.imageUrl ||
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
              }
              className="user-image"
            />
          </OverlayTrigger> :
            <Image
            src={
              user.imageUrl ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            className="user-image"
          /> 
          }
          
         
          <div className="d-none d-md-block ml-2">
            <p className="text-success">{user.username}</p>
            <p className="font-weight-light">
              {user.latestMessage
                ? user.latestMessage.content.substring(0, 16) ===
                    "http://localhost" ||
                  user.latestMessage.content.substring(0, 21) ===
                    "http://res.cloudinary"
                  ? "file"
                  : user.latestMessage.content
                : "You are now connected!"}
            </p>
          </div>
        </div>
      );
    });
  }
  return (
    <Col xs={2} md={4} className="p-0 bg-secondary users">
      {usersMarkup}
    </Col>
  );
}
