import React, { useEffect, useState } from "react";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { getConnections } from "../../../api/FirestoreAPI";
import { useNavigate } from "react-router-dom";

export default function ConnectedUsers({ user, getCurrentUser, currentUser }) {
	const [isConnected, setIsConnected] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		getConnections(currentUser.id, user.id, setIsConnected);
	}, [currentUser.id, user.id]);

	const cardStyle = {
		backgroundColor: "#fff",
		borderRadius: "10px",
		boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
		padding: "15px",
		textAlign: "center",
		transition: "transform 0.2s ease-in-out",
	};

	const imgStyle = {
		width: "80px",
		height: "80px",
		objectFit: "cover",
		borderRadius: "50%",
		marginBottom: "10px",
	};

	const nameStyle = {
		fontWeight: "600",
		fontSize: "16px",
		marginBottom: "5px",
	};

	const headlineStyle = {
		fontSize: "14px",
		color: "#555",
		marginBottom: "8px",
	};

	const buttonStyle = {
		backgroundColor: isConnected ? "#ccc" : "#0073b1",
		color: "white",
		padding: "6px 12px",
		border: "none",
		borderRadius: "6px",
		cursor: isConnected ? "default" : "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "5px",
	};

	const viewProfileBtnStyle = {
		marginTop: "10px",
		backgroundColor: "#f0f0f0",
		color: "#333",
		padding: "6px 12px",
		border: "1px solid #ccc",
		borderRadius: "6px",
		cursor: "pointer",
		fontSize: "14px",
	};

	const buttonWrapperStyle = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: "5px",
	};

	const handleViewProfile = () => {
		navigate("/profile", {
			state: {
				id: user.id,
				email: user.email,
			},
		});
	};

	return (
		<div style={cardStyle}>
			<img src={user.imageLink} alt="profile" style={imgStyle} />
			<p style={nameStyle}>{user.name}</p>
			<p style={headlineStyle}>{user.role}</p>
			<p style={headlineStyle}>{user.branch}</p>
			<p style={headlineStyle}>Passout : {user.batch}</p>

			<div style={buttonWrapperStyle}>
				<button
					style={buttonStyle}
					onClick={() => {
						if (!isConnected) getCurrentUser(user.id);
					}}
					disabled={isConnected}>
					<AiOutlineUsergroupAdd size={20} />
					{isConnected ? "Connected" : "Connect"}
				</button>

				<button style={viewProfileBtnStyle} onClick={handleViewProfile}>
					View Profile
				</button>
			</div>
		</div>
	);
}
