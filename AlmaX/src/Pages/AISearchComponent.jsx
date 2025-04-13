import React, { useEffect, useState } from "react";
import Topbar from "../components/common/Topbar";
import ProfileCard from "../components/common/ProfileCard";
import { getAllUsers, getCurrentUser } from "../api/FirestoreAPI";

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

export default function AISearchComponent() {
	const [searchTerm, setSearchTerm] = useState("");
	const [currentUser, setCurrentUser] = useState(null);
	const [allUsers, setAllUsers] = useState([]);
	const [recommendedUsers, setRecommendedUsers] = useState([]);

	useEffect(() => {
		getCurrentUser(setCurrentUser);
		getAllUsers(setAllUsers);
	}, []);

	const handleSearch = () => {
		if (!searchTerm || !currentUser) return;

		const filteredUsers = allUsers.filter(
			(user) => user.id !== currentUser.id && user.email !== adminEmail
		);

		// Dummy similarity logic (replace with real ML recommendations)
		const sortedUsers = [...filteredUsers].sort((a, b) => {
			const aMatch = a.role?.toLowerCase().includes(searchTerm.toLowerCase())
				? 1
				: 0;
			const bMatch = b.role?.toLowerCase().includes(searchTerm.toLowerCase())
				? 1
				: 0;
			return bMatch - aMatch;
		});

		setRecommendedUsers(sortedUsers.slice(0, 5));
	};

	return (
		<div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
			<Topbar currentUser={currentUser} />

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					marginTop: "80px",
					padding: "20px",
				}}>
				<h1
					style={{
						fontSize: "28px",
						fontWeight: "bold",
						marginBottom: "20px",
						color: "#333",
					}}>
					🔍 AI-Based Alumni Search
				</h1>

				<div
					style={{
						display: "flex",
						gap: "10px",
						width: "100%",
						maxWidth: "600px",
						marginBottom: "30px",
					}}>
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Looking for a role or skill like 'Full Stack Developer'..."
						style={{
							flex: 1,
							padding: "12px 16px",
							borderRadius: "8px",
							border: "1px solid #ccc",
							fontSize: "16px",
							outline: "none",
							boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
						}}
					/>
					<button
						onClick={handleSearch}
						style={{
							backgroundColor: "#0073b1",
							color: "white",
							border: "none",
							padding: "12px 20px",
							borderRadius: "8px",
							fontWeight: "bold",
							cursor: "pointer",
							boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
						}}>
						Search
					</button>
				</div>

				{recommendedUsers.length > 0 && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
							gap: "20px",
							width: "100%",
							maxWidth: "1100px",
						}}>
						{recommendedUsers.map((user) => (
							<ProfileCard key={user.id} user={user} />
						))}
					</div>
				)}

				{recommendedUsers.length === 0 && searchTerm && (
					<p style={{ fontSize: "18px", color: "#666", marginTop: "20px" }}>
						No similar alumni profiles found for "{searchTerm}" 😔
					</p>
				)}
			</div>
		</div>
	);
}


// 🔧 Extra Note:
// Ye code filhal role ke basis pe dummy filtering kar raha hai.

// Tu ML model se getRecommendations(searchTerm, currentUser, allUsers) function bana ke uska result setRecommendedUsers() mein daal dena — bas ho gaya AI integration.

