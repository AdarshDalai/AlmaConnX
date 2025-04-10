import React, { useEffect, useState } from "react";
import { getAllUsers, addConnection } from "../api/FirestoreAPI";
import ConnectedUsers from "./common/ConnectedUsers";

export default function ConnectionsComponent({ currentUser }) {
	const [users, setUsers] = useState([]);

	const getCurrentUser = (id) => {
		addConnection(currentUser.id, id);
	};

	useEffect(() => {
		getAllUsers(setUsers);
	}, []);

	const containerStyle = {
		display: "grid",
		gridTemplateColumns: "repeat(4, 1fr)",
		gap: "20px",
		padding: "20px",
	};

	if (!currentUser || !currentUser.id || users.length === 0) {
		return <div style={{ padding: "20px", fontSize: "18px" }}>Loading...</div>;
	}

	const filteredUsers = users.filter((user) => user.id !== currentUser.id);

	return filteredUsers.length > 0 ? (
		<div style={containerStyle}>
			{filteredUsers.map((user) => (
				<ConnectedUsers
					key={user.id}
					currentUser={currentUser}
					user={user}
					getCurrentUser={getCurrentUser}
				/>
			))}
		</div>
	) : (
		<div style={{ padding: "20px", fontSize: "18px" }}>
			No Connections to Add!
		</div>
	);
}
