import React, { useState, useMemo } from "react";
import { getSingleStatus, getSingleUser } from "../../../api/FirestoreAPI";
import PostsCard from "../PostsCard";
import { HiOutlinePencil } from "react-icons/hi";
import { useLocation } from "react-router-dom";
import FileUploadModal from "../FileUploadModal";
import { uploadImage as uploadImageAPI } from "../../../api/ImageUpload";
import {
	FaBuilding,
	FaUniversity,
	FaUserTie,
	FaGraduationCap,
	FaCodeBranch,
	FaGlobe,
	FaEnvelope,
	FaPhone,
} from "react-icons/fa";

import "./index.scss";

export default function ProfileCard({ onEdit, currentUser }) {
	const location = useLocation();
	const [allStatuses, setAllStatus] = useState([]);
	const [currentProfile, setCurrentProfile] = useState({});
	const [currentImage, setCurrentImage] = useState({});
	const [progress, setProgress] = useState(0);
	const [modalOpen, setModalOpen] = useState(false);

	const getImage = (event) => {
		setCurrentImage(event.target.files[0]);
	};

	const uploadImage = () => {
		uploadImageAPI(
			currentImage,
			currentUser.id,
			setModalOpen,
			setProgress,
			setCurrentImage
		);
	};

	useMemo(() => {
		if (location?.state?.id) {
			getSingleStatus(setAllStatus, location?.state?.id);
		}
		if (location?.state?.email) {
			getSingleUser(setCurrentProfile, location?.state?.email);
		}
	}, []);

	const userData =
		Object.values(currentProfile).length === 0 ? currentUser : currentProfile;

	return (
		<>
			<FileUploadModal
				getImage={getImage}
				uploadImage={uploadImage}
				modalOpen={modalOpen}
				setModalOpen={setModalOpen}
				currentImage={currentImage}
				progress={progress}
			/>

			<div className="profile-card">
				{currentUser.id === location?.state?.id && (
					<div className="edit-btn">
						<HiOutlinePencil className="edit-icon" onClick={onEdit} />
					</div>
				)}

				<div className="profile-info">
					<div>
						<img
							className="profile-image"
							onClick={() => setModalOpen(true)}
							src={userData.imageLink}
							alt="profile"
						/>
						<h3 className="userName">{userData.name}</h3>
						<p className="heading">{userData.headline}</p>
						{(userData.city || userData.country) && (
							<p className="location">
								{userData.city}, {userData.country}
							</p>
						)}
						{userData.website && (
							<a
								className="website"
								href={userData.website}
								target="_blank"
								rel="noreferrer">
								<FaGlobe /> &nbsp; {userData.website}
							</a>
						)}
						{userData.email && (
							<p className="email">
								<FaEnvelope /> &nbsp; {userData.email}
							</p>
						)}
						{userData.mobile && (
							<p className="mobile">
								<FaPhone /> &nbsp; {userData.mobile}
							</p>
						)}
					</div>

					<div className="right-info">
						{userData.role && (
							<p className="role">
								<FaUserTie /> &nbsp; {userData.role}
							</p>
						)}
						{userData.batch && (
							<p className="batch">
								<FaGraduationCap /> &nbsp; Batch: {userData.batch}
							</p>
						)}
						{userData.branch && (
							<p className="branch">
								<FaCodeBranch /> &nbsp; Branch: {userData.branch}
							</p>
						)}
						{userData.college && (
							<p className="college">
								<FaUniversity /> &nbsp; {userData.college}
							</p>
						)}
						{userData.company && (
							<p className="company">
								<FaBuilding /> &nbsp; {userData.company}
							</p>
						)}
					</div>
				</div>

				{userData.aboutMe && <p className="about-me">{userData.aboutMe}</p>}

				{userData.skills && (
					<p className="skills">
						<span className="skill-label">Skills</span>:&nbsp;
						{userData.skills}
					</p>
				)}
			</div>

			<div className="post-status-main">
				{allStatuses?.map((posts) => (
					<div key={posts.id}>
						<PostsCard posts={posts} />
					</div>
				))}
			</div>
		</>
	);
}
