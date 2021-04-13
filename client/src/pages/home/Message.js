import React, { useState } from "react";
import classNames from "classnames";
import moment from "moment";
import {
  Button,
  OverlayTrigger,
  Popover,
  Tooltip,
  Image,
} from "react-bootstrap";
import { useAuthState } from "../../context/auth";
import { gql, useMutation } from "@apollo/client";

const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"];

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($uuid: String!, $content: String!) {
    reactToMessage(uuid: $uuid, content: $content) {
      uuid
    }
  }
`;

export default function Message({ message }) {
  const content = message.content;
  // const content_length = content.length;
  var Endingpattern = /\.[0-9a-z]+$/i;
  const isFile = content.substring(0, 16) === "http://localhost" || content.substring(0, 21) === "http://res.cloudinary";
  const ending = content.match(Endingpattern);
  // console.log("this is the ending ", ending)
  // const ending = content.substring(content_length - 3, content_length);
  const lastPart = ending && ending[0].substring(1, ending[0].length)
  // const fileToRead = lastPart == "pdf" || lastPart == "docx" || lastPart == "xlsx" || lastPart == "pptx";
  const isPdf = lastPart == "pdf";
  const isWord = lastPart == "docx";
  const isExcel = lastPart == "xlsx" || lastPart == "xls" ;
  const isPowerPoint = lastPart == "pptx" || lastPart == "ppt";
  
  const isVideo = lastPart == "mp4" || lastPart == "mkv";
  const { user } = useAuthState();
  const sent = message.from === user.username;
  const received = !sent;
  const [showPopover, setShowPopover] = useState(false);
  const reactionIcons = [...new Set(message.reactions.map((r) => r.content))];

  const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
    onError: (err) => console.log(err),
    onCompleted: (data) => setShowPopover(false),
  });

  const react = (reaction) => {
    reactToMessage({ variables: { uuid: message.uuid, content: reaction } });
  };

  const reactButton = (
    <OverlayTrigger
      trigger="click"
      placement="top"
      show={showPopover}
      onToggle={setShowPopover}
      transition={false}
      rootClose
      overlay={
        <Popover className="rounded-pill">
          <Popover.Content className="d-flex px-0 py-1 align-items-center react-button-popover">
            {reactions.map((reaction) => (
              <Button
                variant="link"
                className="react-icon-button"
                key={reaction}
                onClick={() => react(reaction)}
              >
                {reaction}
              </Button>
            ))}
          </Popover.Content>
        </Popover>
      }
    >
      <Button variant="link" className="px-2">
        <i className="far fa-smile"></i>
      </Button>
    </OverlayTrigger>
  );

  return (
    <div
      className={classNames("d-flex my-3", {
        "ml-auto": sent,
        "mr-auto": received,
      })}
    >
      {sent && reactButton}
      <OverlayTrigger
        placement={sent ? "left" : "right"}
        className="rounded-pill"
        overlay={
          <Tooltip className="rounded-pill">
            {moment(message.createdAt).format("MMM DD, h:mm a")}
          </Tooltip>
        }
        transition={false}
      >
        <div
          className={classNames("py-2 px-3 rounded-pill position-relative", {
            "bg-primary": !isFile && sent,
            "bg-secondary": !isFile && received,
          })}
        >
          { 
          message.reactions.length > 0 && (
            <div className="reactions-div bg-secondary  rounded-pill">
              {reactionIcons} {message.reactions.length}
            </div>
          )}
          {
            // console.log(content.substring(0, 16))
            isFile ? (
              isVideo ? (
                <a href={content}>
                  <video src={content} width="250px" height="150px" />
                </a>
              ) : (
                <a href={content} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={
                      isPdf
                        ? "https://elimunibora.com/wp-content/uploads/2020/08/1200x630wa.png" :
                        isWord ? "https://www.foodsovereignty.org/wp-content/uploads/2020/04/microsoft-word-logo-png-clip-art.png" :
                        isExcel ? "https://i.pinimg.com/originals/b4/da/85/b4da85067c1e2c0293a8f4d1526ab26d.png" :
                        isPowerPoint ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVeYsRgCuDL46bnZ2MsF1ErgXESMKLJty7bn_yfmKWrYioR7MNehFiTZaxNl5YmS6j3zU&usqp=CAU" :
                         content
                    }
                    alt="image"
                    className="uploaded-img"
                  />
                </a>
              )
            ) : (
              <p
                className={classNames({ "text-white": sent })}
                key={message.uuid}
              >
                {content}
              </p>
            )
          }
        </div>
      </OverlayTrigger>
      {received && reactButton}
    </div>
  );
}
