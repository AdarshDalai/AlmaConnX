import React, { useState } from "react";

import "../styles/HomeStudent.css";
import { students } from "../data";

export default function HomeStudent() {
  //This is for testing purpose
  //We will fetch student/alumni data from the database and act accordingly.
  const [userType, setUserType] = useState("alumni");
  return (
    <div className="container">
      <div className="flex-container">
        <div className="ownInfo">
          <div className="cover-pic">
            <img
              src="https://149369349.v2.pressablecdn.com/wp-content/uploads/2012/10/twitter-cover.jpg"
              alt=""
            />
          </div>
          <div className="dp">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCHU5JIkqfD2z1KMc4c1nW4zdArnxBM3cCcQ&s    "
              alt=""
            />
          </div>
          <div className="info">
            <p>
              <strong>NAME: Nirmal</strong>
            </p>
            <p>
              <strong>BRANCH: CSE</strong>
            </p>
            <p>
              <strong>INTEREST: Sleep</strong>
            </p>
          </div>
        </div>
        <div className="main-content">
          <div className="ai--part">
            <h2>
              {userType === "alumni"
                ? "AI Suggested Students"
                : "AI Suggested Alumni"}
            </h2>
            <textarea
              name="content"
              placeholder="Start Typing what you want"
              rows="5"
            />
          </div>
          <div className="Notice-board">This is the notice board...</div>
        </div>
        <div className="resume-part">asdfasdf</div>
      </div>
    </div>
  );
}
