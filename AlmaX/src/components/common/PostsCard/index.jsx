import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { BsPencil, BsTrash } from "react-icons/bs";
import {
	getCurrentUser,
	getAllUsers,
	deletePost,
	getConnections,
} from "../../../api/FirestoreAPI";
import LikeButton from "../LikeButton";
import "./index.scss";

export default function PostsCard({ posts, id, getEditData, currentUser }) {
	let navigate = useNavigate();
	const [allUsers, setAllUsers] = useState([]);
	const [imageModal, setImageModal] = useState(false);
	const [isConnected, setIsConnected] = useState(false);

	const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

	useMemo(() => {
		getAllUsers(setAllUsers);
	}, []);

	// useEffect(() => {
	// 	getConnections(currentUser.id, posts.userID, setIsConnected);
  // }, [currentUser.id, posts.userID]);
  
  useEffect(() => {
		if (currentUser?.id && posts?.userID) {
			getConnections(currentUser.id, posts.userID, setIsConnected);
		}
	}, [currentUser?.id, posts?.userID]);

	if (!posts || !currentUser) return null;

	return isConnected || currentUser.id === posts.userID ? (
		<div className="posts-card" key={id}>
			<div className="post-image-wrapper">
				{/* Show Edit/Delete only if admin and post owner */}
				{currentUser.email === adminEmail &&
					currentUser.id === posts.userID && (
						<div className="action-container">
							<BsPencil
								size={20}
								className="action-icon"
								onClick={() => getEditData(posts)}
							/>
							<BsTrash
								size={20}
								className="action-icon"
								onClick={() => deletePost(posts.id)}
							/>
						</div>
					)}

				<img
					alt="profile-image"
					className="profile-image"
					src={
						allUsers
							.filter((item) => item.id === posts.userID)
							.map((item) => item.imageLink)[0]
					}
				/>
				<div>
					<p
						className="name"
						onClick={() =>
							navigate("/profile", {
								state: { id: posts?.userID, email: posts.userEmail },
							})
						}>
						{allUsers.filter((user) => user.id === posts.userID)[0]?.name}
					</p>
					<p className="headline">
						{allUsers.filter((user) => user.id === posts.userID)[0]?.headline}
					</p>
					<p className="timestamp">{posts.timeStamp}</p>
				</div>
			</div>

			{posts.postImage && (
				<img
					onClick={() => setImageModal(true)}
					src={posts.postImage}
					className="post-image"
					alt="post-image"
				/>
			)}

			<p
				className="status"
				dangerouslySetInnerHTML={{ __html: posts.status }}></p>

			<LikeButton
				userId={currentUser?.id}
				postId={posts.id}
				currentUser={currentUser}
			/>

			<Modal
				centered
				open={imageModal}
				onOk={() => setImageModal(false)}
				onCancel={() => setImageModal(false)}
				footer={[]}>
				<img
					onClick={() => setImageModal(true)}
					src={posts.postImage}
					className="post-image modal"
					alt="post-image"
				/>
			</Modal>
		</div>
	) : null;
}
