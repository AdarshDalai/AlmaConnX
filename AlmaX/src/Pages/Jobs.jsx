import React, { useEffect, useState } from "react";
import { getStatus } from "../api/FirestoreAPI";
import PostsCard from "../components/common/PostsCard";
import Topbar from "../components/common/Topbar";
import { getCurrentUser } from "../api/FirestoreAPI";

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

export default function Job() {
	const [allPosts, setAllPosts] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);

	useEffect(() => {
		getStatus((posts) => {
			const adminPosts = posts.filter((post) => post.userEmail === adminEmail);
			setAllPosts(adminPosts);
		});

		getCurrentUser(setCurrentUser);
	}, []);

	return (
		<div style={{ backgroundColor: "whitesmoke", minHeight: "100vh" }}>
			<Topbar currentUser={currentUser} />
			<h1 style={{ textAlign: "center", marginTop: "20px", fontSize: "24px" }}>
				Job Openings
			</h1>

			{allPosts.length === 0 ? (
				<p style={{ textAlign: "center", fontSize: "18px", marginTop: "40px" }}>
					😔 Sorry, but currently no jobs are available.
				</p>
			) : (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
						gap: "20px",
						padding: "20px",
						maxWidth: "1200px",
						margin: "auto",
					}}>
					{allPosts.map((post) => (
						<PostsCard
							key={post.id}
							posts={post}
							getEditData={() => {}}
							currentUser={currentUser}
						/>
					))}
				</div>
			)}
		</div>
	);
}
