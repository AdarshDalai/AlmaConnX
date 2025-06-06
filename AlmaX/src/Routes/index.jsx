import { createBrowserRouter } from "react-router-dom";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import HomeLayout from "../layouts/HomeLayout";
import ProfileLayout from "../layouts/ProfileLayout";
import ConnectionLayout from "../layouts/ConnectionLayout";
import Jobs from "../Pages/Jobs";
import AISearchComponent from "../Pages/AISearchComponent";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Login />,
	},
	{
		path: "/register",
		element: <Register />,
	},
	{
		path: "/home",
		element: <HomeLayout />,
	},
	{
		path: "/profile",
		element: <ProfileLayout />,
	},
	{
		path: "/connections",
		element: <ConnectionLayout />,
	},
	{
		path: "/jobs",
		element: <Jobs />,
	},
	{
		path: "/aisearch",
		element: <AISearchComponent />,
	},
]);
